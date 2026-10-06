/**
 * REQ-039 — contrôle d'un échantillon : une page par cause, avant / après, en 390 et 1440.
 * Vérifie que les composants touchés fonctionnent encore et que le desktop ne bouge pas.
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable');
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ICI = process.env.SORTIE ? resolve(process.env.SORTIE) : dirname(fileURLToPath(import.meta.url));
const ETATS = [
  { cle: 'apres', libelle: 'PR #29 (preview)', base: process.env.URL_PR || 'https://deploy-preview-29--remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'avant', libelle: 'production (avant)', base: process.env.URL_MAIN || 'https://depan59-62.fr', sha: process.env.SHA_MAIN || 'main' },
];
const ECHANTILLON = [
  { p: 'electricien-saint-omer.html', cause: '.m-proof-col (bloc avis)' },
  { p: 'depannage-arques.html', cause: '.hc-labels-grid (variante @media)' },
  { p: 'a-propos.html', cause: '.hc-labels-grid (213 px)' },
  { p: 'remplacement-chauffe-eau.html', cause: 'TABLE.rh-table' },
];
const res = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  res.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of [390, 1440]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const erreurs = [];
    page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text().slice(0, 140)));
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + String(e).slice(0, 140)));
    const bloc = {};
    for (const { p } of ECHANTILLON) {
      await page.goto(`${etat.base}/${p}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1800);
      await page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });
      bloc[p] = await page.evaluate(() => {
        const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.height)]; };
        const avis = document.querySelector('.hcal-grid');
        const t = document.querySelector('.rh-table');
        return {
          debordement: document.documentElement.scrollWidth - innerWidth,
          hauteurDoc: Math.round(document.documentElement.scrollHeight),
          avis: avis ? { rect: r('.hcal-grid'), defilable: avis.scrollWidth > avis.clientWidth + 1, cartes: avis.children.length } : null,
          labels: document.querySelectorAll('.hc-label-card').length || null,
          tableau: t ? { rect: r('.rh-table'), defilable: t.scrollWidth > t.clientWidth + 1, lignes: t.querySelectorAll('tr').length, colonnes: t.querySelectorAll('tr:first-child > *').length } : null,
        };
      });
      await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-${p.replace('.html', '')}.jpg`), quality: 70 });
    }
    bloc.console = erreurs.filter((x) => !/app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x));
    res.etats[etat.cle].largeurs[L] = bloc;
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'echantillon.json'), JSON.stringify(res, null, 1) + '\n');

lignes.push('# REQ-039 — échantillon, une page par cause', '', `Généré le ${res.genere_le}`, '');
for (const L of [390, 1440]) {
  lignes.push(`## ${L} px`, '');
  lignes.push('| page | cause | avant | après | composant |', '| --- | --- | --- | --- | --- |');
  for (const { p, cause } of ECHANTILLON) {
    const a = res.etats.avant.largeurs[L][p], b = res.etats.apres.largeurs[L][p];
    const comp = b.avis ? `avis ${JSON.stringify(b.avis.rect)} défilable ${b.avis.defilable}, ${b.avis.cartes} cartes`
      : b.tableau ? `tableau ${JSON.stringify(b.tableau.rect)} défilable ${b.tableau.defilable}, ${b.tableau.lignes} lignes × ${b.tableau.colonnes} colonnes`
      : `${b.labels} cartes labels`;
    lignes.push(`| \`${p}\` | ${cause} | **${a.debordement} px** | **${b.debordement} px** | ${comp} |`);
  }
  lignes.push('');
  lignes.push('| page | hauteur du document avant | après |', '| --- | --- | --- |');
  for (const { p } of ECHANTILLON) lignes.push(`| \`${p}\` | ${res.etats.avant.largeurs[L][p].hauteurDoc} px | **${res.etats.apres.largeurs[L][p].hauteurDoc} px** |`);
  lignes.push('');
  lignes.push(`- console avant : ${res.etats.avant.largeurs[L].console.length ? res.etats.avant.largeurs[L].console.join(' · ') : '**aucune**'}`);
  lignes.push(`- console après : ${res.etats.apres.largeurs[L].console.length ? res.etats.apres.largeurs[L].console.join(' · ') : '**aucune**'}`, '');
}
lignes.push('## Empreintes des captures', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\``);
writeFileSync(join(ICI, 'ECHANTILLON.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
