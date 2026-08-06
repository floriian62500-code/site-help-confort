// HELP Confort — submit-lead v5 (2026-08-02)
// ─────────────────────────────────────────────────────────────────────────
// CHANGEMENT v4 → v5 : validation ASSOUPLIE pour arrêter la perte silencieuse
// de leads. Le "lockdown v4" (2026-06-12) exigeait adresse+cp+ville+message≥20,
// or ~55 formulaires du site (pages métiers, prestations, wizard, devis-express)
// ne collectent PAS ces champs → tous leurs leads partaient en 400 silencieux.
//
// NOUVEAU CONTRAT (minimum viable pour rappeler un prospect) :
//   OBLIGATOIRE : nom (ou prénom) + AU MOINS un contact (téléphone OU email) + message
//   OPTIONNEL   : prénom, adresse, code_postal, ville, budget, métier
// Les formats téléphone/email restent validés SI fournis. Honeypot + rate-limit conservés.
// ─────────────────────────────────────────────────────────────────────────
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const rateMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt < now) { rateMap.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= max) return false;
  entry.count++; return true;
}
function sanitize(v: unknown, max = 500): string | null {
  if (v == null) return null;
  const s = String(v).trim().slice(0, max);
  return s || null;
}
function normalizePhone(p: string): string {
  return p.replace(/[\s\-\.\(\)]/g, '');
}
function isValidFrenchPhone(p: string): boolean {
  const n = normalizePhone(p);
  return /^(\+33|0033)[1-9][0-9]{8}$/.test(n) || /^0[1-9][0-9]{8}$/.test(n);
}
function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}
function isValidCP(cp: string): boolean {
  return /^[0-9]{5}$/.test(cp.trim());
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(ip)) return json(429, { error: 'Trop de requêtes, réessayez dans 1 min' });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: 'JSON invalide' }); }

  // Honeypot anti-bot
  if (body.website || body.url_site) {
    console.warn('[submit-lead] honeypot triggered ip=' + ip);
    return json(200, { success: true, silent: true });
  }

  // Champs (tous optionnels sauf règles ci-dessous)
  const prenom = sanitize(body.prenom, 200);
  const nom = sanitize(body.nom, 200);
  const tel = sanitize(body.telephone || body.tel, 50);
  const email = sanitize(body.email, 200);
  const adresse = sanitize(body.adresse, 300);
  const cp = sanitize(body.code_postal || body.cp, 20);
  const ville = sanitize(body.ville, 100);
  const message = sanitize(body.message, 4000);

  const errors: Record<string, string> = {};

  // Services / métier calculés tôt (nécessaires à la validation par contrat)
  let services: string[] = [];
  if (Array.isArray(body.services)) services = body.services.filter((s: any) => typeof s === 'string').slice(0, 3);
  else if (Array.isArray(body['services[]'])) services = body['services[]'].filter((s: any) => typeof s === 'string').slice(0, 3);
  const metier = sanitize(body.metier, 200) || (services.length ? services.join(', ') : null);

  // ─── VALIDATION CONDITIONNELLE PAR TYPE DE FORMULAIRE (form_type) ───────────
  // Chaque parcours déclare son type ; le serveur applique le contrat correspondant
  // et REFUSE tout payload non conforme. On ne relâche pas globalement la qualité.
  const formType = (sanitize(body.form_type, 40) || '').toLowerCase();
  type Contract = { name: boolean; contact: boolean; cp: boolean; ville: boolean; adresse: boolean; message: boolean; metier: boolean };
  const CONTRACTS: Record<string, Contract> = {
    contact_complet: { name: true, contact: true, cp: true,  ville: true,  adresse: true,  message: true,  metier: false }, // contact.html
    demande_metier:  { name: true, contact: true, cp: true,  ville: true,  adresse: false, message: true,  metier: false }, // pages métiers/prestations (sans adresse)
    wizard_urgence:  { name: true, contact: true, cp: true,  ville: true,  adresse: false, message: true,  metier: true  }, // wizard in-page
    devis_express:   { name: true, contact: true, cp: true,  ville: false, adresse: false, message: true,  metier: true  }, // tel+nom+cp+métier+message synthétisé
    rappel:          { name: true, contact: true, cp: false, ville: false, adresse: false, message: false, metier: false }, // callback minimal
  };
  const contract: Contract = CONTRACTS[formType] || CONTRACTS['demande_metier']; // défaut sûr si non déclaré

  const hasValidPhone = !!tel && isValidFrenchPhone(tel);
  const hasValidEmail = !!email && isValidEmail(email);

  if (contract.name && !nom && !prenom) errors.nom = 'Nom requis';
  if (contract.contact) {
    if (!tel && !email) errors.contact = 'Téléphone ou email requis';
    else {
      if (tel && !hasValidPhone) errors.telephone = 'Téléphone invalide (format français)';
      if (email && !hasValidEmail) errors.email = 'Email invalide';
      if (!hasValidPhone && !hasValidEmail) errors.contact = 'Fournissez un téléphone ou un email valide';
    }
  } else {
    if (tel && !hasValidPhone) errors.telephone = 'Téléphone invalide (format français)';
    if (email && !hasValidEmail) errors.email = 'Email invalide';
  }
  if (contract.adresse && (!adresse || adresse.length < 5)) errors.adresse = 'Adresse requise';
  if (contract.cp && !cp) errors.code_postal = 'Code postal requis';
  if (cp && !isValidCP(cp)) errors.code_postal = 'Code postal invalide (5 chiffres)';
  if (contract.ville && !ville) errors.ville = 'Ville requise';
  if (contract.message && !message) errors.message = 'Message requis';
  if (contract.metier && !metier) errors.metier = 'Métier ou besoin requis';

  if (Object.keys(errors).length > 0) {
    return json(400, { error: 'Champs requis manquants ou invalides', errors });
  }

  const payload = {
    nom: nom || prenom || 'Prospect',
    prenom,
    email,
    telephone: tel ? normalizePhone(tel) : null,
    ville,
    code_postal: cp,
    adresse,
    metier,
    type_demande: sanitize(body.type_demande, 50) || 'contact',
    message,
    budget: sanitize(body.budget, 100),
    source: sanitize(body.source, 100) || 'formulaire_site',
    source_page: sanitize(body.source_page, 500),
    source_referer: sanitize(body.source_referer, 500),
    utm: Object.assign({}, (body.utm && typeof body.utm === 'object') ? body.utm : {}, { form_type: formType || 'demande_metier' }),
    status: 'nouveau',
    priority: 'normale',
    realisation_id: typeof body.realisation_id === 'string' ? body.realisation_id : null,
  };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.from('leads').insert([payload]).select('id').single();
  if (error) {
    console.error('[submit-lead] insert error:', error);
    return json(500, { error: 'Erreur d’enregistrement', detail: error.message });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const svcKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${svcKey}` };
  const efBody = JSON.stringify({ lead_id: data.id });
  // Notification interne (email agence) — cœur du rappel <30 min
  try { fetch(`${supabaseUrl}/functions/v1/notify-lead`, { method: 'POST', headers, body: efBody }).catch(() => {}); } catch (_) {}
  // Accusé de réception client — uniquement si email fourni (lead-auto-reply gère le cas no_client_email)
  try { fetch(`${supabaseUrl}/functions/v1/lead-auto-reply`, { method: 'POST', headers, body: efBody }).catch(() => {}); } catch (_) {}

  return json(200, { success: true, id: data.id, contract_v5: true });
});
