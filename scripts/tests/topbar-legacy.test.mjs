#!/usr/bin/env node
// Bandeau orange legacy `.hc-topbar` : il ne doit plus jamais revenir.
//
// Histoire : retiré du site le 2026-09-14 à la demande de Florian. Revenu avec les pages que la
// synchronisation d'en-tête n'avait pas encore touchées, puis masqué en urgence par
// `assets/hc-header.css` (PR #45, prod 093f0605). Masquer ne suffit pas : le balisage restait dans
// 140 pages, et la version `?v=` des pages ne correspondait plus au fichier CSS réellement servi —
// un visiteur qui avait déjà la feuille en cache (30 jours) gardait donc le bandeau à l'écran.
//
//   node scripts/tests/topbar-legacy.test.mjs — sortie 1 au moindre écart.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { publicPages } from '../header/sync-header.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const sha10 = (p) => crypto.createHash('sha256').update(rd(p)).digest('hex').slice(0, 10);
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

const pages = publicPages();

// 1. Plus aucun balisage
const avecBalise = pages.filter((p) => /<div\s+[^>]*class="[^"]*\bhc-topbar\b/.test(rd(p)));
ok(`aucune page ne porte le bandeau legacy (${pages.length} pages)`, avecBalise.length === 0, avecBalise.slice(0, 5).join(', '));

// 2. Plus aucune règle morte : un sélecteur sans élément, c'est du poids mort qui ressuscite au
//    premier copier-coller de page.
const avecRegle = pages.filter((p) => /\.hc-topbar\b/.test(rd(p)));
ok('aucune page ne garde les règles CSS du bandeau', avecRegle.length === 0, avecRegle.slice(0, 5).join(', '));

// 3. Le masque de secours reste dans la feuille commune : deuxième barrière, volontaire.
ok('la feuille d’en-tête garde le masque de secours', /\.hc-topbar\s*\{[^}]*display\s*:\s*none/.test(rd('assets/hc-header.css')));

// 4. La version demandée par les pages = le fichier réellement servi. Sans ça, un correctif de la
//    feuille n'atteint pas les visiteurs qui l'ont déjà en cache (Cache-Control: 30 jours).
const vCss = sha10('assets/hc-header.css'), vJs = sha10('assets/hc-header.js');
// Meme regle pour l'encart saisonnier : la PR #48 a corrige son script sans relancer la
// synchronisation, et les pages demandaient encore l'ancienne version. Un visiteur qui avait
// le fichier en cache (30 jours) voyait toujours « Poele ou insert » et son lien mort.
const vPCss = sha10('assets/hc-promo-saison.css'), vPJs = sha10('assets/hc-promo-saison.js');
const perimees = pages.filter((p) => {
  const s = rd(p);
  return !s.includes(`/assets/hc-header.css?v=${vCss}`) || !s.includes(`/assets/hc-header.js?v=${vJs}`)
      || !s.includes(`/assets/hc-promo-saison.css?v=${vPCss}`) || !s.includes(`/assets/hc-promo-saison.js?v=${vPJs}`);
});
ok(`la version des assets n’est pas périmée (en-tête ${vCss}/${vJs}, encart ${vPCss}/${vPJs})`, perimees.length === 0,
  perimees.length + ' page(s), ex. ' + perimees.slice(0, 3).join(', '));

// 5. La zone au-dessus de l'en-tête ne présente plus Dunkerque comme une agence : c'était tout le
//    contenu du bandeau (« Saint-Omer Dépan'Audo + Dunkerque Dépan'DK »). Doctrine : une agence à
//    Saint-Omer, les autres villes sont des pôles ou des zones d'intervention.
const zoneHaute = (s) => {
  const b = s.search(/<body\b[^>]*>/), h = s.search(/<header\b[^>]*id="hcHeader"/);
  return b >= 0 && h > b ? s.slice(b, h) : '';
};
const hautFautif = pages.filter((p) => /Dunkerque|Dépan[’']?\s?DK/i.test(zoneHaute(rd(p))));
ok('la zone au-dessus de l’en-tête ne présente aucune seconde agence', hautFautif.length === 0, hautFautif.slice(0, 5).join(', '));

// 6. Le synchroniseur retire le bandeau : même si une page le réintroduit, la prochaine
//    synchronisation l'enlève. C'est la garde qui tient dans le temps.
const sync = rd('scripts/header/sync-header.mjs');
ok('le synchroniseur retire le bandeau à chaque passage', /function sansTopbarLegacy/.test(sync) && /h = sansTopbarLegacy\(h\);/.test(sync));

console.log(`\nRÉSULTAT BANDEAU LEGACY : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
