#!/usr/bin/env node
// Module « Ma demande » v2 — parcours INTERVENTION + DEVIS (cœur pur) et CONTRAT réel submit-lead-v6.
// Le contrat est lu dans supabase/functions/submit-lead-v6/index.ts (source de vérité), pas recopié.
//   node scripts/tests/demande-v2.test.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cat = readFileSync(join(ROOT, 'catalogue.html'), 'utf8');
const coreFile = readFileSync(join(ROOT, 'assets', 'hc-demande-core.js'), 'utf8');
const uiFile = readFileSync(join(ROOT, 'assets', 'hc-demande.js'), 'utf8');
const cssFile = readFileSync(join(ROOT, 'assets', 'hc-demande.css'), 'utf8');
const box = { module: { exports: {} } };
vm.runInNewContext(coreFile, box);
const C = box.module.exports;
let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };

// ---- Parcours INTERVENTION : lieu → besoin → (accès tarifs) → précision → demande → coordonnées → prise en charge → envoyé
const I = C.FLOWS.intervention;
ok('intervention : 6 étapes dans l’ordre demandé', JSON.stringify(I) === JSON.stringify(['lieu', 'besoin', 'precision', 'demande', 'coordonnees', 'creneau']));
let s = 'choix'; const walked = [];
const ctx = { mode: 'intervention', lieuOk: true, fam: null, lines: 0, contactOk: false, gateOk: false };
s = C.nextStep('intervention', 'choix'); walked.push(s);
s = C.nextStep('intervention', s, ctx); walked.push(s);                     // besoin
ctx.fam = 'plomberie'; s = C.guardStep(C.nextStep('intervention', s, ctx), ctx); walked.push(s); // précision gardée → accès
ctx.gateOk = true; s = C.guardStep('precision', ctx); walked.push(s);
ctx.lines = 2; s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
ctx.contactOk = true; s = C.guardStep(C.nextStep('intervention', s), ctx); walked.push(s);
s = C.nextStep('intervention', s); walked.push(s);
ok('intervention : parcours complet ' + walked.join(' → '), walked.join(',') === 'lieu,besoin,acces,precision,demande,coordonnees,creneau,envoye');
ok('intervention : lien métier (#cat) saute « besoin » après le lieu', C.nextStep('intervention', 'lieu', { fam: 'serrurerie' }) === 'precision');
ok('intervention : pas de lieu → retour au lieu', C.guardStep('demande', { mode: 'intervention', lieuOk: false, gateOk: true, lines: 1 }) === 'lieu');
ok('intervention : demande vide → précision', C.guardStep('coordonnees', { mode: 'intervention', lieuOk: true, gateOk: true, fam: 'x', lines: 0 }) === 'precision');
ok('intervention : prise en charge sans coordonnées → coordonnées', C.guardStep('creneau', { mode: 'intervention', lieuOk: true, gateOk: true, fam: 'x', lines: 1, contactOk: false }) === 'coordonnees');
ok('envoyé inaccessible sans envoi réel', C.guardStep('envoye', { mode: 'intervention' }) === 'choix');

// ---- Parcours DEVIS : métier → projet → photos → lieu → coordonnées → vérification → envoyé
const D = C.FLOWS.devis;
ok('devis : 6 étapes dans l’ordre demandé', JSON.stringify(D) === JSON.stringify(['dv-metier', 'dv-projet', 'dv-photos', 'lieu', 'coordonnees', 'dv-recap']));
const dctx = { mode: 'devis', dv: { metiers: [], desc: '' }, lieuOk: false, contactOk: false };
ok('devis : projet sans métier → métier', C.guardStep('dv-projet', dctx) === 'dv-metier');
dctx.dv.metiers = ['Rénovation'];
ok('devis : photos sans description → projet', C.guardStep('dv-photos', dctx) === 'dv-projet');
dctx.dv.desc = 'Rénovation complète salle de bain';
ok('devis : photos facultatives accessibles', C.guardStep('dv-photos', dctx) === 'dv-photos');
ok('devis : vérification sans lieu → lieu', C.guardStep('dv-recap', dctx) === 'lieu');
dctx.lieuOk = true; ok('devis : vérification sans coordonnées → coordonnées', C.guardStep('dv-recap', dctx) === 'coordonnees');
dctx.contactOk = true; ok('devis : vérification accessible', C.guardStep('dv-recap', dctx) === 'dv-recap');
ok('devis : jamais d\u2019écran « accès tarifs » (aucun prix dans le parcours devis)', D.every(x => C.guardStep(x, { ...dctx, gateOk: false }) === x));
ok('devis : lieu → coordonnées → vérification', C.nextStep('devis', 'lieu') === 'coordonnees' && C.nextStep('devis', 'coordonnees') === 'dv-recap');

// ---- Liens existants du site
ok('liens : #step=devis → devis étape 1', C.legacyStep('devis') === 'dv-metier');
ok('liens : ancien panier → Ma demande', C.legacyStep('cart') === 'demande');
ok('liens : étape inconnue → entrée', C.legacyStep('xyz') === 'choix');

// ---- Zone (agence unique Saint-Omer) et prix
const zSO = C.zoneFor(50.7508, 2.2522, '62500'), zBoul = C.zoneFor(50.7264, 1.6147, '62200'), zParis = C.zoneFor(48.8566, 2.3522, '75001');
ok('zone : Saint-Omer dans la zone', zSO.status === 'in');
ok('zone : Boulogne-sur-Mer dans la zone', zBoul.status === 'in');
ok('zone : Paris hors zone', zParis.status === 'out');
ok('zone : texte jamais « agence de Dunkerque »', !/agence de dunkerque|nos deux agences/i.test(JSON.stringify(['in', 'edge', 'out', 'unknown'].map(st => C.zoneText({ status: st, km: 30 }, 'Dunkerque')))));
ok('prix : 114,43 € affiché au centime (pas arrondi)', C.eur(114.43) === '114,43 €');
ok('prix : tarif au m² = « à confirmer »', C.priceKind({ name: 'Mise en sécurité vitre (au m²)', price_ttc: 120 }) === 'confirmer');
ok('prix : sur devis', C.priceKind({ name: 'Peinture', price_ttc: 0, requires_quote: true }) === 'devis');
ok('référence : dérivée de l’id réel, jamais inventée', C.refFromId('3f2a9c1e-0b4d-4e1a-9c3f-2b7d8e6a1c90') === 'HC-3F2A9C1E' && C.refFromId(null) === null);
ok('simulation : jamais sur le domaine de production', !C.simulationAllowed('depan59-62.fr') && !C.simulationAllowed('www.depan59-62.fr') && !C.simulationAllowed('remarkable-dragon-364e2b.netlify.app'));

// ---- CONTRAT RÉEL submit-lead-v6 (lu dans la fonction edge)
const edge = readFileSync(join(ROOT, 'supabase/functions/submit-lead-v6/index.ts'), 'utf8');
const contracts = {};
for (const m of edge.matchAll(/^\s*([a-z_]+):\s*\{\s*name:\s*(true|false),\s*contact:\s*(true|false),\s*cp:\s*(true|false),\s*ville:\s*(true|false),\s*adresse:\s*(true|false),\s*message:\s*(true|false),\s*metier:\s*(true|false)\s*\}/gm)) {
  contracts[m[1]] = { name: m[2] === 'true', contact: m[3] === 'true', cp: m[4] === 'true', ville: m[5] === 'true', adresse: m[6] === 'true', message: m[7] === 'true', metier: m[8] === 'true' };
}
ok('contrat : matrice lue dans la fonction edge (demande_metier, devis_express, rappel)', !!(contracts.demande_metier && contracts.devis_express && contracts.rappel));
function violations(p) {
  const k = contracts[p.form_type] || contracts.demande_metier, e = [];
  if (k.name && !p.nom && !p.prenom) e.push('nom');
  if (k.contact && !(C.phoneOk(p.telephone) || C.emailOk(p.email))) e.push('contact');
  if (k.adresse && !(p.adresse && p.adresse.length >= 5)) e.push('adresse');
  if (k.cp && !p.code_postal) e.push('cp'); if (p.code_postal && !C.cpOk(p.code_postal)) e.push('cp invalide');
  if (k.ville && !p.ville) e.push('ville'); if (k.message && !p.message) e.push('message'); if (k.metier && !p.metier) e.push('metier');
  return e;
}
const contact = { prenom: 'Marie', nom: 'Durand', tel: '06 12 34 56 78', email: 'marie@exemple.fr' };
const lieu = { adresse: '12 rue de Dunkerque', cp: '62500', ville: 'Saint-Omer', zone: zSO };
const byId = { a: { id: 'a', name: 'Intervention urgente plomberie — 1h + déplacement', price_ttc: 114.43, category_name: 'Plomberie & Sanitaires' }, b: { id: 'b', name: 'Peinture intérieure', price_ttc: 0, requires_quote: true, category_name: 'Rénovation' } };
const lines = [{ id: 'a', slug: 'x', name: byId.a.name, ttc: 114.43, qty: 1 }, { id: 'b', slug: 'y', name: byId.b.name, ttc: 0, requires_quote: true, qty: 1 }];
const pI = C.interventionPayload({ lines, byId, contact, lieu, prise: { quand: 'asap', rappel: 'matin' }, cartMode: 'mixte', page: 'https://x' });
const pD = C.devisPayload({ contact, lieu, devis: { metiers: ['Rénovation', 'Menuiserie', 'Volets', 'Autre'], nature: 'Rénovation', desc: 'Salle de bain complète' }, photos: 2, page: 'https://x' });
const pG = C.gatePayload({ contact: { prenom: 'Marie', tel: '06 12 34 56 78', email: 'marie@exemple.fr' }, lieu, famLabel: 'Plomberie', fam: 'plomberie', page: 'https://x' });
ok('contrat intervention (demande_metier) respecté : ' + (violations(pI).join(',') || 'aucune violation'), pI.form_type === 'demande_metier' && violations(pI).length === 0);
ok('contrat devis (devis_express) respecté : ' + (violations(pD).join(',') || 'aucune violation'), pD.form_type === 'devis_express' && violations(pD).length === 0);
ok('contrat accès tarifs (rappel) respecté : ' + (violations(pG).join(',') || 'aucune violation'), pG.form_type === 'rappel' && violations(pG).length === 0);
ok('devis : 3 services max (limite serveur)', pD.services.length === 3);
ok('intervention : message lisible (prix ferme + sur devis + délai + zone)', /prix ferme/.test(pI.message) && /sur devis/.test(pI.message) && /Délai souhaité/.test(pI.message) && /Zone : dans la zone/.test(pI.message));
ok('intervention : urgence transmise', pI.utm.urgence === 'oui' && pI.type_demande === 'mixte');
ok('aucun montant total envoyé comme montant payable', !('amount' in pI) && !('total' in pI));


// ---- Téléphone : même règle que la fonction edge (lue dans la source)
const phoneRules = [...edge.matchAll(/\/\^\(\\\+33\|0033\)\[1-9\]\[0-9\]\{8\}\$\/|\/\^0\[1-9\]\[0-9\]\{8\}\$\//g)].length;
ok('téléphone : règle edge présente (+33 / 0033 / 0)', phoneRules >= 2);
for (const [v, exp] of [['06 12 34 56 78', true], ['+33 6 12 34 56 78', true], ['0033612345678', true], ['06.12.34.56.78', true], ['(06) 12-34-56-78', true], ['6 12 34 56 78', false], ['+33 0 12 34 56 78', false], ['01 23 45', false]]) {
  ok(`téléphone « ${v} » → ${exp ? 'accepté' : 'refusé'}`, C.phoneOk(v) === exp);
}

// ---- Recherche tolérante (saisie mobile)
const sample = [{ id: '1', name: 'Mécanisme de chasse d’eau', short_desc: '', category_name: 'Plomberie' }, { id: '2', name: 'Chauffe-eau 200L mural', short_desc: 'Pose et main d’œuvre', category_name: 'Plomberie' }, { id: '3', name: 'Désembouage radiateur', short_desc: '', category_name: 'Chauffage' }];
ok('recherche : apostrophe typographique', C.searchOffers(sample, "chasse d'eau").items.length === 1);
ok('recherche : « chauffe eau » sans tiret', C.searchOffers(sample, 'chauffe eau').items[0].id === '2');
ok('recherche : « main d\'oeuvre » (œ)', C.searchOffers(sample, "main d'oeuvre").items.length === 1);
ok('recherche : mots dans le désordre + résultats approchants', C.searchOffers(sample, 'radiateur fuite').approx === true && C.searchOffers(sample, 'radiateur fuite').items[0].id === '3');

// ---- Aide au choix par métier : une offre conseillée
const serr = [{ id: 'u', name: 'Intervention urgente serrurerie — 1h + déplacement', short_desc: 'Porte claquée, serrure bloquée', price_ttc: 138.88 }, { id: 's', name: 'Ouverture porte simple (non blindée)', price_ttc: 98.01 }, { id: 'c', name: 'Ouverture porte claquée', price_ttc: 176 }, { id: 'k', name: 'Ouverture porte fermée à clé', price_ttc: 228 }];
ok('aide serrurerie : pas de « panne ou fuite »', !C.diagFor('serrurerie', serr).some(p => /fuite/i.test(p.label)));
ok('aide serrurerie : porte claquée (porte simple) → offre la moins chère équivalente conseillée', C.suggest('serrurerie', serr, 'claquee').best.id === 's' && C.suggest('serrurerie', serr, 'claquee').others.every(o => o.price_ttc >= 98.01));
ok('aide serrurerie : porte fermée à clé → offre dédiée', C.suggest('serrurerie', serr, 'cle').best.id === 'k');
ok('aide : « je ne sais pas » → intervention de diagnostic', C.suggest('serrurerie', serr, 'inconnu').best.id === 'u');
ok('métier sans aucun prix → orienté devis', C.famHasPrices([{ name: 'Peinture', price_ttc: 0, requires_quote: true }]) === false && C.famHasPrices(serr) === true);

// ---- Horaires de l'agence (heure de Paris)
const at = (iso) => C.agencyStatus(new Date(iso));
ok('horaires : jeudi 10h ouvert', at('2026-09-17T08:00:00Z').open === true);
ok('horaires : jeudi 7h09 fermé → rappel aujourd’hui à 9 h', at('2026-09-17T05:09:00Z').open === false && /aujourd/.test(at('2026-09-17T05:09:00Z').next));
ok('horaires : samedi 17h fermé → lundi à 9 h', at('2026-09-19T15:00:00Z').next === 'lundi à 9 h');


// ---- Round 2 : recherche (mots vides, synonymes, début de mot), email facultatif, retour « Modifier », téléphone « (0) »
const cat2 = [{ id: 'd', name: 'Désengorgement canalisation', category_name: 'Plomberie' }, { id: 'm', name: "Mécanisme de chasse d'eau", category_name: 'Plomberie' }, { id: 'mi', name: "Remplacement mitigeur d'évier", category_name: 'Plomberie' }, { id: 'ce', name: 'Chauffe-eau 200L mural', category_name: 'Plomberie' }, { id: 'iso', name: 'Isolation thermique', short_desc: 'Pose de panneaux isolants', category_name: 'Rénovation' }, { id: 'el', name: 'Intervention urgente électricité', short_desc: 'Disjoncteur qui saute', category_name: 'Électricité' }];
ok('recherche : « débouchage » → désengorgement', C.searchOffers(cat2, 'débouchage').items[0].id === 'd');
ok('recherche : « toilettes » → mécanisme de chasse d’eau', C.searchOffers(cat2, 'toilettes').items[0].id === 'm');
ok('recherche : « évier bouché » → désengorgement en premier', C.searchOffers(cat2, 'évier bouché').items[0].id === 'd');
ok('recherche : « ballon d’eau chaude » → chauffe-eau, pas l’isolation (panneaux)', C.searchOffers(cat2, "ballon d'eau chaude").items[0].id === 'ce' && !C.searchOffers(cat2, "ballon d'eau chaude").items.some(x => x.id === 'iso'));
ok('recherche : « robinet qui fuit » sans l’électricité (« qui » ignoré)', !C.searchOffers(cat2, 'robinet qui fuit').items.some(x => x.id === 'el'));
ok('coordonnées : email facultatif (vide accepté, invalide refusé)', C.contactValid({ prenom: 'Te', nom: 'Re', tel: '0612345678', email: '' }) === true && C.contactValid({ prenom: 'Te', nom: 'Re', tel: '0612345678', email: 'x@' }) === false);
ok('téléphone : « +33 (0)6 12 34 56 78 » accepté et normalisé pour le serveur', C.phoneOk('+33 (0)6 12 34 56 78') && /^\+33 6/.test(C.normPhone('+33 (0)6 12 34 56 78')));
ok('retour « Modifier » : seulement vers une étape postérieure', C.flowIndex('intervention', 'creneau') > C.flowIndex('intervention', 'lieu') && C.flowIndex('intervention', 'acces') === C.flowIndex('intervention', 'precision'));
const pJ = C.devisPayload({ contact, lieu, devis: { metiers: ['Rénovation'], desc: 'Peinture salon 25 m2' }, photos: 0, lines, byId, page: 'x' });
ok('devis : interventions déjà choisies jointes (message + utm), jamais perdues', /Interventions également demandées/.test(pJ.message) && pJ.utm.cart.length === 2 && violations(pJ).length === 0);


// ---- Sécurité recette : envoi simulé PAR DÉFAUT hors production (incident lead réel 2026-09-17)
const uiSrc = uiFile;
ok('adresse : suggestions jamais rouvertes hors focus (réponse BAN tardive) ni au retour sur l’étape', /if \(seq !== acSeq \|\| document\.activeElement !== adr\) return;/.test(uiSrc) && /ENTER\.lieu = function \(\) \{ clearTimeout\(acT\); acSeq\+\+; acHide\(\);/.test(uiSrc) && /adr\.addEventListener\('blur', function \(\) \{ clearTimeout\(acT\); acSeq\+\+;/.test(uiSrc));
ok('recette : simulation par défaut sur preview/localhost (réel seulement avec ?live=1)', /SIM = sessionStorage\.getItem\('hc_live'\) !== '1'/.test(uiSrc) && /C\.simulationAllowed\(location\.hostname\)/.test(uiSrc));
ok('recette : production jamais simulée (hôte de prod refusé)', !C.simulationAllowed('depan59-62.fr') && !C.simulationAllowed('www.depan59-62.fr'));

// ---- Mesure du tunnel (P0.4) : GA4 uniquement en production + consentement + hors simulation ; jamais de donnée personnelle
const PREVIEW = 'deploy-preview-2--remarkable-dragon-364e2b.netlify.app';
ok('tracking : production + consentement + gtag prêt → envoi', C.trackDecision({ host: 'depan59-62.fr', consent: 'granted', gtagReady: true }) === 'send' && C.trackDecision({ host: 'www.depan59-62.fr', consent: 'granted', gtagReady: true }) === 'send');
ok('tracking : gtag pas encore chargé → mise en file (vidée au chargement)', C.trackDecision({ host: 'depan59-62.fr', consent: 'granted', gtagReady: false }) === 'queue' && /window\.addEventListener\('load', flushTrack\)/.test(uiSrc));
ok('tracking : sans consentement → rien ne part', ['', 'denied', null, 'GRANTED'].every((c) => C.trackDecision({ host: 'depan59-62.fr', consent: c, gtagReady: true }) === 'skip'));
ok('tracking : recette, domaine Netlify, localhost ou simulation → rien ne part', [PREVIEW, 'remarkable-dragon-364e2b.netlify.app', 'localhost', '127.0.0.1', 'depan59-62.fr.evil.com'].every((h) => C.trackDecision({ host: h, consent: 'granted', gtagReady: true }) === 'skip') && C.trackDecision({ host: 'depan59-62.fr', consent: 'granted', gtagReady: true, sim: true }) === 'skip');
const tp = C.trackParams({ module: 'demande_v2', mode: 'devis', prenom: 'Jean', nom: 'Dupont', tel: '0612345678', email: 'a@b.fr', adresse: '1 rue X', item: '06 12 34 56 78', cat: 'x@y.fr', from: '+33 (0)6 12 34 56 78', lines: 2, simulated: false, step: 'x'.repeat(150) });
ok('tracking : liste blanche (nom, téléphone, email, adresse jamais transmis)', !('prenom' in tp) && !('nom' in tp) && !('tel' in tp) && !('email' in tp) && !('adresse' in tp));
ok('tracking : valeurs ressemblant à un email ou un numéro rejetées, valeurs tronquées à 100', !('item' in tp) && !('cat' in tp) && !('from' in tp) && tp.lines === 2 && tp.simulated === false && tp.step.length === 100);
const trackCalls = [...uiSrc.matchAll(/track\('([a-z_]+)'(?:, \{([^}]*)\})?\)/g)];
const evNames = new Set([...uiSrc.matchAll(/\btrack\('([a-z_]+)'/g)].map((m) => m[1]));
const leadCalls = [...uiSrc.matchAll(/(?<!function )leadTracked\(([^;]*)\);/g)];
ok('tracking : entonnoir complet câblé (démarrage, étapes, accès tarifs, ajout, retrait, coordonnées, soumission, lead, erreur, appel)', ['hc_demande_start', 'hc_step_view', 'hc_tarifs_access', 'hc_demande_add', 'hc_demande_remove', 'hc_coordonnees_ok', 'hc_demande_submit', 'generate_lead', 'hc_demande_error', 'hc_call_click'].every((e) => evNames.has(e)));
ok('tracking : aucun appel ne passe contact, adresse ou identifiant de dossier', trackCalls.length >= 10 && leadCalls.length === 2 && trackCalls.every((m) => !/contact|adresse|\.tel\b|email|prenom|\bnom\b|data\.id|\bref\b/.test(m[2] || '')) && leadCalls.every((m) => !/contact|adresse|\.tel\b|email|prenom|\bnom\b|\.id\b|\bref\b/.test(m[1].replace(/, (data|r\.data)$/, ''))));
ok('tracking : un seul point d’envoi GA4 (window.hcGtag), jamais dataLayer brut', (uiSrc.match(/window\.hcGtag\('event'/g) || []).length === 2 && !/dataLayer\.push\(\{/.test(uiSrc));
const trk = readFileSync(join(ROOT, 'assets', 'tracking.js'), 'utf8');
ok('tracking.js : hcGtag exposé seulement APRÈS la garde de consentement', trk.indexOf('window.hcGtag = gtag') > trk.indexOf("if (consent !== 'granted')") && trk.indexOf("if (consent !== 'granted')") > 0);
const hostGuard = trk.indexOf("if (!/^(www\\.)?depan59-62\\.fr$/.test(location.hostname)) return;");
ok('tracking.js : inerte hors production (recette/preview n’alimentent ni GA4 ni click_events), garde avant tout le reste', hostGuard > 0 && hostGuard < trk.indexOf('hc-consent') && hostGuard < trk.indexOf('googletagmanager') && hostGuard < trk.indexOf('rest/v1/click_events'));
ok('tunnel : tracking.js chargé (version cache-bust), pas de bannière dans le tunnel', /<script src="\/assets\/tracking\.js\?v=\d{8}[a-z]?" defer><\/script>/.test(cat) && !/hc-consent\.js/.test(cat) && /assets\/hc-demande\.js\?v=/.test(cat));
const home = readFileSync(join(ROOT, 'index.html'), 'utf8');
ok('accueil : 3 CTA du tunnel identifiés + mesure production/consentement uniquement', (home.match(/data-hc-cta="(hero_intervention|carte_intervention|carte_devis)"/g) || []).length === 3 && /typeof window\.hcGtag !== 'function'\) return;/.test(home) && /closest\('a\[href\*="\/catalogue"\]'\)/.test(home) && /assets\/tracking\.js\?v=\d{8}[a-z]?"/.test(home));
// Attribution du dossier (source de visite mémorisée avec consentement)
const attr = C.attributionFrom(JSON.stringify({ utm_source: 'google', utm_medium: 'cpc', gclid: 'Cj0', _first_landing: '/', _captured_at: 'x' }), 'https://www.google.com/');
ok('attribution : utm + gclid + page d’entrée + référent ; rien si non mémorisé', attr.utm_source === 'google' && attr.gclid === 'Cj0' && attr.first_landing === '/' && attr.referrer === 'https://www.google.com/' && !('captured_at' in attr) && C.attributionFrom(null, '') === null && C.attributionFrom('{corrompu', '') === null);
const att = { utm_source: 'google', referrer: 'https://www.google.com/' };
const pa = [C.gatePayload({ contact, lieu, fam: 'plomberie', attribution: att }), C.interventionPayload({ lines, byId, contact, lieu, prise: { quand: 'asap' }, attribution: att }), C.devisPayload({ contact, lieu, devis: { metiers: ['Plomberie'], desc: 'x' }, attribution: att })];
ok('attribution : transmise par les 3 envois (utm.attribution + source_referer)', pa.every((p) => p.utm.attribution && p.utm.attribution.utm_source === 'google' && p.source_referer === 'https://www.google.com/'));
ok('attribution : absente → null (aucune donnée inventée)', [C.gatePayload({ contact, lieu }), C.devisPayload({ contact, lieu, devis: { metiers: ['Plomberie'], desc: 'x' } })].every((p) => p.utm.attribution === null && p.source_referer === null));
ok('attribution : lue uniquement depuis la mémoire consentie (hc_utm / hc_referrer)', /C\.attributionFrom\(sessionStorage\.getItem\('hc_utm'\), sessionStorage\.getItem\('hc_referrer'\)\)/.test(uiSrc) && (uiSrc.match(/attribution: attribution\(\)/g) || []).length === 4);

ok('liens entrants : #intervention, #devis et #entretien (entretien → description directe, « Contrat entretien » présélectionné)', /h === '#entretien' \? 'entretien'/.test(uiSrc) && C.legacyStep('entretien') === 'dv-projet' && /h\.entretien && \(state\.devis\.metiers \|\| \[\]\)\.indexOf\('Contrat entretien'\) < 0/.test(uiSrc) && C.guardStep('dv-projet', { mode: 'devis', dv: { metiers: ['Contrat entretien'] } }) === 'dv-projet');

// ---- Confidentialité (appareil partagé) : aucune donnée personnelle en stockage durable ; reprise explicite uniquement
const full = C.emptyState(); full.mode = 'devis';
full.contact = { prenom: 'Jean', nom: 'Dupont', tel: '0612345678', email: 'jean@exemple.fr' };
full.lieu = { adresse: '3 rue Exemple', cp: '62500', ville: 'Saint-Omer', lat: 50.75, lon: 2.25, zone: { status: 'in', km: 1 } };
full.devis.metiers = ['Plomberie']; full.devis.desc = 'Fuite sous évier chez M. Dupont'; full.prise.precisions = 'code portail 1234'; full.sent = { prenom: 'Jean', tel: '06 12 34 56 78' };
const parts = C.splitState(full), draftJson = JSON.stringify(parts.draft);
ok('confidentialité : le brouillon durable (localStorage) ne contient ni identité, ni adresse, ni texte libre, ni récap envoyé', !/Jean|Dupont|0612|06 12|exemple|3 rue|62500|Saint-Omer|portail|Fuite/.test(draftJson) && parts.draft.sent === null);
ok('confidentialité : le brouillon durable garde les choix non personnels (parcours, métiers)', parts.draft.mode === 'devis' && parts.draft.devis.metiers[0] === 'Plomberie');
ok('confidentialité : les données personnelles vont en session (onglet) sans le récap envoyé', parts.pii.contact.nom === 'Dupont' && parts.pii.lieu.cp === '62500' && /Fuite/.test(parts.pii.desc) && /portail/.test(parts.pii.precisions) && !('sent' in parts.pii));
const back = C.mergeState(JSON.parse(draftJson), JSON.parse(JSON.stringify(parts.pii)));
ok('confidentialité : rechargement dans le même onglet → demande en cours restaurée', back.contact.nom === 'Dupont' && back.lieu.ville === 'Saint-Omer' && /Fuite/.test(back.devis.desc) && back.sent === null);
const migrated = C.mergeState(JSON.parse(JSON.stringify(full)), null);
ok('confidentialité : ancien brouillon avec données personnelles en localStorage → ignorées (migration), choix non personnels conservés', !C.hasPii(migrated) && migrated.devis.metiers[0] === 'Plomberie' && migrated.sent === null);
ok('confidentialité : nouvel onglet / nouvel utilisateur (pas de session) → aucune donnée personnelle', !C.hasPii(C.mergeState(JSON.parse(draftJson), null)));
ok('confidentialité : session corrompue ou hostile → valeurs typées uniquement', (() => { const m = C.mergeState(null, { contact: { prenom: { x: 1 }, nom: 'A' }, lieu: { adresse: 12, cp: '62500', lat: 'x' }, desc: 5 }); return m.contact.prenom === '' && m.contact.nom === 'A' && m.lieu.adresse === '12' && m.lieu.lat === null && m.devis.desc === ''; })());
ok('demande en cours : prestations, métiers ou saisie personnelle ; jamais après envoi', !C.hasDraft(C.emptyState(), 0) && C.hasDraft(C.emptyState(), 1) && C.hasDraft(Object.assign(C.emptyState(), { devis: { metiers: ['Vitrerie'], desc: '' } }), 0) && C.hasDraft(back, 0) && !C.hasDraft(Object.assign(C.emptyState(), { sent: {} }), 3));
ok('UI : écriture séparée localStorage (brouillon) / sessionStorage (données personnelles), plus aucune écriture de l’état complet', /localStorage\.setItem\(STORE, JSON\.stringify\(parts\.draft\)\)/.test(uiSrc) && /sessionStorage\.setItem\(STORE_PII, JSON\.stringify\(parts\.pii\)\)/.test(uiSrc) && !/localStorage\.setItem\(STORE, JSON\.stringify\(state\)\)/.test(uiSrc));
ok('UI : lien d’entrée avec demande en cours → écran de choix (Reprendre / Nouvelle demande), jamais de pré-remplissage silencieux', /if \(h\.entry && C\.hasDraft\(state, cart \? cart\.count\(\) : 0\)\) \{ pendingEntry = h; start = 'choix'; \}/.test(uiSrc) && /r\.entry = \(!sm && !!\(raw \|\| cm\)\) \|\| raw === 'entretien'/.test(uiSrc) && />Nouvelle demande<\/button>/.test(uiSrc));
ok('UI : envoi réussi → identité et adresse retirées de l’état stocké (2 parcours)', (uiSrc.match(/forgetIdentityAfterSend\(\); save\(\);/g) || []).length === 2);
ok('UI : nouveau choix de parcours avec demande en cours ou envoyée → état vierge ; identité reprise seulement via « Faire une autre demande »', /if \(state\.sent \|\| C\.hasDraft\(state, cart \? cart\.count\(\) : 0\)\) startClean\(\);/.test(uiSrc) && /carryIdentity = restart \? lastIdentity : null;/.test(uiSrc) && !/var keep = \{ contact: state\.contact/.test(uiSrc));
ok('UI : « Effacer mes informations » purge brouillon, données personnelles, demande, accès tarifs, mesure et attribution + champs affichés', /\[STORE, 'hc_cart_v1'\]\.forEach/.test(uiSrc) && /\[STORE_PII, 'hc_pg', 'hc_fs_intervention', 'hc_fs_devis', 'hc_utm', 'hc_referrer'\]\.forEach/.test(uiSrc) && /lastIdentity = carryIdentity = pendingEntry = null; clearFields\(\);/.test(uiSrc));
ok('UI : aucune donnée personnelle dans l’URL (hash = étape + catégorie uniquement)', !/(history\.(push|replace)State\([^)]*(contact|lieu|tel|nom|adresse))/.test(uiSrc) && /'#step=' \+ target \+ \(state\.mode === 'intervention' && state\.fam \? '&cat=' \+ encodeURIComponent\(state\.fam\) : ''\)/.test(uiSrc));
const choixSrc = (uiSrc.match(/ENTER\.choix = function \(\) \{[\s\S]*?\n  \};/) || [''])[0];
ok('reprise : la carte « demande en cours » n’affiche aucune donnée personnelle (ni ville, ni nom, ni adresse)', choixSrc.length > 0 && !/state\.lieu\.(ville|adresse|cp)\b|state\.contact/.test(choixSrc.replace(/C\.lieuValid\(state\.lieu\)/g, '')));
// ---- Cache immuable /assets/* : accueil et page dédiée doivent pointer la MÊME version d'assets
const vHome = (home.match(/hc-demande\.js\?v=(\d{8}[a-z]?)|var V = '(\d{8}[a-z]?)'/) || [])[1] || (home.match(/var V = '(\d{8}[a-z]?)'/) || [])[1];
const vPage = (cat.match(/hc-demande\.js\?v=(\d{8}[a-z]?)/) || [])[1];
ok('assets du module : accueil et /catalogue.html sur la même version (cache immuable)', !!vHome && vHome === vPage);

// ---- Fenêtre premium (ouverte depuis le site) : la page hôte doit redevenir utilisable à la fermeture
ok('fenêtre : l’attribut hidden masque réellement la coque (page hôte jamais couverte après fermeture)', /\.hcd-overlay\[hidden\]\{display:none\}/.test(cssFile));
ok('fenêtre : reste de la page neutralisé pendant l’ouverture, restauré à la fermeture', /function setInert\(on\)/.test(uiFile) && /setInert\(true\);/.test(uiFile) && /setInert\(false\);/.test(uiFile));
ok('fenêtre : « Quitter » et « Retour à l’accueil » referment sans quitter la page hôte', /t\.closest\('\.top-close'\) \|\| t\.closest\('a\[href="\/"\]'\)/.test(uiFile));
ok('parcours : entrée « intervention » sans métier → étape Besoin (aucun métier hérité)', /if \(h\.entry && h\.mode === 'intervention' && !h\.cat\) \{ state\.fam = null;/.test(uiFile));
ok('avancement : le rail nomme l’étape en cours comme l’en-tête', /var label = \(i === cur && p && p\.label\) \? p\.label :/.test(uiFile));

// ---- Identité client et dossier unique (directives 5713150094 / 5713186419)
const gp = C.gatePayload({ contact: { prenom: 'Florian', nom: 'Dhaillecourt', tel: '06 12 34 56 78', email: '' }, lieu: { adresse: '3 rue X', cp: '62500', ville: 'Saint-Omer' }, fam: 'plomberie', cid: 'cid-123', step: 'acces' });
ok('identité : le nom du client est transmis tel quel (jamais reconstruit depuis le prénom)', gp.nom === 'Dhaillecourt' && gp.prenom === 'Florian');
ok('accès tarifs : marqué comme intention (enregistrement silencieux) avec l’étape atteinte', gp.intent === true && gp.last_step === 'acces' && gp.type_demande === 'consultation_tarifs');
ok('dossier unique : la référence de corrélation part avec l’intention et avec les 2 envois finaux', gp.correlation_id === 'cid-123' && gp.utm.correlation_id === 'cid-123'
  && C.interventionPayload({ lines, byId, contact, lieu, prise: { quand: 'asap' }, cid: 'cid-123' }).correlation_id === 'cid-123'
  && C.devisPayload({ contact, lieu, devis: { metiers: ['Plomberie'], desc: 'x' }, cid: 'cid-123' }).correlation_id === 'cid-123');
ok('UI : champ Nom obligatoire à l’étape tarifs (validé avant affichage des prix)', /id="pg-nom"/.test(uiFile) && /var bN = !C\.nameOk\(no\.value\)/.test(uiFile) && /if \(bN\) return focusBad\(no\);/.test(uiFile) && /state\.contact\.nom = no\.value\.trim\(\)/.test(uiFile));
ok('UI : référence de dossier créée une seule fois puis réutilisée', /function cid\(\) \{/.test(uiFile) && /if \(state\._cid\) return state\._cid;/.test(uiFile) && /cid: state\._cid \|\| null/.test(uiFile));
ok('UI : signal d’activité muet (aucun envoi en simulation, aucune notification demandée)', /function pingIntent\(step\)/.test(uiFile) && /if \(SIM \|\| !state\._cid \|\| !C\.contactValid\(state\.contact\)\) return;/.test(uiFile) && /pingIntent\('coordonnees'\)/.test(uiFile));

console.log(`\nRÉSULTAT MODULE DEMANDE V2 : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
