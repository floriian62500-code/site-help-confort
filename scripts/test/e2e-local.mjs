// e2e-local.mjs — Harnais E2E contre le stack Supabase LOCAL (voie A). FAIL-CLOSED : zéro PROD.
// Usage : LOCAL_SUPA=http://127.0.0.1:54321 LOCAL_ANON='<anon local>' node scripts/test/e2e-local.mjs
// Prérequis : `supabase start` + bootstrap.sql + `supabase functions serve` (RESEND_API_KEY vide → 0 email).
// Couvre : parcours historiques J1–J5 + parcours du module « Ma demande » v2 (payloads construits par le
// cœur réel de catalogue.html) : accès tarifs, INTERVENTION, DEVIS (photo + intervention jointe), ENTRETIEN.
// Pour chaque lead : création réelle (id), notification invoquée (notify-lead-v6 lit le lead), et pour le devis
// photo réellement stockée (upload-lead-photos, jeton à usage unique, rejeu refusé). Parcours v2 : relecture de la ligne
// en base LOCALE (LOCAL_SRK = clé service du stack local, lecture seule) → ce que le front envoie est ce qui est stocké.
import { assertTestTarget } from './prod-write-guard.mjs';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const SUPA = process.env.LOCAL_SUPA || 'http://localhost:54321';
const ANON = process.env.LOCAL_ANON || '';
const SRK = process.env.LOCAL_SRK || '';

// 1) GARDE ABSOLUE avant toute écriture — abort si cible ≠ TEST/localhost.
const guard = assertTestTarget({ supabaseUrl: SUPA, mode: 'test', allowTest: true });
console.log('[guard] cible TEST validée:', guard.host);
if (!ANON) { console.error('LOCAL_ANON manquant (clé anon locale affichée par `supabase start`).'); process.exit(2); }

const H = { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON };
const results = [];
async function post(fn, body) {
  const r = await fetch(`${SUPA}/functions/v1/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j };
}
// Limiteur anti-spam de submit-lead-v6 (index.ts rateLimit) : 5 envois / IP / 60 s, fenêtre fixe.
// Le harnais RESPECTE ce rythme (pause) sans le contourner ; un 429 résiduel (fenêtre ouverte par un run
// précédent sur le même worker) est rejoué une seule fois après expiration de la fenêtre.
const RL_MAX = 5, RL_WAIT_MS = 62_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let rlStart = 0, rlCount = 0;
async function submitLead(payload) {
  if (Date.now() - rlStart > RL_WAIT_MS) { rlStart = Date.now(); rlCount = 0; }
  if (rlCount >= RL_MAX) {
    const wait = Math.max(0, rlStart + RL_WAIT_MS - Date.now());
    console.log(`[rythme] limiteur submit-lead-v6 (${RL_MAX}/min) atteint : pause ${Math.ceil(wait / 1000)} s`);
    await sleep(wait);
    rlStart = Date.now(); rlCount = 0;
  }
  rlCount++;
  let res = await post('submit-lead-v6', payload);
  if (res.status === 429) {
    console.log(`[rythme] HTTP 429 (fenêtre ouverte avant ce run) : nouvel essai dans ${RL_WAIT_MS / 1000} s`);
    await sleep(RL_WAIT_MS);
    rlStart = Date.now(); rlCount = 1;
    res = await post('submit-lead-v6', payload);
  }
  return res;
}
function tag(m) { return `E2E-LOCAL — NE PAS TRAITER — ${m}`; }
const base = { prenom: 'TEST', nom: 'E2E', telephone: '0612345678', email: 'e2e@localhost.test',
  adresse: '1 rue Test', code_postal: '62500', ville: 'Saint-Omer', source: 'e2e_local' };

// PNG valide 1×1 (≥ 12 octets : l'edge vérifie le vrai type par les octets magiques)
const PNG_1PX = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64'));

async function notifyCheck(journey, id) {
  // Notification : la fonction lit le lead ; sans clé d'envoi locale elle répond email_sent=false (0 email réel).
  const n = await post('notify-lead-v6', { lead_id: id });
  const ok = n.status === 200 && n.body && n.body.ok === true && n.body.email_sent === false;
  results.push({ journey: journey + '_notification', status: n.status, id: n.body && (n.body.reason || n.body.error) || null, ok });
  console.log(`[${journey}_notification] HTTP ${n.status} ${JSON.stringify(n.body)} ${ok ? 'OK' : 'FAIL'}`);
}
async function photoCheck(journey, id, token) {
  const fd = new FormData();
  fd.append('lead_id', id); fd.append('upload_token', token);
  fd.append('files', new Blob([PNG_1PX], { type: 'image/png' }), 'e2e.png');
  const up = await fetch(`${SUPA}/functions/v1/upload-lead-photos`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON }, body: fd });
  const uj = await up.json().catch(() => ({}));
  const stored = typeof uj.stored === 'number' ? uj.stored : (Array.isArray(uj.stored) ? uj.stored.length : 0);
  const ok = up.status === 200 && stored >= 1;
  results.push({ journey: journey + '_photo', status: up.status, id: 'stored=' + stored, ok });
  console.log(`[${journey}_photo] HTTP ${up.status} stored=${stored} ${ok ? 'OK' : 'FAIL ' + JSON.stringify(uj).slice(0, 160)}`);
  // Jeton à usage unique : le même jeton rejoué doit être refusé (403)
  const fd2 = new FormData();
  fd2.append('lead_id', id); fd2.append('upload_token', token);
  fd2.append('files', new Blob([PNG_1PX], { type: 'image/png' }), 'e2e-rejeu.png');
  const re = await fetch(`${SUPA}/functions/v1/upload-lead-photos`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON }, body: fd2 });
  await re.text().catch(() => '');
  const reOk = re.status === 403;
  results.push({ journey: journey + '_photo_rejeu', status: re.status, id: reOk ? 'refusé' : 'accepté', ok: reOk });
  console.log(`[${journey}_photo_rejeu] HTTP ${re.status} ${reOk ? 'OK (refusé)' : 'FAIL (jeton réutilisable)'}`);
}
async function dbCheck(journey, id, checks) {
  if (!SRK) { results.push({ journey: journey + '_db', status: 0, id: 'LOCAL_SRK absent : relecture non prouvée', ok: false }); return; }
  const r = await fetch(`${SUPA}/rest/v1/leads?id=eq.${encodeURIComponent(id)}&select=*`, { headers: { apikey: SRK, Authorization: 'Bearer ' + SRK } });
  const rows = await r.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  const failed = row ? Object.entries(checks(row)).filter(([, v]) => !v).map(([k]) => k) : ['ligne absente'];
  const ok = failed.length === 0;
  results.push({ journey: journey + '_db', status: r.status, id: ok ? 'ligne conforme' : failed.join(' ; '), ok });
  console.log(`[${journey}_db] HTTP ${r.status} ${ok ? 'OK ligne conforme' : 'FAIL ' + failed.join(' ; ')}`);
}
// Contrôles communs d'une ligne module v2 : stockée telle qu'envoyée par le cœur du front
function v2Common(row, payload) {
  const u = row.utm || {};
  return {
    'message identique au front': row.message === String(payload.message).trim().slice(0, 4000),
    'source': row.source === payload.source,
    'type_demande': row.type_demande === payload.type_demande,
    'utm.form_type': u.form_type === payload.form_type,
    'utm.module=demande_v2': u.module === 'demande_v2',
    'téléphone normalisé': /^(\+33|0)[1-9][0-9]{8}$/.test(String(row.telephone || '')),
    'aucun vocabulaire panier': !/panier/i.test(String(row.message || '')),
  };
}
async function journey(name, payload, opts = {}) {
  const res = await submitLead(payload);
  const id = res.body && res.body.id;
  const ok = res.status === 200 && !!id;
  results.push({ journey: name, status: res.status, id: id || null, ok });
  console.log(`[${name}] HTTP ${res.status} id=${id || '—'} ${ok ? 'OK' : 'FAIL ' + JSON.stringify(res.body).slice(0, 200)}`);
  if (!ok) return;
  if (opts.notify) await notifyCheck(name, id);
  if (opts.photo && res.body.upload_token) await photoCheck(name, id, res.body.upload_token);
  else if (opts.photo) { results.push({ journey: name + '_photo', status: 0, id: 'upload_token absent', ok: false }); }
  if (opts.expect) await dbCheck(name, id, (row) => ({ ...(opts.common === false ? {} : v2Common(row, payload)), ...opts.expect(row) }));
}

// 2) Parcours historiques (contrat submit-lead-v6)
await journey('J1_prestation_tarifee', { ...base, metier: 'Plomberie', type_demande: 'commande', form_type: 'demande_metier', message: tag('J1 commande 114€') });
await journey('J2_diagnostic',         { ...base, metier: 'Électricité', type_demande: 'diagnostic', form_type: 'demande_metier', message: tag('J2 diagnostic') });
await journey('J3_devis',              { ...base, metier: 'Plomberie', type_demande: 'devis', form_type: 'devis_express', message: tag('J3 devis') }, { photo: true });
await journey('J4_entretien',          { ...base, metier: 'Chauffage', type_demande: 'entretien', form_type: 'demande_metier', message: tag('J4 entretien') });
await journey('J5_rappel',             { ...base, type_demande: 'rappel', form_type: 'rappel', message: tag('J5 rappel') });
// J6 : souscription contrat d'entretien — MIROIR du payload envoyé par contrats-entretien.html (recette, voie submit-lead-v6)
const pSous = { prenom: 'TEST', nom: 'NE PAS TRAITER', telephone: '06 12 34 56 78', email: null, adresse: '1 rue Test', code_postal: '62500', ville: 'Saint-Omer',
  metier: 'chauffage', type_demande: 'contrat_entretien', form_type: 'demande_metier',
  message: ['DEMANDE DE CONTRAT ENTRETIEN', '- Énergie : Gaz', '- Formule : CONFORT (149 €/an)', '- Agence : Saint-Omer', '- Logement : Maison / Propriétaire',
    '- Équipement : Saunier Duval ThemaPlus (2015)', '- Dernier entretien : 2025', '- Début souhaité : —', '- Photos jointes : 0 (facultatif)', '- RIB fourni : non', '- Accord principe SEPA : oui', '- Commentaire : ' + tag('J6 souscription')].join('\n'),
  source: 'e2e_local_contrat_souscription', source_page: 'http://localhost/contrats-entretien.html (E2E LOCAL)',
  utm: { energie: 'Gaz', formule: 'CONFORT', prix: '149 €/an', tier: 'confort', photos_count: 0, wizard_tags: ['contrat-entretien', 'Gaz', 'confort'] } };
await journey('J6_souscription_entretien', pSous, { notify: true, common: false, expect: (row) => ({
  'type_demande=contrat_entretien': row.type_demande === 'contrat_entretien',
  'message complet (formule, SEPA)': /DEMANDE DE CONTRAT ENTRETIEN/.test(row.message || '') && /Formule : CONFORT/.test(row.message || '') && /Accord principe SEPA : oui/.test(row.message || ''),
  'utm énergie/formule': (row.utm || {}).energie === 'Gaz' && (row.utm || {}).formule === 'CONFORT',
  'téléphone normalisé': row.telephone === '0612345678',
  'lead test auto-archivé': row.status === 'archive',
}) });

// 3) Module « Ma demande » v2 : payloads construits par le cœur RÉEL du front (catalogue.html)
const catPath = [join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'catalogue.html')].find(existsSync);
if (catPath) {
  const box = { module: { exports: {} } };
  vm.runInNewContext((readFileSync(catPath, 'utf8').match(/<script id="hc-demande-core">([\s\S]*?)<\/script>/) || [, ''])[1], box);
  const C = box.module.exports;
  const contact = { prenom: 'TEST', nom: 'NE PAS TRAITER', tel: '+33 (0)6 12 34 56 78', email: '' };
  const lieu = { adresse: '1 rue Test', cp: '62500', ville: 'Saint-Omer', zone: C.zoneFor(50.7508, 2.2522, '62500') };
  const byId = { a: { id: 'a', name: 'Intervention urgente plomberie — 1h + déplacement', price_ttc: 114.43, category_name: 'Plomberie & Sanitaires' }, b: { id: 'b', name: 'Peinture intérieure', price_ttc: 0, requires_quote: true, category_name: 'Rénovation' } };
  const lines = [{ id: 'a', slug: 'intervention-urgente-plomberie', name: byId.a.name, ttc: 114.43, qty: 1 }, { id: 'b', slug: 'peinture-interieure', name: byId.b.name, ttc: 0, requires_quote: true, qty: 1 }];
  const page = 'http://localhost/catalogue.html (E2E LOCAL)';
  const withSrc = (p) => ({ ...p, source: 'e2e_local_v2_' + p.source });
  // Attribution telle que mémorisée avec consentement par tracking.js (sessionStorage hc_utm / hc_referrer)
  const attribution = C.attributionFrom(JSON.stringify({ utm_source: 'e2e_local', utm_medium: 'test', utm_campaign: 'demande_v2', _first_landing: '/' }), 'https://www.google.com/');
  const attrOk = (row) => ({ 'attribution stockée (utm.attribution)': !!(row.utm && row.utm.attribution && row.utm.attribution.utm_source === 'e2e_local' && row.utm.attribution.first_landing === '/'), 'source_referer': row.source_referer === 'https://www.google.com/' });
  const pGate = withSrc(C.gatePayload({ contact, lieu, famLabel: 'Plomberie & Sanitaires', fam: 'plomberie', page, attribution }));
  await journey('V2_acces_tarifs', pGate, { notify: true, expect: (row) => ({ 'utm.cat=plomberie': (row.utm || {}).cat === 'plomberie', ...attrOk(row) }) });
  const pInter = withSrc(C.interventionPayload({ lines, byId, contact, lieu, prise: { quand: 'asap', rappel: 'matin', precisions: tag('V2 intervention') }, cartMode: 'mixte', page, attribution }));
  await journey('V2_INTERVENTION', pInter, { notify: true, expect: (row) => ({
    '2 prestations (utm.cart)': Array.isArray((row.utm || {}).cart) && row.utm.cart.length === 2,
    'métiers regroupés': row.metier === pInter.metier,
    'prix ferme + sur devis': /prix ferme/.test(row.message) && /sur devis/.test(row.message),
    'adresse non redemandée (reprise du lieu)': row.code_postal === '62500' && row.ville === 'Saint-Omer',
    'lead test auto-archivé': row.status === 'archive',
    ...attrOk(row),
  }) });
  const pDevis = withSrc(C.devisPayload({ contact, lieu, devis: { metiers: ['Salle de bain', 'Plomberie'], nature: 'Rénovation', desc: tag('V2 devis salle de bain') }, photos: 1, lines: [lines[0]], byId, page, attribution }));
  await journey('V2_DEVIS', pDevis, { notify: true, photo: true, expect: (row) => ({
    'métier principal': row.metier === 'Salle de bain',
    'intervention jointe dans le dossier': /Interventions également demandées/.test(row.message),
    'photo associée au lead': Array.isArray((row.metadata || {}).photos) && row.metadata.photos.length >= 1,
    'jeton photo invalidé': !(row.metadata || {}).upload_token,
    'lead test auto-archivé': row.status === 'archive',
    ...attrOk(row),
  }) });
  const pEntretien = withSrc(C.devisPayload({ contact, lieu, devis: { metiers: ['Contrat entretien'], nature: 'Entretien', desc: tag('V2 entretien chaudière gaz annuel') }, photos: 0, page, attribution }));
  await journey('V2_ENTRETIEN', pEntretien, { notify: true, expect: (row) => ({
    'métier=Contrat entretien': row.metier === 'Contrat entretien',
    'nature Entretien': /Nature du projet : Entretien/.test(row.message),
    'lead test auto-archivé': row.status === 'archive',
    ...attrOk(row),
  }) });
} else {
  console.log('[V2] catalogue.html introuvable : parcours module v2 non exécutés');
  results.push({ journey: 'V2_module', status: 0, id: 'catalogue.html absent', ok: false });
}

const pass = results.every(r => r.ok);
console.log('\n=== RÉSULTAT E2E LOCAL ===');
console.table(results);
const flow = (prefix) => { const rs = results.filter((r) => r.journey.startsWith(prefix)); return rs.length && rs.every((r) => r.ok) ? 'PASS' : 'FAIL'; };
const both = (a, b) => (flow(a) === 'PASS' && flow(b) === 'PASS' ? 'PASS' : 'FAIL');
console.log(`INTERVENTION_BACKEND_E2E=${flow('V2_INTERVENTION')} | QUOTE_BACKEND_E2E=${flow('V2_DEVIS')} | MAINTENANCE_BACKEND_E2E=${both('V2_ENTRETIEN', 'J6_souscription_entretien')} (devis module + souscription page) | PRICE_GATE_BACKEND_E2E=${flow('V2_acces_tarifs')} (local isolé)`);
console.log(pass ? 'FULL_E2E_TEST=PASS (local isolé)' : 'FULL_E2E_TEST=PARTIAL/FAIL');
console.log('Purge : delete from public.leads where source ilike \'%e2e%\';');
process.exit(pass ? 0 : 1);
