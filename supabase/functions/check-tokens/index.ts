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

    const { data: settings } = await sb.from("app_settings").select("*");
    const byKey: Record<string, any> = {};
    (settings || []).forEach((s: any) => byKey[s.key] = s.value || {});

    const health: Record<string, TokenHealth> = {};
    const now = new Date().toISOString();

    // ─── META (FB + IG) ───
    if (byKey.meta?.page_access_token) {
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
    if (byKey.linkedin?.access_token) {
      try {
        const r = await fetch("https://api.linkedin.com/v2/me", {
          headers: { "Authorization": `Bearer ${byKey.linkedin.access_token}` }
        });
        health.linkedin = r.ok
          ? { ok: true, expires_in_days: null, checked_at: now }
          : { ok: false, error: `HTTP ${r.status}`, checked_at: now };
      } catch (e: any) { health.linkedin = { ok: false, error: e.message, checked_at: now }; }
    }

    // ─── GBP ───
    if (byKey.gbp?.access_token) {
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

    // ─── Anthropic (test minimaliste) ───
    if (byKey.anthropic?.api_key) {
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
