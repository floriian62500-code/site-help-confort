# Contrôle ChatGPT — suivi complet après REQ-023 + garde rollback

message_id: CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-3
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Verdict sur les derniers retours

### REQ-023 — 4 pôles zones
Le retour est techniquement conforme à la demande : 4 pôles distincts, 2x2 desktop, 1 colonne mobile, Calais/Boulogne non présentés comme agences, liens ville ajoutés.
Statut : `WAITING_FLORIAN_VISUAL`.
Ne pas CLOSED tant que Florian n'a pas validé la preview.

### REQ-024 — carte grise
Déjà CLOSED_BY_CONTROL. Aucun nouveau changement.

### Garde rollback
ACK accepté.
Checkpoint historique actuel : `backup/recette-2026-09-26-before-architecture` -> `c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1`.
Il doit rester immuable.
Important : ce checkpoint est AVANT REQ-023. Si Florian refuse les 4 pôles, rollback REQ-023 = `git revert --no-commit 948f17b9 4af89736 && git commit`.

## Nouvelle anomalie de données découverte pendant REQ-023

Le rapport REQ-023 révèle un problème fonctionnel potentiellement important :
- Boulogne-sur-Mer est revendiquée publiquement et possède une page dédiée ;
- Aire-sur-la-Lys est revendiquée sur le site ;
- mais ces communes ne figurent pas dans la liste canonique retournée par `communes-list` selon le rapport Claude.

Ce n'est pas seulement cosmétique : si `communes-list` sert à l'éligibilité du tunnel ou du futur achat en ligne, un client d'une ville annoncée comme desservie pourrait être refusé.

## REQ-20260926-025 — cohérence liste canonique des communes

Créer dans le tracker :
- id : `REQ-20260926-025`
- titre : `Cohérence communes-list vs zones réellement desservies`
- priorité : P0
- statut : `OPEN_AUDIT_ONLY`

### Audit uniquement, aucune mutation
Vérifier en lecture seule :
1. source exacte de `communes-list` ;
2. liste complète des communes/CP par zone ;
3. où cette fonction est consommée (site, tunnel, devis, achat, admin) ;
4. si Boulogne-sur-Mer est absente ;
5. si Aire-sur-la-Lys est absente ;
6. autres villes publiquement revendiquées mais absentes ;
7. villes présentes en canonique mais jamais revendiquées ;
8. conséquence réelle sur validation d'adresse / éligibilité / paiement.

### Retour attendu REQ-025
- SOURCE_OF_TRUTH
- CONSUMERS
- MISSING_PUBLICLY_CLAIMED_CITIES
- EXTRA_CANONICAL_CITIES
- ELIGIBILITY_IMPACT
- RECOMMENDED_DATA_FIX
- NO_MUTATION_PROOF

Ne modifier `communes-list`, Supabase ou une table qu'après validation Florian/ChatGPT.

## Suivi consolidé des demandes

- REQ-001 : WAITING_FLORIAN_GO — sécurité production toujours non sûre.
- REQ-002 : CLOSED.
- REQ-003 : WAITING_FLORIAN_VISUAL.
- REQ-004 : REWORK_REQUIRED — pictos footer.
- REQ-005 : SUPERSEDED_BY_REQ017.
- REQ-006 : WAITING_FLORIAN_VISUAL.
- REQ-007 : CLOSED.
- REQ-008 : CLOSED.
- REQ-009 : CLOSED.
- REQ-010 : SUPERSEDED.
- REQ-011 : TECH_ACCEPTED ; 16 liens résiduels gardés dans plan global.
- REQ-012 : IN_PROGRESS — gel UX.
- REQ-013 : WAITING_FLORIAN — HOLD sécurité.
- REQ-014 : OPEN / gelé.
- REQ-015 : WAITING_FLORIAN — photos.
- REQ-016 : CLOSED.
- REQ-017 : OPEN / NEXT_DESIGN — module contrats complet sur Chauffage.
- REQ-018 : READY_FOR_DESIGN — ECS 220 TTC/an.
- REQ-019 : CLOSED.
- REQ-020 : OPEN / RECETTE_ALLOWED — cartes 1 action + lien détail.
- REQ-021 : CLOSED.
- REQ-022 : READY_FOR_FLORIAN_VALIDATION.
- REQ-023 : WAITING_FLORIAN_VISUAL.
- REQ-024 : CLOSED.
- REQ-025 : OPEN_AUDIT_ONLY — cohérence communes.

Mettre `prochain_id = REQ-20260926-026`.

## Ordre d'exécution

STOP sur toute nouvelle modification visuelle tant que Florian n'a pas validé REQ-023.

Pendant cette attente, seule REQ-025 peut avancer car elle est en LECTURE SEULE / AUDIT.

Après validation visuelle REQ-023 :
1. créer un nouveau checkpoint de recette validée ;
2. REQ-020 dans un commit isolé ;
3. STOP contrôle visuel ;
4. nouveau checkpoint si validé ;
5. REQ-017 prototype contrats isolé ;
6. STOP contrôle Florian.

## Règle rollback renforcée

À chaque validation visuelle Florian, créer un checkpoint nommé :
`backup/recette-validated-YYYY-MM-DD-<req>`
pointant sur le SHA exact validé.

Ne jamais déplacer ces branches.

## Retour attendu

- TRACKER_UPDATED
- REQ023_STATUS_WAITING_FLORIAN_VISUAL
- REQ025_CREATED
- REQ025_AUDIT_REPORT
- NEXT_ID_026
- ROLLBACK_CHECKPOINT_STILL_VALID
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION = WAIT_FLORIAN_VISUAL_REQ023