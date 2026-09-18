#!/usr/bin/env node
// Cycle commercial d'un lead — garanties vérifiées sur la SOURCE des fonctions serveur.
// Directives 5713150094 / 5713186419 : identité réelle, accès aux tarifs silencieux,
// une seule notification finale, relance d'abandon unique, emails conformes à la vérité métier.
//   node scripts/tests/lead-cycle.test.mjs
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const submit = read('supabase/functions/submit-lead-v6/index.ts');
const notify = read('supabase/functions/notify-lead-v6/index.ts');
const reply = read('supabase/functions/lead-auto-reply/index.ts');
// Les commentaires d'en-tête citent les promesses supprimées : on contrôle le code, pas la documentation.
const replyCode = reply.replace(/\/\/[^\n]*/g, '');
const sweep = read('supabase/functions/leads-abandon-sweep/index.ts');
const crm = read('supabase/functions/crm-apogee-push/index.ts');
const core = read('assets/hc-demande-core.js');

let pass = 0, fail = 0;
const ok = (n, c) => { c ? (pass++, console.log('  ✅', n)) : (fail++, console.log('  ❌', n)); };

// ---- Identité : prénom et nom distincts de bout en bout
ok('serveur : le nom n’est jamais recopié depuis le prénom (fin de « Florian Florian »)',
  /nom: nom \|\| null,/.test(submit) && !/nom: nom \|\| prenom/.test(submit));
ok('front : l’accès aux tarifs transmet le nom saisi', /nom: c\.nom \|\| null,/.test(core));
ok('email agence : prénom et nom affichés séparément', /\[lead\.prenom, lead\.nom\]\.filter\(Boolean\)/.test(notify));

// ---- Accès aux tarifs : enregistrement silencieux
ok('accès tarifs : contrat serveur dédié (price_gate)', /price_gate:\s*\{ name: true, contact: true/.test(submit));
ok('accès tarifs : statut « intent » et priorité basse', /status: isIntent \? 'intent' : 'nouveau'/.test(submit) && /priority: isIntent \? 'basse' : 'normale'/.test(submit));
ok('accès tarifs : AUCUNE notification agence ni client tant que la demande n’est pas finalisée',
  /if \(!isTestLead && !isIntent\) \{/.test(submit) && (submit.match(/functions\/v1\/notify-lead-v6/g) || []).length === 1);
ok('email client : refusé pour une demande non finalisée', /intent_not_finalized/.test(reply) && /if \(isIntent && !meta\.finalized_at\)/.test(reply));

// ---- Dossier unique : intention ↔ demande finale
ok('dossier unique : recherche par référence de corrélation', /\.eq\('utm->>correlation_id', correlationId\)/.test(submit));
ok('dossier unique : un dossier finalisé n’est jamais réécrit', /\['intent', 'needs_followup'\]\.includes\(String\(row\.status \|\| ''\)\)/.test(submit));
ok('dossier unique : mise à jour au lieu d’un second enregistrement', /if \(existing\) \{[\s\S]{0,200}\.update\(payload\)\.eq\('id', existing\.id\)/.test(submit));
ok('dossier unique : la finalisation est horodatée', /meta\.finalized_at = nowIso/.test(submit));
ok('front : la référence de dossier accompagne l’intention et les 2 envois finaux', (core.match(/correlation_id: d\.cid \|\| null/g) || []).length >= 3);

// ---- Relance d'abandon
ok('abandon : seuil par défaut à 15 minutes d’inactivité', /Number\(body\.minutes\) \|\| 15/.test(sweep));
ok('abandon : ne cible que des intentions non finalisées et jamais alertées',
  /\.eq\('status', 'intent'\)/.test(sweep) && /metadata->>finalized_at', 'is', null/.test(sweep) && /metadata->>abandon_notified_at', 'is', null/.test(sweep));
ok('abandon : drapeau posé AVANT l’envoi → une seule alerte par dossier',
  sweep.indexOf('abandon_notified_at: new Date().toISOString()') < sweep.indexOf('kind: \'abandon\'') && /\.eq\('status', 'intent'\)\n\s*\.select\('id'\)/.test(sweep));
ok('abandon : alerte interne uniquement (aucun email au client)', /notify-lead-v6/.test(sweep) && !/lead-auto-reply/.test(sweep));
ok('abandon : les leads de test ne déclenchent pas d’alerte', /TEST\\s\*RECETTE\|NE\\s\*PAS\\s\*TRAITER/.test(sweep));
ok('email agence : variante « demande non finalisée »', /String\(kind \|\| ''\) === 'abandon'/.test(notify) && /Demande non finalisée/.test(notify));

// ---- Vérité métier des emails
ok('email client : plus de promesse « sous 30 minutes »', !/30 min/i.test(replyCode));
ok('email client : plus de « 7j/7 »', !/7j\/7/.test(replyCode));
ok('email client : une seule agence physique (plus de « Saint-Omer & Dunkerque »)', !/Saint-Omer\s*&(amp;)?\s*Dunkerque/.test(reply));
ok('email client : horaires réels lun–ven 9h–17h, sam 9h–16h', /lun–ven 9h–17h, sam 9h–16h/.test(reply));
ok('email client : message adapté au type réel (intervention / devis / entretien)', /function demandeKind/.test(reply) && /demande de devis/.test(reply) && /demande d’entretien/.test(reply));
ok('email agence : libellé explicite pour une consultation des tarifs', /consultation_tarifs: 'Consultation des tarifs \(demande non finalisée\)'/.test(notify));

// ---- CRM Apogée : file d'attente prête, aucun faux succès
ok('CRM : chaque dossier entre en file d’attente dès la collecte des coordonnées', /crm_status: 'pending'/.test(submit));
ok('CRM : sans accès Apogée, la fonction ne fait rien et le dit', /blocked: 'missing_credentials'/.test(crm) && /needed: \['APOGEE_API_URL', 'APOGEE_API_KEY'\]/.test(crm));
ok('CRM : aucun endpoint ni secret inventé', !/https:\/\/[a-z0-9.-]*apogee/i.test(crm));

console.log(`\nRÉSULTAT CYCLE LEAD : ${pass} PASS / ${fail} FAIL`);
process.exit(fail > 0 ? 1 : 0);
