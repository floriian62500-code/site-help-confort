# Controle ChatGPT — revue complete des derniers retours + maintien du suivi jusqu'a production

message_id: CHATGPT-2026-09-28-CONTROL-ALL-REQUESTS-11
priority: P0
status: TO_EXECUTE
date: 2026-09-28

## Revue des derniers retours

Les retours `8402e9fe` et `ede5917c` sont acceptes.

Points valides :
- REQ-033 reste bien `WAITING_FLORIAN_GO` ;
- aucune mutation production n'a ete faite ;
- la liste `etats_autorises` a ete corrigee pour inclure `READY_FOR_FLORIAN_VISUAL` ;
- l'affirmation precedente incorrecte sur les statuts a ete rectifiee ;
- tracker : 33 demandes, aucun doublon, prochain_id `REQ-20260926-034`.

## Etat global a maintenir

Demandes actives a ne pas perdre :
- REQ-001 WAITING_FLORIAN_GO — securite/paiement ;
- REQ-003 WAITING_FLORIAN_VISUAL — grille Chauffage ;
- REQ-004 REWORK_REQUIRED — pictos footer ;
- REQ-006 WAITING_FLORIAN_VISUAL — banniere flottante ;
- REQ-011 TECH_ACCEPTED — reliquat de routage ;
- REQ-012 IN_PROGRESS — gel UX ;
- REQ-013 WAITING_FLORIAN — HOLD securite ;
- REQ-014 OPEN_GELE ;
- REQ-015 WAITING_FLORIAN — photos ;
- REQ-017 OPEN_NEXT_DESIGN — contrats ;
- REQ-018 READY_FOR_DESIGN — ECS ;
- REQ-020 OPEN_RECETTE_ALLOWED_AFTER_REQ023 ;
- REQ-022 READY_FOR_FLORIAN_VALIDATION ;
- REQ-023 WAITING_FLORIAN_VISUAL — zones ;
- REQ-026 OPEN_BLOCKED_BY_REQ023_VISUAL ;
- REQ-027 WAITING_FLORIAN_BUSINESS_GO — communes ;
- REQ-029 WAITING_FLORIAN — outils externes ;
- REQ-030 READY_FOR_FLORIAN_VALIDATION — Figma/Playwright ;
- REQ-032 READY_FOR_FLORIAN_VISUAL — Nos metiers ;
- REQ-033 WAITING_FLORIAN_GO — routage e-mail.

## Prochaine action

Ne lancer aucun nouveau changement de code tant qu'un gate humain n'est pas leve.

Ordre de reprise au prochain GO/validation :
1. REQ-033 si Florian donne GO production sur le changeset email ;
2. REQ-023 si Florian valide visuellement les 4 poles ;
3. checkpoint recette validee ;
4. REQ-026 ;
5. REQ-020 ;
6. REQ-032 apres validation visuelle de la maquette ;
7. REQ-017 ;
8. autres lots visuels ouverts ;
9. securite REQ-001/013 ;
10. release depuis main ;
11. tests exacts de release ;
12. GO Florian prod ;
13. deploiement ;
14. PROD_VERIFIED ;
15. cloture uniquement avec preuve.

## Regles toujours actives

- aucune fermeture par Claude ;
- aucun merge massif recette -> main ;
- rollback obligatoire par lot ;
- preview + captures 1440/390 pour tout changement visible ;
- HOLD_SECURITY maintenu ;
- aucune mutation Stripe LIVE / Supabase prod / DNS / auth-RLS sans gate explicite ;
- toute nouvelle anomalie doit etre rattachee a une REQ existante ou creer un nouvel ID sans collision.

## Retour attendu

ACK_CONTROL_11
TRACKER_INTACT
NO_NEW_CODE
NEXT_ACTION = WAIT_HUMAN_GATE