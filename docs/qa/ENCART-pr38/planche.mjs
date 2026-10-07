/**
 * Encart saisonnier — une seule planche visuelle.
 *
 * Capture l'encart sur la preview du lot, en 1440 et en 390, sur deux pages, puis assemble
 * les quatre vues en une planche unique. Le widget de preview « Modifs » est retiré : il
 * n'existe pas en production.
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable');
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ICI = process.env.SORTIE ? resolve(process.env.SORTIE) : dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'https://deploy-preview-38--remarkable-dragon-364e2b.netlify.app';
const VUES = [
  { cle: 'accueil', url: '/', titre: "Accueil" },
  { cle: 'chauffage', url: '/chauffagiste-saint-omer.html', titre: "Page Chauffage" },
];
const nav = await chromium.launch();
const images = {};
for (const v of VUES) {
  for (const L of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 900 : 760 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    await page.goto(BASE + v.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2200);
    // on retire ce qui n'existe pas en production : tiroir Netlify et widget de recette
    await page.evaluate(() => {
      document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id], #hc-sv-fab, #hc-sv-cta, #hctslModal').forEach((e) => e.remove());
    });
    await page.locator('#entretien-saison').waitFor({ state: 'visible', timeout: 15000 });
    // on cadre sur le bas de page, la ou vit l'encart
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.waitForTimeout(400);
    const f = join(ICI, `vue-${v.cle}-${L}.png`);
    await page.screenshot({ path: f });
    images[`${v.cle}-${L}`] = 'data:image/png;base64,' + readFileSync(f).toString('base64');
    await ctx.close();
  }
}

// assemblage : une seule planche
const ctx = await nav.newContext({ viewport: { width: 1640, height: 400 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const html = `<!doctype html><meta charset="utf-8"><style>
 body{margin:0;background:#0A1428;font-family:Inter,system-ui,sans-serif;color:#fff;padding:24px 22px 26px;width:1640px;box-sizing:border-box}
 h1{font-size:19px;margin:0 0 4px;letter-spacing:-.01em}
 p.sous{margin:0 0 20px;color:#9fb3c8;font-size:12.5px}
 .grille{display:grid;grid-template-columns:1fr 1fr;gap:20px}
 figure{margin:0}
 figcaption{font-size:11.5px;color:#9fb3c8;margin:0 0 7px;letter-spacing:.07em;text-transform:uppercase}
 .cadre{background:#fff;border-radius:9px;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.4)}
 .cadre img{display:block;width:100%}
 .duo{display:flex;gap:14px;align-items:flex-start}
 .duo .mob{width:220px;flex:0 0 220px}
 .duo .desk{flex:1}
</style>
<h1>Encart saisonnier — ce que verra le visiteur</h1>
<p class="sous">Preview du lot, consentement refusé · desktop 1440 px et mobile 390 px · le widget « Modifs » de la preview est retiré, il n'existe pas en production</p>
<div class="grille">
 ${VUES.map((v) => `<figure>
   <figcaption>${v.titre}</figcaption>
   <div class="duo">
     <div class="cadre desk"><img src="${images[v.cle + '-1440']}"></div>
     <div class="cadre mob"><img src="${images[v.cle + '-390']}"></div>
   </div>
 </figure>`).join('')}
</div>`;
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: join(ICI, 'PLANCHE-encart.png'), fullPage: true });
await nav.close();
console.log('planche ecrite : ' + join(ICI, 'PLANCHE-encart.png'));
