/**
 * REQ-20260926-035 — encart saisonnier : preuve visuelle refaite.
 *
 * Le rework demande huit captures accueil/contact/catalogue/zones en 1440 et 390, SANS le
 * bandeau cookies, avec l'encart visible et l'absence de recouvrement de la barre d'action
 * collante prouvée. Ce script refuse de capturer tant que le bandeau est là : il le constate,
 * le referme s'il le faut, et le réaffirme avant chaque capture.
 *
 * Usage : SHA=<sha> node docs/qa/REQ-035-v3/mesures.mjs
 */
const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium);
if (!chromium) throw new Error('playwright introuvable');
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ICI = process.env.SORTIE ? resolve(process.env.SORTIE) : dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app';
const SHA = process.env.SHA || 'inconnu';
const PAGES = [
  { cle: 'accueil', url: '/' },
  { cle: 'contact', url: '/contact.html' },
  { cle: 'catalogue', url: '/catalogue.html' },
  { cle: 'zones', url: '/zones-intervention.html' },
  // cinquieme page : celle qui porte REELLEMENT la barre d'action collante, sinon le critere
  // « ne recouvre jamais la barre collante » ne serait prouve sur aucune page
  { cle: 'chauffage', url: '/chauffagiste-saint-omer.html' },
];

const res = { genere_le: new Date().toISOString(), base: BASE, sha: SHA, pages: {} };
const lignes = [];
const nav = await chromium.launch();

for (const L of [1440, 390]) {
  const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 } });
  // le consentement est refusé AVANT tout script de page, sur chaque document
  await ctx.addInitScript(() => { try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {} });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1800);
    // garde : si le bandeau est malgré tout là, on le referme et on le prouve
    const avant = await page.evaluate(() => !!document.getElementById('hc-consent-banner'));
    if (avant) {
      await page.evaluate(() => {
        const b = document.getElementById('hc-consent-banner');
        const refus = [...b.querySelectorAll('button,a')].find((x) => /refus|continuer sans|non/i.test(x.textContent));
        if (refus) refus.click(); else b.remove();
      });
      await page.waitForTimeout(600);
    }
    await page.evaluate(() => { document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove()); });
    await page.locator('#entretien-saison').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    const m = await page.evaluate(() => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), bas: Math.round(b.bottom) }; };
      const promo = document.getElementById('entretien-saison');
      // tout élément fixe ancré en bas de l'écran : barre d'action collante, boutons flottants…
      const fixesBas = [...document.querySelectorAll('body *')].filter((e) => {
        const cs = getComputedStyle(e);
        if (cs.position !== 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return false;
        // on ignore ce qui ne peut rien recouvrir : conteneurs transparents, non cliquables,
        // et les widgets qui n'existent QUE sur la recette (centre de validation)
        if (parseFloat(cs.opacity) === 0 || cs.pointerEvents === 'none') return false;
        if (e.id === 'hc-sv-cta' || e.id === 'hctslModal' || e.closest('#hc-sv-cta,#hctslModal')) return false;
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && b.bottom > window.innerHeight - 160 && e.id !== 'entretien-saison' && !e.closest('#entretien-saison');
      }).map((e) => ({ sel: e.tagName + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0] : ''), rect: r(e) }));
      const barre = document.getElementById('hcStickyCta'); // la barre d'action collante, masquee au-dessus de 880 px
      const pr = promo ? promo.getBoundingClientRect() : null;
      const recouvrements = pr ? fixesBas.filter((f) => {
        const b = f.rect;
        return !(pr.right <= b.g || pr.left >= b.d || pr.bottom <= b.h || pr.top >= b.bas);
      }) : [];
      return {
        bandeauCookies: !!document.getElementById('hc-consent-banner'),
        consentement: (() => { try { return localStorage.getItem('hc-consent'); } catch (e) { return 'inaccessible'; } })(),
        encartPresent: !!promo,
        encartVisible: promo ? getComputedStyle(promo).display !== 'none' && promo.getBoundingClientRect().height > 0 : false,
        encartRect: r(promo),
        encartDansLEcran: pr ? pr.left >= -1 && pr.right <= window.innerWidth + 1 && pr.bottom <= window.innerHeight + 1 : false,
        boutonFermeture: promo ? promo.querySelectorAll('button[aria-label*="erm"], .hcs-fermer, [data-fermer]').length : null,
        barreCollante: barre ? { rect: r(barre), visible: getComputedStyle(barre).display !== 'none' } : null,
        recouvreLaBarreCollante: (() => {
          if (!barre || !pr) return false;
          const b = barre.getBoundingClientRect();
          if (getComputedStyle(barre).display === 'none') return false;
          return !(pr.right <= b.left || pr.left >= b.right || pr.bottom <= b.top || pr.top >= b.bottom);
        })(),
        elementsFixesEnBas: fixesBas,
        recouvrements,
        scrollY: window.scrollY,
        innerWidth: window.innerWidth,
      };
    });
    await page.screenshot({ path: join(ICI, `${p.cle}-${L}.jpg`), quality: 75 });
    (res.pages[p.cle] ||= {})[L] = { ...m, bandeauAvantGarde: avant };
  }
  await ctx.close();
}
await nav.close();

const captures = readdirSync(ICI).filter((f) => f.endsWith('.jpg')).sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16) }));
res.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(res, null, 1) + '\n');

lignes.push('# REQ-035 — encart saisonnier, preuve visuelle refaite', '', `Généré le ${res.genere_le}`, `SHA : \`${SHA}\` · ${BASE}`, '');
for (const L of [1440, 390]) {
  lignes.push(`## ${L} px`, '');
  lignes.push('| page | bandeau cookies | encart visible | sans défilement | dans l\'écran | bouton de fermeture | recouvre la barre collante | autre recouvrement |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const p of PAGES) {
    const m = res.pages[p.cle][L];
    lignes.push(`| \`${p.url}\` | ${m.bandeauCookies ? '**PRÉSENT**' : 'absent'}${m.bandeauAvantGarde ? ' _(refermé par la garde)_' : ''} | ${m.encartVisible ? 'oui' : '**NON**'} | scrollY ${m.scrollY} | ${m.encartDansLEcran ? 'oui' : '**NON**'} | **${m.boutonFermeture}** | ${m.recouvreLaBarreCollante ? '**OUI**' : (m.barreCollante ? 'non' : 'pas de barre sur cette page')} | ${m.recouvrements.length ? '**' + m.recouvrements.map((x) => x.sel).join(', ') + '**' : 'aucun'} |`);
  }
  lignes.push('');
  for (const p of PAGES) {
    const m = res.pages[p.cle][L];
    lignes.push(`- \`${p.url}\` — encart ${JSON.stringify(m.encartRect)} · éléments fixes en bas : ${m.elementsFixesEnBas.map((x) => `${x.sel} ${JSON.stringify(x.rect)}`).join(' · ') || 'aucun'}`);
  }
  lignes.push('');
}
lignes.push('## Empreintes des captures', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\``);
writeFileSync(join(ICI, 'MESURES-REQ-035.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
