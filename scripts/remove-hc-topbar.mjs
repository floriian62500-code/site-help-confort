#!/usr/bin/env node
// Retire le bandeau orange `.hc-topbar` (Saint-Omer · Dépan'Audo · Dunkerque · horaires)
// de toutes les pages — demande Florian (retest RC, 2026-09-14). Le header reste.
// Suppression du bloc <div class="hc-topbar" ...> ... </div> par comptage d'imbrication (robuste).
//   node scripts/remove-hc-topbar.mjs           (applique)
//   node scripts/remove-hc-topbar.mjs --dry     (liste seulement)
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DRY = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '__pycache__', 'logs', 'admin-pro', 'admin']);

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, acc);
    else if (e.endsWith('.html')) acc.push(p);
  }
  return acc;
}

// Retire le 1er bloc <div class="hc-topbar"...>...</div> équilibré. Retourne le nouveau contenu ou null.
function stripTopbar(html) {
  const open = html.search(/<div\s+class="hc-topbar"/);
  if (open < 0) return null;
  // début de la balise <div ... > : trouver le '>' qui ferme la balise ouvrante
  let i = html.indexOf('>', open);
  if (i < 0) return null;
  let depth = 1;                    // on a ouvert 1 div
  const tag = /<\/?div\b[^>]*>/gi;
  tag.lastIndex = i + 1;
  let m, end = -1;
  while ((m = tag.exec(html))) {
    if (m[0][1] === '/') { depth--; if (depth === 0) { end = m.index + m[0].length; break; } }
    else depth++;
  }
  if (end < 0) return null;
  // absorber un éventuel saut de ligne résiduel
  let after = end;
  if (html[after] === '\n') after++;
  return html.slice(0, open) + html.slice(after);
}

const files = walk('.');
let changed = 0, skipped = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  if (!/<div\s+class="hc-topbar"/.test(src)) { skipped++; continue; }
  const out = stripTopbar(src);
  if (out == null || out === src) { console.log('  ⚠️  non retiré (structure inattendue):', f); continue; }
  if (/<div\s+class="hc-topbar"/.test(out)) console.log('  ⚠️  occurrence résiduelle:', f);
  if (!DRY) writeFileSync(f, out);
  changed++;
}
console.log(`\n${DRY ? '[DRY] ' : ''}hc-topbar retiré : ${changed} page(s) · ${skipped} sans bandeau`);
