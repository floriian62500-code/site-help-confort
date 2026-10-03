// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// js-syntax-check v2
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || 'assets/hc-widgets.js';
  const branch = url.searchParams.get('branch') || 'staging';
  const ghUrl = `https://raw.githubusercontent.com/floriian62500-code/site-help-confort/${branch}/${path}?v=${Date.now()}`;
  let body: string;
  try {
    const r = await fetch(ghUrl, {cache:'no-store'});
    if (!r.ok) return new Response(JSON.stringify({error:'fetch failed', status:r.status, url: ghUrl}), {status:200, headers:{'Content-Type':'application/json'}});
    body = await r.text();
  } catch(e) {
    return new Response(JSON.stringify({error:'fetch error', detail: String(e)}), {status:200, headers:{'Content-Type':'application/json'}});
  }
  try {
    new Function(body);
    return new Response(JSON.stringify({ok:true, length: body.length, branch, path, line1191: body.split('\n')[1190]?.slice(0,200)}), {status:200, headers:{'Content-Type':'application/json'}});
  } catch(e) {
    const msg = (e as Error).message;
    const m = msg.match(/(\d+):(\d+)/);
    let context: string|null = null;
    if (m){
      const ln = parseInt(m[1])-1;
      const lines = body.split(/\n/);
      context = lines.slice(Math.max(0,ln-3), ln+4).map((l,i)=>(Math.max(0,ln-2)+i)+': '+l).join('\n');
    }
    return new Response(JSON.stringify({ok:false, error: msg, context}), {status:200, headers:{'Content-Type':'application/json'}});
  }
});
