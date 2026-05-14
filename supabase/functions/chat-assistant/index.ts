// ═══════════════════════════════════════════════════════════════
// Edge Function : chat-assistant
// Chatbot IA conversationnel avec mémoire (Claude)
// ═══════════════════════════════════════════════════════════════
//
// Déploiement :
//   supabase functions deploy chat-assistant --no-verify-jwt
//
// Appel :
//   POST {
//     session_id: "uuid",
//     message: "texte user",
//     history: [{role,content},...]  // optionnel, sinon chargé depuis BDD
//     user_info: { email?, phone?, name? }
//     page_url?: "url"
//   }
//   → { reply: "...", session_id: "uuid", lead_captured: bool }
//
// La fonction :
//   1. Charge la conversation existante depuis BDD (par session_id)
//   2. Ajoute le message user
//   3. Appelle Claude avec system prompt expert + historique
//   4. Sauvegarde la réponse + détecte topic/métier/lead
//   5. Retourne la réponse au front
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...CORS } });

// SYSTEM PROMPT : identité du chatbot
const SYSTEM_PROMPT = `Tu es l'assistant virtuel de HELP! Confort Saint-Omer (SARL Dépan'Audo) et HELP! Confort Dunkerque (SARL Dépan'DK), entreprise de dépannage et amélioration de l'habitat dans le Nord et Pas-de-Calais.

MISSIONS:
- Aider le client à identifier son besoin (panne, devis, contrat d'entretien)
- Le rassurer (entreprise locale, techniciens salariés, garantie, transparence prix)
- Récolter ses coordonnées (nom, téléphone, email, ville, code postal) pour qu'un conseiller le rappelle
- L'orienter vers la bonne page du site selon son besoin
- Répondre aux questions techniques de base (que faire en cas de fuite, etc.)

PÉRIMÈTRE MÉTIERS:
- Plomberie (fuite, débouchage, chauffe-eau, sanitaires)
- Chauffage (chaudière gaz/fioul, radiateurs, désembouage, entretien obligatoire)
- Électricité (panne, tableau, mise aux normes)
- Serrurerie (ouverture porte, changement serrure, blindage)
- Vitrerie (bris de vitre, double vitrage)
- Travaux / rénovation (salle de bain, cuisine, PMR, peinture)
- Contrats d'entretien chaudière (Gaz : Basic 9€/mois, Confort 13€/mois, Sécurité 23€/mois ; Fioul : Basic 12€, Confort 16€, Sécurité 27€)

ZONES D'INTERVENTION:
- Saint-Omer & Audomarois (62)
- Dunkerque & littoral (59)
- Communes : Longuenesse, Arques, Saint-Martin-lez-Tatinghem, Bergues, Gravelines, Aire-sur-la-Lys, etc.

TÉLÉPHONE URGENCE: 03 66 10 01 34 (Lun-Sam 8h-18h, urgence 7j/7)

TON:
- Chaleureux, professionnel, humain
- Tutoyer le client est INTERDIT — toujours vouvoyer
- Phrases courtes, claires
- Pas d'émojis excessifs (1 max par message, pour la chaleur)
- Si urgence (dégât des eaux, plus de chauffage l'hiver, porte claquée la nuit) → PROPOSER d'appeler immédiatement le 03 66 10 01 34

RÈGLES STRICTES:
- Ne JAMAIS inventer de prix au-delà des formules d'entretien ci-dessus
- Ne JAMAIS promettre un délai exact (sauf urgence 7j/7)
- Pour les devis sur travaux, TOUJOURS rediriger vers : devis gratuit sous 48h après visite technique
- Si le client est manifestement en détresse → proposer le téléphone
- Si la question sort du périmètre métier → réorienter poliment
- Récolter au minimum : prénom, ville, téléphone OU email (en 2-3 messages max)
- Une fois les coordonnées récoltées : confirmer qu'un conseiller rappelle sous 24h

CTAs PROPOSÉES SELON BESOIN:
- Dépannage simple : "Réserver en ligne sur /nos-prestations"
- Devis travaux : "Demander un devis sur /contact"
- Contrat entretien : "Voir les formules sur /contrats-entretien"
- Urgence : "Appelez tout de suite le 03 66 10 01 34"

Reste concis : maximum 3-4 phrases par réponse.`;

interface ChatInput {
  session_id: string;
  message: string;
  history?: { role: string; content: string }[];
  user_info?: { email?: string; phone?: string; name?: string };
  page_url?: string;
  user_agent?: string;
}

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    // @ts-ignore Deno.env
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    // @ts-ignore Deno.env
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(supabaseUrl, supabaseAnonKey);

    const body: ChatInput = await req.json();
    if (!body.session_id || !body.message) {
      return json({ error: "session_id et message requis" }, 400);
    }

    // Récupérer la clé Anthropic depuis app_settings
    const { data: settings, error: setErr } = await sb
      .from("app_settings").select("value").eq("key", "anthropic").single();
    if (setErr || !settings?.value?.api_key) {
      return json({ error: "Clé Anthropic non configurée" }, 400);
    }
    const apiKey = settings.value.api_key;
    const model  = settings.value.model || "claude-haiku-4-5-20251001";

    // Charger conversation existante
    const { data: existingConv } = await sb
      .from("chat_conversations")
      .select("*")
      .eq("session_id", body.session_id)
      .maybeSingle();

    const history = (existingConv?.messages || []) as Array<{ role: string; content: string; ts?: string }>;

    // Ajouter le message user
    const userMsg = { role: "user", content: body.message, ts: new Date().toISOString() };
    history.push(userMsg);

    // Préparer le contexte pour Claude (max 20 derniers messages)
    const recentHistory = history.slice(-20).map(m => ({ role: m.role, content: m.content }));

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
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: recentHistory
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return json({ error: "Claude API error: " + errText.slice(0, 300) }, 502);
    }

    const data = await r.json();
    const reply = data?.content?.[0]?.text || "Désolé, je n'ai pas pu vous répondre. Appelez-nous au 03 66 10 01 34.";
    const usage = data?.usage || {};
    const totalTokens = (usage.input_tokens || 0) + (usage.output_tokens || 0);

    // Ajouter la réponse de l'assistant
    const botMsg = { role: "assistant", content: reply, ts: new Date().toISOString() };
    history.push(botMsg);

    // Détecter topic, métier, lead automatiquement à partir des messages user
    const allUserText = history.filter(m => m.role === "user").map(m => m.content).join(" ").toLowerCase();
    let metier: string | null = null;
    if (/fuite|plomb|robinet|wc|évier|sanitaire/.test(allUserText)) metier = "plomberie";
    else if (/chaud|radiateur|chauffage|gaz|fioul/.test(allUserText)) metier = "chauffage";
    else if (/[ée]lectric|courant|disjoncteur|prise/.test(allUserText)) metier = "electricite";
    else if (/serrur|porte|cl[ée]/.test(allUserText)) metier = "serrurerie";
    else if (/vitre|vitrage|bris/.test(allUserText)) metier = "vitrerie";
    else if (/travaux|rénovation|salle de bain|cuisine|peinture/.test(allUserText)) metier = "renovation";

    let topic: string | null = null;
    if (/devis|estimer|combien|prix|tarif/.test(allUserText)) topic = "devis";
    else if (/urgen|fuite|panne|cassé|bloqué/.test(allUserText)) topic = "urgence";
    else if (/contrat|entretien annuel|maintenance/.test(allUserText)) topic = "contrat";

    // Détecter lead captured
    const emailMatch = allUserText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    const phoneMatch = allUserText.match(/(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);
    const leadCaptured = !!(body.user_info?.email || body.user_info?.phone || emailMatch || phoneMatch);

    const newTotalTokens = (existingConv?.total_tokens || 0) + totalTokens;

    if (existingConv) {
      // UPDATE
      await sb.from("chat_conversations")
        .update({
          messages: history,
          topic: topic || existingConv.topic,
          metier: metier || existingConv.metier,
          user_email: body.user_info?.email || existingConv.user_email || (emailMatch?.[0] ?? null),
          user_phone: body.user_info?.phone || existingConv.user_phone || (phoneMatch?.[0] ?? null),
          user_name: body.user_info?.name || existingConv.user_name,
          lead_captured: leadCaptured,
          total_tokens: newTotalTokens
        })
        .eq("id", existingConv.id);
    } else {
      // INSERT
      await sb.from("chat_conversations").insert({
        session_id: body.session_id,
        messages: history,
        topic,
        metier,
        user_email: body.user_info?.email || (emailMatch?.[0] ?? null),
        user_phone: body.user_info?.phone || (phoneMatch?.[0] ?? null),
        user_name: body.user_info?.name || null,
        lead_captured: leadCaptured,
        total_tokens: totalTokens,
        page_url: body.page_url || null,
        user_agent: body.user_agent || null
      });
    }

    return json({
      ok: true,
      reply,
      session_id: body.session_id,
      lead_captured: leadCaptured,
      topic,
      metier
    });

  } catch (e: any) {
    return json({ error: "Erreur serveur: " + e.message }, 500);
  }
});
