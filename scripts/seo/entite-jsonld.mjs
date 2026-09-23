#!/usr/bin/env node
/**
 * Entité « établissement » dans les données structurées — source unique (directive 5800544498 §3.A).
 *
 * Le problème, mesuré le 2026-09-23 : une même page décrivait l'agence dans plusieurs nœuds JSON-LD
 * — celui imbriqué dans `Service.provider`, l'entité principale de la page, parfois un troisième
 * plus maigre. Sans identifiant commun, un moteur pouvait y lire plusieurs établissements.
 *
 * J'ai d'abord donné le même `@id` à ces nœuds. Mauvaise idée telle quelle : ils portaient les
 * mêmes faits écrits différemment (« HELP Confort » contre « HELP Confort Saint-Omer », une adresse
 * avec `addressRegion` et l'autre sans). Partager un identifiant SANS accorder les valeurs, c'est
 * remplacer un éclatement par une contradiction. Sur 32 pages, c'est ce que j'avais créé.
 *
 * Ce script fait les deux choses, et il est la SOURCE de cette règle — on ne l'applique plus à la
 * main, page par page :
 *   1. les nœuds établissement d'une page partagent l'identifiant de la page ;
 *   2. ils portent exactement les mêmes valeurs, alignées sur la description la plus complète.
 *      Aucun champ n'est supprimé : un nœud ne peut que gagner de l'information.
 *
 * Ce qu'il NE fait PAS : donner une identité unique à tout le site. Les pages ne s'accordent pas
 * encore sur le nom, l'URL, l'email, le logo ni la note (6 noms différents relevés) : il faudrait
 * d'abord normaliser ce contenu, et c'est une décision, pas un nettoyage.
 *
 *   node scripts/seo/entite-jsonld.mjs            applique
 *   node scripts/seo/entite-jsonld.mjs --check    ne modifie rien, sort 1 s'il reste du travail
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHECK = process.argv.includes('--check');

export const ETABLISSEMENT = new Set([
  'LocalBusiness', 'HomeAndConstructionBusiness', 'Plumber', 'HVACBusiness',
  'Electrician', 'Locksmith', 'GeneralContractor', 'RoofingContractor',
]);

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...['prestations', 'actualites', 'realisations', 'emploi'].filter((d) => existsSync(join(ROOT, d)))
     .flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.html')).map((f) => d + '/' + f)),
];

const estEtablissement = (o) => o && typeof o === 'object' && !Array.isArray(o) && ETABLISSEMENT.has(String(o['@type']));

function parcourir(o, fn) {
  if (Array.isArray(o)) { o.forEach((x) => parcourir(x, fn)); return; }
  if (o && typeof o === 'object') { fn(o); Object.values(o).forEach((v) => parcourir(v, fn)); }
}

// « Plus complet » : d'abord le nombre de champs, puis la taille écrite. Départage stable.
const poids = (v) => (v && typeof v === 'object' ? Object.keys(v).length * 1000 : 0) + JSON.stringify(v ?? '').length;

let modifiees = 0, idAjoutes = 0, champsAlignes = 0;
const restant = [];

for (const p of pages) {
  const chemin = join(ROOT, p);
  let html = readFileSync(chemin, 'utf8');
  const blocs = [...html.matchAll(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g)];
  if (!blocs.length) continue;

  const docs = [];
  for (const m of blocs) {
    try { docs.push({ m, d: JSON.parse(m[2]) }); } catch { docs.push(null); }
  }

  // 1. l'identifiant de la page = celui que porte déjà une entité complète
  let ident = null;
  for (const e of docs) if (e) parcourir(e.d, (o) => { if (!ident && estEtablissement(o) && o['@id']) ident = o['@id']; });
  if (!ident) continue;   // page sans identité déclarée : on n'en invente pas

  // 2. description de référence : union des champs, en gardant la valeur la plus complète
  const reference = {};
  for (const e of docs) if (e) parcourir(e.d, (o) => {
    if (!estEtablissement(o)) return;
    if (o['@id'] && o['@id'] !== ident) return;           // une autre entité : on n'y touche pas
    for (const [k, v] of Object.entries(o)) {
      if (k === '@id' || k === '@type' || k === '@context') continue;
      if (!(k in reference) || poids(v) > poids(reference[k])) reference[k] = v;
    }
  });

  // 3. application
  let change = false;
  for (const e of docs) if (e) parcourir(e.d, (o) => {
    if (!estEtablissement(o)) return;
    if (o['@id'] && o['@id'] !== ident) return;
    if (!o['@id']) { o['@id'] = ident; idAjoutes++; change = true; }
    for (const [k, v] of Object.entries(reference)) {
      if (JSON.stringify(o[k]) !== JSON.stringify(v)) { o[k] = v; champsAlignes++; change = true; }
    }
  });

  if (!change) continue;
  if (CHECK) { restant.push(p); continue; }

  let out = html;
  for (let i = docs.length - 1; i >= 0; i--) {
    const e = docs[i];
    if (!e) continue;
    out = out.slice(0, e.m.index + e.m[1].length) + JSON.stringify(e.d, null, 1) + out.slice(e.m.index + e.m[1].length + e.m[2].length);
  }
  writeFileSync(chemin, out);
  modifiees++;
}

if (CHECK) {
  if (restant.length) {
    console.log(`❌ ${restant.length} page(s) où l'entité n'est pas alignée : ${restant.slice(0, 6).join(', ')}${restant.length > 6 ? '…' : ''}`);
    console.log('   → node scripts/seo/entite-jsonld.mjs');
    process.exit(1);
  }
  console.log('✅ entité JSON-LD alignée sur toutes les pages (identifiant commun, mêmes valeurs)');
} else {
  console.log(`entité JSON-LD : ${modifiees} page(s) mise(s) à jour · ${idAjoutes} identifiant(s) ajouté(s) · ${champsAlignes} champ(s) aligné(s)`);
}
