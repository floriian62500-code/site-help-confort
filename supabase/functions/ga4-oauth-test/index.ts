// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: row } = await sb.from('app_settings').select('value').eq('key','ga4_oauth').single();
  const cfg: any = row?.value || {};
  if (!cfg.refresh_token || !cfg.client_id || !cfg.client_secret) {
    return new Response(JSON.stringify({ error: 'config ga4_oauth incomplete', has: Object.keys(cfg) }), { status: 400, headers: {'Content-Type':'application/json'} });
  }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      refresh_token: cfg.refresh_token,
      grant_type: 'refresh_token'
    }).toString()
  });
  const tj = await r.json();
  if (!tj.access_token) {
    return new Response(JSON.stringify({
      step: 'refresh_token_failed',
      status: r.status,
      error: tj
    }), { status: 200, headers: {'Content-Type':'application/json'} });
  }
  // Test appel GA4 avec property_id
  const propId = cfg.property_id || (await sb.from('app_settings').select('value').eq('key','ga4').single()).data?.value?.property_id;
  const gr = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + tj.access_token, 'Content-Type':'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }]
    })
  });
  const gj = await gr.json();
  return new Response(JSON.stringify({
    step: 'complete',
    refresh_ok: true,
    property_id: propId,
    ga4_status: gr.status,
    ga4_error: gj.error || null,
    ga4_data_sample: gj.rows?.[0]?.metricValues || null,
    user_email: cfg.user_email
  }, null, 2), { status: 200, headers: {'Content-Type':'application/json'} });
});