#!/usr/bin/env node
/**
 * Hygiène du dépôt : rien qui ne devrait pas y être.
 *
 * Origine, le 2026-09-25 : un `git add -A` a embarqué **162 copies de conflit iCloud**
 * (« chauffagiste-calais 2.html », « tests 2.yml »…). Le dépôt est sous `Documents/`, donc
 * synchronisé : ces copies apparaissent toutes seules, et rien ne les distinguait d'un fichier
 * normal au moment de committer. Conséquences immédiates : quatre suites de tests en échec, parce
 * qu'elles parcourent les dossiers et tombaient sur des pages fantômes — et, plus grave, un second
 * fichier de workflow (`.github/workflows/tests 2.yml`) que GitHub aurait exécuté comme un vrai.
 *
 * Aucune n'était unique : chacune était identique soit au fichier courant, soit à une révision
 * antérieure du même fichier (vérifié avant suppression). Rien n'a donc été perdu.
 *
 *   node scripts/tests/depot-propre.test.mjs
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

// « nom 2.ext », « nom 3.ext »… : la forme que prend une copie de conflit sur macOS/iCloud.
const COPIE = / \d+\.[^.]+$/;

function parcourir(dir, acc = []) {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) parcourir(rel, acc);
    else acc.push(rel);
  }
  return acc;
}

console.log('\nHYGIÈNE DU DÉPÔT\n');

const tous = parcourir('');
const copies = tous.filter((f) => COPIE.test(f));
ok(`aucune copie de conflit sur le disque (${tous.length} fichiers parcourus)`, copies.length === 0,
  copies.slice(0, 8).join('\n     ') + (copies.length > 8 ? `\n     … et ${copies.length - 8} autres` : ''));

const suivis = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean);
const copiesSuivies = suivis.filter((f) => COPIE.test(f));
ok('aucune copie de conflit suivie par git', copiesSuivies.length === 0, copiesSuivies.slice(0, 8).join(', '));

// Un second fichier de workflow serait exécuté par GitHub comme un vrai : c'est le cas le plus cher.
const workflows = suivis.filter((f) => f.startsWith('.github/workflows/'));
ok(`les workflows sont uniques et nommés proprement (${workflows.length})`,
  workflows.every((f) => !COPIE.test(f)), workflows.filter((f) => COPIE.test(f)).join(', '));

// La règle doit exister dans .gitignore, sinon la prochaine synchro les ramène.
const ignore = execFileSync('git', ['check-ignore', '-q', 'exemple 2.html'], { cwd: ROOT }).status;
ok('.gitignore écarte les copies de conflit (le disque en recrée tout seul)', ignore === undefined || ignore === 0);

console.log(`\nRÉSULTAT DÉPÔT PROPRE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
