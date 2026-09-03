// reframe-prose-single-agency.mjs — collapse la tournure récurrente "deux entités".
// "<strong>Dépan'Audo</strong> (Saint-Omer) et <strong>Dépan'DK</strong> (Dunkerque)"
// implique 2 agences. UNE seule agence (Saint-Omer) — Dunkerque = zone desservie (conservée
// dans le reste de la phrase et partout ailleurs). Réponse directive 5523060107. Recursif, safe.
import fs from 'node:fs';
import path from 'node:path';
const dry = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '.netlify', 'dist']);
function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) out = out.concat(walk(path.join(dir, e.name))); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}

// Cas grammatical pluriel ("...(Dunkerque) sont membres ... opèrent") -> singulier, AVANT le collapse générique.
const rePlural = /\(Saint-Omer\)\s*et\s*<strong>D[eé]pan['’]DK<\/strong>\s*\(Dunkerque\)\s*sont membres de ce réseau et opèrent/g;
// Collapse générique : "(Saint-Omer) et <strong>Dépan'DK</strong> (Dunkerque)" -> "(Saint-Omer)".
const reCollapse = /\(Saint-Omer\)\s*et\s*<strong>D[eé]pan['’]DK<\/strong>\s*\(Dunkerque\)/g;
// Reliquat pluriel après collapse : "nos agences <strong>Dépan'Audo</strong> (Saint-Omer)" -> singulier.
const reNosAgences = /nos agences (<strong>D[eé]pan['’]Audo<\/strong>\s*\(Saint-Omer\))/g;

let changed = 0, plural = 0, collapse = 0, nosag = 0;
for (const f of walk('.')) {
  const html = fs.readFileSync(f, 'utf8');
  let out = html;
  plural += (out.match(rePlural) || []).length;
  out = out.replace(rePlural, '(Saint-Omer) est membre de ce réseau et opère');
  collapse += (out.match(reCollapse) || []).length;
  out = out.replace(reCollapse, '(Saint-Omer)');
  nosag += (out.match(reNosAgences) || []).length;
  out = out.replace(reNosAgences, 'notre agence $1');
  if (out !== html) { if (!dry) fs.writeFileSync(f, out); changed++; }
}
console.log(`${dry ? '[DRY] ' : ''}prose single-agency: ${changed} fichiers, ${plural} pluriel corrigés, ${collapse} collapses, ${nosag} "nos agences"->"notre agence"`);
