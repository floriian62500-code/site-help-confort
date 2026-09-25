#!/usr/bin/env node
/**
 * Maillage de la campagne entretien : aucune page du groupe n'est un cul-de-sac.
 *
 * Ce contrôle vivait dans `prix-contrats.test.mjs`, dont le sujet est « aucune page n'invente un
 * tarif ». Le maillage interne n'a rien à voir avec les prix : les deux concernent la même
 * campagne, pas la même règle. Les garder ensemble a eu une conséquence concrète le 2026-09-25 —
 * le candidat de release « prix publics » ne pouvait pas être déclaré vert, parce que le fichier
 * qui le vérifie échouait sur un point qui ne le concernait pas (CHATGPT-2026-09-25-CONTROL-3 §2).
 *
 * Un fichier de test = une règle. Celui-ci vérifie que chaque page de la campagne renvoie vers au
 * moins deux autres, en-tête et pied de page exclus : ce qui compte est le maillage éditorial, pas
 * le menu que toutes les pages partagent.
 *
 *   node scripts/tests/maillage-campagne.test.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };
// Le JS lit le catalogue à l'exécution : seuls les liens écrits dans la page comptent.
const texte = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');

const GROUPE = ['chauffagiste-saint-omer.html', 'contrats-entretien.html', 'prestations/ramonage.html',
                'guide-entretien-chaudiere.html', 'blog-entretien-chaudiere-annuel-obligatoire.html'];
const editorial = (p) => texte(p).replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/g, '');
const lie = (depuis, vers) =>
  new RegExp('href="(?:[^"]*/)?' + vers.replace('.html', '').replace('/', '\\/') + '(\\.html)?[#"]').test(depuis);

console.log('\nMAILLAGE DE LA CAMPAGNE ENTRETIEN\n');

const sorties = {};
for (const p of GROUPE) {
  const c = editorial(p);
  sorties[p] = GROUPE.filter((q) => q !== p && lie(c, q));
}
const culsDeSac = GROUPE.filter((p) => sorties[p].length < 2);
ok(`chaque page renvoie vers au moins 2 autres du groupe (${GROUPE.length} pages)`,
  culsDeSac.length === 0, culsDeSac.map((p) => p + ' → ' + (sorties[p].join(', ') || 'aucune')).join('\n     '));

// Un lien ne doit pas viser une URL qui redirige : le maillage se fait vers la destination.
const redirects = readFileSync(join(ROOT, '_redirects'), 'utf8');
const versRedirigees = [];
for (const p of GROUPE) {
  for (const m of editorial(p).matchAll(/href="(\/[^"#?]*)/g)) {
    if (new RegExp('^' + m[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\.html)?\\s+\\S+\\s+30[12]', 'm').test(redirects)) {
      versRedirigees.push(p + ' → ' + m[1]);
    }
  }
}
ok('aucun lien du groupe ne vise une URL redirigée (pas de rebond 301)', versRedirigees.length === 0, versRedirigees.join(', '));

console.log(`\nRÉSULTAT MAILLAGE CAMPAGNE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
