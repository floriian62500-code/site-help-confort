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
ok('accueil « Nos derniers chantiers » : classement chargé avant la vitrine et appliqué aux chantiers', iMod > 0 && iShow > iMod && /if\(!isActu\)\{ if\(x\.est_chantier===false\) return false; if\(window\.HcRealisations&&HcRealisations\.isRecruitment\(x\)\) return false;/.test(home));
ok('page Réalisations : recrutement exclu des deux sources (base et secours)', /\/assets\/hc-realisations\.js\?v=/.test(real) && /if \(window\.HcRealisations && HcRealisations\.isRecruitment\(r\)\) return false;/.test(real) && /\}\)\.filter\(function\(r\)\{ return !\(window\.HcRealisations && HcRealisations\.isRecruitment\(r\)\); \}\);/.test(real));
ok('générateur de fiches : aucune fiche chantier pour une annonce de recrutement', /const \{ isRecruitment \} = createRequire\(import\.meta\.url\)\('\.\.\/assets\/hc-realisations\.js'\)/.test(gen) && /&& !isRecruitment\(r\)\);/.test(gen));
ok('aucune fiche chantier existante pour l’annonce de recrutement', !fs.existsSync(path.join(ROOT, 'realisations/help-confort-saint-omer-recrute.html')));

console.log(`\nRÉSULTAT RÉALISATIONS : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
