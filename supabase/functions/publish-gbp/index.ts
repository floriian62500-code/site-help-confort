// ═══════════════════════════════════════════════════════════════
// Edge Function : publish-gbp
// Publie un "Post Google" sur la fiche Google Business Profile
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy publish-gbp --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const GBP_API = "https://mybusiness.googleapis.com/v4";

async function refreshAccessToken(cfg: any, sb: any) {
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
  if (data.access_token) {
    // Persist le nouveau token
    await sb.from("app_settings").update({
      value: { ...cfg, access_token: data.access_token }
    }).eq("key", "gbp");
    return data.access_token;
  }
  throw new Error("Refresh token failed: " + JSON.stringify(data));
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const isCron = authHeader === `Bearer ${serviceKey}`;
    // @ts-ignore
    const sb = isCron
      // @ts-ignore
      ? createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } })
      // @ts-ignore
      : createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });

    if (!isCron) {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return json({ error: "Not authenticated" }, 401);
    }

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "gbp").single();
    const cfg = settings?.value;
    if (!cfg?.access_token || !cfg?.account_id_audo) {
      return json({ error: "Config GBP absente — voir Paramètres → Google Business Profile" }, 400);
    }

    const { realisationId } = await req.json();
    const { data: r, error } = await sb.from("realisations").select("*").eq("id", realisationId).single();
    if (error || !r) return json({ error: "Chantier introuvable" }, 404);

    // Choisir la bonne location selon l'agence
    const agence = r.ai_generated?.agence || "depan-audo";
    const locationId = agence === "depan-dk" ? cfg.location_id_dk : cfg.location_id_st_omer;
    if (!locationId) {
      return json({ error: `Location ID manquant pour ${agence}` }, 400);
    }

    const photo = r.image_after || r.image_before;
    const summary = `${r.title}\n\n${r.description || ""}\n\n📍 ${r.ville}`.slice(0, 1500);

    const postBody: any = {
      languageCode: "fr",
      summary,
      topicType: "STANDARD",
      callToAction: {
        actionType: "LEARN_MORE",
        url: `https://remarkable-dragon-364e2b.netlify.app/realisation.html?slug=${encodeURIComponent(r.slug)}`
      }
    };
    if (photo) {
      postBody.media = [{ mediaFormat: "PHOTO", sourceUrl: photo }];
    }

    const url = `${GBP_API}/${cfg.account_id_audo}/${locationId}/localPosts`;
    let token = cfg.access_token;
    let postRes = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postBody)
    });

    // Token expiré → refresh + retry
    if (postRes.status === 401 && cfg.refresh_token) {
      try {
        token = await refreshAccessToken(cfg, sb);
        postRes = await fetch(url, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(postBody)
        });
      } catch (e: any) {
        return json({ error: "Refresh token échec : " + e.message }, 401);
      }
    }

    const postJson = await postRes.json();
    if (postRes.ok && postJson.name) {
      return json({ success: true, postId: postJson.name, url: postJson.searchUrl });
    }
    return json({ error: "GBP publish failed", details: postJson }, 500);

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS_HEADERS, "content-type": "application/json" }
  });
}
