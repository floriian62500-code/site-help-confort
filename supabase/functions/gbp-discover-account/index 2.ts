// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// HELP Confort — gbp-discover-account V2 (self-auth interne)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};
async function refreshGoogleToken(cfg: any) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.client_id || "",
      client_secret: cfg.client_secret || "",
      refresh_token: cfg.refresh_token,
      grant_type: "refresh_token"
    })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Refresh failed: " + JSON.stringify(data).slice(0, 300));
  return data.access_token;
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    // V2 : auth interne via SUPABASE_SERVICE_ROLE_KEY (env), bypass RLS
    const sbServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, sbServiceKey, { auth: { persistSession: false } });

    const { data: setting } = await sb.from("app_settings").select("value").eq("key", "gbp").single();
    const cfg = setting?.value || {};
    if (!cfg.refresh_token) return json({ error: "refresh_token GBP manquant dans app_settings.gbp" }, 400);

    const token = await refreshGoogleToken(cfg);

    const accountsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!accountsRes.ok) {
      const txt = await accountsRes.text();
      return json({ error: "GBP API accounts: HTTP " + accountsRes.status, detail: txt.slice(0, 500) }, 500);
    }
    const accountsData = await accountsRes.json();
    const accounts = accountsData.accounts || [];

    const summary: any[] = [];
    for (const acc of accounts) {
      const accId = acc.name;
      try {
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${accId}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );
        const locData = await locRes.json();
        summary.push({
          account_id: accId,
          account_name: acc.accountName || acc.organizationInfo?.registeredDomain || "",
          type: acc.type || "",
          locations: (locData.locations || []).map((l: any) => ({
            name: l.name, title: l.title,
            city: l.storefrontAddress?.locality || "",
            address: (l.storefrontAddress?.addressLines || []).join(", ")
          }))
        });
      } catch (e: any) {
        summary.push({ account_id: accId, error: e.message });
      }
    }

    let auto_updated = false;
    if (summary.length >= 1 && summary[0].locations.length > 0) {
      const accId = summary[0].account_id;
      const locs = summary[0].locations;
      const updates: any = { ...cfg, account_id_audo: accId, access_token: token };
      for (const l of locs) {
        const city = (l.city || "").toLowerCase();
        if (city.includes("saint-omer") || city.includes("st-omer") || city.includes("tatinghem")) {
          updates.location_id_st_omer = l.name;
        } else if (city.includes("dunkerque") || city.includes("dk")) {
          updates.location_id_dk = l.name;
        }
      }
      await sb.from("app_settings").update({ value: updates }).eq("key", "gbp");
      auto_updated = true;
    }

    return json({ success: true, auto_updated, accounts: summary });
  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, "content-type": "application/json" } });
}
