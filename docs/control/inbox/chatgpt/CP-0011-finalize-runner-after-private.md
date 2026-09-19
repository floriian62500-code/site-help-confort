---
message_id: CP-0011
priority: P0
status: OPEN
needs_human: true
date: 2026-08-13
expected_decision: EXECUTE_IMMEDIATELY_AFTER_PRIVATE
---

# FINALISATION RUNNER — PRIORITE ABSOLUE

Le seul gate humain restant est le passage du repo `floriian62500-code/site-help-confort` en PRIVATE.

Dès que la visibilité GitHub devient PRIVATE :
1. vérifier immédiatement que Netlify garde l'accès au repo et qu'un build RECETTE fonctionne ;
2. activer la voie runner locale non payante si techniquement disponible ;
3. installer launchd persistant avec PATH explicite Claude CLI ;
4. activer poll inbox, lock, dedup, retry/backoff, heartbeat, watchdog, reprise crash/reboot ;
5. ne jamais auto-déployer main/PROD ;
6. prouver un cycle E2E complet sans Florian : Claude inactif -> nouveau message inbox -> détection runner -> exécution -> outbox -> runner-status/heartbeat -> poll suivant ;
7. mettre `runner-status.json` à jour avec état réel et horodatage ;
8. si la voie locale reste bloquée par le harness, fournir immédiatement l'action technique minimale exacte pour lever CE blocage, sans repartir sur d'autres chantiers.

Ne traiter aucun nouveau chantier non critique avant d'avoir soit prouvé le runner fonctionnel, soit documenté le dernier blocage irréductible avec une seule action humaine précise.

Aucune PROD. Stripe LIVE gelé. Aucun secret dans Git.
