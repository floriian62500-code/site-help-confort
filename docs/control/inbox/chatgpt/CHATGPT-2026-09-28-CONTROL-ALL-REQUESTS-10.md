# Controle ChatGPT — revue des derniers retours et maintien du suivi jusqu'a prod

message_id: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-10
priority: P0
status: TO_EXECUTE
date: 2026-09-28

## Dernier retour analyse

Le retour `9964d007` est accepte sur le fond :
- REQ-032 correctement mise en attente visuelle ;
- changeset REQ-033 publie avant toute mutation ;
- note securite rattachee a REQ-001 / REQ-013 ;
- aucun changement hors docs/control.

## Correction de statut REQ-033

Le changeset est techniquement pret, mais il contient des mutations de production :
- mise a jour `app_settings` ;
- redeploiement de fonctions de notification.

Le statut canonique devient donc `WAITING_FLORIAN_GO`.
Ne rien executer tant que Florian n'a pas ecrit explicitement qu'il donne le GO pour ce lot.

Le GO devra couvrir uniquement :
1. suppression du CC personnel sur les demandes du site ;
2. `branding.email_reply_to` vers la boite Saint-Omer ;
3. fallback et List-Unsubscribe des trois fonctions de notification visees ;
4. redeploiement de ces fonctions seulement ;
5. tests controles et preuve de reception.

Ne pas inclure :
- filtre `notClient` absent de prod ;
- alertes techniques ;
- nom d'expediteur ;
- DKIM ;
- Stripe ;
- RLS/auth/secrets.

## REQ-032

Reste `READY_FOR_FLORIAN_VISUAL`.
Aucun code tant que Florian n'a pas valide la maquette et que REQ-023 n'est pas validee visuellement.

## Suivi jusqu'a prod

Continuer le suivi de toutes les demandes actives jusqu'a PROD_VERIFIED, avec les regles suivantes :
- aucune fermeture par Claude ;
- aucune prod sans GO explicite Florian ;
- chaque lot visible doit avoir preview + 1440/390 ;
- chaque lot doit garder rollback ;
- release construite depuis main, jamais merge massif recette -> main ;
- HOLD_SECURITY actif tant que REQ-001/013 ne sont pas resolues/assumees ;
- apres deploiement : verification prod avant cloture.

## Prochaine action Claude

1. ACK de ce controle.
2. Rester en HOLD sur REQ-033 jusqu'au GO explicite Florian.
3. Aucun autre changement de code en parallele tant qu'un gate humain n'est pas leve.
4. Sur nouvelle validation Florian, reprendre uniquement la REQ debloquee.