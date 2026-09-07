// seo-guardrails.mjs — SEO-2 garde-fous : validateur LECTURE SEULE des invariants SEO + vérité métier.
// Exécution : `node scripts/seo/seo-guardrails.mjs` (exit 1 si ERROR). `--warn` inclut les avertissements.
// But : figer les acquis (single-agency, JSON-LD valide, balises SEO de base) pour empêcher toute régression.
import fs from 'node:fs';
import path from 'node:path';

const SKIP_DIRS = new Set(['node_modules', '.git', '.netlify', 'dist']);
// Pages hors périmètre "page publique SEO" : back-office, CMS, fragments, centre de recette.
const SKIP_FILE = /(^|\/)(admin-pro|admin|docs)\//;
const SKIP_NAME = /^(recette|404|google[0-9a-f]+|espace-client|espace-client-dashboard)\.html$/i;

function walk(dir){ let o=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ if(e.isDirectory()){ if(!SKIP_DIRS.has(e.name)) o=o.concat(walk(path.join(dir,e.name))); } else if(e.name.endsWith('.html')) o.push(path.join(dir,e.name)); } return o; }

const files = walk('.').filter(f => !SKIP_FILE.test(f) && !SKIP_NAME.test(path.basename(f)));

const errors = [];   // invariants durs
const warns  = [];   // qualité (non bloquant)
function err(f, code, msg){ errors.push({f, code, msg}); }
function warn(f, code, msg){ warns.push({f, code, msg}); }

for (const f of files){
  const h = fs.readFileSync(f, 'utf8');

  // 1. exactement un <h1>
  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  if (h1 === 0) warn(f, 'H1_MISSING', 'aucun <h1>');
  else if (h1 > 1) warn(f, 'H1_MULTIPLE', `${h1} <h1>`);

  // 2. <title> présent non vide (attributs éventuels tolérés, ex. id="pageTitle")
  const title = (h.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) err(f, 'TITLE_MISSING', '<title> absent/vide');
  else if (title.length > 70) warn(f, 'TITLE_LONG', `titre ${title.length} car.`);

  // 3. meta description présente non vide (attributs dans un ordre quelconque)
  const desc = (h.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["'][^>]*>/i) || [])[1];
  if (!desc || !desc.trim()) err(f, 'DESC_MISSING', 'meta description absente/vide');

  // 4. canonical présent
  if (!/<link\s+rel=["']canonical["']/i.test(h)) err(f, 'CANONICAL_MISSING', 'link canonical absent');

  // 5. JSON-LD valide
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m, n=0;
  while ((m = re.exec(h))){ n++; try { JSON.parse(m[1]); } catch(e){ err(f, 'JSONLD_INVALID', `bloc JSON-LD #${n} invalide: ${e.message}`); } }

  // 6. vérité métier UNE agence Saint-Omer (single-agency) — invariants durs
  if (/"addressLocality":\s*"Dunkerque"/.test(h)) err(f, 'FALSE_AGENCY_ADDRESS', 'addressLocality "Dunkerque" (établissement inventé)');
  if (/deux agences|2 agences locales|deux SARL|société sœur/i.test(h)) err(f, 'TWO_AGENCIES', 'formulation « deux agences »');
  if (/HELP Confort Dunkerque/.test(h)) err(f, 'HC_DUNKERQUE', '« HELP Confort Dunkerque » (établissement)');
  // "Dépan'DK" visible = interdit ; la CLÉ data value="depan-dk" est tolérée (tri interne).
  const dkText = h.replace(/value=["']depan-dk["']/g, '').replace(/'depan-dk'|"depan-dk"/g, '');
  if (/D[eé]pan['’]DK/.test(dkText)) err(f, 'DEPANDK_VISIBLE', 'libellé « Dépan\'DK » visible');
}

// Rapport
const byCode = {};
for (const e of errors) byCode[e.code] = (byCode[e.code]||0)+1;
const wByCode = {};
for (const w of warns) wByCode[w.code] = (wByCode[w.code]||0)+1;

console.log(`SEO garde-fous — ${files.length} pages publiques auditées`);
console.log(`ERRORS=${errors.length}  WARNINGS=${warns.length}`);
console.log('--- ERRORS par type ---');
console.log(Object.keys(byCode).length ? Object.entries(byCode).map(([k,v])=>`  ${k}: ${v}`).join('\n') : '  (aucune)');
if (errors.length){ console.log('--- détail ERRORS (max 40) ---'); errors.slice(0,40).forEach(e=>console.log(`  [${e.code}] ${e.f} — ${e.msg}`)); }
if (process.argv.includes('--warn')){
  console.log('--- WARNINGS par type ---');
  console.log(Object.entries(wByCode).map(([k,v])=>`  ${k}: ${v}`).join('\n'));
}
process.exit(errors.length ? 1 : 0);
