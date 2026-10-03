/**
 * REQ-20260926-017 — reproducteur de preuves pour la PR #23.
 *
 * Mesure le MÊME parcours sur deux états exacts, sans rien soumettre :
 *   1. main courant, servi par la production Netlify ;
 *   2. la PR #23, servie par sa preview Netlify.
 *
 * Usage (playwright requis) :
 *   SHA_MAIN=<sha> SHA_PR=<sha> node docs/qa/REQ-017-pr23/mesures.mjs
 * Si playwright n'est pas installé dans le dépôt, pointer dessus :
 *   PLAYWRIGHT_IMPORT=/chemin/vers/node_modules/playwright/index.js SHA_MAIN=… node …
 *
 * Produit, dans le dossier de ce script : mesures.json, MESURES-PR23.md et les captures.
 * N'ENVOIE AUCUN FORMULAIRE. Ne clique jamais le bouton d'envoi final.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const pw = await import(process.env.PLAYWRIGHT_IMPORT || 'playwright');
const chromium = pw.chromium || (pw.default && pw.default.chromium); // CJS ou ESM selon le point d'entrée
if (!chromium) throw new Error('playwright introuvable : installer playwright ou définir PLAYWRIGHT_IMPORT');

const ICI = dirname(fileURLToPath(import.meta.url));
const PROD = process.env.URL_MAIN || 'https://remarkable-dragon-364e2b.netlify.app';
const PREVIEW = process.env.URL_PR || 'https://deploy-preview-23--remarkable-dragon-364e2b.netlify.app';
const ETATS = [
  { cle: 'main-prod', libelle: 'main courant (production)', base: PROD, sha: process.env.SHA_MAIN || 'inconnu', moduleAttendu: false },
  { cle: 'pr23-preview', libelle: 'PR #23 (preview)', base: PREVIEW, sha: process.env.SHA_PR || 'inconnu', moduleAttendu: true },
];
const LARGEURS = [1440, 390];
const PRIX_CANONIQUES = ['9,90', '14,30', '25,30'];

/** Retire l'habillage de preview Netlify : ce n'est pas le site, et il intercepte les clics. */
const sansTiroirNetlify = (page) =>
  page.evaluate(() => {
    document.querySelectorAll('iframe[src*="app.netlify.com/cdp"], div[data-netlify-deploy-id]').forEach((e) => e.remove());
  });

const rect = (e) => {
  if (!e) return null;
  const b = e.getBoundingClientRect();
  return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), l: Math.round(b.width) };
};

/** Mesure la page Chauffage : débordement horizontal, coupable, module. */
async function mesurerChauffage(page) {
  return page.evaluate(
    ({ prix }) => {
      const r = (e) => {
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), l: Math.round(b.width) };
      };
      const track = document.querySelector('.hcf-track');
      const ancetres = [];
      for (let n = track && track.parentElement; n && n !== document.documentElement; n = n.parentElement) {
        ancetres.push({ tag: n.tagName, cls: String(n.className || '').slice(0, 32), overflowX: getComputedStyle(n).overflowX });
      }
      const horsCadre = (racine) =>
        [...racine.querySelectorAll('*')]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return b.width > 0 && (b.left < -1 || b.right > window.innerWidth + 1);
          })
          .map((e) => ({ tag: e.tagName, cls: String(e.className || '').slice(0, 32), nom: e.name || e.id || '', rect: r(e) }));

      const module = document.querySelector('.ct-contrats-page');
      const onglets = [...document.querySelectorAll('.energy-switch [role="tab"], .energy-switch label')].map((e) => ({
        libelle: e.textContent.replace(/\s+/g, ' ').trim(),
        pour: e.getAttribute('for'),
        actif: !!(e.getAttribute('for') && (document.getElementById(e.getAttribute('for')) || {}).checked),
      }));
      const PALIERS = ['basic', 'confort', 'securite'];
      const cartes = [...document.querySelectorAll('.formula-card')].map((c) => ({
        energie: c.getAttribute('data-energy') || ((c.closest('.energy-pane') || {}).id || '').replace('pane-', '') || null,
        palier: c.getAttribute('data-tier') || PALIERS.find((t) => c.classList.contains(t)) || null,
        nom: (c.querySelector('.formula-name') || {}).textContent,
        prix: ((c.querySelector('.formula-price') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
        cta: ((c.querySelector('.formula-cta') || {}).textContent || '').trim(),
        href: (c.querySelector('.formula-cta') || { getAttribute: () => null }).getAttribute('href'),
      }));
      // double présentation : l'ancien bloc statique .ce-* coexiste-t-il avec le module ?
      const blocStatique = document.querySelectorAll('.ce-card').length;
      const texte = document.body.innerText;
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        debordement: document.documentElement.scrollWidth - window.innerWidth,
        hcfTrack: r(track),
        hcfMarquee: r(document.querySelector('.hcf-marquee')),
        ancetresDuCarrousel: ancetres,
        horsCadrePage: horsCadre(document.body).length,
        module: module ? { present: true, rect: r(module), horsCadre: horsCadre(module) } : { present: false },
        onglets,
        cartes,
        blocStatiqueCeCard: blocStatique,
        prixCanoniquesAffiches: prix.filter((p) => texte.includes(p)),
      };
    },
    { prix: PRIX_CANONIQUES }
  );
}

/** Mesure la modale de souscription ouverte. N'envoie rien. */
async function mesurerSouscription(page) {
  return page.evaluate(() => {
        const r = (e) => {
          if (!e) return null;
          const b = e.getBoundingClientRect();
          return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), l: Math.round(b.width) };
        };
        const el = document.getElementById('souscriptionModal');
        if (!el) return { ouverte: false };
        const carte = el.querySelector('.sous-card');
        const controles = [...el.querySelectorAll('input,select,textarea,button')].filter((c) => c.type !== 'hidden' && c.offsetParent !== null);
        const horsViewport = controles
          .filter((c) => { const b = c.getBoundingClientRect(); return b.left < -1 || b.right > window.innerWidth + 1; })
          .map((c) => ({ nom: c.name || c.id || c.textContent.trim().slice(0, 20), rect: r(c) }));
        const avant = carte.scrollTop;
        carte.scrollTop = avant + 200;
        const scrollVertical = carte.scrollTop !== avant || carte.scrollHeight <= carte.clientHeight + 1;
        carte.scrollTop = avant;
        return {
          ouverte: getComputedStyle(el).display !== 'none',
          energie: (document.getElementById('sousType') || {}).textContent,
          formule: (document.getElementById('sousFormule') || {}).textContent,
          tarif: (document.getElementById('sousPrix') || {}).textContent,
          rectCarte: r(carte),
          innerWidth: window.innerWidth,
          clippingHorizontal: carte.scrollWidth > carte.clientWidth + 1,
          clippingCoupables: carte.scrollWidth > carte.clientWidth + 1
            ? [...carte.querySelectorAll('*')]
                .filter((e) => {
                  const b = e.getBoundingClientRect();
                  const c = carte.getBoundingClientRect();
                  return b.width > 0 && b.right > c.right + 1;
                })
                .slice(0, 6)
                .map((e) => ({ tag: e.tagName, cls: String(e.className || '').slice(0, 28), nom: e.name || e.id || '', rect: r(e), style: (e.getAttribute('style') || '').slice(0, 48) }))
            : [],
          scrollVerticalOperant: scrollVertical,
          controlesVisibles: controles.length,
          controlesHorsViewport: horsViewport,
          casesPreCochees: [...el.querySelectorAll('input[type=checkbox]')].filter((c) => c.checked).length,
          champsTextePreRemplis: [...el.querySelectorAll('input[type=text],input[type=email],input[type=tel],textarea')].filter((i) => i.value.trim()).length,
          etapes: [...el.querySelectorAll('[class*="step"],[data-step]')].length,
          envoiEffectue: false,
        };
      });
}

const resultats = { genere_le: new Date().toISOString(), prod: PROD, preview: PREVIEW, etats: {} };
const lignes = [];
const nav = await chromium.launch();

for (const etat of ETATS) {
  resultats.etats[etat.cle] = { libelle: etat.libelle, base: etat.base, sha: etat.sha, largeurs: {} };
  for (const L of LARGEURS) {
    const ctx = await nav.newContext({ viewport: { width: L, height: L === 1440 ? 1100 : 844 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try { localStorage.setItem('hc-consent', 'denied'); } catch (e) {}
    });
    const page = await ctx.newPage();
    const console_ = [];
    page.on('console', (m) => m.type() === 'error' && console_.push(m.text().slice(0, 160)));
    page.on('pageerror', (e) => console_.push('pageerror: ' + String(e).slice(0, 160)));

    const bloc = { console: console_ };
    await page.goto(etat.base + '/chauffagiste-saint-omer', { waitUntil: 'networkidle', timeout: 60000 });
    if (etat.moduleAttendu) await page.locator('.formula-card').first().waitFor({ state: 'visible', timeout: 25000 });
    await page.waitForTimeout(1200);
    await sansTiroirNetlify(page);
    bloc.chauffage = await mesurerChauffage(page);
    await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-chauffage.jpg`), quality: 70 });

    if (etat.moduleAttendu) {
      // B. transition Gaz CONFORT -> page Contrats
      const cta = page.locator('.formula-cta[data-hc-cta="contrats_choisir_gaz-confort"]');
      await cta.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(400);
      await sansTiroirNetlify(page);
      await Promise.all([page.waitForURL(/contrats-entretien/, { timeout: 25000 }), cta.click({ timeout: 15000 })]);
      await page.waitForTimeout(2400);
      await sansTiroirNetlify(page);
      bloc.transition = await page.evaluate(() => {
        const r = (e) => {
          if (!e) return null;
          const b = e.getBoundingClientRect();
          return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), l: Math.round(b.width) };
        };
        const choisie = document.querySelector('.formula-card.is-handoff-choice');
        const cta = choisie && choisie.querySelector('.formula-cta');
        if (cta) cta.focus();
        const radio = document.querySelector('input[name="energy"]:checked, input[name="energie"]:checked');
        const onglets = [...document.querySelectorAll('.energy-switch [role="tab"], .energy-switch label')].map((e) => ({
          libelle: e.textContent.replace(/\s+/g, ' ').trim(),
          actif: !!(e.getAttribute('for') && (document.getElementById(e.getAttribute('for')) || {}).checked),
        }));
        const paneVisible = [...document.querySelectorAll('[id^="pane-"]')].filter((p) => p.offsetParent !== null).map((p) => p.id);
        return {
          url: location.pathname + location.search + location.hash,
          energieCochee: radio ? radio.id || radio.value : null,
          onglets,
          panesVisibles: paneVisible,
          formuleChoisie: choisie ? (choisie.querySelector('.formula-name') || {}).textContent : null,
          prixAffiche: choisie ? ((choisie.querySelector('.formula-price') || {}).textContent || '').replace(/\s+/g, ' ').trim() : null,
          rectChoisie: r(choisie),
          ctaVisible: cta ? cta.getBoundingClientRect().width > 0 : false,
          ctaFocalise: cta ? document.activeElement === cta : false,
          aLEcran: choisie ? (() => { const b = choisie.getBoundingClientRect(); return b.top < window.innerHeight && b.bottom > 0; })() : false,
          innerWidth: window.innerWidth,
        };
      });
      await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-transition.jpg`), quality: 70 });

      // C. ouverture de la souscription — AUCUN ENVOI
      await page.locator('.formula-card.is-handoff-choice .formula-cta').click({ timeout: 15000 });
      await page.waitForTimeout(1600);
      bloc.souscription = await mesurerSouscription(page);
      await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-souscription.jpg`), quality: 70 });

      // D. la page Contrats reste joignable, aucune 301, et les CTA historiques pointent toujours dessus
      bloc.acces = {};
      for (const chemin of ['/contrats-entretien.html', '/contrats-entretien']) {
        const rep = await page.request.get(etat.base + chemin, { maxRedirects: 0 });
        bloc.acces[chemin] = { statut: rep.status(), redirection: rep.headers()['location'] || null };
      }
      await page.goto(etat.base + '/chauffagiste-saint-omer', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(800);
      bloc.ctaHistoriques = await page.evaluate(() =>
        [...document.querySelectorAll('a[href*="contrats-entretien"]')].map((a) => ({
          href: a.getAttribute('href'),
          texte: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 40),
          visible: a.offsetParent !== null,
        }))
      );
    }

    if (!etat.moduleAttendu) {
      // référence : la même modale, ouverte directement depuis la page Contrats de main
      await page.goto(etat.base + '/contrats-entretien.html', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);
      await sansTiroirNetlify(page);
      const ctaRef = page.locator('.formula-card.confort .formula-cta').first();
      if (await ctaRef.count()) {
        await ctaRef.evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(400);
        await sansTiroirNetlify(page);
        await ctaRef.click({ timeout: 15000 });
        await page.waitForTimeout(1600);
        bloc.souscription = await mesurerSouscription(page);
        await page.screenshot({ path: join(ICI, `${etat.cle}-${L}-souscription-reference.jpg`), quality: 70 });
      }
    }

    bloc.console = [...console_];
    resultats.etats[etat.cle].largeurs[L] = bloc;
    await ctx.close();
  }
}
await nav.close();

// empreintes des captures réellement produites
const captures = readdirSync(ICI)
  .filter((f) => f.endsWith('.jpg'))
  .sort()
  .map((f) => ({ fichier: f, sha256: createHash('sha256').update(readFileSync(join(ICI, f))).digest('hex').slice(0, 16), octets: readFileSync(join(ICI, f)).length }));
resultats.captures = captures;
writeFileSync(join(ICI, 'mesures.json'), JSON.stringify(resultats, null, 1) + '\n');

// résumé lisible
lignes.push('# REQ-017 — mesures PR #23 (reproducteur `mesures.mjs`)', '', `Généré le ${resultats.genere_le}`, '');
for (const etat of ETATS) {
  const e = resultats.etats[etat.cle];
  lignes.push(`## ${e.libelle} — \`${e.sha}\``, `URL : ${e.base}`, '');
  for (const L of LARGEURS) {
    const b = e.largeurs[L];
    const c = b.chauffage;
    lignes.push(`### ${L} px`);
    lignes.push(`- débordement page : scrollWidth **${c.scrollWidth}** vs innerWidth **${c.innerWidth}** → **${c.debordement}** px`);
    lignes.push(`- \`.hcf-track\` : ${JSON.stringify(c.hcfTrack)} · \`.hcf-marquee\` : ${JSON.stringify(c.hcfMarquee)}`);
    lignes.push(`- overflow-x des ancêtres du carrousel : ${c.ancetresDuCarrousel.map((a) => `${a.tag}.${a.cls}=${a.overflowX}`).join(' · ') || '—'}`);
    lignes.push(`- module \`.ct-contrats-page\` : ${c.module.present ? `présent ${JSON.stringify(c.module.rect)} · descendants hors cadre : **${c.module.horsCadre.length}**` : '**absent**'}`);
    lignes.push(`- ancien bloc statique \`.ce-card\` : **${c.blocStatiqueCeCard}** · prix canoniques affichés : ${c.prixCanoniquesAffiches.join(' / ') || '—'}`);
    lignes.push(`- onglets du module : ${c.onglets.map((o) => `${o.libelle}${o.actif ? ' (actif)' : ''}`).join(' | ') || '—'} · cartes : ${c.cartes.length}`);
    for (const k of c.cartes.filter((x) => x.energie === 'gaz')) lignes.push(`  - ${k.energie}/${k.palier} ${k.nom} — ${k.prix} — « ${k.cta} » → \`${k.href}\``);
    if (b.transition) {
      const t = b.transition;
      lignes.push(`- **transition** : \`${t.url}\` · onglets ${(t.onglets || []).map((o) => `${o.libelle}${o.actif ? ' (actif)' : ''}`).join(' | ')} · énergie cochée **${t.energieCochee}** · pane visible ${t.panesVisibles.join(',')} · formule **${t.formuleChoisie}** (${t.prixAffiche}) · à l'écran ${t.aLEcran} · CTA visible ${t.ctaVisible} · CTA focalisable **${t.ctaFocalise}** · carte ${JSON.stringify(t.rectChoisie)} dans 0→${t.innerWidth}`);
    }
    if (b.souscription) {
      const s = b.souscription;
      lignes.push(`- **souscription** : ouverte **${s.ouverte}** · « ${s.energie} / ${s.formule} » · tarif « ${s.tarif} » · carte ${JSON.stringify(s.rectCarte)} dans 0→${s.innerWidth} · clipping horizontal **${s.clippingHorizontal}**${s.clippingCoupables && s.clippingCoupables.length ? ` (coupables : ${JSON.stringify(s.clippingCoupables)})` : ''} · scroll vertical **${s.scrollVerticalOperant}** · contrôles visibles ${s.controlesVisibles} dont hors viewport **${s.controlesHorsViewport.length}** ${s.controlesHorsViewport.length ? JSON.stringify(s.controlesHorsViewport) : ''} · cases pré-cochées **${s.casesPreCochees}** · champs texte pré-remplis **${s.champsTextePreRemplis}** · **AUCUN ENVOI**`);
    }
    if (b.acces) {
      lignes.push(`- **page Contrats joignable** : ${Object.entries(b.acces).map(([k, v]) => `\`${k}\` → ${v.statut}${v.redirection ? ' → ' + v.redirection : ''}`).join(' · ')}`);
      lignes.push(`- **CTA historiques vers la page Contrats** depuis Chauffage : ${b.ctaHistoriques.length} lien(s) — ${b.ctaHistoriques.map((a) => `« ${a.texte} » → \`${a.href}\`${a.visible ? '' : ' (masqué)'}`).join(' · ')}`);
    }
    const duTiroir = (x) => /app\.netlify\.com|permissions policy violation: (camera|microphone)/.test(x);
    const propres = b.console.filter((x) => !duTiroir(x));
    lignes.push(`- erreurs console imputables au site : ${propres.length ? propres.map((x) => `\`${x}\``).join(' · ') : '**aucune**'} _(écartées, issues du tiroir de preview Netlify : ${b.console.length - propres.length})_`);
    lignes.push('');
  }
}
lignes.push('## Empreintes des captures produites par ce script', '');
for (const c of captures) lignes.push(`- \`${c.fichier}\` — sha256 \`${c.sha256}\` — ${Math.round(c.octets / 1024)} Ko`);
writeFileSync(join(ICI, 'MESURES-PR23.md'), lignes.join('\n') + '\n');
console.log(lignes.join('\n'));
