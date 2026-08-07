// HELP Confort — lead-photo-signed-url v1 (2026-08-07)
// ─────────────────────────────────────────────────────────────────────────
// Consultation ADMIN des photos d'un lead (bucket privé lead-photos).
// Aucune policy SELECT n'est accordée à authenticated sur lead-photos (moindre
// privilège). La consultation passe UNIQUEMENT par ici :
//   1. verify_jwt=true → la gateway Supabase valide le JWT (rejette les anonymes).
//   2. On vérifie EN PLUS que l'appelant est un admin ACTIF (user_profiles.is_active).
//      Un simple compte authentifié ne suffit pas.
//   3. service_role génère des URLs signées COURTES (5 min) pour chaque photo.
// Rien n'est jamais exposé publiquement ni en lecture directe.
// ─────────────────────────────────────────────────────────────────────────
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const BUCKET = 'lead-photos';
const SIGN_TTL = 300; // 5 min
const ALLOWED_ROLES = ['owner', 'assistant', 'admin', 'supervisor'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const auth = req.headers.get('Authorization') || '';
  const jwt = auth.replace(/^Bearer\s+/i, '').trim();
  if (!jwt) return json(401, { error: 'authentification requise' });

  const svc = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  // 1) Identité réelle de l'appelant (valide le JWT côté serveur)
  const { data: userData, error: uErr } = await svc.auth.getUser(jwt);
  const uid = userData?.user?.id;
  if (uErr || !uid) return json(401, { error: 'session invalide' });

  // 2) Doit être un admin ACTIF (pas juste un compte authentifié)
  const { data: prof } = await svc
    .from('user_profiles').select('role, is_active').eq('user_id', uid).maybeSingle();
  if (!prof || prof.is_active !== true || !ALLOWED_ROLES.includes(String(prof.role))) {
    return json(403, { error: 'accès réservé aux administrateurs actifs' });
  }

  // 3) Lead + photos
  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'JSON invalide' }); }
  const leadId = String(body?.lead_id || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) return json(400, { error: 'lead_id invalide' });

  const { data: lead, error: lErr } = await svc
    .from('leads').select('metadata').eq('id', leadId).maybeSingle();
  if (lErr || !lead) return json(404, { error: 'lead introuvable' });

  const photos = Array.isArray(lead.metadata?.photos) ? lead.metadata.photos : [];
  const out = [];
  for (const p of photos) {
    if (!p?.path || typeof p.path !== 'string' || !p.path.startsWith(`leads/${leadId}/`)) continue;
    const { data: signed } = await svc.storage.from(BUCKET).createSignedUrl(p.path, SIGN_TTL);
    if (signed?.signedUrl) out.push({ url: signed.signedUrl, type: p.type || null, size: p.size || null });
  }

  return json(200, { photos: out, count: out.length, expires_in: SIGN_TTL });
});
