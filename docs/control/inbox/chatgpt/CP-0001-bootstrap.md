---
message_id: CP-0001
priority: P0
status: OPEN
needs_human: false
date: 2026-08-11
expected_decision: EXECUTE_AND_REPORT
---

# ACK attendu : audit initial + installation du runner

## Contexte
Le control-plane persistant vient d'être initialisé pour le projet HELP CONFORT. Ne pas créer un système parallèle au centre `/recette.html` et ne pas toucher à la production.

## Instruction Claude
1. Lire `docs/control/README.md` et `PROJECT_STATE.json`.
2. Auditer factuellement le dépôt : stack, branches, CI/CD, Netlify, Supabase, auth, edge functions, scripts/runners existants, tests, environnements et branche réellement servie.
3. Réutiliser l'existant. Ne supprimer/ne remplacer aucun mécanisme avant preuve qu'il est obsolète.
4. Concevoir puis implémenter un runner borné et récupérable pour `inbox/chatgpt` → ACK → exécution → tests → commit/push → `outbox/claude` → rework. Il doit avoir heartbeat, watchdog, retry borné, reprise crash et dédup persistante par `message_id`.
5. Ne jamais stocker de secret dans Git. Utiliser les secrets du fournisseur CI/runtime.
6. Ajouter les tests du protocole : message nouveau, doublon, erreur/retry, needs_human, reprise après interruption, outbox complète.
7. Produire `docs/ai/REPO_HYGIENE_AUDIT.md` et mettre à jour `runner-status.json`.
8. Toute modification visible du site doit passer par `/recette.html`; ce bootstrap ne doit pas modifier la Home ni les pages métier.
9. Aucun déploiement production. Aucun paiement LIVE. Aucune mutation sensible de données prod.

## Critères d'acceptation
- Audit initial écrit et sourcé par le dépôt.
- Runner réellement exécutable dans l'environnement choisi, pas seulement pseudocode.
- Tests du protocole PASS.
- Heartbeat/watchdog/retry/dédup/reprise prouvés.
- Aucun secret ajouté au repo.
- Une réponse `docs/control/outbox/claude/CP-0001.md` contenant : ACK, actions, fichiers, tests, SHA, push, déploiement éventuel, preuves, anomalies, gates, needs_human et prochaine action.
- Si une permission/connexion externe manque réellement, mettre `needs_human=true` avec une seule demande précise au lieu de bloquer le reste.

## Gate
La mise en production du control-plane et toute automatisation ayant des droits de mutation prod restent interdites sans validation humaine.
