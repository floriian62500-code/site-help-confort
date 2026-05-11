// ═══════════════════════════════════════════════════════════════
// Edge Function : publish-meta
// Publie un chantier sur Facebook + Instagram via Graph API
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy publish-meta --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_API = "https://graph.facebook.com/v21.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface PublishInput {
  realisationId: string;
  targets: { facebook?: boolean; instagram?: boolean };
}

// @ts-ignore Deno global
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
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

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "meta").single();
    const meta = settings?.value;
    if (!meta?.page_access_token) {
      return json({ error: "Config Meta absente — voir Paramètres → Facebook & Instagram" }, 400);
    }

    const body: PublishInput = await req.json();
    if (!body.realisationId) return json({ error: "realisationId requis" }, 400);

    // Charger la réalisation
    const { data: r, error } = await sb.from("realisations").select("*").eq("id", body.realisationId).single();
    if (error || !r) return json({ error: "Chantier introuvable" }, 404);

    const photo = r.image_after || r.image_before;
    const fullText = [
      r.title,
      r.description,
      "",
      `📍 ${r.ville}`,
      r.technicien ? `🔧 Technicien : ${r.technicien}` : "",
      "",
      r.hashtags || ""
    ].filter(Boolean).join("\n");

    const results: any = {};

    // ─── Facebook ───
    if (body.targets.facebook && meta.fb_page_id) {
      try {
        const fbBody: any = {
          access_token: meta.page_access_token,
          message: fullText
        };
        if (photo) fbBody.url = photo;
        const endpoint = photo ? "photos" : "feed";
        const fbRes = await fetch(`${GRAPH_API}/${meta.fb_page_id}/${endpoint}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(fbBody)
        });
        const fbJson = await fbRes.json();
        if (fbJson.error) {
          results.facebook = { error: fbJson.error.message };
        } else {
          const postId = fbJson.post_id || fbJson.id;
          results.facebook = {
            success: true,
            postId,
            url: `https://www.facebook.com/${postId}`
          };
        }
      } catch (e: any) {
        results.facebook = { error: e.message };
      }
    }

    // ─── Instagram ───
    if (body.targets.instagram && meta.ig_business_account_id) {
      if (!photo) {
        results.instagram = { error: "Instagram nécessite une photo" };
      } else {
        try {
          // 1. Créer un container
          const cRes = await fetch(`${GRAPH_API}/${meta.ig_business_account_id}/media`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              access_token: meta.page_access_token,
              image_url: photo,
              caption: fullText
            })
          });
          const cJson = await cRes.json();
          if (cJson.error) throw new Error(cJson.error.message);
          // 2. Publier le container
          const pRes = await fetch(`${GRAPH_API}/${meta.ig_business_account_id}/media_publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              access_token: meta.page_access_token,
              creation_id: cJson.id
            })
          });
          const pJson = await pRes.json();
          if (pJson.error) throw new Error(pJson.error.message);
          results.instagram = { success: true, postId: pJson.id };
        } catch (e: any) {
          results.instagram = { error: e.message };
        }
      }
    }

    // Mettre à jour la réalisation avec les liens
    const publishLog = (r.publish_log || {});
    Object.assign(publishLog, {
      meta: { ...results, published_at: new Date().toISOString() }
    });
    await sb.from("realisations").update({ ai_generated: { ...(r.ai_generated || {}), publish_log: publishLog } }).eq("id", r.id);

    return json({ success: true, results });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" }
  });
}
