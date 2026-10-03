// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  const body = await req.json();
  const { token, owner, repo, branch = 'main', message, job_ids } = body;
  if (!token || !owner || !repo || !Array.isArray(job_ids)) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  try {
    // 1. Lire et assembler tous les chunks par job_id
    const files: { path: string; content_b64: string }[] = [];
    for (const job_id of job_ids) {
      const { data, error } = await sb.from('_gh_push_chunks')
        .select('file_path, chunk_num, chunk_b64')
        .eq('job_id', job_id)
        .order('chunk_num');
      if (error) throw new Error(`Read chunks ${job_id}: ${error.message}`);
      if (!data || !data.length) throw new Error(`No chunks for ${job_id}`);
      const filepath = data[0].file_path;
      const b64 = data.map((c: any) => c.chunk_b64).join('');
      files.push({ path: filepath, content_b64: b64 });
    }

    // 2. Récupérer le HEAD branch
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);
    const baseTreeSha = headCommit.tree.sha;

    // 3. Créer blobs pour chaque fichier
    const treeItems: any[] = [];
    for (const f of files) {
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: f.content_b64, encoding: 'base64' }),
      });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // 4. Nouveau tree
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
    });

    // 5. Nouveau commit
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
    });

    // 6. Update ref
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    // 7. Cleanup chunks
    await sb.from('_gh_push_chunks').delete().in('job_id', job_ids);

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
