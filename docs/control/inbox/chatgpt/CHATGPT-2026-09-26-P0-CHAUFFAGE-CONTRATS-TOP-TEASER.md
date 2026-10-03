# Correction Florian — contrats Chauffage : supprimer le doublon et remonter le teaser

message_id: CHATGPT-2026-09-26-P0-CHAUFFAGE-CONTRATS-TOP-TEASER
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Décision métier Florian

Le bloc contrats actuel de la page Chauffage fait doublon avec la page dédiée /contrats-entretien.html.
En plus, l'offre contrats est placée trop bas dans la page.

Florian veut :
1. mettre les contrats en avant très haut dans la page Chauffage ;
2. ne plus recopier sur la page Chauffage les trois cartes détaillées BASIC / CONFORT / SÉCURITÉ ;
3. garder la page /contrats-entretien.html comme seule page détaillée des formules et des prix.

## Architecture voulue

Page Chauffage = page métier et porte d'entrée.
Très haut dans la page, après le hero / introduction principale et avant les longs blocs de contenu : un teaser commercial compact « Contrats d'entretien ».

Le teaser doit présenter simplement :
- entretien chaudière gaz / fioul ;
- 3 formules : BASIC, CONFORT, SÉCURITÉ ;
- à partir de 9,90 € TTC/mois si cette information reste issue de la source canonique ;
- bénéfice court : visite annuelle + attestation + rappel ;
- CTA principal : « Découvrir nos contrats d'entretien » -> /contrats-entretien.html ;
- CTA secondaire éventuel : « Juste un entretien ponctuel » -> tunnel existant.

## À supprimer de la page Chauffage

Supprimer le bloc détaillé actuel qui recopie les trois grandes cartes BASIC / CONFORT / SÉCURITÉ avec leurs listes de garanties.
Ces détails restent uniquement sur /contrats-entretien.html.

Ne pas supprimer les liens vers les contrats dans le menu/hero s'ils sont utiles.

## Position

Le teaser doit être visible dans le premier parcours de lecture de la page Chauffage.
Position cible : juste après le hero et ses éléments de confiance immédiats, avant les blocs longs type « Pourquoi HELP Confort », zones, réalisations, FAQ.

Il ne doit plus être placé sous les cartes de prestations chauffage comme aujourd'hui.

## Source unique

- page détaillée canonique : /contrats-entretien.html
- source tarifaire : data/contrats-tarifs.json / source catalogue existante
- aucun nouveau prix codé ailleurs
- aucun nouveau contrat créé

## Tests obligatoires

1. Page Chauffage : aucun doublon des trois cartes détaillées.
2. Teaser contrats visible en haut de page en desktop et mobile.
3. CTA « Découvrir nos contrats d'entretien » -> /contrats-entretien.html.
4. CTA entretien ponctuel -> tunnel existant.
5. Page contrats détaillée inchangée.
6. Aucun prix contradictoire entre teaser et page contrats.
7. Aucun débordement horizontal en 390 et 1440.
8. Aucun impact sur Ramonage, Poêle/insert, paiement, production.

## Retour attendu

- ROOT_CAUSE_DUPLICATION
- OLD_POSITION
- NEW_POSITION
- DUPLICATE_CONTENT_REMOVED
- TEASER_CONTENT
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.