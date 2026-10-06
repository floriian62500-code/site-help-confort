import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const pages = readFileSync('/tmp/pages.txt', 'utf8').split('\n').filter(Boolean);
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
const page = await ctx.newPage();
const qui_deborde = [];
for (const p of pages) {
  try {
    const r = await page.goto('https://depan59-62.fr/' + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!r || r.status() !== 200) continue;
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const d = document.documentElement.scrollWidth - innerWidth;
      if (d <= 1) return null;
      const desc = (e) => `${e.tagName}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : ''}`;
      let n = document.body, chemin = [];
      const essai = (el) => { const a = el.style.display; el.style.display = 'none'; const sw = document.documentElement.scrollWidth; el.style.display = a; return sw; };
      for (let i = 0; i < 6; i++) {
        const s = [...n.children].find((c) => essai(c) <= innerWidth + 1);
        if (!s) break; chemin.push(desc(s)); n = s;
      }
      return { d, chemin: chemin.slice(-3).join(' > ') };
    });
    if (m) { qui_deborde.push({ p, ...m }); console.log(`  ❌ ${String(m.d).padStart(5)} px  ${p}  (${m.chemin})`); }
  } catch (e) { /* page lente ou inaccessible : ignorée */ }
}
console.log(`\n${qui_deborde.length} page(s) qui débordent sur ${pages.length} contrôlées`);
const parCause = {};
for (const x of qui_deborde) { const k = x.chemin.split(' > ').pop(); parCause[k] = (parCause[k] || 0) + 1; }
console.log('causes :', JSON.stringify(parCause, null, 1));
await nav.close();
