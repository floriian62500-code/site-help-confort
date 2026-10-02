import { chromium } from 'playwright';
const SHA = 'b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d';
const BASE = 'https://deploy-preview-21--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien';
const OUT = '/Users/HP/Documents/Claude/Projects/SITE INTERNET/docs/qa/REQ-017-from-main';
const VUES = [['1440', { width: 1440, height: 1100 }], ['390', { width: 390, height: 844 }]];
const ONGLETS = [['gaz', 'en-gaz', 'pane-gaz'], ['fioul', 'en-fioul', 'pane-fioul'], ['adoucisseur', 'en-eau', 'pane-eau']];
const nav = await chromium.launch();
const journal = [`# Mesures REQ-017 — SHA ${SHA}`, `# relevées le ${new Date().toISOString().slice(0,19)}Z sur deploy-preview-21`, ''];
const dire = (s) => { console.log(s); journal.push(s); };
for (const [nom, viewport] of VUES) {
  // viewport réel, SANS émulation mobile : l'émulation « rétrécit pour faire tenir » et masque
  // justement le débordement qu'on veut mesurer.
  const ctx = await nav.newContext({ viewport });
  await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.locator('#pane-gaz .formula-card').first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  dire(`\n## Vue ${nom}`);
  for (const [lib, radio, pane] of ONGLETS) {
    await page.locator(`label[for="${radio}"]`).click().catch(() => {});
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => {
      const W = window.innerWidth, d = document.documentElement, sec = document.querySelector('#entretien');
      const r = sec.getBoundingClientRect();
      const horsCadre = [...sec.querySelectorAll('*')].filter((e) => {
        const q = e.getBoundingClientRect();
        if (!(q.width > 0)) return false;
        const cs = getComputedStyle(e);
        if (cs.clipPath === 'inset(50%)') return false;      // champ anti-robot masqué par découpe
        return q.right > W + 1 || q.left < -1;
      }).length;
      return { pageScrollWidth: d.scrollWidth, innerWidth: W, section: [Math.round(r.left), Math.round(r.right)], horsCadre };
    });
    dire(`- onglet ${lib.padEnd(12)} : page scrollWidth ${m.pageScrollWidth} / innerWidth ${m.innerWidth}` +
         ` · section [${m.section[0]}→${m.section[1]}] · éléments du module hors cadre : ${m.horsCadre}`);
    await page.screenshot({ path: `${OUT}/v2-tarifs-${lib}-${nom}.png` });
  }
  // modale
  await page.locator('label[for="en-gaz"]').click().catch(() => {});
  await page.waitForTimeout(400);
  const btn = page.locator('#pane-gaz .formula-card .formula-cta').first();
  await btn.scrollIntoViewIfNeeded().catch(() => {});
  await btn.click({ timeout: 8000 }).catch(async () => { await btn.dispatchEvent('click'); });
  await page.waitForTimeout(1100);
  const mod = await page.evaluate(() => {
    const W = window.innerWidth, c = document.querySelector('#souscriptionModal .sous-card');
    const r = c.getBoundingClientRect();
    const horsCadre = [...c.querySelectorAll('*')].filter((e) => {
      const q = e.getBoundingClientRect();
      if (!(q.width > 0)) return false;
      if (getComputedStyle(e).clipPath === 'inset(50%)') return false;
      return q.right > W + 1 || q.left < -1;
    }).length;
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), largeur: Math.round(r.width),
             innerWidth: W, dansLeCadre: r.left >= 0 && r.right <= W && r.top >= 0, horsCadre,
             tarif: (document.getElementById('sousPrix') || {}).textContent };
  });
  dire(`- modale ouverte : [${mod.left}→${mod.right}] haut ${mod.top} dans 0→${mod.innerWidth}` +
       ` · entièrement dans le cadre : ${mod.dansLeCadre} · enfants hors cadre : ${mod.horsCadre} · tarif repris : "${mod.tarif}" · aucun envoi`);
  await page.screenshot({ path: `${OUT}/v2-souscription-${nom}.png` });
  await ctx.close();
}
await nav.close();
import { writeFileSync } from 'fs';
writeFileSync(`${OUT}/MESURES-${SHA.slice(0,8)}.txt`, journal.join('\n') + '\n');
console.log('\njournal écrit');
