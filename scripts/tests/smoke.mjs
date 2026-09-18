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
  // 5. Home = point d'entrée vers le moteur unifié + formulaire de rappel secondaire (UX-COMMERCE-1)
  (home.includes('id="hc-reservation"') && /paiement en ligne à ce stade/i.test(home) && home.includes('hrrForm')) ? ok('Home = redirect moteur + rappel (bloc unifié)') : ko('Home redirect', 'bloc redirect/rappel introuvable');
  // 6. Anti-régression sécurité (T8) : pages admin PAT/promote-to-prod NON servies publiquement
  const s1 = await status('/admin-pro/valider-staging.html');
  const s2 = await status('/admin-pro/photos.html');
  (s1 === 404 && s2 === 404) ? ok('Pages admin PAT/promote bloquées (404/404)') : ko('Sécurité admin', `valider-staging=${s1} photos=${s2} (attendu 404)`);
  // 7. Legacy retiré : plus d'ancien sélecteur unique ni écran 3 voies dans le home (UX-COMMERCE-1 / commit E)
  (!/proposePrestations|detectDetailedPresta|renderPrestaProposals|Autre prestation|mq-card-urgent|Prise en charge TTC/.test(home)) ? ok('Legacy retiré (0 sélecteur/3-voies dans le home)') : ko('Legacy', 'ancien tunnel encore présent');

  // 8. Module « Ma demande » v2 : entrée 2 intentions + intervention + devis + envoi réel (catalogue.html)
  const cat = await status('/catalogue.html');
  const catHtml = cat===200 ? await (await fetch(BASE+'/catalogue.html?z='+Date.now())).text() : '';
  // Le module est servi en composant partagé (page + fenêtre premium de l'accueil) : la preuve porte sur l'asset.
  const modJs = await (await fetch(BASE+'/assets/hc-demande.js?z='+Date.now())).text().catch(() => '');
  const engineOk = cat===200 && catHtml.includes('hc-demande.js') && catHtml.includes('hc-cart.js') &&
    modJs.includes('data-choose="intervention"') && modJs.includes('data-choose="devis"') &&
    modJs.includes('data-step="demande"') && modJs.includes('data-step="creneau"') && modJs.includes('submit-lead-v6');
  engineOk ? ok('Module demande v2 complet (entrée 2 intentions + intervention + envoi)') : ko('Module demande v2', 'entrée/intervention/envoi incomplet (HTTP '+cat+')');
  // 9. Module : lieu + zone, aide au choix, parcours devis avec photos
  (modJs.includes('id="zoneBox"') && modJs.includes('data-prec="aide"') && modJs.includes('data-step="dv-photos"') && modJs.includes('upload-lead-photos')) ? ok('Module : zone + aide au choix + devis photos') : ko('Module parcours', 'zone/aide/devis photos absent');
  // 10. Non-régression modale tarifs : input adresse marqué data-autocomplete-skip (évite le wipe CP/ville)
  const nosp = await (await fetch(BASE+'/nos-prestations.html?z='+Date.now())).text();
  (nosp.includes('id="nvLgAdresse"') && /nvLgAdresse[^>]*data-autocomplete-skip|data-autocomplete-skip[^>]*id="nvLgAdresse"/.test(nosp)) ? ok('Modale tarifs : adresse skip (CP/ville non wipes)') : ko('Modale tarifs adresse', 'skip absent');
  // 11. Entrée transactionnelle principale = « Demander une intervention » → module (vocabulaire demande, pas commande)
  (home.includes('Demander une intervention') && home.includes('/catalogue') && !home.includes('Décrire mon besoin')) ? ok('Entrée principale = module (Demander une intervention)') : ko('Entrée module', 'CTA principal ne pointe pas le module');
  // 12. Accueil : les CTA ouvrent la fenêtre premium (module chargé à la demande), avec repli navigation
  const modCss = await status('/assets/hc-demande.css');
  (home.includes('HcDemande.open(') && home.includes('/assets/hc-demande.js') && modCss===200)
    ? ok('Accueil : tunnel en fenêtre premium (chargement à la demande)')
    : ko('Accueil fenêtre premium', 'ouverture depuis la home absente (CSS HTTP '+modCss+')');

  console.log(`\nRÉSULTAT : ${pass} PASS / ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
}
run().catch(e => { console.error('ERREUR:', e); process.exit(1); });
