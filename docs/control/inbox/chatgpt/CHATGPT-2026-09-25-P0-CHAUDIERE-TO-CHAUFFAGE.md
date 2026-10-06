# Correction Florian — CTA chaudière vers la page Chauffage

message_id: CHATGPT-2026-09-25-P0-CHAUDIERE-TO-CHAUFFAGE
priority: P0
status: TO_EXECUTE
date: 2026-09-25

## Décision métier Florian

Le comportement actuel n'est pas conforme.

Sur la bannière saisonnière de l'accueil, le bouton principal « Entretien chaudière » ouvre actuellement le tunnel :
/catalogue.html#cat=chauffage&presta=entretien&src=home-saison

Florian veut maintenant un comportement plus simple :
clic sur Chaudière / Entretien chaudière -> page Chauffage

Destination canonique : /chauffagiste-saint-omer.html

## À faire

Dans index.html, remplacer uniquement la destination du CTA chaudière de la bannière saisonnière.

AVANT : /catalogue.html#cat=chauffage&presta=entretien&src=home-saison
APRÈS : /chauffagiste-saint-omer.html

Ne pas ouvrir le tunnel depuis ce CTA.
Ne pas déclencher le resume gate.
Ne pas dépendre du localStorage/sessionStorage.

## Architecture voulue

Accueil -> clic Entretien chaudière -> page Chauffage.
Depuis la page Chauffage :
- entretien ponctuel -> tunnel précontextualisé ;
- contrats -> /contrats-entretien.html.

La page Chauffage reste la porte d'entrée métier.
Le tunnel reste l'étape transactionnelle, mais pas directement depuis la bannière d'accueil.

## Ne pas modifier sans nouvelle demande

- Poêle ou insert
- Ramonage
- tunnel lui-même
- logique de reprise de brouillon
- page contrats
- paiement
- production

## Tests obligatoires

1. CTA chaudière accueil -> /chauffagiste-saint-omer.html
2. Avec ancien brouillon Devis Plomberie présent -> le clic arrive quand même sur la page Chauffage
3. Aucun écran demande en cours sur ce clic
4. Retour arrière / refresh : comportement normal
5. Desktop + mobile
6. Le CTA entretien ponctuel sur la page Chauffage continue à ouvrir le tunnel
7. Le CTA contrats sur la page Chauffage continue vers /contrats-entretien.html

## Retour attendu

- ROOT_CAUSE
- FILE_CHANGED
- OLD_TARGET
- NEW_TARGET
- TEST_WITH_OLD_DRAFT
- CHAUFFAGE_CTA_CHECK
- SCREENSHOTS_DESKTOP_MOBILE
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.