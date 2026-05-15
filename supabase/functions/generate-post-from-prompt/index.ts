// ═══════════════════════════════════════════════════════════════════════════
// generate-post-from-prompt — Génère un post à partir d'un sujet/prompt texte
// v2026-05-14 — redeploy avec --no-verify-jwt forcé
// ═══════════════════════════════════════════════════════════════════════════
// Appelée depuis templates.html quand l'utilisateur clique "Générer avec l'IA"
// sur un sujet de post. Reçoit le prompt, appelle Claude (Anthropic), renvoie
// le post généré.
//
// Body : { prompt: string, system?: string }
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const DEFAULT_SYSTEM = `Tu es un expert en communication digitale pour HELP! Confort, un artisan multi-services basé à Saint-Omer et Dunkerque (Nord/Pas-de-Calais).

Métiers : plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation, adaptation PMR.
Ton : chaleureux, professionnel, accessible. Tutoiement bienveillant côté client. Pas de jargon technique inutile.
Format : Facebook/Instagram, 600-900 caractères, émojis pertinents (pas excessifs), hashtags pertinents en fin (#helpconfort #saintomer ou #dunkerque + métier + thème).

Contraintes :
- Toujours mentionner les zones d'intervention quand pertinent (Saint-Omer & Dunkerque)
- Téléphone : 03 66 10 01 34
- Pas de promesses trompeuses, pas de termes superlatifs creux
- Inclure un appel à l'action concret (RDV, devis gratuit, etc.)
- Pas de prix sauf si explicitement demandé dans le prompt
- Format final : texte brut, prêt à coller dans Facebook/Instagram

Réponds UNIQUEMENT avec le post final, sans préambule type "Voici un post...". Le texte que tu produis sera collé tel quel.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const { prompt, system } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return json({ error: 'prompt required (string)' }, 400);
    }

    // Récupère la clé Anthropic depuis app_settings
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: settings, error: sErr } = await sb
      .from('app_settings')
      .select('value')
      .eq('key', 'anthropic')
      .single();

    if (sErr || !settings?.value?.api_key) {
      return json({
        error: 'anthropic_key_missing',
        message: 'La clé API Anthropic n\'est pas configurée dans Settings → Anthropic.'
      }, 503);
    }

    const apiKey = settings.value.api_key;
    const model = settings.value.model || 'claude-haiku-4-5';

    // Appel Anthropic
    const resp = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: system || DEFAULT_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('[generate-post] Anthropic error:', resp.status, err);
      return json({
        error: 'anthropic_error',
        status: resp.status,
        detail: err.slice(0, 500),
      }, 502);
    }

    const data = await resp.json();
    const content = data?.content?.[0]?.text || '';

    return json({
      ok: true,
      post: content.trim(),
      model,
      usage: data.usage,
    });

  } catch (e) {
    console.error('[generate-post] crash:', e);
    return json({ error: 'server_error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
