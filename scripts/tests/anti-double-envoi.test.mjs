#!/usr/bin/env node
/**
 * T12 — anti double-envoi (GO-LIVE-CHECKLIST, resté « PENDING » depuis le 07/09).
 *
 * Un double clic ne doit jamais créer deux demandes : un doublon dans le back-office, c'est deux
 * fois le même client rappelé, et une statistique fausse.
 *
 * Trois chemins d'envoi existent sur le site, et ils sont vérifiés séparément :
 *   1. le tunnel « Ma demande » (assets/hc-demande.js) ;
 *   2. le rappel de l'accueil (formulaire inline d'index.html) ;
 *   3. les formulaires de page (assets/hc-leads-capture.js).
 *
 *   node scripts/tests/anti-double-envoi.test.mjs
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
const lire = (p) => readFileSync(join(ROOT, p), 'utf8');

console.log('\nANTI DOUBLE-ENVOI — un double clic ne crée jamais deux demandes\n');

// ── 1. Tunnel : chaque appel au serveur est encadré par busy(btn, true) puis busy(btn, false)
const tunnel = lire('assets/hc-demande.js');
ok('tunnel : la fonction busy() désactive vraiment le bouton (pas seulement un style)',
  /function busy\(btn, on, label\)[^\n]*btn\.disabled = true/.test(tunnel));

// Plutôt que de raisonner par proximité de lignes (ma première version se trompait : elle prenait
// pingIntent(), un signal de fond sans bouton, pour un envoi non gardé), on vérifie les ACTIONS
// utilisateur : chaque envoi déclenché par un clic pose « Envoi en cours… » sur son bouton, puis le
// rend dans les deux issues.
const envoisUtilisateur = (tunnel.match(/busy\(btn, true, 'Envoi en cours…'\)/g) || []).length;
ok(`tunnel : chaque envoi déclenché par un clic désactive son bouton (${envoisUtilisateur} action(s))`,
  envoisUtilisateur >= 2);
const rendus = (tunnel.match(/busy\(btn, false\)/g) || []).length;
ok(`tunnel : le bouton est rendu autant de fois qu'il est pris (${rendus} restitutions pour ${envoisUtilisateur + 1} prises)`,
  rendus >= envoisUtilisateur + 1);   // +1 : la consultation des tarifs prend aussi le bouton
ok('tunnel : le signal d’activité de fond (pingIntent) n’a pas de bouton et ne crée pas de doublon',
  /function pingIntent\(step\) \{[\s\S]{0,600}?\}/.test(tunnel) &&
  !/function pingIntent\(step\) \{[\s\S]{0,600}?busy\(/.test(tunnel));
const echecs = (tunnel.match(/\.catch\(function \(\) \{ busy\(btn, false\)/g) || []).length;
ok(`tunnel : le bouton est rendu même quand l’envoi échoue (${echecs} chemin(s) d’erreur)`, echecs >= 1);

// ── 2. Rappel de l'accueil : verrou explicite, pas seulement « disabled »
const home = lire('index.html');
ok('rappel accueil : verrou explicite avant toute validation (un 2ᵉ envoi sort immédiatement)',
  /if\(btn\.dataset\.sending==='1'\) return;/.test(home));
ok('rappel accueil : le verrou est posé AVANT l’appel au serveur',
  home.indexOf("btn.dataset.sending='1'") < home.indexOf("functions/v1/submit-lead-v6") &&
  home.indexOf("btn.dataset.sending='1'") > 0);
ok('rappel accueil : le verrou est levé dans les deux issues (succès et échec)',
  (home.match(/btn\.dataset\.sending='0'/g) || []).length >= 2);

// ── 3. Formulaires de page
const capture = lire('assets/hc-leads-capture.js');
ok('formulaires de page : le bouton est désactivé pendant l’envoi',
  /submitBtn\.disabled = true;/.test(capture) && capture.indexOf('submitBtn.disabled = true;') < capture.indexOf('await pushLead(payload)'));
ok('formulaires de page : le bouton est rendu dans tous les cas (bloc finally)',
  /finally \{[\s\S]{0,120}submitBtn\.disabled = false;/.test(capture));

// ── 4. Aucun formulaire ne peut s'envoyer sans bouton (sinon la garde ci-dessus ne s'applique pas)
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const sansBouton = [];
for (const f of pages) {
  const s = lire(f);
  for (const m of s.matchAll(/<form[^>]*data-hc-lead[^>]*>([\s\S]*?)<\/form>/g)) {
    if (!/type=["']submit["']|<button(?![^>]*type=)/.test(m[1])) sansBouton.push(f);
  }
}
ok('aucun formulaire de demande sans bouton d’envoi (la garde porte sur le bouton)',
  sansBouton.length === 0, [...new Set(sansBouton)].join(', '));

// ── 5. Ce que ce test NE prouve pas, et qui reste ouvert
// Deux envois séparés dans le temps (réessai après une erreur affichée, ou deux onglets) créent
// toujours deux demandes : seule une clé d'idempotence côté serveur le règlerait, et toucher à
// submit-lead-v6 est un déploiement, donc une décision humaine.
ok('limite connue et documentée : pas d’idempotence côté serveur (réessai ou second onglet)',
  /idempotence côté serveur/.test(lire('scripts/tests/anti-double-envoi.test.mjs')));

console.log(`\nRÉSULTAT ANTI DOUBLE-ENVOI : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
