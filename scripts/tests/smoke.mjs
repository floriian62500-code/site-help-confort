#!/usr/bin/env node
/* Smoke test des parcours critiques Help Confort (recette). Aucune donnée écrite.
 * Usage : node scripts/tests/smoke.mjs [baseURL]
 * Sortie : liste PASS/FAIL + exit code 0/1. Réutilisable en CI/régression. */
const BASE = process.argv[2] || 'https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app';
const SUPA = 'https://btcbjwqiivhpwoszomhg.supabase.co';
const KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
let pass = 0, fail = 0;
const ok = (n) => { console.log('  ✅', n); pass++; };
const ko = (n, d) => { console.log('  ❌', n, '—', d); fail++; };

async function status(path) {
  const r = await fetch(BASE + path, { headers: { 'Cache-Control': 'no-store' } });
  return r.status;
}
async function run() {
  console.log('SMOKE TEST — base:', BASE);
  // 1. Pages critiques → 200
  const pages = ['/', '/nos-prestations.html', '/plombier-saint-omer.html', '/contact.html', '/zones-intervention.html', '/404.html'];
  for (const p of pages) {
    const s = await status(p);
    (p === '/404.html' ? s === 404 || s === 200 : s === 200) ? ok('HTTP ' + s + ' ' + p) : ko('HTTP ' + s + ' ' + p, 'attendu 200');
  }
  // 2. Catalogue Supabase (parcours commercial) : services à prix
  try {
    const r = await fetch(`${SUPA}/rest/v1/v_services_public?select=slug,requires_quote`, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } });
    const rows = await r.json();
    const priced = Array.isArray(rows) ? rows.filter(x => !x.requires_quote).length : 0;
    priced >= 10 ? ok(`Catalogue: ${priced} prestations à prix`) : ko('Catalogue', `seulement ${priced} à prix`);
  } catch (e) { ko('Catalogue', e.message); }
  // 3. Anti-régression : clé anon legacy NE doit PAS être servie dans le HTML
  const home = await (await fetch(BASE + '/?z=' + Date.now())).text();
  home.includes('role":"anon"') && home.includes('eyJhbGci') ? ko('anon JWT legacy', 'présent dans le HTML') : ok('Pas d\'anon JWT legacy dans le HTML');
  // 4. Anti-régression : pas de promesse « payer en ligne » client (Stripe gelé)
  const nosprest = await (await fetch(BASE + '/nos-prestations.html?z=' + Date.now())).text();
  /r[ée]servation en ligne|acompte 40/i.test(nosprest) ? ko('Honnêteté paiement', 'promesse en ligne résiduelle') : ok('Pas de promesse paiement en ligne résiduelle');
  // 5. Funnel présent : le wizard de réservation + son CTA « sans paiement en ligne » (T1)
  (home.includes('id="hc-reservation"') && /sans paiement en ligne/i.test(home)) ? ok('Funnel réservation présent (CTA sans paiement en ligne)') : ko('Funnel réservation', 'wizard/CTA introuvable');
  // 6. Anti-régression sécurité (T8) : pages admin PAT/promote-to-prod NON servies publiquement
  const s1 = await status('/admin-pro/valider-staging.html');
  const s2 = await status('/admin-pro/photos.html');
  (s1 === 404 && s2 === 404) ? ok('Pages admin PAT/promote bloquées (404/404)') : ko('Sécurité admin', `valider-staging=${s1} photos=${s2} (attendu 404)`);
  // 7. Anti-régression : validateurs wizard hoistés présents (fix erreurs inline T2)
  home.includes('Validateurs partagés (hoistés)') ? ok('Wizard : validateurs hoistés présents (erreurs inline)') : ko('Wizard validateurs', 'hoist absent (régression T2)');

  console.log(`\nRÉSULTAT : ${pass} PASS / ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
}
run().catch(e => { console.error('ERREUR:', e); process.exit(1); });
