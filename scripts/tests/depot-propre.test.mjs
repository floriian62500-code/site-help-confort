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
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✅ ' + l); } else { fail++; console.log('  ❌ ' + l); if (d) console.log('     ' + d); } };

// « nom 2.ext », « nom 3.ext »… : la forme que prend une copie de conflit sur macOS/iCloud.
const COPIE = / \d+(\.[^.]+)?\/?$/;

function parcourir(dir, acc = []) {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const rel = dir ? dir + '/' + e.name : e.name;
    // Un DOSSIER de conflit (« _shared/templates 2 ») échappait au contrôle : le motif exigeait une
    // extension, et `.gitignore` un point. Git ne suit pas les dossiers vides, donc rien ne le
    // signalait — trouvé le 2026-09-26, six jours après le nettoyage des fichiers.
    if (e.isDirectory()) { if (DOSSIER_COPIE.test(e.name)) acc.push(rel + '/'); parcourir(rel, acc); }
    else acc.push(rel);
  }
  return acc;
}
const DOSSIER_COPIE = / \d+$/;

console.log('\nHYGIÈNE DU DÉPÔT\n');

const tous = parcourir('');
const copies = tous.filter((f) => COPIE.test(f));
ok(`aucune copie de conflit sur le disque (${tous.length} fichiers parcourus)`, copies.length === 0,
  copies.slice(0, 8).join('\n     ') + (copies.length > 8 ? `\n     … et ${copies.length - 8} autres` : ''));

// -z : git cite les chemins accentués entre guillemets sans cette option, et le guillemet se
// retrouve dans le nom du dossier au moment de découper (constaté ici même).
const suivis = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0').filter(Boolean);
const copiesSuivies = suivis.filter((f) => COPIE.test(f));
ok('aucune copie de conflit suivie par git', copiesSuivies.length === 0, copiesSuivies.slice(0, 8).join(', '));

// Un second fichier de workflow serait exécuté par GitHub comme un vrai : c'est le cas le plus cher.
const workflows = suivis.filter((f) => f.startsWith('.github/workflows/'));
ok(`les workflows sont uniques et nommés proprement (${workflows.length})`,
  workflows.every((f) => !COPIE.test(f)), workflows.filter((f) => COPIE.test(f)).join(', '));

// La règle doit exister dans .gitignore, sinon la prochaine synchro les ramène.
const ignore = execFileSync('git', ['check-ignore', '-q', 'exemple 2.html'], { cwd: ROOT }).status;
ok('.gitignore écarte les copies de conflit (le disque en recrée tout seul)', ignore === undefined || ignore === 0);


// ── Secrets : aucune valeur de jeton ou de clé privée ne doit être suivie par git.
// On distingue ce qui EST un secret de ce qui n'en est pas : la clé publiable Supabase et la clé
// anon d'un site statique sont faites pour être servies au navigateur — les signaler chaque jour
// finirait par faire ignorer l'alerte le jour où elle est vraie.
// Longueurs : une vraie clé Stripe dépasse 24 caractères après son préfixe ; les fixtures de
// test (« rk_live_restreinte », « ghp_navigateur ») restent en dessous. Le seuil sépare les deux
// sans affaiblir la détection — vérifié contre une clé de forme réelle.
const MOTIFS = [
  [/ghp_[A-Za-z0-9]{20,}/, 'jeton GitHub'],
  [/github_pat_[A-Za-z0-9_]{20,}/, 'jeton GitHub (nouveau format)'],
  [/sk_live_[A-Za-z0-9]{24,}/, 'clé secrète Stripe LIVE'],
  [/sk_test_[A-Za-z0-9]{24,}/, 'clé secrète Stripe TEST'],
  [/rk_live_[A-Za-z0-9]{24,}/, 'clé restreinte Stripe LIVE'],
  [/whsec_[A-Za-z0-9]{24,}/, 'secret de webhook Stripe'],
  // Le marqueur seul ne prouve rien : trois pages d'admin l'emploient comme littéral pour
  // découper un PEM collé par l'utilisateur. On exige donc un vrai corps encodé derrière.
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\\n"']{0,6}[A-Za-z0-9+/=]{40,}/, 'clé privée'],
  [/SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"][A-Za-z0-9._-]{20,}/, 'clé service_role en dur'],
];
const TEXTE = /\.(html|js|mjs|cjs|ts|tsx|json|md|py|sh|ya?ml|toml|txt|sql)$/i;
const trouvailles = [];
for (const f of suivis.filter((x) => TEXTE.test(x))) {
  let c; try { c = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
  for (const [re, quoi] of MOTIFS) {
    const m = c.match(re);
    // Un motif cité dans un test ou une documentation de règle n'est pas une fuite : on exige que
    // la valeur ressemble à une vraie (longueur), et on exclut ce fichier-ci qui les énumère.
    if (m && f !== 'scripts/tests/depot-propre.test.mjs') trouvailles.push(`${f} : ${quoi} (${m[0].slice(0, 8)}…)`);
  }
}
ok(`aucun secret en clair dans les ${suivis.length} fichiers suivis`, trouvailles.length === 0, trouvailles.slice(0, 5).join('\n     '));

// ── Rien ne doit salir le dépôt en s'exécutant : ni un test, ni un simple import de script.
// Le 2026-09-25, un module écrivait son fichier généré au seul fait d'être importé ; le démon de
// sauvegarde committait ce bruit à chaque exécution des tests.
// Les sondes s'exécutent dans une COPIE JETABLE du dépôt, jamais ici. Avant le 2026-10-07, cette
// garde jouait chaque module et chaque suite dans l'arbre de travail et ne restaurait rien : la
// faire tourner laissait 111 pages de la racine modifiées, et réécrivait 6 pages de `admin-pro/`
// en cassant des sélecteurs CSS composés. La garde qui cherche ce qui salit le dépôt le salissait.
// La copie part de HEAD : une modification non committée n'est pas vue par les sondes, et c'est
// voulu — on teste ce que le dépôt contient, pas l'état de la table de travail.
const modules = suivis.filter((f) => /^scripts\/.*\.mjs$/.test(f) && !/\.test\.mjs$/.test(f));
const tests = suivis.filter((f) => /^scripts\/tests\/.*\.test\.mjs$/.test(f) && !f.endsWith('depot-propre.test.mjs'));
const ecrivains = [], salissants = [];
let sondeImpossible = null;
const bac = mkdtempSync(join(tmpdir(), 'hc-depot-propre-'));
const SONDE = join(bac, 'copie');
try {
  execFileSync('git', ['worktree', 'add', '--detach', '--quiet', SONDE, 'HEAD'], { cwd: ROOT, stdio: 'ignore' });
  const etat = () => execFileSync('git', ['status', '--porcelain'], { cwd: SONDE, encoding: 'utf8', maxBuffer: 1 << 26 });
  // La copie est jetable : on la remet d'aplomb après chaque sonde, donc on liste TOUS les
  // fautifs au lieu de s'arrêter au premier.
  const remettre = () => {
    execFileSync('git', ['checkout', '--quiet', '--', '.'], { cwd: SONDE, stdio: 'ignore' });
    execFileSync('git', ['clean', '-qfd'], { cwd: SONDE, stdio: 'ignore' });
  };
  const propre = etat();
  for (const m of modules) {
    try { execFileSync(process.execPath, ['-e', `import(${JSON.stringify(join(SONDE, m))}).catch(() => {})`], { cwd: SONDE, stdio: 'ignore', timeout: 20000 }); }
    catch { /* un module qui refuse de s'importer n'écrit rien : ce n'est pas le sujet ici */ }
    if (etat() !== propre) { ecrivains.push(m); remettre(); }
  }
  for (const t of tests) {
    try { execFileSync(process.execPath, [join(SONDE, t)], { cwd: SONDE, stdio: 'ignore', timeout: 60000 }); }
    catch { /* un test rouge reste un test propre */ }
    if (etat() !== propre) { salissants.push(t); remettre(); }
  }
} catch (e) {
  sondeImpossible = String(e && e.message || e).split('\n')[0].slice(0, 120);
} finally {
  try { execFileSync('git', ['worktree', 'remove', '--force', SONDE], { cwd: ROOT, stdio: 'ignore' }); } catch { /* deja parti */ }
  rmSync(bac, { recursive: true, force: true });
}

ok(`importer un script ne modifie aucun fichier du dépôt (${modules.length} modules)`,
  !sondeImpossible && ecrivains.length === 0, sondeImpossible ? 'sonde impossible : ' + sondeImpossible : ecrivains.join(', ') + ' écrit au simple import');
ok(`aucun test n’écrit dans le dépôt (${tests.length} fichiers joués)`,
  !sondeImpossible && salissants.length === 0, sondeImpossible ? 'sonde impossible : ' + sondeImpossible : salissants.join(', '));


// ── Ce qui est interne ne doit pas être servi.
// Le site est publié depuis la RACINE du dépôt (`publish = "."`) : tout fichier suivi part chez
// Netlify. Le `ignore` de netlify.toml ne protège rien — il décide seulement s'il faut
// reconstruire. Le seul blocage réel est une règle de `_redirects` terminée par « ! », qui passe
// devant le fichier statique. Audit du 2026-09-25 : `tools/`, `logs/`, `.github/` et les notes de
// travail de la racine étaient servis.
const redirects = readFileSync(join(ROOT, '_redirects'), 'utf8');
const bloque = (chemin) => new RegExp('^' + chemin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '\\*') + '\\s+\\S+\\s+404!', 'm').test(redirects);
// `/admin/*` ne doit PAS etre bloque : c'est le back-office Decap, lie depuis actualites.html et
// realisations.html (« Connectez-vous au back-office »), et il lit son propre config.yml au
// chargement. Le bloquer retirerait l'interface d'edition. Il reste hors des moteurs par robots.txt.
const INTERNES = ['/docs/*', '/scripts/*', '/supabase/*', '/partials/*', '/tools/*', '/logs/*',
                  '/.github/*', '/.autopush/*', '/secrets/*',
                  '/admin-pro/audits/*', '/admin-pro/scripts/*'];
const nonBloques = INTERNES.filter((c) => !bloque(c));
ok(`les dossiers internes sont tous bloqués (${INTERNES.length} surveillés)`, nonBloques.length === 0, nonBloques.join(', '));

// Un dossier interne apparu depuis doit se faire remarquer : on compare ce qui existe à la liste.
const SERVIS_LEGITIMES = new Set(['actualites', 'assets', 'content', 'data', 'emploi', 'guides', 'images',
  'og', 'prestations', 'realisations', 'videos', 'admin-pro', '.well-known']);
const dossiers = [...new Set(suivis.filter((f) => f.includes('/')).map((f) => f.split('/')[0]))];
const inconnus = dossiers.filter((d) => !SERVIS_LEGITIMES.has(d) && !bloque('/' + d + '/*'));
ok('aucun dossier suivi n’échappe à la fois à la liste des dossiers publics et aux règles de blocage',
  inconnus.length === 0, inconnus.join(', '));

// Les notes de travail de la racine : elles décrivent l'architecture et les incidents.
const NOTES = ['/CLAUDE.md', '/POUR-FLORIAN.md', '/BUGS-HISTORY.md', '/TODO.md', '/ALERTES.md'];
const notesServies = NOTES.filter((c) => !bloque(c));
ok('les notes de travail de la racine ne sont pas servies', notesServies.length === 0, notesServies.join(', '));

console.log(`\nRÉSULTAT DÉPÔT PROPRE : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
