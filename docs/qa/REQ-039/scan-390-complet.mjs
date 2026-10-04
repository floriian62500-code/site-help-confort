import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const pages = readFileSync('/tmp/pages.txt', 'utf8').split('\n').filter(Boolean);
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
const page = await ctx.newPage();
const res = [];
for (const p of pages) {
  try {
    const r = await page.goto('https://depan59-62.fr/' + p, { waitUntil: 'networkidle', timeout: 45000 });
    if (!r || r.status() !== 200) { res.push({ p, statut: r ? r.status() : 0 }); continue; }
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const d = document.documentElement.scrollWidth - innerWidth;
      if (d <= 1) return { d: 0 };
      const desc = (e) => `${e.tagName}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : ''}`;
      const essai = (el) => { const a = el.style.display; el.style.display = 'none'; const sw = document.documentElement.scrollWidth; el.style.display = a; return sw; };
      let n = document.body, chemin = [];
      for (let i = 0; i < 7; i++) { const s = [...n.children].find((c) => essai(c) <= innerWidth + 1); if (!s) break; chemin.push(desc(s)); n = s; }
      return { d, cause: chemin[chemin.length - 1] || '?', chemin: chemin.join(' > ') };
    });
    res.push({ p, ...m });
  } catch (e) { res.push({ p, erreur: String(e).split('\n')[0].slice(0, 60) }); }
}
await nav.close();
const debordent = res.filter((x) => x.d > 1);
const parCause = {};
for (const x of debordent) parCause[x.cause] = (parCause[x.cause] || 0) + 1;
writeFileSync('/tmp/scan390-complet.json', JSON.stringify({ total: pages.length, debordent: debordent.length, parCause, detail: debordent }, null, 1));
console.log(`${debordent.length} pages débordent sur ${res.length} contrôlées`);
console.log('causes :', JSON.stringify(parCause, null, 1));
console.log('erreurs de chargement :', res.filter((x) => x.erreur || x.statut).length);
