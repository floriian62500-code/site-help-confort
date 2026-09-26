// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// hc-content-save : sauvegarde une modif de texte WYSIWYG sur une page HTML du repo.
// Body: { page_path, original_text, new_text, change_type='text'|'attribute', token? }
// Stratégie : find/replace strict — si plusieurs matchs OU 0 match, refus.
async function gh(token: string, path: string, opts: RequestInit = {}, accept = 'application/vnd.github+json') {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: { ...(opts.headers || {}), 'Authorization': 'Bearer ' + token, 'Accept': accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'hc-content-save' }
  });
  if (!r.ok) { const txt = await r.text(); throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0, 300)}`); }
  if (accept === 'application/vnd.github.raw') return r.text();
  return r.json();
}
function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey' } });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  const body = await req.json().catch(() => null);
  if (!body) return cors({ error: 'bad json' }, 400);
  const { page_path, original_text, new_text, token: bodyToken } = body;
  if (!page_path || !original_text || new_text === undefined) return cors({ error: 'missing fields page_path/original_text/new_text' }, 400);
  if (original_text === new_text) return cors({ error: 'no change' }, 200);
  // Token : depuis body OU depuis vault (Supabase secret)
  let token = bodyToken;
  if (!token) {
    const vaultRes = await fetch(`https://btcbjwqiivhpwoszomhg.supabase.co/rest/v1/rpc/get_secret_text`, {
      method: 'POST',
      headers: { 'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', 'Authorization': 'Bearer ' + (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''), 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_name: 'github_pat_hc_online_first' })
    }).catch(() => null);
    if (vaultRes && vaultRes.ok) token = (await vaultRes.text()).replace(/"/g, '');
  }
  if (!token) return cors({ error: 'no github token' }, 401);
  // Sécurité : whitelist des extensions/path
  if (!/\.html?$/i.test(page_path)) return cors({ error: 'only .html files allowed' }, 400);
  if (page_path.includes('..') || page_path.startsWith('/')) return cors({ error: 'invalid path' }, 400);
  const owner = 'floriian62500-code'; const repo = 'site-help-confort'; const branch = 'staging';
  try {
    // Fetch current content
    const raw = await gh(token, `/repos/${owner}/${repo}/contents/${page_path.split('/').map(encodeURIComponent).join('/')}?ref=${branch}`, {}, 'application/vnd.github.raw') as string;
    // Count occurrences
    const count = raw.split(original_text).length - 1;
    if (count === 0) return cors({ error: 'original_text not found in page', preview: original_text.slice(0, 100) }, 404);
    if (count > 1) return cors({ error: `original_text occurs ${count}x — impossible to disambiguate. Make selection unique.`, occurrences: count }, 409);
    const newContent = raw.replace(original_text, new_text);
    if (newContent === raw) return cors({ error: 'no change after replace' }, 400);
    // Push commit via Git Data API
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`) as any;
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`) as any;
    const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: b64encode(newContent), encoding: 'base64' }) }) as any;
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: [{ path: page_path, mode: '100644', type: 'blob', sha: blob.sha }] }) }) as any;
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `feat(wysiwyg): edit "${original_text.slice(0, 50)}" → "${new_text.slice(0, 50)}" on ${page_path}`, tree: newTree.sha, parents: [headSha] }) }) as any;
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sha: newCommit.sha }) });
    return cors({ success: true, commit_sha: newCommit.sha, commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`, page_path, branch }, 200);
  } catch (e) {
    return cors({ error: (e as Error).message }, 500);
  }
});
function cors(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
}
