#!/usr/bin/env node
// Pages d'atterrissage des campagnes « entretien » (directive 5728009113) : promesses vraies, prix du catalogue,
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

// ---- C. Ramonage : prestations/ramonage.html
const rm = rd('prestations/ramonage.html'), rmTxt = visible(rm);
ok('ramonage : page marquée pour la mesure et scripts de mesure chargés', /<body data-hc-landing="ramonage">/.test(rm) && /\/assets\/tracking\.js\?v=/.test(rm) && /\/assets\/hc-landing\.js\?v=/.test(rm));
ok('ramonage : bouton principal unique, mesuré, vers le formulaire court de la page', (rm.match(/data-hc-cta="landing_ramonage_hero"/g) || []).length === 1 && /href="#devis"[^>]*data-hc-cta="landing_ramonage_hero"/.test(rm) && /id="devis"/.test(rm) && /data-hc-lead="prestation"/.test(rm));
ok('ramonage : aucune promesse non garantie (délai en 1 h, « garantie complète », aides) ni prix non adossé au catalogue', !/Intervention en 1h|Garantie complète|Aides &amp; éligibilité|Aides & éligibilité|60-90/.test(rm));
ok('ramonage : engagements vrais (rappel sous 24 h ouvrées, certificat remis), coquille corrigée', /Rappel sous 24 h ouvrées/.test(rmTxt) && /Certificat de ramonage remis/.test(rmTxt) && !/ouvrées ouvrées/.test(rm));
ok('ramonage : formulaire à jour (événement d’envoi confirmé)', /hc-leads-capture\.js\?v=20260918a/.test(rm));

// ---- Mesure : assets/hc-landing.js et assets/hc-leads-capture.js
const lj = rd('assets/hc-landing.js');
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
