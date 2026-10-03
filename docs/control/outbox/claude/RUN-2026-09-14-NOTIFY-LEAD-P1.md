# RUN 2026-09-14 — notify-lead P1 + prep non-mutante (directive 5664439054)

- run_id: RUN-2026-09-14-notify-lead-p1
- preview branch: recette — front RC = **e0ccd63e** (bandeau retiré sur ordre direct Florian ; voir 5664302553)
- hardening branch: hardening/safe-2026-09 (origin **2a3bd414**) — NON mergée
- acks: [{action_id: 5664439054, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
HARDENING_PREP=ACCEPTE | NOTIFY_LEAD=P1_ACTIVE | NOTIFY_FLOW=submit-lead-v6: validation form_type -> INSERT leads (l.152) d'abord -> notify-lead-v6 + lead-auto-reply en fetch .catch() non bloquants (l.180-182) -> 200 {id} indépendant | LEAD_PERSISTENCE_ON_NOTIFY_FAIL=PASS | NOTIFY_TESTS=PASS(22/22) | TEST_GUARD_NE_PAS_TRAITER=FAIL(prod, ordre-dépendant)->FIXED(prep 2a3bd414) | EDGE_FIX_SHA=2a3bd414 | EDGE_DEPLOY=NO | DOCKER_WITNESS_READY=YES (start-e2e-local.sh, non réécrit) | STRIPE_MODE=TEST_ONLY | STRIPE_LIVE=NO | POST_RC_BACKLOG_COMPLETE=YES | VISUAL_RC_CHANGED=YES(bandeau hc-topbar, ordre direct Florian, front a7299202->e0ccd63e) / NO(tout le reste) | HUMAN_GATES=[voir matrice] | REMAINING_SAFE=0
```

## 1. notify-lead = P1_ACTIVE (analysé)
- **Flux canonique** (submit-lead-v6) : lead **inséré d'abord** (l.152), puis `notify-lead-v6` (email agence) + `lead-auto-reply` (accusé client) en **fetch `.catch(()=>{})` non bloquants** ; `200 {id}` retourné **quel que soit** le résultat notif ; échec insert -> `500` explicite. ⇒ **LEAD_PERSISTENCE_ON_NOTIFY_FAIL=PASS**, pas de double-submit.
- **Bug trouvé — garde `NE PAS TRAITER` ordre-dépendante** : testait `${nom} ${prenom}` → un lead test « prénom=TEST / nom=RECETTE » (ou marqueur en `message`) N'était PAS auto-archivé → **notifiait la vraie agence**. **Corrigé** (prep, non déployé, SHA `2a3bd414`) : test des 2 ordres nom+prénom **+ message**.
- **2e P1 (réservation nos-prestations)** : `nos-prestations.html:1842` appelle l'**ancien** `notify-lead` sans `lead_id` (400). L'order est **enregistrée** dans `service_orders` (0 perte) mais l'email agence échoue. Correctif = router via `submit-lead-v6` (spéc + E2E), non codé à l'aveugle.
- **NOTIFY_TESTS** : `scripts/tests/notify-lead.test.mjs` **22/22** (persistance indépendante, garde ordre/champ-indépendante dont cas inversé, contrats rappel/devis/entretien/demande_metier/contact_complet, validateurs tel/email/CP). Zéro réseau/email.

## 2. Hardening : non mergé à la RC (respecté)
POST-RC-BACKLOG complété (colonnes ITEM|SEVERITY|CLASS|IMPACT|PROOF|SHA|TEST|ACTION_FLORIAN + matrice gates). SAFE_NOW (branche) : tests price gate 8/8+18/18, notify 22/22, dead-code Stripe, robots. SAFE_AFTER_QA préparés : Dunkerque 7 pages + garde ERROR, garde notify (edge). 

## 3. Docker témoin = YES
`scripts/test/start-e2e-local.sh` couvre déjà : Docker→CLI→garde anti-PROD→start LOCAL→garde localhost→bootstrap données→functions serve (0 email)→parcours E2E fail-closed→purge. Non réécrit. Déclencheur : `open -a Docker` + `bash scripts/test/start-e2e-local.sh`.

## 4. Stripe = TEST ONLY
Aucun GO LIVE. Endpoint LIVE public = P1 ; ACTION_FLORIAN = couper (`functions delete`/`configured=false`) ou déployer `PROPOSED_index.ts` en clé TEST. Risque/rollback/preuve dans POST-RC-BACKLOG. `STRIPE_LIVE=NO`.

## 5. RLS/Storage/rollback : runbook préparé
`docs/release/RLS-STORAGE-ROLLBACK-RUNBOOK.md` (certif RLS leads 0-lecture-publique, service_orders anon, buckets privés, plan rollback/smoke). Aucune mutation.

## Timeline / VISUAL_RC
Cette directive (13:06) est **antérieure** à la demande directe Florian « retirer ce bandeau ». J'ai retiré le bandeau `hc-topbar` sur 140 pages (recette e0ccd63e), vérifié 1440+390 — **VISUAL_RC_CHANGED=YES sur ordre direct Florian** (déjà notifié en 5664302553). Le front RC gelé passe de `a7299202` à `e0ccd63e`. Tout le reste = VISUAL_RC_CHANGED=NO.

## needs_florian
- true : retest e0ccd63e ; GO gates (couper Stripe LIVE ; deploy garde submit-lead-v6 ; Docker E2E ; RLS ; merge hardening). REMAINING_SAFE=0 (tout le reste est gated).
