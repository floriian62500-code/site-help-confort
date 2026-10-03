// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// gbp-fix-account — refresh GBP token + récupère vrai account_id + locations + update app_settings
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await sb.from('app_settings').select('value').eq('key','gbp').single();
  const cfg: any = row?.value || {};
  if (!cfg.refresh_token || !cfg.client_id || !cfg.client_secret) {
    return json({error:'missing gbp config', has_refresh: !!cfg.refresh_token});
  }
  // 1. Refresh access_token
  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.client_id, client_secret: cfg.client_secret,
      refresh_token: cfg.refresh_token, grant_type: 'refresh_token'
    })
  });
  const tokData = await tokRes.json();
  if (!tokData.access_token) return json({error:'refresh failed', details: tokData});
  const accessToken = tokData.access_token;
  // 2. List accounts
  const acctRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const acctData = await acctRes.json();
  if (!acctData.accounts || !acctData.accounts.length) return json({error:'no accounts', details:acctData});
  const account = acctData.accounts[0];
  // 3. List locations for that account
  const locRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`, {
    headers: { Authorization: 'Bearer ' + accessToken }
  });
  const locData = await locRes.json();
  const locations = locData.locations || [];
  // 4. Update app_settings
  const updates: any = {
    ...cfg,
    access_token: accessToken,
    account_id_audo: account.name,
    accounts_list: acctData.accounts.map((a:any)=>({name:a.name, accountName:a.accountName, type:a.type})),
    locations_discovered: locations.map((l:any)=>({name:l.name, title:l.title, city:l.storefrontAddress?.locality})),
  };
  // Heuristic : map locations to st_omer / dk
  locations.forEach((l:any) => {
    const city = (l.storefrontAddress?.locality || '').toLowerCase();
    if (city.includes('saint-omer') || city.includes('martin-lez-tatinghem') || city.includes('tatinghem')) {
      updates.location_id_st_omer = l.name;
    } else if (city.includes('dunkerque')) {
      updates.location_id_dk = l.name;
    }
  });
  await sb.from('app_settings').update({ value: updates }).eq('key','gbp');
  return json({
    success: true,
    account: account.name,
    accountName: account.accountName,
    accounts_count: acctData.accounts.length,
    locations_count: locations.length,
    locations: updates.locations_discovered,
    location_id_st_omer: updates.location_id_st_omer,
    location_id_dk: updates.location_id_dk,
  });
});
function json(d:any,s=200){return new Response(JSON.stringify(d,null,2),{status:s,headers:{'Content-Type':'application/json'}});}
