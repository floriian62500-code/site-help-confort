#!/usr/bin/env node
// Pages d'atterrissage des campagnes « entretien » (directives 5728009113 et 5744476570) : promesses vraies, prix du catalogue,
// un bouton principal mesuré, mesure sans donnée personnelle. Hors ligne. Contrôle des prix contre la base :
// scripts/tests/smoke.mjs (en ligne).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };
const visible = h => h.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const faqLd = h => { const out = []; for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { const j = JSON.parse(m[1]); (j.mainEntity || []).forEach(q => q && q.acceptedAnswer && out.push(q.acceptedAnswer.text)); } catch (e) {} } return out; };

// Prix de référence (catalogue v_services_public + v_contract_offers, relevés le 18/09/2026 ; vérifiés en ligne par smoke.mjs)
const PRICES = ['121 € TTC', '178,20 € TTC', '218,90 € TTC', '9,90 €/mois', '13,20 €/mois', '14,30 €/mois', '17,60 €/mois', '25,30 €/mois', '29,70 €/mois'];

// ---- A. Chaudières : entretien-chaudiere.html
const ch = rd('entretien-chaudiere.html'), chTxt = visible(ch);
ok('chaudière : page marquée pour la mesure et scripts de mesure chargés', /<body data-hc-landing="chaudiere">/.test(ch) && /\/assets\/tracking\.js\?v=/.test(ch) && /\/assets\/hc-landing\.js\?v=/.test(ch));
ok('chaudière : bouton principal unique vers le tunnel (prestations chauffage à prix ferme), provenance mesurée', (ch.match(/data-hc-cta="landing_chaudiere_hero"/g) || []).length === 1 && /href="\/catalogue\.html#cat=chauffage&amp;src=entretien-chaudiere"[^>]*data-hc-cta="landing_chaudiere_hero"/.test(ch));
ok('chaudière : plus de lien vers l’ancien formulaire supprimé (#hc-reservation)', !/hc-reservation/.test(ch));
ok('chaudière : prix = catalogue et contrats réels (entretien ponctuel + 3 formules gaz/fioul)', PRICES.every(p => chTxt.includes(p)), PRICES.filter(p => !chTxt.includes(p)).join(', '));
ok('chaudière : plus d’anciennes formules ni de fourchettes non adossées au catalogue', !/Essentiel|Sérénité|Tranquillité|130€|175€|210€|110-180/.test(chTxt));
const chFaq = faqLd(ch).find(t => /Entretien ponctuel/.test(t)) || '';
ok('chaudière : la réponse « combien coûte » est identique dans la page et dans les données structurées', chFaq && chTxt.includes(chFaq), chFaq.slice(0, 60));
// Promesses conditionnelles (catalogue v_contract_offers) : la priorité n'existe qu'en fioul et le délai d'intervention
// garanti commence à CONFORT ; SÉCURITÉ est réservée aux chaudières de moins de 5 ans ; rappel 1 mois avant l'échéance.
ok('chaudière : aucune priorité de dépannage promise à tous les contrats (gaz BASIC n’en a pas)', !/intervention prioritaire|priorité en cas de panne|priorité d'intervention/i.test(ch) && /dès la formule CONFORT, intervention sous 48 h/.test(chTxt));
ok('chaudière : tableau des formules lisible en 390 (cartes empilées sous 640 px ; en 4 colonnes insécables, la page s’élargissait à 502 px)', /<table class="ec-offers">/.test(ch) && /@media \(max-width:640px\)\{\.ec-offers thead\{display:none\}\.ec-offers,\.ec-offers tbody,\.ec-offers tr,\.ec-offers td\{display:block\}/.test(ch) && !/<table style=/.test(ch));
ok('chaudière : prix jamais coupés en fin de ligne (« 1 » / « 000 € HT » vu en 390)', /\.nw\{white-space:nowrap\}/.test(ch) && /jusqu’à <span class="nw">1 000 € HT<\/span>/.test(ch));
// Design (5744476570) : la page canonique reprend le gabarit premium des pages prestations, pas une landing parallèle
ok('chaudière : gabarit premium du site (héros, bandeau de preuves, encart de prix collant, FAQ dépliante)', /<section class="seo-hero">/.test(ch) && /<section class="seo-stats">/.test(ch) && /<aside class="seo-form-side" id="demande">/.test(ch) && (ch.match(/<details class="seo-faq-item">/g) || []).length === 5 && !/class="ec-hero"/.test(ch));
ok('chaudière : prix fermes rappelés dans l’encart, second bouton mesuré séparément', /<ul class="ec-prices">/.test(ch) && /<b>121 € TTC<\/b>/.test(ch) && /<b>dès 178,20 € TTC<\/b>/.test(ch) && /<b>dès 9,90 € TTC\/mois<\/b>/.test(ch) && (ch.match(/data-hc-cta="landing_chaudiere_side"/g) || []).length === 1);
ok('chaudière : SÉCURITÉ affichée avec sa condition, rappel aligné sur le catalogue (un mois avant)', /Réservée aux chaudières de moins de 5 ans/.test(chTxt) && /un mois avant l’échéance/.test(chTxt) && !/2-3 semaines|bookons/.test(ch));
ok('chaudière : ni prestation hors catalogue (granulés) ni aide chiffrée ni qualification non affichée, y compris balises et données structurées', !/(gaz, fioul, granulés)|granulés à|granulés Saint|MaPrimeRénov|50-70|Qualigaz|PGN|130 à 210/.test(ch.replace(/\(gaz, fioul, granulés\) est obligatoire/, '')));

// FAQ : chaque question des données structurées est affichée, avec la même réponse (règle Google)
for (const [nom, html] of [['chaudière', ch], ['ramonage + poêle / insert', rm0()]]) {
  const t = visible(html), qs = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { (JSON.parse(m[1]).mainEntity || []).forEach(q => qs.push(q)); } catch (e) { qs.push({ name: 'JSON invalide', acceptedAnswer: { text: '' } }); } }
  const ko = qs.filter(q => !(t.includes(q.name) && t.includes(q.acceptedAnswer.text)));
  ok(nom + ' : FAQ des données structurées = FAQ affichée (' + qs.length + ' questions)', qs.length >= 3 && !ko.length, ko.map(q => q.name).join(' | '));
}
function rm0() { return rd('prestations/ramonage.html'); }

// ---- C. Ramonage : prestations/ramonage.html
const rm = rd('prestations/ramonage.html'), rmTxt = visible(rm);
ok('ramonage : page marquée pour la mesure et scripts de mesure chargés', /<body data-hc-landing="ramonage">/.test(rm) && /\/assets\/tracking\.js\?v=/.test(rm) && /\/assets\/hc-landing\.js\?v=/.test(rm));
ok('ramonage : bouton principal unique, mesuré, vers le formulaire court de la page', (rm.match(/data-hc-cta="landing_ramonage_hero"/g) || []).length === 1 && /href="#devis"[^>]*data-hc-cta="landing_ramonage_hero"/.test(rm) && /id="devis"/.test(rm) && /data-hc-lead="prestation"/.test(rm));
ok('ramonage : aucune promesse non garantie (délai en 1 h, « garantie complète », aides) ni prix non adossé au catalogue', !/Intervention en 1h|Garantie complète|Aides &amp; éligibilité|Aides & éligibilité|60-90/.test(rm));
ok('ramonage : engagements vrais (rappel sous 24 h ouvrées, certificat remis), coquille corrigée', /Rappel sous 24 h ouvrées/.test(rmTxt) && /Certificat de ramonage remis/.test(rmTxt) && !/ouvrées ouvrées/.test(rm));
ok('ramonage : formulaire à jour (événement d’envoi confirmé)', /hc-leads-capture\.js\?v=20260918a/.test(rm));

// ---- B. Poêles / inserts (5744476570) : plus de page dédiée, la section vit dans la page canonique ramonage
const PE = ['115 € HT', '136 € HT', '126,50 € TTC', '149,60 € TTC', '138 € TTC', '163,20 € TTC'];
ok('poêle : section dédiée dans la page canonique ramonage (ancre stable pour les annonces)', /<section class="seo-section" id="poele-insert">/.test(rm) && /<h2>Entretien poêle &amp; insert, ramonage compris<\/h2>/.test(rm) && !fs.existsSync(path.join(ROOT, 'entretien-poele-insert.html')));
ok('poêle : bouton mesuré vers le formulaire de la page, prestation indiquée sur le lead', (rm.match(/data-hc-cta="landing_poele_cta"/g) || []).length === 1 && /href="#devis" class="pi-cta" data-hc-cta="landing_poele_cta"/.test(rm) && /name="presta" value="Ramonage \/ entretien poêle, insert, cheminée"/.test(rm));
ok('poêle : tarifs du barème en HT et les deux TTC (10 % logement de plus de 2 ans, 20 % sinon), ramonage compris', PE.every(p => rmTxt.includes(p)) && /ramonage compris/i.test(rmTxt) && /TVA à 10 % pour un particulier dans un logement achevé depuis plus de 2 ans ; 20 %/.test(rmTxt), PE.filter(p => !rmTxt.includes(p)).join(', '));
ok('poêle : jamais un montant HT présenté comme TTC (115 € TTC, 136 € TTC)', !/115 € TTC|136 € TTC|115,00 € TTC|136,00 € TTC/.test(rm + ch));
ok('tarifs poêle non généralisés : absents de la page chaudière, réservés au poêle / insert sur la page ramonage', !/115 € HT|136 € HT/.test(ch) && /Pour un poêle ou un insert, nous proposons l'entretien annuel avec le ramonage compris : 115 € HT pour le bois, 136 € HT pour les granulés/.test(rmTxt) && /Pour une cheminée ou un conduit de chaudière, le tarif vous est confirmé avant l'intervention/.test(rmTxt));
const tarifs = rd('admin-pro/TARIFS_REFERENCE.md'), mig = rd('supabase/_pending_migrations/20260919100000_catalogue_entretien_poele_insert.sql');
ok('source tarifaire : EPB / EPG en HT dans la référence interne, ajout catalogue préparé (HT + TVA 10 %) mais non appliqué', /\*\*EPB\*\* \| Entretien annuel poêle \/ insert \*\*à bois\*\* — \*\*ramonage compris\*\* \| \*\*115 € HT\*\*/.test(tarifs) && /\*\*EPG\*\* \| Entretien annuel poêle \/ insert \*\*à granulés\*\* — \*\*ramonage compris\*\* \| \*\*136 € HT\*\*/.test(tarifs) && /115\.00, 0\.100/.test(mig) && /136\.00, 0\.100/.test(mig) && !fs.existsSync(path.join(ROOT, 'supabase/migrations/20260919100000_catalogue_entretien_poele_insert.sql')));

// ---- Mesure : assets/hc-landing.js et assets/hc-leads-capture.js
const lj = rd('assets/hc-landing.js');
ok('mesure : famille « poele » acceptée', /\^\(chaudiere\|ramonage\|contrat\|poele\)\$/.test(rd('assets/hc-landing.js')));
ok('mesure : événements prévus (vue, bouton principal, appel, envoi confirmé)', ['view_maintenance_landing', 'click_maintenance_cta', 'click_to_call', 'maintenance_submit', 'generate_lead'].every(e => lj.includes("'" + e + "'")));
ok('mesure : envoi à GA4 seulement en production et via hcGtag (qui n’existe qu’après consentement)', /var PROD = \/\^\(www\\\.\)\?depan59-62\\\.fr\$\/\.test\(location\.hostname\)/.test(lj) && /if \(!PROD\) return;/.test(lj) && /typeof window\.hcGtag !== 'function'/.test(lj) && !/gtag\(/.test(lj.replace(/hcGtag\(/g, '')));
// Comportement réel du nettoyage : aucun email, aucun numéro, familles en liste blanche
const box = { window: {}, document: { body: { getAttribute: () => 'chaudiere' }, addEventListener: () => {} }, location: { hostname: 'deploy-preview-2--remarkable-dragon-364e2b.netlify.app' }, setTimeout };
box.window.addEventListener = () => {}; box.addEventListener = () => {};
vm.runInNewContext(lj.replace('(function () {', '(function () { var window = this.window; ').replace(/window\.addEventListener/g, 'this.window.addEventListener'), box);
const log = (box.window.__hcFunnel || []);
ok('mesure (exécution) : vue de page consignée en recette, rien n’est envoyé hors production', log.length === 1 && log[0].ev === 'view_maintenance_landing' && log[0].p.service_family === 'chaudiere' && log[0].p.page_type === 'maintenance_landing');
const lc = rd('assets/hc-leads-capture.js');
const succ = lc.slice(lc.indexOf("showMessage(form, true, 'Demande envoyée avec succès ! Nous vous contacterons rapidement.')"));
ok('formulaire : événement émis seulement après succès serveur (jamais sur le piège à robots), sans donnée personnelle', /document\.dispatchEvent\(new CustomEvent\('hc:lead-sent', \{ detail: \{ type: form\.dataset\.hcLead \|\| '', form_type: payload\.form_type \|\| '' \} \}\)\)/.test(succ) && (lc.match(/hc:lead-sent/g) || []).length === 1);

console.log(`\nRÉSULTAT PAGES D'ATTERRISSAGE ENTRETIEN : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
