// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// pipeline-health-check v6 — retrait du GITHUB_TOKEN_FALLBACK hardcodé.
//
// v6 (2026-07-25) : SECURITE. Aucun secret en dur. Lecture stricte Deno.env.get.
//   Si GITHUB_TOKEN absent → la section github est skip avec message clair,
//   et une alerte WARN est remontée (pas critical, mais visible).
//   Voir docs/GUIDE-SECRETS-CONFIGURATION.md pour la configuration.
//
// v5 (2026-07-20) : monitoring GA4
// v4 (2026-07-20) : monitoring Meta
// v3 (12/06/2026) : anti-spam email 24h
//
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GITHUB_OWNER = 'floriian62500-code';
const GITHUB_REPO  = 'site-help-confort';
const NETLIFY_SITE_ID = 'remarkable-dragon-364e2b';

const ALERT_DEDUP_WINDOW_MS = 24 * 3600 * 1000;

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN'); // v6 : STRICTEMENT env, plus de fallback
  const report: any = { timestamp: new Date().toISOString(), github:{}, netlify:{}, gbp:{}, meta:{}, ga4:{}, sync_reviews:{}, sync_facebook_posts:{}, alerts: [] };

  // 1. GitHub HEAD (skip proprement si pas de token)
  if (!GITHUB_TOKEN) {
    report.github = { skipped: true, reason: 'GITHUB_TOKEN non configuré (voir docs/GUIDE-SECRETS-CONFIGURATION.md)' };
  } else {
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/main`, {
        headers: { Authorization: 'Bearer ' + GITHUB_TOKEN, Accept: 'application/vnd.github+json' }
      });
      if (r.ok) {
        const d = await r.json();
        report.github = { sha: d.sha.slice(0,7), date: d.commit.author.date,
          age_min: Math.floor((Date.now() - new Date(d.commit.author.date).getTime()) / 60000) };
      } else if (r.status === 401) {
        report.github = { error: 'GITHUB_TOKEN révoqué ou invalide (401)', status: 401 };
      } else {
        report.github = { error: `GitHub API status ${r.status}` };
      }
    } catch (e: any) { report.github.error = e.message; }
  }

  // 2. Netlify last deploy
  try {
    const tok = Deno.env.get('NETLIFY_TOKEN');
    if (!tok) {
      report.netlify = { skipped: true, reason: 'NETLIFY_TOKEN non configuré' };
    } else {
      const r = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys?per_page=1`, {
        headers: { Authorization: 'Bearer ' + tok }
      });
      if (r.ok) {
        const d = await r.json();
        if (d[0]) report.netlify = { id: d[0].id?.slice(0,10), state: d[0].state, ref: d[0].commit_ref?.slice(0,7),
          age_min: Math.floor((Date.now() - new Date(d[0].published_at || d[0].created_at).getTime())/60000) };
      }
    }
  } catch (e: any) { report.netlify.error = e.message; }

  // 3. GBP refresh_token check (inchangé)
  try {
    const { data: row } = await sb.from('app_settings').select('value').eq('key','gbp').single();
    const cfg: any = row?.value || {};
    if (cfg.refresh_token && cfg.client_id && cfg.client_secret) {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: cfg.client_id, client_secret: cfg.client_secret, refresh_token: cfg.refresh_token, grant_type: 'refresh_token' })
      });
      const d = await r.json();
      report.gbp = { refresh_ok: !!d.access_token, account_id_valid: cfg.account_id_audo && !cfg.account_id_audo.includes('123456789') };
      if (!d.access_token) report.gbp.error = d.error_description || d.error;
    } else report.gbp = { refresh_ok: false, error: 'config incomplete' };
  } catch (e: any) { report.gbp.error = e.message; }

  // 4. Meta / Facebook Page Token check
  try {
    const { data: row } = await sb.from('app_settings').select('value,updated_at').eq('key','meta').single();
    const cfg: any = row?.value || {};
    const refreshedAt = cfg.token_refreshed_at ? new Date(cfg.token_refreshed_at) : null;
    const ageMs = refreshedAt ? (Date.now() - refreshedAt.getTime()) : null;
    report.meta = {
      has_token: !!cfg.page_access_token,
      has_page_id: !!cfg.fb_page_id,
      token_refreshed_at: cfg.token_refreshed_at || null,
      token_age_days: ageMs !== null ? Math.floor(ageMs / (24*3600*1000)) : null,
      token_source: cfg.token_source || 'unknown',
    };
    if (cfg.page_access_token) {
      const r = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(cfg.page_access_token)}`);
      const d = await r.json();
      if (r.ok && d.id) {
        report.meta.token_ok = true;
        report.meta.page_name = d.name || null;
      } else {
        report.meta.token_ok = false;
        report.meta.error = d.error?.message || 'unknown error';
        report.meta.error_code = d.error?.code || null;
      }
    } else {
      report.meta.token_ok = false;
      report.meta.error = 'Aucun page_access_token configuré';
    }
  } catch (e: any) { report.meta.error = e.message; }

  // 5. GA4 OAuth refresh_token check
  try {
    const { data: row } = await sb.from('app_settings').select('value').eq('key','ga4_oauth').single();
    const cfg: any = row?.value || {};
    report.ga4 = {
      has_refresh_token: !!cfg.refresh_token,
      has_property_id: !!cfg.property_id,
      user_email: cfg.user_email || null,
      obtained_at: cfg.obtained_at || null,
    };
    if (cfg.refresh_token && cfg.client_id && cfg.client_secret) {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: cfg.client_id,
          client_secret: cfg.client_secret,
          refresh_token: cfg.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const d = await r.json();
      report.ga4.refresh_ok = !!d.access_token;
      if (!d.access_token) report.ga4.error = d.error_description || d.error;
    } else {
      report.ga4.refresh_ok = false;
      report.ga4.error = 'config incomplete';
    }
  } catch (e: any) { report.ga4.error = e.message; report.ga4.refresh_ok = false; }

  // 6. Last sync-facebook-posts
  try {
    const { data: last } = await sb.from('realisations')
      .select('title,created_at,created_by')
      .in('created_by', ['cron_fb_sync', 'manual_fb_sync'])
      .order('created_at', { ascending: false })
      .limit(1);
    if (last && last[0]) {
      const ageH = Math.floor((Date.now() - new Date(last[0].created_at).getTime())/3600000);
      report.sync_facebook_posts = {
        last_created: last[0].created_at,
        last_title: last[0].title?.slice(0, 60),
        age_hours: ageH,
        age_days: Math.floor(ageH / 24),
      };
    } else {
      report.sync_facebook_posts = { error: 'aucune réalisation importée depuis FB' };
    }
  } catch (e: any) { report.sync_facebook_posts.error = e.message; }

  // 7. Last review sync
  try {
    const { data: rev } = await sb.from('reviews').select('created_at,updated_at').order('updated_at', { ascending: false }).limit(1);
    if (rev && rev[0]) {
      report.sync_reviews = { last_updated: rev[0].updated_at,
        age_hours: Math.floor((Date.now() - new Date(rev[0].updated_at).getTime())/3600000) };
    }
  } catch (e: any) { report.sync_reviews.error = e.message; }

  // 8. Règles alertes
  if (report.github.error && report.github.status === 401) {
    report.alerts.push({ level: 'CRITICAL', msg: `GITHUB_TOKEN révoqué → regen + Supabase Secret (docs/GUIDE-SECRETS-CONFIGURATION.md)` });
  }
  if (report.github.skipped) {
    report.alerts.push({ level: 'WARN', msg: `GITHUB_TOKEN non configuré → impossible de monitorer désync GitHub ↔ Netlify` });
  }
  if (report.netlify.age_min && report.netlify.age_min > 1440) report.alerts.push({ level: 'WARN', msg: `Netlify dernier deploy il y a ${Math.floor(report.netlify.age_min/60)}h` });
  if (report.github.age_min && report.github.age_min > 4320) report.alerts.push({ level: 'INFO', msg: `GitHub dernier commit il y a ${Math.floor(report.github.age_min/60)}h` });
  if (report.github.sha && report.netlify.ref && report.github.sha !== report.netlify.ref) report.alerts.push({ level: 'CRITICAL', msg: `Désync GitHub HEAD (${report.github.sha}) ≠ Netlify deploy (${report.netlify.ref})` });
  if (report.gbp.refresh_ok === false) report.alerts.push({ level: 'CRITICAL', msg: `GBP OAuth cassé : ${report.gbp.error || 'unknown'}` });
  if (report.gbp.account_id_valid === false) report.alerts.push({ level: 'WARN', msg: 'GBP account_id encore placeholder' });
  if (report.sync_reviews.age_hours && report.sync_reviews.age_hours > 24) report.alerts.push({ level: 'WARN', msg: `Sync avis : ${report.sync_reviews.age_hours}h sans update` });

  if (report.meta.token_ok === false) {
    report.alerts.push({ level: 'CRITICAL', msg: `Meta Page Token cassé : ${report.meta.error || 'unknown'} → wizard-meta.html` });
  } else if (report.meta.token_age_days && report.meta.token_age_days > 45 && report.meta.token_source !== 'system_user_never_expires') {
    report.alerts.push({ level: 'WARN', msg: `Meta Page Token âgé de ${report.meta.token_age_days}j → migre vers System User Token` });
  }
  if (report.sync_facebook_posts.age_days && report.sync_facebook_posts.age_days > 7) {
    report.alerts.push({
      level: report.sync_facebook_posts.age_days > 14 ? 'CRITICAL' : 'WARN',
      msg: `Sync FB : dernier chantier importé il y a ${report.sync_facebook_posts.age_days}j`
    });
  }
  if (report.ga4.refresh_ok === false) {
    report.alerts.push({ level: 'CRITICAL', msg: `GA4 OAuth cassé : ${report.ga4.error || 'unknown'} → /admin-pro/oauth-ga4.html` });
  }

  // 9. Persist + email dedup 24h (inchangé v5)
  await sb.from('pipeline_health_reports').insert({
    report,
    alert_count: report.alerts.length,
    has_critical: report.alerts.some((a: any) => a.level === 'CRITICAL'),
  });

  const critical = report.alerts.filter((a: any) => a.level === 'CRITICAL');
  if (critical.length > 0) {
    const sinceIso = new Date(Date.now() - ALERT_DEDUP_WINDOW_MS).toISOString();
    const { count } = await sb.from('pipeline_health_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sinceIso)
      .eq('has_critical', true);
    if ((count || 0) <= 1) {
      const KEY = Deno.env.get('RESEND_API_KEY');
      if (KEY) {
        const html = `<h2>🚨 Alerte pipeline HELP Confort</h2><p>${critical.length} problème(s) :</p><ul>${critical.map((a: any)=>`<li>${a.msg}</li>`).join('')}</ul><p><a href="https://www.depan59-62.fr/admin-pro">Back-office</a></p><pre style="font-size:11px;background:#f5f5f5;padding:10px">${JSON.stringify(report, null, 2)}</pre>`;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Monitoring HC <noreply@depan59-62.fr>',
            to: ['florian.dhaillecourt@helpconfort.com'],
            subject: `[ALERT] ${critical[0].msg.slice(0,60)}`,
            html
          })
        });
      }
    }
  }

  return new Response(JSON.stringify(report, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
