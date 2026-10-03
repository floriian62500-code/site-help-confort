# REQ-20260926-015 — Garde de conception : montrer avant de modifier

request_id: REQ-20260926-015
parent_request_id: REQ-20260926-014
priority: P0
status: OPEN
date: 2026-09-26

## Décision Florian

Avant toute refonte fonctionnelle ou visuelle issue de l'audit global, Claude doit MONTRER la proposition et attendre validation.

Il est interdit de transformer l'architecture du site directement dans le code sans validation préalable.

## Vision produit à préserver

Le site doit rester une vitrine haut de gamme et moderne de HELP CONFORT Saint-Omer / Dépan'Audo, avec une expérience claire et contemporaine.

Le site cible doit permettre simplement :
- découvrir la marque et ses engagements ;
- comprendre tous les métiers proposés ;
- voir toutes les prestations ;
- consulter les prestations à prix ferme ;
- acheter/réserver en ligne les prestations éligibles ;
- demander un devis pour les prestations non chiffrables ;
- consulter les réalisations / chantiers ;
- découvrir les contrats d'entretien ;
- reprendre une demande en cours ;
- contacter ou appeler l'agence facilement.

## Règle de conception

Avant toute modification structurante, Claude doit produire un prototype de parcours et une proposition d'architecture SANS modifier les pages publiques.

Le livrable doit montrer :
1. arborescence cible ;
2. rôle de chaque type de page ;
3. parcours utilisateur principaux ;
4. CTA principaux par page ;
5. éléments à conserver ;
6. doublons proposés à supprimer ;
7. redirections proposées ;
8. impact SEO ;
9. impact paiement/devis ;
10. captures/wireframes ou maquettes suffisamment précises pour validation Florian.

## Parcours à montrer avant implémentation

A. Comprendre la marque -> Accueil -> Métier -> Prestation.
B. Voir toutes les prestations -> Nos prestations -> filtrer -> fiche prestation.
C. Acheter une prestation tarifée -> fiche/catalogue -> panier/réservation -> coordonnées -> paiement.
D. Demander un devis -> métier/prestation -> tunnel devis -> coordonnées -> confirmation.
E. Voir les réalisations -> Actu & réalisations -> chantier -> retour métier/prestation.
F. Contrat d'entretien -> Chauffage -> module contrats -> choisir formule -> souscription.
G. Reprendre une demande -> entrée dédiée, sans casser une nouvelle intention.

## Interdictions

- aucune suppression de page avant validation ;
- aucune 301 avant validation ;
- aucun changement de navigation globale avant validation ;
- aucune fusion de parcours devis/paiement sans validation ;
- aucun nouveau composant global avant validation ;
- aucune modification production ;
- aucune migration ;
- aucun changement Stripe LIVE.

## Méthode obligatoire

Étape 1 : AUDIT.
Étape 2 : PROPOSITION cible.
Étape 3 : PREVIEW / maquette / wireframe.
Étape 4 : validation Florian.
Étape 5 : seulement après validation, implémentation par petits lots.

Chaque lot devra avoir un request_id propre, un avant/après, tests, SHA, rollback, et validation visuelle.

## Livrable demandé maintenant

Sans toucher aux pages publiques, publier :
- TARGET_SITE_MAP
- TARGET_USER_JOURNEYS
- KEEP_LIST
- REMOVE_OR_MERGE_PROPOSALS
- SEO_RISKS
- PAYMENT_AND_QUOTE_ARCHITECTURE
- WIREFRAME_OR_PREVIEW_PLAN
- HUMAN_DECISIONS_REQUIRED
- SHA
- NO_PUBLIC_PAGE_MUTATION_PROOF

Statut attendu : READY_FOR_CONTROL.
Claude ne marque pas CLOSED.