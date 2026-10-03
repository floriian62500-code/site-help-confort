# Controle ChatGPT - suivi apres audit communes

message_id: CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-4
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## REQ-025
Audit accepte.
Faits retenus:
- communes-list sert actuellement a l'affichage;
- le tunnel actuel ne l'utilise pas pour l'eligibilite;
- le tunnel utilise une regle de distance;
- Boulogne-sur-Mer, Saint-Pol-sur-Mer et Aire-sur-la-Lys sont revendiquees mais absentes de communes-list selon l'audit;
- le risque principal est donc la coherence des donnees et le futur achat en ligne.

REQ-025 peut etre CLOSED_BY_CONTROL comme audit uniquement. L'ecart de donnees reste ouvert.

## REQ-026 - garde automatique de coherence des zones
Creer dans le tracker.
Statut: OPEN_BLOCKED_BY_REQ023_VISUAL.
Objectif: test automatique qui signale une ville publiquement revendiquee mais absente de communes-list.
Aucune mutation de donnees. Aucun changement public. Ne pas executer avant validation visuelle de REQ-023.

## REQ-027 - reconciliation de la liste canonique des communes
Creer dans le tracker.
Statut: WAITING_FLORIAN_BUSINESS_GO.
Avant toute mutation, demander confirmation metier sur:
- Boulogne-sur-Mer;
- Saint-Pol-sur-Mer;
- Aire-sur-la-Lys;
- communes du Boulonnais reellement desservies.
Puis seulement preparer diff, rollback et demande de GO.

Mettre prochain_id = REQ-20260926-028.

## REQ-023
Reste WAITING_FLORIAN_VISUAL.
Ne pas fermer avant validation Florian.
Rollback: git revert --no-commit 948f17b9 4af89736 && git commit

Checkpoint historique immuable:
backup/recette-2026-09-26-before-architecture -> c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1

## Suivi consolide
REQ-001 WAITING_FLORIAN_GO
REQ-002 CLOSED
REQ-003 WAITING_FLORIAN_VISUAL
REQ-004 REWORK_REQUIRED
REQ-005 SUPERSEDED_BY_REQ017
REQ-006 WAITING_FLORIAN_VISUAL
REQ-007 CLOSED
REQ-008 CLOSED
REQ-009 CLOSED
REQ-010 SUPERSEDED
REQ-011 TECH_ACCEPTED
REQ-012 IN_PROGRESS
REQ-013 WAITING_FLORIAN
REQ-014 OPEN_GELE
REQ-015 WAITING_FLORIAN
REQ-016 CLOSED
REQ-017 OPEN_NEXT_DESIGN
REQ-018 READY_FOR_DESIGN
REQ-019 CLOSED
REQ-020 OPEN_RECETTE_ALLOWED_AFTER_REQ023
REQ-021 CLOSED
REQ-022 READY_FOR_FLORIAN_VALIDATION
REQ-023 WAITING_FLORIAN_VISUAL
REQ-024 CLOSED
REQ-025 CLOSED_BY_CONTROL_AUDIT
REQ-026 OPEN_BLOCKED_BY_REQ023_VISUAL
REQ-027 WAITING_FLORIAN_BUSINESS_GO

## Ordre
1. Mettre le tracker a jour uniquement.
2. STOP code tant que REQ-023 n'est pas validee visuellement.
3. Apres validation REQ-023: creer un checkpoint valide.
4. Executer REQ-026.
5. Executer REQ-020 puis STOP visuel.
6. Executer REQ-017 prototype contrats puis STOP visuel.
7. REQ-027 seulement apres confirmation metier et GO Florian.

Retour attendu:
TRACKER_UPDATED
REQ025_CLOSED_AS_AUDIT
REQ026_CREATED
REQ027_CREATED
NEXT_ID_028
CHECKPOINT_VERIFIED
NO_PUBLIC_MUTATION_PROOF
NEXT_ACTION = WAIT_FLORIAN_VISUAL_REQ023
