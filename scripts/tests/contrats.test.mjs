#!/usr/bin/env node
// Page /contrats-entretien (P0 5732923542) : une seule grille de formules (source : vue v_contract_offers), page courte,
// promesses exactes, une seule agence, souscription mesurée et attribuée. Hors ligne ; le rendu réel des prix se vérifie
// sur la Deploy Preview.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ✅', n); } else { fail++; console.log('  ❌', n, d ? '— ' + d : ''); } };
const visible = h => h.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const htmlFiles = (dir = ROOT, out = []) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (/^(node_modules|\.git|docs|supabase|scripts)$/.test(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) htmlFiles(p, out); else if (e.name.endsWith('.html')) out.push(p); } return out; };

const h = rd('contrats-entretien.html'), txt = visible(h);
const main = h.slice(h.indexOf('<section class="contracts-hero" id="main-content">'), h.indexOf('<footer'));

// ---- 1. Une seule grille : l'ancien module à prix codés en dur (Essentiel 12,90 / Confort 19,90 / Premium 29,90) a disparu
ok('ancien module de prix supprimé (fichier assets/hc-pricing.js absent)', !fs.existsSync(path.join(ROOT, 'assets/hc-pricing.js')));
const stillLoaded = htmlFiles().filter(f => /hc-pricing\.js|<div data-hc-pricing/.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(ROOT, f));
ok('plus aucune page ne charge ni ne monte l’ancien module', !stillLoaded.length, stillLoaded.join(', '));
ok('page contrats : une seule grille (racine unique, 3 onglets gaz / fioul / adoucisseur)', (h.match(/id="contractOffersRoot"/g) || []).length === 1 && (h.match(/class="energy-pane"/g) || []).length === 3 && (main.match(/class="formula-grid"/g) || []).length === 3);
// (« Premium » reste légitime dans les noms de modèles de chaudière de l’assistant : Idra Premium Hybride, Zem Premium)
ok('page contrats : aucun prix ni nom de l’ancienne grille', !/Essentiel|'Premium'|Souscription Premium|12,90|19,90|29,90|154,80|238,80|358,80/.test(h));

// ---- 2. Prix : lus dans la base (v_contract_offers), affichés en TTC avec le HT, sans montant annuel contradictoire
const js = h.slice(h.indexOf('loadContractOffers'), h.indexOf('function openSouscriptionModal'));
ok('grille : prix TTC lu dans la base (price_ttc_month) et HT indiqué dessous (price_ht_month)', /fmt\(o\.price_ttc_month\)/.test(js) && /soit \$\{fmt\(o\.price_ht_month\)\} € HT par mois/.test(js) && /from\('v_contract_offers'\)/.test(js));
ok('grille : pas de montant annuel (fioul en base : 140 / 190 / 320 € HT par an ≠ 12 mensualités de 12 / 16 / 27 € HT)', !/price_ht_year|price_ttc_year|€ HT\/an/.test(js));
ok('souscription : le prix transmis reprend TTC et HT', /const dataPrix = `\$\{fromPrice \? 'à partir de ' : ''\}\$\{fmt\(o\.price_ttc_month\)\} € TTC\/mois \(\$\{fmt\(o\.price_ht_month\)\} € HT\)`;/.test(js));
ok('grille : prix lisible sur carte étroite (montant insécable, « TTC / mois » peut passer à la ligne ; en 768 le prix débordait de 40 à 57 px)', /<span class="formula-amount">\$\{fmt\(o\.price_ttc_month\)\}&nbsp;€<\/span>/.test(js) && /<small> TTC \/ mois<\/small>/.test(h) && /\.formula-amount\{white-space:nowrap\}/.test(h) && !/\.formula-price\{[^}]*white-space:nowrap/.test(h) && /@media\(min-width:768px\) and \(max-width:1023px\)\{\.formula-price\{font-size:1\.75rem\}\}/.test(h));
ok('grille : texte de chaque avantage dans un seul bloc (sinon « <strong>2 dépannages/an</strong> (MO + déplacement) » formait 2 éléments flex et débordait de 44 px en 768)', /<li class="\$\{f\.included === false \? 'no' : 'yes'\}"><span>\$\{safeFeature\(f\.text\)\}<\/span><\/li>/.test(js));
ok('souscription mobile : boutons de l’assistant dans l’écran (en 390, « Suivant » sortait de 18 px et « Envoyer ma demande » de 82 px ; libellés de la frise : 14 px hors de la carte)', /@media \(max-width:560px\)\{\.sw-nav\{flex-wrap:wrap;gap:10px\}\.sw-btn-next,\.sw-btn-submit\{flex:1 0 100%;justify-content:center\}\.sw-pstep-lbl\{display:none\}\}/.test(h));
ok('styles de la souscription : sélecteurs enfants rétablis (étape active et étapes faites visibles, animation d’ouverture, adresses, photos) et transitions valides', /\.sw-pstep\.is-active \.sw-pstep-circle\{/.test(h) && /\.sw-pstep\.is-done \.sw-pstep-circle\{/.test(h) && /\.sous-modal\.open \.sous-card\{animation:sousSlideUp \.35s/.test(h) && !/\.sw-pstep\.is-(active|done)\.sw-pstep|\.sous-addr-item\.saa-|\.sw-photo-preview-item\.sw-photo-rm|\.sous-modal\.open\.sous-card/.test(h) && !/(?:transition|animation)\s*:[^;}"]*[a-z]\.\d/.test(h));
ok('conditions : TVA expliquée (10 % particulier, logement de plus de 2 ans ; 20 % professionnel), 12 mensualités, 1 an, résiliation à l’échéance', /TVA 10 %, logement de plus de 2 ans/.test(txt) && /TVA 20 %/.test(txt) && /Prélèvement mensuel en 12 fois/.test(txt) && /résiliable à chaque échéance par lettre recommandée avec un préavis d'un mois/.test(txt));

// ---- 3. Page courte : hero (1 action) → formules → 3 raisons → FAQ → action finale
const sections = (main.match(/<section\b/g) || []).length;
ok('page courte : 5 sections (hero, formules, raisons, FAQ, renvois), une seule h1', sections === 5 && (h.match(/<h1\b/g) || []).length === 1, sections + ' sections');
ok('hero : une seule action (vers les formules)', (main.slice(0, main.indexOf('id="formules"')).match(/<a\b[^>]*class="ct-cta"/g) || []).length === 1 && /href="#formules" class="ct-cta" data-hc-cta="contrats_hero"/.test(h));
ok('3 raisons, sans répétition de la grille', ((h.match(/<ul class="ct-why-list">[\s\S]*?<\/ul>/) || [''])[0].match(/<li>/g) || []).length === 3);
// La page ne se ferme plus par un appel à l'action (décision Florian du 2026-09-26) : le bloc
// « une question avant de souscrire » répétait ce que le hero et chaque formule proposent déjà.
// Ce qui doit rester vrai : l'action existe toujours, mais une seule fois par endroit utile, et
// le paragraphe de renvois — la seule sortie pour qui n'a pas besoin d'un contrat — survit.
ok('la page ne se ferme plus par un appel à l’action redondant', !/contrats_final_formules|contrats_final_rappel|ct-final/.test(h) && !/Une question avant de souscrire/.test(h));
ok('l’action reste offerte là où elle sert : le hero et chaque formule', /data-hc-cta="contrats_hero"/.test(h) && /data-hc-cta="contrats_souscrire_\$\{escapeHtml\(o\.slug \|\| ''\)\}"/.test(h));
ok('pas de téléphone répété dans le corps (il est déjà dans l’en-tête)', !/href="tel:/.test(main));
const renvois = (h.match(/<p class="ct-ailleurs"[\s\S]*?<\/p>/) || [''])[0];
ok('le paragraphe de renvois survit, avec ses trois sorties (intervention, ramonage, la loi)',
  /catalogue\.html#cat=chauffage&amp;presta=entretien/.test(renvois) && /prestations\/ramonage\.html/.test(renvois) && /guide-entretien-chaudiere\.html/.test(renvois));
ok('aucune règle de style orpheline laissée par le bloc retiré', !/\.ct-final|\.ct-link\{/.test(h));
ok('plus de section « labels » ni de note interne affichée au public', !/HC-LABELS|Note pour la mise en ligne|hc-labels/.test(h));

// ---- 4. Promesses exactes (catalogue : la priorité n'existe qu'en fioul ; délai garanti dès CONFORT)
ok('aucune promesse inexacte (priorité pour tous, économies chiffrées, sans engagement, résiliation 1 clic, tarif personnalisé)', !/accès prioritaire|dépannage prioritaire|Intervention prioritaire|jusqu'à 12|jusqu&#x27;à 12|Sans engagement de durée|résiliation libre|Résiliation 1 clic|Tarif personnalisé|Tarifs HT clairs/i.test(h));
ok('méta : prix TTC, aucune priorité promise', /<meta name="description" content="[^"]*dès 9,90 € TTC\/mois/.test(h) && !/<meta[^>]*prioritaire/.test(h));
const faqLd = []; for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { (JSON.parse(m[1]).mainEntity || []).forEach(q => faqLd.push(q)); } catch (e) { faqLd.push({ name: 'JSON invalide', acceptedAnswer: { text: '' } }); } }
const koFaq = faqLd.filter(q => !(txt.includes(q.name.replace(/\s+/g, ' ')) && txt.includes(q.acceptedAnswer.text.replace(/\s+/g, ' '))));
ok('FAQ des données structurées = FAQ affichée (' + faqLd.length + ' questions)', faqLd.length === 4 && !koFaq.length, koFaq.map(q => q.name).join(' | '));

// ---- 4 bis. Souscription : on ne demande que ce qui est réellement transmis (RIB, facture et photos ne partaient jamais)
const form = h.slice(h.indexOf('id="sousForm"'), h.indexOf('</form>', h.indexOf('id="sousForm"')));
ok('souscription : aucun téléversement (RIB, facture, photos n’étaient jamais envoyés : seul « RIB fourni : oui » partait)', !/type="file"/.test(form) && !/files-rib|eqPhotos|docRib|docFacture|bindFile/.test(h));
ok('souscription : RIB annoncé avec le mandat SEPA après la visite technique (page et message à l’agence)', /Votre RIB : rien à envoyer maintenant/.test(form) && /'- RIB : à fournir avec le mandat SEPA, après la visite technique'/.test(h) && !/RIB fourni|Photos jointes/.test(h) && /<span class="sw-pstep-lbl">Prélèvement<\/span>/.test(h));
ok('souscription : plus d’objet « payload » construit mais jamais envoyé', !/var payload = \{/.test(h) && !/monthlyMatch/.test(h));
let syntaxErr = 0; for (const m of h.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) { try { new Function(m[1]); } catch (e) { syntaxErr++; } }
ok('scripts en ligne de la page syntaxiquement valides', syntaxErr === 0, syntaxErr + ' erreur(s)');

// ---- 5. Une seule agence (Saint-Omer)
ok('souscription : une seule agence, Saint-Omer (plus d’« agence Dunkerque » selon le code postal)', /function detectAgency\(cp\)\{\n return \{name:'Saint-Omer'/.test(h) && !/dunkerque@helpconfort\.com|name:'Dunkerque'/.test(h));

// ---- 6. Mesure et attribution (sans donnée personnelle)
ok('mesure : page marquée « contrat », scripts de mesure chargés', /<body data-hc-landing="contrat">/.test(h) && /\/assets\/tracking\.js\?v=/.test(h) && /\/assets\/hc-landing\.js\?v=\d{8}[a-z]/.test(h));
ok('mesure : chaque bouton « Souscrire » est identifié (formule)', /class="formula-cta" data-hc-cta="contrats_souscrire_\$\{escapeHtml\(o\.slug \|\| ''\)\}"/.test(h));
const open = h.slice(h.indexOf('function openSouscriptionModal'), h.indexOf('function closeSouscriptionModal'));
ok('mesure : ouverture de la souscription = démarrage du parcours (sans donnée personnelle)', /new CustomEvent\('hc:funnel-start', \{ detail: \{ entry: 'contrat', energie: energie, formule: formule \} \}\)/.test(open));
const sub = h.slice(h.indexOf('async function submitSouscription'), h.indexOf('</script>', h.indexOf('async function submitSouscription')));
const iOk = sub.indexOf("if (!resp.ok) { throw"), iEv = sub.indexOf("new CustomEvent('hc:lead-sent'"), iCatch = sub.indexOf('} catch (err)');
ok('mesure : envoi confirmé seulement après réponse positive du serveur (jamais dans le cas d’erreur)', iOk > 0 && iEv > iOk && iEv < iCatch && (sub.match(/hc:lead-sent/g) || []).length === 1);
ok('attribution : UTM, gclid, fbclid (après consentement) et page d’atterrissage jointes au dossier, liste blanche', /attribution: \(function \(\) \{/.test(sub) && /out = \{ landing: 'contrats-entretien' \}/.test(sub) && /\['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', '_first_landing'\]/.test(sub));
const lj = rd('assets/hc-landing.js');
ok('hc-landing.js : famille « contrat » acceptée, démarrage et envoi mesurés', /\^\([a-z|]*\bcontrat\b[a-z|]*\)\$/.test(lj) && /'hc:funnel-start'/.test(lj) && /send\('start_maintenance_funnel'/.test(lj));

console.log(`\nRÉSULTAT PAGE CONTRATS : ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
