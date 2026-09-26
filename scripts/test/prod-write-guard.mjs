// prod-write-guard.mjs — garde FAIL-CLOSED pour tout E2E écrivant.
// Refuse d'écrire si la cible n'est pas EXPLICITEMENT un backend TEST.
// Réponse lot ChatGPT 5509522354 : "Le test doit échouer fermé si l'environnement
// n'est pas explicitement TEST." Aucune écriture n'est faite ici — pure validation.
//
// Usage (dans un futur harnais E2E) :
//   import { assertTestTarget } from './prod-write-guard.mjs';
//   assertTestTarget({ supabaseUrl, mode:'test', allowTest:true });  // throw si PROD/inconnu
//
// Self-test : `node scripts/test/prod-write-guard.mjs` (doit imprimer ALL GUARD TESTS PASS).

// Identifiants NON secrets de la PROD (à ne jamais viser en écriture de test) :
export const PROD_PROJECT_REFS = ['btcbjwqiivhpwoszomhg'];
// Refs de projets Supabase TEST explicitement validés. VIDE tant qu'aucune instance TEST
// n'existe : dans ce cas SEUL localhost passe la garde (fail closed). À remplir après provisioning.
export const KNOWN_TEST_REFS = [];
export const PROD_HOSTS = [
  'btcbjwqiivhpwoszomhg.supabase.co',
  'depan59-62.fr',
  'app.depan59-62.fr',
  'api.resend.com', // email PROD (agence + client) — jamais depuis un E2E test
];

function refFromUrl(url) {
  const m = String(url || '').match(/^https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return m ? m[1].toLowerCase() : '';
}
function hostFromUrl(url) {
  return String(url || '').replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
}

/**
 * Valide qu'une cible est explicitement TEST. Échoue fermé sinon.
 * @throws Error (ABORT) si la cible n'est pas prouvée TEST.
 * @returns {{ok:true, ref:string, host:string}}
 */
export function assertTestTarget({ supabaseUrl, projectRef, mode, allowTest } = {}) {
  if (allowTest !== true) throw new Error('PROD_WRITE_GUARD: allowTest !== true → ABORT (fail closed)');
  if (mode !== 'test') throw new Error(`PROD_WRITE_GUARD: mode="${mode}" ≠ "test" → ABORT`);
  const ref = (projectRef || refFromUrl(supabaseUrl) || '').toLowerCase();
  const host = hostFromUrl(supabaseUrl);
  if (!ref && !host) throw new Error('PROD_WRITE_GUARD: cible vide/inconnue → ABORT (fail closed)');
  if (PROD_PROJECT_REFS.includes(ref)) throw new Error(`PROD_WRITE_GUARD: project ref PROD "${ref}" → ABORT`);
  if (PROD_HOSTS.includes(host)) throw new Error(`PROD_WRITE_GUARD: host PROD "${host}" → ABORT`);
  // Fail-closed : ne passe QUE localhost ou un ref explicitement allowlisté TEST.
  // (Les refs Supabase réels sont aléatoires → aucune heuristique de nom fiable.)
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  if (!isLocal && !KNOWN_TEST_REFS.includes(ref)) {
    throw new Error(`PROD_WRITE_GUARD: cible non allowlistée TEST (ref="${ref}", host="${host}") → ABORT (fail closed). Ajouter le ref à KNOWN_TEST_REFS après provisioning TEST prouvé.`);
  }
  return { ok: true, ref, host };
}

// ---- Self-test ----
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const __isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (__isMain) {
  const mustThrow = (fn, label) => { try { fn(); throw new Error('__NO_THROW__'); } catch (e) { if (e.message === '__NO_THROW__') { console.error('FAIL (devait ABORT):', label); process.exit(1); } } };
  const mustPass = (fn, label) => { try { fn(); } catch (e) { console.error('FAIL (devait passer):', label, '→', e.message); process.exit(1); } };
  mustThrow(() => assertTestTarget({ supabaseUrl: 'https://btcbjwqiivhpwoszomhg.supabase.co', mode: 'test', allowTest: true }), 'PROD supabase host');
  mustThrow(() => assertTestTarget({ projectRef: 'btcbjwqiivhpwoszomhg', mode: 'test', allowTest: true }), 'PROD project ref');
  mustThrow(() => assertTestTarget({ supabaseUrl: 'http://localhost:54321', mode: 'test', allowTest: false }), 'allowTest false');
  mustThrow(() => assertTestTarget({ supabaseUrl: 'http://localhost:54321', mode: 'prod', allowTest: true }), 'mode prod');
  mustThrow(() => assertTestTarget({ supabaseUrl: '', mode: 'test', allowTest: true }), 'cible vide');
  mustThrow(() => assertTestTarget({ supabaseUrl: 'https://randomunknownproj.supabase.co', mode: 'test', allowTest: true }), 'ref inconnu non-local non-allowlisté');
  mustPass(() => assertTestTarget({ supabaseUrl: 'http://localhost:54321', mode: 'test', allowTest: true }), 'local stack');
  // ref allowlisté explicitement (simulation d'un projet TEST provisionné)
  KNOWN_TEST_REFS.push('abcdtestproj123456ok');
  mustPass(() => assertTestTarget({ projectRef: 'abcdtestproj123456ok', mode: 'test', allowTest: true }), 'ref TEST allowlisté');
  KNOWN_TEST_REFS.pop();
  mustThrow(() => assertTestTarget({ projectRef: 'abcdtestproj123456ok', mode: 'test', allowTest: true }), 're-refus après retrait allowlist');
  console.log('ALL GUARD TESTS PASS');
}
