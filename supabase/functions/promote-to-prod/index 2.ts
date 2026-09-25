// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
// 🔴 CAVIARDÉ : la version déployée contient en clair l'identifiant du build hook Netlify de
//    PRODUCTION. Il est déjà présent publiquement dans ce dépôt (tools/.netlify-build-hook,
//    docs/CLAUDE-CODE-HANDOFF.md) depuis juin : à faire tourner côté Netlify.
//
// promote-to-prod v2 — smoke-tests-staging → merge staging → main → ping Netlify
// Body: { token, owner?, repo?, commit_message?, netlify_hook?, skip_smoke?, sb_url?, sb_anon? }
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body: any = {};
  try { body = await req.json(); } catch {}
  const {
    token,
    owner = 'floriian62500-code',
    repo = 'site-help-confort',
    commit_message = `chore(promote): merge staging → main (${new Date().toISOString()})`,
    netlify_hook = Deno.env.get('NETLIFY_BUILD_HOOK_ID') /* caviardé : identifiant à faire tourner */,
    skip_smoke = false,
    sb_url = 'https://btcbjwqiivhpwoszomhg.supabase.co',
    sb_anon,
  } = body;
  if (!token) return new Response(JSON.stringify({ error: 'Missing token (GitHub PAT)' }), { status: 400 });
  const log: any[] = [];
  try {
    // 0. Smoke tests staging (pré-check)
    if (!skip_smoke) {
      const smokeUrl = sb_url + '/functions/v1/smoke-tests-staging';
      const smokeRes = await fetch(smokeUrl, {
        method: 'POST',
        headers: sb_anon ? { 'Authorization': 'Bearer ' + sb_anon, 'apikey': sb_anon } : {},
      });
      const smokeJson = await smokeRes.json().catch(() => ({}));
      log.push({ step: 'smoke_tests_staging', status: smokeRes.status, failed: smokeJson.failed, passed: smokeJson.passed });
      if (!smokeRes.ok || (smokeJson.failed && smokeJson.failed > 0)) {
        return new Response(JSON.stringify({
          error: 'smoke_tests_staging FAILED — promote aborted. Re-run after fix.',
          smoke_summary: smokeJson,
          log,
          hint: 'Pass skip_smoke:true to bypass (NOT recommended).'
        }), { status: 412, headers: { 'Content-Type': 'application/json' } });
      }
    }
    // 1. Compare staging vs main
    const cmpRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/compare/main...staging`, {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    });
    if (!cmpRes.ok) {
      const txt = await cmpRes.text();
      return new Response(JSON.stringify({ error: 'compare failed', status: cmpRes.status, body: txt }), { status: 500 });
    }
    const cmp = await cmpRes.json();
    log.push({ step: 'compare', ahead_by: cmp.ahead_by, behind_by: cmp.behind_by, status: cmp.status });
    if (cmp.ahead_by === 0) {
      return new Response(JSON.stringify({ success: true, no_op: true, message: 'staging identical to main, nothing to promote', log }), { status: 200 });
    }
    // 2. Merge staging → main
    const mergeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/merges`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base: 'main', head: 'staging', commit_message }),
    });
    const mergeJson = await mergeRes.json().catch(() => ({}));
    if (!mergeRes.ok) {
      log.push({ step: 'merge', status: mergeRes.status, body: mergeJson });
      return new Response(JSON.stringify({ error: 'merge failed', log }), { status: 500 });
    }
    log.push({ step: 'merge', sha: mergeJson.sha, status: mergeRes.status });
    // 3. Ping Netlify Build Hook prod
    if (netlify_hook) {
      const nlRes = await fetch(`https://api.netlify.com/build_hooks/${netlify_hook}`, { method: 'POST' });
      log.push({ step: 'netlify_build_hook', status: nlRes.status });
    }
    return new Response(JSON.stringify({
      success: true,
      ahead_by: cmp.ahead_by,
      merge_sha: mergeJson.sha,
      commit_url: `https://github.com/${owner}/${repo}/commit/${mergeJson.sha}`,
      log,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, log }), { status: 500 });
  }
});
