#!/usr/bin/env node
/**
 * Inventaire du dépôt : la PREUVE avant toute suppression (assainissement, directive 5732805778).
 *
 *   node scripts/audit/inventaire.mjs            # rapport lisible
 *   node scripts/audit/inventaire.mjs --json     # rapport machine
 *
 * Règle : « ne jamais supprimer un fichier probablement mort sans prouver 0 usage
 * runtime/build/test ». Ce script compte les usages réels ; il ne supprime rien.
 *
 * Ce qu'il mesure :
 *   1. assets (js/css) : pages qui les chargent, scripts qui les référencent ;
 *   2. images : pages/CSS/JS qui les citent ;
 *   3. pages HTML : liens entrants, présence au sitemap, redirections ;
 *   4. fonctions Supabase : appels depuis le site, les scripts, les autres fonctions ;
 *   5. scripts : ceux cités par package.json, la CI, la doc ou d'autres scripts ;
 *   6. sélecteurs CSS cassés par l'ancienne minification (« .a.b » alors qu'aucun élément
 *      ne porte les deux classes) : défaut visuel réel, page par page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const JSON_OUT = process.argv.includes('--json');
const IGNORE = new Set(['node_modules', '.git', '.netlify', 'dist', '.cache']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const tous = walk(ROOT);
const rel = p => path.relative(ROOT, p);
const lire = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; } };
const TEXTE = new Set(['.html', '.js', '.mjs', '.cjs', '.css', '.json', '.md', '.ts', '.py', '.sh', '.toml', '.yml', '.yaml', '.txt', '']);
const textes = tous.filter(p => TEXTE.has(path.extname(p)));
const contenu = new Map(textes.map(p => [p, lire(p)]));
const pagesHtml = tous.filter(p => p.endsWith('.html') && !rel(p).startsWith('partials/'));

function citePar(motif, exclure = () => false) {
  const out = [];
  for (const [p, s] of contenu) {
    if (exclure(rel(p))) continue;
    if (s.includes(motif)) out.push(rel(p));
  }
  return out;
}

// ── 1. Assets
const assets = tous.filter(p => rel(p).startsWith('assets/') && /\.(js|css)$/.test(p));
const assetsMorts = [];
for (const a of assets) {
  const nom = path.basename(a);
  const usages = citePar(nom, r => r === rel(a));
  if (!usages.length) assetsMorts.push({ fichier: rel(a), octets: fs.statSync(a).size });
}

// ── 2. Images
const images = tous.filter(p => /\.(png|jpe?g|webp|avif|svg|gif|mp4|webm)$/i.test(p) && !rel(p).startsWith('node_modules'));
const imagesMortes = [];
for (const i of images) {
  const nom = path.basename(i);
  const usages = citePar(nom, r => r === rel(i));
  if (!usages.length) imagesMortes.push({ fichier: rel(i), octets: fs.statSync(i).size });
}

// ── 3. Pages HTML : liens entrants et sitemap
const sitemap = lire(path.join(ROOT, 'supabase/functions/sitemap/index.ts'));
const redirects = lire(path.join(ROOT, '_redirects'));
const pagesOrphelines = [];
for (const p of pagesHtml) {
  const r = rel(p), nom = path.basename(p);
  const entrants = pagesHtml.filter(q => q !== p && new RegExp('href="[^"]*' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"').test(contenu.get(q) || '')).length;
  const dansSitemap = sitemap.includes('/' + r + ' ');
  const redirigee = redirects.includes('/' + r) || redirects.includes('/' + r.replace(/\.html$/, ''));
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(contenu.get(p) || '');
  if (!entrants && !dansSitemap && !redirigee) pagesOrphelines.push({ page: r, noindex, octets: fs.statSync(p).size });
}

// ── 4. Fonctions Supabase
const fonctions = fs.existsSync(path.join(ROOT, 'supabase/functions'))
  ? fs.readdirSync(path.join(ROOT, 'supabase/functions'), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name) : [];
const fonctionsSansAppel = [];
for (const f of fonctions) {
  const usages = citePar('functions/v1/' + f, r => r.startsWith('supabase/functions/' + f + '/'))
    .concat(citePar("'" + f + "'", r => r.startsWith('supabase/functions/' + f + '/') || r.startsWith('docs/')));
  const cron = /pg_cron|cron\.schedule/.test(contenu.get(path.join(ROOT, 'supabase/functions', f, 'index.ts')) || '');
  if (!usages.length) fonctionsSansAppel.push({ fonction: f, cron });
}

// ── 5. Scripts
const scripts = tous.filter(p => rel(p).startsWith('scripts/') && /\.(mjs|js|py|sh)$/.test(p));
const scriptsSansAppel = [];
for (const s of scripts) {
  const nom = path.basename(s), r = rel(s);
  const usages = citePar(nom, x => x === r);
  if (!usages.length) scriptsSansAppel.push({ script: r, octets: fs.statSync(s).size });
}

// ── 6. Sélecteurs cassés par l'ancienne minification
function combosReelles(html) {
  const c = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    const cl = m[1].split(/\s+/).filter(Boolean);
    for (const a of cl) for (const b of cl) if (a !== b) c.add(a + '|' + b);
  }
  return c;
}
const selecteursCasses = [];
for (const p of pagesHtml) {
  const html = contenu.get(p) || '';
  const combos = combosReelles(html);
  const casses = new Set();
  for (const st of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const m of st[1].matchAll(/\.([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)(?=[\s,{:>.])/g)) {
      if (!combos.has(m[1] + '|' + m[2]) && !combos.has(m[2] + '|' + m[1])) casses.add('.' + m[1] + '.' + m[2]);
    }
  }
  if (casses.size) selecteursCasses.push({ page: rel(p), nb: casses.size, exemples: [...casses].slice(0, 4) });
}
selecteursCasses.sort((a, b) => b.nb - a.nb);

const rapport = {
  resume: {
    fichiers: tous.length, pages: pagesHtml.length, assets: assets.length, images: images.length,
    fonctions: fonctions.length, scripts: scripts.length,
    assets_sans_usage: assetsMorts.length, images_sans_usage: imagesMortes.length,
    pages_orphelines: pagesOrphelines.length, fonctions_sans_appel: fonctionsSansAppel.length,
    scripts_sans_appel: scriptsSansAppel.length,
    pages_selecteurs_casses: selecteursCasses.length,
    selecteurs_casses: selecteursCasses.reduce((n, x) => n + x.nb, 0)
  },
  assetsMorts, imagesMortes, pagesOrphelines, fonctionsSansAppel, scriptsSansAppel, selecteursCasses
};

if (JSON_OUT) { console.log(JSON.stringify(rapport, null, 2)); process.exit(0); }

const ko = n => (n / 1024).toFixed(0) + ' ko';
console.log('\nINVENTAIRE — ' + new Date().toISOString().slice(0, 10) + '\n' + '='.repeat(60));
console.log(Object.entries(rapport.resume).map(([k, v]) => '  ' + k.padEnd(26) + v).join('\n'));
const bloc = (titre, liste, fmt) => {
  console.log('\n' + titre + ' (' + liste.length + ')');
  if (!liste.length) return console.log('  — aucun');
  liste.slice(0, 30).forEach(x => console.log('  · ' + fmt(x)));
  if (liste.length > 30) console.log('  … ' + (liste.length - 30) + ' de plus');
};
bloc('ASSETS sans aucune référence', assetsMorts, x => x.fichier + '  (' + ko(x.octets) + ')');
bloc('IMAGES sans aucune référence', imagesMortes, x => x.fichier + '  (' + ko(x.octets) + ')');
bloc('PAGES sans lien entrant, hors sitemap, sans redirection', pagesOrphelines, x => x.page + (x.noindex ? '  [noindex]' : '') + '  (' + ko(x.octets) + ')');
bloc('FONCTIONS Supabase sans appel trouvé', fonctionsSansAppel, x => x.fonction + (x.cron ? '  [cron ?]' : ''));
bloc('SCRIPTS jamais cités ailleurs', scriptsSansAppel, x => x.script + '  (' + ko(x.octets) + ')');
bloc('PAGES aux sélecteurs cassés (minification)', selecteursCasses, x => x.page.padEnd(48) + x.nb + '  ex. ' + x.exemples.join(' '));
console.log('\nCe rapport est une PREUVE de départ, pas une autorisation de supprimer :');
console.log('vérifier chaque cas (chargement dynamique, cron, usage externe) avant toute suppression.\n');
