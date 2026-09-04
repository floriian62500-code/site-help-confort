#!/usr/bin/env node
// Génère supabase/functions/sitemap/index.ts avec la liste COMPLÈTE des pages du repo
// + réalisations en URL jolie /realisations/{slug}. Exclut pages non-indexables.
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXCLUDE = new Set(['404.html','reset.html','realisation.html','index.html',
  'espace-client.html','espace-client-dashboard.html','plan-du-site.html']);
const isExcluded = f => EXCLUDE.has(f) || /^googlef.*\.html$/.test(f) || /^sitemap.*\.(xml|html)$/.test(f);

function priority(f) {
  if (/^(plombier|chauffagiste|electricien|serrurier|vitrier|menuisier|travaux|volets|pmr)-(saint-omer|dunkerque)\.html$/.test(f)) return [0.9,'monthly'];
  if (/^(plombier|chauffagiste|electricien|serrurier|vitrier|menuisier|travaux|volets|pmr)-/.test(f)) return [0.8,'monthly'];
  if (/^depannage-/.test(f)) return [0.8,'monthly'];
  if (/^(nos-prestations|realisations|contrats-entretien|urgence|devis-express)\.html$/.test(f)) return [0.9,'weekly'];
  if (/^(nos-metiers|nos-villes|zones-intervention|entretien-chaudiere|debouchage-canalisation|ouverture-porte-claquee|remplacement-chauffe-eau|panne-chaudiere|diagnostic-electrique)\.html$/.test(f)) return [0.85,'monthly'];
  if (/^(guide|guides|blog|actualites|faq|temoignages|avant-apres|nos-realisations)/.test(f)) return [0.6,'weekly'];
  if (/^(mentions-legales|garanties|carrieres|reset)/.test(f)) return [0.3,'yearly'];
  return [0.7,'monthly'];
}

const files = readdirSync(ROOT).filter(f => f.endsWith('.html') && !isExcluded(f)).sort();
const staticPages = [{ path:'/', priority:1.0, freq:'weekly' },
  ...files.map(f => { const [p,fr]=priority(f); return { path:'/'+f, priority:p, freq:fr }; })];

const body = `// ═══════════════════════════════════════════════════════════════
// Edge Function : sitemap  (auto-généré par scripts/gen-sitemap-fn.mjs)
// sitemap.xml dynamique : pages statiques (liste complète du repo) + réalisations (URL jolie).
// Déploiement : supabase functions deploy sitemap --no-verify-jwt
// ═══════════════════════════════════════════════════════════════
// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://depan59-62.fr";

const STATIC_PAGES = ${JSON.stringify(staticPages)};

// @ts-ignore Deno
Deno.serve(async (_req: Request) => {
  try {
    // @ts-ignore Deno.env
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: reals } = await sb.from("realisations")
      .select("slug,published_at,updated_at").eq("status", "publie")
      .order("published_at", { ascending: false });
    let actus: any[] = [];
    try {
      const r = await sb.from("actualites").select("slug,published_at,updated_at")
        .eq("status", "publie").order("published_at", { ascending: false });
      actus = r.data || [];
    } catch (_) { /* table optionnelle */ }

    const urls: string[] = [];
    STATIC_PAGES.forEach((p: any) => {
      urls.push(\`  <url>
    <loc>\${SITE_URL}\${p.path}</loc>
    <changefreq>\${p.freq}</changefreq>
    <priority>\${p.priority.toFixed(1)}</priority>
  </url>\`);
    });
    // Réalisations : URL JOLIE indexable (contenu + JSON-LD dans le HTML initial)
    (reals || []).forEach((r: any) => {
      const lastmod = (r.updated_at || r.published_at || "").slice(0, 10);
      urls.push(\`  <url>
    <loc>\${SITE_URL}/realisations/\${encodeURIComponent(r.slug)}</loc>
    \${lastmod ? \`<lastmod>\${lastmod}</lastmod>\` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\`);
    });
    actus.forEach((a: any) => {
      const lastmod = (a.updated_at || a.published_at || "").slice(0, 10);
      urls.push(\`  <url>
    <loc>\${SITE_URL}/actualites/\${encodeURIComponent(a.slug)}.html</loc>
    \${lastmod ? \`<lastmod>\${lastmod}</lastmod>\` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\`);
    });

    const xml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${urls.join("\\n")}
</urlset>\`;
    return new Response(xml, { status: 200, headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*" } });
  } catch (e: any) {
    return new Response("Error: " + e.message, { status: 500 });
  }
});
`;
writeFileSync(join(ROOT,'supabase/functions/sitemap/index.ts'), body);
console.log(`OK sitemap/index.ts régénéré : ${staticPages.length} pages statiques + réalisations (URL jolie).`);
