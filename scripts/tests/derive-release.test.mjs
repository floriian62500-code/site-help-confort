#!/usr/bin/env node
/**
 * Garde sur le pilotage des livraisons (instruction CHATGPT-2026-09-24-RELEASE-CATCHUP-V1).
 *
 * Ce que ce test protège : la règle qui doit empêcher qu'un écart de 447 commits se reforme.
 * Il ne mesure pas la dérive (c'est le rôle de scripts/release/derive.mjs) — il vérifie que
 * l'outil et sa source de vérité existent, disent la même chose, et comptent les bonnes choses.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEUILS, estFonctionnel } from '../release/derive.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

console.log('\nPILOTAGE DES LIVRAISONS — la dérive ne doit plus pouvoir se reformer\n');

ok('les trois seuils demandés existent (30 commits, 7 jours, 10 éléments prêts)',
  SEUILS.commits === 30 && SEUILS.jours === 7 && SEUILS.prets === 10);

// Le comptage : une sauvegarde automatique ou un rapport nightly ne livre rien.
ok('les sauvegardes automatiques ne comptent pas comme du travail à livrer',
  !estFonctionnel('chore(auto): sauvegarde automatique 2026-09-24 09:33 — 2 fichier(s)') &&
  !estFonctionnel('Auto-push 2026-09-18 07:48 — 1 fichier(s)'));
ok('les rapports d’audit nocturnes ne comptent pas non plus',
  !estFonctionnel('chore(audits): rapports nightly 2026-09-24 [skip ci]'));
ok('un vrai commit compte', estFonctionnel('fix(home): make the seasonal CTAs open the tunnel with their context'));
ok('une fusion ne compte pas (elle ne livre rien par elle-même)', !estFonctionnel('Merge pull request #1 from x'));

const rel = JSON.parse(readFileSync(join(ROOT, 'docs/release/CURRENT-RELEASE.json'), 'utf8'));
ok('la source de vérité de livraison existe et porte un statut explicite',
  typeof rel.statut === 'string' && rel.statut.length > 3);
ok('aucune release n’est déclarée active sans branche (et inversement)',
  (rel.release_branch === null) === (rel.statut === 'AUCUNE_RELEASE_ACTIVE'));
ok('les exclusions sont nommées, avec leur état et leur raison',
  Array.isArray(rel.exclusions) && rel.exclusions.length > 0 &&
  rel.exclusions.every((e) => e.lot && e.etat && e.raison && e.raison.length > 15));

const ETATS = ['DEV', 'TESTED', 'WAITING_FLORIAN', 'READY_FOR_RELEASE', 'IN_RELEASE', 'PROD', 'PROD_VERIFIED'];
ok(`chaque élément et chaque exclusion porte un état du vocabulaire (${ETATS.length} états)`,
  [...(rel.elements || []), ...(rel.exclusions || [])].every((e) => ETATS.includes(e.etat)));

const ci = readFileSync(join(ROOT, '.github/workflows/tests.yml'), 'utf8');
ok('la CI signale la dérive à chaque passage', /derive\.mjs/.test(ci));
ok('… mais ne bloque pas dessus (sinon la CI serait rouge en permanence et le signal serait perdu)',
  /derive\.mjs \|\| true/.test(ci) && !/derive\.mjs --strict/.test(ci));

const src = readFileSync(join(ROOT, 'scripts/release/derive.mjs'), 'utf8');
ok('le mode strict existe pour le processus de release', /--strict/.test(src));

// ── Le garde-fou de WIP (REVIEW-1 point 2) : l'alerte en CI ne bloque pas, mais l'ouverture d'un
// nouveau gros lot, si. Les deux doivent coexister, et le refus doit rester contournable.
ok('le mode strict distingue « seuil franchi » (1) de « mesure impossible » (3)',
  /process\.exit\(1\)/.test(src) && /process\.exit\(3\)/.test(src) && /Impossible de mesurer/.test(src));
const session = readFileSync(join(ROOT, 'scripts/ops/worksession.sh'), 'utf8');
ok('l’ouverture d’un lot passe par la garde, et un refus n’ouvre rien',
  /garde_wip "\$LIBELLE" "\$FORCE" \|\| exit 3/.test(session));
ok('la garde appelle bien la mesure de dérive en mode strict',
  /derive\.mjs" --strict/.test(session));
ok('les échappatoires exigées par le contrôle existent toutes (correctif, sécurité, release, GO Florian)',
  /p0\|p1\|secu/.test(session) && /release\|rollback/.test(session) && /--go-florian/.test(session) && /HC_GO_FLORIAN/.test(session));
ok('une release corrective active lève le blocage', /release_active/.test(session) && /AUCUNE_RELEASE_ACTIVE/.test(session));
ok('la garde n’agit qu’à l’ouverture : renew, stop et status restent libres',
  !/garde_wip/.test(session.slice(session.indexOf('  renew)'))));
ok('le comportement de la garde est prouvé par un test dédié', existsSync(join(ROOT, 'scripts/tests/garde-wip.test.sh')));
ok('rien n’est déployé par ce contrôle', !/functions deploy|db push|git push/.test(readFileSync(join(ROOT, 'scripts/release/derive.mjs'), 'utf8')));

console.log(`\nRÉSULTAT PILOTAGE DES LIVRAISONS : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
