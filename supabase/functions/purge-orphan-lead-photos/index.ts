// HELP Confort — purge-orphan-lead-photos v1 (2026-08-08)
// Maintenance : supprime du bucket privé lead-photos les objets NON référencés par un lead
// (metadata.photos). Sûr par construction : ne peut JAMAIS supprimer une photo liée à un lead.
// Garde légère : header x-purge-confirm: yes.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'lead-photos';
const json = (s: number, b: unknown) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (req.headers.get('x-purge-confirm') !== 'yes') return json(403, { error: 'confirmation requise (x-purge-confirm: yes)' });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  const referenced = new Set<string>();
  const { data: leads } = await sb.from('leads').select('metadata').not('metadata->photos', 'is', null);
  for (const l of (leads || [])) {
    const photos = Array.isArray((l as any)?.metadata?.photos) ? (l as any).metadata.photos : [];
    for (const p of photos) { if (p?.path) referenced.add(String(p.path)); }
  }

  const allPaths: string[] = [];
  const { data: folders } = await sb.storage.from(BUCKET).list('leads', { limit: 1000 });
  for (const f of (folders || [])) {
    if (f.name) {
      const { data: files } = await sb.storage.from(BUCKET).list(`leads/${f.name}`, { limit: 1000 });
      for (const file of (files || [])) { if (file?.name) allPaths.push(`leads/${f.name}/${file.name}`); }
    }
  }

  const orphans = allPaths.filter(p => !referenced.has(p));
  let deleted = 0;
  if (orphans.length) {
    const { data, error } = await sb.storage.from(BUCKET).remove(orphans);
    if (error) return json(500, { error: error.message, orphans });
    deleted = (data || []).length;
  }
  return json(200, { ok: true, scanned: allPaths.length, referenced: referenced.size, deleted, kept: allPaths.length - deleted });
});
