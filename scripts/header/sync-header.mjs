#!/usr/bin/env node
// sync-header.mjs — applique l'EN-TÊTE UNIQUE du site à toutes les pages publiques.
//   Source : partials/hc-header.html (balisage) + assets/hc-header.css + assets/hc-header.js.
//   Usage : node scripts/header/sync-header.mjs          → écrit les pages
//           node scripts/header/sync-header.mjs --check  → n'écrit rien, sortie 1 si une page diverge
//           node scripts/header/sync-header.mjs --list   → détail page par page
// Pour chaque page : en-tête remplacé (ou posé s'il manque), rubrique active, anciens styles critiques et
// anciens scripts d'en-tête retirés, feuille + script uniques liés (version = empreinte du contenu).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK = process.argv.includes('--check'), LIST = process.argv.includes('--list');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
// Empreinte de cache : sha256 tronque a 10, la convention du site (les 197 pages de la PR #38 et
// scripts/gen-realisations.mjs). En sha1, cette synchro ramenait 204 pages sur une autre valeur.
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);

const PARTIAL = rd('partials/hc-header.html').replace(/^<!--[\s\S]*?-->\n/, '').trim();
const V_CSS = sha(rd('assets/hc-header.css')), V_JS = sha(rd('assets/hc-header.js'));
// Encart saisonnier : décision de Florian du 2026-09-28, il doit être sur TOUTES les pages.
// Il voyage donc avec l'en-tête, seul canal qui atteint toutes les pages publiques d'un coup.
const V_PCSS = sha(rd('assets/hc-promo-saison.css')), V_PJS = sha(rd('assets/hc-promo-saison.js'));
const PROMO = `<link rel="stylesheet" href="/assets/hc-promo-saison.css?v=${V_PCSS}">\n<script src="/assets/hc-promo-saison.js?v=${V_PJS}" defer></script>\n`;
const ASSETS = `<link rel="stylesheet" href="/assets/hc-header.css?v=${V_CSS}">\n<script src="/assets/hc-header.js?v=${V_JS}" defer></script>\n` + PROMO;
const sansPromo = (h) => h
  .replace(/<link rel="stylesheet" href="\/assets\/hc-promo-saison\.css[^"]*">\s*/g, '')
  .replace(/<script src="\/assets\/hc-promo-saison\.js[^"]*" defer><\/script>\s*/g, '');
/** Pose l'encart sur une page qui n'a pas l'en-tête partagé (le tunnel). Idempotent. */
export function withPromo(html) {
  const h = sansPromo(html);
  return h.replace('</head>', PROMO + '</head>');
}
const FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">\n';
const CRUMB_ACTU = '<nav class="hc-crumb" aria-label="Fil d’Ariane"><a href="/actualites.html">← Toutes les actualités</a></nav>';

// Pages publiques (même périmètre que scripts/seo/seo-guardrails.mjs) + 404, hors tunnel et page technique.
const SKIP_DIRS = new Set(['node_modules', '.git', '.netlify', 'dist', 'partials']);
// `scripts/` porte des fragments de page (corps sans <head> ni <body>), pas des pages : robots.txt
// les met deja hors perimetre (Disallow: /scripts/).
const SKIP_FILE = /(^|\/)(admin-pro|admin|docs|scripts)\//;
const SKIP_NAME = /^(recette|google[0-9a-f]+|espace-client|espace-client-dashboard)\.html$/i;
export const EXCLUDED = ['catalogue.html', 'reset.html']; // tunnel « Ma demande » (barre propre) ; page technique noindex
function walk(dir) { let o = []; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) o = o.concat(walk(path.join(dir, e.name))); } else if (e.name.endsWith('.html')) o.push(path.join(dir, e.name)); } return o; }
/* Périmètre de l'encart saisonnier (REQ-20260926-035).
   Florian : « elle doit rester systématiquement et sur toutes les pages du site ». Le tunnel de
   commande en fait partie, même s'il n'a pas l'en-tête partagé : son exclusion n'était pas une
   décision, seulement un effet de bord de la liste EXCLUDED. Seule `reset.html` reste dehors, et
   c'est prouvé, pas supposé : elle porte `noindex, nofollow` et s'intitule « Reset cache
   navigateur » — une page d'outillage, pas une page du site. */
export const PROMO_HORS_PERIMETRE = ['reset.html'];
export function promoPages() {
  // Une page exclue peut ne pas exister dans cet etat du depot (le tunnel arrive dans un lot a part) :
  // elle n'est alors pas une page a traiter, pas une erreur.
  return [...publicPages(), ...EXCLUDED.filter((p) => !PROMO_HORS_PERIMETRE.includes(p) && fs.existsSync(path.join(ROOT, p)))].sort();
}
export function publicPages() {
  return walk(ROOT).map(f => path.relative(ROOT, f).split(path.sep).join('/'))
    .filter(f => !SKIP_FILE.test(f) && !SKIP_NAME.test(path.basename(f)) && !EXCLUDED.includes(f)).sort();
}

// Rubrique active de la navigation, déduite de l'adresse de la page.
export function sectionOf(p) {
  if (p === 'index.html') return 'accueil';
  if (/^(zones-intervention|nos-villes|agence-[a-z-]+|depannage-[a-z-]+)\.html$/.test(p)) return 'zones';
  if (/^(plombier|chauffagiste|electricien|serrurier|vitrier|menuisier|travaux|volets|pmr)-[a-z-]+\.html$/.test(p)
    || /^(nos-metiers|contrats-entretien|panne-chaudiere|debouchage-canalisation|diagnostic-electrique|ouverture-porte-claquee)\.html$/.test(p)) return 'metiers';
  if (/^prestations\//.test(p) || /^(nos-prestations|devis-express|aides|maprimeadapt|garanties)\.html$/.test(p)) return 'prestations';
  if (/^(realisations|actualites)\//.test(p) || /^(realisations|realisation|actualites|blog|avant-apres|temoignages)\.html$/.test(p) || /^blog-[a-z0-9-]+\.html$/.test(p)) return 'actu';
  if (/^(a-propos|notre-equipe|carrieres|processus|faq)\.html$/.test(p)) return 'apropos';
  if (/^(pro|partenaire|fournisseur)\.html$/.test(p)) return 'pro';
  if (p === 'contact.html') return 'contact';
  return null;
}
const PAGE_URL = p => p === 'index.html' ? '/' : '/' + p;
export function headerFor(p) {
  const sec = sectionOf(p);
  let h = PARTIAL;
  if (!sec) return h;
  h = h.replace(new RegExp('class="hc-nav-link( hc-nav-trigger)?"([^>]*?) data-section="' + sec + '"'), (m, t, mid) => 'class="hc-nav-link' + (t || '') + ' is-active"' + mid + ' data-section="' + sec + '"');
  const url = PAGE_URL(p);
  return h.replace('<a href="' + url + '" class="hc-nav-link is-active"', '<a href="' + url + '" class="hc-nav-link is-active" aria-current="page"');
}

// Anciens scripts d'en-tête copiés dans les pages (empreintes relevées le 18/09/2026) : remplacés par assets/hc-header.js.
const OLD_SCRIPTS = new Set(['b0b087fd', '8cbe7460', '991ed899', '02163179', '2c7110ed']);
const norm = js => crypto.createHash('sha1').update(js.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 8);

export function transform(p, src) {
  let h = src, mode;
  const hdr = headerFor(p);
  const std = /<header\b[^>]*\bclass="hc-header"[^>]*>[\s\S]*?<\/header>/;
  const bodyAt = h.search(/<body\b[^>]*>/);
  const anyHeader = /<header\b[^>]*>[\s\S]*?<\/header>/;
  const am = h.match(anyHeader);
  const nearTop = am && bodyAt >= 0 && am.index > bodyAt && h.slice(bodyAt, am.index).replace(/<!--[\s\S]*?-->|<a[^>]*hc-skip-link[\s\S]*?<\/a>|<(style|script|noscript)\b[\s\S]*?<\/\1>|<span[^>]*id="main-content"[^>]*><\/span>|\s+/g, '').replace(/<body\b[^>]*>/, '') === '';
  if (std.test(h)) { h = h.replace(std, () => hdr); mode = 'standard'; }
  else if (nearTop) { h = h.replace(anyHeader, () => hdr); mode = 'variante'; }
  else if (/<nav class="actu-nav">[\s\S]*?<\/nav>/.test(h)) { h = h.replace(/<nav class="actu-nav">[\s\S]*?<\/nav>/, () => hdr + '\n' + CRUMB_ACTU); mode = 'actualite'; }
  else {
    const skip = h.match(/<body\b[^>]*>\s*(<a[^>]*hc-skip-link[\s\S]*?<\/a>)?/);
    if (!skip) throw new Error(p + ' : <body> introuvable');
    h = h.slice(0, skip.index + skip[0].length) + '\n' + hdr + '\n' + h.slice(skip.index + skip[0].length);
    mode = 'ajout';
  }
  // Bandeau orange legacy `.hc-topbar` (Saint-Omer · Dépan'Audo · Dunkerque · horaires) : retiré du
// site le 2026-09-14, revenu avec les pages non synchronisées, masqué en urgence par la feuille
// d'en-tête (PR #45). On retire le balisage ET ses règles mortes à chaque synchronisation, pour
// qu'une génération future ne puisse pas le ramener. Le masque CSS reste, en seconde barrière.
function sansTopbarLegacy(h) {
  // 1. le bloc <div class="hc-topbar" ...> ... </div>, par comptage d'imbrication
  for (;;) {
    const i = h.search(/<div\s+[^>]*class="[^"]*\bhc-topbar\b[^"]*"/);
    if (i < 0) break;
    let j = h.indexOf('>', i);
    if (j < 0) break;
    let prof = 1, k = j + 1;
    while (k < h.length && prof > 0) {
      const o = h.indexOf('<div', k), f = h.indexOf('</div>', k);
      if (f < 0) break;
      if (o >= 0 && o < f) { prof++; k = o + 4; } else { prof--; k = f + 6; }
    }
    if (prof !== 0) break;            // balisage non équilibré : on ne touche à rien
    h = h.slice(0, i) + h.slice(k);
  }
  // 2. ses règles, devenues mortes. Un <style> qui ne contenait que ça disparaît.
  h = h.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g, (bloc, attrs, css) => {
    if (!/\.hc-topbar\b/.test(css)) return bloc;
    const net = css.replace(/\.hc-topbar[^{};]*\{[^}]*\}/g, '')
                   .replace(/\(max-width:\s*\d+px\)\s*\{\s*\}/g, '');
    return net.trim() ? `<style${attrs}>${net}</style>` : '';
  });
  return h;
}

  // Anciens styles « critiques » d'en-tête et anciens scripts d'en-tête
  h = h.replace(/(\/\*[^*]*CSS critique[^*]*\*\/\s*)?<style id="hc-critical-header">[\s\S]*?<\/style>\s*/g, '');
  h = h.replace(/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>\s*/g, (m, attrs, js) => OLD_SCRIPTS.has(norm(js)) ? '' : m);
  h = sansTopbarLegacy(h);
  // Feuille + script uniques (idempotent : on retire les anciennes références avant de reposer les nouvelles)
  h = h.replace(/<link rel="stylesheet" href="\/assets\/hc-header\.css[^"]*">\s*/g, '').replace(/<script src="\/assets\/hc-header\.js[^"]*" defer><\/script>\s*/g, '');
  h = sansPromo(h);
  const head = h.slice(0, h.indexOf('</head>'));
  const needFont = !/fonts\.googleapis\.com\/css2\?[^"']*family=Inter[:&"']/.test(head);
  h = h.replace('</head>', (needFont ? FONT : '') + ASSETS + '</head>');
  return { html: h, mode, font: needFont };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const pages = publicPages(), stats = {}, changed = [], problems = [];
  for (const p of pages) {
    const src = rd(p);
    let r;
    try { r = transform(p, src); } catch (e) { problems.push(e.message); continue; }
    stats[r.mode] = (stats[r.mode] || 0) + 1;
    const left = [...r.html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].filter(m => /hc-burger|hc-megamenu|hcHeader|hc-nav-mobile/.test(m[1]) && !/ld\+json/.test(m[0])).length;
    if (left) problems.push(p + ' : ' + left + ' script(s) inline mentionnent encore l’en-tête');
    if ((r.html.match(/<header class="hc-header" id="hcHeader">/g) || []).length !== 1) problems.push(p + ' : en-tête absent ou en double');
    if (r.html !== src) { changed.push(p); if (!CHECK) fs.writeFileSync(path.join(ROOT, p), r.html); }
    if (LIST) console.log(p.padEnd(70), r.mode.padEnd(10), (sectionOf(p) || '—').padEnd(12), r.font ? '+Inter' : '', r.html !== src ? 'modifiée' : 'à jour');
  }
  // L'encart saisonnier va plus loin que l'en-tête : il couvre aussi le tunnel de commande.
  const horsEntete = promoPages().filter((p) => !pages.includes(p));
  for (const p of horsEntete) {
    const src = rd(p), neuf = withPromo(src);
    if (neuf !== src) { changed.push(p); if (!CHECK) fs.writeFileSync(path.join(ROOT, p), neuf); }
  }
  const sansEncart = promoPages().filter((p) => !/\/assets\/hc-promo-saison\.js/.test(CHECK ? rd(p) : rd(p)));
  if (!CHECK && sansEncart.length) problems.push('encart absent de : ' + sansEncart.join(', '));
  console.log(`en-tête unique : ${pages.length} pages · ${JSON.stringify(stats)} · ${changed.length} ${CHECK ? 'à mettre à jour' : 'mises à jour'} · css v=${V_CSS} js v=${V_JS}`);
  console.log(`encart saisonnier : ${promoPages().length} pages (dont ${horsEntete.length} hors en-tête) · hors périmètre : ${PROMO_HORS_PERIMETRE.join(', ')}`);
  problems.forEach(x => console.log('  ⚠', x));
  if (problems.length || (CHECK && changed.length)) process.exit(1);
}
