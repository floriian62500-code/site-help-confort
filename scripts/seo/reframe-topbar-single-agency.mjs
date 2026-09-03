// reframe-topbar-single-agency.mjs — UNE agence (Saint-Omer/Dépan'Audo).
// Dunkerque = ZONE DESSERVIE (conservée), PAS une agence. Réponse directive 5523060107.
// Correctif SÛR + robuste : retire le BADGE d'agence "Dépan'DK" de la topbar (toutes variantes),
// GARDE le libellé "Dunkerque" (zone), et remplace le séparateur "+" (2 entités) par "·".
// Ne touche PAS "Dépan'Audo" (la vraie agence Saint-Omer). --dry pour tester.
import fs from 'node:fs';
const dry = process.argv.includes('--dry');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

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
