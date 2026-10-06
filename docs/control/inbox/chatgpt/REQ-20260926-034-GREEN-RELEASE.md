# REQ-20260926-034 — Rattrapage production des lots verts

Florian demande de comparer l'état réellement en production (main) avec recette et d'envoyer uniquement ce qui est au vert.

Règles :
- partir de main, jamais merger recette en bloc ;
- la branche de release est déjà créée : release/green-2026-09-28 depuis main 48d2f89b7060adf4709d9f9f525356fa78f7c8e6 ;
- auditer chaque lot candidat contre main avant portage ;
- inclure seulement les demandes CLOSED / TECH_ACCEPTED + validation humaine acquise quand elle était requise ;
- exclure toute demande WAITING_FLORIAN*, REWORK_REQUIRED, OPEN*, IN_PROGRESS sans preuve finale ;
- un portage par lot, avec SHA, fichiers, tests, rollback ;
- rejouer la suite complète sur l'état exact de release ;
- fournir diff final release vs main ;
- ne pas toucher Stripe LIVE, RLS/auth, DNS, secrets ni fonctions de prod dans cette release.

Candidats à auditer en priorité :
- REQ-007 suppression module parcours métier ;
- REQ-008 suppression bloc final contrats ;
- REQ-009 régression #intervention ;
- REQ-019 bug _default catalogue ;
- REQ-023 quatre pôles zones (validation Florian reçue) + son commit de liens associé ;
- REQ-024 carte zones grise ;
- REQ-026 garde cohérence zones (tests uniquement).

À exclure pour l'instant :
REQ-003, 004, 006, 012, 014, 015, 017, 018, 020, 022, 027, 029, 030, 032, 033 et tout lot sécurité/paiement non explicitement traité.

Retour attendu :
1. matrice main vs recette par REQ candidate ;
2. dépendances nécessaires ;
3. lots réellement portables sans embarquer d'éléments non validés ;
4. commits de portage sur release/green-2026-09-28 ;
5. tests/CI de l'état exact ;
6. rollback ;
7. liste finale IN/OUT ;
8. verdict READY_FOR_PROD ou BLOCKED avec raison précise.

Important : le HOLD_SECURITY global reste une contrainte distincte. Ne pas le contourner.