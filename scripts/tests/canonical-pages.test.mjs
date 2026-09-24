#!/usr/bin/env node
// Pages canoniques (5744476570) : une seule URL par intention, doublon redirigé, Ads / accueil / sitemap alignés,
// garde-fou anti-doublon opérationnel. Hors ligne.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const existe = p => fs.existsSync(path.join(ROOT, p));
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

const REG = JSON.parse(rd('docs/seo/pages-canoniques.json'));
const reds = rd('_redirects'), home = rd('index.html'), ads = rd('docs/marketing/PAID-ACQUISITION-ENTRETIEN-2026-09.md');
const sitemap = rd('supabase/functions/sitemap/index.ts');
const CHAUD = '/chauffagiste-saint-omer.html', RAM = '/prestations/ramonage.html', DOUBLON = '/entretien-poele-insert.html';

// ---- Registre et règle projet
ok('règle inscrite dans le contrat de travail du repo et documentée', /SEARCH_EXISTING → IDENTIFY_CANONICAL → REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE/.test(rd('CLAUDE.md')) && existe('docs/process/REGLE-PAGE-CANONIQUE.md') && REG.regle.includes('CREATE_ONLY_IF_NONE'));
const intentions = REG.intentions.map(i => i.canonique);
ok('registre : une page canonique par intention, toutes présentes', intentions.length >= 4 && intentions.every(u => existe(u.replace(/^\//, ''))), intentions.filter(u => !existe(u.replace(/^\//, ''))).join(', '));

// ---- Le doublon n'existe plus et ne laisse aucun lien mort
ok('page doublon supprimée (poêle / insert)', !existe(DOUBLON.replace(/^\//, '')));
ok('redirections permanentes vers la section canonique (avec et sans .html)', /\/entretien-poele-insert\.html\s+\/prestations\/ramonage\.html#poele-insert\s+301!/.test(reds) && /\/entretien-poele-insert\s+\/prestations\/ramonage\.html#poele-insert\s+301!/.test(reds));
const restes = ['index.html', 'prestations/ramonage.html', 'contrats-entretien.html', 'chauffagiste-saint-omer.html', 'realisations.html', 'nos-prestations.html']
  .filter(f => rd(f).includes('entretien-poele-insert'));
ok('aucune page ne pointe encore vers le doublon', !restes.length, restes.join(', '));
ok('dossier Ads : plus aucune destination vers le doublon (mention historique tolérée), familles pointées sur les pages canoniques', !/depan59-62\.fr\/entretien-poele-insert|`entretien-poele-insert\.html` →/.test(ads) && ads.includes(RAM + '#poele-insert') && ads.includes(CHAUD));

// ---- Une seule URL canonique côté accueil, sitemap et balises
// 5812875220 : le bandeau d'accueil est devenu transactionnel — il ouvre le tunnel avec le contexte
// au lieu de renvoyer vers les pages de contenu. La règle canonique porte donc désormais sur les
// pages elles-mêmes (canonical, sitemap, liens internes), pas sur le bandeau.
ok('accueil : la relance saisonnière ouvre le tunnel avec son contexte, sans page intermédiaire',
  /href="\/catalogue\.html#cat=chauffage&amp;presta=entretien/.test(home) &&
  /href="\/catalogue\.html#devis&amp;sujet=poele-insert/.test(home) &&
  /href="\/catalogue\.html#devis&amp;sujet=ramonage/.test(home));
ok('sitemap : les deux pages canoniques listées, le doublon retiré', sitemap.includes(CHAUD + ' ') && sitemap.includes(RAM + ' ') && !sitemap.includes('entretien-poele-insert'));
for (const [nom, f, url] of [['chaudière', 'chauffagiste-saint-omer.html', CHAUD], ['ramonage + poêle / insert', 'prestations/ramonage.html', RAM]]) {
  const s = rd(f);
  ok(nom + ' : canonical auto-référent et page indexable', new RegExp('<link rel="canonical" href="https://depan59-62\\.fr' + url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"').test(s) && !/content="[^"]*noindex/.test(s));
}

// ---- Contenu fusionné dans la page canonique ramonage (rien de perdu)
const rm = rd('prestations/ramonage.html');
ok('ramonage : intention élargie dans le titre, le H1 et le fil d’ariane', /<title>Ramonage &amp; entretien poêle\/insert à Saint-Omer \| HELP Confort<\/title>/.test(rm) && /Ramonage &amp; entretien<br>poêle, insert, cheminée/.test(rm) && /Ramonage &amp; entretien poêle \/ insert<\/nav>/.test(rm));
ok('ramonage : section poêle / insert complète (ancre, barème, ce qui est compris, TVA, bouton)', /id="poele-insert"/.test(rm) && /<table class="pi-table">/.test(rm) && /<ul class="pi-list">/.test(rm) && /TVA à 10 %/.test(rm) && /data-hc-cta="landing_poele_cta"/.test(rm));
ok('ramonage : données structurées alignées sur la nouvelle intention', /"name": ?"Ramonage & entretien poêle, insert, cheminée"/.test(rm) && /Le ramonage est-il compris dans l’entretien d’un poêle ou d’un insert \?|Le ramonage est-il compris dans l'entretien d'un poêle ou d'un insert \?/.test(rm));
ok('ramonage : tableau du barème lisible en 390 (cartes empilées sous 640 px)', /@media \(max-width:640px\)\{\.pi-table thead\{display:none\}/.test(rm));

// ---- La landing autonome a disparu, et le parcours ne s'est pas troué (2026-09-24)
// Décision de Florian : /entretien-chaudiere.html doublonnait la page Chauffage, la page contrats
// et le catalogue. Elle était EN LIGNE et DANS LE SITEMAP de production : la redirection doit donc
// voyager dans le même lot que la suppression, sinon une URL indexée tombe en 404.
const ch = rd('chauffagiste-saint-omer.html');
ok('landing autonome supprimée du dépôt', !existe('entretien-chaudiere.html'));
ok('redirection permanente prête, avec et sans .html, vers la page Chauffage',
  /\/entretien-chaudiere\.html\s+\/chauffagiste-saint-omer\.html\s+301!/.test(reds) &&
  /\/entretien-chaudiere\s+\/chauffagiste-saint-omer\.html\s+301!/.test(reds));
ok('sitemap : l’URL supprimée n’y est plus (le guide et l’article de blog, eux, restent)',
  !/\/entretien-chaudiere\.html /.test(sitemap) && sitemap.includes('/guide-entretien-chaudiere.html ') && sitemap.includes('/blog-entretien-chaudiere-annuel-obligatoire.html '));
const pointent = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))
  .concat(fs.readdirSync(path.join(ROOT, 'prestations')).filter(f => f.endsWith('.html')).map(f => 'prestations/' + f))
  .filter(f => /href="(?:[^"]*\/)?entretien-chaudiere(\.html)?[#"]/.test(rd(f)));
ok('aucune page publique ne pointe encore vers la landing supprimée', !pointent.length, pointent.join(', '));
ok('page Chauffage : elle porte l’entretien (vers le tunnel, provenance mesurée) et les contrats',
  /href="catalogue\.html#cat=chauffage&amp;presta=entretien&amp;src=chauffage-svc"/.test(ch) &&
  /href="contrats-entretien\.html"/.test(ch) && ['BASIC', 'CONFORT', 'SÉCURITÉ'].every(t => ch.includes('>' + t + '<')));

// ---- Le garde-fou tourne et bloque un doublon non justifié
let sortie = '', code = 0;
try { sortie = execFileSync('node', [path.join(ROOT, 'scripts/seo/duplicate-intent.mjs')], { encoding: 'utf8' }); }
catch (e) { sortie = String(e.stdout || '') + String(e.stderr || ''); code = e.status || 1; }
ok('garde-fou anti-doublon : aucune paire NOUVELLE non justifiée', code === 0 && /aucune paire NOUVELLE non justifiée/.test(sortie), sortie.split('\n').filter(l => l.includes('❌')).slice(0, 3).join(' / '));
ok('garde-fou : doublons hérités signalés, pas masqués (actualités ↔ fiches chantier)', /avertissement\(s\) hérité\(s\)/.test(sortie) && (REG.doublons_connus || []).length >= 1);
let aide = '';
try { aide = execFileSync('node', [path.join(ROOT, 'scripts/seo/duplicate-intent.mjs'), '--intent', 'entretien poele insert granules ramonage'], { encoding: 'utf8' }); } catch (e) { aide = ''; }
ok('garde-fou : la recherche préalable désigne la page canonique ramonage', aide.includes(RAM), aide.split('\n').slice(0, 4).join(' / '));

console.log(`\nRÉSULTAT PAGES CANONIQUES : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
