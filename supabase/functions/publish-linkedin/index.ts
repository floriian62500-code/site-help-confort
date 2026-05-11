// ═══════════════════════════════════════════════════════════════
// Edge Function : publish-linkedin
// Publie un chantier sur la page entreprise LinkedIn
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy publish-linkedin --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// @ts-ignore Deno
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

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "linkedin").single();
    const cfg = settings?.value;
    if (!cfg?.access_token || !cfg?.organization_urn) {
      return json({ error: "Config LinkedIn absente — voir Paramètres → LinkedIn" }, 400);
    }

    const { realisationId } = await req.json();
    const { data: r, error } = await sb.from("realisations").select("*").eq("id", realisationId).single();
    if (error || !r) return json({ error: "Chantier introuvable" }, 404);

    const photo = r.image_after || r.image_before;
    const fullText = [
      r.title,
      "",
      r.description,
      "",
      `📍 ${r.ville}${r.technicien ? ` · 🔧 ${r.technicien}` : ""}`,
      "",
      r.hashtags || ""
    ].filter(Boolean).join("\n");

    // 1. Si photo : upload via assets API
    let mediaUrn: string | null = null;
    if (photo) {
      try {
        // a. Register upload
        const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cfg.access_token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: cfg.organization_urn,
              serviceRelationships: [{
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }]
            }
          })
        });
        const regJson = await regRes.json();
        if (regJson.value) {
          const uploadUrl = regJson.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
          mediaUrn = regJson.value.asset;
          // b. Upload binary
          const imgRes = await fetch(photo);
          const imgBuf = await imgRes.arrayBuffer();
          await fetch(uploadUrl, {
            method: "POST",
            headers: { "Authorization": `Bearer ${cfg.access_token}` },
            body: imgBuf
          });
        }
      } catch (e: any) {
        console.warn("LinkedIn image upload failed:", e.message);
      }
    }

    // 2. Post UGC
    const ugcBody: any = {
      author: cfg.organization_urn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: fullText },
          shareMediaCategory: mediaUrn ? "IMAGE" : "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    };
    if (mediaUrn) {
      ugcBody.specificContent["com.linkedin.ugc.ShareContent"].media = [{
        status: "READY",
        description: { text: r.title },
        media: mediaUrn,
        title: { text: r.title }
      }];
    }

    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.access_token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(ugcBody)
    });
    const postJson = await postRes.json();
    if (postJson.id) {
      return json({ success: true, postId: postJson.id, url: `https://www.linkedin.com/feed/update/${postJson.id}` });
    }
    return json({ error: "LinkedIn publish failed", details: postJson }, 500);

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS_HEADERS, "content-type": "application/json" }
  });
}
