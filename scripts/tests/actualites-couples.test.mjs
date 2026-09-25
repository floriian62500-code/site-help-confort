#!/usr/bin/env node
/**
 * Une publication de chantier = une seule URL indexable.
 *
 * Règle : quand une actualité et une fiche réalisation racontent le même chantier, la fiche est
 * canonique. L'actualité y renvoie définitivement, elle la désigne dans son `canonical`, et le
 * listing pointe la fiche — pour qu'aucun clic ne coûte un rebond 301.
 *
 * Ce fichier ne vérifie QUE cette règle, sur les couples réellement déclarés dans `_redirects`.
 * Le reste de la canonicalisation des actualités — l'hôte déclaré, la garde anti-doublon du
 * listing, le générateur Facebook, la branche du sitemap — vit dans `actualites-canonique.test.mjs`
 * et relève d'autres lots. Séparer les deux permet de livrer cette règle-ci seule, prouvée à 100 %
 * sur l'état exact d'une release (CHATGPT-2026-09-25-CONTROL-3 §2).
 *
 *   node scripts/tests/actualites-couples.test.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');

const redirects = lire('_redirects');
const couples = [...redirects.matchAll(/^\/actualites\/(\S+)\.html \/realisations\/(\S+) 301!$/gm)]
  .map((m) => ({ actu: m[1], fiche: m[2] }));

console.log('\nACTUALITÉS ↔ RÉALISATIONS — une publication chantier, une URL\n');
ok(`des couples sont déclarés (${couples.length})`, couples.length > 0);

const sansFiche = couples.filter((c) => !existsSync(join(ROOT, 'realisations/' + c.fiche + '.html')));
ok('chaque couple vise une fiche qui existe', sansFiche.length === 0, sansFiche.map((c) => c.fiche).join(', '));

const sansPage = couples.filter((c) => !existsSync(join(ROOT, 'actualites/' + c.actu + '.html')));
ok('chaque couple part d’une actualité qui existe encore (la redirection a quelque chose à couvrir)',
  sansPage.length === 0, sansPage.map((c) => c.actu).join(', '));

// Netlify sert le fichier statique AVANT la règle, sauf si celle-ci finit par « ! ».
const sansForce = couples.filter((c) =>
  !new RegExp(`^/actualites/${c.actu}\\.html /realisations/${c.fiche} 301!$`, 'm').test(redirects) ||
  !new RegExp(`^/actualites/${c.actu} /realisations/${c.fiche} 301!$`, 'm').test(redirects));
ok('redirection forcée (301!) dans les deux formes d’URL, avec et sans .html', sansForce.length === 0,
  sansForce.map((c) => c.actu.slice(0, 40)).join(', '));

const mauvaisCanonical = couples.filter((c) =>
  !lire('actualites/' + c.actu + '.html').includes(`<link rel="canonical" href="https://depan59-62.fr/realisations/${c.fiche}"`));
ok('chaque actualité redirigée désigne la fiche comme canonique', mauvaisCanonical.length === 0,
  mauvaisCanonical.map((c) => c.actu.slice(0, 40)).join(', '));

const boucles = couples.filter((c) => new RegExp(`^/realisations/${c.fiche}\\b.*30[12]`, 'm').test(redirects));
ok('aucune boucle : la fiche n’est elle-même jamais redirigée', boucles.length === 0, boucles.map((c) => c.fiche).join(', '));

if (existsSync(join(ROOT, 'content/actualites/index.json'))) {
  const index = JSON.parse(lire('content/actualites/index.json'));
  const entrees = Array.isArray(index) ? index : index.items || index.articles || [];
  const rebonds = entrees.filter((e) => couples.some((c) => String(e.url || '').includes(c.actu)));
  ok(`le listing pointe la fiche, pas l’actualité redirigée (${entrees.length} entrées)`,
    rebonds.length === 0, rebonds.map((e) => e.url).slice(0, 5).join(', '));
  const cibles = entrees.filter((e) => /^\/realisations\//.test(String(e.url || '')));
  ok(`les entrées repointées visent une fiche réelle (${cibles.length})`,
    cibles.every((e) => existsSync(join(ROOT, e.url.replace(/^\//, '') + '.html'))),
    cibles.filter((e) => !existsSync(join(ROOT, e.url.replace(/^\//, '') + '.html'))).map((e) => e.url).join(', '));
}

console.log(`\nRÉSULTAT COUPLES ACTUALITÉ ↔ FICHE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
