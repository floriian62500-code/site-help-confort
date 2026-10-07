// reframe-footer-single-societe.mjs — UNE société (SARL Dépan'Audo, même SIREN 898 196 159).
// La ligne "réseau" du footer listait "Dépan'Audo & Dépan'DK · Sociétés du réseau ..." (2 entités) :
// or Dépan'DK n'est PAS une société distincte (même SIREN). Réponse directive 5523060107.
// Correctif SÛR, robuste (apostrophe droite/typo + 3 variantes de fin), format-preserving.
// Dunkerque reste zone desservie ailleurs (intact).
import fs from 'node:fs';
import path from 'node:path';

import { pathToFileURL as __versUrl } from 'node:url';
// Outil en ligne de commande : importe (par une suite de tests, par un autre script), il ne doit
// rien faire. Sans cette garde, un simple import reecrivait des pages du depot.
const __appelDirect = !!process.argv[1] && import.meta.url === __versUrl(process.argv[1]).href;
if (__appelDirect) {
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
const files = walk('.');

// apostrophe droite (') ou typographique (’) ; & littéral ou &amp; ; fin variable.
const re = /D[eé]pan['’]Audo\s*(?:&amp;|&)\s*D[eé]pan['’]DK\s*·\s*Sociétés du réseau HELP Confort(?:\s*·\s*(?:Franchise du )?Réseau national HELP Confort)?/g;
const TO = "SARL Dépan'Audo · Société du réseau national HELP Confort";

let changed = 0, hits = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const m = html.match(re);
  if (!m) continue;
  hits += m.length;
  const out = html.replace(re, TO);
  if (out !== html) { if (!dry) fs.writeFileSync(f, out); changed++; }
}
console.log(`${dry ? '[DRY] ' : ''}footer single-société: ${changed} fichiers, ${hits} lignes réseau corrigées (Dépan'DK société retirée)`);
}
