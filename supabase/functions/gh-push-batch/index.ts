// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — gh-push-batch
// Pousse un batch de fichiers vers GitHub en un seul commit atomique via Git Data API.
// verify_jwt=false. Auth via token GitHub fourni dans le payload (l'appelant a le contrôle).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

interface PushFile { path: string; content_b64: string; mode?: string }
interface Payload {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  message: string;
  files: PushFile[];
}

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
    throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0, 500)}`);
  }
  return r.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body: Payload;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON: ' + (e as Error).message }), { status: 400 });
  }
  const { token, owner, repo, branch = 'main', message, files } = body;
  if (!token || !owner || !repo || !files?.length) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }
  try {
    // 1. Récupère le HEAD actuel de la branche
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const headCommitSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headCommitSha}`);
    const baseTreeSha = headCommit.tree.sha;

    // 2. Crée un blob pour chaque fichier
    const treeItems: any[] = [];
    for (const f of files) {
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: f.content_b64, encoding: 'base64' }),
      });
      treeItems.push({
        path: f.path,
        mode: f.mode || '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    // 3. Crée un tree avec ces blobs (incremental sur base_tree)
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });

    // 4. Crée un commit pointant sur ce tree
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headCommitSha] }),
    });

    // 5. Update la ref vers le nouveau commit
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        commit_sha: newCommit.sha,
        files_pushed: files.length,
        commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
