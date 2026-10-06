/**
 * REQ-041 — relevé des affirmations « deux agences » dans le DOM RENDU.
 *
 * La première version de ce relevé lisait le HTML servi en écartant les <script> : elle
 * ratait donc tout ce qu'un composant injecte à l'exécution — c'est exactement le cas du
 * panneau de la carte des zones. Celui-ci charge chaque page et lit le texte réellement
 * affiché.
 *
 * Usage : BASE=<url> SORTIE_JSON=<fichier> node docs/qa/REQ-041/releve-dom.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable');
import { readFileSync, writeFileSync } from 'node:fs';

const PAGES = readFileSync(process.env.LISTE || '/tmp/pages.txt', 'utf8').split('\n').filter(Boolean);
const BASE = process.env.BASE || 'https://depan59-62.fr';
const SORTIE = process.env.SORTIE_JSON || '/tmp/releve-dom.json';
const MOTIF = /(deux agences|2 agences|agences locales|nos agences|ses agences)/i;

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1100 } });
await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
const page = await ctx.newPage();
const res = { base: BASE, genere_le: new Date().toISOString(), pages: 0, incoherentes: [], erreurs: [] };
for (const p of PAGES) {
  try {
    const r = await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle', timeout: 45000 });
    if (!r || r.status() !== 200) { res.erreurs.push({ p, statut: r ? r.status() : 0 }); continue; }
    await page.waitForTimeout(1200);
    res.pages++;
    const lignes = await page.evaluate((src) => {
      const rx = new RegExp(src, 'i');
      return document.body.innerText.split('\n').map((l) => l.trim()).filter((l) => rx.test(l)).map((l) => l.slice(0, 110));
    }, MOTIF.source);
    if (lignes.length) res.incoherentes.push({ p, lignes });
  } catch (e) { res.erreurs.push({ p, erreur: String(e).split('\n')[0].slice(0, 70) }); }
}
await nav.close();
writeFileSync(SORTIE, JSON.stringify(res, null, 1) + '\n');
console.log(`${res.incoherentes.length} page(s) incoherente(s) sur ${res.pages} controlees · ${res.erreurs.length} erreur(s)`);
for (const x of res.incoherentes.slice(0, 10)) console.log(`  ${x.p} → ${x.lignes[0]}`);
