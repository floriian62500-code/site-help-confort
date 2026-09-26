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
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

const PARTIAL = rd('partials/hc-header.html').replace(/^<!--[\s\S]*?-->\n/, '').trim();
const V_CSS = sha(rd('assets/hc-header.css')), V_JS = sha(rd('assets/hc-header.js'));
const ASSETS = `<link rel="stylesheet" href="/assets/hc-header.css?v=${V_CSS}">\n<script src="/assets/hc-header.js?v=${V_JS}" defer></script>\n`;
const FONT = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">\n';
const CRUMB_ACTU = '<nav class="hc-crumb" aria-label="Fil d’Ariane"><a href="/actualites.html">← Toutes les actualités</a></nav>';

// Pages publiques (même périmètre que scripts/seo/seo-guardrails.mjs) + 404, hors tunnel et page technique.
const SKIP_DIRS = new Set(['node_modules', '.git', '.netlify', 'dist', 'partials']);
const SKIP_FILE = /(^|\/)(admin-pro|admin|docs)\//;
const SKIP_NAME = /^(recette|google[0-9a-f]+|espace-client|espace-client-dashboard)\.html$/i;
export const EXCLUDED = ['catalogue.html', 'reset.html']; // tunnel « Ma demande » (barre propre) ; page technique noindex
function walk(dir) { let o = []; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) o = o.concat(walk(path.join(dir, e.name))); } else if (e.name.endsWith('.html')) o.push(path.join(dir, e.name)); } return o; }
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
  // Anciens styles « critiques » d'en-tête et anciens scripts d'en-tête
  h = h.replace(/(\/\*[^*]*CSS critique[^*]*\*\/\s*)?<style id="hc-critical-header">[\s\S]*?<\/style>\s*/g, '');
  h = h.replace(/<script\b(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>\s*/g, (m, attrs, js) => OLD_SCRIPTS.has(norm(js)) ? '' : m);
  // Feuille + script uniques (idempotent : on retire les anciennes références avant de reposer les nouvelles)
  h = h.replace(/<link rel="stylesheet" href="\/assets\/hc-header\.css[^"]*">\s*/g, '').replace(/<script src="\/assets\/hc-header\.js[^"]*" defer><\/script>\s*/g, '');
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
  console.log(`en-tête unique : ${pages.length} pages · ${JSON.stringify(stats)} · ${changed.length} ${CHECK ? 'à mettre à jour' : 'mises à jour'} · css v=${V_CSS} js v=${V_JS}`);
  problems.forEach(x => console.log('  ⚠', x));
  if (problems.length || (CHECK && changed.length)) process.exit(1);
}
