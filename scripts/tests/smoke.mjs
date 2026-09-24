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
  // 5. Home = point d'entrée vers le moteur unifié + formulaire de rappel secondaire (UX-COMMERCE-1).
  //    Libellé depuis 84889f40 : « Aucun paiement demandé à ce stade » (le paiement en ligne est facultatif).
  (home.includes('id="hc-reservation"') && /Aucun paiement demandé à ce stade/i.test(home) && !/Aucun paiement en ligne/i.test(home) && home.includes('hrrForm')) ? ok('Home = redirect moteur + rappel (bloc unifié)') : ko('Home redirect', 'bloc redirect/rappel introuvable');
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
  // 12. Accueil : les CTA ouvrent la fenêtre premium (module chargé à la demande), avec repli navigation.
  // Depuis le 23/09, l'ouverture n'est plus recopiée dans la page : elle vit dans le lanceur partagé
  // assets/hc-demande-launch.js, que l'accueil charge. On vérifie donc la chaîne réelle.
  const modCss = await status('/assets/hc-demande.css');
  const launch = await (await fetch(BASE + '/assets/hc-demande-launch.js?z=' + Date.now())).text();
  (/src="[^"]*assets\/hc-demande-launch\.js/.test(home) && launch.includes('HcDemande.open(') && launch.includes('/assets/hc-demande.js') && modCss === 200)
    ? ok('Accueil : tunnel en fenêtre premium (lanceur partagé, chargement à la demande)')
    : ko('Accueil fenêtre premium', 'chaîne accueil → lanceur → module incomplète (CSS HTTP ' + modCss + ')');

  // 13. Campagnes « entretien » : les prix de la page d'atterrissage chaudière = catalogue + contrats en base
  try {
    const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };
    const fmt = n => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 });
    // La landing qui récitait les neuf prix a été supprimée le 24/09 : plus aucune page ne les
    // écrit en dur, et c'est voulu (un seul endroit dit les prix, la page contrats, qui les lit dans
    // la base). Le contrôle en ligne devient donc plus utile : vérifier que le relevé servant de
    // référence aux tests hors ligne (data/contrats-tarifs.json) n'a pas dérivé du catalogue réel.
    const ref = JSON.parse(await (await fetch(BASE + '/data/contrats-tarifs.json', { headers: { 'Cache-Control': 'no-store' } })).text());
    const svc = await (await fetch(`${SUPA}/rest/v1/v_services_public?select=slug,name,price_ttc&slug=like.entretien-chaudiere*`, { headers: H })).json();
    const off = await (await fetch(`${SUPA}/rest/v1/v_contract_offers?select=slug,price_ttc_month&energy=in.(gaz,fioul)`, { headers: H })).json();
    const derive = [];
    for (const o of off) {
      const attendu = ref.contrats_ttc_mois[o.slug];
      if (attendu === undefined) derive.push(`contrat ${o.slug} absent du relevé`);
      else if (Number(attendu).toFixed(2) !== Number(o.price_ttc_month).toFixed(2)) derive.push(`contrat ${o.slug} : relevé ${attendu} ≠ base ${o.price_ttc_month}`);
    }
    for (const x of svc) {
      const attendu = ref.prestations_ponctuelles_ttc[x.name];
      if (attendu !== undefined && Number(attendu).toFixed(2) !== Number(x.price_ttc).toFixed(2)) derive.push(`prestation ${x.name} : relevé ${attendu} ≠ base ${x.price_ttc}`);
    }
    off.length >= 6 && !derive.length
      ? ok(`Relevé tarifaire = catalogue (${off.length} contrats, ${svc.length} prestations)`)
      : ko('Relevé tarifaire dérivé du catalogue', derive.join(' | ') || 'catalogue vide');
  } catch (e) { ko('Relevé tarifaire : comparaison impossible', e.message); }
  console.log(`\nRÉSULTAT : ${pass} PASS / ${fail} FAIL`);
  process.exit(fail > 0 ? 1 : 0);
}
run().catch(e => { console.error('ERREUR:', e); process.exit(1); });
