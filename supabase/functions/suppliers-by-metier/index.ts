// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// suppliers-by-metier v1 (2026-07-25) — Lot 2
// Retourne les fournisseurs actifs filtrés par métier (lowercase),
// triés is_preferred DESC puis nom. Source unique Supabase.
// Utilisé par le composant "Marques que nous installons" sur les pages métier.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url);
  const metier = (url.searchParams.get('metier') || '').toLowerCase().trim();
  if (!metier) {
    return new Response(JSON.stringify({ error: 'param `metier` requis (ex: plomberie, chauffage, electricite, serrurerie, vitrerie, renovation, volets)' }), { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await sb
    .from('suppliers')
    .select('name,slug,logo_url,website,tagline,description,is_preferred,category,gammes')
    .eq('active', true)
    .contains('metiers', [metier])
    .order('is_preferred', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } });
  }
  return new Response(JSON.stringify({ metier, count: data?.length || 0, suppliers: data || [] }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=1800',
      ...CORS
    }
  });
});
