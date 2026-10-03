// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// sync-files-staging-to-main : cherry-pick d'une liste de fichiers depuis staging vers main
// Body: { token, paths: ['admin-pro/x.html', ...], message? }
async function gh(token: string, path: string, opts: RequestInit = {}, accept = 'application/vnd.github+json') {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: { ...(opts.headers || {}), 'Authorization': 'Bearer ' + token, 'Accept': accept, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'hc-sync' }
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`${path} -> ${r.status} ${t.slice(0,300)}`); }
  if (accept === 'application/vnd.github.raw') return r.text();
  return r.json();
}
function b64encode(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; for (let i=0; i<bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('POST only', {status:405});
  const body = await req.json().catch(() => null);
  if (!body || !body.token || !Array.isArray(body.paths)) return new Response(JSON.stringify({error:'token + paths[] required'}), {status:400, headers:{'Content-Type':'application/json'}});
  const { token, paths, message } = body;
  const owner = 'floriian62500-code'; const repo = 'site-help-confort';
  try {
    // Fetch contents from staging
    const blobs: Array<{path:string, sha:string}> = [];
    for (const path of paths) {
      const content = await gh(token, `/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=staging`, {}, 'application/vnd.github.raw') as string;
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({content: b64encode(content), encoding:'base64'}) }) as any;
      blobs.push({path, sha: blob.sha});
    }
    // Get HEAD of main
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/main`) as any;
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`) as any;
    // New tree
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({base_tree: headCommit.tree.sha, tree: blobs.map(b => ({path: b.path, mode:'100644', type:'blob', sha: b.sha}))})
    }) as any;
    // New commit
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message: message || `chore(sync): cherry-pick ${paths.length} file(s) staging->main`, tree: newTree.sha, parents:[headSha]})
    }) as any;
    // Update ref
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/main`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({sha: newCommit.sha})
    });
    return new Response(JSON.stringify({success:true, commit_sha: newCommit.sha, commit_url:`https://github.com/${owner}/${repo}/commit/${newCommit.sha}`, files_synced: blobs.length, paths}), {status:200, headers:{'Content-Type':'application/json'}});
  } catch(e) {
    return new Response(JSON.stringify({error: (e as Error).message}), {status:500, headers:{'Content-Type':'application/json'}});
  }
});
