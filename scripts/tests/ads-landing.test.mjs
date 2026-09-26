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

// ---- A. Chaudières : la destination est la page Chauffage depuis le 2026-09-24
// La landing autonome entretien-chaudiere.html a été supprimée (doublon de la page Chauffage, de la
// page contrats et du catalogue). Ce qu'elle garantissait pour une campagne payante — un bouton
// principal unique, mesuré, qui mène à la transaction, et aucun prix inventé — doit tenir sur la
// nouvelle destination. Les mesures fines du §7 du dossier Ads (encart de prix collant, FAQ
// structurée, condition SÉCURITÉ) portaient sur la page supprimée : elles sont à refaire avant tout
// GO, et le dossier le dit noir sur blanc.
const ch = rd('chauffagiste-saint-omer.html'), chTxt = visible(ch);
// La mesure est bien chargée, mais SANS ?v= — comme sur 58 pages du site (4 seulement sont
// versionnées). Les assets sont en cache immuable un an : un visiteur déjà venu garde l'ancien
// fichier. Constat signalé au §Findings du retour du 24/09, à traiter dans un lot dédié : reprendre
// 58 pages à la main dans ce lot-ci serait exactement le genre de retouche en masse qui casse.
ok('chaudière : script de mesure chargé sur la destination', /src="[^"]*assets\/tracking\.js/.test(ch));
// Deux entrées vers le tunnel, deux provenances distinctes : la carte savoir-faire et le teaser
// contrats (qui a remplacé le bloc détaillé le 26/09). Des provenances distinctes, c'est ce qui
// permet de savoir lequel des deux chemins convertit.
ok('chaudière : l’entretien ouvre le tunnel pré-contextualisé, avec une provenance mesurable',
  /href="catalogue\.html#cat=chauffage&amp;presta=entretien&amp;src=chauffage-svc"/.test(ch) &&
  /href="catalogue\.html#cat=chauffage&amp;presta=entretien&amp;src=chauffage-teaser"/.test(ch));
ok('chaudière : plus de lien vers l’ancien formulaire supprimé (#hc-reservation)', !/hc-reservation/.test(ch));
ok('chaudière : plus aucun lien vers la landing supprimée', !/href="(?:[^"]*\/)?entretien-chaudiere(\.html)?[#"]/.test(ch));
ok('chaudière : les trois formules sont présentées et mènent à la page de souscription',
  ['BASIC', 'CONFORT', 'SÉCURITÉ'].every((t) => ch.includes('>' + t + '<')) && /href="contrats-entretien\.html"/.test(ch));
ok('chaudière : un seul repère de prix, celui du catalogue, et aucune ancienne formule',
  /dès 9,90 € TTC\/mois/.test(chTxt.replace(/&nbsp;/g, ' ')) && !/Essentiel|130€|175€|210€|110-180/.test(chTxt));
ok('chaudière : aucune priorité de dépannage promise à tous les contrats (le BASIC gaz n’en a pas)',
  !/intervention prioritaire|priorité en cas de panne|priorité d'intervention/i.test(chTxt));
ok('chaudière : la destination est joignable au téléphone (campagne payante)', /tel:\+33366100134/.test(ch));
ok('chaudière : page indexable et canonique d’elle-même',
  /<link rel="canonical" href="https:\/\/depan59-62\.fr\/chauffagiste-saint-omer\.html">/.test(ch) && !/content="[^"]*noindex/.test(ch));

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

// Catalogue (nos-prestations) : les deux lignes prêtes dans _pending_migrations se rangeront avec les autres
// entretiens de la catégorie Chauffage, avec l'icône 🔥 — sans déplacer le service vitrerie « vitre d'insert ».
{
  const np = rd('nos-prestations.html');
  const i0 = np.indexOf('function deriveEmoji(s){'), i1 = np.indexOf(' services = services.map(', i0);
  const box2 = {};
  vm.runInNewContext(np.slice(i0, i1) + '\nthis.E = deriveEmoji; this.S = deriveSubcat;', box2);
  const bois = { slug: 'entretien-poele-insert-bois', name: 'Entretien poêle / insert à bois' };
  const gran = { slug: 'entretien-poele-insert-granules', name: 'Entretien poêle / insert à granulés' };
  const vitre = { slug: 'devis-vitre-insert-poele', name: 'Remplacement vitre insert / poêle' };
  ok('catalogue : entretien poêle / insert rangé dans « Entretien & dépannage » avec l’icône 🔥 (le service vitre d’insert n’est pas déplacé)',
    i0 > 0 && i1 > i0 && box2.S(bois)?.slug === 'chaudiere' && box2.S(gran)?.slug === 'chaudiere' && box2.E(bois) === '🔥' && box2.E(gran) === '🔥' && box2.S(vitre)?.slug !== 'chaudiere' && box2.E(vitre) !== '🔥');
  const sql = rd('supabase/_pending_migrations/20260919100000_catalogue_entretien_poele_insert.sql');
  ok('catalogue : les deux lignes sont prêtes (ramonage compris, certificat, prix ferme, acompte 40 % comme les autres entretiens) et marquées NON APPLIQUÉES',
    /'entretien-poele-insert-bois', 'Entretien poêle \/ insert à bois'/.test(sql) && /'entretien-poele-insert-granules', 'Entretien poêle \/ insert à granulés'/.test(sql) &&
    /Ramonage du conduit compris/.test(sql) && /Certificat de ramonage remis/.test(sql) && /115\.00, 0\.100, false, 40/.test(sql) && /136\.00, 0\.100, false, 40/.test(sql) &&
    /NON APPLIQUÉE — décision de Florian le 2026-09-22/.test(sql) && /Retour arrière/.test(sql));
}

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
