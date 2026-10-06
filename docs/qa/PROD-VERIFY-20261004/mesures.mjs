/**
 * Contrôle de production sur le domaine public — REQ-007, 017, 019, 023, 024.
 *
 * Une demande n'est terminée que vérifiée sur depan59-62.fr. Ce script ne vérifie que
 * ce qui est réellement servi au public. Il ne soumet aucun formulaire.
 *
 * Usage : SHA_MAIN=<sha> node docs/qa/PROD-VERIFY-20261004/mesures.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable');

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ICI = process.env.SORTIE ? resolve(process.env.SORTIE) : dirname(fileURLToPath(import.meta.url));
const BASE = process.env.URL_PROD || 'https://depan59-62.fr';
const SHA = process.env.SHA_MAIN || 'inconnu';
const METIERS = ['chauffagiste-saint-omer', 'electricien-saint-omer', 'menuisier-saint-omer', 'plombier-saint-omer', 'serrurier-saint-omer', 'travaux-saint-omer', 'vitrier-saint-omer'];
const PAGES_CARTE = ['zones-intervention.html', 'contact.html', 'a-propos.html', 'nos-villes.html'];

const nav = await chromium.launch();
const ctxHttp = await nav.newContext();
const res = { genere_le: new Date().toISOString(), base: BASE, sha_main: SHA, req: {} };

// ── REQ-007 : plus de module « parcours » sur les pages métier
res.req['REQ-007'] = { pages: {} };
for (const p of METIERS) {
  const r = await ctxHttp.request.get(`${BASE}/${p}.html`);
  const h = await r.text();
  res.req['REQ-007'].pages[p] = { statut: r.status(), journey: (h.match(/hc-metier-journey/g) || []).length };
}
res.req['REQ-007'].conforme = Object.values(res.req['REQ-007'].pages).every((x) => x.statut === 200 && x.journey === 0);

// ── REQ-024 : cache-bust servi par les quatre pages
res.req['REQ-024'] = { cacheBust: {} };
for (const p of PAGES_CARTE) {
  const r = await ctxHttp.request.get(`${BASE}/${p}`);
  const h = await r.text();
  const v = [...new Set(h.match(/hc-map-zones\.js\?v=[A-Za-z0-9]+/g) || [])];
  res.req['REQ-024'].cacheBust[p] = { statut: r.status(), versions: v };
}
await ctxHttp.close();

const sansTiroir = (page) => page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });

for (const L of [1440, 390]) {
  const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
  await ctx.addInitScript(() => {
    window.__tuiles = { premiere: null };
    new MutationObserver(() => {
      if (window.__tuiles.premiere === null && document.querySelector('.leaflet-tile-loaded')) window.__tuiles.premiere = performance.now();
    }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text().slice(0, 140)));
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + String(e).slice(0, 140)));

  // REQ-017 — module contrats sur la page Chauffage
  await page.goto(`${BASE}/chauffagiste-saint-omer.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('#pane-gaz .formula-card').first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(900);
  await sansTiroir(page);
  (res.req['REQ-017'] ||= {})[L] = await page.evaluate(() => {
    const s = document.querySelector('.ct-contrats-page');
    return {
      module: !!s,
      onglets: [...document.querySelectorAll('.energy-switch [role="tab"], .energy-switch label')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()),
      cartes: [...document.querySelectorAll('#pane-gaz .formula-card')].map((c) => `${(c.querySelector('.formula-name') || {}).textContent} ${(c.querySelector('.formula-price') || {}).textContent}`.replace(/\s+/g, ' ').trim()),
      horsCadre: s ? [...s.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.left < -1 || b.right > innerWidth + 1); }).length : null,
      debordementPage: document.documentElement.scrollWidth - innerWidth,
    };
  });
  await page.locator('.ct-contrats-page').screenshot({ path: join(ICI, `req-017-${L}.jpg`), quality: 70 }).catch(() => {});

  // REQ-019 — aucun slug technique en sous-filtre
  await page.goto(`${BASE}/nos-prestations.html`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await sansTiroir(page);
  (res.req['REQ-019'] ||= {})[L] = await page.evaluate(() => {
    const libelles = [...document.querySelectorAll('[class*="subcat"], .nv-subcat-label, [data-subcat-slug]')].map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
    return { techniques: libelles.filter((t) => /^(_?default|null|undefined)$/i.test(t)), nbLibelles: libelles.length, debordementPage: document.documentElement.scrollWidth - innerWidth };
  });
  await page.screenshot({ path: join(ICI, `req-019-${L}.jpg`), quality: 70 });

  // REQ-023 + REQ-024 — zones 4 pôles et carte, SANS DÉFILER
  await page.goto(`${BASE}/zones-intervention.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => window.__tuiles.premiere !== null || performance.now() > 8000, null, { timeout: 20000 }).catch(() => {});
  const premiere = await page.evaluate(() => ({ ms: window.__tuiles.premiere === null ? null : Math.round(window.__tuiles.premiere), scrollY: scrollY }));
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await sansTiroir(page);
  (res.req['REQ-023'] ||= {})[L] = await page.evaluate(() => ({
    cartes: [...document.querySelectorAll('.z-zone-card')].map((c) => `${(c.querySelector('h3') || {}).textContent} — ${((c.querySelector('.agency, span') || {}).textContent || '').trim()}`.replace(/\s+/g, ' ').trim()),
    revendiqueDeuxAgences: /Deux agences/i.test(document.body.innerText),
    debordementPage: document.documentElement.scrollWidth - innerWidth,
  }));
  (res.req['REQ-024'] ||= { cacheBust: res.req['REQ-024'].cacheBust })[L] = await page.evaluate((p) => {
    const cont = document.querySelector('.leaflet-container');
    const tuiles = [...document.querySelectorAll('.leaflet-tile-loaded')];
    let couverture = 0;
    if (cont && tuiles.length) {
      const c = cont.getBoundingClientRect(), aire = Math.max(1, c.width * c.height);
      couverture = tuiles.reduce((s, t) => { const b = t.getBoundingClientRect(); return s + Math.max(0, Math.min(b.right, c.right) - Math.max(b.left, c.left)) * Math.max(0, Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top)); }, 0) / aire;
    }
    return { msPremiereTuile: p.ms, scrollYaLaMesure: p.scrollY, tuiles: tuiles.length, couverturePourCent: Math.round(couverture * 100), enErreur: document.querySelectorAll('.leaflet-tile-error').length };
  }, premiere);
  await page.locator('.z-section').filter({ has: page.locator('.z-zone-card') }).first().screenshot({ path: join(ICI, `req-023-${L}.jpg`), quality: 70 }).catch(() => {});
  await page.locator('.leaflet-container').first().screenshot({ path: join(ICI, `req-024-${L}.jpg`), quality: 70 }).catch(() => {});

  // contact.html : paresse préservée
  await page.goto(`${BASE}/contact.html`, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  res.req['REQ-024'][`contactAvantDefilement_${L}`] = await page.evaluate(() => ({ conteneurs: document.querySelectorAll('.leaflet-container').length, tuiles: document.querySelectorAll('.leaflet-tile-loaded').length }));

  res[`console_${L}`] = erreurs.filter((x) => !/app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x));
  await ctx.close();
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify(res, null, 1));
