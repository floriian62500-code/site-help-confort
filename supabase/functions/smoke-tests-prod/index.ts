// ⚠️ SOURCE RÉCUPÉRÉE DEPUIS LA PRODUCTION le 2026-09-23 (directive 5778526407 §2.D).
// Cette fonction tournait en production SANS source dans le dépôt : elle avait été déployée à la main.
// Code identique à la version déployée (seul cet en-tête a été ajouté).
// Toute modification doit être déployée explicitement : un déploiement de fonction edge est une
// décision humaine (docs/maintainer/DEPLOYMENT.md). Inventaire : docs/audit/FONCTIONS-EDGE-2026-09-23.md
//
// smoke-tests-prod — fetch URLs clés + regex assertions + alerte email si KO
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Test = { url: string; name: string; must_contain?: string[]; must_not_contain?: string[]; min_size?: number };
const TESTS: Test[] = [
  { url: 'https://www.depan59-62.fr/', name: 'Home', must_contain: ['HELP Confort','Saint-Omer','Plomberie','03 66 10 01 34'], min_size: 50000 },
  { url: 'https://www.depan59-62.fr/plombier-saint-omer.html', name: 'Plombier Saint-Omer', must_contain: ['Plomberie','plombier','Saint-Omer','hc-megamenu'], min_size: 80000 },
  { url: 'https://www.depan59-62.fr/contact.html', name: 'Contact', must_contain: ['name="prenom"','name="nom"','name="tel"','name="adresse"','name="cp"','name="ville"','name="email"'], min_size: 50000 },
  { url: 'https://www.depan59-62.fr/pmr-saint-omer.html', name: 'PMR Saint-Omer', must_contain: ['MaPrimeAdapt','adaptation','hc-partners-pmr','data-partner-tag="pmr"'], min_size: 80000 },
  { url: 'https://www.depan59-62.fr/maprimeadapt.html', name: 'MaPrimeAdapt', must_contain: ['MaPrimeAdapt','70%','22 000','Diagnostic gratuit'], min_size: 5000 },
  { url: 'https://www.depan59-62.fr/admin-pro/leads.html', name: 'Admin Leads', must_contain: ['Demandes clients'], min_size: 1000 },
  { url: 'https://www.depan59-62.fr/sitemap.xml', name: 'Sitemap', must_contain: ['urlset','depan59-62.fr','maprimeadapt'], min_size: 10000 },
  { url: 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/partners-json?tag=pmr', name: 'API partners PMR', must_contain: ['"success":true','La Poste','Pauline'], min_size: 1000 },
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
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };

  // Persist
  await sb.from('smoke_test_results').insert({
    summary,
    failed_count: failed.length,
    all_passed: failed.length === 0
  });

  // Alerte si failed
  if (failed.length > 0) {
    const { count } = await sb.from('smoke_test_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 3600_000).toISOString())
      .gt('failed_count', 0);
    if ((count || 0) <= 1) {
      const KEY = Deno.env.get('RESEND_API_KEY');
      if (KEY) {
        const html = `<h2>🤯 Smoke tests prod KO</h2><p>${failed.length}/${results.length} tests échoués :</p><ul>${failed.map(f => `<li><strong>${f.name}</strong> (${f.url})<br>Status: ${f.status}, Size: ${f.size||'?'}, Missing: ${(f.missing||[]).join(', ') || '—'}, Extra: ${(f.found_extra||[]).join(', ') || '—'}, Erreur: ${f.error||'—'}</li>`).join('')}</ul>`;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Monitoring HC <noreply@depan59-62.fr>',
            to: ['florian.dhaillecourt@helpconfort.com'],
            subject: `[SMOKE KO] ${failed.length}/${results.length} tests prod`,
            html
          })
        });
      }
    }
  }
  return new Response(JSON.stringify(summary, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
