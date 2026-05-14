// ═══════════════════════════════════════════════════════════════
// Edge Function : sitemap
// Génère sitemap.xml dynamique depuis Supabase
// ═══════════════════════════════════════════════════════════════
// Déploiement : supabase functions deploy sitemap --no-verify-jwt
// Accessible publiquement : https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/sitemap
// Référencer cette URL dans robots.txt
// ═══════════════════════════════════════════════════════════════

// @ts-ignore Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://www.helpconfort-saintomer.fr";

const STATIC_PAGES = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/a-propos.html", priority: 0.7, freq: "monthly" },
  { path: "/contact.html", priority: 0.8, freq: "monthly" },
  { path: "/realisations.html", priority: 0.9, freq: "weekly" },
  { path: "/zones-intervention.html", priority: 0.7, freq: "monthly" },
  { path: "/actualites.html", priority: 0.6, freq: "weekly" },
  // Pages métiers
  { path: "/plombier-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/chauffagiste-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/electricien-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/serrurier-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/travaux-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/depannage-saint-omer.html", priority: 0.9, freq: "monthly" },
  { path: "/depannage-dunkerque.html", priority: 0.9, freq: "monthly" },
  // Zones locales (SEO local)
  { path: "/depannage-longuenesse.html", priority: 0.8, freq: "monthly" },
  { path: "/depannage-arques.html", priority: 0.8, freq: "monthly" },
  { path: "/depannage-saint-martin-lez-tatinghem.html", priority: 0.8, freq: "monthly" },
  { path: "/depannage-bergues.html", priority: 0.8, freq: "monthly" },
  { path: "/depannage-gravelines.html", priority: 0.8, freq: "monthly" },
  // Services & catalogue
  { path: "/nos-prestations.html", priority: 0.9, freq: "weekly" },
  { path: "/contrats-entretien.html", priority: 0.85, freq: "monthly" },
  { path: "/sinistres.html", priority: 0.7, freq: "monthly" },
  { path: "/pro.html", priority: 0.7, freq: "monthly" },
  { path: "/processus.html", priority: 0.6, freq: "monthly" },
  { path: "/aides.html", priority: 0.7, freq: "monthly" },
  // Guides (contenu SEO long form)
  { path: "/guides.html", priority: 0.7, freq: "monthly" },
  { path: "/guide-fuite-eau.html", priority: 0.7, freq: "monthly" },
  { path: "/guide-entretien-chaudiere.html", priority: 0.7, freq: "monthly" },
  { path: "/guide-mise-aux-normes-electriques.html", priority: 0.7, freq: "monthly" },
  { path: "/guide-adaptation-pmr.html", priority: 0.7, freq: "monthly" },
  // Pages support
  { path: "/carrieres.html", priority: 0.6, freq: "monthly" },
  { path: "/espace-client.html", priority: 0.5, freq: "monthly" },
  { path: "/mentions-legales.html", priority: 0.3, freq: "yearly" }
];

// @ts-ignore Deno
Deno.serve(async (req: Request) => {
  try {
    // @ts-ignore Deno.env
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

    // Charger toutes les réalisations publiées
    const { data: reals } = await sb
      .from("realisations")
      .select("slug,published_at,updated_at")
      .eq("status", "publie")
      .order("published_at", { ascending: false });

    // Charger les actualités publiées (table optionnelle)
    let actus: any[] = [];
    try {
      const r = await sb
        .from("actualites")
        .select("slug,published_at,updated_at")
        .eq("status", "publie")
        .order("published_at", { ascending: false });
      actus = r.data || [];
    } catch (_) { /* table optionnelle */ }

    const urls: string[] = [];

    // Pages statiques
    STATIC_PAGES.forEach(p => {
      urls.push(`  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`);
    });

    // Pages détail réalisations
    (reals || []).forEach(r => {
      const lastmod = (r.updated_at || r.published_at || "").slice(0, 10);
      urls.push(`  <url>
    <loc>${SITE_URL}/realisation.html?slug=${encodeURIComponent(r.slug)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });

    // Pages détail actualités (si la table existe)
    actus.forEach(a => {
      const lastmod = (a.updated_at || a.published_at || "").slice(0, 10);
      urls.push(`  <url>
    <loc>${SITE_URL}/actualites/${encodeURIComponent(a.slug)}.html</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
        "access-control-allow-origin": "*"
      }
    });

  } catch (e: any) {
    return new Response("Error: " + e.message, { status: 500 });
  }
});
