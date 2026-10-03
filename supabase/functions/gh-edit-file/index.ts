// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// gh-edit-file v3 — fetch via /contents JSON + base64 decode (bypass bug Accept:raw 401).
// Body: { token, owner, repo, branch='staging', file_path, find, replace, message, replace_all? }
async function gh(token: string, path: string, opts: RequestInit = {}) {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hc-gh-edit-file',
    },
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0, 400)}`);
  }
  return r.json();
}
// b64 decode (UTF-8 safe)
function b64decode(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
async function getFileContent(token: string, owner: string, repo: string, path: string, branch: string): Promise<{content: string, sha: string}> {
  // /contents avec Accept JSON (pas raw) — stable, retourne base64
  const url = `/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`;
  const res = await gh(token, url);
  if (!res.content) throw new Error('No content field in /contents response');
  return { content: b64decode(res.content), sha: res.sha };
}
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body: any;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({error:'bad json'}), {status:400}); }
  const { token, owner, repo, branch = 'staging', file_path, find, replace, message, replace_all = false } = body;
  if (!token || !owner || !repo || !file_path || !find || replace === undefined || !message) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  try {
    // 1. Read file content via /contents JSON + base64
    const { content } = await getFileContent(token, owner, repo, file_path, branch);
    // 2. Verify find string
    const occurrences = content.split(find).length - 1;
    if (occurrences === 0) {
      return new Response(JSON.stringify({ error: `'find' not found in ${file_path}`, find_preview: find.slice(0, 200), branch }), { status: 404 });
    }
    if (!replace_all && occurrences > 1) {
      return new Response(JSON.stringify({ error: `'find' occurs ${occurrences}x. Use replace_all=true.`, occurrences }), { status: 409 });
    }
    // 3. Replace
    const newContent = replace_all ? content.split(find).join(replace) : content.replace(find, replace);
    if (newContent === content) {
      return new Response(JSON.stringify({ error: 'No change after replacement' }), { status: 400 });
    }
    // 4. Encode b64 (UTF-8)
    const enc = new TextEncoder();
    const bytes = enc.encode(newContent);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const newContentB64 = btoa(bin);
    // 5. Get HEAD
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);
    // 6. New blob
    const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContentB64, encoding: 'base64' }),
    });
    // 7. New tree
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_tree: headCommit.tree.sha,
        tree: [{ path: file_path, mode: '100644', type: 'blob', sha: blob.sha }],
      }),
    });
    // 8. New commit
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
    });
    // 9. Update ref with retry on fast-forward fail
    let retries = 3;
    while (retries > 0) {
      try {
        await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sha: newCommit.sha, force: false }),
        });
        break;
      } catch (e: any) {
        if (retries === 1) throw e;
        await new Promise(r => setTimeout(r, 700));
        retries--;
      }
    }
    return new Response(JSON.stringify({
      success: true,
      commit_sha: newCommit.sha,
      branch,
      file_path,
      occurrences_replaced: replace_all ? occurrences : 1,
      old_size: content.length,
      new_size: newContent.length,
      commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
