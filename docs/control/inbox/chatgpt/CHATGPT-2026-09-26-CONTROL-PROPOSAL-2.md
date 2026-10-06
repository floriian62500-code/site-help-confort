# Contrôle ChatGPT — retour sur proposition corrigée + REQ-023

message_id: CHATGPT-2026-09-26-CONTROL-PROPOSAL-2
priority: P0
status: REWORK_REQUIRED
date: 2026-09-26

## Verdict

La version corrigée de REQ-022 est nettement meilleure et reprend correctement l'achat direct, le retrait des affirmations SEO non prouvées, la matrice de modes commerciaux et l'ECS.

Mais elle n'est PAS encore validée pour implémentation. Plusieurs points doivent être corrigés ou clarifiés avant présentation finale à Florian.

## 1. REQ-023 doit entrer dans le tracker immédiatement

Une nouvelle demande existe : `REQ-20260926-023-ZONES-CALAIS-BOULOGNE.md`.

Le tracker affiche encore `prochain_id = REQ-20260926-023`, ce qui recrée immédiatement un risque de collision.

À faire :
- ajouter REQ-20260926-023 au tracker : « Zones d'intervention : Calais et Boulogne comme pôles principaux » ;
- statut `OPEN / WAITING_FLORIAN_VISUAL` tant que le rendu n'est pas montré ;
- mettre `prochain_id = REQ-20260926-024` ;
- ne modifier aucune page publique dans ce lot.

## 2. Paiement direct : séparer clairement deux architectures

La cible PRICE_FIXED est acceptée : achat/réservation + paiement en ligne direct possible sans validation humaine obligatoire.

Mais les étapes transitoires proposées mélangent encore le flux back-office `interventions_montant` avec le futur flux d'achat public basé sur `v_services_public`.

Il faut distinguer :

### Flux A — achat public PRICE_FIXED
- source produit/prix : `v_services_public` ;
- le client envoie uniquement IDs + quantités / variantes ;
- le serveur recalcule prix et éligibilité ;
- session Stripe créée depuis ce calcul serveur ;
- idempotence ;
- webhook signé ;
- statut de commande/paiement.

### Flux B — lien de paiement back-office
- source montant : intervention/dossier validé ;
- `interventions.montant_ttc` peut être pertinent ici ;
- appel authentifié et rôle contrôlé ;
- lien généré par l'agence.

Ne pas faire dépendre le futur achat public PRICE_FIXED de la migration `interventions_montant` si elle n'est pas nécessaire à ce flux.

## 3. Il manque le modèle de commande du futur achat direct

Pour une vraie vente/réservation en ligne, le document doit dire où vit la commande AVANT et APRÈS Stripe.

Sans migration pour l'instant, proposer le modèle logique :
- cart/order id ;
- lignes produit ;
- prix serveur ;
- coordonnées ;
- zone ;
- créneau ou préférence ;
- statut `draft / pending_payment / paid / payment_failed / cancelled / needs_review` ;
- Stripe session/payment intent ;
- idempotency key ;
- horodatages.

Dire explicitement si la cible réutilise `leads`, `payments`, ou prévoit une table `orders` à valider plus tard.
Ne rien créer en base maintenant.

## 4. Créneau : ne pas promettre une disponibilité qui n'existe pas

La maquette PRICE_FIXED affiche « Zone + créneau + coordonnées ».

Vérifier si le site possède une vraie source de créneaux réservables.
Si non : remplacer dans la cible par `préférence de créneau / disponibilité souhaitée`, ou marquer le créneau comme composant futur dépendant d'une source de disponibilité.

Ne jamais laisser croire au client qu'un rendez-vous est confirmé si le système ne peut pas le garantir.

## 5. Contrats : clarifier ECS

La preuve est utile : `contrat-entretien-chauffe-eau` = 220 € TTC, `warranty = Engagement annuel`, présent dans `v_services_public`, pas dans `v_contract_offers`.

Conséquence à écrire clairement :
- Gaz/Fioul/Adoucisseur = offres récurrentes issues de `v_contract_offers` ;
- Chauffe-eau/ECS = prestation annuelle tarifée issue de `v_services_public` ;
- elle peut apparaître dans le même espace commercial « entretien / contrats », mais ne doit pas être présentée comme une formule mensuelle si ce n'est pas sa nature.

## 6. Mode commercial : VMC reste une décision métier

`vmc` = requires_quote=true + prix 350 € HT.

Ne la classer définitivement PRICE_CONFIRM qu'après validation Florian ou correction de la donnée.
Dans la matrice finale : `PROPOSED_PRICE_CONFIRM / NEEDS_BUSINESS_DECISION`.

## 7. Cartes catalogue

Le modèle est accepté sous réserve de validation Florian :
- 1 action commerciale principale ;
- lien texte secondaire « Voir le détail » ;
- téléphone hors carte.

REQ-020 reste OPEN jusqu'à validation de la proposition globale. Ne pas implémenter avant GO.

## 8. Zones d'intervention — intégrer au prototype global

REQ-023 doit être ajoutée à la proposition cible :
- Saint-Omer / Audomarois ;
- Dunkerque / Littoral ;
- Calais / Calaisis ;
- Boulogne-sur-Mer / Boulonnais.

Important : Calais et Boulogne sont des pôles / zones d'intervention, PAS des agences physiques.

Montrer un wireframe de cette section avec 4 pôles, desktop + mobile, avant toute modification HTML.

## 9. Footer

La source unique de footer est une bonne cible.
Ajouter au prototype la liste canonique des 9 métiers et le principe de pictogrammes, mais laisser le rendu visuel en `WAITING_FLORIAN_VISUAL`.

## 10. Statut final attendu

Après corrections documentaires uniquement :
- REQ-021 = ACCEPTED_AUDIT ;
- REQ-022 = READY_FOR_FLORIAN_VALIDATION, pas READY_FOR_IMPLEMENTATION ;
- REQ-023 = OPEN / WAITING_FLORIAN_VISUAL ;
- NEXT_REQUEST_ID = REQ-20260926-024 ;
- aucune page publique modifiée.

## Retour attendu

- TRACKER_REQ023_ADDED
- NEXT_ID_024
- PUBLIC_PAYMENT_FLOW_SEPARATED
- BACKOFFICE_PAYMENT_FLOW_SEPARATED
- ORDER_MODEL_PROPOSED
- SLOT_AVAILABILITY_STATUS
- ECS_SEMANTICS_CORRECTED
- VMC_NEEDS_BUSINESS_DECISION
- ZONES_4_POLES_WIREFRAME
- UPDATED_PROPOSAL_SHA
- NO_PUBLIC_PAGE_MUTATION_PROOF
- NEXT_ACTION = WAIT_FLORIAN_VALIDATION

Aucune modification HTML publique. Aucun Stripe. Aucune migration. Aucune 301. Aucune mise en production.