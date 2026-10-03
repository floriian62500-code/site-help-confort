#!/usr/bin/env node
/**
 * Catalogue public (/nos-prestations) : ce que le client lit ne vient jamais d'une variable interne.
 *
 * Origine, REQ-20260926-012 : dans la famille « Plomberie & Sanitaires », un sous-filtre
 * « _default 1 » s'affichait. Ce n'est pas une catégorie, c'est le slug de repli du code pour les
 * prestations sans sous-catégorie métier. Le groupe correspondant n'a pas d'en-tête — il n'a pas
 * de nom — et la construction des pastilles retombait alors sur le slug.
 *
 *   node scripts/tests/catalogue-public.test.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
const page = readFileSync(join(ROOT, 'nos-prestations.html'), 'utf8');

console.log('\nCATALOGUE PUBLIC — aucun libellé technique à l’écran\n');

// ── 1. La construction des pastilles ne retombe plus sur le slug
const bloc = (page.match(/subgroups\.forEach\(function\(sg\)\{[\s\S]*?\n   \}\);/) || [''])[0];
ok('le libellé d’un sous-filtre vient de l’en-tête, jamais du slug',
  !!bloc && !/var label = head \? [^;]*: slug;/.test(bloc) && /libelleHead\.trim\(\) \|\|/.test(bloc));
ok('une prestation sans sous-catégorie métier s’affiche « Autres prestations »',
  /SLUGS_TECHNIQUES\[slug\] \? 'Autres prestations'/.test(bloc));

// ── 2. Les quatre formes de slug technique sont couvertes, pas seulement celle qu'on a vue
const TECHNIQUES = ['_default', 'default', 'null', 'undefined'];
const carte = (page.match(/var SLUGS_TECHNIQUES = \{[^}]*\}/) || [''])[0];
ok(`les slugs techniques connus sont tous couverts (${TECHNIQUES.join(', ')})`,
  TECHNIQUES.every((s) => carte.includes("'" + s + "'")), carte);

// ── 3. Au niveau des familles, le repli existait déjà : il ne doit pas régresser
ok('au niveau des familles aussi, « _default » s’affiche « Autres prestations »',
  /g\.name !== '_default'\) \? g\.name : 'Autres prestations'/.test(page));

// ── 4. Aucun slug technique écrit en dur dans du texte visible.
// On retire scripts, styles et attributs : ce qui reste est ce que le client lit dans le HTML servi.
const visible = page
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ');
const fuites = TECHNIQUES.filter((s) => new RegExp('(^|\\s)' + s + '(\\s|$)').test(visible));
ok('aucun slug technique dans le texte statique de la page', fuites.length === 0, fuites.join(', '));

// ── 5. Les familles du catalogue viennent de la base, pas d'une liste écrite à la main :
// le contrôle vérifie qu'aucune liste en dur ne les fige (sinon une famille ajoutée en base
// n'apparaîtrait pas, et une famille retirée resterait affichée).
ok('les familles et sous-familles sont lues dans la base, pas codées en dur',
  /from\('v_services_public'\)|v_services_public\?select/.test(page) && /subcategory_slug/.test(page));

console.log(`\nRÉSULTAT CATALOGUE PUBLIC : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
