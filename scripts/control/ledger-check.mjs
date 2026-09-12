#!/usr/bin/env node
/* ledger-check — vérifie que chaque SHA recette cité dans MASTER-TASK-LEDGER.md existe réellement en git.
 * FAIL (exit 1) si un SHA est introuvable. Aussi : signale les tâches sans statut valide. */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const LEDGER = 'docs/control/MASTER-TASK-LEDGER.md';
const VALID = ['BACKLOG','IN_PROGRESS','BLOCKED_HUMAN','READY_FOR_QA','QA_REJECTED','QA_APPROVED','READY_FOR_PROD','PROD_DEPLOYED','PROD_VERIFIED','CLOSED'];
let fail = 0;
const txt = readFileSync(LEDGER, 'utf8');
// SHAs cités en backticks (7-40 hex)
const shas = [...new Set([...txt.matchAll(/`([0-9a-f]{7,40})`/g)].map(m => m[1]))];
console.log(`Vérification de ${shas.length} SHA(s) du ledger…`);
for (const sha of shas) {
  try { execSync(`git cat-file -e ${sha}^{commit}`, { stdio: 'ignore' }); console.log('  ✅', sha); }
  catch { console.log('  ❌ SHA introuvable en git:', sha); fail++; }
}
// au moins un statut valide présent
const hasStatus = VALID.some(s => txt.includes(s));
if (!hasStatus) { console.log('  ❌ aucun statut valide dans le ledger'); fail++; }
// pas de PROD_DEPLOYED sans mention de SHA prod (garde simple)
// statut de tâche réel = **PROD_DEPLOYED** (bolded) ; ignore la ligne de définition des statuts
if (/\*\*PROD_DEPLOYED\*\*/.test(txt) && !/SHA (prod|main)/i.test(txt)) { console.log('  ❌ tâche PROD_DEPLOYED sans SHA prod'); fail++; }
console.log(`\nRÉSULTAT LEDGER : ${shas.length-fail} OK / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
