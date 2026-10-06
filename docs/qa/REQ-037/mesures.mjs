/**
 * REQ-20260926-037 — cohérence TTC du parcours contrats.
 *
 * Suit Gaz CONFORT du clic sur la page Chauffage jusqu'à l'ouverture de la modale, en 1440
 * et en 390, et compare le montant affiché sur les TROIS surfaces à la valeur de la source
 * canonique (v_contract_offers). N'ENVOIE AUCUN FORMULAIRE : la modale est ouverte, jamais
 * soumise.
 *
 * Usage : SHA_PR=<sha> URL_PR=<base> node docs/qa/REQ-037/mesures.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable : installer playwright ou définir PLAYWRIGHT_IMPORT');

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ICI = process.env.SORTIE ? resolve(process.env.SORTIE) : dirname(fileURLToPath(import.meta.url));
const ETATS = [
  { cle: 'pr26-preview', libelle: 'PR #26 (preview)', base: process.env.URL_PR || 'https://deploy-preview-26--remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'prod-avant', libelle: 'production (avant correctif)', base: process.env.URL_MAIN || 'https://depan59-62.fr', sha: process.env.SHA_MAIN || 'main courant' },
];
const LARGEURS = [1440, 390];
const SUPABASE = 'https://btcbjwqiivhpwoszomhg.supabase.co';
const CLE = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

/** Montants attendus, lus dans la source canonique — rien n'est écrit en dur ici. */
const source = await (await fetch(`${SUPABASE}/rest/v1/v_contract_offers?select=slug,price_ttc_month,price_ttc_year,price_ht_month&slug=eq.gaz-confort`, { headers: { apikey: CLE } })).json();
const OFFRE = source[0];
const fr = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 });
const TTC_MOIS = fr(OFFRE.price_ttc_month);
const TTC_AN = fr(OFFRE.price_ttc_year);
const HT_MOIS = fr(OFFRE.price_ht_month);

const sansTiroirNetlify = (page) =>
  page.evaluate(() => {
    document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove());
  });
const normal = (s) => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const resultats = { genere_le: new Date().toISOString(), source: OFFRE, attendu: { TTC_MOIS, TTC_AN, HT_MOIS }, etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  resultats.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of LARGEURS) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const console_ = [];
    const envois = [];
    page.on('console', (m) => m.type() === 'error' && console_.push(m.text().slice(0, 160)));
    page.on('pageerror', (e) => console_.push('pageerror: ' + String(e).slice(0, 160)));
    // garde-fou : on trace toute requête d'écriture, il ne doit y en avoir aucune
    page.on('request', (r) => { if (r.method() !== 'GET' && /submit-lead|notify-lead|rest\/v1/.test(r.url())) envois.push(`${r.method()} ${r.url().slice(0, 80)}`); });

    const bloc = { envois };

    // ── surface 1 : la page Chauffage
    await page.goto(`${etat.base}/chauffagiste-saint-omer.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.locator('#pane-gaz .formula-card').first().waitFor({ state: 'visible', timeout: 25000 });
    await page.waitForTimeout(900);
    await sansTiroirNetlify(page);
    bloc.chauffage = await page.evaluate(() => {
      const c = [...document.querySelectorAll('#pane-gaz .formula-card')].find((x) => /CONFORT/i.test((x.querySelector('.formula-name') || {}).textContent || ''));
      if (!c) return null;
      const s = document.querySelector('.ct-contrats-page');
      const r = s.getBoundingClientRect();
      return {
        principal: (c.querySelector('.formula-price') || {}).textContent,
        secondaire: (c.querySelector('.formula-price-ht, .formula-price-year') || {}).textContent,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        moduleRect: [Math.round(r.left), Math.round(r.right)],
        moduleHorsCadre: [...s.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.left < -1 || b.right > window.innerWidth + 1); }).length,
      };
    });
    await page.locator('.ct-contrats-page').screenshot({ path: join(ICI, `${etat.cle}-${L}-1-chauffage.jpg`), quality: 72 }).catch(() => {});

    // ── surface 2 : la page Contrats, atteinte par le clic
    const cta = page.locator('.formula-cta[data-hc-cta="contrats_choisir_gaz-confort"]');
    await cta.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    await sansTiroirNetlify(page);
    await Promise.all([page.waitForURL(/contrats-entretien/, { timeout: 25000 }), cta.click({ timeout: 15000 })]);
    await page.waitForTimeout(2400);
    await sansTiroirNetlify(page);
    bloc.contrats = await page.evaluate(() => {
      const c = document.querySelector('.formula-card.is-handoff-choice');
      const radio = document.querySelector('input[name="energy"]:checked');
      return {
        url: location.pathname + location.search + location.hash,
        energieCochee: radio ? radio.id : null,
        formule: c ? (c.querySelector('.formula-name') || {}).textContent : null,
        principal: c ? (c.querySelector('.formula-price') || {}).textContent : null,
        secondaire: c ? (c.querySelector('.formula-price-year, .formula-price-ht') || {}).textContent : null,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-2-contrats.jpg`), quality: 72 });

    // ── surface 3 : la modale — OUVERTE, JAMAIS SOUMISE
    await page.locator('.formula-card.is-handoff-choice .formula-cta').click({ timeout: 15000 });
    await page.waitForTimeout(1400);
    bloc.modale = await page.evaluate(() => {
      const el = document.getElementById('souscriptionModal');
      if (!el) return { ouverte: false };
      const carte = el.querySelector('.sous-card'), r = carte.getBoundingClientRect();
      const champ = (id) => { const e = document.getElementById(id); return e ? e.value : null; };
      return {
        ouverte: getComputedStyle(el).display !== 'none',
        energie: (document.getElementById('sousType') || {}).textContent,
        formule: (document.getElementById('sousFormule') || {}).textContent,
        tarif: (document.getElementById('sousPrix') || {}).textContent,
        champPrix: champ('f-prix'), champPrixHt: champ('f-prix-ht'), champPrixTtc: champ('f-prix-ttc'),
        carte: [Math.round(r.left), Math.round(r.right)], innerWidth: window.innerWidth,
        casesPreCochees: [...el.querySelectorAll('input[type=checkbox]')].filter((c) => c.checked).length,
      };
    });
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-3-modale.jpg`), quality: 72 });

    bloc.console = console_;
    resultats.etats[etat.cle].largeurs[L] = bloc;
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16), octets: readFileSync(join(ICI, f)).length }));
resultats.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(resultats, null, 1) + '\n');

lignes.push('# REQ-037 — cohérence TTC, mesurée sur les trois surfaces', '', `Généré le ${resultats.genere_le}`, '');
lignes.push(`Source canonique \`v_contract_offers\`, offre \`${OFFRE.slug}\` : \`price_ttc_month\` **${OFFRE.price_ttc_month}**, \`price_ttc_year\` **${OFFRE.price_ttc_year}**, \`price_ht_month\` **${OFFRE.price_ht_month}**.`);
lignes.push(`Attendu à l'écran : **${TTC_MOIS} €** TTC par mois, **${TTC_AN} €** TTC par an, **${HT_MOIS} €** HT par mois.`, '');
for (const etat of ETATS) {
  const e = resultats.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  for (const L of LARGEURS) {
    const b = e.largeurs[L];
    const ch = normal(b.chauffage && b.chauffage.principal), co = normal(b.contrats && b.contrats.principal), mo = normal(b.modale && b.modale.tarif);
    const ttcPartout = [ch, co, mo].every((x) => x.includes(TTC_MOIS));
    lignes.push(`### ${L} px`);
    lignes.push(`- **surface 1 — page Chauffage** : « ${ch} » _(secondaire : ${normal(b.chauffage && b.chauffage.secondaire)})_`);
    lignes.push(`- **surface 2 — page Contrats** : « ${co} » _(secondaire : ${normal(b.contrats && b.contrats.secondaire)})_ · URL \`${b.contrats.url}\` · énergie **${b.contrats.energieCochee}** · formule **${normal(b.contrats.formule)}**`);
    lignes.push(`- **surface 3 — modale** : « ${mo} » · ouverte **${b.modale.ouverte}** · ${normal(b.modale.energie)} / ${normal(b.modale.formule)} · champs bruts : HT \`${b.modale.champPrixHt}\`, TTC \`${b.modale.champPrixTtc}\` · cases pré-cochées **${b.modale.casesPreCochees}**`);
    lignes.push(`- **même TTC sur les trois surfaces** : ${ttcPartout ? `**oui — ${TTC_MOIS} € partout**` : '**NON**'}`);
    lignes.push(`- débordement : page Chauffage ${b.chauffage.scrollWidth - b.chauffage.innerWidth} px · page Contrats ${b.contrats.scrollWidth - b.contrats.innerWidth} px · module hors cadre **${b.chauffage.moduleHorsCadre}**`);
    lignes.push(`- **écritures réseau** : ${b.envois.length ? '**' + b.envois.join(' · ') + '**' : '**aucune — aucun lead envoyé**'}`);
    const duTiroir = (x) => /app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x);
    const propres = b.console.filter((x) => !duTiroir(x));
    lignes.push(`- erreurs console imputables au site : ${propres.length ? propres.map((x) => `\`${x}\``).join(' · ') : '**aucune**'}`, '');
  }
}
lignes.push('## Empreintes des captures produites par ce script', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\` — ${Math.round(c.octets / 1024)} Ko`);
writeFileSync(join(ICI, 'MESURES-REQ-037.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
