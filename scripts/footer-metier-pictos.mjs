#!/usr/bin/env node
// Ajoute des pictos SVG (cyan currentColor) à côté des métiers dans le pied de page — demande Florian.
// Idempotent : ne réinjecte pas si déjà présent. Ne touche QUE le bloc footer « Métiers ».
//   node scripts/footer-metier-pictos.mjs [--dry]
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DRY = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '__pycache__', 'logs', 'admin-pro', 'admin']);

// href de la page métier -> contenu SVG (viewBox 24, stroke currentColor)
const ICONS = {
  'plombier-saint-omer.html': '<path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  'chauffagiste-saint-omer.html': '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
  'electricien-saint-omer.html': '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  'serrurier-saint-omer.html': '<rect x="4.5" y="11" width="15" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  'vitrier-saint-omer.html': '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>',
  'menuisier-saint-omer.html': '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M8 8v3M13 8v3M18 8v3"/>',
  'travaux-saint-omer.html': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.1-2.1z"/>',
  'volets-saint-omer.html': '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M4 14h16"/>',
  'pmr-saint-omer.html': '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v6M8.5 9.5h7M9.5 13l-2 8M14.5 13l2 8"/>',
};
const svgWrap = (inner) => `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const CSS_ANCHOR = '.fv3-col li a:hover{color:#1FC4F0}';
const CSS_ADD = '.fv3-metiers li a{display:inline-flex;align-items:center;gap:9px}.fv3-metiers li a svg{width:15px;height:15px;flex-shrink:0;color:#1FC4F0;opacity:.9}';

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e); let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, acc); else if (e.endsWith('.html')) acc.push(p);
  }
  return acc;
}

// Isole le bloc footer Métiers : <h3>Métiers</h3> ... </ul>
function transform(html) {
  const h3 = html.indexOf('<h3>Métiers</h3>');
  if (h3 < 0) return null;
  const ulStart = html.indexOf('<ul>', h3);
  const ulEnd = html.indexOf('</ul>', ulStart);
  if (ulStart < 0 || ulEnd < 0) return null;
  let block = html.slice(ulStart, ulEnd);
  let touched = false;
  for (const [href, inner] of Object.entries(ICONS)) {
    // insère le SVG juste après <a href="HREF"> s'il n'y est pas déjà
    const re = new RegExp('(<a href="' + href.replace(/[.]/g, '\\.') + '">)(?!<svg)', 'g');
    const before = block;
    block = block.replace(re, '$1' + svgWrap(inner));
    if (block !== before) touched = true;
  }
  if (!touched) return null; // déjà fait ou bloc inattendu
  let out = html.slice(0, ulStart) + block + html.slice(ulEnd);
  // classe fv3-metiers sur le <div class="fv3-col"> qui précède le h3
  const h3b = out.indexOf('<h3>Métiers</h3>');
  const divIdx = out.lastIndexOf('<div class="fv3-col">', h3b);
  if (divIdx >= 0) out = out.slice(0, divIdx) + '<div class="fv3-col fv3-metiers">' + out.slice(divIdx + '<div class="fv3-col">'.length);
  // CSS (une fois)
  if (out.includes(CSS_ANCHOR) && !out.includes('.fv3-metiers li a{')) out = out.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_ADD);
  return out;
}

let changed = 0, skipped = 0;
for (const f of walk('.')) {
  const src = readFileSync(f, 'utf8');
  const out = transform(src);
  if (out == null || out === src) { skipped++; continue; }
  if (!DRY) writeFileSync(f, out);
  changed++;
}
console.log(`${DRY ? '[DRY] ' : ''}footer pictos : ${changed} page(s) modifiée(s) · ${skipped} inchangée(s)`);
