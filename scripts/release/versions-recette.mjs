#!/usr/bin/env node
/**
 * Version d'un élément validable, DÉRIVÉE DU CODE (CHATGPT-2026-09-25-CONTROL-3 §5).
 *
 * Le problème, mesuré le 2026-09-25 : la console de recette porte un champ `v:'1'` tenu à la main.
 * Personne ne l'a bougé depuis le 11 août ; les neuf validations de Florian paraissaient donc
 * toujours valables, six semaines et 87 commits plus tard. Une validation qui ne se périme jamais
 * n'est pas une validation, c'est un souvenir.
 *
 * Ici, la version d'un élément est l'empreinte du CONTENU des fichiers qui le composent
 * (docs/release/FEATURES.json). Un caractère change dans la page jugée → la version change → la
 * validation stockée ne correspond plus, et le dit d'elle-même. Aucune discipline humaine n'est
 * requise, c'est précisément l'intérêt.
 *
 *   node scripts/release/versions-recette.mjs            écrit assets/recette-versions.json
 *   node scripts/release/versions-recette.mjs --check    ne modifie rien, sort 1 si le fichier a dérivé
 *   node scripts/release/versions-recette.mjs --json     imprime le résultat sans rien écrire
 *
 * Écrit uniquement dans le dépôt. Ne touche ni la base, ni la production.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SORTIE = 'assets/recette-versions.json';
const CHECK = process.argv.includes('--check');
const JSON_SEUL = process.argv.includes('--json');

export function empreinte(contenus) {
  const h = createHash('sha256');
  for (const c of contenus) h.update(c, 'utf8').update('\u0000');
  return h.digest('hex').slice(0, 12);
}

export function versions(racine = ROOT, features = null) {
  const f = features || JSON.parse(readFileSync(join(racine, 'docs/release/FEATURES.json'), 'utf8'));
  const out = {};
  for (const [id, e] of Object.entries(f.elements || {})) {
    const fichiers = e.fichiers || [];
    // Un élément sans fichier connu ne peut pas être versionné : on le dit, on ne l'invente pas.
    if (!fichiers.length) { out[id] = { version: null, raison: 'aucun fichier déclaré' }; continue; }
    const manquants = fichiers.filter((p) => !existsSync(join(racine, p)));
    if (manquants.length) { out[id] = { version: null, raison: 'fichier absent : ' + manquants.join(', ') }; continue; }
    out[id] = { version: empreinte(fichiers.map((p) => readFileSync(join(racine, p), 'utf8'))), fichiers };
  }
  return out;
}

// Ce fichier est aussi importé par les tests : sans cette garde, un simple `import` déclencherait
// l'écriture du fichier généré — c'est exactement ce qui est arrivé le 2026-09-25, le démon de
// sauvegarde committant à chaque exécution des tests une version dont seuls la date et le commit
// changeaient. Un module qui écrit sur disque au seul fait d'être importé est un piège.
const LANCE_DIRECTEMENT = !!process.argv[1] && process.argv[1].endsWith('versions-recette.mjs');

const sha = (() => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim().slice(0, 12); }
  catch { return null; }
})();

if (!LANCE_DIRECTEMENT) { /* importé : on n'expose que les fonctions, on n'écrit rien */ }
else {
const doc = { _lisezmoi: 'Généré par scripts/release/versions-recette.mjs — ne pas éditer à la main.', code_sha: sha, genere_le: new Date().toISOString(), elements: versions() };

if (JSON_SEUL) { console.log(JSON.stringify(doc, null, 1)); process.exit(0); }

const chemin = join(ROOT, SORTIE);
const avant = existsSync(chemin) ? JSON.parse(readFileSync(chemin, 'utf8')) : null;
const memesVersions = avant && JSON.stringify(avant.elements) === JSON.stringify(doc.elements);

if (CHECK) {
  if (!avant) { console.log(`❌ ${SORTIE} absent — lancer : node scripts/release/versions-recette.mjs`); process.exit(1); }
  if (!memesVersions) {
    const bouges = Object.keys(doc.elements).filter((k) => JSON.stringify((avant.elements || {})[k]) !== JSON.stringify(doc.elements[k]));
    console.log(`❌ ${bouges.length} élément(s) dont le code a changé depuis la dernière génération : ${bouges.join(', ')}`);
    console.log('   → node scripts/release/versions-recette.mjs  (et toute validation portant l’ancienne version devient périmée)');
    process.exit(1);
  }
  console.log('✅ versions des éléments à jour');
  process.exit(0);
}

writeFileSync(chemin, JSON.stringify(doc, null, 1) + '\n');
const sansVersion = Object.entries(doc.elements).filter(([, v]) => !v.version);
console.log(`versions écrites dans ${SORTIE} · ${Object.keys(doc.elements).length} élément(s)` +
  (sansVersion.length ? ` · ${sansVersion.length} sans version (${sansVersion.map(([k]) => k).join(', ')})` : ''));
}
