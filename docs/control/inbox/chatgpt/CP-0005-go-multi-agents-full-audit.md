---
message_id: CP-0005
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# GO — PASSE MULTI-AGENTS POUR CP-0004

Décision : OPTION 1 VALIDEE — passe multi-agents (workflow).

Lance maintenant l'audit total CP-0004 avec orchestration multi-agents.

## Objectif
Inventaire complet + scan technique 100% des pages/routes + responsive + UX/UI/esthétique + ergonomie + conversion/funnels + SEO local + sécurité + performance, puis consolidation unique dans `docs/AUDIT-MASTER.md`.

## Règles d'exécution
- Commencer par lire `recette_validation` et traiter les KO Florian ouverts.
- CP-0003 / centre de validation doit être réellement fonctionnel avant de demander de nouvelles validations humaines.
- Ne pas attendre Florian pour détecter les anomalies : les agents doivent tester eux-mêmes.
- Répartir les domaines entre agents pour paralléliser, mais consolider les résultats dans UN registre maître sans doublons.
- Classer P0/P1/P2/P3.
- Corriger automatiquement en RECETTE tout ce qui est non ambigu et non gated, en priorité P0 puis P1.
- Les contrôles techniques sont validés automatiquement par tests ; ne pas les envoyer à Florian comme tâches manuelles.
- Florian ne valide que les choix visuels, ergonomiques, commerciaux ou métier réellement subjectifs.
- Ne pas s'arrêter après le rapport : poursuivre les corrections tant qu'une tâche non bloquée existe.
- A22 reprend seulement après les KO recette et les P0/P1 découverts par l'audit.

## Couverture minimale
Tester toutes les routes/pages et au minimum les viewports : 320x568, 360x800, 375x812, 390x844, 430x932, 768x1024, 1024x768, 1280x800, 1440x900, 1600x900, 1920x1080.

Tester réellement tous les funnels/formulaires : happy path, invalides, erreur réseau/backend, double clic, back/refresh, routage Saint-Omer/Dunkerque, lead DB, anti-doublon, succès/erreur, mobile.

## Paiement
Conserver Stripe LIVE GELE. Pour le wizard, décision actuelle : funnel sans paiement pour l'instant, mais architecture prête pour brancher Stripe TEST plus tard sans refaire le parcours.

## Livrable de suivi
Écrire dans l'outbox :
- ACK CP-0005 ;
- agents lancés et périmètre de chacun ;
- nombre de pages/routes inventoriées/testées ;
- compte P0/P1/P2/P3 ;
- corrections effectuées + SHA ;
- URL recette ;
- gates réels ;
- prochaine action automatique.

Aucune PROD sans GO Florian. Aucun paiement LIVE. Aucun secret dans Git.
