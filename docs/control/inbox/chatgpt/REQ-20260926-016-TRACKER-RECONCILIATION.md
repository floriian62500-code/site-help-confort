# REQ-20260926-016 — Réconciliation du tracker et gel avant audit global

request_id: REQ-20260926-016
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Problème de contrôle détecté

`docs/control/REQUESTS-TRACKER.json` a été créé, mais les identifiants REQ-010 à REQ-015 ont ensuite été réutilisés par de nouvelles instructions ChatGPT. Le registre est donc déjà ambigu et ne peut pas rester source de vérité dans cet état.

Cette collision doit être corrigée AVANT toute nouvelle modification fonctionnelle.

## Règle

Ne jamais réutiliser un request_id déjà présent dans le tracker.
Les anciens request_id restent historiques et immuables.
Les nouvelles demandes sont remappées vers de nouveaux identifiants sans modifier leur contenu métier.

## Mapping canonique à appliquer

Conserver REQ-001 à REQ-015 actuellement présents dans le tracker comme historique.

Créer les nouvelles entrées suivantes :
- REQ-20260926-016 = Réconciliation du tracker et gel avant audit global (présente instruction)
- REQ-20260926-017 = Contrats sur une seule page / module complet sur Chauffage (instruction fichier `REQ-20260926-010-CONTRATS-ONE-PAGE.md`)
- REQ-20260926-018 = Chauffe-eau / ECS dans l'offre contrats après vérification de source (ancien fichier REQ-011)
- REQ-20260926-019 = Bug catalogue `_default` visible (ancien fichier REQ-012)
- REQ-20260926-020 = Cartes prestations limitées à deux actions (ancien fichier REQ-013)
- REQ-20260926-021 = Audit fonctionnel complet du site (ancien fichier REQ-014)
- REQ-20260926-022 = Montrer/prototyper avant toute modification structurelle (ancien fichier REQ-015)

Dans le tracker, ajouter un champ `legacy_instruction_id` pour ces six demandes afin de conserver la traçabilité avec les noms de fichiers déjà publiés.

Mettre `prochain_id` à `REQ-20260926-023`.

## Statuts à corriger

REQ-005 ne peut plus être READY_FOR_CONTROL : Florian a refusé visuellement la section premium. Statut = REWORK_REQUIRED, attempt = 2, lié à `REQ-20260926-005-REWORK-2.md`.

REQ-004 reste REWORK_REQUIRED / WAITING_FLORIAN_DIRECTION : Florian maintient que les pictos du footer sont mauvais visuellement. Ne pas clôturer sur la seule conclusion « le libellé était faux ». Le prochain traitement doit partir du rendu attendu par Florian, pas de l'interprétation du mapping actuel.

REQ-003 reste READY_FOR_CONTROL techniquement mais WAITING_FLORIAN_VISUAL : les captures récentes ont montré des défauts visuels successifs ; ne pas fermer.

REQ-001 reste READY_FOR_CONTROL uniquement comme AUDIT/PRÉPARATION. La sécurité production n'est PAS clôturée : plusieurs vulnérabilités restent PROD_UNSAFE et cinq actions nécessitent GO Florian.

## Gel renforcé

Jusqu'à validation de REQ-021 + REQ-022 :
- aucune nouvelle refonte ;
- aucune suppression de page ;
- aucune 301 ;
- aucune fusion de parcours ;
- aucune nouvelle architecture ;
- aucune modification Stripe LIVE ;
- aucune mise en production.

Les corrections purement régressives déjà demandées (REQ-019 `_default`, REQ-020 deux actions) peuvent être préparées uniquement si elles restent minimales et isolées, mais ne doivent pas détourner l'audit global.

## Audit global

Priorité après réconciliation : REQ-021 puis REQ-022.
Claude doit montrer l'architecture cible avant toute implémentation.

## Retour attendu

- REQUESTS_TRACKER_FIXED
- COLLISIONS_RESOLVED
- CANONICAL_NUMBERING_MAP
- REQ005_STATUS_FIXED
- REQ004_STATUS_FIXED
- SECURITY_STATUS_NOT_CLOSED
- NEXT_REQUEST_ID
- SHA
- NO_PROD_MUTATION_PROOF

Puis STOP. Aucun changement public dans ce lot.