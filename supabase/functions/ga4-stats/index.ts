// ═══════════════════════════════════════════════════════════════
// Edge Function : ga4-stats
// Récupère les stats GA4 via Google Analytics Data API
// Auth via service account JSON (stocké dans app_settings.ga4)
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy ga4-stats --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

// ─── JWT signer pour Google Service Account (RS256) ───
function base64url(input: string | ArrayBuffer): string {
  let str: string;
  if (typeof input === "string") str = btoa(input);
  else {
    const bytes = new Uint8Array(input);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    str = btoa(bin);
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const header = { alg: "RS256", typ: "JWT", kid: serviceAccount.private_key_id };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };
  const headerB64 = base64url(JSON.stringify(header));
  const claimB64 = base64url(JSON.stringify(claim));
  const signInput = headerB64 + "." + claimB64;

  const keyBuffer = pemToArrayBuffer(serviceAccount.private_key);
  const key = await crypto.subtle.importKey(
    "pkcs8", keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signInput));
  const jwt = signInput + "." + base64url(sig);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Token failed: " + JSON.stringify(tokenData));
  return tokenData.access_token;
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);
    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "ga4").single();
    const cfg = settings?.value;
    if (!cfg?.property_id || !cfg?.service_account_json) {
      return json({ error: "GA4 non configuré — voir Paramètres → Google Analytics 4" }, 400);
    }

    let serviceAccount: any;
    try {
      serviceAccount = typeof cfg.service_account_json === "string"
        ? JSON.parse(cfg.service_account_json)
        : cfg.service_account_json;
    } catch {
      return json({ error: "Service Account JSON invalide" }, 400);
    }

    const accessToken = await getGoogleAccessToken(serviceAccount);
    const { period } = (await req.json().catch(() => ({}))) || {};
    const days = period === "30d" ? 30 : 7;

    // KPI principal
    const reportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${cfg.property_id}:runReport`;
    const reportBody = {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" }
      ]
    };
    const r = await fetch(reportUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(reportBody)
    });
    const d = await r.json();
    if (!r.ok) return json({ error: "GA4 API: " + (d.error?.message || JSON.stringify(d).slice(0,200)) }, 500);

    const row = d.rows?.[0]?.metricValues || [];
    const kpi = {
      sessions: parseInt(row[0]?.value || "0", 10),
      users: parseInt(row[1]?.value || "0", 10),
      page_views: parseInt(row[2]?.value || "0", 10),
      avg_duration_sec: Math.round(parseFloat(row[3]?.value || "0")),
      bounce_rate_pct: Math.round(parseFloat(row[4]?.value || "0") * 100)
    };

    // Top pages
    const topPagesRes = await fetch(reportUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10
      })
    });
    const topPagesData = await topPagesRes.json();
    const top_pages = (topPagesData.rows || []).map((row: any) => ({
      path: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value, 10)
    }));

    // Sources de trafic
    const sourcesRes = await fetch(reportUrl, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10
      })
    });
    const sourcesData = await sourcesRes.json();
    const top_sources = (sourcesData.rows || []).map((row: any) => ({
      source: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value, 10)
    }));

    return json({ success: true, period: `${days}d`, kpi, top_pages, top_sources });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
