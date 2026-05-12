// ═══════════════════════════════════════════════════════════════
// Edge Function : reply-review
// Poste une réponse à un avis Google Business Profile
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy reply-review --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

async function refreshGoogleToken(cfg: any, sb: any) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.client_id || "", client_secret: cfg.client_secret || "",
      refresh_token: cfg.refresh_token, grant_type: "refresh_token"
    })
  });
  const data = await res.json();
  if (data.access_token) {
    await sb.from("app_settings").update({ value: { ...cfg, access_token: data.access_token } }).eq("key", "gbp");
    return data.access_token;
  }
  throw new Error("Refresh failed");
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);
    // @ts-ignore
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { reviewId, replyText } = await req.json();
    if (!reviewId || !replyText) return json({ error: "reviewId et replyText requis" }, 400);

    const { data: r } = await sb.from("reviews").select("*").eq("id", reviewId).single();
    if (!r) return json({ error: "Avis introuvable" }, 404);

    if (r.source !== "google") {
      return json({ error: "Réponse automatisée disponible uniquement pour Google. Pour Facebook, répondez directement sur la page FB." }, 400);
    }

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "gbp").single();
    const cfg = settings?.value;
    if (!cfg?.refresh_token || !cfg?.account_id_audo) {
      return json({ error: "GBP non configuré — voir Paramètres → Google Business Profile" }, 400);
    }

    // Si pas d'access_token en cache, on rafraîchit avant l'appel
    let token = cfg.access_token;
    if (!token) {
      try { token = await refreshGoogleToken(cfg, sb); } catch (e: any) {
        return json({ error: "Impossible de rafraîchir le token : " + e.message }, 401);
      }
    }

    const url = `https://mybusiness.googleapis.com/v4/${cfg.account_id_audo}/${r.location_id}/reviews/${r.source_id}/reply`;
    let res = await fetch(url, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comment: replyText })
    });
    if (res.status === 401) {
      try { token = await refreshGoogleToken(cfg, sb); } catch (e: any) {
        return json({ error: "Refresh échec : " + e.message }, 401);
      }
      res = await fetch(url, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ comment: replyText })
      });
    }
    const data = await res.json();
    if (!res.ok) return json({ error: data.error?.message || "Reply failed", details: data }, 500);

    // Mise à jour dans Supabase
    await sb.from("reviews").update({
      reply_text: replyText,
      reply_posted_at: new Date().toISOString(),
      reply_by: user.email,
      status: "replied"
    }).eq("id", reviewId);

    return json({ success: true });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
