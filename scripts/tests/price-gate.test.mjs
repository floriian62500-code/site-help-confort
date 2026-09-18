#!/usr/bin/env node
// Tests de non-régression PRICE GATE (P0 5605156304 / 5605475397) — module « Ma demande » v2.
// Règle métier : aucun montant affiché sans identification (session courante ou < 2 h).
// Double preuve : invariants statiques dans catalogue.html + comportement du cœur pur (garde d'étapes).
//   node scripts/tests/price-gate.test.mjs
import { readFileSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cat = readFileSync(join(ROOT, 'catalogue.html'), 'utf8');
// Le module vit dans assets/ (page /catalogue.html ET fenêtre premium de l'accueil) : la preuve porte sur ces fichiers.
const js = [readFileSync(join(ROOT, 'assets', 'hc-demande.js'), 'utf8'), readFileSync(join(ROOT, 'assets', 'hc-demande-core.js'), 'utf8'), cat].join('\n').replace(/<!--[\s\S]*?-->/g, '');
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };
const count = (s, re) => (s.match(re) || []).length;
const block = (re) => (js.match(re) || [''])[0];

// Cœur pur chargé dans un bac à sable Node (même code que le navigateur)
const coreSrc = readFileSync(join(ROOT, 'assets', 'hc-demande-core.js'), 'utf8');
const box = { module: { exports: {} }, self: undefined };
vm.runInNewContext(coreSrc, box);
const C = box.module.exports;
ok('cœur pur chargé (HcDemandeCore)', typeof C.guardStep === 'function');

// 1-3. Déverrouillage : source UNIQUE, horodatée
ok('write unique _priceGateOk = true (1 occurrence)', count(js, /_priceGateOk\s*=\s*true/g) === 1);
ok("setItem('hc_pg') unique (1 occurrence)", count(js, /setItem\(\s*['"]hc_pg['"]/g) === 1);
ok('_priceGateAt = Date.now() présent', /_priceGateAt\s*=\s*Date\.now\(\)/.test(js));

// 4. Prédicat : session OU (flag + horodatage numérique + TTL). Jamais l'identité seule.
const pgCore = block(/function priceGatePassed\(state, sessionOk, now\)\s*\{[\s\S]*?\n\s*\}/);
ok('prédicat : exige _priceGateOk === true', /_priceGateOk\s*===\s*true/.test(pgCore));
ok('prédicat : exige horodatage numérique', /typeof\s+t\s*===\s*['"]number['"]/.test(pgCore));
ok('prédicat : applique PG_TTL_MS', /PG_TTL_MS/.test(pgCore));
ok('UI : prédicat alimenté par la session courante', /function priceGatePassed\(\)\s*\{\s*return C\.priceGatePassed\(state, pgSessionOk\(\), Date\.now\(\)\)/.test(js));
const now = Date.now();
ok('comportement : identité seule (sans horodatage) = verrouillé', C.priceGatePassed({ _priceGateOk: true }, false, now) === false);
ok('comportement : identification > 2 h = verrouillé', C.priceGatePassed({ _priceGateOk: true, _priceGateAt: now - 3 * 3600e3 }, false, now) === false);
ok('comportement : session courante = déverrouillé', C.priceGatePassed({}, true, now) === true);

// 5. Toutes les étapes tarifées sont gardées (écrans + récapitulatif)
for (const step of ['precision', 'demande', 'coordonnees', 'creneau']) {
  ok(`PRICED_STEPS contient « ${step} »`, C.PRICED_STEPS.includes(step));
  const full = { mode: 'intervention', lieuOk: true, fam: 'plomberie', lines: 2, contactOk: true, gateOk: false };
  const got = C.guardStep(step, full);
  ok(`garde : « ${step} » sans identification → ${got} (jamais l'écran tarifé)`, !C.PRICED_STEPS.includes(got));
  ok(`garde : « ${step} » identifié → accessible`, C.guardStep(step, { ...full, gateOk: true }) === step);
}

// 6-8. Aucun montant rendu hors identification (défense en profondeur côté rendu)
ok('renderOffers : garde !priceGatePassed() en tête', /function renderOffers\(\)\s*\{[^}]*?if \(!priceGatePassed\(\)\)/.test(js));
ok('renderDemande : garde !priceGatePassed() en tête', /function renderDemande\(\)\s*\{[^}]*?if \(!priceGatePassed\(\)\)/.test(js));
const recap = block(/function recapHtml\(\)\s*\{[\s\S]*?\n  \}/);
ok('récapitulatif : prix de ligne seulement si identifié', /\(gate \? '<span>'/.test(recap));
ok('récapitulatif : total seulement si identifié', /if \(gate && tot > 0\)/.test(recap));
ok('poignée mobile : total seulement si identifié', /gate && tot > 0 \? ' · ' \+ C\.eur\(tot\)/.test(js));

// 9. Provenance unique repo-wide : aucun autre fichier ne pose l'état déverrouillé
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (['.git', 'node_modules', '__pycache__', 'logs'].includes(e)) continue;
    const p = join(dir, e); let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, acc); else if (/\.(html|js|mjs)$/.test(e)) acc.push(p);
  }
  return acc;
}
const offenders = walk(ROOT).filter(p => {
  if (p.endsWith(join('assets', 'hc-demande.js')) || p.endsWith('catalogue.html') || p.includes(join('scripts', 'tests'))) return false;
  const src = readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  return /_priceGateOk\s*=\s*true/.test(src) || /setItem\(\s*['"]hc_pg['"]/.test(src);
}).map(p => p.replace(ROOT + '/', ''));
ok('provenance unique : aucun autre fichier ne déverrouille les tarifs', offenders.length === 0);
if (offenders.length) console.log('     ↳ fichiers fautifs :', offenders.join(', '));

console.log(`\nRÉSULTAT PRICE GATE : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
