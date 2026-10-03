// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// smoke-tests-staging — même logique que prod mais sur l'URL preview Netlify de la branche staging.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Test = { url: string; name: string; must_contain?: string[]; must_not_contain?: string[]; min_size?: number };

const BASE = 'https://staging--remarkable-dragon-364e2b.netlify.app';

const TESTS: Test[] = [
  { url: BASE + '/', name: 'Home', must_contain: ['HELP Confort','Saint-Omer','Plomberie','03 66 10 01 34'], min_size: 50000 },
  { url: BASE + '/plombier-saint-omer.html', name: 'Plombier Saint-Omer', must_contain: ['Plomberie','plombier','Saint-Omer','hc-megamenu'], min_size: 80000 },
  { url: BASE + '/contact.html', name: 'Contact', must_contain: ['name="prenom"','name="nom"','name="tel"','name="adresse"','name="cp"','name="ville"','name="email"'], min_size: 50000 },
  { url: BASE + '/pmr-saint-omer.html', name: 'PMR Saint-Omer', must_contain: ['MaPrimeAdapt','adaptation','hc-partners-pmr','data-partner-tag="pmr"'], min_size: 80000 },
  { url: BASE + '/maprimeadapt.html', name: 'MaPrimeAdapt', must_contain: ['MaPrimeAdapt','70%','22 000','Diagnostic gratuit'], min_size: 5000 },
  { url: BASE + '/admin-pro/leads.html', name: 'Admin Leads', must_contain: ['Demandes clients'], min_size: 1000 },
  { url: BASE + '/admin-pro/analytics.html', name: 'Admin Analytics (KPI clicks)', must_contain: ['Clics actions client','clickEventsKPI','click_events'], min_size: 60000 },
  { url: BASE + '/sitemap.xml', name: 'Sitemap', must_contain: ['urlset','depan59-62.fr','maprimeadapt'], min_size: 10000 },
];

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const results: any[] = [];
  for (const t of TESTS) {
    const result: any = { name: t.name, url: t.url };
    try {
      const start = Date.now();
      const r = await fetch(t.url, { headers: { 'Cache-Control': 'no-cache' } });
      const text = await r.text();
      result.status = r.status;
      result.size = text.length;
      result.ms = Date.now() - start;
      result.ok = r.ok && (!t.min_size || text.length >= t.min_size);
      result.missing = [];
      result.found_extra = [];
      for (const m of (t.must_contain || [])) {
        if (!text.includes(m)) result.missing.push(m);
      }
      for (const m of (t.must_not_contain || [])) {
        if (text.includes(m)) result.found_extra.push(m);
      }
      if (result.missing.length || result.found_extra.length) result.ok = false;
    } catch (e: any) {
      result.ok = false; result.error = e.message;
    }
    results.push(result);
  }

  const failed = results.filter(r => !r.ok);
  const summary = {
    timestamp: new Date().toISOString(),
    branch: 'staging',
    base_url: BASE,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };
  await sb.from('smoke_test_results').insert({
    summary,
    failed_count: failed.length,
    all_passed: failed.length === 0
  });
  return new Response(JSON.stringify(summary, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
