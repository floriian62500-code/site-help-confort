# REQ-20260926-022 — EXÉCUTION OBLIGATOIRE : montrer l'architecture cible avant toute modification

request_id: REQ-20260926-022
priority: P0
status: REWORK_REQUIRED
attempt: 2
date: 2026-09-26

## Verdict ChatGPT

L'audit REQ-021 est utile et suffisamment détaillé, mais il ne répond pas encore au besoin opérationnel de Florian.
Florian a raison sur un point : à ce stade, on a surtout produit des constats et de la documentation. Il faut maintenant MONTRER concrètement la cible avant toute modification du site.

## Ce qui est accepté dans REQ-021

- distinction claire entre `nos-prestations.html` = catalogue public et `catalogue.html` = tunnel ;
- inventaire des 16 liens métier encore routés directement vers le tunnel ;
- confirmation que les fiches `/prestations/*.html` ont un rôle SEO sain ;
- identification du doublon contrats ;
- identification du paiement client fantôme (`create-payment-session` non déployé) ;
- identification du flux back-office Stripe vulnérable ;
- constat des cinq versions de footer ;
- parcours cible en 5 étapes maximum.

## Ce qui manque

REQ-022 n'est PAS exécutée.
Il faut produire une proposition VISUELLE et STRUCTURELLE compréhensible par Florian, sans toucher aux pages publiques.

## Livrable obligatoire

Créer `docs/audit/PROPOSITION-SITE-CIBLE-2026-09-26.md` avec :

### 1. Arborescence cible
Montrer exactement :
- Accueil
- Métiers
- Nos prestations
- Fiches prestation
- Réalisations
- Contrats
- Demande / devis
- Achat / réservation
- Contact

Pour chaque type de page : rôle, contenu, CTA principal, CTA secondaire.

### 2. Parcours utilisateur concrets
Montrer avec flèches simples :
- Accueil -> Métier -> Prestation -> Devis
- Accueil -> Métier -> Prestation tarifée -> Achat/Réservation
- Accueil -> Nos prestations -> Filtre -> Prestation -> Action
- Métier Chauffage -> Contrats -> Souscription
- Réalisations -> Chantier -> Métier/prestation liée
- Reprise de demande.

### 3. Décision proposée pour les doublons
Pour CHAQUE doublon, écrire :
- garder
- fusionner
- rediriger
- supprimer plus tard

Mais NE RIEN APPLIQUER.

Traiter explicitement :
- `contrats-entretien.html` vs module contrats Chauffage ;
- `nos-prestations.html` vs `/prestations/*.html` ;
- `catalogue.html` vs catalogue public ;
- CTA pages métier ;
- footer en 5 versions.

### 4. Proposition visuelle
Fournir des wireframes ou maquettes simples pour :
- Accueil
- une page métier type
- Nos prestations
- une fiche prestation
- tunnel devis/achat

Le but n'est pas un design final pixel-perfect, mais que Florian puisse dire OUI/NON avant code.

### 5. Commerce
Pour chaque type de prestation, montrer UNE action commerciale principale :
- prix ferme -> Acheter/Réserver ;
- sur devis -> Demander un devis ;
- prix à confirmer -> Demander confirmation/devis.

Pas de troisième bouton parasite.

### 6. Paiement
Montrer séparément :
- parcours client public futur ;
- parcours back-office de lien de paiement ;
- ce qui est TEST aujourd'hui ;
- ce qui est LIVE aujourd'hui ;
- ce qui doit être sécurisé avant activation.

### 7. Contrats
Tenir compte de la décision Florian : il préfère le module complet directement sur la page Chauffage si cela ne crée pas de problème SEO majeur.
Comparer explicitement les deux options :
A. module complet sur Chauffage + 301 de la page contrats ;
B. conserver une page contrats séparée.
Donner impacts SEO/UX, SANS trancher à la place de Florian.

## Important

Ne pas interpréter « audit » comme fin de mission.
Le prochain résultat attendu est une proposition montrable, pas un nouveau rapport abstrait.

## Interdictions

- aucun changement HTML public ;
- aucune suppression ;
- aucune 301 ;
- aucun changement navigation ;
- aucun changement Stripe ;
- aucune mise en production.

## Retour attendu

- REQUEST_ID
- PROPOSAL_FILE
- SITE_MAP_TARGET
- USER_JOURNEYS
- DUPLICATE_DECISIONS_PROPOSED
- WIREFRAMES
- CONTRACTS_OPTIONS
- PAYMENT_TARGET_FLOW
- HUMAN_DECISIONS_REQUIRED
- SHA
- NO_PUBLIC_PAGE_MUTATION_PROOF

Après publication : STOP et attendre validation Florian.