#!/usr/bin/env node
// Encart saisonnier entretien & ramonage (5733153347).
//
// Décision de Florian du 2026-09-28 : l'encart ne se ferme plus et il est présent sur TOUTES les
// pages du site, plus seulement sur l'accueil. Il ne vit donc plus dans `index.html` mais dans
// deux fichiers partagés, propagés avec l'en-tête. Ces contrôles disent ce qui doit rester vrai de
// cette décision — pas la forme d'hier.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promoPages, publicPages, PROMO_HORS_PERIMETRE } from '../header/sync-header.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const h = lire('index.html');
const js = lire('assets/hc-promo-saison.js');
const css = lire('assets/hc-promo-saison.css');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

console.log('\nENCART SAISONNIER — PRÉSENT PARTOUT, NON FERMABLE\n');

// Le balisage est fabriqué par le script : on l'isole pour l'inspecter comme avant.
const mod = (js.match(/el\.innerHTML =([\s\S]*?);\n/) || [''])[0];
const styleFlot = (css.match(/\.hcs-flot\{[^}]*\}/) || [''])[0];

ok('l’encart est produit une seule fois, et ne remplace pas « Que souhaitez-vous faire ? »',
  !!mod && (js.match(/id = 'entretien-saison'/g) || []).length === 1 && /Que souhaitez-vous faire \?/.test(h));
ok('il ne vit plus dans une page : ni section dans le flux, ni copie en dur dans l’accueil',
  !/<section class="hc-season"/.test(h) && !/hcs-flot/.test(h) && !/id="entretien-saison"/.test(h));
ok('il est réellement flottant : position fixe, au-dessus du contenu, et il ne pousse rien',
  /position:fixed/.test(styleFlot) && /z-index:\d+/.test(styleFlot));
ok('il ne recouvre pas la fenêtre d’action du bas sur mobile (marge au-dessus de la barre collante)',
  /bottom:calc\(84px \+ env\(safe-area-inset-bottom/.test(css));

// ── Les deux règles nouvelles, celles qui viennent de la décision du 2026-09-28
ok('il NE PEUT PAS être fermé : aucun bouton de fermeture, aucune mémoire de masquage',
  !/data-hcs-fermer|hcs-x/.test(js + css) && !/hc_promo_saison_ferme/.test(js) && !/localStorage/.test(js));
ok('il s’affiche sans condition : plus de seuil de défilement à franchir',
  !/innerHeight \* 0\.6|scrollY/.test(js) && /classList\.add\('est-visible'\)/.test(js));

const pages = promoPages();
const sans = pages.filter((p) => !/\/assets\/hc-promo-saison\.js/.test(lire(p)));
ok(`il est présent sur toutes les pages du site (${pages.length} pages, tunnel de commande compris)`,
  sans.length === 0, sans.slice(0, 5).join(', '));
ok('le tunnel de commande n’est pas une exception silencieuse : il porte l’encart lui aussi',
  pages.includes('catalogue.html') && /\/assets\/hc-promo-saison\.js/.test(lire('catalogue.html')));
// La seule page laissée dehors doit être prouvée technique, pas seulement déclarée telle.
ok(`la seule exception est documentée et prouvée (${PROMO_HORS_PERIMETRE.join(', ') || 'aucune'})`,
  PROMO_HORS_PERIMETRE.length === 1 && PROMO_HORS_PERIMETRE[0] === 'reset.html' &&
  /<meta name="robots" content="noindex, ?nofollow">/i.test(lire('reset.html')) &&
  /Reset cache navigateur/i.test(lire('reset.html')));
ok('il arrive par le même canal que l’en-tête (une seule source, jamais recopiée dans une page)',
  /hc-promo-saison\.css\?v=/.test(lire('index.html')) && /hc-promo-saison\.js\?v=/.test(lire('index.html')));

ok('1 message, 1 bouton principal, 2 entrées secondaires',
  (mod.match(/<h2\b/g) || []).length === 1 && (mod.match(/class="hcs-cta"/g) || []).length === 1 && (mod.match(/class="hcs-link"/g) || []).length === 2);

// Plus aucun bouton ne part au tunnel, donc plus aucun ne peut retomber sur l'écran « demande en cours ».
const cibles = [...mod.matchAll(/href="([^"]+)"[^>]*data-hc-promo-fam="([a-z-]+)"/g)].map((m) => ({ href: m[1], fam: m[2] }));
ok('les trois boutons mènent à la page Chauffage, chacun sur son ancre',
  cibles.length === 3 && cibles.every((c) => /^\/chauffagiste-saint-omer\.html#[a-z-]+$/.test(c.href)) &&
  new Set(cibles.map((c) => c.href)).size === 3);
ok('aucun bouton n’ouvre le tunnel ni un hub générique (c’est la régression corrigée)',
  !/catalogue\.html#/.test(mod) && !/#devis|#intervention|#entretien&|sujet=/.test(mod));
ok('les ancres visées existent sur la page Chauffage',
  cibles.every((c) => lire('chauffagiste-saint-omer.html').includes('id="' + c.href.split('#')[1] + '"')));

ok('aucun prix ni téléphone dans l’encart (source tarifaire : la page métier et le catalogue)', !/€|\d+\s?%|tel:|03 66/.test(mod));
ok('aucune promesse de délai ni de sécurité inventée', !/sous \d+ ?h|garanti|sécurité|obligatoire|urgent/i.test(mod));

ok('mesure : vue (moitié visible, une fois) et clic par famille, GA4 seulement en production et après consentement',
  /send\('view_home_maintenance_promo'/.test(js) && /service_family: a\.getAttribute\('data-hc-promo-fam'\)/.test(js) &&
  /if \(PROD && typeof window\.hcGtag === 'function'\)/.test(js) && /intersectionRatio >= 0\.5/.test(js));
ok('carte « entretien » du bloc principal : prix cohérent avec /contrats-entretien (9,90 € TTC)',
  /Dès 9,90 € TTC\/mois, chaudière gaz ou fioul\./.test(h) && !/Dès 9 €\/mois/.test(h));

// ── Exécution réelle : le script pose l'encart, le rend visible, et mesure une seule vue.
const { default: vm } = await import('node:vm');
let cb = null, clickHandler = null, gtagCalls = 0, ajoute = null, classes = [];
const el = {
  className: '', id: '', innerHTML: '',
  setAttribute: () => {}, addEventListener: (t, f) => { if (t === 'click') clickHandler = f; },
  classList: { add: (c) => classes.push(c) }
};
const win = {
  hcGtag: () => { gtagCalls++; },
  IntersectionObserver: function (f) { cb = f; this.observe = () => {}; this.disconnect = () => {}; },
  requestAnimationFrame: (f) => f()
};
const sandbox = {
  window: win, location: { hostname: 'deploy-preview-2--remarkable-dragon-364e2b.netlify.app', pathname: '/contact.html' },
  requestAnimationFrame: win.requestAnimationFrame,
  document: { readyState: 'complete', getElementById: () => null, createElement: () => el, body: { appendChild: (x) => { ajoute = x; } }, addEventListener: () => {} }
};
sandbox.IntersectionObserver = win.IntersectionObserver;
vm.runInNewContext(js.replace("if ('IntersectionObserver' in window)", "if (typeof IntersectionObserver === 'function')"), sandbox);
const entree = [{ isIntersecting: true, intersectionRatio: 0.6 }];
if (cb) { cb([{ isIntersecting: true, intersectionRatio: 0.2 }]); cb(entree); cb(entree); }
if (clickHandler) clickHandler({ target: { closest: () => ({ getAttribute: (k) => (k === 'data-hc-promo-fam' ? 'poele' : '/chauffagiste-saint-omer.html#poele-insert') }) } });
const log = win.__hcFunnel || [];

ok('exécution : l’encart est bien posé dans la page et rendu visible', ajoute === el && classes.includes('est-visible'));
ok('exécution : 1 seule vue à 50 % visible (pas à 20 %, pas deux fois), clic avec sa famille, rien envoyé hors production',
  log.filter((x) => x.ev === 'view_home_maintenance_promo').length === 1 &&
  log.some((x) => x.ev === 'click_home_maintenance_promo' && x.p.service_family === 'poele') && gtagCalls === 0,
  JSON.stringify(log.map((x) => x.ev)));
ok('exécution : la mesure dit sur quelle page l’encart a été vu (il n’est plus réservé à l’accueil)',
  log.every((x) => x.p && x.p.page === '/contact.html'));

console.log(`\nRÉSULTAT ENCART SAISONNIER : ${pass} PASS / ${fail} FAIL\n`);
process.exit(fail ? 1 : 0);
