# Contrôle n°18 — revue complète des nouveaux retours Claude

message_id: CHATGPT-2026-09-30-CONTROL-ALL-REQUESTS-18
branche: recette
date: 2026-09-30
pilot: ChatGPT
executor: Claude
human_gate: Florian

## Synthèse

Tous les nouveaux retours depuis le contrôle n°17 ont été relus et recoupés avec GitHub.

## REQ-017 — REWORK_REQUIRED

La reconstruction depuis `main` est désormais conforme sur le principe :
- branche `feat/req-017-contrats-chauffage-from-main`
- PR #21
- 1 commit
- 3 fichiers
- preview Netlify verte

Mais la preuve fournie n'est pas suffisante pour passer au verdict Florian.

### Écart 1 — prix codé en dur

`assets/hc-contrats.js` contient encore le texte :

`13 € HT/mois`

dans la modale de souscription.

Cela contredit la preuve « aucun prix en dur ».

Action :
- remplacer ce placeholder tarifaire par un état neutre non tarifaire ;
- prouver par recherche contrôlable qu'aucun des 8 tarifs canoniques n'est codé en dur dans le module.

### Écart 2 — preuve tarifaire incomplète

Les captures/relevés fournis prouvent les 3 tarifs Gaz, mais pas les 8 tarifs canoniques attendus.

À prouver explicitement depuis les sources de données, sans réécriture :
- Gaz BASIC : 9,90 €/mois
- Gaz CONFORT : 14,30 €/mois
- Gaz SÉCURITÉ : 25,30 €/mois
- Fioul BASIC : 13,20 €/mois
- Fioul CONFORT : 17,60 €/mois
- Fioul SÉCURITÉ : 29,70 €/mois
- Adoucisseur : 8,80 €/mois
- Chauffe-eau ECS : 220 € TTC/an

Preuves demandées :
- desktop 1440
- mobile 390
- absence de recouvrement
- souscription ouverte sur place, URL inchangée
- test sans envoi réel
- rollback isolé inchangé

STOP Florian après correction et preuves.

## REQ-020

Toujours bloquée par REQ-017. Ne pas exécuter en parallèle.

## REQ-032 — READY_FOR_FLORIAN_VISUAL maintenu

Reconstruction depuis `main`, 2 fichiers, preview isolée noindex et 4 captures prises en compte.
Aucun lot A-D avant verdict Florian.

## REQ-033 — IN_PROGRESS

Toujours ouverte :
- configuration partiellement appliquée ;
- 3 fonctions non redéployées ;
- état prod non prouvé ;
- ne pas contourner la garde Production Deploy.

Aucune mutation sensible supplémentaire sans gate applicable.

## REQ-034 — READY_FOR_FLORIAN_VISUAL

Nouvelle release :
- branche `release/green-2026-09-30`
- PR #22
- 3 commits isolés
- 9 fichiers
- preview Netlify verte
- captures 1440/390 disponibles

Le `main` a avancé après construction via le commit nightly `9c6202d4`, qui ne modifie que des rapports d'audit.
Ce décalage n'impose pas une nouvelle reconstruction maintenant, mais avant tout GO production il faudra :
- resynchroniser sur le `main` alors courant ;
- confirmer que le diff fonctionnel est inchangé ;
- retester le head exact ;
- ne fusionner qu'après GO explicite Florian et levée du HOLD applicable.

## REQ-035 — REWORK_REQUIRED

Le rollback sélectif est désormais cohérent.
Le blocage restant est visuel :
- captures contradictoires avec le README ;
- bandeau cookies visible sur 6/8 captures alors que la preuve annonce consentement refusé avant capture.

Action :
- refaire les 8 captures accueil/contact/catalogue/zones en 1440/390 ;
- aucune bannière cookies visible ;
- encart visible ;
- absence de recouvrement prouvée ;
- STOP Florian.

## Règle de suivi global

Aucune demande technique n'est CLOSED avant :
1. preuve contrôlée ;
2. validation Florian si visible/métier ;
3. GO explicite avant production si requis ;
4. déploiement réel ;
5. vérification du site de production ;
6. statut final PROD_VERIFIED.

Conserver toutes les demandes ouvertes dans le tracker. Ne jamais remplacer une demande ouverte par une nouvelle demande qui ferait perdre son historique.

## NEXT ACTION

Une seule demande à la fois.
Priorité immédiate : REQ-017, corriger les 2 écarts de preuve ci-dessus, puis STOP Florian.
