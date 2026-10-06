import { readFileSync, writeFileSync } from 'node:fs';
const PAGES = readFileSync('/tmp/pages.txt', 'utf8').split('\n').filter(Boolean);
const MOTIF = /(Deux agences|deux agences|2 agences|nos agences|ses agences|agences locales)/i;
const EXCLUS = { 'a-propos.html': 'citation + recit editorial, laisse volontairement',
                 'reseau-help-confort.html': 'reseau national HELP Confort, affirmation vraie',
                 'zones-intervention.html': 'commentaires JavaScript, non visibles',
                 'plan-du-site.html': 'libelle de navigation « Nos agences »' };
const etat = async (base) => {
  const res = { base, pages: 0, incoherentes: [], exclues: [] };
  for (const p of PAGES) {
    const r = await fetch(`${base}/${p}`).catch(() => null);
    if (!r || r.status !== 200) continue;
    res.pages++;
    const h = await r.text();
    // on ne regarde que le texte visible, pas les scripts
    const sansScript = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    if (MOTIF.test(sansScript)) (EXCLUS[p] ? res.exclues : res.incoherentes).push(p);
  }
  return res;
};
for (const [nom, base] of [['avant (production)', 'https://depan59-62.fr'], ['apres (PR #31)', 'https://deploy-preview-31--remarkable-dragon-364e2b.netlify.app']]) {
  const r = await etat(base);
  console.log(`\n### ${nom} — ${r.pages} pages servies`);
  console.log(`  incoherentes : ${r.incoherentes.length}${r.incoherentes.length ? ' → ' + r.incoherentes.slice(0, 8).join(', ') : ''}`);
  console.log(`  exclues assumees : ${r.exclues.length} → ${r.exclues.join(', ')}`);
  writeFileSync(`/tmp/req041-${nom.startsWith('avant') ? 'avant' : 'apres'}.json`, JSON.stringify(r, null, 1));
}
