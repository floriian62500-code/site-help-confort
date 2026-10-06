/**
 * REQ-20260926-036 — débordement horizontal à 390 px, pages Chauffage et Contrats.
 *
 * Mesure la preview de la PR et la production (état « avant »), en 390 et en 1440.
 * Vérifie que la page tient dans l'écran SANS casser le carrousel d'avis, le carrousel
 * fournisseurs, les formules ni la modale. N'ENVOIE AUCUN FORMULAIRE.
 *
 * Usage : SHA_PR=<sha> node docs/qa/REQ-036/mesures.mjs
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
  { cle: 'pr27-preview', libelle: 'PR #27 (preview)', base: process.env.URL_PR || 'https://deploy-preview-27--remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'prod-avant', libelle: 'production (avant correctif)', base: process.env.URL_MAIN || 'https://depan59-62.fr', sha: process.env.SHA_MAIN || 'main courant' },
];
const PAGES = ['chauffagiste-saint-omer.html', 'contrats-entretien.html'];
const sansTiroir = (p) => p.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });

const res = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  res.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of [390, 1440]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const erreurs = [], ecritures = [];
    page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text().slice(0, 150)));
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + String(e).slice(0, 150)));
    page.on('request', (r) => { if (r.method() !== 'GET' && /submit-lead|notify-lead|rest\/v1/.test(r.url())) ecritures.push(r.method() + ' ' + r.url().slice(0, 70)); });
    const bloc = { pages: {} };

    for (const p of PAGES) {
      await page.goto(`${etat.base}/${p}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2200);
      await sansTiroir(page);
      bloc.pages[p] = await page.evaluate(() => {
        const W = innerWidth, SW = document.documentElement.scrollWidth;
        const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), l: Math.round(b.width) }; };
        const avis = document.querySelector('.hcal-grid');
        const marquee = document.querySelector('.hcf-marquee');
        const track = document.querySelector('.hcf-track');
        return {
          innerWidth: W, scrollWidth: SW, debordement: SW - W,
          dansLEcran: SW - W <= 1,
          avis: avis ? { rect: r(avis), defilable: avis.scrollWidth > avis.clientWidth + 1, cartes: avis.children.length } : null,
          fournisseurs: marquee ? { marquee: r(marquee), track: r(track), logos: document.querySelectorAll('.hcf-track .hcf-logo, .hcf-track img, .hcf-logo-fallback').length } : null,
          formules: [...document.querySelectorAll('.formula-card')].map((c) => `${((c.querySelector('.formula-name') || {}).textContent || '').trim()} ${((c.querySelector('.formula-price') || {}).textContent || '').replace(/\s+/g, ' ').trim()}`).filter((x) => x.trim()),
          labels: document.querySelectorAll('.hc-label-card').length,
        };
      });
      await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-${p.replace('.html', '')}.jpg`), quality: 70, fullPage: false });
    }

    // la modale s'ouvre-t-elle toujours, et reste-t-elle utilisable ? AUCUN ENVOI
    await page.goto(`${etat.base}/contrats-entretien.html?energie=gaz&formule=confort#formules`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2400);
    await sansTiroir(page);
    const cta = page.locator('.formula-card.is-handoff-choice .formula-cta');
    if (await cta.count()) {
      await cta.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(400);
      await sansTiroir(page);
      await cta.click({ timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1400);
    }
    bloc.modale = await page.evaluate(() => {
      const el = document.getElementById('souscriptionModal');
      if (!el) return { ouverte: false };
      const c = el.querySelector('.sous-card'), b = c.getBoundingClientRect();
      return { ouverte: getComputedStyle(el).display !== 'none', tarif: (document.getElementById('sousPrix') || {}).textContent,
        carte: [Math.round(b.left), Math.round(b.right)], innerWidth: innerWidth,
        debordementPage: document.documentElement.scrollWidth - innerWidth };
    });
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-modale.jpg`), quality: 70 });

    bloc.console = erreurs.filter((x) => !/app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x));
    bloc.ecritures = ecritures;
    res.etats[etat.cle].largeurs[L] = bloc;
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(res, null, 1) + '\n');

lignes.push('# REQ-036 — débordement horizontal, avant / après', '', `Généré le ${res.genere_le}`, '');
for (const etat of ETATS) {
  const e = res.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  for (const L of [390, 1440]) {
    const b = e.largeurs[L];
    lignes.push(`### ${L} px`);
    for (const p of PAGES) {
      const m = b.pages[p];
      lignes.push(`- **${p}** : scrollWidth **${m.scrollWidth}** / innerWidth **${m.innerWidth}** → **${m.debordement} px** ${m.dansLEcran ? '✅' : '❌'}`);
      if (m.avis) lignes.push(`  - carrousel d'avis : ${JSON.stringify(m.avis.rect)} · défilable **${m.avis.defilable}** · ${m.avis.cartes} cartes`);
      if (m.fournisseurs) lignes.push(`  - carrousel fournisseurs : marquee ${JSON.stringify(m.fournisseurs.marquee)} · piste ${JSON.stringify(m.fournisseurs.track)} · ${m.fournisseurs.logos} logos`);
      if (m.formules.length) lignes.push(`  - formules : ${m.formules.slice(0, 3).join(' · ')}`);
      if (m.labels) lignes.push(`  - cartes labels : ${m.labels}`);
    }
    lignes.push(`- **modale** : ouverte **${b.modale.ouverte}** · tarif « ${String(b.modale.tarif || '').replace(/\s+/g, ' ').trim()} » · carte ${JSON.stringify(b.modale.carte)} dans 0→${b.modale.innerWidth} · débordement de la page **${b.modale.debordementPage} px**`);
    lignes.push(`- **écritures réseau** : ${b.ecritures.length ? b.ecritures.join(' · ') : '**aucune — aucun lead envoyé**'}`);
    lignes.push(`- erreurs console imputables au site : ${b.console.length ? b.console.map((x) => `\`${x}\``).join(' · ') : '**aucune**'}`, '');
  }
}
lignes.push('## Empreintes des captures', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\``);
writeFileSync(join(ICI, 'MESURES-REQ-036.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
