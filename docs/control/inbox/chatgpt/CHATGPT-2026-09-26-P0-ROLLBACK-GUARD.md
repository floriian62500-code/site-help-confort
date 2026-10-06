# P0 — GARDE DE RETOUR ARRIÈRE OBLIGATOIRE

message_id: CHATGPT-2026-09-26-P0-ROLLBACK-GUARD
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Décision Florian

Avant toute nouvelle évolution visuelle, fonctionnelle ou structurelle, nous devons pouvoir revenir EXACTEMENT à la version actuelle si le résultat ne convient pas.

## Point de restauration créé par ChatGPT

Branche de sauvegarde : `backup/recette-2026-09-26-before-architecture`
SHA figé : `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`

Cette branche est un checkpoint immuable de la recette actuelle avant les prochains lots d'architecture / UX.

## Règles obligatoires pour Claude

1. Ne jamais modifier ni déplacer cette branche de sauvegarde.
2. Ne jamais la rebaser, la merger ou la force-push.
3. Chaque nouvelle REQ de code doit être isolée dans un commit dédié.
4. Chaque rapport doit fournir un rollback exact : `git revert <SHA>` si possible.
5. Si plusieurs commits sont nécessaires pour une seule REQ, ils doivent être listés dans l'ordre de rollback.
6. Avant tout lot structurel majeur, créer un checkpoint supplémentaire depuis l'état recette validé du moment.
7. Aucun rollback ne doit être appliqué en production sans GO explicite.
8. Aucun merge global `recette -> main`.

## Critère de sécurité de lot

Un lot n'est pas READY_FOR_CONTROL s'il ne contient pas :
- SHA exact ;
- fichiers changés ;
- BEFORE / AFTER ;
- tests ;
- rollback testé ou vérifié logiquement ;
- preuve que le checkpoint de référence existe toujours ;
- NO_PROD_MUTATION_PROOF.

## Si Florian refuse le rendu

Priorité au retour arrière propre :
- revert du ou des commits de la REQ ;
- ou restauration depuis le checkpoint de recette validé ;
- puis nouveau prototype isolé.

Pas de 'réparation par-dessus' en cascade tant que le retour au dernier état stable est possible.

## Retour attendu

- ACK_ROLLBACK_GUARD
- CHECKPOINT_BRANCH_FOUND
- CHECKPOINT_SHA_VERIFIED
- CURRENT_RECETTE_SHA
- ROLLBACK_RULE_ACCEPTED
- NEXT_ACTION

Puis poursuivre uniquement selon l'ordre de contrôle déjà imposé.