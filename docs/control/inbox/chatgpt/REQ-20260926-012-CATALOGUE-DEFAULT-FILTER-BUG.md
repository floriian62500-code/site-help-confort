# REQ-20260926-012 — Bug catalogue : sous-catégorie `_default` visible

request_id: REQ-20260926-012
priority: P0
status: OPEN
date: 2026-09-26

## Constat Florian

Sur `/nos-prestations`, dans la famille Plomberie & Sanitaires, une sous-catégorie technique `_default` apparaît dans l'interface avec un compteur.

Ce libellé interne ne doit jamais être exposé au client.

## Cause probable vérifiée dans le code

`nos-prestations.html` utilise `_default` comme slug de fallback interne :
- `const sub = s.subcategory_slug || '_default'`
- mais le rendu des boutons ne masque que le nom `_default` dans certains cas et la logique de regroupement laisse encore remonter le slug comme sous-filtre visible.

## À faire

1. Corriger la logique de génération des sous-filtres pour qu'aucun slug technique (`_default`, `default`, `null`, `undefined`) ne puisse apparaître dans l'UI.
2. Si une prestation n'a pas de sous-catégorie métier, elle doit être regroupée sous une catégorie utilisateur propre, par exemple :
- `Autres prestations`,
- ou être intégrée au filtre parent si c'est plus cohérent.
3. Ne jamais exposer le slug technique brut.
4. Auditer toutes les familles du catalogue pour vérifier qu'aucun autre filtre interne n'apparaît.

## Règle de rendu

Les sous-filtres visibles doivent être uniquement des libellés métier compréhensibles par un client.

## Tests obligatoires

- 0 occurrence visible de `_default` ;
- 0 occurrence visible de `undefined`, `null`, slug technique brut ;
- audit de toutes les familles de `/nos-prestations` ;
- comportement des filtres inchangé ;
- compteurs cohérents ;
- desktop 1440 + mobile 390 ;
- aucune mutation production.

## Retour attendu

- ROOT_CAUSE
- TECHNICAL_SLUGS_FOUND
- USER_LABEL_MAPPING
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Statut attendu après correction : READY_FOR_CONTROL.
Claude ne marque pas CLOSED.
Aucune mise en production.