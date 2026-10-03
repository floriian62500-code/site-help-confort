#!/usr/bin/env node
// En-tête unique du site (directive 5718214970) : toutes les pages publiques portent EXACTEMENT l'en-tête de
// référence (partials/hc-header.html, dérivé de l'accueil), stylé et animé par les seuls assets/hc-header.{css,js}.
// Usage : node scripts/tests/header.test.mjs — sortie 1 au moindre écart.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicPages, transform, headerFor, sectionOf, EXCLUDED } from '../header/sync-header.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

const pages = publicPages();
const css = rd('assets/hc-header.css'), js = rd('assets/hc-header.js'), partial = rd('partials/hc-header.html');
ok('périmètre : toutes les pages publiques (≥ 190), tunnel et page technique exclus', pages.length >= 190 && EXCLUDED.every(x => !pages.includes(x)), pages.length + ' pages');

// 1. Chaque page est exactement à jour (même en-tête, mêmes assets, plus aucune ancienne variante)
const drift = pages.filter(p => { const s = rd(p); return transform(p, s).html !== s; });
ok('chaque page porte l’en-tête unique à jour (générateur idempotent)', drift.length === 0, drift.slice(0, 5).join(', '));
const bad = [];
for (const p of pages) {
  const s = rd(p);
  const n = (s.match(/<header class="hc-header" id="hcHeader">/g) || []).length;
  if (n !== 1) bad.push(p + ' : ' + n + ' en-têtes');
  if (!s.includes(headerFor(p))) bad.push(p + ' : en-tête différent de la référence');
  if (/<style id="hc-critical-header">/.test(s)) bad.push(p + ' : ancien style critique');
  if (!/<link rel="stylesheet" href="\/assets\/hc-header\.css\?v=[0-9a-f]{10}">/.test(s) || !/<script src="\/assets\/hc-header\.js\?v=[0-9a-f]{10}" defer><\/script>/.test(s)) bad.push(p + ' : assets absents');
  if ((s.match(/assets\/hc-header\.(css|js)/g) || []).length !== 2) bad.push(p + ' : assets en double');
  if ([...s.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].some(m => /hc-burger|hc-megamenu|hcHeader|hc-nav-mobile/.test(m[1]))) bad.push(p + ' : ancien script d’en-tête');
}
ok('une seule balise d’en-tête par page, identique à la référence, assets uniques, aucun ancien style ni script', bad.length === 0, bad.slice(0, 6).join(' | '));

// 2. L'accueil est la référence
const home = rd('index.html');
ok('référence = accueil : même balisage que le partiel, rubrique Accueil active', home.includes(headerFor('index.html')) && /class="hc-nav-link is-active" aria-current="page" data-section="accueil"/.test(home));
ok('partiel : logo aux vraies proportions (carré), liens absolus valables dans les sous-dossiers', /width="140" height="140"/.test(partial) && !/href="(?!\/|https?:|tel:|mailto:|#)/.test(partial.replace(/^<!--[\s\S]*?-->/, '')));
ok('partiel : menu mobile = mêmes métiers que le méga-menu (Menuiserie, Contrats d’entretien)', (partial.match(/menuisier-saint-omer\.html/g) || []).length === 2 && (partial.match(/contrats-entretien\.html/g) || []).length === 2);

// 3. Rubrique active (pages demandées par la directive)
const expect = { 'index.html': 'accueil', 'zones-intervention.html': 'zones', 'plombier-saint-omer.html': 'metiers', 'prestations/chauffe-eau.html': 'prestations', 'contact.html': 'contact', 'a-propos.html': 'apropos', 'pro.html': 'pro', 'realisations.html': 'actu' };
ok('rubrique active : accueil, zones, métier, prestation, contact, à propos, espace pro, réalisations', Object.entries(expect).every(([p, s]) => sectionOf(p) === s && new RegExp('is-active"[^>]*data-section="' + s + '"').test(rd(p))));
ok('une seule rubrique active au plus par page', pages.every(p => ((rd(p).match(/<header class="hc-header" id="hcHeader">[\s\S]*?<\/header>/) || [''])[0].match(/class="hc-nav-link[^"]*is-active"/g) || []).length <= 1));

// 4. Styles : tout est confiné à l'en-tête (aucune règle ne fuit sur le reste des pages)
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]+\{/g, '').split('}').map(r => r.split('{')[0].trim()).filter(Boolean);
const leaks = rules.flatMap(r => r.split(',')).map(s => s.trim()).filter(s => s && !/^#hcHeader\b/.test(s) && !/^\.hc-crumb\b/.test(s) && !/^\.hc-skip-link\b/.test(s) && !/^html\.hc-menu-open\b/.test(s));
ok('styles : chaque sélecteur est préfixé #hcHeader (hors fil d’Ariane, lien d’évitement et verrou de défilement)', leaks.length === 0, leaks.slice(0, 5).join(' | '));
ok('gabarit : référence 1440 = barre 165 / logo 140, réduite 111 / 90 ; burger sous 1280 ; mobile compact', /#hcHeader\{--hch-row:165px;--hch-row-s:111px;--hch-logo:140px;--hch-logo-s:90px/.test(css) && /@media \(min-width:1280px\)\{#hcHeader \.hc-nav\{display:flex\}\}/.test(css) && /@media \(max-width:768px\)\{#hcHeader\{--hch-row:95px/.test(css));
ok('défilement sans déplacement du contenu : boîte collante de hauteur constante, seule la barre se réduit', /#hcHeader\.hc-header\{position:sticky;[^}]*height:var\(--hch-row\)/.test(css) && /#hcHeader\.is-scrolled \.hc-header-row\{height:var\(--hch-row-s\)/.test(css) && !/#hcHeader\.is-scrolled\.hc-header\{[^}]*height/.test(css));
ok('menu mobile : panneau positionné sous la barre (plus de 72 px codés en dur), pas de filtre sur la boîte collante', /top:var\(--hch-panel-top,95px\)/.test(css) && /#hcHeader\.hc-header\{[^}]*backdrop-filter:none/.test(css));

// 5. Comportements : un seul script, jamais initialisé deux fois
ok('script : initialisation unique, menu mobile accessible (aria-expanded, Échap, fermeture au clic)', /if \(window\.__hcHeaderInit\) return;/.test(js) && /setAttribute\('aria-expanded', open \? 'true' : 'false'\)/.test(js) && /e\.key !== 'Escape'/.test(js));
ok('tailles en px (indépendantes de la taille de police de chaque page), aucune unité rem', !/[0-9.]+rem\b/.test(css));
ok('tunnel « Ma demande » : garde sa propre barre (pas d’en-tête du site)', !/id="hcHeader"/.test(rd('catalogue.html')));

console.log(`\nRÉSULTAT EN-TÊTE UNIQUE : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
