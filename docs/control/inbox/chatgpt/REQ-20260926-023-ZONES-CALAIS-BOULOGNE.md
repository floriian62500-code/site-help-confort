# REQ-20260926-023 — Zones d'intervention : Calais et Boulogne doivent être des zones principales

request_id: REQ-20260926-023
priority: P1
status: OPEN
date: 2026-09-26

## Constat Florian

Sur `/zones-intervention`, la présentation principale n'affiche que deux grandes cartes :
- Saint-Omer & Audomarois
- Dunkerque & littoral.

Calais et Boulogne-sur-Mer sont seulement noyées dans les listes de villes / zones couvertes.
Florian demande qu'elles apparaissent elles aussi comme zones principales visibles.

## Vérification du code

`zones-intervention.html` mentionne déjà Calais et Boulogne dans :
- le H1 ;
- le texte d'introduction ;
- les données cartographiques ;
- les pills de villes ;
- le footer.

Mais la section visuelle principale n'a que deux cartes de territoire. Le problème est donc bien un problème de hiérarchie visuelle et non d'absence de données.

## Attendu

Faire apparaître quatre pôles principaux de couverture, de manière cohérente :
- Saint-Omer / Audomarois
- Dunkerque / Littoral
- Calais / Calaisis
- Boulogne-sur-Mer / Boulonnais.

Chaque pôle doit avoir :
- un titre propre ;
- une courte description ;
- les communes principales de son secteur ;
- un lien vers sa page de dépannage ville si elle existe.

## Important

Ne pas inventer une nouvelle agence physique pour Calais ou Boulogne.
Il s'agit de zones d'intervention / pôles géographiques, pas d'agences distinctes.

Ne pas modifier la carte globale, les coordonnées d'agence ou les données structurées sans nécessité.

## Méthode

Avant de changer le design : proposer le rendu cible dans la maquette/proposition globale ou fournir un avant/après isolé de cette section.

## Tests

- 4 pôles principaux visibles ;
- aucune ambiguïté agence vs zone couverte ;
- liens Calais / Boulogne fonctionnels ;
- desktop 1440 + mobile 390 ;
- aucune mutation production.

## Retour attendu

- ROOT_CAUSE
- CURRENT_STRUCTURE
- PROPOSED_STRUCTURE
- FILES_CHANGED
- SCREENSHOTS_1440_390
- LINKS_VERIFIED
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production. Claude ne marque pas CLOSED.