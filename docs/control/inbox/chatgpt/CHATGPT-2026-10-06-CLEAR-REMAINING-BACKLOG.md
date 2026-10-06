# FIN DU BACKLOG AVANT REFONTE VISUELLE

Décision : finir les demandes restantes utiles, ne plus tourner autour des anciens prototypes.

## Déjà tranché
- REQ-018 CLOSED : satisfaite en production.
- REQ-015 CLOSED : ancienne demande 3 photos obsolète, reprise dans futur chantier MEDIA-LIBRARY/refonte.
- REQ-022 CLOSED : gouvernance intégrée au process.
- REQ-029 CLOSED : outillage externe, hors backlog prod.
- REQ-030 CLOSED : Figma/QA outillage, hors backlog prod.
- REQ-032 CLOSED : ancienne maquette dépassée par nouvelle direction visuelle, ne jamais merger.
- REQ-020 : préparer une comparaison visuelle/UX sur 2 actions. Recommandation ChatGPT = garder Réserver + Devis sur les cartes, appel restant dans header/sticky mobile. Ne pas merger sans verdict Florian.
- REQ-040 : audit lecture seule autorisé maintenant. Aucune mutation Supabase/RLS sans GO spécifique.

## Actions immédiates

### REQ-040
Faire maintenant le diagnostic read-only :
- existence/exposition de stats_publiques ;
- cause exacte du 401 ;
- vérifier d'abord si la page peut être corrigée côté front sans toucher aux droits (fallback propre, suppression appel inutile, source alternative déjà publique) ;
- rapport avec options classées du moins sensible au plus sensible ;
- aucune mutation.

### REQ-027
Reformuler les 4 questions métier en une seule demande compacte à Florian, avec réponse attendue OUI/NON/ville incluse/exclue. Ne rien muter avant réponse.

### REQ-033
Préparer le delta exact des 3 fonctions edge à redéployer, test contrôlé prévu, rollback et GO précis requis. Ne pas déployer sans GO spécifique.

### REQ-020
Produire un avant/après visuel desktop + mobile, avec 3 actions actuelles vs 2 actions recommandées. Pas de code prod avant validation Florian.

### REQ-001 / REQ-013
Rafraîchir le rapport de risque et la liste courte des GO réellement nécessaires. Ne jamais exposer de secrets, ne rien muter.

## Règle
Quand ces vrais gates sont clarifiés et que tous les lots sûrs applicables sont PROD_VERIFIED, le chantier backlog est considéré terminé et on attaque le nouveau visuel du site.
