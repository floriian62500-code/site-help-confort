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
 *   · le SERVICE entretien a une seule page commerciale : /chauffagiste-saint-omer.html
 *     (24/09 : la landing autonome /entretien-chaudiere.html a été supprimée, elle doublonnait
 *     cette page, la page contrats et le catalogue) ;
 *   · les autres pages peuvent mentionner l'offre et y renvoyer, jamais la revendre.
 *
 *   node scripts/tests/intention-unique.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CANON_CONTRAT = 'contrats-entretien.html';
const CANON_SERVICE = 'chauffagiste-saint-omer.html';
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

// ── 4. Les pages métier portent l'entretien et les contrats, sans les revendre
const metiers = ['chauffagiste-saint-omer.html', 'chauffagiste-dunkerque.html', 'chauffagiste-calais.html', 'chauffagiste-boulogne-sur-mer.html'];
for (const f of metiers) {
  const v = visible(f);
  ok(`${f.replace('.html', '')} : renvoie vers les contrats et ouvre l'entretien dans le tunnel, sans vendre`,
    new RegExp('href="[^"]*' + CANON_CONTRAT).test(v) &&
    /href="catalogue\.html#cat=chauffage&amp;presta=entretien/.test(v) &&
    !/Souscrire (BASIC|CONFORT|SÉCURITÉ)/.test(v));
}

// ── 5. La page de service est la page Chauffage, et elle n'est pas redirigée
const redirects = lire('_redirects');
ok('la page de service n’est pas redirigée (c’est la destination des Ads et de la redirection de l’ancienne landing)',
  !new RegExp('^/' + CANON_SERVICE.replace('.html', '') + '(\\.html)?\\s+\\S+\\s+30', 'm').test(redirects));
ok('la page de service se déclare canonique d’elle-même',
  new RegExp('<link rel="canonical" href="https://depan59-62\\.fr/' + CANON_SERVICE + '"').test(lire(CANON_SERVICE)));
ok('la page de service ne vend pas le contrat : elle présente les formules et renvoie',
  !/Souscrire (BASIC|CONFORT|SÉCURITÉ)/.test(visible(CANON_SERVICE)) &&
  new RegExp('href="[^"]*' + CANON_CONTRAT).test(visible(CANON_SERVICE)));
// La landing supprimée ne doit pas se reformer ailleurs : aucune autre page ne reprend son rôle.
ok('la landing autonome supprimée n’est reconstruite nulle part',
  !pages.includes('entretien-chaudiere.html') &&
  !pages.some((f) => /data-hc-cta="landing_chaudiere_(hero|side)"/.test(lire(f))));

// ── 6. Les points d'entrée marketing visent les URL canoniques
const home = visible('index.html');
// Le bandeau n'a jamais eu le droit de renvoyer vers une page qui redirige, ni vers un hub
// générique. Ce qu'il vise a changé deux fois, et c'est chaque fois une décision de Florian :
// le 24/09 la landing autonome disparaît ; le 25/09 la chaudière repasse par la page Chauffage,
// qui redevient la porte d'entrée métier — le tunnel s'ouvre depuis elle, pas depuis l'accueil.
ok('bandeau d’accueil : le bouton principal mène à la page Chauffage, qui n’est pas une page redirigée',
  /class="hcs-cta" href="\/chauffagiste-saint-omer\.html#/.test(home) &&
  !/hcs-cta" href="\/entretien-chaudiere/.test(home) &&
  !new RegExp('^/chauffagiste-saint-omer(\\.html)?\\s+\\S+\\s+30', 'm').test(redirects));
ok('depuis la page Chauffage, le tunnel reste accessible pour l’entretien ponctuel',
  /href="catalogue\.html#cat=chauffage&amp;presta=entretien/.test(lire(CANON_SERVICE)));
ok('la page de service canonique reste atteignable ailleurs (menu, Ads, pages liées)',
  [...pages].some((f) => f !== CANON_SERVICE && new RegExp('href="[^"]*' + CANON_SERVICE).test(visible(f))));
const ads = lire('docs/marketing/PAID-ACQUISITION-ENTRETIEN-2026-09.md');
ok('dossier Ads : aucune destination vers une page qui redirige ou qui n’existe plus',
  !/\/entretien-poele-insert/.test(ads) && /\/chauffagiste-saint-omer\.html/.test(ads));

// ── 7. Les trois boutons du bandeau saisonnier mènent chacun à SON intention (5812875220)
// Le défaut corrigé : quel que soit le bouton cliqué, un brouillon plus ancien (Plomberie) reprenait
// la main et le client retombait sur sa demande précédente. L'intention doit gagner, et rester
// lisible dans l'état du tunnel — pas seulement dans la description, qui vit en session 2 h.
const tunnel = lire('assets/hc-demande.js');
const noyau = lire('assets/hc-demande-core.js');
// Les trois boutons ne visent plus tous le tunnel : la chaudière a une page métier, les deux
// sujets hors catalogue n'en ont pas. Ce qui doit rester vrai, c'est que chacun mène à SA chose,
// et que deux boutons ne partagent jamais la même destination.
const tous = [...home.matchAll(/href="([^"]+)"[^>]*data-hc-promo-fam="([a-z-]+)"/g)].map((m) => ({ href: m[1].replace(/&amp;/g, '&'), fam: m[2] }));
ok(`bandeau : trois boutons, trois destinations distinctes (${tous.map((c) => c.fam).join(', ') || '—'})`,
  tous.length === 3 && new Set(tous.map((c) => c.href)).size === 3);
// 2026-09-26 : les trois familles mènent à la page Chauffage, chacune sur SON ancre. Le tunnel
// n'est plus une destination de l'accueil — il s'ouvre depuis une prestation de la page métier.
ok('bandeau : les trois familles mènent à la page Chauffage, chacune sur son ancre',
  tous.every((c) => /^\/chauffagiste-saint-omer\.html#[a-z-]+$/.test(c.href)) &&
  (tous.find((c) => c.fam === 'chaudiere') || {}).href === '/chauffagiste-saint-omer.html#entretien' &&
  (tous.find((c) => c.fam === 'poele') || {}).href === '/chauffagiste-saint-omer.html#poele-insert' &&
  (tous.find((c) => c.fam === 'ramonage') || {}).href === '/chauffagiste-saint-omer.html#ramonage');
ok('les ancres visées existent vraiment sur la page Chauffage',
  tous.every((c) => lire(CANON_SERVICE).includes('id="' + c.href.split('#')[1] + '"')));
const ctas = tous.filter((c) => c.href.startsWith('/catalogue.html#')).map((c) => ({ hash: c.href.split('#')[1], fam: c.fam }));
// Les contrôles qui suivent portaient sur les liens profonds vers le tunnel. Ils n'ont plus de
// sujet depuis le 26/09, et une boucle vide ne prouve rien : on l'écrit donc noir sur blanc.
ok('aucun bouton de l’encart ne vise le tunnel (le tunnel s’ouvre depuis la page métier)', ctas.length === 0);
const sujets = new Set([...tunnel.matchAll(/^\s{4}'?([a-z-]+)'?: \{ (?:libelle|metier):/gm)].map((m) => m[1]));
const focusConnus = new Set([...noyau.matchAll(/^\s{4}([a-z-]+): \{ libelle:/gm)].map((m) => m[1]));
for (const c of ctas) {
  const presta = (c.hash.match(/presta=([a-z-]+)/) || [])[1];
  const sujet = (c.hash.match(/sujet=([a-z-]+)/) || [])[1];
  ok(`bandeau ${c.fam} : l'intention est déclarée côté tunnel (${presta ? 'presta ' + presta : 'sujet ' + sujet})`,
    presta ? focusConnus.has(presta) : !!sujet && sujets.has(sujet));
  ok(`bandeau ${c.fam} : porte la source pour le suivi`, /src=home-saison/.test(c.hash));
}
ok('devis sans prestation au catalogue : l’intention est inscrite dans l’état durable, pas seulement dans la description',
  /state\.mode = 'devis'; state\.focus = h\.sujet;/.test(tunnel));
ok('une intention hors catalogue ne filtre rien : elle ne sert que de trace',
  /if \(!focusConnu\(f\)[\s\S]{0,40}?\) return liste \|\| \[\];/.test(noyau));
// Nuance apportée le 2026-09-26 (P0-HOME-INTERVENTION-REGRESSION) : l'écran de choix reste la
// règle pour les liens qui PORTENT UNE INTENTION — sujet, prestation, métier, contrat. Un lien qui
// ne fait qu'annoncer un démarrage (#intervention, #devis) démarre, et l'ancienne demande est mise
// de côté au lieu d'être effacée. Dans les deux cas, rien n'est repris en silence : c'est ce que ce
// contrôle vérifie.
ok('un lien d’entrée PORTANT UNE INTENTION avec une demande en cours passe par le choix explicite (jamais de reprise silencieuse)',
  /if \(decision === 'gate'\) \{ pendingEntry = h; start = 'choix'; \}/.test(tunnel) &&
  /var decision = C\.entryDecision\(h, C\.hasDraft\(state, cart \? cart\.count\(\) : 0\)\)/.test(tunnel));
ok('un démarrage explicite ne reprend rien en silence non plus : l’ancienne demande est mise de côté',
  /if \(decision === 'start-new'\) \{ misDeCote = archiverBrouillon\(\); startClean\(\); \}/.test(tunnel));
ok('aucun bouton du bandeau ne vise une URL redirigée',
  ctas.every((c) => !new RegExp('^/catalogue(\\.html)?\\s+\\S+\\s+30', 'm').test(redirects)));

console.log(`\nRÉSULTAT INTENTION UNIQUE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
