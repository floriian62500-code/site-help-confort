/**
 * PR #24 — reproducteur de preuves (REQ-20260926-023 zones 4 pôles, REQ-20260926-024 carte).
 *
 * Mesure la preview de la PR et, en référence, la production, sans rien soumettre et
 * SANS DÉFILER avant la mesure de la carte : c'est précisément ce que REQ-024 corrige.
 *
 * Usage :
 *   SHA_PR=<sha> SHA_MAIN=<sha> node docs/qa/REQ-024-pr24/mesures.mjs
 *   PLAYWRIGHT_IMPORT=/chemin/vers/node_modules/playwright/index.js si playwright est hors dépôt.
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable : installer playwright ou définir PLAYWRIGHT_IMPORT');

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
const ETATS = [
  { cle: 'pr24-preview', libelle: 'PR #24 (preview)', base: process.env.URL_PR || 'https://deploy-preview-24--remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'main-prod', libelle: 'main courant (production, référence avant)', base: process.env.URL_MAIN || 'https://remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_MAIN || 'inconnu' },
];
const LARGEURS = [1440, 390];
const POLES_ATTENDUS = ['Saint-Omer & Audomarois', 'Dunkerque & Littoral', 'Calais & Calaisis', 'Boulogne-sur-Mer & Boulonnais'];
const CACHE_BUST = 'assets/hc-map-zones.js?v=20261003a';
const PAGES_CARTE = ['zones-intervention.html', 'contact.html', 'a-propos.html', 'nos-villes.html'];

/** Horodate l'apparition des tuiles Leaflet, avant tout script de page. */
const SONDE = () => {
  window.__hcMap = { conteneur: null, premiereTuile: null, huitTuiles: null, tuiles: 0 };
  const obs = new MutationObserver(() => {
    if (!window.__hcMap.conteneur && document.querySelector('.leaflet-container')) window.__hcMap.conteneur = performance.now();
    const n = document.querySelectorAll('.leaflet-tile-loaded').length;
    if (n > window.__hcMap.tuiles) {
      window.__hcMap.tuiles = n;
      if (window.__hcMap.premiereTuile === null) window.__hcMap.premiereTuile = performance.now();
      if (n >= 8 && window.__hcMap.huitTuiles === null) window.__hcMap.huitTuiles = performance.now();
    }
  });
  obs.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
};

const sansTiroirNetlify = (page) =>
  page.evaluate(() => {
    document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove());
  });

const resultats = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  resultats.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };

  // Cache-bust : ce que les pages servent réellement
  const ctxReq = await nav.newContext();
  const bust = {};
  for (const p of PAGES_CARTE) {
    const rep = await ctxReq.request.get(`${etat.base}/${p}`);
    const html = await rep.text();
    const trouve = (html.match(/hc-map-zones\.js\?v=[A-Za-z0-9]+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
    bust[p] = { statut: rep.status(), versions: trouve, conforme: trouve.length === 1 && `assets/${trouve[0]}` === CACHE_BUST };
  }
  resultats.etats[etat.cle].cacheBust = bust;
  await ctxReq.close();

  for (const L of LARGEURS) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    await ctx.addInitScript(SONDE);
    const page = await ctx.newPage();
    const console_ = [];
    page.on('console', (m) => m.type() === 'error' && console_.push(m.text().slice(0, 160)));
    page.on('pageerror', (e) => console_.push('pageerror: ' + String(e).slice(0, 160)));
    const bloc = {};

    // ── zones-intervention.html — AUCUN DÉFILEMENT avant la mesure de la carte
    await page.goto(`${etat.base}/zones-intervention.html`, { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => window.__hcMap && (window.__hcMap.tuiles > 0 || performance.now() > 8000), null, { timeout: 20000 }).catch(() => {});
    bloc.carte = await page.evaluate(() => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), haut: Math.round(b.height) }; };
      const cont = document.querySelector('.leaflet-container') || document.querySelector('[data-hc-map-zones]');
      const tuiles = [...document.querySelectorAll('.leaflet-tile-loaded')];
      let couverture = 0;
      if (cont && tuiles.length) {
        const c = cont.getBoundingClientRect();
        const aire = Math.max(1, c.width * c.height);
        couverture = tuiles.reduce((s, t) => {
          const b = t.getBoundingClientRect();
          const w = Math.max(0, Math.min(b.right, c.right) - Math.max(b.left, c.left));
          const h = Math.max(0, Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top));
          return s + w * h;
        }, 0) / aire;
      }
      return {
        aDefile: window.scrollY,
        leafletCharge: !!window.L,
        conteneur: r(cont),
        fondConteneur: cont ? getComputedStyle(cont).backgroundColor : null,
        tuilesChargees: tuiles.length,
        couverturePourCent: Math.round(couverture * 100),
        msConteneur: window.__hcMap.conteneur === null ? null : Math.round(window.__hcMap.conteneur),
        msPremiereTuile: window.__hcMap.premiereTuile === null ? null : Math.round(window.__hcMap.premiereTuile),
        msHuitTuiles: window.__hcMap.huitTuiles === null ? null : Math.round(window.__hcMap.huitTuiles),
        hauteurViewport: window.innerHeight,
      };
    });
    // la carte est-elle réellement peinte ? on remesure une fois posée, toujours SANS défiler
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(1500);
    bloc.carteStabilisee = await page.evaluate(() => {
      const cont = document.querySelector('.leaflet-container') || document.querySelector('[data-hc-map-zones]');
      const tuiles = [...document.querySelectorAll('.leaflet-tile-loaded')];
      let couverture = 0;
      if (cont && tuiles.length) {
        const c = cont.getBoundingClientRect();
        const aire = Math.max(1, c.width * c.height);
        couverture = tuiles.reduce((s, t) => {
          const b = t.getBoundingClientRect();
          const w = Math.max(0, Math.min(b.right, c.right) - Math.max(b.left, c.left));
          const h = Math.max(0, Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top));
          return s + w * h;
        }, 0) / aire;
      }
      return {
        aDefile: window.scrollY,
        tuilesChargees: tuiles.length,
        couverturePourCent: Math.round(couverture * 100),
        msHuitTuiles: window.__hcMap.huitTuiles === null ? null : Math.round(window.__hcMap.huitTuiles),
        tuilesEnErreur: document.querySelectorAll('.leaflet-tile-error').length,
        grise: tuiles.length === 0,
      };
    });
    await sansTiroirNetlify(page);
    const cible = page.locator('.leaflet-container, [data-hc-map-zones]').first();
    if (await cible.count()) await cible.screenshot({ path: join(ICI, `${etat.cle}-${L}-carte.jpg`), quality: 72 }).catch(() => {});

    // ── zones 4 pôles
    bloc.zones = await page.evaluate(({ attendus }) => {
      const r = (e) => { const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), haut: Math.round(b.height) }; };
      const cartes = [...document.querySelectorAll('.z-zone-card')].map((c) => ({
        titre: (c.querySelector('h3') || {}).textContent.replace(/\s+/g, ' ').trim(),
        badge: ((c.querySelector('.agency, .z-zone-badge, span') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        rect: r(c),
        horsCadre: r(c).g < -1 || r(c).d > window.innerWidth + 1,
      }));
      const texte = document.body.innerText;
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        debordement: document.documentElement.scrollWidth - window.innerWidth,
        cartes,
        attendusPresents: attendus.filter((a) => cartes.some((c) => c.titre.replace(/ /g, ' ') === a)),
        revendiqueDeuxAgences: /Deux agences/i.test(texte),
        header: !!document.querySelector('#hcHeader, header.hc-header'),
        footer: !!document.querySelector('footer'),
        liensHeader: document.querySelectorAll('#hcHeader a, header.hc-header a').length,
      };
    }, { attendus: POLES_ATTENDUS });
    const sec = page.locator('.z-section').filter({ has: page.locator('.z-zone-card') }).first();
    if (await sec.count()) await sec.screenshot({ path: join(ICI, `${etat.cle}-${L}-zones-4poles.jpg`), quality: 72 }).catch(() => {});

    // ── contact.html : la carte basse de page doit rester paresseuse
    await page.goto(`${etat.base}/contact.html`, { waitUntil: 'commit', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    bloc.contactAvantDefilement = await page.evaluate(() => ({
      scrollY: window.scrollY,
      conteneurLeaflet: document.querySelectorAll('.leaflet-container').length,
      tuiles: document.querySelectorAll('.leaflet-tile-loaded').length,
      ancre: !!document.querySelector('[data-hc-map-zones]'),
    }));
    await page.evaluate(() => { const a = document.querySelector('[data-hc-map-zones]'); if (a) a.scrollIntoView({ block: 'center' }); });
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-tile-loaded').length > 0 || performance.now() > 15000, null, { timeout: 20000 }).catch(() => {});
    bloc.contactApresDefilement = await page.evaluate(() => ({
      conteneurLeaflet: document.querySelectorAll('.leaflet-container').length,
      tuiles: document.querySelectorAll('.leaflet-tile-loaded').length,
    }));

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

lignes.push('# PR #24 — mesures (reproducteur `mesures.mjs`)', '', `Généré le ${resultats.genere_le}`, '');
for (const etat of ETATS) {
  const e = resultats.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  lignes.push(`- cache-bust \`${CACHE_BUST}\` : ` + PAGES_CARTE.map((p) => `\`${p}\` ${e.cacheBust[p].statut} ${e.cacheBust[p].conforme ? '**conforme**' : '→ ' + (e.cacheBust[p].versions.join(',') || 'absent')}`).join(' · '));
  for (const L of LARGEURS) {
    const b = e.largeurs[L], c = b.carte, z = b.zones;
    lignes.push('', `### ${L} px`);
    lignes.push(`- débordement : scrollWidth **${z.scrollWidth}** vs innerWidth **${z.innerWidth}** → **${z.debordement}** px`);
    const st = b.carteStabilisee || {};
    lignes.push(`- **carte, sans aucun défilement** (scrollY ${c.aDefile} puis ${st.aDefile}) : Leaflet ${c.leafletCharge ? 'chargé' : '**non chargé**'} · conteneur posé à **${c.msConteneur ?? '—'} ms** · 1re tuile peinte à **${c.msPremiereTuile ?? '—'} ms** · 8 tuiles à **${st.msHuitTuiles ?? '—'} ms** · une fois posée : **${st.tuilesChargees} tuiles**, couverture **${st.couverturePourCent} %**, tuiles en erreur ${st.tuilesEnErreur} · grise : **${st.grise ? 'OUI' : 'non'}** · cadre ${JSON.stringify(c.conteneur)}`);
    lignes.push(`- pôles attendus présents : **${z.attendusPresents.length}/4** — ${z.cartes.map((x) => `« ${x.titre} » (${x.badge})${x.horsCadre ? ' **HORS CADRE**' : ''}`).join(' · ') || 'aucune carte'}`);
    lignes.push(`- revendication « Deux agences » : **${z.revendiqueDeuxAgences ? 'OUI' : 'non'}** · header ${z.header ? 'présent' : '**absent**'} (${z.liensHeader} liens) · footer ${z.footer ? 'présent' : '**absent**'}`);
    lignes.push(`- **contact.html** : avant défilement → ${b.contactAvantDefilement.conteneurLeaflet} conteneur(s), ${b.contactAvantDefilement.tuiles} tuile(s) ${b.contactAvantDefilement.tuiles === 0 ? '(**paresseux respecté**)' : '(**chargement anticipé**)'} · après défilement → ${b.contactApresDefilement.conteneurLeaflet} conteneur(s), ${b.contactApresDefilement.tuiles} tuile(s)`);
    const duTiroir = (x) => /app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x);
    const propres = b.console.filter((x) => !duTiroir(x));
    lignes.push(`- erreurs console imputables au site : ${propres.length ? propres.map((x) => `\`${x}\``).join(' · ') : '**aucune**'} _(écartées, tiroir de preview : ${b.console.length - propres.length})_`);
  }
  lignes.push('');
}
lignes.push('## Empreintes des captures produites par ce script', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\` — ${Math.round(c.octets / 1024)} Ko`);
writeFileSync(join(ICI, 'MESURES-PR24.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
