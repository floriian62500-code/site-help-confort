// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// gh-bulk-purge-seo-stats : retire le bloc <section class="seo-stats">...</section> de toutes les pages /prestations/*.html en un commit
// + protège les pages PMR (salle-de-bain-pmr.html etc.) si keep_pmr=true
async function gh(token: string, path: string, opts: RequestInit = {}, accept: string = 'application/vnd.github+json') {
  const r = await fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      'Authorization': 'Bearer ' + token,
      'Accept': accept,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hc-bulk-purge'
    }
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`GitHub ${path} → ${r.status} ${txt.slice(0,400)}`);
  }
  if (accept === 'application/vnd.github.raw') return r.text();
  return r.json();
}
function b64decode(s: string): string {
  const bin = atob(s.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i=0; i<bin.length; i++) bytes[i]=bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
function b64encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin=''; for (let i=0; i<bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', {status:405});
  const body = await req.json();
  const { token, owner='floriian62500-code', repo='site-help-confort', branch='staging', dir='prestations', keep_pmr=false, dry_run=false } = body;
  if (!token) return new Response(JSON.stringify({error:'missing token'}), {status:400});
  const SEO_STATS_REGEX = /<section[^>]*class="seo-stats"[^>]*>[\s\S]*?<\/section>\s*/g;
  try {
    // 1. List dir
    const listing = await gh(token, `/repos/${owner}/${repo}/contents/${dir}?ref=${branch}`) as any[];
    const htmlFiles = listing.filter((f:any) => f.type==='file' && f.name.endsWith('.html'));
    const changes: Array<{path:string, removed:boolean, reason?:string}> = [];
    const blobs: Array<{path:string, sha:string}> = [];
    for (const f of htmlFiles) {
      const isPmrPage = /-pmr\./.test(f.name) || f.name === 'garde-corps-rampes.html';
      if (keep_pmr && isPmrPage) { changes.push({path: f.path, removed:false, reason:'PMR keep'}); continue; }
      const raw = await gh(token, `/repos/${owner}/${repo}/contents/${f.path}?ref=${branch}`, {}, 'application/vnd.github.raw') as string;
      const newContent = raw.replace(SEO_STATS_REGEX, '');
      if (newContent === raw) { changes.push({path: f.path, removed:false, reason:'no seo-stats found'}); continue; }
      if (dry_run) { changes.push({path: f.path, removed:true, reason:'dry-run'}); continue; }
      // Create blob
      const blob = await gh(token, `/repos/${owner}/${repo}/git/blobs`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({content: b64encode(newContent), encoding:'base64'})
      }) as any;
      blobs.push({path: f.path, sha: blob.sha});
      changes.push({path: f.path, removed:true});
    }
    if (dry_run || blobs.length === 0) {
      return new Response(JSON.stringify({success:true, dry_run, changes, total: blobs.length}), {status:200, headers:{'Content-Type':'application/json'}});
    }
    // 2. Get HEAD
    const ref = await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`) as any;
    const headSha = ref.object.sha;
    const headCommit = await gh(token, `/repos/${owner}/${repo}/git/commits/${headSha}`) as any;
    // 3. New tree with all changed blobs
    const tree = blobs.map(b => ({path: b.path, mode:'100644', type:'blob', sha: b.sha}));
    const newTree = await gh(token, `/repos/${owner}/${repo}/git/trees`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({base_tree: headCommit.tree.sha, tree})
    }) as any;
    // 4. New commit
    const newCommit = await gh(token, `/repos/${owner}/${repo}/git/commits`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        message: `feat(prestations): purge bandeau .seo-stats hardcoded (délais + MaPrimeAdapt non valable hors PMR) — ${blobs.length} pages`,
        tree: newTree.sha,
        parents: [headSha]
      })
    }) as any;
    // 5. Update ref
    await gh(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({sha: newCommit.sha, force:false})
    });
    return new Response(JSON.stringify({
      success:true,
      commit_sha: newCommit.sha,
      commit_url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
      pages_purged: blobs.length,
      changes
    }), {status:200, headers:{'Content-Type':'application/json'}});
  } catch(e) {
    return new Response(JSON.stringify({error: (e as Error).message}), {status:500, headers:{'Content-Type':'application/json'}});
  }
});
