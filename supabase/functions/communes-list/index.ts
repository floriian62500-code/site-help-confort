// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-20 (assainissement, directive 5732805778).
// Cette fonction tournait en production SANS source dans le dépôt (déployée à la main le 2026-07-25).
// Code identique à la version déployée (seul cet en-tête a été ajouté) : version 1, verify_jwt = false.
// Elle alimente le composant « Zone d'intervention » des pages métier (7 appels dans le site).
// Toute modification doit être déployée explicitement (cf. docs/dev/DEPLOYMENT.md).
// communes-list v1 (2026-07-25) — Lot 2 §2
// Retourne les communes actives groupées par zone (audomarois / calaisis / boulonnais / dunkerque),
// triées par iris_count DESC (proxy population) puis nom.
// Utilisé par le composant "Zone d'intervention" sur les pages métier.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await sb
    .from('communes')
    .select('nom,code_postal,zone,agence,iris_count')
    .eq('active', true)
    .order('iris_count', { ascending: false, nullsFirst: false })
    .order('nom', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  // Groupement par zone
  const zones: Record<string, any[]> = { audomarois: [], calaisis: [], boulonnais: [], dunkerque: [] };
  for (const c of (data || [])) {
    const z = c.zone || 'autre';
    if (!zones[z]) zones[z] = [];
    zones[z].push({ nom: c.nom, cp: c.code_postal, agence: c.agence });
  }
  return new Response(JSON.stringify({
    total: data?.length || 0,
    zones,
    agences: {
      'saint-omer': (data || []).filter((c: any) => c.agence === 'saint-omer').length,
      'dunkerque': (data || []).filter((c: any) => c.agence === 'dunkerque').length
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ...CORS
    }
  });
});
