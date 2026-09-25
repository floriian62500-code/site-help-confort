#!/usr/bin/env node
/**
 * Rétablit les sélecteurs descendants perdus par une ancienne minification (« .a .b » → « .a.b »).
 *
 *   node scripts/seo/fix-compound-selectors.mjs            # corrige
 *   node scripts/seo/fix-compound-selectors.mjs --check    # sortie 1 s'il reste des cas (QA)
 *   node scripts/seo/fix-compound-selectors.mjs --list     # détaille sans rien écrire
 *
 * PREUVE exigée avant de toucher à un sélecteur `.a.b` — les deux conditions :
 *   1. aucun élément de la page ne porte les deux classes dans son attribut class ;
 *   2. aucune des deux classes n'est posée dynamiquement (classList.add/remove/toggle/contains,
 *      className = "…", setAttribute('class', …)) dans les scripts de la page ni dans les assets
 *      qu'elle charge, et aucune n'a la forme d'un état (is-*, has-*, js-*, active, open…).
 * Sinon on n'y touche pas : une combinaison réelle (`class="row two"`) ou un état JS
 * (`.modal.is-open`) doit rester un sélecteur composé.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK = process.argv.includes('--check');
const LIST = process.argv.includes('--list');
const IGNORE = new Set(['node_modules', '.git', '.netlify', 'dist']);
const ETAT = /^(is-|has-|js-|no-|in-|on-)|^(active|open|opened|closed|show|shown|hidden|visible|current|selected|checked|error|success|loading|sticky|fixed|scrolled|expanded|collapsed|disabled|dragging|touch|mobile|desktop)$/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (p.endsWith('.html')) out.push(p);
  }
  return out;
}

// Classes posées par du JS : on les relève une fois pour tous les assets, puis par page.
const classesJsDe = src => {
  const s = new Set();
  for (const m of src.matchAll(/classList\s*\.\s*(?:add|remove|toggle|contains|replace)\s*\(([^)]*)\)/g))
    for (const c of m[1].matchAll(/['"`]([A-Za-z0-9_-]+)['"`]/g)) s.add(c[1]);
  for (const m of src.matchAll(/className\s*=\s*['"`]([^'"`]*)['"`]/g))
    m[1].split(/\s+/).filter(Boolean).forEach(c => s.add(c));
  for (const m of src.matchAll(/setAttribute\(\s*['"`]class['"`]\s*,\s*['"`]([^'"`]*)['"`]/g))
    m[1].split(/\s+/).filter(Boolean).forEach(c => s.add(c));
  // classes écrites dans des gabarits JS (innerHTML) : elles existent bien au runtime
  for (const m of src.matchAll(/class=\\?["']([^"'\\]+)/g))
    m[1].split(/\s+/).filter(Boolean).forEach(c => s.add(c));
  return s;
};
const cacheAsset = new Map();
function classesAsset(rel) {
  if (cacheAsset.has(rel)) return cacheAsset.get(rel);
  const p = path.join(ROOT, rel.replace(/^\//, '').split('?')[0]);
  const s = fs.existsSync(p) ? classesJsDe(fs.readFileSync(p, 'utf8')) : new Set();
  cacheAsset.set(rel, s);
  return s;
}

function analyse(html) {
  // 1. combinaisons réellement portées par un élément
  const combos = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    const cl = m[1].split(/\s+/).filter(Boolean);
    for (const a of cl) for (const b of cl) if (a !== b) combos.add(a + '|' + b);
  }
  // 2. classes dynamiques : scripts inline + assets chargés par la page
  const dyn = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))
    classesJsDe(m[1]).forEach(c => dyn.add(c));
  for (const m of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g))
    if (/^[./]/.test(m[1]) || m[1].startsWith('/assets/')) classesAsset(m[1]).forEach(c => dyn.add(c));
  return { combos, dyn };
}

const fichiers = walk(ROOT);
let pages = 0, total = 0;
const details = [];
for (const p of fichiers) {
  const html = fs.readFileSync(p, 'utf8');
  if (!html.includes('<style')) continue;
  const { combos, dyn } = analyse(html);
  // Éléments balise+classe réellement présents (pour les cas « a:hover.ic »)
  const balClasse = new Set();
  for (const m of html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*class="([^"]+)"/g))
    m[2].split(/\s+/).filter(Boolean).forEach(c => balClasse.add(m[1] + '|' + c));
  const faits = [];
  let out = '', pos = 0;
  for (const st of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const css = st[1];
    // On traite chaque jonction « .a.b » isolément ; une chaîne « .a.b.c » demande plusieurs
    // passes (le lookahead consomme la jonction suivante), d'où la boucle ci-dessous.
    let css2 = css, avant;
    do { avant = css2; css2 = css2.replace(/\.([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)(?=[\s,{:>.\[])/g, (m, a, b) => {
      if (combos.has(a + '|' + b) || combos.has(b + '|' + a)) return m;   // combinaison réelle
      if (dyn.has(a) || dyn.has(b)) return m;                             // classe posée par JS
      if (ETAT.test(a) || ETAT.test(b)) return m;                         // nom d'état
      faits.push('.' + a + '.' + b);
      return '.' + a + ' .' + b;
    });
    // Même défaut après une pseudo-classe : « a:hover.ic » au lieu de « a:hover .ic »
    css2 = css2.replace(/(\.?)([a-z][a-z0-9-]*)(:[a-z-]+(?:\([^)]*\))?)\.([a-z][a-z0-9-]*)(?=[\s,{:>.\[])/g, (m, point, base, pseudo, cls) => {
      // « a:hover.ic » (balise) ou « .drop:hover.nav-dropdown » (classe) : preuve adaptée au cas
      const reel = point ? (combos.has(base + '|' + cls) || combos.has(cls + '|' + base)) : balClasse.has(base + '|' + cls);
      if (reel) return m;
      if (dyn.has(cls) || ETAT.test(cls) || (point && dyn.has(base))) return m;
      faits.push(point + base + pseudo + '.' + cls);
      return point + base + pseudo + ' .' + cls;
    });
    } while (css2 !== avant);
    out += html.slice(pos, st.index) + st[0].replace(css, css2);
    pos = st.index + st[0].length;
  }
  if (!faits.length) continue;
  out += html.slice(pos);
  pages++; total += faits.length;
  details.push({ page: path.relative(ROOT, p), nb: faits.length, exemples: [...new Set(faits)].slice(0, 5) });
  if (!CHECK && !LIST) fs.writeFileSync(p, out);
}

details.sort((a, b) => b.nb - a.nb);
if (LIST || CHECK) details.slice(0, 40).forEach(d => console.log('  ' + d.page.padEnd(52) + String(d.nb).padStart(4) + '  ex. ' + d.exemples.join(' ')));
console.log(total
  ? (CHECK || LIST ? '❌ ' + total + ' sélecteur(s) cassé(s) sur ' + pages + ' page(s)' : '✅ ' + total + ' sélecteur(s) rétabli(s) sur ' + pages + ' page(s)')
  : '✅ aucun sélecteur descendant cassé');
process.exit((CHECK && total) ? 1 : 0);
