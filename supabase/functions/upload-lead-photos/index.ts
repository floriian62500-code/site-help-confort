// HELP Confort — upload-lead-photos v1 (2026-08-06)
// ─────────────────────────────────────────────────────────────────────────
// Upload SÉCURISÉ des photos d'un lead. AUCUN upload anonyme direct dans Storage.
// Flux :
//   1. Le lead est créé par submit-lead, qui renvoie { id, upload_token }.
//      submit-lead stocke dans metadata : upload_token (aléatoire) + upload_expires (now+15min).
//   2. Le navigateur POST ici : multipart/form-data { lead_id, upload_token, files[] }.
//   3. Cette fonction (service_role) vérifie : token == metadata.upload_token, non expiré,
//      nombre <= 3, taille <= 8 Mo/fichier, MIME RÉEL (magic bytes) ∈ {jpeg,png,webp,heic},
//      extension cohérente, nom neutralisé. Le CHEMIN est généré côté serveur.
//   4. Upload dans un bucket PRIVÉ 'lead-photos' au chemin leads/<lead_id>/<uuid>.<ext>.
//   5. Association au lead (metadata.photos = [{path, type, size}]) + invalidation du token.
//   6. Aucune lecture publique : la consultation se fait par URL signée (createSignedUrl) côté admin.
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

const BUCKET = 'lead-photos';
const MAX_FILES = 3;
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo/fichier

// MIME réel par magic bytes (on ne fait pas confiance au Content-Type déclaré)
function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  // JPEG FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg';
  // PNG 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
  // WEBP : RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
  // HEIC/HEIF : ....ftypheic / ftypheif / ftypmif1
  const ascii = String.fromCharCode(...bytes.slice(4, 12));
  if (ascii.startsWith('ftyp') && /(heic|heif|mif1|msf1)/.test(ascii)) return 'image/heic';
  return null;
}
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };

function safeUuid(): string {
  return crypto.randomUUID();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let form: FormData;
  try { form = await req.formData(); } catch { return json(400, { error: 'multipart/form-data requis' }); }

  const leadId = String(form.get('lead_id') || '').trim();
  const token = String(form.get('upload_token') || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) return json(400, { error: 'lead_id invalide' });
  if (token.length < 16) return json(400, { error: 'upload_token invalide' });

  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) return json(400, { error: 'aucun fichier' });
  if (files.length > MAX_FILES) return json(400, { error: `Maximum ${MAX_FILES} photos` });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // 1) Vérifier le lead + le jeton + l'expiration
  const { data: lead, error: lErr } = await supabase
    .from('leads').select('id, metadata').eq('id', leadId).single();
  if (lErr || !lead) return json(404, { error: 'lead introuvable' });
  const meta = (lead.metadata || {}) as Record<string, unknown>;
  const savedToken = String(meta.upload_token || '');
  const expires = Number(meta.upload_expires || 0);
  if (!savedToken || savedToken !== token) return json(403, { error: 'jeton invalide' });
  if (!expires || Date.now() > expires) return json(403, { error: 'jeton expiré' });

  // 2) Valider + uploader chaque fichier (chemin généré serveur)
  const stored: Array<{ path: string; type: string; size: number }> = [];
  const rejected: Array<{ name: string; reason: string }> = [];
  for (const f of files) {
    if (f.size > MAX_SIZE) { rejected.push({ name: f.name, reason: 'trop lourd (>8 Mo)' }); continue; }
    const buf = new Uint8Array(await f.arrayBuffer());
    const realMime = sniffMime(buf);
    if (!realMime || !EXT[realMime]) { rejected.push({ name: f.name, reason: 'format non autorisé' }); continue; }
    const ext = EXT[realMime];
    // chemin 100% généré par le serveur — le client ne choisit rien
    const path = `leads/${leadId}/${safeUuid()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: realMime, upsert: false,
    });
    if (upErr) { rejected.push({ name: f.name, reason: 'échec stockage' }); continue; }
    stored.push({ path, type: realMime, size: f.size });
  }

  // 3) Associer au lead + invalider le jeton (usage unique)
  const newMeta = { ...meta };
  delete newMeta.upload_token;
  delete newMeta.upload_expires;
  newMeta.photos = [ ...((meta.photos as unknown[]) || []), ...stored ];
  await supabase.from('leads').update({ metadata: newMeta }).eq('id', leadId);

  return json(200, {
    ok: true,
    stored: stored.length,
    rejected,
    partial: rejected.length > 0,
    // pas d'URL publique — consultation admin via createSignedUrl uniquement
  });
});
