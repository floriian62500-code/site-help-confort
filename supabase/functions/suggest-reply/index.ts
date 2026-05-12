// ═══════════════════════════════════════════════════════════════
// Edge Function : suggest-reply
// Génère une suggestion de réponse à un avis client via Claude.
// Prend en compte rating, commentaire, ville, agence, et le ton
// défini dans Paramètres → Entreprise (raison_sociale, signature).
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy suggest-reply --no-verify-jwt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const AGENCE_LABEL: Record<string, string> = {
  "depan-audo": "HELP! Confort Saint-Omer",
  "depan-dk": "HELP! Confort Dunkerque"
};

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

    const { reviewId } = await req.json();
    if (!reviewId) return json({ error: "reviewId requis" }, 400);

    // Récupère l'avis + les settings (anthropic + company)
    const [{ data: rv }, { data: setAnth }, { data: setCo }] = await Promise.all([
      sb.from("reviews").select("*").eq("id", reviewId).single(),
      sb.from("app_settings").select("value").eq("key", "anthropic").single(),
      sb.from("app_settings").select("value").eq("key", "company").single()
    ]);

    if (!rv) return json({ error: "Avis introuvable" }, 404);
    if (!setAnth?.value?.api_key) return json({ error: "Clé Anthropic absente — voir Paramètres → Claude IA" }, 400);

    const apiKey = setAnth.value.api_key;
    const model = setAnth.value.model || "claude-haiku-4-5-20251001";
    const company = setCo?.value || {};
    const agenceLabel = AGENCE_LABEL[rv.agence] || "HELP! Confort";
    const signature = company.signature || "L'équipe HELP! Confort";
    const raisonSociale = company.raison_sociale || "SARL Dépan'Audo";

    // Tonalité selon le rating
    let tonalite = "";
    if (rv.rating >= 4) {
      tonalite = `Remercie chaleureusement, en français, avec naturel. Pas plus de 4 phrases. Évite les formules trop commerciales. Mentionne brièvement ce que l'auteur a aimé si c'est évident dans son commentaire.`;
    } else if (rv.rating === 3) {
      tonalite = `Réponse mesurée : remercier pour le retour, reconnaître le ressenti mitigé, proposer un échange direct (téléphone) pour mieux comprendre. Ton chaleureux mais factuel. 3-5 phrases.`;
    } else {
      tonalite = `Réponse difficile à un avis négatif. Reconnaître sincèrement le désagrément SANS minimiser, présenter des excuses, proposer un contact direct (téléphone 03 66 10 01 34) pour régler la situation. Ne pas être défensif ni nier. Rester professionnel. 4-6 phrases.`;
    }

    const prompt = `Tu rédiges la RÉPONSE PUBLIQUE de ${agenceLabel} (${raisonSociale}) à un avis client laissé sur ${rv.source === "google" ? "Google Business Profile" : rv.source}.

CONTEXTE :
- Auteur : ${rv.author_name}
- Note : ${rv.rating}/5 étoiles
- Commentaire de l'auteur : ${rv.comment ? `"${rv.comment}"` : "(aucun commentaire écrit, juste la note)"}
- Date : ${new Date(rv.posted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}

CONSIGNES DE TON :
${tonalite}

CONTRAINTES :
- Français impeccable, tutoiement de respect (vouvoiement)
- Pas de hashtags, pas d'emojis (sauf 🙏 ou 🌟 en cas d'avis 5★ très chaleureux, max 1)
- Termine par la signature : "${signature}"
- Pas de "Madame/Monsieur" si on connaît le prénom — utilise le prénom seul ${rv.author_name.includes(" ") ? `(prénom : ${rv.author_name.split(" ")[0]})` : ""}
- Pas de copier-coller corporate, sois humain
- Ne mentionne pas que tu es une IA
- N'inclus PAS de salutation type "Cher client" — commence directement par le prénom ou "Bonjour [prénom]"

Rends UNIQUEMENT le texte de la réponse, sans guillemets, sans préambule, sans explication.`;

    const aRes = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!aRes.ok) {
      const errBody = await aRes.text();
      return json({ error: `Claude API ${aRes.status} : ${errBody.slice(0, 200)}` }, 500);
    }

    const aData = await aRes.json();
    const text = aData?.content?.[0]?.text?.trim();
    if (!text) return json({ error: "Réponse Claude vide", details: aData }, 500);

    return json({ success: true, suggestion: text, rating: rv.rating, model });

  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...CORS, "content-type": "application/json" }
  });
}
