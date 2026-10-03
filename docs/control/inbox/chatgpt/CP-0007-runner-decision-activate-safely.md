---
message_id: CP-0007
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# DECISION RUNNER CP-0006

Choix : **Construire ET activer maintenant**, mais avec une condition de sécurité obligatoire avant activation autonome complète.

## Décision
Nous voulons supprimer le relais manuel Florian <-> Claude <-> ChatGPT. Le runner doit être réellement persistant et opérationnel.

## Condition sécurité obligatoire
Le dépôt `floriian62500-code/site-help-confort` ne doit pas rester public avec un runner qui exécute automatiquement des instructions venant du repo.

Avant d'activer la boucle autonome sur des inbox Git :
1. Vérifier que Netlify garde bien l'accès/build/deploy-preview si le dépôt passe PRIVATE.
2. Si compatible, passer le dépôt PRIVATE.
3. Vérifier immédiatement qu'un build RECETTE fonctionne encore.
4. Seulement ensuite activer le runner autonome.

Si tu ne peux pas toi-même changer la visibilité du dépôt, prépare tout le runner, garde-le DISABLED, et indique uniquement l'action humaine minimale nécessaire pour passer PRIVATE. Ne jamais activer un exécuteur autonome lisant une inbox depuis un dépôt public.

## Runner requis
- launchd persistant ;
- PATH explicite vers Claude CLI ;
- poll inbox ;
- dédup ;
- lock anti-double-run ;
- retry/backoff ;
- heartbeat ;
- watchdog ;
- reprise reboot/crash ;
- outbox ;
- runner-status réel ;
- aucun auto-deploy PROD ;
- aucune mutation sensible automatique ;
- aucune clé/API payante Anthropic additionnelle.

## Preuve obligatoire
Prouver : Claude fermé/inactif -> nouveau message inbox -> runner détecte -> Claude traite -> outbox publiée -> runner-status mis à jour -> prochain poll OK, sans intervention Florian.

## Statut actuel contrôlé par ChatGPT
`runner-status.json` est encore `BOOTSTRAPPED_NO_RUNNER_YET` avec heartbeat/poll/watchdog absents. Tant que ce fichier ne reflète pas un cycle réel, ne pas déclarer le système autonome.

## Chantier site
Poursuivre CP-0004/CP-0005 en parallèle si possible, mais la fiabilisation du runner est P0 organisationnel.

Aucune PROD. Stripe LIVE gelé. Aucun secret dans Git.
