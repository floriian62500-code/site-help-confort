#!/usr/bin/env node
// Accueil : relance saisonnière entretien & ramonage (5733153347). Hors ligne ; rendu vérifié sur la Deploy Preview.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const h = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

// Décision Florian du 2026-09-26 : la relance n'est plus une section du flux, c'est une mise en
// avant commerciale FLOTTANTE, et ses trois boutons mènent à la page Chauffage. L'enchaînement
// voulu est : accueil → encart promo → page métier → prestation → tunnel. Ces contrôles disent
// ce qui doit rester vrai de cet enchaînement, pas la forme d'hier.
const iMod = h.indexOf('<aside class="hcs-flot" id="entretien-saison"');
const mod = iMod > 0 ? h.slice(iMod, h.indexOf('</aside>', iMod)) : '';
const styleFlot = (h.match(/\.hcs-flot\{[^}]*\}/) || [''])[0];

ok('l’encart existe, une seule fois, et ne remplace pas « Que souhaitez-vous faire ? »',
  !!mod && (h.match(/id="entretien-saison"/g) || []).length === 1 && /Que souhaitez-vous faire \?/.test(h));
ok('il ne vit plus dans le flux de la page : plus de <section class="hc-season">',
  !/<section class="hc-season"/.test(h) && /<aside class="hcs-flot"/.test(h));
ok('il est réellement flottant : position fixe, au-dessus du contenu, et il ne pousse rien',
  /position:fixed/.test(styleFlot) && /z-index:\d+/.test(styleFlot));
ok('il ne recouvre pas la fenêtre d’action du bas sur mobile (marge au-dessus de la barre collante)',
  /@media \(max-width:720px\)\{[^}]*\.hcs-flot\{[^}]*bottom:calc\(84px/.test(h.replace(/\s+/g, '')) || /bottom:calc\(84px \+ env\(safe-area-inset-bottom/.test(h));
ok('il se ferme, et ne revient pas de la semaine', /data-hcs-fermer/.test(mod) && /hc_promo_saison_ferme/.test(h) && /7 \* 864e5/.test(h));
ok('il n’apparaît qu’une fois le hero dépassé (une publicité qui recouvre l’accueil est une nuisance)',
  /window\.innerHeight \* 0\.6/.test(h) && /el\.hidden = false/.test(h));

ok('1 message, 1 bouton principal, 2 entrées secondaires',
  (mod.match(/<h2\b/g) || []).length === 1 && (mod.match(/class="hcs-cta"/g) || []).length === 1 && (mod.match(/class="hcs-link"/g) || []).length === 2);

// Le cœur de la demande : plus aucun bouton ne part au tunnel, donc plus aucun ne peut retomber
// sur l'écran « Vous avez une demande en cours ».
const cibles = [...mod.matchAll(/href="([^"]+)"[^>]*data-hc-promo-fam="([a-z-]+)"/g)].map((m) => ({ href: m[1], fam: m[2] }));
ok('les trois boutons mènent à la page Chauffage, chacun sur son ancre',
  cibles.length === 3 && cibles.every((c) => /^\/chauffagiste-saint-omer\.html#[a-z-]+$/.test(c.href)) &&
  new Set(cibles.map((c) => c.href)).size === 3);
ok('aucun bouton n’ouvre le tunnel ni un hub générique (c’est la régression corrigée)',
  !/catalogue\.html#/.test(mod) && !/#devis|#intervention|#entretien&|sujet=/.test(mod));
ok('les ancres visées existent sur la page Chauffage',
  cibles.every((c) => fs.readFileSync(path.join(ROOT, 'chauffagiste-saint-omer.html'), 'utf8').includes('id="' + c.href.split('#')[1] + '"')));

ok('aucun prix ni téléphone dans l’encart (source tarifaire : la page métier et le catalogue)', !/€|\d+\s?%|tel:|03 66/.test(mod));
ok('aucune promesse de délai ni de sécurité inventée', !/sous \d+ ?h|garanti|sécurité|obligatoire|urgent/i.test(mod));

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
