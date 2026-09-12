# RUNNER-ACTIVATION-CHECKLIST — gestes Florian (5 actions humaines)

> Tâche ledger : **RUN-1**. Source : issue #9 commentaire 5441844560.
> Le paquet technique est **PREP_COMPLETE** (voir matrice ci-dessous). Il ne reste que
> **5 gestes humains** que Claude **ne peut pas** faire (secret, protection de branche, merge).
> Aucun de ces gestes n'est irréversible sans issue ; chacun est réversible (revert PR, retrait secret).

## Pré-requis vérifiés (côté Claude — aucune action requise)

| Point | État | Preuve |
|---|---|---|
| PR #10 diff sans dérive applicative | ✅ | 3 fichiers : `.github/workflows/claude-runner-oauth.yml`, `runner-preflight.sh`, `runner-postflight.sh` |
| Gardes preflight+postflight | ✅ 20/20 PASS | `scripts/control/runner-preflight.test.sh` |
| Triggers cron `*/20` + `workflow_dispatch` | ✅ | workflow l.4-6 |
| Permissions minimales `contents:write` (pas issues:write) | ✅ | workflow l.12-13 |
| Concurrency lock (`cancel-in-progress:false`) + `timeout-minutes:45` | ✅ | workflow l.8-10, 57 |
| Checkout `ref: recette` + push **recette uniquement** (garde anti-main `exit 1`) | ✅ | workflow l.38,61,69,104-111 |
| Actions **pinnées par SHA** (pas de tag flottant) | ✅ | `checkout@11d5960a`, `claude-code-action@c81e3bc6` |
| Interdits absolus (main/PROD/Stripe LIVE/mutation données) inscrits dans le prompt runner | ✅ | workflow l.81-84 |
| Nouvel outbox + run_id unique obligatoire / `PERSISTENCE_FAILED` sinon | ✅ | postflight (nouvel outbox, run_id cohérent, heartbeat récent) |

## Les 5 gestes Florian (dans cet ordre)

**A. Générer le token OAuth Claude**
   - Générer un token OAuth Claude Code (compte autorisé). **Ne le coller nulle part d'autre** que l'étape B.

**B. Créer le secret GitHub `CLAUDE_CODE_OAUTH_TOKEN`**
   - Repo `floriian62500-code/site-help-confort` → Settings → Secrets and variables → Actions → New repository secret.
   - Name : `CLAUDE_CODE_OAUTH_TOKEN` — Value : le token de l'étape A. **Jamais** dans un commit/log/outbox.

**C. Activer la protection de `main` SANS bypass Actions**
   - Settings → Branches → Add rule sur `main` : require PR before merging, **ne pas** autoriser
     GitHub Actions à bypass. (Le runner ne pousse jamais main — cette règle est une double sécurité.)

**D. Merger la PR #10**
   - PR #10 (`chore/runner-oauth-activation` → `main`), tip **`cdcafcac`**. Merge → active
     `.github/workflows/claude-runner-oauth.yml`. Le cron démarrera au prochain créneau `*/20`.

**E. Lancer / vérifier l'E2E témoin**
   - Suivre **[RUNNER-E2E-WITNESS.md](RUNNER-E2E-WITNESS.md)** : déclencher un `workflow_dispatch`
     (ou déposer un CP témoin), vérifier les 10 critères FUNCTIONAL. Si un seul échoue → ne pas
     considérer RUN-1 comme `CLOSED`.

## Kill-switch (à tout moment)

Créer un fichier `RUNNER_STOP` à la racine de `recette` → le préflight sort en SKIP à chaque run
(prouvé par le test « PREFLIGHT kill-switch → SKIP »). Le supprimer pour réactiver.

## Rappels

- Aucun de ces gestes n'est fait par Claude (secret + protection + merge = gestes humains).
- Tant que E2E témoin n'est pas PASS réel : RUN-1 reste **BLOCKED_HUMAN** avec `PREP_COMPLETE=YES`
  (jamais `CLOSED` sur la foi d'un résumé).
