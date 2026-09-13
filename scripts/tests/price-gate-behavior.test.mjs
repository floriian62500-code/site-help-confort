#!/usr/bin/env node
// Tests COMPORTEMENTAUX du price gate (directive 5645328308 §4).
// On extrait la logique RÉELLE (pgSessionOk + priceGatePassed + PG_TTL_MS) de catalogue.html
// et on l'évalue contre des scénarios mockés — pas une réimplémentation, la vraie source.
//   node scripts/tests/price-gate-behavior.test.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = readFileSync(join(ROOT, 'catalogue.html'), 'utf8');

// --- extraction brace-équilibrée de la vraie source ---
function extractFn(s, name) {
  const start = s.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('introuvable: ' + name);
  const open = s.indexOf('{', start);
  let depth = 0;
  for (let j = open; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') { depth--; if (depth === 0) return s.slice(start, j + 1); }
  }
  throw new Error('accolades non équilibrées: ' + name);
}
const ttlMatch = /var\s+PG_TTL_MS\s*=\s*([^;]+);/.exec(src);
if (!ttlMatch) throw new Error('PG_TTL_MS introuvable');
const PG_TTL_MS = Function('return (' + ttlMatch[1] + ')')();
const pgSessionOkSrc = extractFn(src, 'pgSessionOk');
const priceGatePassedSrc = extractFn(src, 'priceGatePassed');

// Évalue la VRAIE fonction dans un scope avec state/sessionStorage/Date mockés.
function evalGate({ state = {}, session = {}, now = Date.now() } = {}) {
  const sessionStorage = { getItem: (k) => (Object.prototype.hasOwnProperty.call(session, k) ? session[k] : null) };
  const RealDate = Date;
  const Date_ = { now: () => now };
  // eslint-disable-next-line no-new-func
  const run = new Function('state', 'sessionStorage', 'PG_TTL_MS', 'Date',
    `${pgSessionOkSrc}\n${priceGatePassedSrc}\nreturn priceGatePassed();`);
  return run(state, sessionStorage, PG_TTL_MS, Date_);
  void RealDate;
}

let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };
const H2 = 2 * 60 * 60 * 1000, H3 = 3 * 60 * 60 * 1000, H1 = 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

// 1. Ancienne autorisation expirée (>2h) → REFUSÉE
ok('ancienne autorisation expirée (>2h) refusée',
  evalGate({ state: { _priceGateOk: true, _priceGateAt: NOW - H3 }, session: {}, now: NOW }) === false);

// 2. Session courante validée (hc_pg=1) → ACCEPTÉE
ok('session courante validée acceptée',
  evalGate({ state: {}, session: { hc_pg: '1' }, now: NOW }) === true);

// 3. Accès direct non identifié (aucun état) → BLOQUÉ
ok('accès direct non identifié bloqué',
  evalGate({ state: {}, session: {}, now: NOW }) === false);

// 4. Vieux localStorage durable SANS horodatage (identité seule) → REFUSÉ
ok('vieux état durable sans horodatage refusé',
  evalGate({ state: { _priceGateOk: true }, session: {}, now: NOW }) === false);

// 5. Grâce récente valide (<2h) après succès explicite du gate → ACCEPTÉE
ok('grâce récente (<2h) après succès gate acceptée',
  evalGate({ state: { _priceGateOk: true, _priceGateAt: NOW - H1 }, session: {}, now: NOW }) === true);

// 6. Limite exacte du TTL (2h pile) → REFUSÉE (strict <)
ok('TTL exact (2h) refusé (comparaison stricte)',
  evalGate({ state: { _priceGateOk: true, _priceGateAt: NOW - H2 }, session: {}, now: NOW }) === false);

// 7. _priceGateAt non numérique (corrompu) → REFUSÉ
ok('_priceGateAt non numérique refusé',
  evalGate({ state: { _priceGateOk: true, _priceGateAt: '123' }, session: {}, now: NOW }) === false);

// 8. Formulaires devis/contact/rappel ne déverrouillent JAMAIS : prouvé par provenance —
//    seul catalogue.html écrit _priceGateOk/_priceGateAt/hc_pg (grep source). Ici on vérifie
//    qu'AUCUN de ces champs n'est posé ailleurs que dans le handler du gate.
const writes = (src.match(/_priceGateOk\s*=\s*true/g) || []).length;
const sess = (src.match(/setItem\(\s*['"]hc_pg['"]/g) || []).length;
ok('déverrouillage écrit à un seul endroit (handler gate)', writes === 1 && sess === 1);

console.log(`\nRÉSULTAT PRICE GATE (comportement) : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
