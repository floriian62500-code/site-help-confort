# RUN 2026-09-09 — GEL RC VISUELLE (directive 5573669415 / relance de 5573596691)

- run_id: RUN-2026-09-09-rc-freeze
- branch: recette (+ integration/lot1-lot2-vs-prod)
- generated_at: 2026-09-09T16:10:42Z
- rc_sha: 85385b01 (recette HEAD, gelé) ; tag `rc-visual-20260907`
- content: identique depuis d3a54e82 (dernier changement front « coupe le son ») ; 85385b01 = doc de gel uniquement
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app
- acks: [{action_id: 5573669415, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
RC_FROZEN=YES | RC_SHA=85385b01 | PREVIEW_URL=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app | READY_FOR_FLORIAN_VISUAL_QA=YES | BACKEND_E2E=WAITING_DOCKER | READY_FOR_PROD=NO | MERGE_MAIN=NO | PROD=NO | FLORIAN_CHECKLIST=6pts
```

## Gel
- RC **visuelle** figée pour validation Florian (pas la RC1 prod, toujours bloquée par gates humains).
- Marqueur immuable : tag git `rc-visual-20260907` @ 85385b01 (poussé).
- `docs/release/GO-LIVE-CHECKLIST.md` mis à jour (RC_VISUAL_FROZEN=YES, READY_FOR_PROD=NO).
- **Gel des modifs front/SEO/cosmétiques** pendant la revue Florian, sauf P0/P1 certain.

## CHECKLIST FLORIAN (6 points, ~10 min, desktop 1440 + mobile 390)
1. **Home** : hero « Une seule équipe », 2 CTA clairs, **son coupé** (vidéo muette, aucun son au scroll).
2. **Commander** : clic → popup tarifs → catalogue → +2 prestations → panier (334 €) → adresse (s'arrêter là).
3. **Devis / Contact** : devis-express 3 étapes prérempli ; Contact → CTA « demande guidée » → wizard.
4. **Entretien / Rappel** : carte Entretien → /contrats-entretien (3 formules) ; « Être rappelé » (formulaire).
5. **Vérité 1 agence** : topbar/footer + page Dunkerque = Saint-Omer (agence) / Dunkerque (zone desservie).
6. **Mobile 390** : menu burger, pas d'overflow, CTA lisibles, parcours compréhensible en quelques secondes.

## Séparé / non-bloquant
- `BACKEND_E2E=WAITING_DOCKER` : persistance réelle (leads/paie) non testée = voie A Docker (geste humain `open -a Docker && bash scripts/test/start-e2e-local.sh`).
- Gates prod humains restants : Stripe (SEC-3/CMD-6), migrations DB (SEC-2/REL-1), runner PR #10, contracts/Storage, média WebP, Google GBP/Ads, tiroir Netlify.

## needs_florian: true (validation visuelle + décision jalon RC). RECETTE only.
