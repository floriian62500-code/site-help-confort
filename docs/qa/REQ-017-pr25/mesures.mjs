/**
 * PR #25 — hotfix campagne Chauffage : contrôle du module contrats sur trois états.
 *
 * Mesure la preview de la PR, la production Netlify et le DOMAINE PUBLIC réel
 * (celui où atterrit le trafic Google Ads). Ne soumet aucun formulaire.
 *
 * Usage : SHA_PR=<sha> node docs/qa/REQ-017-pr25/mesures.mjs
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
  { cle: 'pr25-preview', libelle: 'PR #25 (preview)', url: 'https://deploy-preview-25--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'prod-netlify', libelle: 'production Netlify', url: 'https://remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer', sha: process.env.SHA_MAIN || 'main courant' },
  { cle: 'domaine-public', libelle: 'domaine public (atterrissage Google Ads)', url: 'https://depan59-62.fr/chauffagiste-saint-omer.html', sha: 'servi au public' },
];
const LARGEURS = [1440, 390];

const resultats = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  resultats.etats[etat.cle] = { libelle: etat.libelle, url: etat.url, sha: etat.sha, largeurs: {} };
  for (const L of LARGEURS) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const console_ = [];
    const assets = [];
    page.on('console', (m) => m.type() === 'error' && console_.push(m.text().slice(0, 160)));
    page.on('pageerror', (e) => console_.push('pageerror: ' + String(e).slice(0, 160)));
    page.on('response', (r) => { if (/hc-contrats\.(css|js)/.test(r.url())) assets.push({ url: r.url().split('/').pop(), statut: r.status() }); });

    await page.goto(etat.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.locator('.formula-card').first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(1200);
    await page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });

    const m = await page.evaluate(() => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top) }; };
      const module = document.querySelector('.ct-contrats-page');
      const horsCadre = module ? [...module.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.left < -1 || b.right > window.innerWidth + 1); }).length : null;
      const onglets = [...document.querySelectorAll('.energy-switch [role="tab"], .energy-switch label')].map((e) => ({
        libelle: e.textContent.replace(/\s+/g, ' ').trim(),
        actif: !!(e.getAttribute('for') && (document.getElementById(e.getAttribute('for')) || {}).checked),
      }));
      const cartes = [...document.querySelectorAll('#pane-gaz .formula-card')].map((c) => ({
        nom: ((c.querySelector('.formula-name') || {}).textContent || '').trim(),
        prix: ((c.querySelector('.formula-price') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
        secondaire: ((c.querySelector('.formula-price-year, .formula-price-ht') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
      }));
      // le plus gros chiffre affiché sur la carte CONFORT est-il le TTC ?
      const confort = cartes.find((c) => /CONFORT/i.test(c.nom));
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        debordementPage: document.documentElement.scrollWidth - window.innerWidth,
        modulePresent: !!module, moduleRect: r(module), moduleHorsCadre: horsCadre,
        teaserCeCard: document.querySelectorAll('.ce-card').length,
        teaserCtp: document.querySelectorAll('.ctp, .m-contrats-premium').length,
        onglets, cartes,
        ttcPrincipal: !!(confort && /TTC/.test(confort.prix)),
        htSecondaireEtiquete: !!(confort && /HT/.test(confort.secondaire)),
        coupableDebordement: (() => {
          const t = document.querySelector('.hcf-track'); if (!t) return null;
          const b = t.getBoundingClientRect(); return { sel: '.hcf-track', largeur: Math.round(b.width) };
        })(),
      };
    });
    if (m.modulePresent) await page.locator('.ct-contrats-page').screenshot({ path: join(ICI, `${etat.cle}-${L}.jpg`), quality: 72 }).catch(() => {});
    else await page.screenshot({ path: join(ICI, `${etat.cle}-${L}.jpg`), quality: 72 });

    resultats.etats[etat.cle].largeurs[L] = { ...m, assets, console: console_ };
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16), octets: readFileSync(join(ICI, f)).length }));
resultats.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(resultats, null, 1) + '\n');

lignes.push('# PR #25 — module contrats sur trois états', '', `Généré le ${resultats.genere_le}`, '');
for (const etat of ETATS) {
  const e = resultats.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.url}`, '');
  for (const L of LARGEURS) {
    const b = e.largeurs[L];
    lignes.push(`### ${L} px`);
    lignes.push(`- module : ${b.modulePresent ? `présent ${JSON.stringify(b.moduleRect)} · **${b.moduleHorsCadre}** descendant hors cadre` : '**ABSENT**'}`);
    lignes.push(`- ancien teaser : \`.ce-card\` **${b.teaserCeCard}** · \`.ctp\`/\`.m-contrats-premium\` **${b.teaserCtp}**`);
    lignes.push(`- onglets : ${b.onglets.map((o) => o.libelle + (o.actif ? ' (actif)' : '')).join(' | ') || '**aucun**'}`);
    lignes.push(`- formules gaz : ${b.cartes.map((c) => `**${c.nom}** ${c.prix}${c.secondaire ? ` _(${c.secondaire})_` : ''}`).join(' · ') || '**aucune**'}`);
    lignes.push(`- TTC principal : **${b.ttcPrincipal ? 'oui' : 'NON'}** · HT secondaire étiqueté : **${b.htSecondaireEtiquete ? 'oui' : 'non'}**`);
    lignes.push(`- débordement de **page** : scrollWidth ${b.scrollWidth} vs innerWidth ${b.innerWidth} → **${b.debordementPage} px**${b.coupableDebordement ? ` (coupable \`${b.coupableDebordement.sel}\`, large de ${b.coupableDebordement.largeur} px)` : ''}`);
    lignes.push(`- assets chargés : ${b.assets.map((a) => `\`${a.url}\` ${a.statut}`).join(' · ') || '—'}`);
    const duTiroir = (x) => /app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x);
    const propres = b.console.filter((x) => !duTiroir(x));
    lignes.push(`- erreurs console imputables au site : ${propres.length ? propres.map((x) => `\`${x}\``).join(' · ') : '**aucune**'} _(écartées, tiroir de preview : ${b.console.length - propres.length})_`, '');
  }
}
lignes.push('## Empreintes des captures produites par ce script', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\` — ${Math.round(c.octets / 1024)} Ko`);
writeFileSync(join(ICI, 'MESURES-PR25.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
