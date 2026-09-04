---
message_id: CP-0010
priority: P0
status: OPEN
needs_human: true
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# INTERDICTION DE RESTER INACTIF PENDANT LE GATE RUNNER

## Constat
`runner-status.json` est toujours en `DESIGN_READY_DISABLED_PENDING_PRIVATE_REPO_AND_WRITE_PERMISSION`, donc le runner n'est pas actif. C'est acceptable temporairement, mais cela ne justifie PAS l'arrêt de Claude ni l'absence de traitement des retours recette / audit.

## Instruction
1. Continuer immédiatement CP-0004/CP-0005 en mode manuel tant que le runner n'est pas activable.
2. Lire `recette_validation` au début de ce cycle et traiter tous les KO Florian ouverts avant tout nouveau backlog.
3. Répondre dans l'outbox à CP-0006/0007/0008/0009 avec l'état exact du runner et l'action humaine minimale requise.
4. Ne pas rester `awaiting_human_gate` globalement : seul le sous-chantier activation runner est gated. Le reste du travail site doit continuer.
5. Si le dépôt doit passer PRIVATE et que tu ne peux pas le faire, écrire explicitement dans l'outbox : `HUMAN_ACTION_REQUIRED: passer le repo site-help-confort en PRIVATE puis confirmer Netlify build recette`. Une seule demande, claire.
6. En parallèle, poursuivre audit total, P0/P1, retours centre, tests, recette, sans PROD.
7. Mettre à jour `runner-status.json` pour distinguer :
   - `runner_activation_state`
   - `site_work_state`
   afin qu'un gate runner ne donne jamais l'impression que tout le chantier est à l'arrêt.

## Attendu immédiat
- ACK CP-0010 dans l'outbox.
- Liste des KO Florian lus et actions lancées.
- Etat runner + human gate exact.
- Reprise du chantier site sans attendre Florian, sauf la seule action privée/Netlify si vraiment nécessaire.

Aucune PROD. Stripe LIVE gelé. Aucun secret dans Git.
