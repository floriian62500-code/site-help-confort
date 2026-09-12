#!/usr/bin/env node
// Tests de non-régression PRICE GATE (P0 5605156304 / 5605475397).
// Statique : on vérifie les invariants directement dans la source (le moteur est du JS inline
// dans catalogue.html, non importable). Aucune modification de rendu, exécutable en CI.
//   node scripts/tests/price-gate.test.mjs
import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cat = readFileSync(join(ROOT, 'catalogue.html'), 'utf8');
// on ne teste que le JS (hors commentaires HTML) pour éviter les faux positifs
const catNoComments = cat.replace(/<!--[\s\S]*?-->/g, '');

let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };
const count = (s, re) => (s.match(re) || []).length;

// 1. Source UNIQUE de déverrouillage : une seule écriture de _priceGateOk=true
ok('write unique _priceGateOk=true (1 occurrence)', count(catNoComments, /_priceGateOk\s*=\s*true/g) === 1);

// 2. La pose de hc_pg (session) ne se fait qu'une fois, dans le handler du gate
ok('setItem(hc_pg) unique (1 occurrence)', count(catNoComments, /setItem\(\s*['"]hc_pg['"]/g) === 1);

// 3. _priceGateAt horodaté au même endroit que _priceGateOk (grâce TTL, pas identité seule)
ok('_priceGateAt=Date.now() présent', /_priceGateAt\s*=\s*Date\.now\(\)/.test(catNoComments));

// 4. priceGatePassed() : session OU (flag + horodatage numérique + TTL). Jamais identité seule.
const pgFn = (catNoComments.match(/function priceGatePassed\(\)\s*\{[\s\S]*?\n\s*\}/) || [''])[0];
ok('priceGatePassed: check session (pgSessionOk)', /pgSessionOk\(\)/.test(pgFn));
ok('priceGatePassed: exige _priceGateOk===true', /_priceGateOk\s*===\s*true/.test(pgFn));
ok('priceGatePassed: exige horodatage numérique', /typeof\s+t\s*===\s*['"]number['"]/.test(pgFn));
ok('priceGatePassed: applique un TTL (PG_TTL_MS)', /PG_TTL_MS/.test(pgFn));

// 5. go() garde TOUTES les étapes tarifées (pas seulement catalogue/sheet)
const goGate = (catNoComments.match(/if\(\(step===[\s\S]{0,220}?priceGatePassed\(\)\)\{/) || [''])[0];
for (const step of ['catalogue', 'sheet', 'cart', 'address', 'coords', 'confirm']) {
  ok(`go() garde l'étape « ${step} »`, new RegExp(`step===['"]${step}['"]`).test(goGate));
}

// 6. Barre panier mobile : total masqué hors gate (jamais un € sans identification)
ok('barre mobile: total masqué hors gate (showTot ? tot : —)',
  /showTot\s*=\s*priceGatePassed\(\)/.test(catNoComments) &&
  /#mTotal['"]\)\.textContent\s*=\s*showTot\s*\?/.test(catNoComments));

// 7. Résumé latéral/bottom-sheet : verrouillé hors gate
ok('summaryHtml: retour verrouillé si !priceGatePassed()',
  /function summaryHtml\(\)[\s\S]{0,200}?!priceGatePassed\(\)\)\s*return/.test(catNoComments));

// 8. renderCartFull : aucun prix rendu dans le DOM hors gate (défense stricte)
ok('renderCartFull: garde !priceGatePassed() en tête',
  /function renderCartFull\(\)\s*\{\s*if\(!priceGatePassed\(\)\)/.test(catNoComments));

// 9. Boutons panier : ouvrent le gate si non identifié (desktop + mobile)
ok('boutons panier: go(cart) si !priceGatePassed()',
  count(catNoComments, /!priceGatePassed\(\)\)\s*\{\s*go\(\s*['"]cart['"]\s*\)/g) >= 2);

// 10. AUCUN autre fichier ne pose l'état déverrouillé (provenance unique repo-wide)
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (e === '.git' || e === 'node_modules' || e === '__pycache__' || e === 'logs') continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; } // ignore les liens cassés / fichiers volatils
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(html|js|mjs)$/.test(e)) acc.push(p);
  }
  return acc;
}
const offenders = walk(ROOT).filter(p => {
  if (p.endsWith('catalogue.html')) return false;                 // la source légitime
  if (p.includes(`${join('scripts', 'tests')}`)) return false;    // ce test lui-même
  const src = readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  return /_priceGateOk\s*=\s*true/.test(src) || /setItem\(\s*['"]hc_pg['"]/.test(src);
}).map(p => p.replace(ROOT + '/', ''));
ok('provenance unique: aucun autre fichier ne déverrouille les tarifs', offenders.length === 0);
if (offenders.length) console.log('     ↳ fichiers fautifs :', offenders.join(', '));

console.log(`\nRÉSULTAT PRICE GATE : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
