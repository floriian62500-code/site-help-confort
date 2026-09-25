#!/usr/bin/env node
/**
 * ONE_COMMERCIAL_INTENT = ONE_CANONICAL_PAGE (directive 5797912022).
 *
 * Constat de Florian sur la preview : « deux surfaces commerciales chaudière qui se chevauchent ».
 * L'audit a montré plus large que deux : l'offre de contrat était VENDUE sur 5 pages à la fois
 * (4 pages métier chauffagiste + la page prestations), chacune avec sa grille de formules et ses
 * boutons « Souscrire », et des prix écrits en dur — en HT, alors que les pages canoniques
 * affichent du TTC. Le même produit, deux présentations de prix, cinq vitrines.
 *
 * Règle tenue ici :
 *   · l'offre de CONTRAT ne se vend que sur /contrats-entretien.html ;
 *   · le SERVICE entretien a une seule page commerciale : /entretien-chaudiere.html ;
 *   · les autres pages peuvent mentionner l'offre et y renvoyer, jamais la revendre.
 *
 *   node scripts/tests/intention-unique.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANON_CONTRAT = 'contrats-entretien.html';
const CANON_SERVICE = 'entretien-chaudiere.html';
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');
// Ce que voit le visiteur : sans le JS, sans le CSS, sans les commentaires, sans l'en-tête ni le pied.
const visible = (p) => lire(p)
  .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/g, '');

const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));

console.log('\nUNE INTENTION COMMERCIALE = UNE PAGE CANONIQUE\n');

// ── 1. Une seule vitrine pour le contrat
// La page canonique construit ses cartes à l'exécution depuis le catalogue : son offre n'est pas
// dans le HTML statique. On vérifie donc l'inverse — AUCUNE AUTRE page n'expose de vitrine — puis
// que la canonique porte bien la machinerie de souscription.
const vendeuses = pages.filter((f) => {
  if (f === CANON_CONTRAT) return false;
  const v = visible(f);
  const boutons = (v.match(/<a[^>]*>[^<]*Souscrire[^<]*<\/a>|<button[^>]*>[^<]*Souscrire[^<]*<\/button>/g) || []).length;
  const formules = new Set(v.match(/\b(BASIC|CONFORT|SÉCURITÉ)\b/g) || []).size;
  return boutons >= 2 || (boutons >= 1 && formules >= 3);
});
ok('aucune page hors canonique n’expose de vitrine de souscription', vendeuses.length === 0, vendeuses.join(', '));
const canon = lire(CANON_CONTRAT);
ok('la page canonique porte bien la souscription (cartes construites depuis le catalogue)',
  /v_contract_offers|contrats_souscrire_/.test(canon) && /Souscrire/.test(canon));

// ── 2. Aucun prix de contrat en dur hors de la page canonique (c'est ce qui dérive)
// Attention au piège : « 45 € HT dans l'audomarois » contient « mois ». On exige donc une vraie
// périodicité, précédée d'une barre ou d'un « par », et bornée par une limite de mot.
const PERIODIQUE = /\d+\s*€\s*HT\s*(?:<[^>]+>\s*)*(?:\/|par\s)\s*(?:mois|an)\b/i;
const enDur = pages.filter((f) => f !== CANON_CONTRAT && PERIODIQUE.test(visible(f)));
ok('aucune page hors canonique n’affiche un prix de contrat en HT', enDur.length === 0, enDur.join(', '));

// ── 3. Le seul repère de prix toléré ailleurs est celui du catalogue, en TTC
const reperes = new Set();
for (const f of pages) {
  for (const m of visible(f).matchAll(/dès\s*(\d{1,2},\d{2})\s*€\s*TTC/gi)) reperes.add(m[1]);
}
ok(`le repère de prix affiché ailleurs est unique et TTC (${[...reperes].join(', ') || '—'})`,
  reperes.size <= 1 && (reperes.size === 0 || reperes.has('9,90')));

// ── 4. Les pages métier renvoient vers les deux pages canoniques, sans les concurrencer
const metiers = ['chauffagiste-saint-omer.html', 'chauffagiste-dunkerque.html', 'chauffagiste-calais.html', 'chauffagiste-boulogne-sur-mer.html'];
for (const f of metiers) {
  const v = visible(f);
  ok(`${f.replace('.html', '')} : renvoie vers les deux pages canoniques, sans vendre`,
    new RegExp('href="[^"]*' + CANON_CONTRAT).test(v) && new RegExp('href="[^"]*' + CANON_SERVICE).test(v) &&
    !/Souscrire (BASIC|CONFORT|SÉCURITÉ)/.test(v));
}

// ── 5. La page de service reste la page commerciale de l'intention, et n'est pas redirigée
const redirects = lire('_redirects');
ok('la page de service n’est pas redirigée (c’est la destination des Ads et du bandeau d’accueil)',
  !new RegExp('^/' + CANON_SERVICE.replace('.html', '') + '(\\.html)?\\s+\\S+\\s+30', 'm').test(redirects));
ok('la page de service se déclare canonique d’elle-même',
  new RegExp('<link rel="canonical" href="https://depan59-62\\.fr/' + CANON_SERVICE + '"').test(lire(CANON_SERVICE)));
ok('la page de service ne vend pas le contrat : elle compare et renvoie',
  !/Souscrire (BASIC|CONFORT|SÉCURITÉ)/.test(visible(CANON_SERVICE)) &&
  new RegExp('href="[^"]*' + CANON_CONTRAT).test(visible(CANON_SERVICE)));

// ── 6. Les points d'entrée marketing visent les URL canoniques
const home = visible('index.html');
ok('bandeau d’accueil : le bouton principal vise la page de service canonique',
  new RegExp('href="/' + CANON_SERVICE + '"[^>]*data-hc-promo-fam="chaudiere"').test(home));
const ads = lire('docs/marketing/PAID-ACQUISITION-ENTRETIEN-2026-09.md');
ok('dossier Ads : aucune destination vers une page qui redirige',
  !/\/entretien-poele-insert/.test(ads) && /\/entretien-chaudiere\.html/.test(ads));

console.log(`\nRÉSULTAT INTENTION UNIQUE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
