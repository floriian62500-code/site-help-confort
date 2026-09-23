// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// gbp-oauth-callback — callback Google OAuth + auto-discover + sync
// URL : /functions/v1/gbp-oauth-callback?code=XXX  → fait tout sans intervention
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return errPage('Code OAuth manquant', 'Tu as ouvert cette page sans passer par Google ?');

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await sb.from('app_settings').select('value').eq('key','gbp').single();
  const cfg: any = row?.value || {};
  if (!cfg.client_id || !cfg.client_secret) return errPage('Config GBP incomplète', 'client_id ou client_secret manquant en BDD');

  // 1. Exchange code → refresh_token + access_token
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      redirect_uri: 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/gbp-oauth-callback',
      grant_type: 'authorization_code'
    })
  });
  const tokData = await tokRes.json();
  if (!tokData.refresh_token && !tokData.access_token) {
    return errPage('Échange OAuth échoué', JSON.stringify(tokData, null, 2));
  }

  // 2. Sauvegarde
  const updates: any = { ...cfg, access_token: tokData.access_token };
  if (tokData.refresh_token) updates.refresh_token = tokData.refresh_token;

  // 3. Liste accounts + locations
  let acctInfo: any = {};
  try {
    const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: 'Bearer ' + tokData.access_token }
    });
    const accData = await accRes.json();
    if (accData.accounts && accData.accounts.length > 0) {
      const account = accData.accounts[0];
      updates.account_id_audo = account.name;
      updates.accounts_list = accData.accounts.map((a:any)=>({name:a.name,accountName:a.accountName}));
      acctInfo.account = account;

      // Locations
      const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`, {
        headers: { Authorization: 'Bearer ' + tokData.access_token }
      });
      const locData = await locRes.json();
      const locations = locData.locations || [];
      acctInfo.locations = locations.map((l:any)=>({ name:l.name, title:l.title, city:l.storefrontAddress?.locality }));
      locations.forEach((l:any) => {
        const city = (l.storefrontAddress?.locality || '').toLowerCase();
        if (city.includes('saint-omer') || city.includes('tatinghem') || city.includes('lez-tatinghem')) updates.location_id_st_omer = l.name;
        else if (city.includes('dunkerque')) updates.location_id_dk = l.name;
      });
      updates.locations_discovered = acctInfo.locations;
    }
  } catch (e: any) {
    acctInfo.discover_error = e.message;
  }
  await sb.from('app_settings').update({ value: updates }).eq('key','gbp');

  // 4. Page de succès
  return new Response(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>✅ Google Business reconnecté · HELP Confort</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,Inter,sans-serif;background:#F4F7FB;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#fff;max-width:560px;padding:40px 32px;border-radius:18px;box-shadow:0 12px 40px rgba(10,20,40,.10);text-align:center}
.ic{width:80px;height:80px;background:#22C55E;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.4rem;margin:0 auto 18px}
h1{font-size:1.5rem;font-weight:800;color:#0A1428;margin:0 0 8px}
p{color:#475569;line-height:1.6;margin:0 0 10px}
.info{margin-top:24px;padding:16px 20px;background:#F8FAFC;border-radius:12px;text-align:left;font-size:.9rem;line-height:1.7}
.info strong{color:#0A1428}
.btn{display:inline-block;margin-top:20px;padding:13px 26px;background:#0DA0CF;color:#fff;border-radius:11px;text-decoration:none;font-weight:700}
.btn:hover{background:#0884AE}
</style></head>
<body><div class="card">
<div class="ic">✓</div>
<h1>Google Business reconnecté !</h1>
<p>Le refresh_token a été sauvegardé. Tes avis vont se synchroniser automatiquement.</p>
<div class="info">
<strong>Compte détecté :</strong> ${acctInfo.account?.accountName || acctInfo.account?.name || 'aucun'}<br>
<strong>Fiches GBP :</strong> ${acctInfo.locations?.length || 0}<br>
${(acctInfo.locations||[]).map((l:any)=>`• ${l.title || l.name} (${l.city || '?'})`).join('<br>')}
${acctInfo.discover_error ? '<br><br><strong>Avertissement :</strong> ' + acctInfo.discover_error : ''}
</div>
<a href="https://www.depan59-62.fr/admin-pro/reviews.html" class="btn">Voir les avis &rarr;</a>
</div></body></html>`, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
});

function errPage(title: string, body: string) {
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>❌ ${title}</title>
<style>body{font-family:-apple-system,sans-serif;background:#F4F7FB;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.card{background:#fff;max-width:560px;padding:36px;border-radius:18px;text-align:center;box-shadow:0 12px 40px rgba(10,20,40,.1)}
.ic{width:72px;height:72px;background:#EF4444;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 16px}
h1{font-size:1.4rem;color:#0A1428;margin:0 0 8px}
p{color:#475569}
pre{background:#F8FAFC;padding:14px;border-radius:8px;font-size:.78rem;text-align:left;overflow:auto;max-height:200px}</style></head>
<body><div class="card"><div class="ic">⚠️</div><h1>${title}</h1><pre>${body}</pre></div></body></html>`, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
