# RUNNER-E2E-WITNESS — scénario témoin non destructif d'activation runner

> Tâche ledger : **RUN-1**. Source : issue #9 commentaire 5441844560 (points 9 & 10).
> But : prouver, sans rien casser, que le runner autonome démarre seul, respecte les gardes,
> persiste correctement, et **s'arrête réellement** sur kill-switch. À exécuter APRÈS les gestes
> A→D de [RUNNER-ACTIVATION-CHECKLIST.md](RUNNER-ACTIVATION-CHECKLIST.md).

## Micro-tâche sûre choisie pour le témoin

Une tâche **sans effet métier** : le runner incrémente un compteur témoin et écrit une ligne dans
`docs/control/outbox/claude/RUN-<ts>.md` + met à jour `runner-status.json` (heartbeat). Aucune
écriture applicative, aucune donnée client, aucun email, aucun Stripe, aucun push main.

## Déroulé attendu (témoin)

| # | Étape | Attendu | Comment vérifier |
|---|---|---|---|
| 1 | Déclenchement | `workflow_dispatch` manuel (ou dépôt d'un CP témoin `CP-9999-witness.md`) | onglet Actions : run « claude-runner-oauth » démarre |
| 2 | Préflight accepte | décision = PROCESS (CP valide, auteur autorisé, branche recette, pas de kill-switch) | log job `preflight` : `decision=PROCESS` |
| 3 | Exécution micro-tâche | Claude fait l'action sûre uniquement | log job `execute` |
| 4 | Nouvel outbox + run_id | un **nouveau** `RUN-*.md` + `run_id` unique commun outbox/status | `git show` du commit du run |
| 5 | Heartbeat | `runner-status.json.heartbeat` = timestamp récent ISO | contenu sur origin/recette |
| 6 | Commit/push recette | commit poussé **sur recette** | `git log origin/recette` |
| 7 | main inchangé | aucun nouveau commit sur `main` | comparer `main` avant/après |
| 8 | 2e passage dédupliqué | relancer : préflight SKIP (outbox déjà présent) | log : `SKIP … déjà traité (outbox présent)` |
| 9 | Kill-switch stoppe | créer `RUNNER_STOP` → relancer → SKIP immédiat | log : `SKIP kill-switch … présent` |
| 10 | Nettoyage | supprimer `RUNNER_STOP` + CP témoin + outbox témoin | tree propre |

## Critères FUNCTIONAL (tous requis pour envisager CLOSED)

`FUNCTIONAL = E2E_WITNESS_PASS && DEDUP_PASS && KILLSWITCH_PASS && MAIN_UNCHANGED && NO_SECRET_LEAK && REMOTE_OUTBOX_STATUS_COHERENT`

- **E2E_WITNESS_PASS** : étapes 1→7 vertes.
- **DEDUP_PASS** : étape 8 (2e passage SKIP).
- **KILLSWITCH_PASS** : étape 9 (arrêt réel).
- **MAIN_UNCHANGED** : étape 7 (aucun commit main).
- **NO_SECRET_LEAK** : aucun `CLAUDE_CODE_OAUTH_TOKEN`/clé dans logs, outbox, commits (grep de contrôle).
- **REMOTE_OUTBOX_STATUS_COHERENT** : sur `origin/recette`, `runner-status.run_id == outbox.run_id`,
  heartbeat récent, `last_report` pointe le nouvel outbox (vérif via `gh api contents … ?ref=recette`).

## État `PERSISTENCE_FAILED`

Si outbox/status/push/vérif-remote échoue à n'importe quelle étape → le run doit se marquer
`PERSISTENCE_FAILED` (jamais `COMPLETED`). Le postflight force `exit 1` dans ces cas
(nouvel outbox manquant, JSON invalide, branche ≠ recette, remote inattendu, heartbeat périmé,
run_id incohérent) — prouvé par `runner-preflight.test.sh` (13 cas postflight PASS).

## Sécurité pendant le témoin

- Le run ne doit pas modifier `.github/workflows`, `runner-*.sh`, `*.plist`, secrets : le postflight
  échoue si le diff touche un garde-fou (test « POSTFLIGHT modif garde-fou → FAIL »).
- Nom de la fiche témoin : `NE PAS TRAITER` / `TEST RECETTE` si un formulaire est impliqué —
  mais le témoin recommandé n'implique **aucun** formulaire ni notification agence.
