#!/usr/bin/env node
/**
 * Une validation se périme toute seule quand le code change (CHATGPT-2026-09-25-CONTROL-3 §5).
 *
 * Ce que ces contrôles interdisent de reproduire : les neuf validations de Florian des 11 et 12
 * août paraissaient toujours valables en septembre, parce que la seule « version » stockée était un
 * numéro tenu à la main que personne n'avait bougé. La version doit venir du code, pas d'une
 * discipline humaine.
 *
 *   node scripts/tests/validation-fraicheur.test.mjs
 *
 * Tout se joue dans un dossier temporaire : aucune base, aucune production, aucun fichier du dépôt.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join as joindre } from 'node:path';
import { fileURLToPath } from 'node:url';
import { empreinte, versions } from '../release/versions-recette.mjs';

const ROOT_DEPOT = joindre(dirname(fileURLToPath(import.meta.url)), '..', '..');
import { classer, resume } from '../release/validation-fraicheur.mjs';

let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

const bac = mkdtempSync(join(tmpdir(), 'fraicheur-'));
const ecrire = (p, s) => { mkdirSync(join(bac, p, '..'), { recursive: true }); writeFileSync(join(bac, p), s); };

console.log('\nFRAÎCHEUR DES VALIDATIONS (bac à sable)\n');

// Un élément composé de deux fichiers : la page jugée et l'asset dont dépend son comportement.
const FEATURES = { elements: { 'bandeau-saison': { fichiers: ['index.html', 'assets/module.js'] },
                               'page-simple': { fichiers: ['page.html'] },
                               'sans-fichier': { fichiers: [] } } };
ecrire('index.html', '<h1>bandeau</h1>');
ecrire('assets/module.js', 'var a = 1;');
ecrire('page.html', '<h1>page</h1>');

const v1 = versions(bac, FEATURES);
ok('chaque élément déclaré reçoit une version', !!v1['bandeau-saison'].version && !!v1['page-simple'].version);
ok('un élément sans fichier n’a pas de version inventée : il le dit',
  v1['sans-fichier'].version === null && /aucun fichier/.test(v1['sans-fichier'].raison));

// ── 1. Le même code donne la même version (sinon tout serait périmé en permanence)
ok('même contenu → même version', versions(bac, FEATURES)['bandeau-saison'].version === v1['bandeau-saison'].version);

// ── 2. Une validation portant la version courante est actuelle
const valide = [{ feature_id: 'bandeau-saison', statut: 'ok', version: v1['bandeau-saison'].version, date: '2026-09-25' }];
ok('validation sur la version courante → VALIDATION_ACTUELLE', classer(valide, v1)[0].verdict === 'VALIDATION_ACTUELLE');

// ── 3. Un caractère change dans UN des fichiers → la validation se périme, sans geste humain
ecrire('assets/module.js', 'var a = 2;');
const v2 = versions(bac, FEATURES);
ok('un fichier modifié change la version de l’élément', v2['bandeau-saison'].version !== v1['bandeau-saison'].version);
ok('… et seulement de cet élément', v2['page-simple'].version === v1['page-simple'].version);
const apres = classer(valide, v2)[0];
ok('la validation d’hier devient VALIDATION_PERIMEE d’elle-même',
  apres.verdict === 'VALIDATION_PERIMEE' && /code a changé/.test(apres.raison));

// ── 4. Un refus reste un refus : ni périmé, ni acquis
ok('un « à corriger » reste REFUS_OUVERT quel que soit le code',
  classer([{ feature_id: 'page-simple', statut: 'a_corriger', version: 'peu importe' }], v2)[0].verdict === 'REFUS_OUVERT');

// ── 5. Le cas des neuf validations d'août : aucune version stockée → non rattachable
const aout = [{ feature_id: 'page-simple', statut: 'ok', version: null, date: '2026-08-12' },
              { feature_id: 'element-disparu', statut: 'ok', version: 'x', date: '2026-08-12' }];
const cl = classer(aout, v2);
ok('une validation sans version du code n’est PAS comptée comme actuelle',
  cl[0].verdict === 'NON_RATTACHABLE' && /sans version/.test(cl[0].raison));
ok('une validation sur un élément qui n’existe plus n’est pas comptée comme actuelle',
  cl[1].verdict === 'NON_RATTACHABLE');
ok('aucun verdict ne tombe par défaut sur « actuelle »',
  !cl.some((c) => c.verdict === 'VALIDATION_ACTUELLE'));

// ── 5bis. La cible est explicite : feature_version / code_sha. `recette_version` n'est qu'un repli
// hérité, et il doit se voir dans le verdict — sinon on reproduirait en plus discret le problème
// qu'on corrige (CHATGPT-2026-09-25-CONTROL-4 §7).
const explicite = classer([{ feature_id: 'page-simple', statut: 'ok', feature_version: v2['page-simple'].version }], v2)[0];
ok('une validation portant feature_version est rattachée par le champ explicite',
  explicite.verdict === 'VALIDATION_ACTUELLE' && explicite.source_version === 'feature_version');
const repli = classer([{ feature_id: 'page-simple', statut: 'ok', recette_version: v2['page-simple'].version }], v2)[0];
ok('une validation qui n’a que recette_version est acceptée, mais le repli est tracé',
  repli.verdict === 'VALIDATION_ACTUELLE' && /repli/.test(repli.source_version) && /migrer vers code_sha/.test(repli.raison || ''));

// ── 6. Le résumé compte ce qu'il dit
const r = resume(classer([...valide, ...aout], v2));
ok('le résumé additionne les verdicts', r.VALIDATION_PERIMEE === 1 && r.NON_RATTACHABLE === 2 && !r.VALIDATION_ACTUELLE,
  JSON.stringify(r));

// ── 7. Importer le module ne doit RIEN écrire. Le 2026-09-25, l'import déclenchait la génération
// du fichier de versions : le démon de sauvegarde committait alors, à chaque exécution des tests,
// une version dont seuls la date et le commit changeaient.
// La mesure se fait dans un PROCESSUS SÉPARÉ : en ESM les imports sont évalués avant le corps du
// module, donc un « avant » lu ici arriverait déjà après l'effet de bord. Première version de ce
// contrôle : fausse pour cette raison exacte.
const genere = joindre(ROOT_DEPOT, 'assets/recette-versions.json');
const avantImport = existsSync(genere) ? readFileSync(genere, 'utf8') : null;
execFileSync(process.execPath, ['-e', "import('" + joindre(ROOT_DEPOT, 'scripts/release/versions-recette.mjs') + "')"], { stdio: 'ignore' });
const apresImport = existsSync(genere) ? readFileSync(genere, 'utf8') : null;
ok('importer le générateur n’écrit pas sur le disque (il expose des fonctions, il n’agit pas)',
  avantImport === apresImport,
  'assets/recette-versions.json a été réécrit par le simple fait d’importer le module');

rmSync(bac, { recursive: true, force: true });
console.log(`\nRÉSULTAT FRAÎCHEUR VALIDATIONS : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
