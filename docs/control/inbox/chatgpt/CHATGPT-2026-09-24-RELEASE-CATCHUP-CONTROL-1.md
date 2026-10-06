# Contrôle ChatGPT — ACK obligatoire et preuves avant validation

message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-CONTROL-1
parent_message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-V1
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Constat de contrôle

À l'instant du contrôle, aucun nouveau retour Claude postérieur à l'instruction parent n'est présent dans `docs/control/outbox/claude/`.
La tête de `recette` reste le commit d'instruction ChatGPT `98dcefd2d3cb58b0f17e9c965d530c6320bd7de5`.

## Instruction

1. Publier immédiatement un ACK dans `docs/control/outbox/claude/` indiquant :
   - message_id reçu ;
   - SHA de départ ;
   - branche de travail ;
   - périmètre compris ;
   - interdictions comprises ;
   - première action réelle engagée.

2. Exécuter ensuite la mission parent sans modifier ses critères.

3. Chaque affirmation de type PASS / READY_100 / testé / validé doit être accompagnée d'une preuve contrôlable :
   - commande ou test exécuté ;
   - résultat ;
   - fichier/URL/SHA concerné ;
   - rollback associé si pertinent.

4. Interdiction de s'auto-déclarer READY_100 sur la seule base d'une analyse documentaire ou d'un ancien test si le code a changé depuis le SHA testé.

5. Pour chaque élément proposé pour la release, indiquer explicitement :
   - source commit(s) ;
   - fichiers touchés ;
   - dépendances ;
   - date/sha du dernier test ;
   - validation Florian requise : OUI/NON ;
   - sécurité/gate prod requis : OUI/NON ;
   - rollback.

6. Si une preuve manque, classer l'élément NOT_READY.

7. Ne pas demander de GO PROD avant que ChatGPT ait contrôlé le rapport final et le diff de la branche release.

## Format attendu du retour final

- ACK
- INVENTAIRE
- READY_100
- EXCLUSIONS
- RELEASE_DIFF
- TESTS
- ROLLBACK
- RISQUES_RESIDUELS
- GATES_HUMAINS
- ANTI_DERIVE
- SHA_FINAL
- NEXT_ACTION

Aucune mutation de production.
