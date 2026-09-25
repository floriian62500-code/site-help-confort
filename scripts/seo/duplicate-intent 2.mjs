#!/usr/bin/env node
/**
 * Détection de doublons d'intention (5744476570).
 *
 * Avant toute création de page marketing ou métier : SEARCH_EXISTING → IDENTIFY_CANONICAL →
 * REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE. Ce script matérialise le contrôle :
 *   - il compare slugs, <title> et <h1> de toutes les pages publiques ;
 *   - il signale les paires trop proches qui ne sont pas justifiées dans docs/seo/pages-canoniques.json ;
 *   - il vérifie que chaque page canonique déclarée existe, porte son propre <link rel="canonical">,
 *     figure dans le sitemap, et qu'aucune page ne pointe encore vers un doublon redirigé.
 *
 * Usage :
 *   node scripts/seo/duplicate-intent.mjs              # contrôle complet (sortie 1 si non justifié)
 *   node scripts/seo/duplicate-intent.mjs --page <f>   # ce que devrait faire Claude AVANT de créer <f>
 *   node scripts/seo/duplicate-intent.mjs --intent "entretien poele granules"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/seo/pages-canoniques.json'), 'utf8'));
const SEUIL = 0.62; // similarité au-delà de laquelle deux pages visent la même intention

// Mots qui ne portent pas l'intention : marque, zone, liaisons, mots creux
const STOP = new Set(('help confort depan audo saint omer dunkerque calais boulogne mer cote opale nord pas de la le les des du au aux et ou a en par pour votre vos notre nos un une sur avec sans chez tout toute obligatoire html index page site accueil service services prix tarif tarifs devis gratuit rapide urgence 24h 7j pro professionnel artisan entreprise sarl 62500 59140')
  .split(' ').filter(Boolean));
const VILLES = new Set(('saint-omer longuenesse arques saint-martin-lez-tatinghem dunkerque saint-pol-sur-mer bergues gravelines calais coquelles sangatte boulogne-sur-mer aire-sur-la-lys hazebrouck bethune wizernes lumbres blendecques bray-dunes wormhout coudekerque-branche grande-synthe')
  .split(' ').filter(Boolean));

const norm = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

function tokens(s) {
  return new Set(norm(s).split(' ').filter(w => w.length > 2 && !STOP.has(w) && !VILLES.has(w)));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

function pagesHtml(dir = ROOT, out = [], base = '') {
  const skip = new Set(['node_modules', '.git', 'scripts', 'supabase', 'docs', 'admin-pro', 'images', 'assets', 'partials', 'og', 'fonts']);
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || skip.has(e.name)) continue;
    const p = path.join(dir, e.name), rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) pagesHtml(p, out, rel);
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const txt = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
function lire(rel) {
  const s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const title = (s.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1];
  const h1 = (s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ''])[1];
  const canon = (s.match(/<link rel="canonical" href="([^"]+)"/i) || [, ''])[1];
  const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(s);
  const slug = rel.replace(/\.html$/, '').replace(/\/index$/, '');
  return { rel, url: '/' + rel, slug, title: txt(title), h1: txt(h1), canon, noindex, html: s };
}

const familleLocale = slug => (REG.familles_locales || []).find(f => slug.startsWith(f.prefixe.replace(/\/$/, '/')) || slug.startsWith(f.prefixe));
const memeFamille = (a, b) => {
  const fa = familleLocale(a.slug), fb = familleLocale(b.slug);
  return !!fa && !!fb && fa.prefixe === fb.prefixe;
};
const paireAutorisee = (a, b) => (REG.paires_autorisees || []).some(([x, y]) => (x === a.url && y === b.url) || (x === b.url && y === a.url));
const lieesDeclarees = (a, b) => (REG.intentions || []).some(it => {
  const urls = [it.canonique, ...(it.pages_liees || []).map(p => p.url)];
  return urls.includes(a.url) && urls.includes(b.url);
});

function signature(p) {
  const t = tokens(p.slug.replace(/[/-]/g, ' '));
  for (const w of tokens(p.title)) t.add(w);
  for (const w of tokens(p.h1)) t.add(w);
  return t;
}

const args = process.argv.slice(2);
const pages = pagesHtml().filter(f => !/^(404|merci|test|demo)/.test(f)).map(lire).filter(p => !p.noindex);
const sig = new Map(pages.map(p => [p.url, signature(p)]));

// ── Mode aide à la décision : « est-ce qu'une page couvre déjà ce besoin ? »
if (args[0] === '--page' || args[0] === '--intent') {
  const cible = args[0] === '--page' ? signature(lire(args[1])) : tokens(args.slice(1).join(' '));
  const proches = pages.map(p => ({ p, s: jaccard(cible, sig.get(p.url)) })).filter(x => x.s > 0.15)
    .sort((a, b) => b.s - a.s).slice(0, 10);
  console.log('Pages existantes les plus proches de cette intention :\n');
  for (const { p, s } of proches) console.log('  ' + (s * 100).toFixed(0).padStart(3) + ' %  ' + p.url + '  — ' + p.title.slice(0, 70));
  console.log('\nRÈGLE : ' + REG.regle + '\n→ Étendre la page la plus proche, sauf intention réellement distincte (à justifier dans docs/seo/pages-canoniques.json).');
  process.exit(0);
}

let erreurs = 0, avertis = 0;
const err = m => { erreurs++; console.log('  ❌ ' + m); };
const warn = m => { avertis++; console.log('  ⚠️  ' + m); };
const ok = m => console.log('  ✅ ' + m);

// Familles générées : mêmes publications rendues par deux générateurs (doublon connu, documenté)
const GENEREE = /^(actualites|realisations|blog)\//;
const connu = (a, b) => (REG.doublons_connus || []).some(d => {
  const [x, y] = d.paire.map(u => new RegExp('^' + u.replace(/<[a-z]+>/g, '[^/]+').replace(/\./g, '\\.') + '$'));
  return (x.test(a.url) && y.test(b.url)) || (x.test(b.url) && y.test(a.url));
});

// ── 1. Doublons d'intention
console.log('\n1. Doublons d’intention (slug + titre + H1, seuil ' + SEUIL + ')');
const suspects = [];
for (let i = 0; i < pages.length; i++) {
  for (let j = i + 1; j < pages.length; j++) {
    const a = pages[i], b = pages[j];
    const s = jaccard(sig.get(a.url), sig.get(b.url));
    if (s < SEUIL) continue;
    if (memeFamille(a, b) || paireAutorisee(a, b) || lieesDeclarees(a, b)) continue;
    // Non bloquant : doublon déjà documenté, ou deux pages locales de familles différentes
    // (métier × ville, structure historique du site) → avertissement, pas blocage.
    const ecart = connu(a, b) || GENEREE.test(a.slug) || GENEREE.test(b.slug) ||
                  (!!familleLocale(a.slug) && !!familleLocale(b.slug));
    suspects.push({ a, b, s, bloquant: !ecart });
  }
}
const bloquants = suspects.filter(x => x.bloquant);
if (!bloquants.length) ok('aucune paire NOUVELLE non justifiée sur ' + pages.length + ' pages');
for (const { a, b, s, bloquant } of suspects.sort((x, y) => y.s - x.s)) {
  const msg = 'intentions proches (' + (s * 100).toFixed(0) + ' %) : ' + a.url + '  ↔  ' + b.url +
      '\n       « ' + a.title.slice(0, 64) + ' »\n       « ' + b.title.slice(0, 64) + ' »';
  if (bloquant) err(msg + '\n       → fusionner dans la page canonique, ou justifier la paire dans docs/seo/pages-canoniques.json');
  else warn(msg + '\n       → doublon hérité, documenté dans docs/seo/pages-canoniques.json (à traiter dans l’assainissement)');
}

// ── 2. Pages canoniques déclarées : existence, canonical, sitemap
console.log('\n2. Pages canoniques déclarées');
const sitemap = fs.readFileSync(path.join(ROOT, 'supabase/functions/sitemap/index.ts'), 'utf8');
for (const it of REG.intentions || []) {
  const rel = it.canonique.replace(/^\//, '');
  if (!fs.existsSync(path.join(ROOT, rel))) { err('page canonique absente : ' + it.canonique); continue; }
  const p = lire(rel);
  if (!p.canon.endsWith(it.canonique)) err('canonical non auto-référent sur ' + it.canonique + ' (' + (p.canon || 'absent') + ')');
  if (!sitemap.includes(it.canonique + ' ')) err('absente du sitemap : ' + it.canonique);
  for (const d of it.doublons_rediriges || []) {
    if (fs.existsSync(path.join(ROOT, d.replace(/^\//, '')))) err('doublon toujours présent : ' + d);
  }
}
if (!erreurs) ok('canoniques présentes, auto-référentes et dans le sitemap');

// ── 3. Aucun lien interne vers un doublon redirigé
console.log('\n3. Liens internes vers un doublon redirigé');
const doublons = (REG.intentions || []).flatMap(it => it.doublons_rediriges || []).filter(d => d.endsWith('.html'));
let liens = 0;
for (const p of pages) {
  for (const d of doublons) {
    if (p.html.includes('href="' + d + '"') || p.html.includes('href="' + d.slice(1) + '"') || p.html.includes('href="..' + d + '"')) {
      err('lien vers ' + d + ' encore présent dans ' + p.url); liens++;
    }
  }
}
if (!liens) ok('aucun lien interne vers un doublon (' + doublons.length + ' surveillé·s)');

console.log('\nRÉSULTAT DOUBLONS D’INTENTION : ' + (erreurs ? erreurs + ' à traiter' : 'OK') +
            (avertis ? ' · ' + avertis + ' avertissement(s) hérité(s)' : '') + '\n');
process.exit(erreurs ? 1 : 0);
