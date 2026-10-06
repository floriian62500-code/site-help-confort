# NOUVELLE REGLE — RECETTE DOIT ETRE IDENTIQUE A PROD

Décision Florian définitive :

## Règle
- `main` = production.
- `recette` doit être strictement identique à `main` hors instant très court d'un test explicitement en cours.
- Aucun prototype, ancien essai, outillage, page non validée ou évolution en attente ne doit rester mélangé dans `recette`.

## Sauvegarde faite
L'ancien état de recette est conservé ici :
`archive/recette-2026-10-06-pre-sync`
SHA source sauvegardé :
`26f02a0b0053142519d92c23715ce20579052daf`

Main actuel :
`998aadb5132ccfc9e75073a232de6f945aed4e0f`

## Travail demandé

### 1. INVENTAIRE DES DIFFERENCES
Comparer :
- base = main actuel
- historique = archive/recette-2026-10-06-pre-sync

Classer CHAQUE différence utile dans une des catégories :
- ALREADY_IN_PROD
- OBSOLETE
- CONTROL_ONLY
- NEEDS_FLORIAN_VALIDATION
- SENSITIVE_GATE
- READY_TO_RELEASE

Ne pas utiliser le nombre de commits comme critère métier.

### 2. ELEMENTS NON VALIDES
Pour chaque élément visible/fonctionnel non validé :
- une fiche courte ;
- ce que cela change réellement pour le visiteur ;
- capture ou preview si visuel ;
- recommandation OUI / NON / A REVOIR ;
- aucune intégration en prod avant validation si HUMAN_GATE.

### 3. ELEMENTS DEJA VALIDES
Si une différence archive correspond à une évolution déjà validée mais absente de prod :
- reconstruire depuis le main courant ;
- lot minimal ;
- preview ;
- preuves ;
- PASS/BLOCKED ;
- si PASS et non sensible : merge sous GO général Florian ;
- PROD_VERIFY.

### 4. REALIGNEMENT RECETTE
Une fois l'inventaire sécurisé :
- réaligner `recette` sur le SHA exact de `main` par la procédure autorisée par les protections GitHub ;
- ne jamais perdre l'archive ;
- après réalignement, vérifier :
  - même SHA ou contenu strictement identique selon mécanisme autorisé ;
  - 0 différence publique ;
  - centre de contrôle séparé si nécessaire, mais PAS dans la branche recette si cela crée un diff permanent.

### 5. REGLE PERMANENTE
À partir de maintenant :
- toute nouvelle évolution part de `main`;
- branche feature/preview séparée ;
- validation ;
- merge prod ;
- PROD_VERIFY ;
- puis `recette` réalignée immédiatement sur `main`;
- jamais de développement long vivant directement dans `recette`.

## IMPORTANT
Florian veut valider CHAQUE élément non encore validé avant intégration.
En revanche, ne lui redemande pas de revalider ce qui a déjà un GO clair et une preuve.
