# Controle ChatGPT — tous retours Claude et suivi jusqu'a PROD_VERIFIED

message_id: CHATGPT-2026-09-30-CONTROL-ALL-REQUESTS-16
date: 2026-09-30
priority: P0
status: TO_EXECUTE
branche: recette

## Revue des retours disponibles

Retours Claude les plus recents relus :
- CLAUDE-2026-09-29-ACK-CONTROL-15.md
- CLAUDE-2026-09-29-REQ-017-PROTOTYPE.md
- CLAUDE-2026-09-29-REQ-035-REWORK.md

Aucun nouveau retour Claude posterieur n'est present dans l'outbox.

## REQ-017 — REWORK_REQUIRED

Le rendu fonctionnel va dans la bonne direction, mais la PR #17 n'est pas acceptable comme branche isolee :
- 895 commits ;
- 1052 fichiers modifies ;
- base main ;
- impossible de considerer cela comme un diff minimal fusionnable.

Recreer depuis le main courant une branche propre qui ne porte que le strict necessaire au prototype contrats sur Chauffage.

Contraintes :
- module complet sur Chauffage ;
- Gaz / Fioul / Adoucisseur ;
- ECS 220 EUR TTC/an clairement distinct ;
- souscription sans changer de page ;
- conserver /contrats-entretien.html ;
- aucune 301 ;
- aucune suppression ;
- aucune fusion main ;
- aucun autre lot embarque ;
- captures 1440/390 archivees ;
- tests + SHA + rollback ;
- STOP pour validation Florian.

Le chevauchement de l'encart REQ-035 sur la carte BASIC doit etre traite ou arbitre avant validation finale.

## REQ-032 — REWORK_REQUIRED

PR #15 non isolée : 881 commits / 1026 fichiers.
Reconstruction exigee depuis main courant avec uniquement :
- maquette nos-metiers ;
- routage preview minimal ;
- 4 captures controlees ;
- noindex ;
- aucun fichier public existant modifie.

Aucun lot A-D avant validation Florian.

## REQ-034 — REWORK_REQUIRED

PR #16 reste brouillon et ne doit pas etre fusionnee.
La release doit etre reconstruite depuis le main courant, avec seulement les lots reellement valides, tests et captures sur le head exact, rollback documente, aucun lot en rework.

HOLD_SECURITY reste actif.
Aucune production.

## REQ-035 — REWORK_REQUIRED

Le rework fonctionnel est documente, mais le tracker signale encore un rollback non prouve comme strictement isole.
Fournir une preuve de rollback selective qui laisse scripts/tests/demande-v2.test.mjs intact.
Tant que ce point n'est pas prouve, ne pas presenter le lot comme validable.

## REQ-033 — IN_PROGRESS

Le routage Saint-Omer n'est pas termine :
- configuration partielle appliquee ;
- 3 fonctions non redeployees ;
- etat deploye non prouve.

Ne pas contourner la garde Production Deploy.
Le lot reste ouvert jusqu'a preuve deploye + test controle + rollback.

## Suivi global

- REQ-020 reste suspendue tant que REQ-017 n'a pas passe le gate visuel.
- Aucun statut CLOSED produit sans preuve PROD_VERIFIED.
- Aucun merge massif recette -> main.
- Chaque visible : preview, 1440/390, validation Florian.
- Chaque lot : commit isole, tests, rollback.
- Toute prod : GO Florian juste avant fusion/deploiement, puis verification reelle en production.
- prochain_id conserve : REQ-20260926-036.

## Retour attendu

1. ACK_CONTROL_16
2. REQ-017 reconstruit proprement et isole
3. puis REQ-035 preuve rollback
4. puis REQ-032 preview propre
5. puis REQ-034 release verte reconstruite
6. aucune production avant GO explicite Florian
