// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-20 (assainissement, directive 5732805778).
// Cette fonction tournait en production SANS source dans le dépôt (déployée à la main le 2026-06-06).
// Code identique à la version déployée (seul cet en-tête a été ajouté) : version 1, verify_jwt = false.
//
// 🔴 POINT DE SÉCURITÉ À ARBITRER (docs/dev/TROUBLESHOOTING.md § sécurité) :
//    la fonction est PUBLIQUE (verify_jwt = false) et pousse sur N'IMPORTE QUEL dépôt GitHub avec
//    le jeton fourni dans le corps de la requête. C'est donc un relais d'écriture GitHub ouvert.
//    Son seul appelant est assets/hc-edit-mode.js (mode d'édition WYSIWYG, actif uniquement sur les
//    previews Netlify et avec un cookie), qui lit un PAT dans le localStorage du navigateur.
//    Recommandation : restreindre (verify_jwt, jeton serveur, liste blanche owner/repo/branche) ou
//    supprimer la fonction si le mode d'édition n'est plus utilisé. Décision + déploiement = humain.
//
// gh-push-inline — accepte fichiers en base64 inline et pousse sur GitHub en UN commit.
// Body : { token, owner, repo, branch, message, files: [{path, content_b64}] }
async function gh(token: string, path: string, opts: RequestInit = {}) {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0, 400)}`);
  }
  return r.json();
}
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body: any;
  try { body = await req.json(); } catch (e) { return new Response(JSON.stringify({error:'bad json'}), {status:400}); }
  const { token, owner, repo, branch = 'main', message, files } = body;
  if (!token || !owner || !repo || !Array.isArray(files) || !files.length) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  try {
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);
    const baseTreeSha = headCommit.tree.sha;
    const treeItems: any[] = [];
    for (const f of files) {
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: f.content_b64, encoding: 'base64' }),
      });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message || 'auto-push inline', tree: newTree.sha, parents: [headSha] }),
    });
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });
    return new Response(JSON.stringify({
      success: true,
      commit_sha: newCommit.sha,
      files_pushed: files.length,
      commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
