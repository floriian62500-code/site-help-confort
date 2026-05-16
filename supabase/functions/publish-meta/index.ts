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
  // Mode "chantier" : publie une réalisation existante depuis la base
  realisationId?: string;
  customText?: string;  // texte personnalisé (optimisé IA pour FB)

  // Mode "texte brut" : publie un message arbitraire (templates calendrier,
  // posts ad-hoc) sans passer par la table realisations.
  // Si textPost.message est fourni ET realisationId est absent → mode texte.
  textPost?: {
    message: string;
    photoUrl?: string;   // URL publique d'une image à attacher (optionnel)
    logKey?: string;     // identifiant libre pour traçabilité (ex: "template-mardi-r3-W20")
  };

  targets?: { facebook?: boolean; instagram?: boolean };
}

// @ts-ignore Deno global
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    // Authentification "cron" : on compare le Bearer à HC_EDGE_AUTH_TOKEN
    // (secret custom déployé via `supabase secrets set`). On ne dépend plus
    // des clés auto-injectées par Supabase (SUPABASE_SERVICE_ROLE_KEY) dont
    // la valeur change selon la version du projet.
    // @ts-ignore
    const hcToken = Deno.env.get("HC_EDGE_AUTH_TOKEN") ?? "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const isCron = !!hcToken && bearer === hcToken;

    // Pour les opérations DB on a toujours besoin d'un service role réel.
    // On utilise SUPABASE_SERVICE_ROLE_KEY (auto-injecté par Supabase, peu
    // importe son format actuel — Supabase l'accepte côté DB de toute façon).
    // @ts-ignore
    const sbServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // @ts-ignore
    const sb = isCron
      // @ts-ignore
      ? createClient(Deno.env.get("SUPABASE_URL")!, sbServiceKey, { auth: { persistSession: false } })
      // @ts-ignore
      : createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });

    if (!isCron) {
      // Tentative d'auth utilisateur classique (appel depuis le dashboard)
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return json({ error: "Not authenticated" }, 401);
    }

    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "meta").single();
    const meta = settings?.value;
    if (!meta?.page_access_token) {
      return json({ error: "Config Meta absente — voir Paramètres → Facebook & Instagram" }, 400);
    }

    const body: PublishInput = await req.json();

    // Détermination du mode : chantier vs. texte brut
    const isTextMode = !body.realisationId && !!body.textPost?.message?.trim();
    if (!body.realisationId && !isTextMode) {
      return json({ error: "realisationId ou textPost.message requis" }, 400);
    }

    let r: any = null;     // ligne realisations (mode chantier uniquement)
    let photo: string | undefined;
    let fullText: string;
    let wantFb: boolean;
    let wantIg: boolean;
    let logKey: string | undefined;

    if (isTextMode) {
      // ─── Mode texte brut (templates calendrier, posts ad-hoc) ───
      fullText = body.textPost!.message.trim();
      photo = body.textPost!.photoUrl;
      logKey = body.textPost!.logKey;
      // Targets : par défaut Facebook seul (les templates calendrier sont FB-only)
      wantFb = body.targets?.facebook ?? true;
      wantIg = body.targets?.instagram ?? false;
    } else {
      // ─── Mode chantier (réalisation depuis la base) ───
      const { data, error } = await sb.from("realisations").select("*").eq("id", body.realisationId).single();
      if (error || !data) return json({ error: "Chantier introuvable" }, 404);
      r = data;
      photo = r.image_after || r.image_before;
      // Texte FB : customText si fourni (généré par IA), sinon assemblage par défaut
      fullText = body.customText && body.customText.trim()
        ? body.customText.trim() + (r.hashtags ? "\n\n" + r.hashtags : "")
        : [
            r.title,
            r.description,
            "",
            `📍 ${r.ville}`,
            r.technicien ? `🔧 Technicien : ${r.technicien}` : "",
            "",
            r.hashtags || ""
          ].filter(Boolean).join("\n");
      wantFb = body.targets?.facebook ?? !!(r.publish_targets?.facebook);
      wantIg = body.targets?.instagram ?? !!(r.publish_targets?.instagram);
    }

    const results: any = {};

    // ─── Facebook ───
    if (wantFb && meta.fb_page_id) {
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
    if (wantIg && meta.ig_business_account_id) {
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
          const containerId = cJson.id;

          // 2. Attendre que le container soit prêt (Meta peut prendre 2-10s pour valider l'image)
          let status = "IN_PROGRESS";
          let attempts = 0;
          while (status !== "FINISHED" && attempts < 8) {
            await new Promise(r => setTimeout(r, 1500));
            const sRes = await fetch(`${GRAPH_API}/${containerId}?fields=status_code&access_token=${encodeURIComponent(meta.page_access_token)}`);
            const sJson = await sRes.json();
            status = sJson.status_code || "IN_PROGRESS";
            if (status === "ERROR" || status === "EXPIRED") {
              throw new Error(`Container Instagram ${status} : Meta a rejeté l'image (URL non accessible ou format invalide)`);
            }
            attempts++;
          }
          if (status !== "FINISHED") {
            throw new Error("Container Instagram pas prêt après 12s — réessayez ou vérifiez que l'URL photo est publiquement accessible");
          }

          // 3. Publier le container
          const pRes = await fetch(`${GRAPH_API}/${meta.ig_business_account_id}/media_publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              access_token: meta.page_access_token,
              creation_id: containerId
            })
          });
          const pJson = await pRes.json();
          if (pJson.error) throw new Error(pJson.error.message);
          results.instagram = { success: true, postId: pJson.id, url: `https://www.instagram.com/p/${pJson.id}` };
        } catch (e: any) {
          results.instagram = { error: e.message };
        }
      }
    }

    // Mettre à jour la réalisation avec les liens (mode chantier uniquement)
    if (r) {
      const publishLog = (r.publish_log || {});
      Object.assign(publishLog, {
        meta: { ...results, published_at: new Date().toISOString() }
      });
      await sb.from("realisations").update({ ai_generated: { ...(r.ai_generated || {}), publish_log: publishLog } }).eq("id", r.id);
    }

    return json({ success: true, mode: isTextMode ? "text" : "realisation", logKey, results });

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
