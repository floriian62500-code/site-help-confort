/**
 * REQ-20260926-038 — /nos-prestations.html : supprimer la requête PostgREST en 400.
 *
 * Compare la preview du lot et la production. Vérifie qu'il ne reste qu'UN appel utile à
 * v_services_public, en 200, et que l'affichage des prestations est strictement identique.
 * N'envoie aucun formulaire.
 *
 * Usage : SHA_PR=<sha> URL_PR=<base> node docs/qa/REQ-038/mesures.mjs
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
  { cle: 'pr-preview', libelle: 'lot REQ-038 (preview)', base: process.env.URL_PR || '', sha: process.env.SHA_PR || 'inconnu' },
  { cle: 'prod-avant', libelle: 'production (avant correctif)', base: process.env.URL_MAIN || 'https://depan59-62.fr', sha: process.env.SHA_MAIN || 'main courant' },
].filter((e) => e.base);

const res = { genere_le: new Date().toISOString(), etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  res.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
    const page = await ctx.newPage();
    const reseau = [], erreurs = [];
    page.on('response', (r) => {
      if (/\/rest\/v1\//.test(r.url())) reseau.push({ statut: r.status(), url: r.url().split('/rest/v1/')[1].slice(0, 90) });
    });
    page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text().slice(0, 170)));
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + String(e).slice(0, 170)));

    await page.goto(`${etat.base}/nos-prestations.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });

    const vue = await page.evaluate(() => {
      const cartes = [...document.querySelectorAll('.nv-card, [class*="nv-card"]')];
      const prix = [...document.querySelectorAll('[class*="price"],[class*="prix"],[class*="tarif"]')]
        .map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
      return {
        cartes: cartes.length,
        nbPrix: prix.length,
        empreinteAffichage: (() => { // signature stable de ce qui est rendu
          const t = cartes.map((c) => (c.textContent || '').replace(/\s+/g, ' ').trim()).join('|');
          return t.length + ':' + t.slice(0, 120);
        })(),
        messageVide: !!document.querySelector('.nv-empty'),
        debordement: document.documentElement.scrollWidth - innerWidth,
      };
    });
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}.jpg`), quality: 70 });

    const appels = reseau.filter((r) => /v_services_public/.test(r.url));
    res.etats[etat.cle].largeurs[L] = {
      appelsVue: appels,
      appelsEnErreur: reseau.filter((r) => r.statut >= 400),
      vue,
      console: erreurs.filter((x) => !/app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x)),
    };
    await ctx.close();
  }
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(res, null, 1) + '\n');

lignes.push('# REQ-038 — appel REST de /nos-prestations.html', '', `Généré le ${res.genere_le}`, '');
for (const etat of ETATS) {
  const e = res.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  for (const L of [1440, 390]) {
    const b = e.largeurs[L];
    lignes.push(`### ${L} px`);
    lignes.push(`- appels à \`v_services_public\` : **${b.appelsVue.length}** — ${b.appelsVue.map((a) => `${a.statut} \`${a.url}\``).join(' · ') || 'aucun'}`);
    lignes.push(`- réponses en erreur (toutes requêtes REST) : **${b.appelsEnErreur.length}** ${b.appelsEnErreur.map((a) => `${a.statut} \`${a.url}\``).join(' · ')}`);
    lignes.push(`- affichage : **${b.vue.cartes} cartes**, ${b.vue.nbPrix} éléments de prix, message vide : ${b.vue.messageVide} · débordement ${b.vue.debordement} px`);
    lignes.push(`- empreinte d'affichage : \`${b.vue.empreinteAffichage}\``);
    lignes.push(`- erreurs console imputables au site : ${b.console.length ? b.console.map((x) => `\`${x}\``).join(' · ') : '**aucune**'}`, '');
  }
}
lignes.push('## Empreintes des captures', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\``);
writeFileSync(join(ICI, 'MESURES-REQ-038.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
