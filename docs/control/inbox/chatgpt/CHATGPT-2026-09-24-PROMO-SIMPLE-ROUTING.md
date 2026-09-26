# Recadrage fonctionnel — bannière Entretien / Ramonage / Poêle

message_id: CHATGPT-2026-09-24-PROMO-SIMPLE-ROUTING
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Demande Florian — à appliquer littéralement

Le besoin est simple. Ne pas complexifier.

### 1. Entretien chaudière

**La prestation / le parcours existe déjà.**

Il ne faut PAS recréer un tunnel, PAS ajouter une nouvelle logique métier, PAS dupliquer une prestation.

Action :
- retrouver l'entrée canonique existante « Entretien chaudière » dans le tunnel/catalogue ;
- brancher directement le CTA de la bannière dessus ;
- le clic doit ouvrir le tunnel sur cette intention existante ;
- aucun ancien brouillon sans rapport ne doit remplacer cette intention.

Critère :
**clic bannière Entretien chaudière → parcours Entretien chaudière existant.**

### 2. Ramonage

Ce parcours doit être créé proprement dans la source canonique, sur le même modèle que les autres demandes.

Action :
- créer une intention / entrée dédiée « Ramonage » ;
- la brancher directement au CTA Ramonage ;
- arrivée dans le tunnel avec « Ramonage » déjà compris et conservé ;
- ne pas obliger l'utilisateur à rechoisir ce qu'il vient de cliquer.

### 3. Poêle / insert

Même principe :

- créer une intention / entrée dédiée « Poêle / insert » ;
- brancher directement le CTA correspondant ;
- arrivée dans le tunnel avec cette intention déjà sélectionnée/comprise ;
- aucun ancien brouillon non lié ne doit écraser cette intention.

## Règle de simplicité

Ne pas ajouter de couche intermédiaire inutile.
Ne pas créer de nouvelle architecture.
Ne pas modifier le paiement.
Ne pas toucher à la production.
Ne pas refaire le tunnel.

Le résultat attendu est simplement :

- Entretien chaudière → branchement sur l'existant
- Ramonage → nouvelle entrée dédiée
- Poêle / insert → nouvelle entrée dédiée

## Test obligatoire

Sur preview, appareil avec ancien brouillon « Devis Plomberie » :

1. clic Entretien chaudière → Entretien chaudière
2. clic Ramonage → Ramonage
3. clic Poêle / insert → Poêle / insert

Puis refaire sans brouillon.

Pour chaque cas :
- intention visible/traçable dans l'état du tunnel ;
- aucun retour automatique sur Plomberie ;
- refresh conserve l'intention ;
- bouton retour puis retour au tunnel conserve l'intention.

## Retour outbox

Publier :
- EXISTING_ENTRETIEN_TARGET
- CREATED_RAMONAGE_TARGET
- CREATED_POELE_INSERT_TARGET
- FILES_CHANGED
- TESTS
- BROWSER_E2E
- SHA
- PREVIEW
- ROLLBACK

Ne pas déclarer DONE tant que les 3 clics ne donnent pas exactement ces 3 résultats.
