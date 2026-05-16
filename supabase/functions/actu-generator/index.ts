// ═══════════════════════════════════════════════════════════════════════════
// actu-generator — Agent IA qui génère des actus locales pour HC Saint-Omer/Dunkerque
// v1.0 (2026-05-16)
// ═══════════════════════════════════════════════════════════════════════════
// Modes :
//   - Manuel : { mode: "manual", topic?: string, count?: number=3 }
//     → Génère N actus à partir d'un sujet libre. Renvoie les propositions
//       sans rien insérer en DB (preview).
//
//   - Insert : { mode: "insert", actus: [{title, description, metier, ...}] }
//     → Insère les actus sélectionnées en DB avec status='validation'.
//
//   - Auto : { mode: "auto", count?: number=4 }
//     → Choisit auto un thème saisonnier + métier en rotation. Génère N actus
//       et les INSERT direct (utilisé par le cron hebdo).
//
// Body : voir ci-dessus.
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

// ─── Thèmes saisonniers (mode auto) ──────────────────────────────────────────
const SEASONAL_TOPICS = {
  1: ['froid extrême et chaudière qui peine', 'aides MaPrimeRénov 2026', 'thermostat programmable'],
  2: ['fuite suite au gel', 'détartrage chauffe-eau', 'volets isolation thermique'],
  3: ['rénovation salle de bain printemps', 'entretien chaudière avant printemps', 'vérification toiture'],
  4: ['adaptation PMR douche italienne', 'volets motorisés pour le printemps', 'détection fuite cachée'],
  5: ['climatisation/ventilation avant l\'été', 'fuite eau pour vacances', 'rénovation cuisine'],
  6: ['canicule et chauffe-eau', 'cambriolages été et serrurerie', 'piscine et électricité'],
  7: ['vacances : vérifier ses installations avant de partir', 'volets roulants en plein soleil', 'WC qui coule à vide'],
  8: ['rentrée scolaire et électricité', 'préparation hiver chaudière', 'fenêtres double vitrage'],
  9: ['entretien annuel chaudière obligatoire', 'isolation avant froid', 'tableau électrique aux normes'],
  10: ['hiver : éviter la fuite gel', 'aides MaPrimeAdapt seniors', 'isolation comble'],
  11: ['contrat entretien chaudière formule', 'porte d\'entrée sécurisée hiver', 'éclairage extérieur led'],
  12: ['fêtes : éviter l\'incendie électrique', 'cumulus en panne pendant les fêtes', 'serrurerie cadeau'],
};
const METIERS_ROTATION = ['plomberie', 'chauffage', 'electricite', 'serrurerie', 'vitrerie', 'renovation'];

// ─── Prompt système ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es un expert en communication digitale pour HELP Confort Saint-Omer / Dunkerque (Nord/Pas-de-Calais), artisan multi-services local.

Métiers : plomberie, chauffage, électricité, serrurerie, vitrerie, rénovation, adaptation PMR.
Zones : Saint-Omer, Dunkerque, Arques, Longuenesse, Gravelines, Coudekerque, etc.
Téléphone : 03 66 10 01 34. Site : depan59-62.fr

TON : Conseil pratique, accessible, chaleureux. Pas slogan corporate. Comme un voisin pro qui partage son savoir.
Format actu site web :
- TITRE : court (40-70 caractères), format "Pourquoi X" / "Comment Y" / "Quand faut-il Z"
- DESCRIPTION : 180-260 caractères, 1-2 phrases. Accroche concrète + bénéfice client + mention locale.
- MÉTIER : un seul mot dans cette liste exacte : plomberie, chauffage, electricite, serrurerie, vitrerie, renovation, autre
- VILLE : Saint-Omer (par défaut)

CONTRAINTES :
- Pas d'émoji excessif (0 à 1 max, en début de titre OK)
- Pas de superlatifs creux ("incroyable", "magique")
- Pas de promesses prix sans devis
- Reformuler à chaque fois (jamais 2 actus identiques)
- Toujours mention "Saint-Omer / Dunkerque" ou une ville locale dans la description

Réponse OBLIGATOIRE en JSON pur (sans markdown ni \`\`\`), format :
{
  "actus": [
    {"title": "...", "description": "...", "metier": "...", "ville": "Saint-Omer"},
    ...
  ]
}`;

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getAnthropicKey(sb: any): Promise<string | null> {
  const { data } = await sb.from('app_settings').select('value').eq('key', 'claude').maybeSingle();
  return data?.value?.api_key || Deno.env.get('ANTHROPIC_API_KEY') || null;
}

async function generateActus(apiKey: string, topic: string, count: number): Promise<any[]> {
  const userPrompt = `Génère ${count} actualités courtes (titre + description) sur le thème : "${topic}". Chacune doit être unique et utile pour un client local.`;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  // Parse JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Réponse Claude non JSON : ' + text.slice(0, 200));
  const parsed = JSON.parse(jsonMatch[0]);
  return Array.isArray(parsed.actus) ? parsed.actus : [];
}

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || ('actu-' + Date.now());
}

async function insertActus(sb: any, actus: any[], topic: string): Promise<string[]> {
  const rows = actus.map((a: any) => ({
    title: a.title?.slice(0, 200) || 'Sans titre',
    description: a.description?.slice(0, 600) || '',
    metier: (a.metier || 'autre').toLowerCase(),
    ville: a.ville || 'Saint-Omer',
    status: 'validation',
    slug: slugify(a.title || 'actu') + '-' + Date.now() + '-' + Math.floor(Math.random()*1000),
    ai_generated: {
      post_type: 'actualite',
      imported_from: 'ai_generator',
      generated_at: new Date().toISOString(),
      topic: topic,
      model: 'claude-sonnet-4-5'
    }
  }));
  const { data, error } = await sb.from('realisations').insert(rows).select('id');
  if (error) throw error;
  return (data || []).map((r: any) => r.id);
}

// ─── Handler principal ─────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const mode = body.mode || 'manual';

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const apiKey = await getAnthropicKey(sb);
    if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY manquant. Configure-la dans app_settings.claude.api_key ou en secret Supabase.' }, 500);

    // ─── Mode MANUAL : préview sans insert ───
    if (mode === 'manual') {
      const topic = body.topic?.trim() || 'conseils généraux multi-services Saint-Omer Dunkerque';
      const count = Math.min(Math.max(body.count || 3, 1), 8);
      const actus = await generateActus(apiKey, topic, count);
      return json({ ok: true, mode, topic, actus });
    }

    // ─── Mode INSERT : ajoute en DB ───
    if (mode === 'insert') {
      const actus = body.actus;
      if (!Array.isArray(actus) || actus.length === 0) return json({ error: 'actus[] required' }, 400);
      const ids = await insertActus(sb, actus, body.topic || 'manual_selection');
      return json({ ok: true, mode, inserted: ids.length, ids });
    }

    // ─── Mode AUTO : choisit thème + génère + insert ───
    if (mode === 'auto') {
      const count = Math.min(Math.max(body.count || 4, 1), 8);
      const month = new Date().getMonth() + 1;
      const seasonalTopics = SEASONAL_TOPICS[month] || ['conseils de saison'];
      const topic = seasonalTopics[Math.floor(Math.random() * seasonalTopics.length)];
      const metierFocus = METIERS_ROTATION[(month + new Date().getDate()) % METIERS_ROTATION.length];
      const fullTopic = `${topic} (focus métier : ${metierFocus})`;
      const actus = await generateActus(apiKey, fullTopic, count);
      const ids = await insertActus(sb, actus, fullTopic);
      return json({ ok: true, mode, topic: fullTopic, inserted: ids.length, ids });
    }

    return json({ error: 'mode invalide (manual|insert|auto)' }, 400);

  } catch (e) {
    console.error('[actu-generator] crash:', e);
    return json({ error: 'server error', detail: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
