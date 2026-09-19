// reframe-brand-saintomer-dunkerque.mjs — reliquat éditorial single-agency (directive 5572216104).
// Corrige UNIQUEMENT les juxtapositions AMBIGUËS « Saint-Omer & Dunkerque » qui laissent croire à
// deux implantations : (1) nom de marque/établissement, (2) balises <title>/og:title/twitter:title.
// NE TOUCHE PAS la prose de couverture (« nous intervenons sur Saint-Omer et Dunkerque » = légitime).
// Dunkerque reste fortement présent (H1/meta description/areaServed/contenu). Idempotent.
import fs from 'node:fs';
import path from 'node:path';
const dry = process.argv.includes('--dry');
const SKIP = new Set(['node_modules', '.git', '.netlify', 'dist']);
function walk(dir){ let o=[]; for(const e of fs.readdirSync(dir,{withFileTypes:true})){ if(e.isDirectory()){ if(!SKIP.has(e.name)) o=o.concat(walk(path.join(dir,e.name))); } else if(e.name.endsWith('.html')) o.push(path.join(dir,e.name)); } return o; }

// & ou &amp;
const AMP = '(?:&amp;|&)';
// 1. NOM DE MARQUE : "HELP Confort Saint-Omer & Dunkerque" -> "HELP Confort Saint-Omer" (une enseigne)
const reBrand = new RegExp(`HELP Confort Saint-Omer ${AMP} Dunkerque`, 'g');
// 2. TITRES : dans <title> / og:title / twitter:title, "Saint-Omer & Dunkerque" -> "Saint-Omer & Côte d'Opale"
const reTitleTag   = /<title>([\s\S]*?)<\/title>/gi;
const reOgTwTitle  = /<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']*)["']/gi;
function fixTitleJuxta(s){
  return s.replace(new RegExp(`Saint-Omer (&amp;) Dunkerque`, 'g'), "Saint-Omer &amp; Côte d'Opale")
          .replace(new RegExp(`Saint-Omer & Dunkerque`, 'g'), "Saint-Omer & Côte d'Opale");
}

let changed = 0, brandHits = 0, titleHits = 0;
for (const f of walk('.')){
  let h = fs.readFileSync(f, 'utf8'); const before = h;
  // pass 1 — marque
  brandHits += (h.match(reBrand) || []).length;
  h = h.replace(reBrand, 'HELP Confort Saint-Omer');
  // pass 2 — titres (title + og/twitter title)
  h = h.replace(reTitleTag, (m, inner) => { const nn = fixTitleJuxta(inner); if (nn!==inner) titleHits++; return `<title>${nn}</title>`; });
  h = h.replace(reOgTwTitle, (m, content) => { const nn = fixTitleJuxta(content); if (nn!==content) titleHits++; return m.replace(content, nn); });
  if (h !== before){ if (!dry) fs.writeFileSync(f, h); changed++; }
}
console.log(`${dry?'[DRY] ':''}reframe brand/title SO&DK: ${changed} fichiers, ${brandHits} noms de marque, ${titleHits} titres reframés`);
