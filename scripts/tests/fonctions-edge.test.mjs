#!/usr/bin/env node
/**
 * Garde sur les fonctions edge (directive 5795806773 §5).
 *
 * « Interdire toute suppression automatique d'une fonction déployée sans preuve d'usage nul. »
 *
 * Ce test ne juge pas l'utilité d'une fonction : il rend sa disparition impossible par accident.
 * Une fonction déployée qui perd sa source dans le dépôt fait échouer le test. La supprimer pour de
 * bon devient un acte explicite : retirer son nom du relevé ET son dossier, dans le même commit,
 * après la décision de Florian.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (label, cond) => { if (cond) { pass++; console.log('  ✅ ' + label); } else { fail++; console.log('  ❌ ' + label); } };

const releve = JSON.parse(readFileSync(join(ROOT, 'docs/audit/fonctions-deployees.json'), 'utf8'));
const dossiers = readdirSync(join(ROOT, 'supabase/functions'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name);
const inventaire = readFileSync(join(ROOT, 'docs/audit/FONCTIONS-EDGE-2026-09-23.md'), 'utf8');

console.log('\nFONCTIONS EDGE — aucune disparition silencieuse\n');

ok(`relevé daté et non vide (${releve.deployees.length} fonctions déployées au ${releve._releve_le})`,
  Array.isArray(releve.deployees) && releve.deployees.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(releve._releve_le));

const sansSource = releve.deployees.filter((f) => !dossiers.includes(f));
ok('chaque fonction déployée a toujours sa source dans le dépôt', sansSource.length === 0);
if (sansSource.length) console.log('     manquantes : ' + sansSource.join(', '));

const sansEntree = releve.deployees.filter((f) => !existsSync(join(ROOT, 'supabase/functions', f, 'index.ts')));
ok('chaque source déployée a bien un index.ts (point d’entrée réel)', sansEntree.length === 0);
if (sansEntree.length) console.log('     sans index.ts : ' + sansEntree.join(', '));

const nonDeployees = dossiers.filter((f) => !releve.deployees.includes(f));
ok(`les dossiers non déployés sont listés dans l’inventaire (${nonDeployees.length})`,
  nonDeployees.every((f) => inventaire.includes('`' + f + '`')));
const oublies = nonDeployees.filter((f) => !inventaire.includes('`' + f + '`'));
if (oublies.length) console.log('     absents de l’inventaire : ' + oublies.join(', '));

ok('l’inventaire rappelle que le workflow déploie TOUT le dossier à chaque poussée sur main',
  /à chaque poussée sur `main`/.test(inventaire) && /créerait en production/.test(inventaire));

// Les versions durcies ne doivent jamais devenir le point d'entrée par inadvertance.
const durcies = dossiers.filter((f) => existsSync(join(ROOT, 'supabase/functions', f, 'HARDENED_index.ts')));
ok(`les versions durcies restent à côté du point d’entrée, jamais à sa place (${durcies.length})`,
  durcies.every((f) => existsSync(join(ROOT, 'supabase/functions', f, 'index.ts'))));

// La logique d'écriture GitHub durcie ne doit pas accepter un jeton venu de la requête.
const partage = join(ROOT, 'supabase/functions/_shared/github-write.ts');
if (existsSync(partage)) {
  const src = readFileSync(partage, 'utf8');
  ok('écriture GitHub durcie : un jeton fourni dans la requête est refusé, pas ignoré', /jeton_dans_la_requete/.test(src));
  ok('écriture GitHub durcie : main et master refusées quoi qu’il arrive', /BRANCHES_INTERDITES = \["main", "master"\]/.test(src));
  ok('écriture GitHub durcie : les chemins d’exécution du projet sont protégés',
    /\^\\\.github\\\//.test(src) && /supabase\\\/functions\\\//.test(src));
}

console.log(`\nRÉSULTAT FONCTIONS EDGE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
