// ═══════════════════════════════════════════════════════════════
// Edge Function : suggest-prompt-improvement
// Analyse les conversations mal notées et suggère 3-5 améliorations
// concrètes du system prompt du chatbot.
// ═══════════════════════════════════════════════════════════════
//
// Déploiement :
//   supabase functions deploy suggest-prompt-improvement --no-verify-jwt
//
// Appel :
//   POST { min_rating?: 3, limit?: 30 }
//   → { suggestions: [...], summary: "...", analyzed_count: N }
//
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

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    // @ts-ignore Deno.env
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const body = await req.json().catch(() => ({}));
    const minRating = body.min_rating ?? 3;
    const limit = Math.min(body.limit ?? 30, 100);

    // Récupérer clé Anthropic
    const { data: settings } = await sb
      .from("app_settings").select("value").eq("key", "anthropic").single();
    if (!settings?.value?.api_key) {
      return json({ error: "Clé Anthropic non configurée" }, 400);
    }
    const apiKey = settings.value.api_key;
    const model  = settings.value.model || "claude-sonnet-4-6";

    // Charger les conversations mal notées avec notes admin
    const { data: rows, error } = await sb
      .from("chat_conversations")
      .select("messages, rating, rating_notes, topic, metier")
      .lte("rating", minRating)
      .not("rating", "is", null)
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    if (!rows || rows.length === 0) {
      return json({
        ok: true,
        analyzed_count: 0,
        summary: "Aucune conversation notée ≤" + minRating + " trouvée. Encouragez l'équipe à noter régulièrement les conversations dans l'admin.",
        suggestions: []
      });
    }

    // Préparer un résumé des conversations pour Claude
    const samples = rows.map((r: any, i: number) => {
      const msgs = (r.messages || []).slice(-10).map((m: any) =>
        `[${m.role.toUpperCase()}] ${(m.content || "").slice(0, 280)}`
      ).join("\n");
      return `--- Conversation #${i+1} (note: ${r.rating}/5, métier: ${r.metier || "?"}, topic: ${r.topic || "?"}) ---\n${msgs}\nNote admin: ${r.rating_notes || "(aucune)"}\n`;
    }).join("\n");

    const userPrompt = `Tu es expert en prompt-engineering pour chatbots de service client BtoC. Voici ${rows.length} conversations du chatbot HELP Confort (entreprise de dépannage habitat) qui ont été notées comme insatisfaisantes (≤${minRating}/5) par l'équipe admin.

${samples}

Analyse ces échecs et propose :
1. Un résumé en 2-3 phrases des patterns récurrents d'erreurs.
2. 3 à 5 suggestions CONCRÈTES d'ajouts/modifications au system prompt actuel du bot pour corriger ces faiblesses. Chaque suggestion doit être une instruction directe utilisable dans un system prompt (commençant par "Tu dois", "Ne jamais", "Toujours", etc.).
3. Un exemple chiffré de l'impact attendu si on applique ces suggestions.

Réponds en JSON strict :
{
  "summary": "résumé bref des patterns d'erreur",
  "suggestions": [
    { "instruction": "Tu dois...", "rationale": "parce que..." },
    ...
  ],
  "expected_impact": "phrase courte sur l'amélioration attendue"
}`;

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
        system: "Tu es expert en optimisation de chatbots. Réponds toujours en JSON strict, sans préambule, sans markdown.",
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return json({ error: "Claude API error: " + errText.slice(0, 300) }, 502);
    }

    const data = await r.json();
    let raw = data?.content?.[0]?.text || "{}";
    // Nettoie d'éventuels backticks de code-fence
    raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch (_) {
      parsed = { summary: raw.slice(0, 500), suggestions: [], expected_impact: "" };
    }

    return json({
      ok: true,
      analyzed_count: rows.length,
      summary: parsed.summary || "",
      suggestions: parsed.suggestions || [],
      expected_impact: parsed.expected_impact || ""
    });

  } catch (e: any) {
    return json({ error: "Erreur serveur: " + e.message }, 500);
  }
});
