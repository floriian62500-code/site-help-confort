#!/usr/bin/env node
// Réalisations : les annonces de recrutement ne sont pas des chantiers (vitrine de l'accueil, page Réalisations,
// générateur de fiches). Hors ligne.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const R = createRequire(import.meta.url)(path.join(ROOT, 'assets/hc-realisations.js'));
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };

// ---- Classement (textes réels de la base, 19/09/2026)
const recrut = { slug: 'help-confort-saint-omer-recrute', title: '🔧 HELP CONFORT SAINT-OMER RECRUTE', description: 'HELP CONFORT SAINT-OMER RECRUTE ! Nous renforçons notre équipe et recherchons : PLOMBIER SANITAIRE (CDI)', est_chantier: true };
const chantiers = [
  { title: '🔧 NOUVELLE INTERVENTION PLOMBERIE – HELP CONFORT SAINT OMER', description: 'Réalisation d’une intervention de plomberie' },
  { title: '🪵 **Remplacement de parquet massif**', description: 'Chez HELP CONFORT Saint-Omer, nous intervenons pour rénover vos sols' },
  { title: 'Remplacement de la serrurerie sur porte d’entrée', description: 'Rejoignez-nous sur Facebook pour suivre nos chantiers' }
];
ok('annonce de recrutement reconnue (même marquée est_chantier en base)', R.isRecruitment(recrut));
ok('vrais chantiers non exclus (y compris « Rejoignez-nous sur Facebook »)', chantiers.every(c => !R.isRecruitment(c)));
ok('tag du back-office prioritaire (post_type recrutement / realisation)', R.isRecruitment({ title: 'Chantier', ai_generated: { post_type: 'recrutement' } }) && !R.isRecruitment({ title: 'On recrute ? non : chantier', ai_generated: { post_type: 'realisation' } }));

// ---- Branchements
const home = rd('index.html'), real = rd('realisations.html'), gen = rd('scripts/gen-realisations.mjs');
const iMod = home.indexOf('/assets/hc-realisations.js?v='), iShow = home.indexOf("load(SUPA+'/functions/v1/realisations-json'");
ok('accueil « Nos derniers chantiers » : classement chargé avant la vitrine et appliqué aux chantiers', iMod > 0 && iShow > iMod && /if\(!isActu\)\{ if\(x\.est_chantier===false\) return false;[^\n]*if\(window\.HcRealisations&&HcRealisations\.isRecruitment\(x\)\) return false;/.test(home));
ok('page Réalisations : recrutement exclu des deux sources (base et secours)', /\/assets\/hc-realisations\.js\?v=/.test(real) && /if \(window\.HcRealisations && HcRealisations\.isRecruitment\(r\)\) return false;/.test(real) && /\}\)\.filter\(function\(r\)\{ return !\(window\.HcRealisations && HcRealisations\.isRecruitment\(r\)\); \}\);/.test(real));
ok('générateur de fiches : aucune fiche chantier pour une annonce de recrutement', /const \{ isRecruitment \} = createRequire\(import\.meta\.url\)\('\.\.\/assets\/hc-realisations\.js'\)/.test(gen) && /&& !isRecruitment\(r\)\);/.test(gen));
ok('aucune fiche chantier existante pour l’annonce de recrutement', !fs.existsSync(path.join(ROOT, 'realisations/help-confort-saint-omer-recrute.html')));

// ---- Liens des cartes (5744361478) : uniquement vers une fiche réellement générée
const manifest = JSON.parse(rd('realisations/index.json'));
const files = fs.readdirSync(path.join(ROOT, 'realisations')).filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')).sort();
ok('manifeste realisations/index.json = fiches présentes (' + files.length + '), sans l’annonce de recrutement', JSON.stringify(manifest.slugs) === JSON.stringify(files) && !manifest.slugs.includes('help-confort-saint-omer-recrute'), files.filter(f => !manifest.slugs.includes(f)).concat(manifest.slugs.filter(s => !files.includes(s))).join(', '));
ok('les deux chantiers sans fiche (clic « sans effet ») en ont une : plomberie du 17/09, parquet massif', files.includes('nouvelle-intervention-plomberie-help-confort-saint-omer') && files.includes('remplacement-de-parquet-massif'));
const redirects = rd('_redirects');
ok('chaque fiche a sa règle d’URL propre (/realisations/<slug> → fiche, avant le repli vers la liste)', manifest.slugs.every(s => redirects.includes('/realisations/' + s + ' /realisations/' + s + '.html 200')) && redirects.indexOf('/realisations/:slug ') > redirects.indexOf('/realisations/' + manifest.slugs[0] + ' '));
const pages = R.pagesFrom(manifest);
ok('lien de carte : fiche du manifeste, sinon aucun lien (jamais de destination fictive)', R.detailUrl('remplacement-de-parquet-massif', pages) === 'realisations/remplacement-de-parquet-massif.html' && R.detailUrl('fiche-inexistante', pages) === null && R.detailUrl('', pages) === null && Object.keys(R.pagesFrom({ slugs: ['ok-1', '../x', 'A B'] })).join() === 'ok-1');
ok('page Réalisations : l’image fait partie du lien (plus de visionneuse qui annulait le clic)', !/openLightbox|realLightbox|event\.preventDefault\(\)/.test(real));
ok('page Réalisations : carte = lien vers la fiche réelle (nom accessible), sinon carte sans lien ni « Voir le chantier »', /r\.url = window\.HcRealisations \? HcRealisations\.detailUrl\(slug, pages\) : null;/.test(real) && /'<a href="'\+r\.url\+'" class="real-card" aria-label="'\+titleAttr\+' — voir le chantier">' : '<article class="real-card real-card--nolink">'/.test(real) && /\(r\.url \? '<span class="read-more" aria-hidden="true">Voir le chantier →<\/span>' : ''\)/.test(real));
ok('page Réalisations : styles de carte rétablis (sélecteurs enfants, transitions valides), focus visible', !/\.real-card\.(body|meta|duree|read-more|ba-)|\.meta\.(metier|ville)|\.photo\.ph-fallback|\.real-card:hover\.read-more/.test(real) && !/(?:transition|animation)\s*:[^;}"]*[a-z]\.\d/.test(real) && /\.real-card:focus-visible\{outline:3px solid #0DA0CF/.test(real));
ok('accueil « Nos derniers chantiers » : seules les réalisations avec fiche sont affichées, lien garanti', /if\(!pages\|\|!pages\[x\.slug\]\) return false;/.test(home) && /var url='realisations\/'\+esc\(r\.slug\)\+'\.html'; \/\/ fiche garantie par le manifeste/.test(home));

// ---- Blocs « Nos chantiers » des pages métier et locales (5778526407) : UNE seule logique de sélection
// Le recrutement s'affichait encore dans « Nos chantiers plomberie » (/plombier-saint-omer) : 26 pages avaient
// leur propre copie du flux, sans le classement partagé.
const lecteurs = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).filter(f => /realisations-json|rest\/v1\/realisations|monterFluxMetier/.test(rd(f)));
const exceptions = { 'realisation.html': 'ancienne fiche dynamique, redirigée en 301 vers /realisations.html' };
const sansModule = lecteurs.filter(f => !exceptions[f] && !/\/assets\/hc-realisations\.js\?v=/.test(rd(f)));
ok('toute page publique qui affiche des publications charge le classement partagé (' + lecteurs.length + ' pages)', !sansModule.length, sansModule.join(', '));
const metierPages = lecteurs.filter(f => /^(plombier|chauffagiste|electricien|serrurier|menuisier|vitrier|volets|pmr|travaux)-/.test(f));
const copies = metierPages.filter(f => /\.filter\(function\(r\)\{[\s\S]{0,200}est_chantier/.test(rd(f)) || /realisations-json/.test(rd(f)));
ok('pages métier et locales : plus aucune copie locale du filtre, appel au module partagé (' + metierPages.length + ' pages)', metierPages.length >= 26 && !copies.length && metierPages.every(f => /HcRealisations\.monterFluxMetier\('m-real-[^']+', \{ metiers: \['[a-z]+'\], max: \d, tag: '[^']+' \}\)/.test(rd(f))), copies.join(', '));
const aa = rd('avant-apres.html');
ok('galerie avant/après : classement partagé appliqué aux deux sources (base et secours)', /allChantiers = garder\(allChantiers\);/.test(aa) && /allChantiers = garder\(await r\.json\(\)\);/.test(aa) && /HcRealisations\.estChantier\(c\)/.test(aa));
ok('actualités : l’annonce de recrutement reste une actualité mais renvoie vers la page Recrutement (pas vers une fiche inexistante)', /HcRealisations\.isRecruitment\(r\)\) \? '\/carrieres\.html'/.test(rd('actualites.html')));

// Exécution réelle de la sélection sur des publications de la base (19/09/2026)
const posts = [
  Object.assign({}, recrut, { metier: 'plomberie', published: true }),
  { slug: 'remplacement-de-parquet-massif', title: 'Remplacement de parquet massif', metier: 'serrurerie', est_chantier: true, published: true },
  { slug: 'nouvelle-intervention-plomberie-help-confort-saint-omer', title: 'NOUVELLE INTERVENTION PLOMBERIE', metier: 'plomberie', est_chantier: true, published: true },
  { slug: 'toute-lequipe-vous-adresse-ses-meilleurs-voeux', title: 'Toute l’équipe vous adresse ses meilleurs vœux', metier: 'plomberie', published: true },
  { slug: 'chantier-sans-fiche', title: 'Remplacement de mitigeur', metier: 'Plomberie', est_chantier: true, published: true },
  { slug: 'renovation-cuisine', title: 'Rénovation de cuisine', metier: 'Rénovation', est_chantier: true, published: true },
  { slug: 'douche-pmr', title: 'Douche de plain-pied', metier: 'Adaptation PMR', est_chantier: true, published: true }
];
const fiches = R.pagesFrom({ slugs: ['help-confort-saint-omer-recrute', 'remplacement-de-parquet-massif', 'nouvelle-intervention-plomberie-help-confort-saint-omer', 'toute-lequipe-vous-adresse-ses-meilleurs-voeux', 'renovation-cuisine', 'douche-pmr'] });
const plomb = R.chantiersPour(posts, { metiers: ['plomberie'], max: 4, pages: fiches }).map(r => r.slug);
ok('sélection plomberie : l’annonce de recrutement est exclue même si elle a une fiche et le métier plomberie', !plomb.includes('help-confort-saint-omer-recrute') && plomb.includes('nouvelle-intervention-plomberie-help-confort-saint-omer'), plomb.join(', '));
ok('sélection : les vœux ne sont pas un chantier, une publication sans fiche n’est pas affichée (jamais de lien mort)', !plomb.includes('toute-lequipe-vous-adresse-ses-meilleurs-voeux') && !plomb.includes('chantier-sans-fiche'));
ok('sélection : métiers normalisés (« Rénovation » = travaux, « Adaptation PMR » = pmr, casse et accents ignorés)', R.chantiersPour(posts, { metiers: ['travaux'], pages: fiches }).map(r => r.slug).join() === 'renovation-cuisine' && R.chantiersPour(posts, { metiers: ['pmr'], pages: fiches }).map(r => r.slug).join() === 'douche-pmr');
const carte = R.carteMetier({ slug: 'renovation-cuisine', title: '<img src=x onerror=alert(1)>', description: '"><script>x</script>', metier: 'travaux' }, 'Rénovation', fiches);
ok('rendu : titres et textes échappés (le contenu vient de Facebook), lien vers la vraie fiche', !/<img src=x|<script>/.test(carte) && /&lt;img src=x onerror=alert\(1\)&gt;/.test(carte) && /href="\/realisations\/renovation-cuisine\.html"/.test(carte));

console.log(`\nRÉSULTAT RÉALISATIONS : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
