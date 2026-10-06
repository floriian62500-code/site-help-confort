# Control-plane IA — HELP CONFORT

## But

Ce dossier est la source de vérité persistante pour la collaboration entre Claude (exécution technique), ChatGPT (contrôle/pilotage) et Florian (décision métier).

Le système existant de recette est conservé : toute modification visible doit être livrée sur `recette`, ajoutée au centre `/recette.html`, puis validée page par page avant production.

## Rôles

- **Claude** : analyse, développe, teste, commit, push, prépare la recette et publie les preuves.
- **ChatGPT** : émet/contrôle les instructions, challenge les diagnostics, vérifie les preuves et demande les reworks.
- **Florian** : n'intervient que pour un gate humain réel (validation métier/visuelle, prod, paiement LIVE, données sensibles, sécurité majeure, juridique/financier/contractuel).

## Structure

- `inbox/chatgpt/` : instructions à exécuter.
- `outbox/claude/` : ACK, résultats et preuves de Claude.
- `audits/` : audits techniques persistants.
- `incidents/` : incidents P0/P1 et post-mortems.
- `runner-status.json` : état du runner/orchestrateur.
- `PROJECT_STATE.json` : état et règles stables du projet.

## Contrat d'une instruction

Chaque fichier inbox doit contenir au minimum : `message_id`, `priority`, `status`, `acceptance_criteria`, `needs_human`, `date`, `context`, `expected_decision`.

Une instruction n'est jamais terminée sur simple analyse. Claude doit publier dans l'outbox : ACK, actions réelles, fichiers modifiés, tests, SHA, push, déploiement éventuel, preuves, anomalies, gates, `needs_human`, prochaine action.

## Gates HELP CONFORT

Toujours demander un GO humain avant : déploiement production ; activation/mutation paiement LIVE ; mutation sensible de données réelles ; opération destructive DB/Git ; changement auth/RLS à impact prod ; DNS/domaines ; décision juridique/financière/contractuelle majeure.

Interdits : secrets dans Git, force-push, reset destructif, bypass sécurité, suppression massive non auditée, tests paiement LIVE avec argent réel.

## Priorités

- P0 ABSOLU : prod cassée, sécurité, auth, paiement, perte/données incorrectes, utilisateur bloqué.
- P0 : régression majeure / fonction métier critique.
- P1 : amélioration fonctionnelle.
- P2 : UX/confort.
- P3 : dette/optimisation.

## Règle recette → prod

Le centre `/recette.html` reste l'interface unique de Florian. Toute nouvelle modification visible doit y avoir un point de validation avec « Voir », OK/À corriger et version. Une modification après validation invalide l'OK correspondant. Le control-plane ne crée pas un second système de validation.

## Limite d'autonomie

Le dépôt assure la persistance des échanges. L'exécution continue nécessite un runner/CI réellement hébergé et authentifié. Tant que ce runner n'est pas installé et prouvé, aucun agent ne doit prétendre fonctionner 24/7 ou communiquer en arrière-plan de manière autonome.
