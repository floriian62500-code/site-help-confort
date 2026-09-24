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
// 5812875220 : le bandeau n'envoie plus vers des pages de contenu. Le client qui clique a déjà dit
// ce qu'il voulait : chaque CTA ouvre le tunnel AVEC son contexte, et aucun ne repasse par un hub.
ok('1 message, 1 bouton principal, 2 entrées secondaires', (mod.match(/<h2\b/g) || []).length === 1 && (mod.match(/class="hcs-cta"/g) || []).length === 1 && (mod.match(/class="hcs-link"/g) || []).length === 2);
ok('chaudière : ouvre le tunnel sur la famille chauffage, ciblé sur l’entretien', /<a class="hcs-cta" href="\/catalogue\.html#cat=chauffage&amp;presta=entretien&amp;src=home-saison"[^>]*data-hc-promo-fam="chaudiere"/.test(mod));
ok('poêle / insert : ouvre le tunnel en devis, sujet déjà posé', /href="\/catalogue\.html#devis&amp;sujet=poele-insert&amp;src=home-saison"[^>]*data-hc-promo-fam="poele"/.test(mod));
ok('ramonage : ouvre le tunnel en devis, sujet déjà posé', /href="\/catalogue\.html#devis&amp;sujet=ramonage&amp;src=home-saison"[^>]*data-hc-promo-fam="ramonage"/.test(mod));
ok('aucun CTA ne renvoie vers un hub générique ni vers une page intermédiaire', !/href="\/catalogue\.html#(intervention|devis)"/.test(mod) && !/href="\/(entretien-chaudiere|prestations\/ramonage)/.test(mod));
ok('le bandeau dit ce qui est au prix ferme et ce qui part en devis', /prix ferme en ligne/.test(mod) && /sur devis/.test(mod));
ok('aucun prix ni téléphone dans le module (source tarifaire : pages dédiées)', !/€|\d+\s?%|tel:|03 66/.test(mod.replace(/<style>[\s\S]*?<\/style>/, '')));
ok('aucune promesse de délai ni de sécurité inventée', !/sous \d+ ?h|garanti|sécurité|obligatoire|urgent/i.test(mod.replace(/<style>[\s\S]*?<\/style>/, '')));
ok('mesure : vue (moitié visible, une fois) et clic par famille, GA4 seulement en production et après consentement', /send\('view_home_maintenance_promo'/.test(h) && /send\('click_home_maintenance_promo', \{ module: 'entretien_saison', service_family: a\.getAttribute\('data-hc-promo-fam'\)/.test(h) && /if \(PROD && typeof window\.hcGtag === 'function'\)/.test(h) && /intersectionRatio >= 0\.5/.test(h));
ok('carte « entretien » du bloc principal : prix cohérent avec /contrats-entretien (9,90 € TTC, plus de « 9 €/mois » sans HT ni TTC)', /Dès 9,90 € TTC\/mois, chaudière gaz ou fioul\./.test(h) && !/Dès 9 €\/mois/.test(h));

// Exécution réelle du script de mesure avec un observateur de visibilité simulé (le panneau de test masqué ne livre pas
// les notifications d'IntersectionObserver) : une seule vue même si le module entre plusieurs fois dans l'écran,
// rien n'est envoyé à GA4 hors production.
const code = (h.match(/<script>\n\/\* Relance entretien & ramonage \(5733153347\)[\s\S]*?<\/script>/) || [''])[0].replace(/^<script>|<\/script>$/g, '');
const { default: vm } = await import('node:vm');
let cb = null, clickHandler = null, gtagCalls = 0;
const box = { addEventListener: (t, f) => { if (t === 'click') clickHandler = f; } };
const win = { hcGtag: () => { gtagCalls++; } };
const sandbox = { window: win, document: { getElementById: id => (id === 'entretien-saison' ? box : null) }, location: { hostname: 'deploy-preview-2--remarkable-dragon-364e2b.netlify.app' },
  IntersectionObserver: function (f) { cb = f; this.observe = () => {}; this.disconnect = () => {}; } };
sandbox.window.IntersectionObserver = sandbox.IntersectionObserver;
vm.runInNewContext(code.replace('if (\'IntersectionObserver\' in window)', 'if (typeof IntersectionObserver === \'function\')'), sandbox);
const entree = [{ isIntersecting: true, intersectionRatio: 0.6 }];
if (cb) { cb([{ isIntersecting: true, intersectionRatio: 0.2 }]); cb(entree); cb(entree); }
if (clickHandler) clickHandler({ target: { closest: () => ({ getAttribute: k => (k === 'data-hc-promo-fam' ? 'poele' : '/prestations/ramonage.html#poele-insert') }) } });
const log = win.__hcFunnel || [];
ok('mesure (exécution) : 1 seule vue à 50 % visible (pas à 20 %, pas deux fois), clic avec sa famille, rien envoyé hors production', !!code && log.filter(x => x.ev === 'view_home_maintenance_promo').length === 1 && log.some(x => x.ev === 'click_home_maintenance_promo' && x.p.service_family === 'poele') && gtagCalls === 0, JSON.stringify(log.map(x => x.ev)));

console.log(`\nRÉSULTAT RELANCE ENTRETIEN ACCUEIL : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
