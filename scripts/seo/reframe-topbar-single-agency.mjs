// reframe-topbar-single-agency.mjs — UNE agence (Saint-Omer/Dépan'Audo).
// Dunkerque = ZONE DESSERVIE (conservée), PAS une agence. Réponse directive 5523060107.
// Correctif SÛR + robuste : retire le BADGE d'agence "Dépan'DK" de la topbar (toutes variantes),
// GARDE le libellé "Dunkerque" (zone), et remplace le séparateur "+" (2 entités) par "·".
// Ne touche PAS "Dépan'Audo" (la vraie agence Saint-Omer). --dry pour tester.
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

// Badge agence Dunkerque à retirer (apostrophe droite ou typographique, avec espace éventuel avant).
const reBadge = /\s*<em class="hctb-agence"[^>]*>\s*D[eé]pan['’]DK\s*<\/em>/g;
// Séparateur "+" de la topbar (deux entités) → bullet neutre.
const rePlus = /<span class="hctb-plus"[^>]*>\s*\+\s*<\/span>/g;

let changed = 0, badges = 0, plus = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  if (!/hctb-agence">D[eé]pan['’]DK/.test(html) && !/hctb-plus/.test(html)) continue;
  let out = html;
  badges += (out.match(reBadge) || []).length;
  out = out.replace(reBadge, '');
  plus += (out.match(rePlus) || []).length;
  out = out.replace(rePlus, '<span class="hctb-bullet" aria-hidden="true">·</span>');
  if (out !== html) { if (!dry) fs.writeFileSync(f, out); changed++; }
}
console.log(`${dry ? '[DRY] ' : ''}topbar single-agency: ${changed} fichiers, ${badges} badges Dépan'DK retirés (Dunkerque conservé), ${plus} séparateurs "+"→"·"`);
}
