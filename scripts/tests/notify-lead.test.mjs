#!/usr/bin/env node
// Tests unitaires du flux lead/notify (directive 5664439054 §1) — SANS notification réelle.
// On lit la VRAIE source submit-lead-v6/index.ts et on teste : persistance indépendante de la
// notification, garde NE PAS TRAITER indépendante de l'ordre/du champ, contrats par form_type,
// validateurs purs. Aucun réseau, aucun email.
//   node scripts/tests/notify-lead.test.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(join(ROOT, 'supabase/functions/submit-lead-v6/index.ts'), 'utf8');

let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };

// --- extracteur brace-équilibré (fonctions + objet) ---
function extractBalanced(s, startIdx) {
  const open = s.indexOf('{', startIdx);
  let depth = 0;
  for (let j = open; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') { depth--; if (depth === 0) return s.slice(open, j + 1); }
  }
  throw new Error('accolades non équilibrées');
}
function extractFn(s, name) {
  const i = s.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('fn introuvable: ' + name);
  const sig = s.slice(i, s.indexOf('{', i));
  return sig + extractBalanced(s, i);
}

// ── 1. Persistance du lead INDÉPENDANTE de la notification (lecture de la source) ──
const insertIdx = src.indexOf(".from('leads').insert");
const notifyIdx = src.indexOf('notify-lead-v6');
const successIdx = src.search(/return json\(200,\s*\{\s*success:\s*true/);
ok('insert lead AVANT notify (persistance d’abord)', insertIdx > 0 && notifyIdx > insertIdx);
ok('notify-lead-v6 est non bloquant (.catch)', /notify-lead-v6[\s\S]{0,160}\.catch\(/.test(src));
ok('lead-auto-reply non bloquant (.catch)', /lead-auto-reply[\s\S]{0,160}\.catch\(/.test(src));
ok('succès (200) retourné après insert, indépendant de la notif', successIdx > insertIdx);
ok('échec insert => 500 explicite (pas de faux succès)', /insert error[\s\S]{0,120}return json\(500/.test(src));

// ── 2. Garde NE PAS TRAITER : indépendante de l'ordre prénom/nom ET du champ message ──
const gi = src.indexOf('const isTestLead =');
const guardExpr = src.slice(gi + 'const isTestLead ='.length, src.indexOf(';', gi)).trim();
const guard = new Function('prenom', 'nom', 'message', 'return ' + guardExpr + ';');
ok('marqueur dans prénom seul', guard('NE PAS TRAITER', '', '') === true);
ok('marqueur dans nom seul', guard('', 'NE PAS TRAITER', '') === true);
ok('TEST/RECETTE ordre prénom→nom', guard('TEST', 'RECETTE', '') === true);
ok('RECETTE/TEST ordre inversé (nom→prénom)', guard('RECETTE', 'TEST', '') === true); // échouait avant le fix
ok('marqueur dans le message (e2e-local)', guard('Jean', 'Dupont', 'E2E — NE PAS TRAITER — J1') === true);
ok('vrai prospect NON marqué (pas de faux positif)', guard('Marie', 'Durand', 'Fuite sous évier') === false);

// ── 3. Contrats par form_type (champs requis) — objet réel du code ──
const ci = src.indexOf('CONTRACTS');
const eqi = src.indexOf('= {', ci);
const CONTRACTS = new Function('return ' + extractBalanced(src, eqi))();
ok('rappel = minimal (nom+contact, pas cp/message)', CONTRACTS.rappel.name && CONTRACTS.rappel.contact && !CONTRACTS.rappel.cp && !CONTRACTS.rappel.message);
ok('devis_express exige cp + métier', CONTRACTS.devis_express.cp === true && CONTRACTS.devis_express.metier === true);
ok('demande_metier exige ville + message', CONTRACTS.demande_metier.ville === true && CONTRACTS.demande_metier.message === true);
ok('contact_complet exige adresse', CONTRACTS.contact_complet.adresse === true);
ok('wizard_urgence exige métier', CONTRACTS.wizard_urgence.metier === true);

// ── 4. Validateurs purs (format téléphone/email/CP) extraits de la source ──
const fnSrc = ['normalizePhone', 'isValidFrenchPhone', 'isValidEmail', 'isValidCP'].map(n => extractFn(src, n)).join('\n');
const V = new Function(fnSrc + '\nreturn {normalizePhone,isValidFrenchPhone,isValidEmail,isValidCP};')();
ok('tel FR valide (0612345678)', V.isValidFrenchPhone('0612345678') === true);
ok('tel FR valide espacé (+33 6 12 34 56 78)', V.isValidFrenchPhone('+33 6 12 34 56 78') === true);
ok('tel invalide rejeté', V.isValidFrenchPhone('12345') === false);
ok('email valide', V.isValidEmail('a@b.fr') === true);
ok('email invalide rejeté', V.isValidEmail('a@b') === false);
ok('CP 5 chiffres', V.isValidCP('62500') === true && V.isValidCP('abc') === false);

console.log(`\nRÉSULTAT NOTIFY/LEAD : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
