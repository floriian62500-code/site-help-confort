---
message_id: CP-0009
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# PRIORITE NUMERO 1 — FINALISER LE RUNNER AVANT LE RESTE

Décision Florian : la finalisation du runner est la priorité absolue. Suspendre tout nouveau lot fonctionnel/audit non critique tant que le runner n'est pas opérationnel ou bloqué par UNE action humaine minimale clairement identifiée.

## Etat vérifié par ChatGPT
- repo `floriian62500-code/site-help-confort` = PUBLIC ;
- `runner-status.json` = `DESIGN_READY_DISABLED_PENDING_PRIVATE_REPO_AND_WRITE_PERMISSION` ;
- aucun heartbeat, aucun poll, watchdog/dedup non installés ;
- gates indiqués : permission d'écriture harness pour le script runner + passage repo PRIVATE + vérification Netlify après passage private.

## Ce que tu dois faire maintenant
1. Résoudre d'abord le blocage `harness_write_permission_for_runner_script` avec les moyens autorisés dans ta session. Ne t'arrête pas à un diagnostic : tente la voie correcte pour créer/installer le runner dans CE repo uniquement.
2. Préparer complètement le runner site-help-confort : script, launchd, lock, dédup, retry/backoff, heartbeat, watchdog, crash/reboot recovery, runner-status réel, logs locaux, aucune PROD auto.
3. Ne pas utiliser de code/branche/données Click & Clock autrement que comme référence conceptuelle éventuelle. Aucun chemin partagé.
4. Vérifier précisément la compatibilité Netlify avec repo privé et indiquer la preuve disponible.
5. Si le passage PRIVATE nécessite Florian, fournir UNE seule instruction minimale et exacte (où cliquer), puis attendre uniquement ce gate. Aucun autre choix technique à lui demander.
6. Dès que le repo est privé, vérifier un build RECETTE ; si PASS, activer immédiatement le runner.
7. Prouver le cycle complet : Claude inactif -> nouvelle inbox -> runner détecte -> traite -> outbox -> runner-status/heartbeat mis à jour -> nouveau poll sans intervention Florian.
8. Mettre `runner-status.json` à jour à chaque étape réelle. Ne jamais déclarer autonome avant preuve.

## Livrable attendu dans l'outbox
- ACK CP-0009 ;
- cause exacte et résolution du blocage write-permission ;
- fichiers runner créés ;
- méthode d'installation launchd ;
- statut Netlify/private ;
- éventuelle action humaine UNIQUE restante ;
- test de cycle complet ;
- SHA ;
- état final runner-status.

## Règle
Tant que le runner n'est pas ACTIVE/HEALTHY et prouvé, ne reprends pas A22/CP-0004 sauf incident P0 site/sécurité.

Aucune PROD. Stripe LIVE gelé. Aucun secret dans Git. Aucun coût API Anthropic supplémentaire.
