// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-20 (assainissement, directive 5732805778).
// Cette fonction tournait en production SANS source dans le dépôt (déployée à la main le 2026-05-29).
// Copie exacte de la version déployée : version 1, verify_jwt = false.
// Elle alimente la vitrine « Nos derniers chantiers » et la page Réalisations (29 appels dans le site).
// Toute modification doit être déployée explicitement — un déploiement de fonction edge est une
// décision humaine (cf. docs/dev/DEPLOYMENT.md).
// ═════════════════════════════════════════════════════════════════════════
// realisations-json — Sert le JSON realisations à jour, depuis Supabase
// Remplace le fichier statique content/realisations/index.json
// v1.0 (2026-05-29)
// ═════════════════════════════════════════════════════════════════════════
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=120, stale-while-revalidate=600'
};

// Heuristique : un titre commençant par certains termes ou marqueurs "actu"
// n'est PAS un vrai chantier — on le marque est_chantier:false
function guessEstChantier(r: any): boolean {
  if (r.status === 'actu') return false;
  const t = ((r.title || '') + ' ' + (r.description || '')).toLowerCase();
  // Actus : voeux, campagne, conseil, info
  if (/v[œoe]ux|meilleurs voeux|belles fêtes|spot tv|sur vos écrans|saviez-vous|n.oubliez pas|gaspillé|en plein hiver|envie de remplacer/.test(t)) return false;
  // Marqueurs forts d'intervention
  if (/remplacement|réparation|dépannage|intervention|pose|installation|fuite|débouch/.test(t)) return true;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await sb
      .from('realisations')
      .select('id,title,slug,description,description_long,metier,ville,date_intervention,image_before,image_after,published_at,created_at,pinned,status,ai_generated')
      .eq('status', 'publie')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Format compatible avec l'ancien content/realisations/index.json
    const out = (data || []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      description_long: r.description_long,
      date: r.published_at || r.created_at,
      date_intervention: r.date_intervention,
      metier: r.metier,
      ville: r.ville,
      zone: r.ville,
      photo_avant: r.image_before || '',
      photo_apres: r.image_after || '',
      image: r.image_after || r.image_before || '',
      image_before: r.image_before || null,
      image_after: r.image_after || null,
      photos: r.image_after ? [r.image_after] : [],
      pinned: r.pinned === true,
      est_chantier: guessEstChantier(r),
      published: true,
      published_at: r.published_at
    }));

    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (e) {
    console.error('[realisations-json] crash:', e);
    return new Response(JSON.stringify({ error: String(e), data: [] }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
