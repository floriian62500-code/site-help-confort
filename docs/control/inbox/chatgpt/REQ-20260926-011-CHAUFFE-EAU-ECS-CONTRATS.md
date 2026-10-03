# REQ-20260926-011 — Ajouter le chauffe-eau / ECS dans l'offre contrats

request_id: REQ-20260926-011
priority: P1
status: OPEN
date: 2026-09-26

## Décision Florian

Le produit « Contrat entretien chauffe-eau annuel » doit apparaître dans la présentation des contrats/entretiens récurrents, au même titre que les offres chaudière et adoucisseur, si la source canonique confirme qu'il s'agit bien d'une offre annuelle active.

## Preuve actuelle dans le dépôt

`data/contrats-tarifs.json` contient :
`Contrat entretien chauffe-eau annuel`: 220.00 TTC.

Attention : cette ligne est aujourd'hui rangée sous `prestations_ponctuelles_ttc`, donc il faut vérifier sa nature réelle dans la source canonique (`v_contract_offers` / `v_services_public`) avant de décider sa présentation.

## À faire

1. Vérifier en lecture seule la source canonique actuelle pour « Contrat entretien chauffe-eau annuel ».
2. Déterminer sans ambiguïté :
- contrat annuel ;
- prestation ponctuelle annuelle ;
- périodicité de facturation ;
- prix TTC et unité (par an / par intervention / par mois).
3. Si c'est bien une offre annuelle active, l'intégrer dans le module contrats de la page Chauffage.
4. Ne pas inventer un prix mensuel.
5. Si le prix est 220 € TTC/an, l'afficher exactement comme tel.
6. Prévoir une entrée/category claire « Chauffe-eau / ECS » sans perturber Gaz / Fioul / Adoucisseur.

## UX souhaitée

Le client doit pouvoir comprendre dans le même espace contrats qu'il existe aussi une offre d'entretien annuel du chauffe-eau/ECS.

Ne pas dupliquer toute la page. Une seule source de données et une seule logique de souscription.

## Tests

- source canonique prouvée ;
- tarif et périodicité exacts ;
- affichage desktop/mobile ;
- aucune confusion avec les contrats mensuels chaudière ;
- aucun prix inventé ;
- aucune modification paiement/Stripe dans ce lot ;
- aucune mutation production.

## Retour attendu

- SOURCE_CANONIQUE
- PRODUCT_TYPE
- BILLING_PERIOD
- PRICE
- INTEGRATION_DECISION
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Statut après preuve : READY_FOR_CONTROL. Claude ne marque pas CLOSED.