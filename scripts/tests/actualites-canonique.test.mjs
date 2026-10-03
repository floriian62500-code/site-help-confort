#!/usr/bin/env node
/**
 * Doublon SEO actualités ↔ réalisations (directive 5778526407 §3).
 *
 * Règle : une publication de chantier a UNE seule URL indexable, la fiche /realisations/<slug>.
 * L'ancienne actualité y renvoie (301 forcé) et la désigne comme canonique.
 * Les actualités qui ne sont pas des chantiers (conseils, guides, vie de l'agence) ne changent pas.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://depan59-62.fr';
let pass = 0, fail = 0;
const ok = (label, cond) => { if (cond) { pass++; console.log('  ✅ ' + label); } else { fail++; console.log('  ❌ ' + label); } };

const lire = (p) => readFileSync(join(ROOT, p), 'utf8');
const pages = readdirSync(join(ROOT, 'actualites')).filter((f) => f.endsWith('.html'));
const fiches = new Set(readdirSync(join(ROOT, 'realisations')).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5)));
const redirects = lire('_redirects');
const canonicalDe = (html) => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';

// Un chantier = une actualité dont le canonical désigne une fiche réalisation.
const chantiers = pages.filter((f) => /\/realisations\//.test(canonicalDe(lire('actualites/' + f))));
const autres = pages.filter((f) => !chantiers.includes(f));

console.log('\nACTUALITÉS ↔ RÉALISATIONS — une publication chantier = une URL\n');
ok(`corpus : ${pages.length} actualités, dont ${chantiers.length} chantiers et ${autres.length} non-chantiers`, pages.length > 0 && chantiers.length > 0 && autres.length > 0);

// ── 1. Les doublons désignent une fiche qui existe réellement
for (const f of chantiers) {
  const cible = canonicalDe(lire('actualites/' + f)).split('/realisations/')[1];
  ok(`chantier ${f.slice(0, 46)}… : canonique = fiche existante`, !!cible && fiches.has(cible));
}

// ── 2. Chaque doublon est redirigé (avec ET sans .html), en 301 forcé, vers cette même fiche
for (const f of chantiers) {
  const slug = f.slice(0, -5);
  const cible = canonicalDe(lire('actualites/' + f)).split('/realisations/')[1];
  const avec = new RegExp(`^/actualites/${slug}\\.html /realisations/${cible} 301!$`, 'm').test(redirects);
  const sans = new RegExp(`^/actualites/${slug} /realisations/${cible} 301!$`, 'm').test(redirects);
  ok(`chantier ${slug.slice(0, 40)}… : 301! vers la même fiche, avec et sans .html`, avec && sans);
}

// ── 3. Aucune boucle : une fiche ne renvoie jamais vers une actualité
const bouclesRedirect = redirects.split('\n').filter((l) => /^\/realisations\/\S+\s+\/actualites\//.test(l.trim()));
const fichesQuiRenvoient = [...fiches].filter((s) => /href="[^"]*\/actualites\//.test(lire('realisations/' + s + '.html')));
ok('aucune boucle : pas de redirection fiche → actualité', bouclesRedirect.length === 0);
ok('aucune boucle : aucune fiche ne lie vers /actualites/<publication>', fichesQuiRenvoient.length === 0);
ok('aucune boucle : aucune actualité redirigée ne pointe une cible elle-même redirigée', chantiers.every((f) => {
  const cible = canonicalDe(lire('actualites/' + f)).split('/realisations/')[1];
  return !new RegExp(`^/realisations/${cible}\\b.*30[12]`, 'm').test(redirects);
}));

// ── 4. Les actualités non-chantier ne sont pas abîmées
for (const f of autres) {
  const c = canonicalDe(lire('actualites/' + f));
  ok(`actualité ${f.slice(0, 46)}… : reste sa propre URL, sur l'hôte réel du site`, c === `${SITE}/actualites/${f}`);
}
ok('actualités non-chantier : aucune n’est redirigée', autres.every((f) => !redirects.includes('/actualites/' + f.slice(0, -5))));
ok('plus aucun canonical vers l’ancien domaine (qui redirige)', !pages.some((f) => /helpconfort-saintomer\.fr|www\.depan59-62\.fr/.test(lire('actualites/' + f))));

// ── 5. La liste /actualites.html pointe directement la fiche (aucun rebond) et ne montre qu’une carte
const index = JSON.parse(lire('content/actualites/index.json'));
const entrees = Array.isArray(index) ? index : index.items || index.articles || [];
const slugsChantier = new Set(chantiers.map((f) => f.slice(0, -5)));
const entreesChantier = entrees.filter((e) => slugsChantier.has(String(e.url || '').replace(/^\/?actualites\//, '').replace(/\.html$/, '')));
ok('liste : aucune entrée ne pointe encore une page chantier redirigée (pas de rebond 301)', entreesChantier.length === 0);
ok('liste : les entrées chantier pointent une fiche réelle', entrees.filter((e) => /^\/realisations\//.test(e.url || '')).every((e) => fiches.has(e.url.split('/realisations/')[1])));
const listing = lire('actualites.html');
ok('liste : une publication = une seule carte (garde anti-doublon sur l’URL)', /var vues = \{\};/.test(listing) && /if \(vues\[u\]\) return false;/.test(listing));

// ── 6. Le générateur ne peut plus recréer le doublon
const gen = lire('scripts/sync-facebook-posts.py');
ok('générateur : une publication qui a déjà une fiche ne crée plus de page actualité', /def fiche_chantier\(slug\):/.test(gen) && /if fiche:\n\s+url_entree = f"\/realisations\/\{fiche\}"/.test(gen));
ok('générateur : canonical et og:url sur l’hôte réel du site', !/helpconfort-saintomer\.fr/.test(gen) && gen.includes(`href="${SITE}/actualites/`));

// ── 7. Le sitemap ne publie aucune URL d’actualité de chantier
const sitemapFn = existsSync(join(ROOT, 'supabase/functions/sitemap/index.ts')) ? lire('supabase/functions/sitemap/index.ts') : '';
ok('sitemap : plus de branche qui publierait /actualites/<slug>.html (source du doublon)', !/\/actualites\/'\s*\+\s*encodeURIComponent/.test(sitemapFn) && !/from\('actualites'\)/.test(sitemapFn));
ok('sitemap : les fiches réalisations restent publiées', /realisations/.test(sitemapFn));

console.log(`\nRÉSULTAT ACTUALITÉS CANONIQUES : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
