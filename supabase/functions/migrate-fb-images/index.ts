// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — migrate-fb-images V3
// V3 : self-auth via SUPABASE_SERVICE_ROLE_KEY env (toujours dispo en interne).
// Aucun secret à fournir : on réutilise directement la clef de l'env Edge runtime.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

function extFromContentType(ct: string | null): string {
  if (!ct) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  return 'jpg';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!sbServiceKey) {
    return json(500, { error: 'SERVICE_ROLE_KEY not available in env' });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    sbServiceKey,
    { auth: { persistSession: false } }
  );

  const { data: rows, error: fetchErr } = await supabase
    .from('realisations')
    .select('id, title, image_after')
    .or('image_after.ilike.%fbcdn%,image_after.ilike.%scontent%');

  if (fetchErr) return json(500, { error: 'BDD fetch failed', detail: fetchErr.message });
  if (!rows || rows.length === 0) return json(200, { migrated: 0, message: 'Aucune image fbcdn à migrer' });

  const results: Array<{ id: string; title: string; status: string; new_url?: string; error?: string }> = [];

  for (const row of rows) {
    const oldUrl = row.image_after as string;
    if (!oldUrl) { results.push({ id: row.id, title: row.title, status: 'skipped_no_url' }); continue; }
    try {
      const fbResp = await fetch(oldUrl, { headers: { 'User-Agent': 'Mozilla/5.0 HC-Migrator' } });
      if (!fbResp.ok) { results.push({ id: row.id, title: row.title, status: 'fetch_failed', error: `HTTP ${fbResp.status}` }); continue; }
      const contentType = fbResp.headers.get('content-type') || 'image/jpeg';
      const ext = extFromContentType(contentType);
      const buffer = await fbResp.arrayBuffer();
      const filePath = `fb-imported/${row.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('realisations').upload(filePath, buffer, { contentType, upsert: true, cacheControl: '31536000' });
      if (uploadErr) { results.push({ id: row.id, title: row.title, status: 'upload_failed', error: uploadErr.message }); continue; }
      const { data: pub } = supabase.storage.from('realisations').getPublicUrl(filePath);
      const newUrl = pub?.publicUrl;
      if (!newUrl) { results.push({ id: row.id, title: row.title, status: 'no_public_url' }); continue; }
      const { error: updateErr } = await supabase.from('realisations').update({ image_after: newUrl }).eq('id', row.id);
      if (updateErr) { results.push({ id: row.id, title: row.title, status: 'db_update_failed', error: updateErr.message }); continue; }
      results.push({ id: row.id, title: row.title, status: 'ok', new_url: newUrl });
    } catch (e) {
      results.push({ id: row.id, title: row.title, status: 'exception', error: (e as Error)?.message || String(e) });
    }
  }

  const ok = results.filter(r => r.status === 'ok').length;
  return json(200, { total: rows.length, migrated_ok: ok, results });
});
