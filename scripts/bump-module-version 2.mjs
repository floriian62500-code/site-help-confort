#!/usr/bin/env node
// Monte la version des assets du module « Ma demande » dans index.html et catalogue.html.
// Obligatoire à chaque modification de assets/hc-demande*.{js,css} : /assets/* est en cache immuable.
//   node scripts/bump-module-version.mjs            → AAAAMMJJ + lettre suivante
//   node scripts/bump-module-version.mjs 20260918z  → version imposée
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'catalogue.html'];
const RE = /hc-demande[a-z-]*\.(?:js|css)\?v=(\d{8}[a-z]?)|var V = '(\d{8}[a-z]?)'/;

const current = (() => {
  for (const f of FILES) {
    const m = readFileSync(join(ROOT, f), 'utf8').match(RE);
    if (m) return m[1] || m[2];
  }
  return null;
})();
if (!current) { console.error('Version actuelle introuvable.'); process.exit(1); }

const next = process.argv[2] || (() => {
  const d = new Date(), day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  if (!current.startsWith(day)) return day + 'a';
  const letter = current.length > 8 ? current[8] : 'a';
  return day + String.fromCharCode(letter.charCodeAt(0) + 1);
})();

for (const f of FILES) {
  const p = join(ROOT, f), s = readFileSync(p, 'utf8');
  const out = s.split(current).join(next);
  writeFileSync(p, out, 'utf8');
  console.log(`${f} : ${(s.match(new RegExp(current, 'g')) || []).length} occurrence(s) ${current} → ${next}`);
}
