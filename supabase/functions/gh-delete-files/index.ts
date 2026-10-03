// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// gh-delete-files — supprime plusieurs paths d'un repo en 1 commit via Git Data API.
// Body : { token, owner, repo, branch, paths: ["images/_to_delete_xxx.png", ...], message? }
async function gh(token: string, path: string, opts: RequestInit = {}) {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hc-delete-files',
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0, 300)}`);
  }
  return r.json();
}
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({error:'bad json'}), {status:400}); }
  const { token, owner, repo, branch = 'staging', paths, message = 'cleanup: delete obsolete files' } = body;
  if (!token || !owner || !repo || !Array.isArray(paths) || !paths.length) {
    return new Response(JSON.stringify({ error: 'Missing token/owner/repo/paths' }), { status: 400 });
  }
  try {
    // 1. Get current ref + commit + tree
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);
    const baseTreeSha = headCommit.tree.sha;
    
    // 2. Build tree with deletions (sha: null = delete)
    const treeItems = paths.map((p: string) => ({
      path: p,
      mode: '100644',
      type: 'blob',
      sha: null  // null = delete
    }));
    
    // 3. Create new tree based on existing tree
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    
    // 4. Create commit
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
    });
    
    // 5. Update ref
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });
    
    return new Response(JSON.stringify({
      success: true,
      commit_sha: newCommit.sha,
      paths_deleted: paths,
      commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
