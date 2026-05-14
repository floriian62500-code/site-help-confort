// ═══════════════════════════════════════════════════════════════
// Edge Function : sync-facebook-posts
// Récupère les nouveaux posts de la page FB et les insère en BDD
// en statut "validation" pour validation manuelle.
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy sync-facebook-posts --no-verify-jwt
// Cron : appel toutes les 6h via pg_cron (voir setup_scheduled_publications.sql)
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH = "https://graph.facebook.com/v21.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// Devine le métier à partir du texte d'un post
function guessMetier(text: string): string {
  const t = (text || "").toLowerCase();
  if (/plomb|fuite|mitigeur|sanitaire|robinet|chasse d.eau|wc/.test(t)) return "plomberie";
  if (/chauffage|chaudière|radiateur|gaz|circulateur|brûleur|soupape|d[ée]semboua/.test(t)) return "chauffage";
  if (/électr|electric|tableau|disjoncteur|prise|interrupteur/.test(t)) return "electricite";
  if (/serrur|clé|verrou|cylindre|porte blind/.test(t)) return "serrurerie";
  if (/vitr|vitrage|double vitrage|bris de glace|insert/.test(t)) return "vitrerie";
  if (/menuiser|panneau pvc|porte (de service|pvc|garage)|fenêtre/.test(t)) return "menuiserie";
  if (/volet|volet roulant/.test(t)) return "volets";
  if (/pmr|hand|baignoire.*douche|adapt/.test(t)) return "pmr";
  if (/plafond|peinture|rénovation|sol|carrelage|enduit/.test(t)) return "renovation";
  return "multiservice";
}

// 🎯 Détecte si le post FB est une ACTUALITÉ/COMMUNICATION (pas un chantier réel)
// Retourne true pour : vœux, joyeuses fêtes, anniversaire, recrutement, événement marketing
function isActualite(text: string): boolean {
  const t = (text || "").toLowerCase();
  // Vœux / fêtes
  if (/vœux|voeux|joyeuses?\s+fêtes|bonne année|meilleurs?\s+vœux|noël|nouvelle année/.test(t)) return true;
  // Communication marketing pure
  if (/recrutement|nous recrutons|cherchons (un|une)|rejoignez|stage|alternance/.test(t)) return true;
  if (/^(✨|🎄|🎅|🎁|🎉|🥂|🍾)/.test(text || "")) return true; // emojis fêtes au début
  // Pub TV / événement
  if (/écran|télé|invite (sur|à)|émission|reportage|salon (du|des)|portes ouvertes/.test(t)) return true;
  // Communication interne
  if (/annonce|communiqué|info(rmation)? importante|à noter|fermeture|congés/.test(t)) return true;
  return false;
}

// Type final : 'realisation' (chantier) ou 'actualite' (communication)
function guessType(text: string): "realisation" | "actualite" {
  return isActualite(text) ? "actualite" : "realisation";
}

// Devine l'agence à partir du texte
function guessAgence(text: string): { ville: string; agence: string } {
  const t = (text || "").toLowerCase();
  if (/dunkerque|dk\b|dunkerquois/.test(t)) return { ville: "Dunkerque", agence: "depan-dk" };
  return { ville: "Saint-Omer", agence: "depan-audo" };  // défaut
}

// Tire un titre court depuis le message FB
function extractTitle(message: string): string {
  if (!message) return "Intervention Help Confort";
  // Premier paragraphe ou première phrase, limité à 120 chars
  const firstLine = message.split(/\n/)[0].trim();
  const firstSentence = firstLine.split(/[.!?]/)[0].trim();
  const t = (firstSentence.length >= 20 ? firstSentence : firstLine).slice(0, 120);
  return t || "Intervention Help Confort";
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST" && req.method !== "GET") return json({ error: "Method not allowed" }, 405);

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

    // Config Meta (token + page id)
    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "meta").single();
    const cfg = settings?.value || {};
    const token = cfg.page_access_token;
    const pageId = cfg.fb_page_id;
    if (!token || !pageId) {
      return json({ error: "Config Meta absente — voir Paramètres → Facebook & Instagram" }, 400);
    }

    // Récupère les 25 derniers posts
    const fbUrl = `${GRAPH}/${pageId}/posts?fields=id,message,created_time,permalink_url,full_picture,attachments{media,subattachments{media,target}}&limit=25&access_token=${encodeURIComponent(token)}`;
    const r = await fetch(fbUrl);
    const fb = await r.json();
    if (!r.ok || fb.error) {
      return json({ error: "FB API: " + (fb.error?.message || JSON.stringify(fb)) }, 502);
    }

    // Récupère tous les slugs et source_fb déjà connus pour dédupe
    const { data: existing } = await sb.from("realisations").select("slug,ai_generated");
    const knownSlugs = new Set((existing || []).map((r: any) => r.slug));
    const knownFbUrls = new Set(
      (existing || [])
        .map((r: any) => r.ai_generated?.source_fb)
        .filter(Boolean)
    );

    const created: any[] = [];
    const skipped: string[] = [];

    for (const post of (fb.data || [])) {
      if (!post.message) { skipped.push(post.id + " (no message)"); continue; }
      if (knownFbUrls.has(post.permalink_url)) { skipped.push(post.id + " (already imported)"); continue; }

      const title = extractTitle(post.message);
      const metier = guessMetier(post.message);
      const postType = guessType(post.message);  // 🎯 actualite vs realisation
      const { ville, agence } = guessAgence(post.message);

      // Slug unique : titre + suffixe court
      let slug = slugify(title);
      let i = 0;
      while (knownSlugs.has(slug)) {
        i++;
        slug = slugify(title) + "-" + i;
      }
      knownSlugs.add(slug);

      const imageAfter = post.full_picture || null;
      const datePart = (post.created_time || "").slice(0, 10);

      const payload = {
        title,
        slug,
        description: post.message.slice(0, 250),
        description_long: post.message,
        metier,
        ville,
        date_intervention: datePart,
        status: "validation", // À valider par Florian avant publication
        pinned: false,
        publish_targets: { site: true, facebook: false, instagram: false, linkedin: false, gbp: false },
        ai_generated: {
          imported_from: "facebook_scrape_auto",
          source_fb: post.permalink_url,
          fb_post_id: post.id,
          agence,
          imported_at: new Date().toISOString()
        },
        created_by: isCron ? "cron_fb_sync" : "manual_fb_sync",
        image_after: imageAfter,
        published_at: null
      };

      const { data: inserted, error: insErr } = await sb.from("realisations").insert(payload).select("id,title,slug").single();
      if (insErr) {
        skipped.push(post.id + " (db error: " + insErr.message + ")");
        continue;
      }
      created.push({ id: inserted.id, title: inserted.title, slug: inserted.slug, fb: post.permalink_url });
    }

    return json({
      success: true,
      imported: created.length,
      skipped: skipped.length,
      created,
      skipped_details: skipped
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
