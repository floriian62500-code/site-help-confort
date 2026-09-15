# RUN 2026-09-13 — SAFE_NOW + hardening isolé (directive 5645328308)

- run_id: RUN-2026-09-13-safe-now-hardening
- preview branch: recette (origin 33b50ec1, front a7299202 INCHANGÉ)
- hardening branch: **hardening/safe-2026-09** (origin 76b56ef9) — NON mergée à recette
- acks: [{action_id: 5645328308, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
RUNNER=ACTIVE | A_TO_L=ACCEPTE | SINGLE_AGENCY_GATE=REMOVED | SAFE_NOW_DONE=3 | SAFE_AFTER_QA_PREPARED=2 codés + 8 spéc | HUMAN_GATES=[Stripe LIVE endpoint, Docker E2E, service_orders RLS, SEC-2 RLS, supabase-js pin+SRI, notify-lead-v6 deploy, sources edge manquantes, rotation PAT] | NOTIFY_LEAD=P1_ACTIVE | PRICE_GATE_TESTS=PASS | DOCKER_BLOCKER=démon Docker arrêté (CLI 29.7.1 présent, `docker info` KO), non démarrable sans session GUI utilisateur | HARDENING_BRANCH=hardening/safe-2026-09 | SHA_LIST=88cb6538,76b56ef9 | VISUAL_RC_CHANGED=NO | NEXT=retest Florian -> merge hardening -> appliquer SAFE_AFTER_QA spéc + GO Stripe P1
```

## Corrections au diagnostic REMAINING_EXECUTABLE=0
1. **SINGLE_AGENCY_GATE=REMOVED** : arbitrage clos. Libellé « Agence Dunkerque » corrigé → « Agence Saint-Omer » sur **7 pages** (`*-saint-omer.html`), garde `AGENCE_DUNKERQUE_LABEL` + `TWO_AGENCIES_NOS` promues **ERROR**. (SAFE_AFTER_QA : texte visible → sur la branche isolée, merge post-retest.)
2. **STAGED_SAFE_FIXES triés** (voir `docs/release/POST-RC-BACKLOG.md`) :
   - **SAFE_NOW (faits, hardening branch)** : (a) tests comportementaux price gate `scripts/tests/price-gate-behavior.test.mjs` **8/8** (4 scénarios ChatGPT + bornes TTL) ; (b) suppression dead-code `createStripePayment` (jamais appelé, 26 pages non-RC, `node --check` OK) ; (c) `robots.txt` `Disallow: /recette.html`.
   - **SAFE_AFTER_QA** : Dunkerque (codé) + garde ERROR (codé) ; href/src protocol-whitelist, SRI Leaflet, defer, focus-trap, mascotte→webp, console.log (spécifiés, `POST-RC-BACKLOG.md`).
   - **HUMAN_GATE** : Stripe LIVE, Docker, migrations, CDN pin, edge deploys, PAT.

## NOTIFY_LEAD = P1_ACTIVE (qualifié)
`nos-prestations.html:1842` : la réservation **insère bien dans `service_orders`** (0 perte data) mais l'appel email `notify-lead` échoue (400, pas de `lead_id`) → **risque de réservation non notifiée à l'agence**. Correctif préparé (spéc) : router la notif via `submit-lead-v6` (canonique) ; **test = E2E local** (Docker-gated). Non codé à l'aveugle (contrat edge non versionné).

## PRICE_GATE_TESTS = PASS
`price-gate.test.mjs` 18/18 (statique) + `price-gate-behavior.test.mjs` 8/8 (comportemental sur la vraie source) : expiré refusé, session acceptée, direct bloqué, vieux durable refusé, TTL strict, corrompu refusé, provenance unique.

## DOCKER_BLOCKER (vérifié)
`docker` CLI = v29.7.1 présent ; `docker info` → démon arrêté (Docker Desktop non lancé) ; non démarrable depuis le CLI sans la session GUI. ⇒ `E2E_ISOLATED=BLOCKED_HUMAN_DOCKER`.

## Discipline
Preview `recette`/`a7299202` INCHANGÉE (0 page servie modifiée ; robots hardening = superset de recette, aucune règle retirée). Tout le durcissement sur `hardening/safe-2026-09`, isolé. Aucun PROD/Stripe LIVE/migration/tag RC. Daemon origin token invalide (ne peut pousser nulle part) — pushes réels via gh auth.

## next_action / needs_florian
- needs_florian: true — retest `a7299202` ; puis merge `hardening/safe-2026-09` → recette (SAFE_NOW + Dunkerque prouvés) ; GO Stripe P1 ; ouvrir Docker pour E2E.
