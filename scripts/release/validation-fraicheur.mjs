#!/usr/bin/env node
/**
 * Une validation est-elle encore valable ? (CHATGPT-2026-09-25-CONTROL-3 §5)
 *
 * Règle, volontairement brutale : une validation ne vaut que pour l'état du code qu'elle a vu.
 * On compare la version enregistrée au moment du clic à la version actuelle de l'élément
 * (empreinte du contenu de ses fichiers, cf. versions-recette.mjs) :
 *
 *   VALIDATION_ACTUELLE  les deux versions correspondent — et le statut était « ok » ;
 *   VALIDATION_PERIMEE   le code a changé depuis ; il faut revalider, personne n'a à en juger ;
 *   REFUS_OUVERT         le statut était « à corriger » : ni périmé ni acquis, c'est un travail dû ;
 *   NON_RATTACHABLE      l'élément n'existe plus, ou la validation ne porte aucune version.
 *
 * Le dernier cas est celui des neuf validations d'août : la table ne stocke ni SHA ni empreinte,
 * seulement un « recette_version » tenu à la main qui n'a jamais bougé. Elles ne peuvent donc pas
 * être rattachées à un état du code — et c'est précisément ce que ce mécanisme empêche de répéter.
 *
 *   node scripts/release/validation-fraicheur.mjs <export.json>
 *
 * Lit des fichiers. N'écrit rien, n'appelle aucune base, ne touche pas la production.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param validations [{ feature_id, statut, version, date, acteur }]
 * @param versionsActuelles { <feature_id>: { version } }
 */
export function classer(validations, versionsActuelles) {
  return validations.map((v) => {
    const actuelle = (versionsActuelles[v.feature_id] || {}).version || null;
    const base = { ...v, version_actuelle: actuelle };
    if (v.statut === 'a_corriger') return { ...base, verdict: 'REFUS_OUVERT' };
    if (!actuelle) return { ...base, verdict: 'NON_RATTACHABLE', raison: 'élément inconnu ou sans fichier' };
    if (!v.version) return { ...base, verdict: 'NON_RATTACHABLE', raison: 'validation sans version du code' };
    if (v.version !== actuelle) return { ...base, verdict: 'VALIDATION_PERIMEE', raison: 'le code a changé depuis' };
    return { ...base, verdict: 'VALIDATION_ACTUELLE' };
  });
}

export const resume = (classees) =>
  classees.reduce((acc, c) => { acc[c.verdict] = (acc[c.verdict] || 0) + 1; return acc; }, {});

if (process.argv[1] && process.argv[1].endsWith('validation-fraicheur.mjs')) {
  const fichier = process.argv[2];
  if (!fichier || !existsSync(fichier)) {
    console.log('usage : node scripts/release/validation-fraicheur.mjs <export.json>');
    console.log('        (export lecture seule de recette_validation : feature_id, statut, version, date)');
    process.exit(2);
  }
  const versions = JSON.parse(readFileSync(join(ROOT, 'assets/recette-versions.json'), 'utf8')).elements;
  const classees = classer(JSON.parse(readFileSync(fichier, 'utf8')), versions);
  const r = resume(classees);
  console.log('\nFRAÎCHEUR DES VALIDATIONS\n');
  for (const c of classees) {
    console.log(`  ${c.verdict.padEnd(20)} ${String(c.feature_id).padEnd(22)} ${c.date || ''}  ${c.raison || ''}`);
  }
  console.log('\n  ' + Object.entries(r).map(([k, n]) => `${k} : ${n}`).join(' · ') + '\n');
  process.exit((r.VALIDATION_ACTUELLE || 0) === classees.length ? 0 : 1);
}
