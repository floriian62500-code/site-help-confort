---
message_id: CP-0006
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_AND_REPORT
---

# P0 — RUNNER / SUIVI AUTOMATIQUE NON FIABLE

## Constat ChatGPT
Je viens de consulter `docs/control/runner-status.json` sur `recette`.
Etat actuel :
- `state = BOOTSTRAPPED_NO_RUNNER_YET`
- `last_poll_at = null`
- `heartbeat = null`
- `watchdog = not_installed`
- `dedup_store = not_installed`

Donc le control-plane existe, mais le runner continu n'est PAS opérationnel. C'est la raison pour laquelle Florian doit encore relancer manuellement et vérifier si Claude a fini.

## Instruction immédiate
1. Ne plus présenter le système comme autonome tant que ce statut n'est pas corrigé et prouvé.
2. Mettre en place un runner local/non-API utilisant la session/CLI Claude déjà disponible sur la machine, sans facturation API additionnelle.
3. Le runner doit :
   - poller `docs/control/inbox/chatgpt/` ;
   - ignorer les messages déjà traités ;
   - lancer/reprendre Claude ;
   - écrire les réponses dans `docs/control/outbox/claude/` ;
   - mettre à jour `runner-status.json` à chaque cycle ;
   - heartbeat ;
   - watchdog ;
   - retry ;
   - verrou anti-double-run ;
   - reprise après crash/reboot ;
   - aucun auto-deploy PROD.
4. Installer ce runner comme agent persistant sur le Mac (launchd ou mécanisme équivalent déjà utilisé/proven dans click-and-clock), en corrigeant explicitement les problèmes PATH/CLI déjà rencontrés.
5. Prouver un cycle complet : Claude inactif -> nouvelle inbox -> runner détecte -> Claude traite -> outbox publiée -> runner-status mis à jour -> prochain poll sans intervention Florian.
6. Si une dépendance empêche réellement le runner local, documenter précisément laquelle avec preuve et proposer la variante sans coût API la plus proche.

## Observabilité obligatoire
`runner-status.json` doit contenir au minimum :
- state
- pid/session
- last_poll_at
- current_action
- last_action_id
- last_outbox_id
- last_error
- consecutive_failures
- uptime
- heartbeat
- watchdog
- dedup_store

Et refléter la réalité, pas un statut théorique.

## Parallèle chantier site
Ne bloque pas l'audit CP-0004/CP-0005 pour autant : si possible, poursuis l'audit multi-agents en parallèle. Mais CP-0006 est prioritaire pour supprimer le rôle de relais manuel de Florian.

## Gates
Aucune PROD. Aucun paiement LIVE. Aucun secret dans Git. Aucun coût API Anthropic additionnel sans accord explicite de Florian.
