#!/usr/bin/env node
// Module « Ma demande » v2 — parcours INTERVENTION + DEVIS (cœur pur) et CONTRAT réel submit-lead-v6.
// Le contrat est lu dans supabase/functions/submit-lead-v6/index.ts (source de vérité), pas recopié.
//   node scripts/tests/demande-v2.test.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cat = readFileSync(join(ROOT, 'catalogue.html'), 'utf8');
const box = { module: { exports: {} } };
vm.runInNewContext((cat.match(/<script id="hc-demande-core">([\s\S]*?)<\/script>/) || [, ''])[1], box);
const C = box.module.exports;
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };

// ---- Parcours INTERVENTION : lieu → besoin → (accès tarifs) → précision → demande → coordonnées → prise en charge → envoyé
const I = C.FLOWS.intervention;
ok('intervention : 6 étapes dans l’ordre demandé', JSON.stringify(I) === JSON.stringify(['lieu', 'besoin', 'precision', 'demande', 'coordonnees', 'creneau']));
let s = 'choix'; const walked = [];
const ctx = { mode: 'intervention', lieuOk: true, fam: null, lines: 0, contactOk: false, gateOk: false };
s = C.nextStep('intervention', 'choix'); walked.push(s);
s = C.nextStep('intervention', s, ctx); walked.push(s);                     // besoin
ctx.fam = 'plomberie'; s = C.guardStep(C.nextStep('intervention', s, ctx), ctx); walked.push(s); // précision gardée → accès
ctx.gateOk = true; s = C.guardStep('precision', ctx); walked.push(s);
ctx.lines = 2; s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
ctx.contactOk = true; s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
s = C.nextStep('intervention', s); walked.push(s);
ok('intervention : parcours complet ' + walked.join(' → '), walked.join(',') === 'lieu,besoin,acces,precision,demande,coordonnees,creneau,envoye');
ok('intervention : lien métier (#cat) saute « besoin » après le lieu', C.nextStep('intervention', 'lieu', { fam: 'serrurerie' }) === 'precision');
ok('intervention : pas de lieu → retour au lieu', C.guardStep('demande', { mode: 'intervention', lieuOk: false, gateOk: true, lines: 1 }) === 'lieu');
ok('intervention : demande vide → précision', C.guardStep('coordonnees', { mode: 'intervention', lieuOk: true, gateOk: true, fam: 'x', lines: 0 }) === 'precision');
ok('intervention : prise en charge sans coordonnées → coordonnées', C.guardStep('creneau', { mode: 'intervention', lieuOk: true, gateOk: true, fam: 'x', lines: 1, contactOk: false }) === 'coordonnees');
ok('envoyé inaccessible sans envoi réel', C.guardStep('envoye', { mode: 'intervention' }) === 'choix');

// ---- Parcours DEVIS : métier → projet → photos → lieu → coordonnées → vérification → envoyé
const D = C.FLOWS.devis;
ok('devis : 6 étapes dans l’ordre demandé', JSON.stringify(D) === JSON.stringify(['dv-metier', 'dv-projet', 'dv-photos', 'lieu', 'coordonnees', 'dv-recap']));
const dctx = { mode: 'devis', dv: { metiers: [], desc: '' }, lieuOk: false, contactOk: false };
ok('devis : projet sans métier → métier', C.guardStep('dv-projet', dctx) === 'dv-metier');
dctx.dv.metiers = ['Rénovation'];
ok('devis : photos sans description → projet', C.guardStep('dv-photos', dctx) === 'dv-projet');
dctx.dv.desc = 'Rénovation complète salle de bain';
ok('devis : photos facultatives accessibles', C.guardStep('dv-photos', dctx) === 'dv-photos');
ok('devis : vérification sans lieu → lieu', C.guardStep('dv-recap', dctx) === 'lieu');
dctx.lieuOk = true; ok('devis : vérification sans coordonnées → coordonnées', C.guardStep('dv-recap', dctx) === 'coordonnees');
dctx.contactOk = true; ok('devis : vérification accessible', C.guardStep('dv-recap', dctx) === 'dv-recap');
ok('devis : jamais d\u2019écran « accès tarifs » (aucun prix dans le parcours devis)', D.every(x => C.guardStep(x, { ...dctx, gateOk: false }) === x));
ok('devis : lieu → coordonnées → vérification', C.nextStep('devis', 'lieu') === 'coordonnees' && C.nextStep('devis', 'coordonnees') === 'dv-recap');

// ---- Liens existants du site
ok('liens : #step=devis → devis étape 1', C.legacyStep('devis') === 'dv-metier');
ok('liens : ancien panier → Ma demande', C.legacyStep('cart') === 'demande');
ok('liens : étape inconnue → entrée', C.legacyStep('xyz') === 'choix');

// ---- Zone (agence unique Saint-Omer) et prix
const zSO = C.zoneFor(50.7508, 2.2522, '62500'), zBoul = C.zoneFor(50.7264, 1.6147, '62200'), zParis = C.zoneFor(48.8566, 2.3522, '75001');
ok('zone : Saint-Omer dans la zone', zSO.status === 'in');
ok('zone : Boulogne-sur-Mer dans la zone', zBoul.status === 'in');
ok('zone : Paris hors zone', zParis.status === 'out');
ok('zone : texte jamais « agence de Dunkerque »', !/agence de dunkerque|nos deux agences/i.test(JSON.stringify(['in', 'edge', 'out', 'unknown'].map(st => C.zoneText({ status: st, km: 30 }, 'Dunkerque')))));
ok('prix : 114,43 € affiché au centime (pas arrondi)', C.eur(114.43) === '114,43 €');
ok('prix : tarif au m² = « à confirmer »', C.priceKind({ name: 'Mise en sécurité vitre (au m²)', price_ttc: 120 }) === 'confirmer');
ok('prix : sur devis', C.priceKind({ name: 'Peinture', price_ttc: 0, requires_quote: true }) === 'devis');
ok('référence : dérivée de l’id réel, jamais inventée', C.refFromId('3f2a9c1e-0b4d-4e1a-9c3f-2b7d8e6a1c90') === 'HC-3F2A9C1E' && C.refFromId(null) === null);
ok('simulation : jamais sur le domaine de production', !C.simulationAllowed('depan59-62.fr') && !C.simulationAllowed('www.depan59-62.fr') && !C.simulationAllowed('remarkable-dragon-364e2b.netlify.app'));

// ---- CONTRAT RÉEL submit-lead-v6 (lu dans la fonction edge)
const edge = readFileSync(join(ROOT, 'supabase/functions/submit-lead-v6/index.ts'), 'utf8');
const contracts = {};
for (const m of edge.matchAll(/^\s*([a-z_]+):\s*\{\s*name:\s*(true|false),\s*contact:\s*(true|false),\s*cp:\s*(true|false),\s*ville:\s*(true|false),\s*adresse:\s*(true|false),\s*message:\s*(true|false),\s*metier:\s*(true|false)\s*\}/gm)) {
  contracts[m[1]] = { name: m[2] === 'true', contact: m[3] === 'true', cp: m[4] === 'true', ville: m[5] === 'true', adresse: m[6] === 'true', message: m[7] === 'true', metier: m[8] === 'true' };
}
ok('contrat : matrice lue dans la fonction edge (demande_metier, devis_express, rappel)', !!(contracts.demande_metier && contracts.devis_express && contracts.rappel));
function violations(p) {
  const k = contracts[p.form_type] || contracts.demande_metier, e = [];
  if (k.name && !p.nom && !p.prenom) e.push('nom');
  if (k.contact && !(C.phoneOk(p.telephone) || C.emailOk(p.email))) e.push('contact');
  if (k.adresse && !(p.adresse && p.adresse.length >= 5)) e.push('adresse');
  if (k.cp && !p.code_postal) e.push('cp'); if (p.code_postal && !C.cpOk(p.code_postal)) e.push('cp invalide');
  if (k.ville && !p.ville) e.push('ville'); if (k.message && !p.message) e.push('message'); if (k.metier && !p.metier) e.push('metier');
  return e;
}
const contact = { prenom: 'Marie', nom: 'Durand', tel: '06 12 34 56 78', email: 'marie@exemple.fr' };
const lieu = { adresse: '12 rue de Dunkerque', cp: '62500', ville: 'Saint-Omer', zone: zSO };
const byId = { a: { id: 'a', name: 'Intervention urgente plomberie — 1h + déplacement', price_ttc: 114.43, category_name: 'Plomberie & Sanitaires' }, b: { id: 'b', name: 'Peinture intérieure', price_ttc: 0, requires_quote: true, category_name: 'Rénovation' } };
const lines = [{ id: 'a', slug: 'x', name: byId.a.name, ttc: 114.43, qty: 1 }, { id: 'b', slug: 'y', name: byId.b.name, ttc: 0, requires_quote: true, qty: 1 }];
const pI = C.interventionPayload({ lines, byId, contact, lieu, prise: { quand: 'asap', rappel: 'matin' }, cartMode: 'mixte', page: 'https://x' });
const pD = C.devisPayload({ contact, lieu, devis: { metiers: ['Rénovation', 'Menuiserie', 'Volets', 'Autre'], nature: 'Rénovation', desc: 'Salle de bain complète' }, photos: 2, page: 'https://x' });
const pG = C.gatePayload({ contact: { prenom: 'Marie', tel: '06 12 34 56 78', email: 'marie@exemple.fr' }, lieu, famLabel: 'Plomberie', fam: 'plomberie', page: 'https://x' });
ok('contrat intervention (demande_metier) respecté : ' + (violations(pI).join(',') || 'aucune violation'), pI.form_type === 'demande_metier' && violations(pI).length === 0);
ok('contrat devis (devis_express) respecté : ' + (violations(pD).join(',') || 'aucune violation'), pD.form_type === 'devis_express' && violations(pD).length === 0);
ok('contrat accès tarifs (rappel) respecté : ' + (violations(pG).join(',') || 'aucune violation'), pG.form_type === 'rappel' && violations(pG).length === 0);
ok('devis : 3 services max (limite serveur)', pD.services.length === 3);
ok('intervention : message lisible (prix ferme + sur devis + délai + zone)', /prix ferme/.test(pI.message) && /sur devis/.test(pI.message) && /Délai souhaité/.test(pI.message) && /Zone : dans la zone/.test(pI.message));
ok('intervention : urgence transmise', pI.utm.urgence === 'oui' && pI.type_demande === 'mixte');
ok('aucun montant total envoyé comme montant payable', !('amount' in pI) && !('total' in pI));

console.log(`\nRÉSULTAT MODULE DEMANDE V2 : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
