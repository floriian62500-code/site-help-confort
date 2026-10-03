# RUN 2026-09-12 — Backlog SAFE A–L (directive 5645034544)

- run_id: RUN-2026-09-12-safe-backlog-a-l
- branch: recette (+ integration/lot1-lot2-vs-prod)
- sha_front: a7299202 (INCHANGÉ — 0 page servie modifiée) ; tip docs/tests: e5ea7757
- acks: [{action_id: 5645034544, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
SAFE_LOTS_DONE=A(runbook;BLOCKED_HUMAN_DOCKER),B,C,D,E,F,G(partiel),H,I,J,K,L | TESTS_ADDED=1 suite price-gate 18/18 + 1 garde single-agency (AGENCE_DUNKERQUE_LABEL) | SECURITY_FINDINGS=0 P0 / 1 P1(Stripe LIVE endpoint, connu SEC-3, gate) / 3 P2 / ~10 P3 défense-en-profondeur | FIXES_SAFE=3 (purge ~21Mo orphelins 0-ref, garde single-agency, .gitignore) | E2E_ISOLATED=BLOCKED_HUMAN_DOCKER | PROD_WRITES=0 | STRIPE_LIVE_CALLS=0 | VISUAL_RC_CHANGED=NO | SHA_LIST=9e8150c6,40ab86d5,f712e62f,a47ea855,e5ea7757 | BLOCKED_HUMAN=[1 Stripe LIVE off/durcir, 2 Docker E2E, 3 service_orders RLS, 4 SEC-2 RLS, 5 supabase-js pin+SRI, 6 notify-lead-v6 deploy, 7 sources edge manquantes, 8 libellé Agence Dunkerque (arbitrage texte visible), 9 rotation PAT] | REMAINING_EXECUTABLE=0 (tous restants gated: Docker / gel visuel / migrations / arbitrage) | NEXT=retest Florian + GO mitigation Stripe P1 + lever gel pour appliquer staged fixes
```

## Livrables (commits SAFE, non-visuels)
- `scripts/tests/price-gate.test.mjs` (18/18) — non-régression P0 prix ; `scripts/tests/hc-cart.test.mjs` 12/12 rejoué.
- `scripts/seo/seo-guardrails.mjs` +garde `AGENCE_DUNKERQUE_LABEL` (7 pages métier ; ERRORS=0 inchangé).
- Purge ~21 Mo orphelins 0-ref prouvés + junk tracké + `.gitignore` (commit a47ea855/b9aef362).
- Docs : `E2E-LOCAL-RUNBOOK.md`, `TRACKING-ACQUISITION-READINESS.md` (GA4 réel actif), `SAFE-BACKLOG-AUDIT-2026-09-12.md` (findings + inventaire gates + staged fixes).

## P1 à documenter (directive) — Stripe LIVE endpoint public
`stripe-create-payment-link` déployé fait confiance au montant client, verify_jwt:false, clé sk_live_. Connu (SEC-3/T17). Mitigation intérimaire (GO) : `app_settings.stripe.configured=false` OU `supabase functions delete stripe-create-payment-link --project-ref btcbjwqiivhpwoszomhg` (l'UI publique ne l'appelle plus).

## Discipline
VISUAL_RC_CHANGED=NO prouvé (catalogue.html + index.html byte-identiques à a7299202). Aucune page servie modifiée. Aucun PROD/Stripe LIVE/migration/tag RC. HOLD front respecté.

## next_action / needs_florian
- needs_florian: true — (1) GO mitigation Stripe P1 ; (2) retest visuel a7299202 (toujours en attente) ; (3) lever le gel pour appliquer les STAGED_SAFE_FIXES ; (4) arbitrage libellé « Agence Dunkerque ».
