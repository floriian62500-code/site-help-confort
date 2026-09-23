#!/usr/bin/env node
/**
 * Prix publics : ce que le site affiche doit exister au catalogue.
 *
 * Trouvé le 2026-09-23 en auditant la campagne entretien : l'article de blog annonçait
 * « 3 formules de 12,90 €/mois à 29,90 €/mois », une formule « Essentiel HC » et des fourchettes
 * (« 120 € à 180 € ») qui n'existent nulle part au catalogue. Le prix d'entrée réel est 9,90 €,
 * c'est-à-dire que la page décourageait le client avec un tarif plus cher que la réalité.
 *
 * Ce test compare tout montant mensuel écrit en dur dans une page au relevé du catalogue
 * (data/contrats-tarifs.json). Il ne juge pas les prix : il vérifie qu'aucune page n'en invente.
 *
 *   node scripts/tests/prix-contrats.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + label); }
  else { fail++; console.log('  ❌ ' + label); if (detail) console.log('     ' + detail); }
};

const ref = JSON.parse(readFileSync(join(ROOT, 'data/contrats-tarifs.json'), 'utf8'));
const mensuels = new Set(Object.values(ref.contrats_ttc_mois).map((n) => n.toFixed(2).replace('.', ',')));
const ponctuels = new Set(Object.values(ref.prestations_ponctuelles_ttc).map((n) => n.toFixed(2).replace('.', ',')));
const entiers = new Set([...ponctuels].map((v) => v.split(',')[0]));   // « 121 € » est aussi correct

const pages = [
  ...readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...readdirSync(join(ROOT, 'prestations')).filter((f) => f.endsWith('.html')).map((f) => 'prestations/' + f),
];
// Le JS lit le catalogue à l'exécution : seuls les montants écrits en dur dans le texte comptent.
const texte = (p) => readFileSync(join(ROOT, p), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');

console.log('\nPRIX PUBLICS — aucune page n’invente un tarif\n');

ok(`relevé du catalogue daté (${ref._releve_le}) et non vide`,
  /^\d{4}-\d{2}-\d{2}$/.test(ref._releve_le) && mensuels.size > 0 && ponctuels.size > 0);

// ── 1. Montants mensuels : chacun doit exister au catalogue
const fautifs = [];
for (const p of pages) {
  const s = texte(p);
  for (const m of s.matchAll(/(\d{1,3},\d{2})\s*€(?:\s*TTC)?\s*\/?\s*mois/g)) {
    if (!mensuels.has(m[1])) {
      const ctx = s.slice(Math.max(0, m.index - 70), m.index + 30).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      fautifs.push(`${p} : ${m[1]} € — ${ctx.slice(-80)}`);
    }
  }
}
ok('aucun prix mensuel absent du catalogue', fautifs.length === 0, fautifs.slice(0, 6).join('\n     '));

// ── 2. L'amplitude annoncée doit être celle du catalogue
const amp = ref.amplitude_affichable;
const bornes = [];
for (const p of pages) {
  for (const m of texte(p).matchAll(/(?:de|entre)\s*(\d{1,3},\d{2})\s*€[^.]{0,40}?(?:à|et)\s*(\d{1,3},\d{2})\s*€[^.]{0,20}mois/g)) {
    const min = parseFloat(m[1].replace(',', '.')), max = parseFloat(m[2].replace(',', '.'));
    if (min !== amp.min || max !== amp.max) bornes.push(`${p} : ${m[1]} → ${m[2]} (catalogue : ${amp.min} → ${amp.max})`);
  }
}
ok(`toute amplitude annoncée correspond au catalogue (${amp.min} → ${amp.max} €)`, bornes.length === 0, bornes.join('\n     '));

// ── 3. Prestations ponctuelles : les montants présentés comme LES NÔTRES doivent exister au catalogue.
//     Un prix de marché cité comme tel (« le prix moyen en France se situe entre 100 et 180 € ») est
//     une information éditoriale légitime, pas un tarif HELP Confort : il ne doit pas être signalé.
//     C'est le guide qui me l'a appris — il distingue déjà proprement les deux.
const MARCHE = /en France|prix moyen|en moyenne|selon la région|selon les régions|sur le marché|comptez entre/i;
const ponctuelsFautifs = [];
for (const p of ['entretien-chaudiere.html', 'blog-entretien-chaudiere-annuel-obligatoire.html', 'guide-entretien-chaudiere.html']) {
  const s = texte(p);
  for (const m of s.matchAll(/(\d{2,3}(?:,\d{2})?)\s*€\s*TTC(?!\s*\/?\s*mois)/g)) {
    const v = m[1];
    if (ponctuels.has(v) || entiers.has(v) || mensuels.has(v)) continue;
    const phrase = s.slice(Math.max(0, m.index - 220), m.index + 40).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (MARCHE.test(phrase.split(/[.!?]\s/).pop() || phrase)) continue;   // prix de marché assumé
    ponctuelsFautifs.push(`${p} : ${v} € — ${phrase.trim().slice(-80)}`);
  }
}
ok('aucun prix « à l’intervention » présenté comme le nôtre sans exister au catalogue', ponctuelsFautifs.length === 0,
  ponctuelsFautifs.slice(0, 5).join('\n     '));

// ── 4. Ce qui n'est pas au catalogue ne doit pas avoir de prix
const condensation = pages.filter((p) => /chaudière à condensation\s*:\s*\d+\s*€|condensation[^.]{0,30}\d{2,3}\s*€\s*(?:à|TTC)/i.test(texte(p)));
ok('aucun prix affiché pour une prestation absente du catalogue (ex. « chaudière à condensation »)',
  condensation.length === 0, condensation.join(', '));

// ── 5. Le nom des formules doit être celui du catalogue
const formules = new Set(Object.keys(ref.contrats_ttc_mois).map((s) => s.split('-')[1]?.toUpperCase()).filter(Boolean));
const inventees = [];
for (const p of pages) {
  for (const m of texte(p).matchAll(/formule\s+(?:«\s*)?([A-ZÉÈ][A-Za-zÉÈéèêî]{3,12})/g)) {
    const nom = m[1].toUpperCase();
    if (!formules.has(nom) && !['CHOISIR', 'ADAPTÉE', 'CONTRAT', 'ANNUELLE', 'IDÉALE'].includes(nom)) inventees.push(`${p} : « ${m[1]} »`);
  }
}
ok(`aucune formule de contrat inventée (catalogue : ${[...formules].join(', ')})`, inventees.length === 0,
  inventees.slice(0, 5).join('\n     '));

// ── 6. Cohérence du délai annoncé pour la formule CONFORT (deux pages le citaient différemment)
const delais = new Set();
for (const p of pages) {
  for (const m of texte(p).matchAll(/CONFORT[^.]{0,80}?sous\s*(\d+)\s*h|sous\s*(\d+)\s*h[^.]{0,60}?CONFORT/gi)) {
    delais.add(m[1] || m[2]);
  }
}
ok('le délai annoncé pour la formule CONFORT est le même partout', delais.size <= 1,
  delais.size > 1 ? 'valeurs trouvées : ' + [...delais].join(' h, ') + ' h' : '');

// ── 7. Maillage de la campagne : aucune page n'est un cul-de-sac
const groupe = ['entretien-chaudiere.html', 'contrats-entretien.html', 'prestations/ramonage.html',
                'guide-entretien-chaudiere.html', 'blog-entretien-chaudiere-annuel-obligatoire.html'];
const editorial = (p) => texte(p).replace(/<header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*?<\/footer>/g, '');
const culsDeSac = groupe.filter((p) => {
  const c = editorial(p);
  return groupe.filter((q) => q !== p && new RegExp('href="[^"]*' + q.replace('.html', '').replace('/', '\\/') + '(\\.html)?[#"]').test(c)).length < 2;
});
ok('chaque page de la campagne entretien renvoie vers au moins 2 autres (hors en-tête et pied de page)',
  culsDeSac.length === 0, culsDeSac.join(', '));

console.log(`\nRÉSULTAT PRIX PUBLICS : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
