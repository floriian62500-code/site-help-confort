#!/usr/bin/env node
// Accueil : relance saisonnière entretien & ramonage (5733153347). Hors ligne ; rendu vérifié sur la Deploy Preview.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

const iRes = h.indexOf('<section id="hc-reservation"'), iEndRes = h.indexOf('</section>', iRes), iMod = h.indexOf('<section class="hc-season" id="entretien-saison"');
const mod = iMod > 0 ? h.slice(iMod, h.indexOf('</section>', iMod)) : '';
ok('placé juste après « Que souhaitez-vous faire ? », sans le remplacer', iRes > 0 && iMod > iEndRes && h.slice(iEndRes, iMod).replace(/<!--[\s\S]*?-->/g, '').trim() === '</section>' && /Que souhaitez-vous faire \?/.test(h));
ok('un seul module (pas de carrousel, pas de fenêtre)', (h.match(/id="entretien-saison"/g) || []).length === 1 && !/carousel|setInterval|popup|modal/i.test(mod));
ok('1 message, 1 bouton principal (chaudière → page d’atterrissage), 2 entrées secondaires (poêle / insert, ramonage)', (mod.match(/<h2\b/g) || []).length === 1 && (mod.match(/class="hcs-cta"/g) || []).length === 1 && /<a class="hcs-cta" href="\/entretien-chaudiere\.html" data-hc-promo-fam="chaudiere">/.test(mod) && (mod.match(/class="hcs-link"/g) || []).length === 2 && /href="\/entretien-poele-insert\.html" data-hc-promo-fam="poele"/.test(mod) && /href="\/prestations\/ramonage\.html" data-hc-promo-fam="ramonage"/.test(mod));
ok('aucun prix ni téléphone dans le module (source tarifaire : pages dédiées)', !/€|\d+\s?%|tel:|03 66/.test(mod.replace(/<style>[\s\S]*?<\/style>/, '')));
ok('aucune promesse de délai ni de sécurité inventée', !/sous \d+ ?h|garanti|sécurité|obligatoire|urgent/i.test(mod.replace(/<style>[\s\S]*?<\/style>/, '')));
ok('mesure : vue (moitié visible, une fois) et clic par famille, GA4 seulement en production et après consentement', /send\('view_home_maintenance_promo'/.test(h) && /send\('click_home_maintenance_promo', \{ module: 'entretien_saison', service_family: a\.getAttribute\('data-hc-promo-fam'\)/.test(h) && /if \(PROD && typeof window\.hcGtag === 'function'\)/.test(h) && /intersectionRatio >= 0\.5/.test(h));
ok('carte « entretien » du bloc principal : prix cohérent avec /contrats-entretien (9,90 € TTC, plus de « 9 €/mois » sans HT ni TTC)', /Dès 9,90 € TTC\/mois, chaudière gaz ou fioul\./.test(h) && !/Dès 9 €\/mois/.test(h));

console.log(`\nRÉSULTAT RELANCE ENTRETIEN ACCUEIL : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
