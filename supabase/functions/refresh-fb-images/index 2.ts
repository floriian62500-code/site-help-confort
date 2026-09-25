// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — refresh-fb-images
// Pour chaque realisation avec image_after fbcdn :
//  1. Récupère fb_post_id depuis ai_generated
//  2. Appelle Graph API /post_id?fields=full_picture avec META_PAGE_TOKEN → URL fbcdn FRAÎCHE
//  3. Télécharge immédiatement (URL encore valide)
//  4. Upload sur Supabase Storage bucket 'realisations'
//  5. Update image_after avec URL Storage permanente
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const GRAPH = 'https://graph.facebook.com/v21.0';
const json = (status: number, body: unknown) => new Response(JSON.stringify(body, null, 2), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
function extFromCT(ct: string | null): string {
  if (!ct) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  return 'jpg';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const sbServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!sbServiceKey) return json(500, { error: 'SERVICE_ROLE_KEY not in env' });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, sbServiceKey, { auth: { persistSession: false } });

  // Récupère le META_PAGE_TOKEN depuis app_settings
  const { data: settings } = await supabase.from('app_settings').select('value').eq('key', 'meta').single();
  const metaToken = settings?.value?.page_access_token;
  if (!metaToken) return json(500, { error: 'META_PAGE_TOKEN absent dans app_settings.meta' });

  // Récupère les realisations à rafraîchir
  const { data: rows, error: fetchErr } = await supabase
    .from('realisations')
    .select('id, title, ai_generated, image_after')
    .or('image_after.ilike.%fbcdn%,image_after.ilike.%scontent%');
  if (fetchErr) return json(500, { error: 'BDD fetch failed', detail: fetchErr.message });
  if (!rows || rows.length === 0) return json(200, { message: 'Aucune image fbcdn à rafraîchir' });

  const results: any[] = [];
  for (const row of rows) {
    const fbPostId = (row.ai_generated as any)?.fb_post_id;
    if (!fbPostId) { results.push({ id: row.id, status: 'skipped_no_fb_id' }); continue; }
    try {
      // Step 1 : Graph API pour URL fraîche
      const graphUrl = `${GRAPH}/${fbPostId}?fields=full_picture&access_token=${encodeURIComponent(metaToken)}`;
      const graphResp = await fetch(graphUrl);
      const graphData = await graphResp.json();
      if (!graphResp.ok || graphData.error || !graphData.full_picture) {
        results.push({ id: row.id, status: 'graph_failed', error: graphData.error?.message || 'no full_picture' });
        continue;
      }
      const freshUrl = graphData.full_picture as string;

      // Step 2 : Télécharge immédiatement (URL fraîche, doit marcher quelques secondes/minutes)
      const imgResp = await fetch(freshUrl, { headers: { 'User-Agent': 'Mozilla/5.0 HC-Refresher' } });
      if (!imgResp.ok) {
        results.push({ id: row.id, status: 'download_failed', error: `HTTP ${imgResp.status}` });
        continue;
      }
      const contentType = imgResp.headers.get('content-type') || 'image/jpeg';
      const ext = extFromCT(contentType);
      const buffer = await imgResp.arrayBuffer();
      const filePath = `fb-imported/${row.id}.${ext}`;

      // Step 3 : Upload sur Storage
      const { error: uploadErr } = await supabase.storage.from('realisations').upload(filePath, buffer, {
        contentType, upsert: true, cacheControl: '31536000',
      });
      if (uploadErr) { results.push({ id: row.id, status: 'upload_failed', error: uploadErr.message }); continue; }

      const { data: pub } = supabase.storage.from('realisations').getPublicUrl(filePath);
      const newUrl = pub?.publicUrl;
      if (!newUrl) { results.push({ id: row.id, status: 'no_public_url' }); continue; }

      // Step 4 : Update BDD
      const { error: updErr } = await supabase.from('realisations').update({ image_after: newUrl }).eq('id', row.id);
      if (updErr) { results.push({ id: row.id, status: 'db_update_failed', error: updErr.message }); continue; }

      results.push({ id: row.id, title: row.title, status: 'ok', new_url: newUrl });
    } catch (e) {
      results.push({ id: row.id, status: 'exception', error: (e as Error)?.message });
    }
  }

  const ok = results.filter(r => r.status === 'ok').length;
  return json(200, { total: rows.length, refreshed_ok: ok, results });
});
