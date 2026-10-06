// sweep-header-tel-1100.mjs — TRD-2/RSP-1 résiduel : masque le n° de tél du header ancien dès 1100px
// (au lieu de 979px) pour supprimer le débordement horizontal 980-1100px. Le bouton tél (icône) reste.
// CSS-only, ADDITIF : insère la règle 1100px juste avant le bloc @media 979px existant. Idempotent.
import fs from 'node:fs';
import path from 'node:path';
const dry = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '.netlify', 'dist']);
function walk(dir){ let o=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ if(e.isDirectory()){ if(!SKIP.has(e.name)) o=o.concat(walk(path.join(dir,e.name))); } else if(e.name.endsWith('.html')) o.push(path.join(dir,e.name)); } return o; }

const ANCHOR = '@media (max-width: 979px) {.hc-burger';
const RULE   = '@media (max-width:1100px){.hc-btn-tel-num{display:none}}';

let changed = 0, already = 0, novariant = 0;
for (const f of walk('.')){
  const html = fs.readFileSync(f, 'utf8');
  if (!html.includes('hc-btn-tel-num')) continue;
  if (html.includes(RULE)) { already++; continue; }
  if (!html.includes(ANCHOR)) { novariant++; continue; } // variante de header différente → traitée à part
  const out = html.replace(ANCHOR, RULE + ANCHOR);
  if (out !== html) { if (!dry) fs.writeFileSync(f, out); changed++; }
}
console.log(`${dry?'[DRY] ':''}sweep header tel<=1100: ${changed} pages corrigées, ${already} déjà OK, ${novariant} variantes header (hors périmètre anchor)`);
