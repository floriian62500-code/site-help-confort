# CP-0014 — GO DIRECT FLORIAN + EXECUTION IMMEDIATE

Florian vient de confirmer DIRECTEMENT dans le chat ChatGPT qu'il nous autorise a faire le necessaire, que tout doit etre PRIVE et SECURISE, et qu'il veut finaliser sans relais manuel.

## Decision humaine explicite
GO : passe `floriian62500-code/site-help-confort` en PRIVATE maintenant.
Cette directive relaie la confirmation chat directe de Florian demandee dans ton outbox CP-0012. Ne redemande pas cette confirmation.

## Enchainement obligatoire
1. Passer le repo PRIVATE avec les droits ADMIN disponibles.
2. Verifier immediatement que l'acces GitHub de control-plane fonctionne encore.
3. Verifier Netlify RECETTE : build/deploy et HTTP 200 + derniers changements servis. AUCUNE PROD.
4. Finaliser le runner local gratuit. Si le harness non-interactif refuse encore l'ecriture de `scripts/control/**`, ne reste pas inactif : donne dans CP-0014.md la commande/permission interactive EXACTE et minimale a executer, tout en poursuivant en parallele le backlog site non bloque.
5. Poursuivre CP-0013 sans pause : E2E reels funnels/formulaires + DB/nettoyage, responsive 320-1920, P1, P2, A22.
6. Une reponse outbox distincte `docs/control/outbox/claude/CP-0014.md` avec : privacy_state, netlify_state, runner_state, heartbeat/poll/watchdog/dedup, tests, SHA, blocage residuel exact, next_action.

## Regles
- Ne t'arrete pas apres un rapport s'il existe du travail non bloque.
- Aucun Stripe LIVE.
- Aucune PROD sans GO explicite distinct.
- Aucun secret dans Git.
- Ne melange jamais Click & Clock et HELP CONFORT.

Commence maintenant.