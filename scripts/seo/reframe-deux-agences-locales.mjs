// reframe-deux-agences-locales.mjs — résiduel single-agency repéré par le garde-fou SEO.
// Tournures « Deux agences locales … » manquées par le 1er sweep (pages *-saint-omer + notre-equipe).
// UNE agence Saint-Omer ; Dunkerque = zone desservie (conservée). Exact-match, format-preserving, idempotent.
import fs from 'node:fs';
import path from 'node:path';
const dry = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '.netlify', 'dist']);
function walk(dir){ let o=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ if(e.isDirectory()){ if(!SKIP.has(e.name)) o=o.concat(walk(path.join(dir,e.name))); } else if(e.name.endsWith('.html')) o.push(path.join(dir,e.name)); } return o; }

const SUBS = [
  ['Deux agences locales, techniciens du secteur.', 'Une agence locale, techniciens du secteur.'],
  ['Deux agences locales couvrent plus de 220 communes du Nord et du Pas-de-Calais.', 'Notre agence locale couvre plus de 220 communes du Nord et du Pas-de-Calais.'],
  ['Deux agences : Saint-Omer et Dunkerque.', 'Une agence à Saint-Omer ; intervention jusqu\'à Dunkerque.'],
];

let changed = 0, hits = 0;
for (const f of walk('.')){
  let h = fs.readFileSync(f, 'utf8'); const before = h;
  for (const [a,b] of SUBS){ if (h.includes(a)){ hits += h.split(a).length - 1; h = h.split(a).join(b); } }
  if (h !== before){ if (!dry) fs.writeFileSync(f, h); changed++; }
}
console.log(`${dry?'[DRY] ':''}reframe deux-agences-locales: ${changed} fichiers, ${hits} tournures corrigées`);
