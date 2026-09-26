#!/usr/bin/env node
/**
 * Pages métier × ville : chacune parle de SON métier, et ses cartes mènent quelque part.
 *
 * Origine : le 12 août 2026, Florian a laissé deux « à corriger » sur la menuiserie —
 * « IL Y A PAS MAL DE BEUGUE IL FAUT TOUT TESTER » et « DOUBLONS ». En les reprenant le 25 septembre,
 * les liens étaient tous bons (0 lien mort, 0 ancre morte sur les deux pages menuisier). Le vrai
 * défaut était ailleurs, et invisible pour un test de liens : `menuisier-saint-omer.html` portait
 * l'accroche du vitrier, mot pour mot — « Bris de glace, double vitrage, vitrage sur-mesure :
 * nos vitriers interviennent rapidement » — et sa description Google disait la même chose. Un
 * visiteur cherchant une porte lisait une promesse de vitrerie.
 *
 * Ces contrôles couvrent la famille du défaut, pas le seul cas trouvé :
 *   · deux métiers différents ne partagent ni accroche, ni description ;
 *   · aucune page ne vend le vocabulaire exclusif d'un autre métier (« bris de glace » sur une
 *     page menuiserie passait le contrôle précédent, puisque le mot « menuisier » y figurait aussi) ;
 *   · une page métier nomme son propre métier dans son accroche ;
 *   · les cartes savoir-faire mènent à une page qui existe.
 *
 *   node scripts/tests/pages-metier.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');

const METIERS = ['plombier', 'chauffagiste', 'electricien', 'serrurier', 'vitrier', 'menuisier', 'travaux', 'volets', 'pmr'];
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html') && METIERS.some((m) => f.startsWith(m + '-')));
const metierDe = (f) => METIERS.find((m) => f.startsWith(m + '-'));
const texte = (s) => s.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

// L'accroche : le premier paragraphe qui suit le H1, c'est-à-dire la promesse que le visiteur lit.
function accroche(html) {
  const i = html.indexOf('<h1');
  if (i < 0) return '';
  const m = html.slice(i, i + 1400).match(/<p[^>]*>([\s\S]*?)<\/p>/);
  return m ? texte(m[1]) : '';
}
const description = (html) => texte((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');

// Le vocabulaire propre à chaque métier : au moins un de ces mots doit figurer dans l'accroche.
const MOTS = {
  plombier: ['plomb', 'fuite', 'sanitaire', 'canalisation', 'chauffe-eau'],
  chauffagiste: ['chauffage', 'chaudière', 'chauffagiste', 'radiateur'],
  electricien: ['électric', 'electric', 'tableau', 'panne électrique'],
  serrurier: ['serrur', 'porte claquée', 'cylindre', 'ouverture de porte'],
  vitrier: ['vitr', 'vitrage', 'bris de glace', 'verre'],
  menuisier: ['menuis', 'fenêtre', 'porte', 'parquet', 'baie'],
  travaux: ['travaux', 'rénovation', 'chantier'],
  volets: ['volet', 'store', 'roulant'],
  pmr: ['pmr', 'adaptation', 'douche', 'monte-escalier', 'autonomie'],
};

console.log('\nPAGES MÉTIER — chacune parle de son métier\n');
ok(`corpus : ${pages.length} pages métier × ville`, pages.length >= 40);

// ── 1. Aucune promesse empruntée à un autre métier
for (const [quoi, extraire] of [['accroche', accroche], ['description Google', description]]) {
  const par = {};
  for (const f of pages) {
    const v = extraire(lire(f));
    if (v) (par[v] = par[v] || []).push(f);
  }
  const emprunts = Object.entries(par)
    .filter(([, fs]) => new Set(fs.map(metierDe)).size > 1)
    .map(([v, fs]) => fs.join(' + ') + ' → « ' + v.slice(0, 70) + '… »');
  ok(`aucune ${quoi} partagée par deux métiers différents`, emprunts.length === 0, emprunts.join('\n     '));
}

// ── 1bis. Ni l'accroche ni la description n'empruntent le vocabulaire EXCLUSIF d'un autre métier.
// C'est ce qui manquait au contrôle ci-dessus : « Menuisier à Saint-Omer. Bris de glace,
// remplacement vitrage… » contient bien le mot « menuisier », et passait donc inaperçu, alors que
// la promesse vendue était celle du vitrier.
const EXCLUSIFS = {
  vitrier: ['bris de glace', 'double vitrage'],
  serrurier: ['porte claquée', 'cylindre'],
  chauffagiste: ['chaudière'],
  pmr: ['monte-escalier'],
  volets: ['volet roulant'],
};
const empruntsVocab = [];
for (const f of pages) {
  const mien = metierDe(f);
  const v = (accroche(lire(f)) + ' ' + description(lire(f))).toLowerCase();
  for (const [autre, mots] of Object.entries(EXCLUSIFS)) {
    if (autre === mien) continue;
    const trouve = mots.filter((m) => v.includes(m));
    if (trouve.length) empruntsVocab.push(`${f} (${mien}) emprunte au ${autre} : « ${trouve.join(', ')} »`);
  }
}
ok('aucune page métier ne vend le vocabulaire exclusif d’un autre métier', empruntsVocab.length === 0, empruntsVocab.join('\n     '));

// ── 2. L'accroche nomme le métier de la page
const muettes = pages.filter((f) => {
  const a = accroche(lire(f)).toLowerCase();
  return a && !MOTS[metierDe(f)].some((m) => a.includes(m));
});
ok('chaque accroche nomme le métier de sa page', muettes.length === 0, muettes.join(', '));

// ── 3. Les cartes savoir-faire mènent à une page qui existe
const redirects = lire('_redirects');
const resolu = (u) => {
  const p = u.split('#')[0].split('?')[0].replace(/^\//, '');
  if (!p) return true;
  if (existsSync(join(ROOT, p)) || existsSync(join(ROOT, p + '.html'))) return true;
  return new RegExp('^/' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\.html)?\\s', 'm').test(redirects);
};
const morts = [];
let cartes = 0;
for (const f of pages) {
  for (const m of lire(f).matchAll(/<a href="([^"]+)" class="m-svc">/g)) {
    cartes++;
    if (!/^(https?:|tel:|mailto:|#)/.test(m[1]) && !resolu(m[1])) morts.push(f + ' → ' + m[1]);
  }
}
ok(`les ${cartes} cartes savoir-faire mènent toutes à une page existante`, morts.length === 0, morts.join(', '));

// ── 3bis. Les cartes prestations : jamais deux fois la même
// Né d'une bêtise à moi, le 2026-09-26 : en remplaçant la grille des cartes chauffage, mon motif
// s'est arrêté trop tôt et les anciennes cartes sont restées sous les nouvelles. La page affichait
// « Chaudière » deux fois, et la suite complète était verte — parce que personne ne comptait les
// cartes. Maintenant si.
for (const f of pages) {
  const grille = (lire(f).match(/<div class="m-services-grid"[\s\S]*?<div style="text-align:center/) || [''])[0];
  if (!grille) continue;
  const titres = [...grille.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1].trim());
  const doublons = titres.filter((x, i) => titres.indexOf(x) !== i);
  ok(`${f.replace('.html', '')} : aucune carte prestation en double (${titres.length} cartes)`,
    doublons.length === 0, [...new Set(doublons)].join(', '));
  const ids = [...grille.matchAll(/<a id="([a-z-]+)"/g)].map((m) => m[1]);
  ok(`${f.replace('.html', '')} : les ancres de cartes sont uniques (${ids.length})`,
    new Set(ids).size === ids.length, ids.join(', '));
}

// ── 4. Le module « parcours » ne revient pas (décision Florian du 2026-09-26)
// Il avait déjà été demandé une fois. Il était encore là, à l'identique, sur sept pages métier :
// une bande « Voici comment ça se passe une fois votre demande envoyée » posée juste avant le
// footer, 2 901 octets recopiés page par page. Un contrôle vaut mieux qu'une seconde demande.
// La recherche porte sur TOUTES les pages publiques, pas seulement les pages métier : le module
// est arrivé par recopie, il reviendrait par recopie.
const TOUTES = (function lister(dir, acc = []) {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (['node_modules', '.git', 'docs', 'scripts', 'supabase', 'admin', 'admin-pro'].includes(e.name)) continue;
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) lister(rel, acc);
    else if (e.name.endsWith('.html')) acc.push(rel);
  }
  return acc;
})('');

// ── 3ter. Le footer dit vrai : un lien « Plomberie » mène à la plomberie
// Constat Florian du 2026-09-26 : les pictos et libellés du footer « Métiers » étaient faux. La
// mesure montre une signature de remplacement automatique passé trop large : sur 14 pages métier,
// le PREMIER lien du footer pointait bien vers la plomberie mais portait le nom du métier de la
// page — « Chauffage » sur les pages chauffagiste, « Électricité » sur les pages électricien.
// Le picto, lui, était le bon (la goutte) : c'est le texte qui avait dérivé.
const LIBELLES = { 'plombier-saint-omer': 'Plomberie', 'chauffagiste-saint-omer': 'Chauffage', 'electricien-saint-omer': 'Électricité' };
const fautifs = [];
let footers = 0;
for (const f of TOUTES) {
  const c = lire(f), i = c.indexOf('<h3>Métiers</h3>');
  if (i < 0) continue;
  footers++;
  const bloc = c.slice(i, i + 2600);
  for (const m of bloc.matchAll(/<a href="\/?([a-z-]+)(?:\.html)?"[^>]*>(?:<svg[\s\S]*?<\/svg>)?([^<]+)<\/a>/g)) {
    const attendu = LIBELLES[m[1]];
    if (attendu && m[2].trim() !== attendu) fautifs.push(`${f} : ${m[1]} étiqueté « ${m[2].trim()} »`);
  }
}
ok(`footer : chaque lien métier porte le nom de sa destination (${footers} footers)`,
  fautifs.length === 0, fautifs.slice(0, 6).join('\n     '));

// `hc-contact-journey` / `hcj-*` est un AUTRE composant, sur contact.html, au titre plus court
// (« Voici comment ça se passe ») : il n'est pas visé par la décision et reste en place tant que
// Florian ne s'est pas prononcé. Les motifs ci-dessous ne l'attrapent donc pas — c'est voulu.
const TRACES = ['hc-metier-journey', 'hmj-title', 'hmj-num', 'hmj-lbl', 'hmj-steps',
                'Voici comment ça se passe une fois votre demande envoyée'];
const restes = [];
for (const f of TOUTES) {
  const c = lire(f);
  for (const m of TRACES) if (c.includes(m)) restes.push(f + ' : ' + m);
}
ok(`aucune trace du module parcours sur les ${TOUTES.length} pages publiques`, restes.length === 0,
  restes.slice(0, 8).join('\n     '));

// Et son style ne doit pas survivre ailleurs : une règle orpheline est une invitation à recoller
// le bloc « puisque le CSS est déjà là ».
const ORPHELINS = [];
for (const dossier of ['assets', 'partials']) {
  if (!existsSync(join(ROOT, dossier))) continue;
  for (const f of readdirSync(join(ROOT, dossier))) {
    if (!/\.(css|js)$/.test(f)) continue;
    const c = lire(dossier + '/' + f);
    if (/hmj-|hc-metier-journey/.test(c)) ORPHELINS.push(dossier + '/' + f);
  }
}
ok('aucun CSS ni JS partagé ne décrit encore ce module', ORPHELINS.length === 0, ORPHELINS.join(', '));

console.log(`\nRÉSULTAT PAGES MÉTIER : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
