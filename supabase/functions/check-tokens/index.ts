// ═══════════════════════════════════════════════════════════════
// Edge Function : check-tokens
// Vérifie la validité des tokens API (Meta, LinkedIn, GBP)
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy check-tokens --no-verify-jwt
// Peut être appelée manuellement ou via cron Supabase (1x/jour)
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
};

interface TokenHealth {
  ok: boolean;
  expires_in_days?: number | null;
  error?: string;
  checked_at: string;
}

// Helpers pour signer un JWT RS256 avec une clé privée PEM (service account Google)
function base64UrlEncode(input: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof input === "string"
    ? new TextEncoder().encode(input)
    : input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore Deno btoa
  return btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToBinary(pem: string): Uint8Array {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s+/g, "");
  // @ts-ignore Deno atob
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

async function signGoogleJwt(sa: { client_email: string; private_key: string }, scope: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimsB64 = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${headerB64}.${claimsB64}`;
  const keyData = pemToBinary(sa.private_key);
  // @ts-ignore Deno crypto
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  // @ts-ignore Deno crypto
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64UrlEncode(sig)}`;
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

    // Si on a un body JSON {service: "meta"}, on ne teste que ce service-là (pour bouton Tester ciblé)
    let onlyService: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        onlyService = body?.service || null;
      } catch (_) {}
    }
    const url = new URL(req.url);
    if (!onlyService) onlyService = url.searchParams.get("service");
    const shouldTest = (key: string) => !onlyService || onlyService === key;

    const { data: settings } = await sb.from("app_settings").select("*");
    const byKey: Record<string, any> = {};
    (settings || []).forEach((s: any) => byKey[s.key] = s.value || {});

    const health: Record<string, TokenHealth> = {};
    const now = new Date().toISOString();

    // ─── META (FB + IG) ───
    if (shouldTest("meta") && byKey.meta?.page_access_token) {
      try {
        const r = await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${byKey.meta.page_access_token}&access_token=${byKey.meta.page_access_token}`);
        const d = await r.json();
        if (d.data?.is_valid) {
          const expiresAt = d.data.expires_at;
          const days = expiresAt ? Math.floor((expiresAt * 1000 - Date.now()) / 86400000) : null;
          health.meta = { ok: true, expires_in_days: days, checked_at: now };
        } else {
          health.meta = { ok: false, error: d.data?.error?.message || "Token invalide", checked_at: now };
        }
      } catch (e: any) { health.meta = { ok: false, error: e.message, checked_at: now }; }
    }

    // ─── LinkedIn ───
    if (shouldTest("linkedin") && byKey.linkedin?.access_token) {
      try {
        const r = await fetch("https://api.linkedin.com/v2/me", {
          headers: { "Authorization": `Bearer ${byKey.linkedin.access_token}` }
        });
        health.linkedin = r.ok
          ? { ok: true, expires_in_days: null, checked_at: now }
          : { ok: false, error: `HTTP ${r.status}`, checked_at: now };
      } catch (e: any) { health.linkedin = { ok: false, error: e.message, checked_at: now }; }
    }

    // ─── GBP (refresh token = source de vérité, on tente un refresh) ───
    if (shouldTest("gbp") && byKey.gbp?.refresh_token && byKey.gbp?.client_id && byKey.gbp?.client_secret) {
      try {
        const r = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: byKey.gbp.client_id,
            client_secret: byKey.gbp.client_secret,
            refresh_token: byKey.gbp.refresh_token,
            grant_type: "refresh_token"
          })
        });
        const d = await r.json();
        if (d.access_token) {
          // Mémorise le nouveau token
          await sb.from("app_settings").update({
            value: { ...byKey.gbp, access_token: d.access_token }
          }).eq("key", "gbp");
          health.gbp = { ok: true, expires_in_days: null, checked_at: now };
        } else {
          health.gbp = { ok: false, error: d.error_description || d.error || "refresh failed", checked_at: now };
        }
      } catch (e: any) { health.gbp = { ok: false, error: e.message, checked_at: now }; }
    } else if (shouldTest("gbp") && byKey.gbp?.access_token) {
      // Fallback : ping tokeninfo
      try {
        const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${byKey.gbp.access_token}`);
        const d = await r.json();
        if (d.expires_in) {
          const days = Math.floor(parseInt(d.expires_in, 10) / 86400);
          health.gbp = { ok: true, expires_in_days: days, checked_at: now };
        } else {
          health.gbp = { ok: false, error: d.error_description || "Token expiré", checked_at: now };
        }
      } catch (e: any) { health.gbp = { ok: false, error: e.message, checked_at: now }; }
    }

    // ─── GA4 (Analytics Data API) ───
    if (shouldTest("ga4") && byKey.ga4?.property_id && (byKey.ga4?.service_account_json || byKey.ga4?.service_account_key)) {
      try {
        // Décode le service account JSON (accepte service_account_json ou service_account_key)
        const rawJson = byKey.ga4.service_account_json || byKey.ga4.service_account_key;
        let sa: any;
        try {
          sa = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
        } catch (_) {
          health.ga4 = { ok: false, error: "service_account_json n'est pas un JSON valide", checked_at: now };
        }
        if (sa?.client_email && sa?.private_key) {
          // Génère un JWT signé pour obtenir un access token Google
          const jwtToken = await signGoogleJwt(sa, "https://www.googleapis.com/auth/analytics.readonly");
          const tokRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
              assertion: jwtToken
            })
          });
          const tokJson = await tokRes.json();
          if (tokJson.access_token) {
            // Ping minimaliste sur la property
            const pingRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${byKey.ga4.property_id}/metadata`, {
              headers: { "Authorization": `Bearer ${tokJson.access_token}` }
            });
            health.ga4 = pingRes.ok
              ? { ok: true, expires_in_days: null, checked_at: now }
              : { ok: false, error: `HTTP ${pingRes.status} sur metadata — Property ID correct ?`, checked_at: now };
          } else {
            health.ga4 = { ok: false, error: tokJson.error_description || "Échec auth service account", checked_at: now };
          }
        }
      } catch (e: any) { health.ga4 = { ok: false, error: e.message, checked_at: now }; }
    }

    // ─── Anthropic (test minimaliste) ───
    if (shouldTest("anthropic") && byKey.anthropic?.api_key) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": byKey.anthropic.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: byKey.anthropic.model || "claude-haiku-4-5-20251001",
            max_tokens: 5,
            messages: [{ role: "user", content: "ping" }]
          })
        });
        health.anthropic = r.ok
          ? { ok: true, expires_in_days: null, checked_at: now }
          : { ok: false, error: `HTTP ${r.status}`, checked_at: now };
      } catch (e: any) { health.anthropic = { ok: false, error: e.message, checked_at: now }; }
    }

    // Stocker le résultat dans app_settings.token_health
    await sb.from("app_settings").upsert({
      key: "token_health",
      value: { ...health, last_check: now },
      updated_by: user.email
    }, { onConflict: "key" });

    return json({ success: true, health });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
