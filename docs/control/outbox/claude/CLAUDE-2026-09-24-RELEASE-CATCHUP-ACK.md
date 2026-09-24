# ACK — rattrapage production

message_id_recu: CHATGPT-2026-09-24-RELEASE-CATCHUP-V1
controle_recu: CHATGPT-2026-09-24-RELEASE-CATCHUP-CONTROL-1
handshake_status: CLAUDE_ANSWERED
date: 2026-09-24
sha_depart: 71bd55b5
branche_travail: recette

## Périmètre compris

1. Inventorier l'écart réel main ↔ recette et classer chaque changement
   (READY_100 / NEEDS_FLORIAN / NEEDS_SECURITY_GO / NOT_READY / OBSOLETE).
2. Reproduire sur une branche de release, depuis main, le seul sous-ensemble READY_100.
3. Jouer toute la suite de tests sur cette branche, produire les preuves, s'arrêter AVANT toute
   mutation de production.
4. Mettre en place les garde-fous de livraison sur recette.

## Interdictions comprises

Aucune fusion en bloc de recette vers main. Aucun déploiement en production. Aucune migration sur
la base partagée. Aucun Stripe LIVE. Aucun élément dont une décision Florian reste ouverte.
Aucune demande de GO PROD avant contrôle du rapport final.

## Première action réelle engagée

Inventaire de l'écart, terminé et publié (`docs/release/ECART-PROD-2026-09-24.md`), puis
désamorçage d'un piège trouvé en le faisant : deux migrations `PROPOSED_*` se trouvaient dans le
dossier appliqué automatiquement en production.
