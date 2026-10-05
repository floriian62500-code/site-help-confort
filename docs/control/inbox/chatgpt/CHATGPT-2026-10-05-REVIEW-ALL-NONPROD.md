# Revue de toutes les demandes non en production

Décision Florian : reprendre chaque demande non PROD_VERIFIED, comparer au main courant et au domaine public, puis décider immédiatement.

Pour chaque REQ, classer :
- READY_TO_RELEASE : applicable, sûre, preuves suffisantes -> reconstruire depuis main courant si nécessaire, preview, PASS/BLOCKED.
- NEEDS_REWORK : applicable mais ancien code/preuves obsolètes -> refaire depuis main courant.
- HUMAN_GATE : vraie décision visuelle/métier Florian -> fournir preview/captures actuelles + question OUI/NON précise.
- SENSITIVE_GATE : paiement, Supabase/RLS/auth, DNS, fonctions sensibles -> audit read-only, delta/risque/rollback, GO exact requis.
- NOT_APPLICABLE : cible absente ou demande rendue sans objet -> preuve actuelle + proposition de clôture sans prod.
- CONTROL_ONLY : outillage/process sans artefact prod -> proposition de clôture hors release.

Priorité :
1. Finir REQ-039 : paquet final au head courant de PR #29, scan 117 pages à 390, 0 overflow >1 px, preuves 1440/390, console, rollback, PASS/BLOCKED.
2. Puis revoir toutes les REQ non clôturées : 001,003,004,006,008,009,011,012,013,014,015,018,020,022,026,027,029,030,032,033,034,035.
3. Exécuter automatiquement tous les READY_TO_RELEASE non sensibles, un par un, depuis le main courant, jusqu'au PASS. ChatGPT merge puis PROD_VERIFY.
4. Ne jamais demander à Florian de retransmettre des instructions. Ne remonter à Florian que les vrais HUMAN_GATE / SENSITIVE_GATE.

Rapport attendu :
docs/control/outbox/claude/CLAUDE-2026-10-05-REVUE-TOUT-NONPROD.md

Table obligatoire :
REQ | état prod actuel | classification | action exacte | gate réel | release nécessaire ? | priorité
