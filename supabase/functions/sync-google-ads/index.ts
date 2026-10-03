// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// sync-google-ads V3 — auto-détection version API (essaye v21, v20, v19, v18)
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } });

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "google_ads").maybeSingle();
    const cfg = settings?.value || {};
    if (!cfg.configured) return json({ mode: "stub" });

    // 1. Refresh access_token
    const tokenBody = new URLSearchParams({
      client_id: cfg.client_id, client_secret: cfg.client_secret,
      refresh_token: cfg.refresh_token, grant_type: "refresh_token"
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString()
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return json({ stage: "oauth", error: tokenData }, 401);

    const customerId = (cfg.customer_id as string).replace(/-/g, "");
    const managerId = (cfg.manager_id as string).replace(/-/g, "");

    // 2. Auto-détection version : essayer v21, v20, v19, v18
    const versions = ["v21", "v20", "v19", "v18"];
    const gaql = `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value, segments.date FROM campaign WHERE segments.date DURING LAST_30_DAYS`;

    let workingVersion: string | null = null;
    let lastError: any = null;
    let adsData: any = null;

    for (const v of versions) {
      const r = await fetch(
        `https://googleads.googleapis.com/${v}/customers/${customerId}/googleAds:search`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "developer-token": cfg.developer_token,
            "login-customer-id": managerId,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query: gaql })
        }
      );
      const raw = await r.text();
      if (r.status === 404) { lastError = { status: 404, version: v }; continue; }
      try {
        const parsed = JSON.parse(raw);
        if (r.ok && !parsed.error) {
          workingVersion = v;
          adsData = parsed;
          break;
        }
        lastError = { status: r.status, version: v, body: parsed };
        // Si erreur 400/401/403 c'est pas une question de version, on stoppe
        if ([400, 401, 403].includes(r.status)) break;
      } catch {
        lastError = { status: r.status, version: v, html: raw.slice(0, 300) };
      }
    }

    if (!workingVersion) {
      await sb.from("app_settings").update({
        value: { ...cfg, last_sync_at: new Date().toISOString(), last_sync_status: "version_or_api_error", last_sync_error: JSON.stringify(lastError).slice(0, 500) }
      }).eq("key", "google_ads");
      return json({ stage: "version_detection", versions_tried: versions, last_error: lastError }, 502);
    }

    // 3. Persister résultats
    const campaignMap = new Map<string, any>();
    const metricsRows: any[] = [];
    for (const row of (adsData.results || [])) {
      const c = row.campaign, b = row.campaignBudget, m = row.metrics;
      const date = row.segments?.date;
      if (c && !campaignMap.has(c.id)) {
        campaignMap.set(c.id, {
          google_campaign_id: c.id, name: c.name, status: c.status,
          type: c.advertisingChannelType,
          daily_budget_eur: b ? Number(b.amountMicros) / 1_000_000 : null,
          synced_at: new Date().toISOString()
        });
      }
      if (date && m && c) {
        metricsRows.push({
          _gid: c.id, date,
          impressions: Number(m.impressions || 0),
          clicks: Number(m.clicks || 0),
          cost_eur: Number(m.costMicros || 0) / 1_000_000,
          conversions: Number(m.conversions || 0),
          conversion_value_eur: Number(m.conversionsValue || 0)
        });
      }
    }

    const campArr = Array.from(campaignMap.values());
    if (campArr.length) await sb.from("google_ads_campaigns").upsert(campArr, { onConflict: "google_campaign_id" });

    const { data: campIds } = await sb.from("google_ads_campaigns").select("id,google_campaign_id");
    const idMap = new Map<string, string>();
    (campIds || []).forEach((r: any) => idMap.set(r.google_campaign_id, r.id));

    const metricsArr = metricsRows.map((m: any) => ({
      campaign_id: idMap.get(m._gid),
      date: m.date,
      impressions: m.impressions, clicks: m.clicks,
      cost_eur: m.cost_eur, conversions: m.conversions,
      conversion_value_eur: m.conversion_value_eur
    })).filter((m: any) => m.campaign_id);
    if (metricsArr.length) await sb.from("google_ads_metrics_daily").upsert(metricsArr, { onConflict: "campaign_id,date" });

    await sb.from("app_settings").update({
      value: { ...cfg, last_sync_at: new Date().toISOString(), last_sync_status: "success", last_sync_error: null, api_version: workingVersion }
    }).eq("key", "google_ads");

    return json({ success: true, mode: "live", api_version: workingVersion, campaigns: campArr.length, metrics: metricsArr.length, total_rows: (adsData.results || []).length });
  } catch (e) {
    return json({ stage: "exception", error: (e as Error).message }, 500);
  }
});
