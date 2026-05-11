// ═══════════════════════════════════════════════════════════════
// Edge Function : auto-publish-from-photos
// Pipeline complet : photos → analyse IA → chantier → publication FB
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy auto-publish-from-photos --no-verify-jwt
//
// Reçoit : photos[] (base64 data URLs), publishToFacebook (bool), agence
// Fait :
//   1. Analyse les photos via Claude Vision → métier + ville + titre + desc + hashtags
//   2. Upload les photos dans Supabase Storage
//   3. Crée le chantier en BDD (status=publie)
//   4. Si publishToFacebook : appelle publish-meta en cascade
//   5. Retourne le chantier créé + lien FB éventuel
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

interface PhotoInput {
  data: string;          // base64 data URL (data:image/jpeg;base64,...)
  filename: string;
  role?: "before" | "after"; // si l'user précise
}

interface AutoPublishInput {
  photos: PhotoInput[];
  publishToFacebook?: boolean;
  publishToInstagram?: boolean;
  publishToLinkedin?: boolean;
  publishToGbp?: boolean;
  agence?: string;       // depan-audo | depan-dk
  hintMetier?: string;   // si user veut forcer
  hintVille?: string;    // si user veut forcer
  hintNotes?: string;    // contexte libre user
}

function slugify(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const SYSTEM_PROMPT = `Tu es un expert en marketing digital pour entreprises artisanales du dépannage et de la rénovation.
Tu écris pour HELP! Confort, multi-services (plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation, menuiserie, volets, PMR) avec 2 agences :
- Dépan'Audo (Saint-Omer et environs)
- Dépan'DK (Dunkerque et environs)

L'entreprise valorise : techniciens salariés (pas de sous-traitance), employeur local, intervention rapide, garantie.

Ton mission : à partir d'UNE OU DEUX PHOTOS d'un chantier (avant/après ou juste après), tu génères TOUTES les métadonnées pour publier ce chantier sur le site web ET sur Facebook.

RÈGLES :
- Tu DEVINES le métier d'après la photo (plomberie/chauffage/electricite/serrurerie/vitrerie/menuiserie/renovation/volets/pmr/multiservice)
- Tu utilises la ville par défaut indiquée (probablement Saint-Omer)
- Ton chaleureux, professionnel, jamais commercial agressif
- Mettre en avant le savoir-faire local
- Hashtags : 6-10 max, pertinents, mélange générique + local
- Pas d'émojis dans le titre, max 1-2 dans la description
- Décrire avec précision technique mais accessible

Réponds UNIQUEMENT en JSON valide avec ces clés exactes :
{
  "metier": "plomberie",
  "ville": "Saint-Omer",
  "type_intervention": "Brève phrase qui décrit l'intervention vue sur les photos",
  "title": "Titre accrocheur 60-80 caractères",
  "description": "Description courte 150-200 caractères pour feed/grille",
  "description_long": "Description détaillée 400-600 caractères : contexte, étapes, garantie, bénéfices",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 (espaces séparateurs)",
  "seo_title": "Title HTML 50-60 caractères avec ville + métier",
  "seo_description": "Meta description 140-160 caractères",
  "facebook_post": "Texte optimisé Facebook 200-400 caractères avec émojis modérés et CTA. Différent de la description, plus engageant."
}`;

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    // @ts-ignore
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const isCron = authHeader === `Bearer ${serviceKey}`;
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore
    const sb = isCron
      ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      // @ts-ignore
      : createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });

    let userEmail = "auto_publish_bot";
    if (!isCron) {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return json({ error: "Not authenticated" }, 401);
      userEmail = user.email || userEmail;
    }

    // Clé Anthropic
    const { data: settings } = await sb.from("app_settings").select("value").eq("key", "anthropic").single();
    if (!settings?.value?.api_key) {
      return json({ error: "Clé Anthropic non configurée — voir Paramètres → Claude IA" }, 400);
    }
    const apiKey = settings.value.api_key;
    const model = settings.value.model || "claude-haiku-4-5-20251001";

    const body: AutoPublishInput = await req.json();
    if (!body.photos || body.photos.length === 0) {
      return json({ error: "Au moins une photo requise" }, 400);
    }
    if (body.photos.length > 4) {
      return json({ error: "Maximum 4 photos" }, 400);
    }

    const agence = body.agence || "depan-audo";
    const villeDefault = agence === "depan-dk" ? "Dunkerque" : "Saint-Omer";

    // ─── 1. Appel Claude Vision ───────────────────────────
    const userContent: any[] = [];
    body.photos.forEach((p, i) => {
      // Parse data:image/xxx;base64,YYY
      const m = p.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) return;
      const mediaType = m[1];
      const dataB64 = m[2];
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: dataB64 }
      });
    });
    userContent.push({
      type: "text",
      text: `Voici ${body.photos.length} photo(s) d'un chantier réalisé.
${body.hintMetier ? `Métier indiqué par l'utilisateur : ${body.hintMetier}` : "Devine le métier d'après les images."}
${body.hintVille ? `Ville : ${body.hintVille}` : `Ville par défaut : ${villeDefault} (agence ${agence})`}
${body.hintNotes ? `Notes contexte : ${body.hintNotes}` : ""}

Génère le contenu complet en JSON.`
    });

    const claudeRes = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }]
      })
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return json({ error: "Claude API : " + errText.slice(0, 300) }, 502);
    }
    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || "";
    let gen: any;
    try {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Pas de JSON");
      gen = JSON.parse(m[0]);
    } catch (e) {
      return json({ error: "Réponse Claude non parsable", raw: text.slice(0, 500) }, 502);
    }

    // ─── 2. Upload des photos dans Storage ────────────────
    const slug = slugify(gen.title || "chantier") + "-" + Date.now().toString(36);
    let imageBefore: string | null = null;
    let imageAfter: string | null = null;

    // On suppose le bucket "réalisations" existe
    const bucketName = "réalisations";
    for (let i = 0; i < body.photos.length; i++) {
      const p = body.photos[i];
      const m = p.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) continue;
      const mediaType = m[1];
      const dataB64 = m[2];
      const ext = mediaType.split("/")[1] || "jpg";

      // Décoder base64 → Uint8Array
      const binStr = atob(dataB64);
      const bytes = new Uint8Array(binStr.length);
      for (let j = 0; j < binStr.length; j++) bytes[j] = binStr.charCodeAt(j);

      // Déterminer le rôle (after par défaut pour la 1ère, before pour la 2ème)
      const role = p.role || (i === 0 ? "after" : "before");
      const path = `${slug}/${role}-${Date.now()}-${i}.${ext}`;

      const { error: upErr } = await sb.storage.from(bucketName).upload(path, bytes, {
        contentType: mediaType,
        upsert: true
      });
      if (upErr) {
        console.warn("Upload error:", upErr);
        continue;
      }
      const { data: pub } = sb.storage.from(bucketName).getPublicUrl(path);
      if (role === "after") imageAfter = pub.publicUrl;
      else imageBefore = pub.publicUrl;
    }

    // Si une seule photo, elle devient image_after
    if (!imageAfter && imageBefore) {
      imageAfter = imageBefore;
      imageBefore = null;
    }

    // ─── 3. Insertion en BDD ───────────────────────────────
    const now = new Date().toISOString();
    const publishTargets = {
      site: true,
      facebook: !!body.publishToFacebook,
      instagram: !!body.publishToInstagram,
      linkedin: !!body.publishToLinkedin,
      gbp: !!body.publishToGbp
    };

    const aiGenerated = {
      generated_at: now,
      model,
      facebook_post: gen.facebook_post,
      seo_title: gen.seo_title,
      seo_description: gen.seo_description,
      agence,
      magic_dropzone: true
    };

    const payload = {
      title: gen.title,
      slug,
      description: gen.description,
      description_long: gen.description_long,
      metier: gen.metier || "multiservice",
      ville: gen.ville || villeDefault,
      date_intervention: now.slice(0, 10),
      status: "publie",
      pinned: false,
      publish_targets: publishTargets,
      ai_generated: aiGenerated,
      hashtags: gen.hashtags,
      created_by: userEmail,
      image_before: imageBefore,
      image_after: imageAfter,
      published_at: now
    };

    const { data: chantier, error: insErr } = await sb.from("realisations").insert(payload).select().single();
    if (insErr) return json({ error: "DB insert error: " + insErr.message }, 500);

    // ─── 4. Publication FB (cascade) ───────────────────────
    let fbResult: any = null;
    if (body.publishToFacebook) {
      try {
        const fbRes = await fetch(`${supabaseUrl}/functions/v1/publish-meta`, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            realisationId: chantier.id,
            customText: gen.facebook_post  // texte FB optimisé
          })
        });
        fbResult = await fbRes.json();
        if (!fbRes.ok || fbResult.error) {
          fbResult = { success: false, error: fbResult.error || "FB publication failed" };
        }
      } catch (e) {
        fbResult = { success: false, error: (e as Error).message };
      }
    }

    return json({
      success: true,
      chantier,
      generated: gen,
      facebook: fbResult
    });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});
