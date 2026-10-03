// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// resend-status-check — check d'un email_id Resend pour voir delivered/bounced/etc
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { email_id } = await req.json();
  if (!email_id) return new Response(JSON.stringify({error:'email_id required'}), {status:400});
  const KEY = Deno.env.get('RESEND_API_KEY');
  if (!KEY) return new Response(JSON.stringify({error:'RESEND_API_KEY missing'}), {status:500});
  const r = await fetch('https://api.resend.com/emails/' + encodeURIComponent(email_id), {
    headers: { 'Authorization': 'Bearer ' + KEY }
  });
  const data = await r.json();
  return new Response(JSON.stringify({ status_code: r.status, resend: data }, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
