// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// html-script-check : valide chaque <script> inline d'une page HTML du repo
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || 'admin-pro/paiements.html';
  const branch = url.searchParams.get('branch') || 'main';
  const ghUrl = `https://raw.githubusercontent.com/floriian62500-code/site-help-confort/${branch}/${path}?v=${Date.now()}`;
  let body: string;
  try {
    const r = await fetch(ghUrl, {cache:'no-store'});
    if (!r.ok) return new Response(JSON.stringify({error:'fetch failed', status:r.status, url: ghUrl}), {status:200, headers:{'Content-Type':'application/json'}});
    body = await r.text();
  } catch(e) {
    return new Response(JSON.stringify({error:'fetch error', detail: String(e)}), {status:200, headers:{'Content-Type':'application/json'}});
  }
  // Extrait chaque <script>...</script> inline (pas src=...)
  const scripts: Array<{idx:number, line_start:number, ok:boolean, error?:string, context?:string}> = [];
  const lines = body.split('\n');
  let inScript = false;
  let scriptLines: string[] = [];
  let scriptStartLine = 0;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inScript) {
      const open = l.match(/<script(?!.*\bsrc\b)[^>]*>/i);
      if (open) {
        inScript = true;
        scriptLines = [];
        scriptStartLine = i + 1;
        const after = l.substring(l.indexOf(open[0]) + open[0].length);
        if (after.includes('</script>')) {
          const inner = after.substring(0, after.indexOf('</script>'));
          if (inner.trim()) scriptLines.push(inner);
          inScript = false;
          checkScript(scriptLines.join('\n'), idx++, scriptStartLine);
        } else if (after.trim()) {
          scriptLines.push(after);
        }
      }
    } else {
      if (l.includes('</script>')) {
        const before = l.substring(0, l.indexOf('</script>'));
        if (before.trim()) scriptLines.push(before);
        inScript = false;
        checkScript(scriptLines.join('\n'), idx++, scriptStartLine);
      } else {
        scriptLines.push(l);
      }
    }
  }
  function checkScript(code: string, i: number, ln: number) {
    if (!code.trim()) return;
    try {
      new Function(code);
      scripts.push({idx:i, line_start:ln, ok:true});
    } catch(e) {
      const msg = (e as Error).message;
      const m = msg.match(/(\d+):(\d+)/);
      let context: string | undefined;
      if (m) {
        const codeLines = code.split('\n');
        const cl = parseInt(m[1])-1;
        context = codeLines.slice(Math.max(0, cl-2), cl+3).map((ll, j) => (ln + Math.max(0,cl-2) + j) + ': ' + ll).join('\n');
      }
      scripts.push({idx:i, line_start:ln, ok:false, error: msg, context});
    }
  }
  return new Response(JSON.stringify({
    path, branch,
    total_scripts: scripts.length,
    failed: scripts.filter(s=>!s.ok).length,
    scripts
  }, null, 2), {status:200, headers:{'Content-Type':'application/json'}});
});
