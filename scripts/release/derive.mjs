#!/usr/bin/env node
/**
 * Alerte de dérive recette → production (instruction CHATGPT-2026-09-24-RELEASE-CATCHUP-V1).
 *
 * Pourquoi ce contrôle existe : au 24 septembre 2026, `recette` avait 446 commits fonctionnels
 * d'avance sur `main`, depuis une base du 8 août. À cette distance, plus rien ne se transplante
 * proprement — mesuré : 47 conflits pour un seul correctif de données structurées. La dérive ne se
 * rattrape pas, elle s'évite.
 *
 * Trois seuils, et une alerte dès que l'un est franchi :
 *   · plus de 30 commits FONCTIONNELS d'avance (les sauvegardes automatiques et les rapports
 *     nightly [skip ci] ne comptent pas : ils ne livrent rien) ;
 *   · plus de 7 jours depuis la dernière release contenant des éléments prêts ;
 *   · plus de 10 éléments READY_FOR_RELEASE sans branche de release ouverte.
 *
 * Ce script n'AGIT jamais : il mesure et il alerte. Aucun déploiement n'est automatique.
 *
 *   node scripts/release/derive.mjs            rapport lisible
 *   node scripts/release/derive.mjs --strict   code de sortie exploitable :
 *       0 = aucun seuil franchi
 *       1 = seuil franchi  → le garde-fou de WIP refuse d'ouvrir un nouveau gros lot
 *       3 = mesure impossible (référence main absente en local) → on avertit, on ne bloque pas :
 *           une référence manquante n'est pas une dérive prouvée, et bloquer sur un « je ne sais
 *           pas » empêcherait de travailler hors ligne.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STRICT = process.argv.includes('--strict');

export const SEUILS = { commits: 30, jours: 7, prets: 10 };

// Un commit « fonctionnel » livre quelque chose. Les sauvegardes du démon et les rapports d'audit
// nocturnes n'en sont pas : les compter ferait crier l'alerte sans qu'aucun travail n'attende.
export function estFonctionnel(sujet) {
  return !/^chore\(auto\):|^Auto-push |\[skip ci\]|^chore\(audits\):|^Merge (pull request|branch)/.test(sujet);
}

const git = (cmd, defaut = '') => {
  try { return execSync('git ' + cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return defaut; }
};

// `main` n'est pas toujours présent en local : on prend la référence la plus fiable disponible.
const refMain = ['refs/remotes/audit/main', 'refs/remotes/origin/main', 'refs/heads/main']
  .find((r) => git(`rev-parse --verify --quiet ${r}`)) || null;

const alertes = [];
const mesures = {};

if (!refMain) {
  mesures.base = 'référence main introuvable en local';
  alertes.push('Impossible de mesurer la dérive : aucune référence vers main (git fetch … main).');
} else {
  const sujets = git(`log --format=%s ${refMain}..HEAD`).split('\n').filter(Boolean);
  const fonctionnels = sujets.filter(estFonctionnel);
  mesures.commitsTotal = sujets.length;
  mesures.commitsFonctionnels = fonctionnels.length;
  mesures.base = git(`merge-base ${refMain} HEAD`).slice(0, 9);
  mesures.baseDate = git(`log -1 --format=%ad --date=short ${mesures.base}`);
  if (fonctionnels.length > SEUILS.commits) {
    alertes.push(`${fonctionnels.length} commits fonctionnels d'avance sur main (seuil : ${SEUILS.commits}). Base commune : ${mesures.baseDate}.`);
  }
}

const fichierRelease = join(ROOT, 'docs/release/CURRENT-RELEASE.json');
if (!existsSync(fichierRelease)) {
  alertes.push('docs/release/CURRENT-RELEASE.json manquant : aucune source de vérité de livraison.');
} else {
  const rel = JSON.parse(readFileSync(fichierRelease, 'utf8'));
  mesures.releaseActive = rel.release_branch || 'aucune';
  const prets = (rel.elements || []).filter((e) => e.etat === 'READY_FOR_RELEASE');
  mesures.pretsSansRelease = rel.release_branch ? 0 : prets.length;
  if (!rel.release_branch && prets.length > SEUILS.prets) {
    alertes.push(`${prets.length} éléments READY_FOR_RELEASE sans branche de release ouverte (seuil : ${SEUILS.prets}).`);
  }
  const derniere = (rel.derniere_release_prod || {}).date;
  mesures.derniereRelease = derniere || 'jamais';
  if (prets.length > 0) {
    const jours = derniere ? Math.floor((Date.now() - Date.parse(derniere)) / 86400000) : null;
    mesures.joursDepuisRelease = jours === null ? '—' : jours;
    if (jours === null || jours > SEUILS.jours) {
      alertes.push(`Des éléments sont prêts et la dernière release remonte à ${derniere || 'jamais'} (seuil : ${SEUILS.jours} jours).`);
    }
  }
}

console.log('\nDÉRIVE RECETTE → PRODUCTION\n');
for (const [k, v] of Object.entries(mesures)) console.log('  ' + k.padEnd(24) + v);
console.log('');
if (!alertes.length) {
  console.log('  ✅ aucun seuil franchi');
} else {
  console.log(`  🚨 ${alertes.length} alerte(s) de pilotage :`);
  alertes.forEach((a) => console.log('     · ' + a));
  console.log('');
  console.log('  Que faire : préparer une release depuis main avec les seuls éléments READY_100,');
  console.log('  et ne pas ouvrir de nouveau gros lot avant. Aucun déploiement automatique.');
}
console.log('');
if (STRICT) {
  // Une alerte « je n'ai pas pu mesurer » ne vaut pas une dérive constatée : elle a son propre code.
  const bloquantes = alertes.filter((a) => !/^Impossible de mesurer/.test(a));
  if (bloquantes.length) process.exit(1);
  if (alertes.length) process.exit(3);
}
