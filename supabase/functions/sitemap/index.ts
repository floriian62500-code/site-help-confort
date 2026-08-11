// Edge Function : sitemap (auto-généré via scripts/gen-sitemap-fn.mjs)
// sitemap.xml dynamique : liste COMPLÈTE des pages du repo + réalisations en URL jolie /realisations/{slug}.
// Déploiement : supabase functions deploy sitemap --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SITE_URL = 'https://depan59-62.fr';

// path priority freq, séparés par | (format compact)
const PACKED = '/ 1 weekly|/a-propos.html 0.7 monthly|/actualites.html 0.6 weekly|/agence-dunkerque.html 0.7 monthly|/agence-saint-omer.html 0.7 monthly|/aides.html 0.7 monthly|/avant-apres.html 0.6 weekly|/blog-comment-detecter-fuite-eau-cachee.html 0.6 weekly|/blog-cout-renovation-salle-de-bain.html 0.6 weekly|/blog-debouchage-canalisation-furet-hydrocurage.html 0.6 weekly|/blog-entretien-chaudiere-annuel-obligatoire.html 0.6 weekly|/blog-fenetres-double-vitrage-pvc-alu-bois.html 0.6 weekly|/blog-isolation-combles-aides-2026.html 0.6 weekly|/blog-panne-electrique-disjoncteur-saute.html 0.6 weekly|/blog-pmr-adapter-salle-de-bain-senior.html 0.6 weekly|/blog-pompe-a-chaleur-air-eau-tout-savoir.html 0.6 weekly|/blog-porte-claquee-cle-perdue-que-faire.html 0.6 weekly|/blog-preparer-sa-maison-hiver-checklist.html 0.6 weekly|/blog-remplacement-chaudiere-gaz-aides-2026.html 0.6 weekly|/blog.html 0.6 weekly|/carrieres.html 0.3 yearly|/chauffagiste-boulogne-sur-mer.html 0.8 monthly|/chauffagiste-calais.html 0.8 monthly|/chauffagiste-coudekerque-branche.html 0.8 monthly|/chauffagiste-dunkerque.html 0.9 monthly|/chauffagiste-marck.html 0.8 monthly|/chauffagiste-outreau.html 0.8 monthly|/chauffagiste-saint-omer.html 0.9 monthly|/chauffagiste-wimereux.html 0.8 monthly|/contact.html 0.7 monthly|/contrats-entretien.html 0.9 weekly|/debouchage-canalisation.html 0.85 monthly|/depannage-arques.html 0.8 monthly|/depannage-bergues.html 0.8 monthly|/depannage-boulogne-sur-mer.html 0.8 monthly|/depannage-calais.html 0.8 monthly|/depannage-coquelles.html 0.8 monthly|/depannage-dunkerque.html 0.8 monthly|/depannage-gravelines.html 0.8 monthly|/depannage-longuenesse.html 0.8 monthly|/depannage-saint-martin-lez-tatinghem.html 0.8 monthly|/depannage-saint-omer.html 0.8 monthly|/depannage-saint-pol-sur-mer.html 0.8 monthly|/depannage-sangatte.html 0.8 monthly|/devis-express.html 0.9 weekly|/diagnostic-electrique.html 0.85 monthly|/electricien-boulogne-sur-mer.html 0.8 monthly|/electricien-calais.html 0.8 monthly|/electricien-dunkerque.html 0.9 monthly|/electricien-saint-omer.html 0.9 monthly|/entretien-chaudiere.html 0.85 monthly|/faq.html 0.6 weekly|/fournisseur.html 0.7 monthly|/garanties.html 0.3 yearly|/guide-adaptation-pmr.html 0.6 weekly|/guide-entretien-chaudiere.html 0.6 weekly|/guide-fuite-eau.html 0.6 weekly|/guide-mise-aux-normes-electriques.html 0.6 weekly|/guides.html 0.6 weekly|/maprimeadapt.html 0.7 monthly|/mentions-legales.html 0.3 yearly|/menuisier-dunkerque.html 0.9 monthly|/menuisier-saint-omer.html 0.9 monthly|/nos-metiers.html 0.85 monthly|/nos-prestations.html 0.9 weekly|/nos-villes.html 0.85 monthly|/notre-equipe.html 0.7 monthly|/ouverture-porte-claquee.html 0.85 monthly|/panne-chaudiere.html 0.85 monthly|/partenaire.html 0.7 monthly|/partenaires.html 0.7 monthly|/plombier-boulogne-sur-mer.html 0.8 monthly|/plombier-calais.html 0.8 monthly|/plombier-coudekerque-branche.html 0.8 monthly|/plombier-coulogne.html 0.8 monthly|/plombier-dunkerque.html 0.9 monthly|/plombier-grande-synthe.html 0.8 monthly|/plombier-guines.html 0.8 monthly|/plombier-le-portel.html 0.8 monthly|/plombier-marck.html 0.8 monthly|/plombier-outreau.html 0.8 monthly|/plombier-saint-martin-boulogne.html 0.8 monthly|/plombier-saint-omer.html 0.9 monthly|/plombier-teteghem.html 0.8 monthly|/plombier-wimereux.html 0.8 monthly|/pmr-dunkerque.html 0.9 monthly|/pmr-saint-omer.html 0.9 monthly|/pro.html 0.7 monthly|/processus.html 0.7 monthly|/realisations.html 0.9 weekly|/remplacement-chauffe-eau.html 0.85 monthly|/reseau-help-confort.html 0.7 monthly|/serrurier-boulogne-sur-mer.html 0.8 monthly|/serrurier-calais.html 0.8 monthly|/serrurier-coudekerque-branche.html 0.8 monthly|/serrurier-dunkerque.html 0.9 monthly|/serrurier-marck.html 0.8 monthly|/serrurier-outreau.html 0.8 monthly|/serrurier-saint-omer.html 0.9 monthly|/serrurier-wimereux.html 0.8 monthly|/sinistres.html 0.7 monthly|/tarifs.html 0.7 monthly|/temoignages.html 0.6 weekly|/travaux-dunkerque.html 0.9 monthly|/travaux-saint-omer.html 0.9 monthly|/urgence.html 0.9 weekly|/vitrier-dunkerque.html 0.9 monthly|/vitrier-saint-omer.html 0.9 monthly|/volets-dunkerque.html 0.9 monthly|/volets-saint-omer.html 0.9 monthly|/zones-intervention.html 0.85 monthly';

const STATIC_PAGES = PACKED.split('|').map((s) => { const a = s.split(' '); return { path: a[0], priority: parseFloat(a[1]), freq: a[2] }; });

Deno.serve(async (_req) => {
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
    const rr = await sb.from('realisations').select('slug,published_at,updated_at').eq('status', 'publie').order('published_at', { ascending: false });
    const reals = rr.data || [];
    let actus = [];
    try {
      const ra = await sb.from('actualites').select('slug,published_at,updated_at').eq('status', 'publie').order('published_at', { ascending: false });
      actus = ra.data || [];
    } catch (_) { /* table optionnelle */ }

    const rows = [];
    for (const p of STATIC_PAGES) {
      rows.push('  <url><loc>' + SITE_URL + p.path + '</loc><changefreq>' + p.freq + '</changefreq><priority>' + p.priority.toFixed(1) + '</priority></url>');
    }
    for (const r of reals) {
      const lm = (r.updated_at || r.published_at || '').slice(0, 10);
      rows.push('  <url><loc>' + SITE_URL + '/realisations/' + encodeURIComponent(r.slug) + '</loc>' + (lm ? '<lastmod>' + lm + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.6</priority></url>');
    }
    for (const a of actus) {
      const lm = (a.updated_at || a.published_at || '').slice(0, 10);
      rows.push('  <url><loc>' + SITE_URL + '/actualites/' + encodeURIComponent(a.slug) + '.html</loc>' + (lm ? '<lastmod>' + lm + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.6</priority></url>');
    }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows.join('\n') + '\n</urlset>';
    return new Response(xml, { status: 200, headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' } });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
});
