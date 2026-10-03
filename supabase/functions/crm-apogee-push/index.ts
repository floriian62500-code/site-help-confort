// ═══════════════════════════════════════════════════════════════════════════
// crm-apogee-push — envoi des coordonnées vers le CRM Apogée
// ═══════════════════════════════════════════════════════════════════════════
// État : EN ATTENTE D'ACCÈS. Aucun endpoint ni secret n'est inventé ici.
// Tant que APOGEE_API_URL et APOGEE_API_KEY ne sont pas configurés côté Supabase,
// la fonction ne fait RIEN et répond `blocked: missing_credentials` avec le nombre
// de dossiers en attente. Les dossiers restent marqués `metadata.crm_status='pending'`
// par submit-lead-v6 : rien n'est perdu, tout partira au branchement.
//
// Body : { limit?: number, dry_run?: boolean }
// Déploiement + secrets + cron = gestes humains (voir docs/CRM-APOGEE-MAPPING.md).
// ═══════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Mapping site → Apogée. Seul endroit à ajuster quand l'éditeur fournit son schéma.
function toApogee(l: Record<string, any>) {
  const meta = l.metadata || {};
  const utm = l.utm || {};
  const attribution = utm.attribution || {};
  return {
    external_id: l.id,                              // référence dossier site (idempotence côté CRM)
    correlation_id: meta.correlation_id || null,
    first_name: l.prenom || null,
    last_name: l.nom || null,
    phone: l.telephone || null,
    email: l.email || null,
    address: l.adresse || null,
    postal_code: l.code_postal || null,
    city: l.ville || null,
    trade: l.metier || null,                        // métier
    request_type: l.type_demande || null,           // consultation_tarifs | commande | mixte | devis | entretien…
    status: l.status || null,                       // intent | needs_followup | nouveau | archive
    last_step: meta.last_step || null,
    message: l.message || null,
    source: l.source || null,
    source_page: l.source_page || null,
    referrer: l.source_referer || attribution.referrer || null,
    utm_source: attribution.utm_source || null,
    utm_medium: attribution.utm_medium || null,
    utm_campaign: attribution.utm_campaign || null,
    gclid: attribution.gclid || null,
    fbclid: attribution.fbclid || null,
    created_at: l.created_at,
    updated_at: meta.last_activity_at || l.created_at,
    agency: 'saint-omer',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch (_) { body = {}; }
  const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 100);
  const dryRun = body.dry_run === true;

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: rows, error } = await sb
    .from('leads')
    .select('*')
    .eq('metadata->>crm_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return json({ ok: false, error: error.message }, 500);
  const pending = Array.isArray(rows) ? rows : [];

  const API_URL = Deno.env.get('APOGEE_API_URL');
  const API_KEY = Deno.env.get('APOGEE_API_KEY');
  if (!API_URL || !API_KEY) {
    // Pas de faux succès : on dit exactement ce qui manque.
    return json({
      ok: false,
      blocked: 'missing_credentials',
      needed: ['APOGEE_API_URL', 'APOGEE_API_KEY'],
      pending: pending.length,
      sample_payload: pending.length ? toApogee(pending[0]) : null,
      doc: 'docs/CRM-APOGEE-MAPPING.md',
    });
  }

  if (dryRun) return json({ ok: true, dry_run: true, pending: pending.length, payloads: pending.map(toApogee) });

  const sent: string[] = [];
  const failed: Array<{ id: string; status?: number; error?: string }> = [];
  for (const lead of pending) {
    const payload = toApogee(lead);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify(payload),
      });
      const meta = (lead.metadata || {}) as Record<string, unknown>;
      if (res.ok) {
        let ref: string | null = null;
        try { ref = (await res.json())?.id ?? null; } catch (_) { ref = null; }
        await sb.from('leads').update({ metadata: { ...meta, crm_status: 'sent', crm_sent_at: new Date().toISOString(), crm_ref: ref } }).eq('id', lead.id);
        sent.push(lead.id);
      } else {
        const txt = await res.text();
        const attempts = Number(meta.crm_attempts || 0) + 1;
        await sb.from('leads').update({ metadata: { ...meta, crm_status: attempts >= 5 ? 'error' : 'pending', crm_attempts: attempts, crm_error: txt.slice(0, 300) } }).eq('id', lead.id);
        failed.push({ id: lead.id, status: res.status, error: txt.slice(0, 200) });
      }
    } catch (e) {
      failed.push({ id: lead.id, error: String(e).slice(0, 200) });
    }
  }
  return json({ ok: failed.length === 0, pending: pending.length, sent: sent.length, failed });
});
