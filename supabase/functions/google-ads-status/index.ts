// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// google-ads-status — retourne KPI + campagnes + alertes en lecture seule (anon-friendly)
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

// @ts-ignore
Deno.serve(async (_req: Request) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    // 1. Config (sans secrets)
    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "google_ads").maybeSingle();
    const cfg = settings?.value || {};
    const safeCfg = {
      configured: !!cfg.configured,
      customer_id: cfg.customer_id || null,
      manager_id: cfg.manager_id || null,
      access_level: cfg.access_level || null,
      monthly_cap_eur: cfg.monthly_cap_eur || 1500,
      daily_cap_eur: cfg.daily_cap_eur || 50,
      lsa_enabled: !!cfg.lsa_enabled,
      lsa_profile_status: cfg.lsa_profile_status || "not_started",
      last_sync_at: cfg.last_sync_at || null,
      last_sync_status: cfg.last_sync_status || null,
      api_version: cfg.api_version || null
    };

    // 2. Campagnes
    const { data: campaigns } = await sb.from("google_ads_campaigns").select("*").order("synced_at", { ascending: false });

    // 3. Métriques 30 derniers jours
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: metrics } = await sb.from("google_ads_metrics_daily")
      .select("campaign_id,date,impressions,clicks,cost_eur,conversions,conversion_value_eur")
      .gte("date", since.toISOString().slice(0, 10));

    const m = metrics || [];
    const totalSpend = m.reduce((s: number, r: any) => s + Number(r.cost_eur || 0), 0);
    const totalLeads = m.reduce((s: number, r: any) => s + Number(r.conversions || 0), 0);
    const totalImpr = m.reduce((s: number, r: any) => s + Number(r.impressions || 0), 0);
    const totalClicks = m.reduce((s: number, r: any) => s + Number(r.clicks || 0), 0);
    const totalValue = m.reduce((s: number, r: any) => s + Number(r.conversion_value_eur || 0), 0);
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : null;
    const roas = totalSpend > 0 ? totalValue / totalSpend : null;
    const ctr = totalImpr > 0 ? totalClicks / totalImpr : null;

    // 4. Alertes non acquittées
    const { data: alerts } = await sb.from("google_ads_alerts")
      .select("*").is("acknowledged_at", null).order("created_at", { ascending: false }).limit(10);

    return json({
      success: true,
      config: safeCfg,
      kpi: {
        spend_eur: Number(totalSpend.toFixed(2)),
        leads: Math.round(totalLeads),
        cpl_eur: cpl != null ? Number(cpl.toFixed(2)) : null,
        roas: roas != null ? Number(roas.toFixed(2)) : null,
        impressions: totalImpr,
        clicks: totalClicks,
        ctr: ctr != null ? Number((ctr * 100).toFixed(2)) : null
      },
      cap: {
        monthly_eur: safeCfg.monthly_cap_eur,
        pct: Math.min(100, (totalSpend / safeCfg.monthly_cap_eur) * 100)
      },
      campaigns: campaigns || [],
      metrics: m,
      alerts: alerts || []
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
