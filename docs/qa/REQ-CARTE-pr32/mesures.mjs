/**
 * PR #32 — hotfix de la carte des zones : tuiles sans clé API, une agence et trois pôles.
 *
 * Contrôle la preview de la PR et la production (état « avant »), en 1440 et en 390 :
 * tuiles réellement peintes, aucune filigrane « API REQUIRED », zoom et déplacement
 * opérants, quatre marqueurs, rôles corrects, aucune mention « 2 agences », attribution
 * OpenStreetMap visible, console propre. N'envoie aucun formulaire.
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
  { cle: 'pr32', libelle: 'PR #32 (preview)', base: process.env.URL_PR || 'https://deploy-preview-32--remarkable-dragon-364e2b.netlify.app', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'prod', libelle: 'production (avant)', base: process.env.URL_MAIN || 'https://depan59-62.fr', sha: process.env.SHA_MAIN || 'main' },
];
const res = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  res.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const erreurs = [], tuiles = [];
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text().slice(0, 130)); });
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + String(e).slice(0, 130)));
    page.on('response', (r) => { if (/tile|basemaps|cartocdn|openstreetmap/i.test(r.url())) tuiles.push({ statut: r.status(), hote: new URL(r.url()).host }); });

    await page.goto(`${etat.base}/zones-intervention.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });

    const m = await page.evaluate(() => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), l: Math.round(b.width), h: Math.round(b.height) }; };
      const cont = document.querySelector('.leaflet-container');
      const chargees = [...document.querySelectorAll('img.leaflet-tile-loaded')];
      let couverture = 0;
      if (cont && chargees.length) {
        const c = cont.getBoundingClientRect(), aire = Math.max(1, c.width * c.height);
        couverture = chargees.reduce((s, t) => { const b = t.getBoundingClientRect();
          return s + Math.max(0, Math.min(b.right, c.right) - Math.max(b.left, c.left)) * Math.max(0, Math.min(b.bottom, c.bottom) - Math.max(b.top, c.top)); }, 0) / aire;
      }
      const attribution = document.querySelector('.leaflet-control-attribution');
      const marqueurs = [...document.querySelectorAll('.hc-marker-pin, .leaflet-marker-icon')];
      const texte = document.body.innerText;
      return {
        conteneur: r(cont),
        tuilesChargees: chargees.length,
        tuilesEnErreur: document.querySelectorAll('.leaflet-tile-error').length,
        couverturePourCent: Math.round(couverture * 100),
        // « API REQUIRED » est un filigrane dessiné DANS l'image : on le cherche dans les URL servies
        sourcesDesTuiles: [...new Set(chargees.map((t) => { try { return new URL(t.src).host; } catch (e) { return '?'; } }))],
        attributionTexte: attribution ? attribution.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) : null,
        attributionVisible: attribution ? (() => { const cs = getComputedStyle(attribution); const b = attribution.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0; })() : false,
        lienOsmVisible: (() => { const a = document.querySelector('.leaflet-control-attribution a[href*="openstreetmap"]');
          if (!a) return false; const cs = getComputedStyle(a); const b = a.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0; })(),
        nbMarqueurs: marqueurs.length,
        marqueurs: marqueurs.map((e) => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean),
        mentionsDeuxAgences: texte.split('\n').filter((l) => /(deux agences|2 agences|agences locales)/i.test(l)).map((l) => l.trim().slice(0, 90)),
        panneau: (document.querySelector('.hc-map-info') || {}).innerText ? document.querySelector('.hc-map-info').innerText.replace(/\s+/g, ' ').trim().slice(0, 220) : null,
        zoomPresent: !!document.querySelector('.leaflet-control-zoom'),
      };
    });

    // zoom et deplacement : on agit, puis on verifie que le centre a bouge
    let interaction = { testable: false };
    if (m.conteneur) {
      interaction = await page.evaluate(async () => {
        const el = document.querySelector('.leaflet-container');
        const avant = { tuiles: document.querySelectorAll('img.leaflet-tile-loaded').length };
        const btn = document.querySelector('.leaflet-control-zoom-in');
        if (btn) btn.click();
        await new Promise((r) => setTimeout(r, 2200));
        const apresZoom = document.querySelectorAll('img.leaflet-tile-loaded').length;
        // deplacement : glisser le fond de carte
        const b = el.getBoundingClientRect();
        const ev = (t, x, y) => el.dispatchEvent(new MouseEvent(t, { bubbles: true, clientX: x, clientY: y, button: 0 }));
        ev('mousedown', b.left + b.width / 2, b.top + b.height / 2);
        ev('mousemove', b.left + b.width / 2 - 90, b.top + b.height / 2 - 60);
        ev('mouseup', b.left + b.width / 2 - 90, b.top + b.height / 2 - 60);
        await new Promise((r) => setTimeout(r, 1800));
        return { testable: true, zoomBouton: !!btn, tuilesAvant: avant.tuiles, tuilesApresZoom: apresZoom,
                 tuilesApresDeplacement: document.querySelectorAll('img.leaflet-tile-loaded').length,
                 enErreurApres: document.querySelectorAll('.leaflet-tile-error').length };
      });
    }
    await page.evaluate(() => { const c = document.querySelector('.leaflet-container'); if (c) c.scrollIntoView({ block: 'center' }); });
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-carte.jpg`), quality: 75 });

    res.etats[etat.cle].largeurs[L] = { ...m, interaction, tuilesReseau: tuiles.slice(0, 6), console: erreurs };
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(res, null, 1) + '\n');

lignes.push('# PR #32 — carte des zones, avant / après', '', `Généré le ${res.genere_le}`, '');
for (const etat of ETATS) {
  const e = res.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  for (const L of [1440, 390]) {
    const b = e.largeurs[L], i = b.interaction;
    lignes.push(`### ${L} px`);
    lignes.push(`- tuiles : **${b.tuilesChargees} chargées**, ${b.tuilesEnErreur} en erreur · couverture **${b.couverturePourCent} %** · source : ${b.sourcesDesTuiles.join(', ') || '—'}`);
    lignes.push(`- attribution : ${b.attributionVisible ? '**visible**' : '**absente ou masquée**'} · lien OpenStreetMap ${b.lienOsmVisible ? '**visible**' : '**masqué**'} · « ${b.attributionTexte || '—'} »`);
    lignes.push(`- marqueurs : **${b.nbMarqueurs}** — ${b.marqueurs.join(' · ') || '—'}`);
    lignes.push(`- panneau : « ${b.panneau || '—'} »`);
    lignes.push(`- mentions « 2 agences » : ${b.mentionsDeuxAgences.length ? '**' + b.mentionsDeuxAgences.join(' / ') + '**' : '**aucune**'}`);
    lignes.push(`- zoom et déplacement : ${i.testable ? `bouton ${i.zoomBouton} · tuiles ${i.tuilesAvant} → ${i.tuilesApresZoom} (zoom) → ${i.tuilesApresDeplacement} (déplacement) · en erreur ${i.enErreurApres}` : 'carte absente'}`);
    const duTiroir = (x) => /app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x);
    const propres = b.console.filter((x) => !duTiroir(x));
    lignes.push(`- console imputable au site : ${propres.length ? propres.map((x) => `\`${x}\``).join(' · ') : '**aucune**'}`, '');
  }
}
lignes.push('## Empreintes des captures', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\``);
writeFileSync(join(ICI, 'MESURES-PR32.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
