// reframe-footer-single-societe.mjs — UNE société (SARL Dépan'Audo, même SIREN 898 196 159).
// La ligne "réseau" du footer listait "Dépan'Audo & Dépan'DK · Sociétés du réseau" (2 entités) :
// or Dépan'DK n'est PAS une société distincte (même SIREN). Réponse directive 5523060107.
// Correctif SÛR, exact-match, format-preserving. Dunkerque reste zone desservie ailleurs (intact).
import fs from 'node:fs';
const dry = process.argv.includes('--dry');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const FROM = "Dépan'Audo &amp; Dépan'DK · Sociétés du réseau HELP Confort · Réseau national HELP Confort";
const TO   = "SARL Dépan'Audo · Société du réseau national HELP Confort";

let changed = 0, hits = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  if (!html.includes(FROM)) continue;
  const n = html.split(FROM).length - 1;
  hits += n;
  const out = html.split(FROM).join(TO);
  if (out !== html) { if (!dry) fs.writeFileSync(f, out); changed++; }
}
console.log(`${dry ? '[DRY] ' : ''}footer single-société: ${changed} fichiers, ${hits} lignes réseau corrigées (Dépan'DK société retirée)`);
