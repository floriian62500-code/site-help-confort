// ═══════════════════════════════════════════════════════════════
// Edge Function : generate-content
// Génère titre + descriptions + hashtags + SEO d'un chantier via Claude
// ═══════════════════════════════════════════════════════════════
// Déploiement :
//   supabase functions deploy generate-content --no-verify-jwt
// Note : --no-verify-jwt permet d'appeler depuis le client front-end
//        avec son JWT user (RLS app_settings vérifie l'auth)
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

// CORS pour appels depuis le navigateur
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface GenerateInput {
  realisationId?: string;
  metier: string;
  ville: string;
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  typeInter?: string;
  agence?: string;
}

interface GeneratedContent {
  title: string;
  description: string;
  description_long: string;
  hashtags: string;
  seo_title: string;
  seo_description: string;
}

const METIER_LABELS: Record<string, string> = {
  plomberie: "plomberie", chauffage: "chauffage", electricite: "électricité",
  serrurerie: "serrurerie", vitrerie: "vitrerie", renovation: "rénovation",
  menuiserie: "menuiserie", volets: "volets/stores", pmr: "adaptation PMR",
  multiservice: "multi-services"
};

const AGENCE_LABELS: Record<string, string> = {
  "depan-audo": "Dépan'Audo (HELP Confort Saint-Omer)",
  "depan-dk": "Dépan'DK (HELP Confort Dunkerque)"
};

// @ts-ignore Deno global
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    // Authentification de l'appelant (JWT user)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    // @ts-ignore Deno.env
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore Deno.env
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Client avec le JWT user (respecte RLS)
    const sb = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Vérifier que l'user est authentifié
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // Lire la clé Anthropic depuis app_settings
    const { data: settings, error: settingsErr } = await sb
      .from("app_settings").select("value").eq("key", "anthropic").single();
    if (settingsErr || !settings?.value?.api_key) {
      return json({ error: "Clé Anthropic non configurée — voir Paramètres → Claude IA" }, 400);
    }
    const apiKey = settings.value.api_key;
    const model = settings.value.model || "claude-haiku-4-5-20251001";

    // Input
    const body: GenerateInput = await req.json();
    if (!body.metier || !body.ville) {
      return json({ error: "metier et ville requis" }, 400);
    }
    const metierLabel = METIER_LABELS[body.metier] || body.metier;
    const agenceLabel = AGENCE_LABELS[body.agence || ""] || "HELP Confort";

    // Prompt Claude
    const systemPrompt = `Tu es un expert en marketing digital pour entreprises artisanales du dépannage et de la rénovation.
Tu écris pour HELP Confort, multi-services (plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation) avec 2 agences :
- Dépan'Audo (Saint-Omer et environs)
- Dépan'DK (Dunkerque et environs)

L'entreprise valorise : techniciens salariés (pas de sous-traitance), employeur local, intervention rapide, garantie.

Tu génères du contenu pour des chantiers réalisés (avant/après).

RÈGLES IMPORTANTES :
- Ton chaleureux, professionnel, jamais commercial agressif
- Mettre en avant le savoir-faire local et l'expertise
- Optimiser pour le SEO local (ville + métier)
- Hashtags : 6-10 max, pertinents, mélange générique + local
- Pas d'émojis dans le titre, max 1-2 dans la description courte
- Décrire la prestation avec précision technique (sans jargon excessif)

Réponds UNIQUEMENT en JSON valide avec ces clés exactes :
{
  "title": "Titre accrocheur 60-80 caractères",
  "description": "Description courte 150-200 caractères pour le feed et grille",
  "description_long": "Description détaillée 400-600 caractères avec contexte, étapes, garantie, bénéfices client",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 (séparés par espaces)",
  "seo_title": "Title HTML 50-60 caractères avec ville + métier",
  "seo_description": "Meta description 140-160 caractères"
}`;

    const userPrompt = `Chantier à valoriser :
- Métier : ${metierLabel}
- Ville : ${body.ville}
- Agence : ${agenceLabel}
- Type d'intervention : ${body.typeInter || "non précisé"}

${body.photoBeforeUrl ? `Photo "avant" disponible : ${body.photoBeforeUrl}` : ""}
${body.photoAfterUrl ? `Photo "après" disponible : ${body.photoAfterUrl}` : ""}

Génère le contenu complet en JSON.`;

    // Construire le message Claude
    const messages: any[] = [];
    const userContent: any[] = [{ type: "text", text: userPrompt }];

    // Si photos dispos, on les attache pour vision Claude
    if (body.photoAfterUrl) {
      try {
        const imgRes = await fetch(body.photoAfterUrl);
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          userContent.unshift({
            type: "image",
            source: { type: "base64", media_type: imgRes.headers.get("content-type") || "image/webp", data: b64 }
          });
        }
      } catch (_) { /* ignore image errors */ }
    }
    messages.push({ role: "user", content: userContent });

    // Appel Claude
    const claudeRes = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: systemPrompt,
        messages
      })
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      return json({ error: "Erreur Claude API : " + errText.slice(0, 300) }, 500);
    }

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || "";

    // Parser le JSON renvoyé
    let parsed: GeneratedContent;
    try {
      // Claude renvoie parfois du markdown autour, on extrait le JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Pas de JSON dans la réponse");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return json({ error: "Réponse Claude non parsable", raw: text.slice(0, 500) }, 500);
    }

    // Sauvegarde optionnelle dans la réalisation
    if (body.realisationId) {
      const aiMeta = {
        generated_at: new Date().toISOString(),
        model,
        cost_estimate_cents: 0.3 // estimation Haiku
      };
      await sb.from("realisations").update({
        title: parsed.title,
        description: parsed.description,
        description_long: parsed.description_long,
        hashtags: parsed.hashtags,
        seo_title: parsed.seo_title,
        seo_description: parsed.seo_description,
        ai_generated: aiMeta,
        updated_at: new Date().toISOString()
      }).eq("id", body.realisationId);
    }

    return json({ success: true, ...parsed });

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
