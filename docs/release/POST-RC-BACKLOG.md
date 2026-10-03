# Backlog post-RC exploitable (directive 5645328308 §6)

> Front RC `a7299202` GELÉ (preview = branche `recette`, tip `33b50ec1`, front identique).
> Travail de durcissement sur branche **`hardening/safe-2026-09`** (tip `88cb6538`), **non mergée** à recette.
> Classes : `SAFE_NOW` (mergeable maintenant, 0 impact visuel) · `SAFE_AFTER_QA` (sûr mais modifie des fichiers servis → après retest) · `HUMAN_GATE` (dépendance externe/humaine).

| ITEM | SEVERITY | CLASS | IMPACT | PROOF | BRANCH/SHA | TEST | ACTION_FLORIAN |
|---|---|---|---|---|---|---|---|
| Tests comportementaux price gate | — | SAFE_NOW ✅fait | Verrouille les 4 scénarios (expiré/session/direct/vieux durable) contre régression | `scripts/tests/price-gate-behavior.test.mjs` 8/8 sur la vraie source | hardening 88cb6538 | `node scripts/tests/price-gate-behavior.test.mjs` = PASS | aucune |
| Dead-code `createStripePayment` | P3 sécu | SAFE_NOW ✅fait | Retire une fonction morte qui construisait un appel Stripe LIVE (défense-en-profondeur) | jamais appelée (grep), 26 pages non-RC | hardening 88cb6538 | `node --check assets/hc-reserve-modal.js` OK | merger post-QA |
| robots `Disallow: /recette.html` | P3 | SAFE_NOW ✅fait | Empêche l'indexation de la page QA orpheline | `robots.txt` | hardening 88cb6538 | curl robots | merger post-QA |
| Libellé « Agence Dunkerque » (7 pages) | P2 single-agency | SAFE_AFTER_QA ✅préparé | Texte visible affirmait une agence physique Dunkerque (faux). Corrigé → « Agence Saint-Omer » | 7 `*-saint-omer.html`, garde `AGENCE_DUNKERQUE_LABEL`=ERROR | hardening 88cb6538 | `node scripts/seo/seo-guardrails.mjs` ERRORS=0 | valider le texte puis merger post-QA |
| `notify-lead` réservation cassé | **P1_ACTIVE** | SAFE_AFTER_QA + Docker | La réservation `nos-prestations` insère bien dans `service_orders` (0 perte data) MAIS l'email agence échoue (400, pas de `lead_id`) → risque de réservation non vue | `nos-prestations.html:1842` (type:reservation sans lead_id) ; edge exige lead_id | non codé (spéc) | E2E local : soumettre une réservation, vérifier notif | GO : router la notif via `submit-lead-v6` (canonique) puis tester E2E |
| Whitelist protocole `href/src` | P3 sécu | SAFE_AFTER_QA (spéc) | Bloque un éventuel `javascript:` issu de données admin/API | `hc-avis-live.js:109`, `partenaire.html:151`, `fournisseur.html:248` | spéc | ajouter `escUrl()` (déjà présent dans `hc-content.js`) | merger post-QA |
| SRI Leaflet dynamique | P3 sécu | SAFE_AFTER_QA (spéc) | Intégrité du script tiers injecté | `hc-map-zones.js:113` (réutiliser le hash SRI de `zones-intervention.html`) | spéc | charger la carte, vérifier no-break | merger post-QA |
| `defer` 2 scripts home | P3 perf | SAFE_AFTER_QA (spéc) | Réduit le blocage de rendu | `index.html:1344,1435` (FROZEN) | spéc | Lighthouse avant/après | merger post-QA (touche index gelé) |
| Focus-trap/Escape modales | P2 a11y | SAFE_AFTER_QA (spéc) | Accessibilité clavier | `hc-reserve-modal.js:19`, `hc-widgets.js:286,616` | spéc | test clavier | merger post-QA |
| mascotte.png → webp (30 pages) | P1 perf | SAFE_AFTER_QA (spéc) | 604K eager → 85K (webp existe déjà) | `images/mascotte.webp` existe | spéc | Lighthouse LCP | valider rendu identique puis merger |
| console.log shippés | P3 | SAFE_AFTER_QA (spéc) | Bruit console | `nos-prestations.html:1105,1226,1269`, `hc-avis-live.js:16` | spéc | — | merger post-QA |
| Stripe LIVE endpoint public | **P1** | HUMAN_GATE | Paiement LIVE à montant client par quiconque a la clé publishable | `stripe-create-payment-link` déployé, `sk_live_`, verify_jwt:false | — | — | **GO** : désactiver (`configured=false` ou `functions delete`) ou déployer `PROPOSED_index.ts` (clé TEST) |
| E2E isolé | — | HUMAN_GATE (Docker) | Valide les 6 parcours backend | `DOCKER_BLOCKER` ci-dessous | runbook prêt | `bash scripts/test/start-e2e-local.sh` | ouvrir Docker Desktop |
| `service_orders` prix client | P2 | HUMAN_GATE (DB) | Prix/TVA calculés client, insert anon direct | `nos-prestations.html:1751-1829` | — | — | edge recalcul + RLS |
| SEC-2 RLS leads/storage | À CERTIFIER | HUMAN_GATE (DB) | Fuite lecture possible ? | migrations PROPOSED | — | — | certifier 0 lecture publique ou migration |
| supabase-js CDN pin+SRI | P2 sécu | HUMAN_GATE | Version flottante `@2` sans SRI (~10 pages) | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | — | — | pinner version + integrity |
| notify-lead-v6 deploy | — | HUMAN_GATE | Email agence dégradé | `d099417b` deno check | — | 1 test réel NE PAS TRAITER | GO deploy |
| Sources edge manquantes | INFO | HUMAN_GATE | Non auditables (dont surface token GitHub `gh-*`) | `realisations-json`, `communes-list`, `lead-action`, `hc-*`, `gh-*` | — | — | versionner |
| Rotation PAT | HYGIÈNE | HUMAN_GATE | Token origin invalide/exposé | `.git/config` local | — | — | roter |

## DOCKER_BLOCKER (vérifié ce run)
`docker` CLI présent (`Docker version 29.7.1`) mais `docker info` échoue = **démon Docker non démarré** (Docker Desktop arrêté). Impossible à lancer depuis le CLI sans la session GUI de l'utilisateur. ⇒ `E2E_ISOLATED=BLOCKED_HUMAN_DOCKER`. Déblocage : ouvrir Docker Desktop, puis `bash scripts/test/start-e2e-local.sh` (fail-closed, 0 PROD).

## Ordre de merge recommandé (après retest Florian OK)
1. `hardening/safe-2026-09` → `recette` (SAFE_NOW + Agence Dunkerque déjà prouvés, ERRORS=0).
2. Appliquer les SAFE_AFTER_QA spéc restants (href/SRI/defer/focus-trap/mascotte/console) en commits isolés + re-tests.
3. Traiter les HUMAN_GATE un par un (Stripe P1 d'abord).

---

## Classes de statut (directive 5664807266 §6.4)
- **`PREPARED_NOT_MERGED`** — codé + testé sur `hardening/safe-2026-09` (`2a3bd414`), **hors recette** : SAFE_NOW (tests price-gate 18/18+8/8, notify 22/22, dead-code Stripe, robots) + SAFE_AFTER_QA codés (Dunkerque 7 pages + garde ERROR ; garde `NE PAS TRAITER` edge).
- **`WAITING_FLORIAN_QA`** — dépend du retest de `e0ccd63e` : merge du paquet hardening→recette (puis re-vérif visuelle), intégration des SAFE_AFTER_QA spéc.
- **`BLOCKED_HUMAN`** — action externe/humaine requise (voir matrice gates) : couper Stripe LIVE, `open -a Docker`+E2E, deploy `submit-lead-v6`, RLS/Storage, supabase-js pin+SRI.

## MISE À JOUR 2026-09-14 (directive 5664439054)

### notify-lead / lead — analyse P1 + correctifs préparés
| ITEM | SEVERITY | CLASS | IMPACT | PROOF | BRANCH/SHA | TEST | ACTION_FLORIAN |
|---|---|---|---|---|---|---|---|
| Garde `NE PAS TRAITER` **ordre-dépendante** (submit-lead-v6) | P1 hygiène | PREP fait (edge, **non déployé**) | Un lead test « prénom=TEST / nom=RECETTE » (ou marqueur en message) N'était PAS auto-archivé → **notifiait la vraie agence**. Corrigé : test des 2 ordres nom+prénom + message. | `submit-lead-v6/index.ts` l.163 avant/après | hardening **2a3bd414** | `notify-lead.test.mjs` 22/22 (dont ordre inversé) | GO deploy : `supabase functions deploy submit-lead-v6 --project-ref btcbjwqiivhpwoszomhg` |
| Réservation `nos-prestations` → **ancien** `notify-lead` (400) | P1_ACTIVE | SPEC (front + E2E) | Order **enregistrée** dans `service_orders` (0 perte) mais **email agence échoue** → réservation potentiellement non vue. | `nos-prestations.html:1842` (type:reservation sans lead_id) | spéc | E2E local (Docker) | GO : router la notif via `submit-lead-v6` (form_type dédié) + tester E2E, PUIS retirer l'appel cassé |

### NOTIFY_FLOW (résumé prouvé par lecture source)
`submit-lead-v6` : validation par `form_type` → **INSERT `leads` (l.152) d'abord** → `notify-lead-v6` (email agence) + `lead-auto-reply` (accusé client) en **fetch `.catch(()=>{})` non bloquants (l.180-182)** → `return 200 {id}` (l.185) **quel que soit** le résultat notif. Donc `LEAD_PERSISTENCE_ON_NOTIFY_FAIL=PASS` (panne email ≠ perte lead ≠ double-submit). Échec **insert** → `500` explicite (pas de faux succès). Leads test (marqueur) → `status=archive` + **pas de notif** (l.176-183).

### DOCKER_WITNESS_READY = YES (script existant, non réécrit)
`scripts/test/start-e2e-local.sh` couvre déjà la séquence témoin : 1/9 Docker → 2/9 CLI → 3/9 garde anti-PROD → 4/9 start LOCAL → 5/9 garde cible=localhost → 6/9 bootstrap données test → 7/9 functions serve (RESEND vide=0 email) → 8/9 parcours E2E (guard fail-closed) → 9/9 purge fixtures. Rapport `FULL_E2E_LOCAL=PASS`. **Aucune écriture PROD.** Déclencheur : `open -a Docker` puis `bash scripts/test/start-e2e-local.sh`.

### STRIPE — TEST ONLY (aucun GO LIVE, aucun déploiement)
Reformulation : il n'y a **aucun GO Stripe LIVE**. Endpoint `stripe-create-payment-link` déployé = fait confiance au montant client + clé `sk_live_` (P1). `ACTION_FLORIAN` = **couper l'endpoint** (`supabase functions delete stripe-create-payment-link` ou `app_settings.stripe.configured=false`) OU, plus tard, déployer `PROPOSED_index.ts` **avec clé TEST** (`sk_test_`). **Risque** si on ne fait rien : paiement LIVE à montant arbitraire par toute personne ayant la clé publishable. **Rollback** : re-déployer l'ancien / re-`configured=true`. **Preuve attendue** : après coupure, un POST à l'endpoint échoue fermé (aucun payment_url). `STRIPE_MODE=TEST_ONLY | STRIPE_LIVE=NO`.

### Matrice des gates (une action Florian par ligne)
| GATE | ACTION_FLORIAN exacte | RISQUE | ROLLBACK |
|---|---|---|---|
| Stripe LIVE endpoint | couper (`functions delete` ou `configured=false`) | paiement LIVE arbitraire | re-déployer / `configured=true` |
| E2E témoin | `open -a Docker` puis `bash scripts/test/start-e2e-local.sh` | aucun (LOCAL, fail-closed) | `supabase stop` |
| deploy garde NE PAS TRAITER | `supabase functions deploy submit-lead-v6` | aucun (garde plus stricte) | redeploy version n-1 |
| RLS leads/storage (SEC-2) | appliquer migration durcissement OU certifier 0 lecture publique | fuite lecture si non traité | `supabase db reset`/revert migration |
| supabase-js pin+SRI | pinner version exacte + `integrity` (préparable, revue rendu) | compromission CDN | retirer integrity |
| merge hardening→recette | après retest : merger `hardening/safe-2026-09` | change visuel (Dunkerque) à revalider | revert merge |
