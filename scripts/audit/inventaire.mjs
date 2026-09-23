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
const STRICT = process.argv.includes('--strict'); // sort en erreur s'il reste un élément non classé
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

// Le registre de classement cite les chemins qu'il explique : le compter comme un usage
// ferait disparaître du rapport exactement ce qu'il doit signaler.
const NE_COMPTE_PAS = new Set(['docs/audit/inventaire-classement.json']);
function citePar(motif, exclure = () => false) {
  const out = [];
  for (const [p, s] of contenu) {
    if (NE_COMPTE_PAS.has(rel(p)) || exclure(rel(p))) continue;
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
  const echappe = nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const entrants = pagesHtml.filter(q => q !== p && new RegExp('href="[^"]*' + echappe + '"').test(contenu.get(q) || '')).length;
  // Beaucoup de liens ne sont pas écrits en dur dans une page : ils viennent d'un flux JSON
  // (liste des actualités) ou sont construits par un script (barre latérale de l'admin).
  // Les ignorer faisait passer des pages bien reliées pour orphelines.
  const dynamiques = [...contenu].filter(([q, c]) => {
    const rq = rel(q);
    if (rq === r || NE_COMPTE_PAS.has(rq) || !/\.(json|js|mjs)$/.test(rq)) return false;
    return new RegExp('["\'`/]' + echappe + '["\'`]|/' + echappe.replace(/\\\.html$/, '') + '["\'`]').test(c);
  }).length;
  const dansSitemap = sitemap.includes('/' + r + ' ');
  const redirigee = redirects.includes('/' + r) || redirects.includes('/' + r.replace(/\.html$/, ''));
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(contenu.get(p) || '');
  if (!entrants && !dynamiques && !dansSitemap && !redirigee) pagesOrphelines.push({ page: r, noindex, octets: fs.statSync(p).size });
}

// ── 4. Fonctions Supabase
const fonctions = fs.existsSync(path.join(ROOT, 'supabase/functions'))
  ? fs.readdirSync(path.join(ROOT, 'supabase/functions'), { withFileTypes: true }).filter(e => e.isDirectory() && e.name !== '_shared').map(e => e.name) : [];
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
const scriptsClassesParConvention = [];
for (const s of scripts) {
  const nom = path.basename(s), r = rel(s);
  const usages = citePar(nom, x => x === r);
  // Conventions : scripts/legacy/** est une archive assumée, scripts/tests/** est la suite de
  // contrôle (lancée à la main et dans les retours). Ni l'un ni l'autre n'a vocation à être « appelé ».
  const parConvention = r.startsWith('scripts/legacy/') ? 'archive'
    : r.startsWith('scripts/tests/') ? 'suite de contrôle' : null;
  if (!usages.length && !parConvention) scriptsSansAppel.push({ script: r, octets: fs.statSync(s).size });
  else if (!usages.length) scriptsClassesParConvention.push({ script: r, classe: parConvention });
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
// Une classe d'état (is-open, active, ok…) est posée à l'exécution : elle n'apparaît jamais
// dans le HTML statique. La chercher dans le JS de la page et des assets qu'elle charge évite
// de prendre un sélecteur composé parfaitement valide pour un sélecteur cassé.
const jsAssets = new Map([...contenu].filter(([q]) => /^assets\/.*\.js$/.test(rel(q))).map(([q, c]) => [path.basename(q), c]));
function classesDynamiques(html) {
  let js = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  for (const m of html.matchAll(/<script[^>]+src="([^"?]+\.js)/gi)) js += '\n' + (jsAssets.get(m[1].split('/').pop()) || '');
  const out = new Set();
  for (const m of js.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g))
    for (const c of m[1].matchAll(/['"`]([a-z][a-z0-9-]*)['"`]/g)) out.add(c[1]);
  for (const m of js.matchAll(/className\s*=\s*['"`]([^'"`]*)['"`]/g))
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  for (const m of js.matchAll(/class="([^"]+)"/g))
    for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  // Beaucoup de pages construisent leur HTML par concaténation (`' is-ok'`, `${x ? ' is-custom' : ''}`) :
  // tout mot cité qui a la forme d'une classe compte comme posé à l'exécution.
  for (const m of js.matchAll(/['"`]\s*([a-z][a-z0-9-]{2,})\s*['"`]/g)) out.add(m[1]);
  return out;
}
const selecteursCasses = [];
for (const p of pagesHtml) {
  const html = contenu.get(p) || '';
  const combos = combosReelles(html);
  const dyn = classesDynamiques(html);
  const casses = new Set();
  for (const st of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const m of st[1].matchAll(/\.([a-z][a-z0-9-]*)\.([a-z][a-z0-9-]*)(?=[\s,{:>.])/g)) {
      if (dyn.has(m[1]) || dyn.has(m[2])) continue; // classe posée par le JS : sélecteur légitime
      if (!combos.has(m[1] + '|' + m[2]) && !combos.has(m[2] + '|' + m[1])) casses.add('.' + m[1] + '.' + m[2]);
    }
  }
  if (casses.size) selecteursCasses.push({ page: rel(p), nb: casses.size, exemples: [...casses].slice(0, 4) });
}
selecteursCasses.sort((a, b) => b.nb - a.nb);

// ── 7. Registre de classement : un élément signalé doit être EXPLIQUÉ, jamais laissé en suspens.
const REGISTRE = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/audit/inventaire-classement.json'), 'utf8')); }
  catch (e) { return { fonctions: {}, pages: {}, images: {}, selecteurs: {}, scripts: {} }; }
})();
const nonClasse = [];
const classe = (groupe, cle, quoi) => { if (!(REGISTRE[groupe] || {})[cle]) nonClasse.push(quoi + ' : ' + cle); };
fonctionsSansAppel.forEach(x => classe('fonctions', x.fonction, 'fonction sans appelant'));
pagesOrphelines.forEach(x => classe('pages', x.page, 'page sans lien entrant'));
imagesMortes.forEach(x => classe('images', x.fichier, 'image sans référence'));
selecteursCasses.forEach(x => classe('selecteurs', x.page, 'sélecteur sans classe correspondante'));
scriptsSansAppel.forEach(x => classe('scripts', x.script, 'script sans appelant'));

const rapport = {
  resume: {
    fichiers: tous.length, pages: pagesHtml.length, assets: assets.length, images: images.length,
    fonctions: fonctions.length, scripts: scripts.length,
    assets_sans_usage: assetsMorts.length, images_sans_usage: imagesMortes.length,
    pages_orphelines: pagesOrphelines.length, fonctions_sans_appel: fonctionsSansAppel.length,
    scripts_sans_appel: scriptsSansAppel.length,
    pages_selecteurs_casses: selecteursCasses.length,
    selecteurs_casses: selecteursCasses.reduce((n, x) => n + x.nb, 0),
    scripts_classes_par_convention: scriptsClassesParConvention.length,
    non_classe: nonClasse.length
  },
  assetsMorts, imagesMortes, pagesOrphelines, fonctionsSansAppel, scriptsSansAppel, selecteursCasses
};

if (JSON_OUT) { console.log(JSON.stringify(rapport, null, 2)); process.exit(0); }

const ko = n => (n / 1024).toFixed(0) + ' ko';
console.log('\nINVENTAIRE — ' + new Date().toISOString().slice(0, 10) + '\n' + '='.repeat(60));
console.log(Object.entries(rapport.resume).map(([k, v]) => '  ' + k.padEnd(32) + v).join('\n'));
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
console.log('\nNON CLASSÉ (' + nonClasse.length + ')');
if (!nonClasse.length) {
  console.log('  — aucun : chaque élément signalé est expliqué dans docs/audit/inventaire-classement.json');
} else {
  nonClasse.forEach(x => console.log('  · ' + x));
  console.log('  → ajouter une ligne dans docs/audit/inventaire-classement.json (classe + raison).');
}

console.log('\nCe rapport est une PREUVE de départ, pas une autorisation de supprimer :');
console.log('vérifier chaque cas (chargement dynamique, planificateur, usage externe) avant toute suppression.');
console.log('Rappel appris le 23/09 : « sans appelant dans le dépôt » ne veut pas dire « mort ». Deux fonctions');
console.log('ainsi signalées sont appelées par un cron actif, et sept scripts par un LaunchAgent du Mac.\n');
if (STRICT && nonClasse.length) process.exit(1);
