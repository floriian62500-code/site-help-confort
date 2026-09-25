#!/usr/bin/env node
/**
 * Liste blanche de déploiement des fonctions edge (directive 5796732231 §1).
 *
 * Ce test répond à une seule question : « une fonction peut-elle partir en production sans
 * décision ? » Il doit toujours répondre non.
 *
 * Il tourne en local et dans le workflow de déploiement, AVANT le moindre `supabase functions
 * deploy` : s'il échoue, rien n'est déployé.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + label); }
  else { fail++; console.log('  ❌ ' + label); if (detail) console.log('     ' + detail); }
};

const registre = JSON.parse(readFileSync(join(ROOT, 'supabase/functions/DEPLOIEMENT.json'), 'utf8'));
const releve = JSON.parse(readFileSync(join(ROOT, 'docs/audit/fonctions-deployees.json'), 'utf8'));
const workflow = readFileSync(join(ROOT, '.github/workflows/supabase-deploy.yml'), 'utf8');
const dossiers = readdirSync(join(ROOT, 'supabase/functions'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_')).map((e) => e.name);

const etatDe = (f) => (registre.fonctions[f] || {}).etat;
// Calculé exactement comme le workflow le calcule : si les deux divergent, le test ne sert à rien.
const deployables = Object.entries(registre.fonctions).filter(([, v]) => v.etat === 'current').map(([k]) => k);
const deployees = new Set(releve.deployees);

console.log('\nLISTE BLANCHE DE DÉPLOIEMENT — rien ne part en production sans décision\n');

// ── 1. Aucun dossier ne peut échapper au registre
const inconnus = dossiers.filter((f) => !etatDe(f));
ok(`chaque fonction du dépôt a un état déclaré (${dossiers.length})`, inconnus.length === 0,
  inconnus.length ? 'sans état : ' + inconnus.join(', ') : '');

const fantomes = Object.keys(registre.fonctions).filter((f) => !dossiers.includes(f));
ok('le registre ne cite aucune fonction qui n’existe plus', fantomes.length === 0,
  fantomes.length ? 'inconnues du dépôt : ' + fantomes.join(', ') : '');

const etatsValides = Object.keys(registre.etats);
const mauvais = Object.entries(registre.fonctions).filter(([, v]) => !etatsValides.includes(v.etat)).map(([k]) => k);
ok('tous les états appartiennent au vocabulaire déclaré (' + etatsValides.join(' / ') + ')', mauvais.length === 0,
  mauvais.length ? 'états inconnus : ' + mauvais.join(', ') : '');

// ── 2. Le cœur : rien de « pending » ou « quarantine » n’est déployable
const fuites = deployables.filter((f) => etatDe(f) !== 'current');
ok('la liste des déployables ne contient QUE des « current »', fuites.length === 0);

const pendingDeployables = dossiers.filter((f) => etatDe(f) === 'pending' && deployables.includes(f));
ok('aucune fonction « pending » n’est déployable', pendingDeployables.length === 0,
  pendingDeployables.join(', '));

const quarantaineDeployables = dossiers.filter((f) => etatDe(f) === 'quarantine' && deployables.includes(f));
ok('aucune fonction « quarantine » n’est déployable', quarantaineDeployables.length === 0,
  quarantaineDeployables.join(', '));

// ── 3. Cohérence avec la production réelle
const currentNonDeployees = deployables.filter((f) => !deployees.has(f));
ok('aucune « current » n’est en fait absente de la production (sinon le workflow la créerait)',
  currentNonDeployees.length === 0, currentNonDeployees.join(', '));

const pendingDejaEnProd = dossiers.filter((f) => etatDe(f) === 'pending' && deployees.has(f));
ok('aucune « pending » n’est en fait déjà en production (état mensonger)', pendingDejaEnProd.length === 0,
  pendingDejaEnProd.join(', '));

const sansSource = deployables.filter((f) => !existsSync(join(ROOT, 'supabase/functions', f, 'index.ts')));
ok('chaque « current » a bien une source déployable', sansSource.length === 0, sansSource.join(', '));

// ── 4. Le workflow applique réellement la règle
ok('le workflow ne déploie plus en boucle tout supabase/functions', !/for fn in supabase\/functions\/\*\//.test(workflow));
ok('le workflow lit la liste blanche', /DEPLOIEMENT\.json/.test(workflow) && /etat==='current'/.test(workflow));
ok('le workflow lance ce contrôle AVANT de déployer',
  workflow.indexOf('deploy-allowlist.test.mjs') > 0 &&
  workflow.indexOf('deploy-allowlist.test.mjs') < workflow.indexOf('supabase functions deploy'));
ok('un échec de déploiement ne passe plus en avertissement silencieux', !/continue-on-error: true[\s\S]{0,400}functions deploy/.test(workflow));

// ── 5. Les décisions de la directive sont tenues
const quarantaineAttendue = ['gh-push-batch', 'gh-push-from-chunks', 'gh-delete-files', 'gh-bulk-purge-seo-stats', 'sync-files-staging-to-main'];
ok('les 5 candidates à la suppression sont en quarantaine, pas supprimées',
  quarantaineAttendue.every((f) => dossiers.includes(f) && etatDe(f) === 'quarantine'),
  quarantaineAttendue.filter((f) => etatDe(f) !== 'quarantine').join(', '));

ok('gh-push-inline et gh-edit-file sont en quarantaine (patch durci prêt, aucun déploiement sans GO)',
  etatDe('gh-push-inline') === 'quarantine' && etatDe('gh-edit-file') === 'quarantine');

ok('stripe-create-payment-link est en quarantaine (sinon un merge remettrait la version vulnérable)',
  etatDe('stripe-create-payment-link') === 'quarantine');

ok('create-payment-session reste « pending » : l’appel est conservé, la fonction n’est pas déployée',
  etatDe('create-payment-session') === 'pending' &&
  existsSync(join(ROOT, 'supabase/functions/create-payment-session/index.ts')) &&
  readFileSync(join(ROOT, 'assets/hc-demande.js'), 'utf8').includes('create-payment-session'));

ok('les deux fonctions d’administration restent « pending »',
  etatDe('actu-generator') === 'pending' && etatDe('auto-publish-from-photos') === 'pending');

ok('chaque « pending » et chaque « quarantine » porte une raison écrite',
  Object.values(registre.fonctions).every((v) => v.etat === 'current' || (typeof v.raison === 'string' && v.raison.length > 20)));

console.log(`\nRÉSULTAT LISTE BLANCHE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
