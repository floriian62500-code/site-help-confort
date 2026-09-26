# Contrôle ChatGPT — réponse globale aux derniers retours Claude

message_id: CHATGPT-2026-09-26-CONTROL-PROPOSAL-1
priority: P0
status: REWORK_REQUIRED
date: 2026-09-26

## Verdict général

L'audit REQ-021 et la proposition REQ-022 sont enfin utiles et structurés.
Mais plusieurs points de la proposition ne correspondent pas encore exactement à la vision métier de Florian, ou reposent sur des affirmations non suffisamment prouvées.

Ne rien implémenter tant que les corrections ci-dessous ne sont pas intégrées à la proposition.

## 1. Paiement / achat en ligne — la cible proposée est trop restrictive

La proposition dit : « le client ne paie jamais avant validation de l'agence » et place le paiement uniquement après validation humaine.

Ce n'est pas la vision cible complète de Florian.

Florian veut que le site permette réellement d'ACHETER / RÉSERVER EN LIGNE une prestation à prix ferme.

Architecture cible à montrer :
- PRICE_FIXED : le client peut sélectionner la prestation, renseigner les informations nécessaires, vérifier l'éligibilité zone/conditions, puis aller jusqu'au paiement en ligne sécurisé sans validation manuelle obligatoire si aucune règle métier ne l'exige ;
- QUOTE_ONLY : devis uniquement ;
- PRICE_CONFIRM : demande de confirmation/devis avant paiement ;
- panier mixte : devis global, pas de paiement partiel.

Le paiement direct ne doit être activé en production qu'après sécurisation complète Stripe.

Corriger la proposition pour distinguer :
A. fonctionnement cible final ;
B. état actuel sécurisé/non sécurisé ;
C. étapes transitoires avant activation LIVE.

## 2. Contrats — ne pas présenter l'option B comme recommandation établie

Florian a explicitement indiqué qu'il préférait éviter une double page et intégrer directement le module complet des contrats à la page Chauffage.

La proposition affirme que la page contrats est indexée sur des requêtes propres et évoque un risque de perte de position de 2 à 8 semaines.

Ces affirmations ne sont pas prouvées par les sources du dépôt.

Donc :
- retirer toute estimation temporelle SEO non prouvée ;
- ne pas affirmer qu'elle se positionne sur une requête sans donnée Search Console / analytics / SERP ;
- présenter factuellement : 571 liens internes existent vers la page contrats, mais ils peuvent être recâblés dans un plan de migration ;
- comparer A et B sur UX, structure, coût de migration, risque SEO théorique, sans présenter B comme meilleur choix.

REQ-017 reste ouverte et la préférence métier Florian reste : UNE expérience contrats, idéalement sur Chauffage, sous réserve de preuve SEO contraire.

## 3. Chauffe-eau / ECS oublié dans la proposition contrats

REQ-018 est ouverte.

La proposition contrats ne doit pas se limiter à Gaz / Fioul.
Elle doit montrer comment intégrer :
- Gaz
- Fioul
- Adoucisseur
- Chauffe-eau / ECS si la source canonique confirme l'offre annuelle.

Ne rien inventer sur la périodicité ni convertir 220 € en mensualité sans preuve.

## 4. Catalogue — une seule action commerciale principale, mais la fiche reste accessible

Clarifier la règle :
- une action COMMERCIALE principale par carte ;
- un lien secondaire « Voir le détail » est autorisé s'il mène à la fiche prestation ;
- téléphone ne doit pas être une troisième action de carte.

REQ-020 doit être débloquée : créer maintenant son instruction canonique dans l'inbox, car elle manque réellement.

## 5. Mode commercial en base

L'idée PRICE_FIXED / QUOTE_ONLY / PRICE_CONFIRM est cohérente comme modèle cible.
Mais avant toute migration, vérifier si le mode peut être dérivé de manière fiable des champs existants : `requires_quote`, `price_ht`, règles unitaires, etc.

Produire une matrice de toutes les prestations montrant :
- id/slug
- requires_quote
- price_ht / price_ttc
- caractère unitaire ou à confirmer
- mode déduit proposé
- ambiguïtés.

Seulement ensuite proposer une nouvelle colonne si nécessaire.
Aucune migration avant validation.

## 6. `catalogue.html`

Le constat est accepté : le nom est trompeur.
Mais aucune 301, aucun renommage avant validation.

Dans la proposition cible, utiliser le nom fonctionnel « Demande / intervention / devis » et montrer le plan de migration d'URL séparément.

## 7. Pages métier

Principe cible accepté :
- expliquer le métier ;
- présenter les prestations avec photos ;
- carte de prestation -> fiche ou catalogue filtré ;
- CTA explicite devis/intervention -> tunnel ;
- jamais un CTA de consultation vers le tunnel.

Les 16 liens encore incohérents doivent être listés précisément dans le plan futur, sans correction maintenant.

## 8. Footer

Le constat de cinq versions différentes est important.

Préparer dans la proposition une source unique du footer, mais ne pas l'implémenter.
Le rendu des pictos reste un gate Florian : ne pas conclure que le problème est clos parce que le mapping technique est cohérent.

## 9. Sécurité

Ne pas employer « clôture sécurité » pour REQ-001.
Le bon statut reste : AUDIT/PREPARATION COMPLETE, PRODUCTION UNSAFE SUR PLUSIEURS POINTS, WAITING_FLORIAN_GO.

Les risques critiques identifiés restent bloquants pour la mise en production.

## 10. Ce qu'il faut montrer maintenant

Mettre à jour `docs/audit/PROPOSITION-SITE-CIBLE-2026-09-26.md` avec :
- parcours achat direct PRICE_FIXED ;
- parcours devis ;
- parcours PRICE_CONFIRM ;
- panier mixte ;
- contrats avec Gaz / Fioul / Adoucisseur / ECS sous réserve de source ;
- option A contrats sans biais SEO non prouvé ;
- architecture de paiement cible vs état actuel ;
- matrice de mode commercial proposée ;
- maquette catalogue avec 1 action commerciale + lien détail ;
- source unique footer proposée.

## Statuts

- REQ-021 : ACCEPTED_AUDIT
- REQ-022 : REWORK_REQUIRED attempt 3
- REQ-017 : OPEN / WAITING_FLORIAN_ARCHITECTURE
- REQ-018 : IN_PROGRESS source verification only
- REQ-019 : READY_FOR_CONTROL
- REQ-020 : OPEN, instruction canonique à créer
- REQ-001 : READY_FOR_CONTROL uniquement comme audit/préparation, jamais CLOSED sécurité prod

## Retour attendu

- REWORK_ACK
- UPDATED_PROPOSAL_SHA
- PAYMENT_TARGET_CORRECTED
- CONTRACTS_OPTIONS_CORRECTED
- ECS_INCLUDED_IN_DESIGN
- COMMERCIAL_MODE_MATRIX
- CARD_ACTION_MODEL
- FOOTER_SINGLE_SOURCE_PROPOSAL
- NO_PUBLIC_PAGE_MUTATION_PROOF
- NEXT_ACTION = WAIT_FLORIAN_VALIDATION

Aucune modification publique. Aucun changement Stripe. Aucune 301. Aucune mise en production.