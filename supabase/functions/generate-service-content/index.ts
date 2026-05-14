// ═══════════════════════════════════════════════════════════════
// Edge Function : generate-service-content
// Génère SEO + descriptions + FAQ d'une prestation du catalogue via Claude
// ═══════════════════════════════════════════════════════════════
// Déploiement :
//   supabase functions deploy generate-service-content --no-verify-jwt
//
// Appel depuis admin-pro/services.html :
//   POST { service_id: "<uuid>" }
//   → reçoit { seo_title, seo_description, client_summary, faqs:[3],
//             hashtags, fb_post, insta_post }
//   → stocké dans services.ai_generated jsonb
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS_HEADERS } });

interface GenerateInput {
  service_id?: string;
  // Données directes si pas d'ID en BDD
  name?: string;
  category_slug?: string;
  short_desc?: string;
  price_ttc?: number;
  includes?: string[];
  duration_min?: number;
}

interface GeneratedServiceContent {
  seo_title: string;            // < 60c
  seo_description: string;      // 150-160c
  client_summary: string;       // langage client court 200-280c
  faqs: { q: string; a: string }[];  // 3 entrées
  hashtags: string[];           // 6-10
  fb_post: string;              // 200-300c, ton chaleureux
  insta_post: string;           // 150-220c + emojis modérés
  internal_keywords: string[];  // 5-8 mots clés SEO ciblés
}

const CAT_LABELS: Record<string, string> = {
  "plomberie":   "plomberie",
  "chauffage":   "chauffage",
  "chauffe-eau": "chauffe-eau et eau chaude sanitaire",
  "electricite": "électricité",
  "serrurerie":  "serrurerie",
  "vitrerie":    "vitrerie",
  "sur-mesure":  "travaux sur mesure"
};

// @ts-ignore Deno global
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    // @ts-ignore Deno.env
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore Deno.env
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const sb = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Authentification user (admin)
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // Récupérer la clé Anthropic
    const { data: settings, error: settingsErr } = await sb
      .from("app_settings").select("value").eq("key", "anthropic").single();
    if (settingsErr || !settings?.value?.api_key) {
      return json({ error: "Clé Anthropic non configurée — voir Paramètres → Claude IA" }, 400);
    }
    const apiKey = settings.value.api_key;
    const model  = settings.value.model || "claude-haiku-4-5-20251001";

    const body: GenerateInput = await req.json();

    // Si service_id fourni → lire les données depuis la BDD
    let service: any = body;
    if (body.service_id) {
      const { data: svc, error: svcErr } = await sb
        .from("services").select("*").eq("id", body.service_id).single();
      if (svcErr || !svc) return json({ error: "Service introuvable : " + (svcErr?.message || "")}, 404);
      service = svc;
    }

    if (!service.name) return json({ error: "name (nom de la prestation) requis" }, 400);

    const catLabel = CAT_LABELS[service.category_slug || ""] || (service.category_slug || "service");

    // PROMPT CLAUDE
    const systemPrompt = `Tu es un expert en marketing digital pour entreprises artisanales du dépannage et de la rénovation habitat en France.

Tu écris pour HELP! Confort, multi-services à Saint-Omer (Dépan'Audo) et Dunkerque (Dépan'DK).
Valeurs : techniciens salariés (pas de sous-traitance), employeur local, garantie, transparence prix, intervention rapide.

OBJECTIF : Générer le contenu marketing+SEO d'une PRESTATION (service du catalogue), pas d'un chantier.

RÈGLES IMPÉRATIVES :
- Langage CLIENT (pas technique). Le client tape "mon WC fuit", pas "mécanisme Geberit défaillant".
- SEO local : intégrer Saint-Omer ou Pas-de-Calais quand pertinent.
- Ton : chaleureux, rassurant, professionnel, jamais agressif.
- Pas d'émojis dans seo_title et seo_description. 1-2 max sur fb_post/insta_post.
- FAQ : 3 questions courantes que le client se pose réellement (prix, durée, garantie, déplacement, etc.).
- Hashtags : 6-10, mélange générique (#plomberie #depannage) + local (#saintomer #dunkerque).
- Keywords SEO : 5-8 expressions ciblées (problème + solution + lieu).

Réponds UNIQUEMENT en JSON valide avec ces clés :
{
  "seo_title": "60 caractères max, mot-clé en tête",
  "seo_description": "150-160 caractères, accroche + bénéfice + zone",
  "client_summary": "200-280 caractères en langage client (le problème + comment on aide)",
  "faqs": [
    {"q":"Question client courte","a":"Réponse 1-2 phrases concrète"},
    {"q":"...","a":"..."},
    {"q":"...","a":"..."}
  ],
  "hashtags": ["#tag1","#tag2","..."],
  "fb_post": "200-300 caractères, ton humain, 1 émoji discret max",
  "insta_post": "150-220 caractères, émojis modérés (2-3), retour ligne ok",
  "internal_keywords": ["mot clé 1","mot clé 2","..."]
}`;

    const userPrompt = `Génère le contenu pour cette prestation :

Catégorie : ${catLabel}
Nom actuel : ${service.name}
Description courte : ${service.short_desc || "(aucune)"}
Prix TTC : ${service.price_ttc ? service.price_ttc + " €" : "sur devis"}
Inclus : ${(service.includes || []).join(", ") || "(non renseigné)"}
Durée estimée : ${service.duration_min ? service.duration_min + " min" : "non précisé"}

Génère le JSON complet.`;

    // Appel Claude
    const r = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return json({ error: "Claude API: " + errText.slice(0, 400) }, 502);
    }

    const data = await r.json();
    const text = data?.content?.[0]?.text || "";

    // Extraire le JSON (tolère ```json … ``` ou texte autour)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return json({ error: "Réponse IA invalide", raw: text.slice(0, 500) }, 502);

    let generated: GeneratedServiceContent;
    try {
      generated = JSON.parse(jsonMatch[0]);
    } catch (e: any) {
      return json({ error: "JSON IA invalide : " + e.message, raw: jsonMatch[0].slice(0, 500) }, 502);
    }

    // Tronque les champs trop longs (filet de sécurité)
    if (generated.seo_title && generated.seo_title.length > 80) generated.seo_title = generated.seo_title.slice(0, 78) + "…";
    if (generated.seo_description && generated.seo_description.length > 170) generated.seo_description = generated.seo_description.slice(0, 168) + "…";

    // Stockage automatique si service_id fourni
    if (body.service_id) {
      const ai_payload = {
        ...generated,
        generated_at: new Date().toISOString(),
        generated_by: "claude-" + model,
        generated_by_user: user.email || user.id
      };
      await sb.from("services")
        .update({ ai_generated: ai_payload })
        .eq("id", body.service_id);
    }

    return json({
      ok: true,
      service_id: body.service_id || null,
      content: generated
    });

  } catch (e: any) {
    return json({ error: "Erreur serveur : " + e.message }, 500);
  }
});
