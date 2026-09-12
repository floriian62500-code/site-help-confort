// e2e-local.mjs — Harnais E2E des 6 parcours contre le stack Supabase LOCAL (voie A).
// FAIL-CLOSED : abort si la cible n'est pas explicitement TEST (localhost). Zéro PROD.
// Usage : LOCAL_ANON='<anon local>' node scripts/test/e2e-local.mjs
// Prérequis : `supabase start` + bootstrap.sql appliqués + `supabase functions serve`.
import { assertTestTarget } from './prod-write-guard.mjs';

const SUPA = process.env.LOCAL_SUPA || 'http://localhost:54321';
const ANON = process.env.LOCAL_ANON || '';

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
function tag(m) { return `E2E-LOCAL — NE PAS TRAITER — ${m}`; }
const base = { prenom: 'TEST', nom: 'E2E', telephone: '0612345678', email: 'e2e@localhost.test',
  adresse: '1 rue Test', code_postal: '62500', ville: 'Saint-Omer', source: 'e2e_local' };

// 2) Les 6 parcours (payloads correspondant aux journeys réels du tunnel)
const journeys = [
  ['J1_prestation_tarifee', { ...base, metier: 'Plomberie', type_demande: 'commande', form_type: 'demande_metier', message: tag('J1 commande 114€') }],
  ['J2_diagnostic',         { ...base, metier: 'Électricité', type_demande: 'diagnostic', form_type: 'demande_metier', message: tag('J2 diagnostic') }],
  ['J3_devis',              { ...base, metier: 'Plomberie', type_demande: 'devis', form_type: 'devis_express', message: tag('J3 devis') }],
  ['J4_entretien',          { ...base, metier: 'Chauffage', type_demande: 'entretien', form_type: 'demande_metier', message: tag('J4 entretien') }],
  ['J5_rappel',             { ...base, type_demande: 'rappel', form_type: 'rappel', message: tag('J5 rappel') }],
  // J6 urgence = tel/CTA, aucune écriture requise → non soumis (vérif front seulement).
];

for (const [name, payload] of journeys) {
  const res = await post('submit-lead-v6', payload);
  const ok = res.status === 200 && res.body && res.body.id;
  results.push({ journey: name, status: res.status, id: res.body?.id || null, ok });
  console.log(`[${name}] HTTP ${res.status} id=${res.body?.id || '—'} ${ok ? 'OK' : 'FAIL'}`);
  // J3 devis : tester aussi upload d'une photo réelle sur le storage LOCAL
  if (name === 'J3_devis' && ok && res.body.upload_token) {
    const png = Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]); // en-tête PNG minimal
    const fd = new FormData();
    fd.append('lead_id', res.body.id); fd.append('upload_token', res.body.upload_token);
    fd.append('files', new Blob([png], { type: 'image/png' }), 'e2e.png');
    const up = await fetch(`${SUPA}/functions/v1/upload-lead-photos`, { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON }, body: fd });
    const uj = await up.json().catch(() => ({}));
    results.push({ journey: 'J3_devis_photo', status: up.status, stored: uj.stored ?? null, ok: up.status === 200 });
    console.log(`[J3_devis_photo] HTTP ${up.status} stored=${uj.stored ?? '—'}`);
  }
}

const pass = results.every(r => r.ok);
console.log('\n=== RÉSULTAT E2E LOCAL ===');
console.table(results);
console.log(pass ? 'FULL_E2E_TEST=PASS (local isolé)' : 'FULL_E2E_TEST=PARTIAL/FAIL');
console.log('Purge : delete from public.leads where source ilike \'%e2e%\';');
process.exit(pass ? 0 : 1);
