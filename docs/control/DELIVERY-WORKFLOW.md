# DELIVERY-WORKFLOW — flux de livraison obligatoire

demande (issue #9/commentaire ou screenshot) → **BACKLOG** (ligne créée dans MASTER-TASK-LEDGER AVANT dev)
→ **IN_PROGRESS** (dev sur recette, commit atomique, push, SHA)
→ tests (smoke/E2E) + **preview** Netlify vérifiée
→ **READY_FOR_QA** (prouvé recette)
→ QA Florian (via /recette.html ou commentaire) : **QA_APPROVED** ou **QA_REJECTED**
→ si QA_REJECTED : retour **IN_PROGRESS** avec **nouveau SHA** avant nouvelle QA (règle anti-régression)
→ si QA_APPROVED : **READY_FOR_PROD**
→ **GO Florian explicite** (jamais automatique) → promotion cherry-pick contrôlée → **PROD_DEPLOYED** (SHA main + preuve)
→ vérif prod réelle → **PROD_VERIFIED** → **CLOSED**.

## Règles
1. Interdit IN_PROGRESS → CLOSED direct. CLOSED exige PROD_VERIFIED (sauf tâche non-prod audit/doc/control-plane, critère documenté).
2. Toute nouvelle demande crée/maj une ligne du ledger AVANT dev.
3. `runner-status.json` dérivé du ledger (current_task/next_tasks/blocked_tasks/ready_for_qa/ready_for_prod).
4. Un P0 ouvert reste épinglé ; aucun P1/P2 ne le masque.
5. Si Claude s'arrête avec des tâches sûres BACKLOG/IN_PROGRESS → statut global `SITE_WORK_ACTIVE`.
6. Aucune tâche FAIT/CLOSED sans preuve (SHA recette réel + tests + preview).
7. QA_APPROVED exige une preuve de validation Florian (commentaire/centre recette).
8. PROD_DEPLOYED exige SHA main/prod + preuve de déploiement.

## Contrôle automatique (garde)
`scripts/control/ledger-check.mjs` : FAIL si (a) une tâche du ledger n'est dans aucun état valide,
(b) un SHA recette annoncé n'existe pas sur origin/recette, (c) une tâche PROD_DEPLOYED sans SHA prod.
