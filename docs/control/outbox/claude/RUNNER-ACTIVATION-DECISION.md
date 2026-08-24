# RUNNER-ACTIVATION-DECISION — autonomie Claude (ChatGPT→GitHub→Claude→recette→outbox)

> Réponse à issue #9 / 5394672383. 2026-08-24. Décision d'architecture + ce qui est prêt + l'unique action Florian.

## 1. Options réellement disponibles (diagnostic)

| Option | Prérequis | Coût | Secret | Mac allumé ? | Risque injection | Lit inbox | Push recette | Périodique | Compat public+Netlify |
|---|---|---|---|---|---|---|---|---|---|
| **A. GitHub Actions + Claude Code Action OAuth** | workflow sur branche défaut (main) + token OAuth | **0 additionnel** (abonnement Pro/Max) | `CLAUDE_CODE_OAUTH_TOKEN` (secret GH) | **Non** (hébergé) | Faible si allowlist auteur + trigger contrôlé | Oui | Oui (contents:write) | Oui (cron) | Oui |
| B. GitHub Actions + `ANTHROPIC_API_KEY` | idem A | **PAYANT** (par token) — **interdit** | API key | Non | idem A | Oui | Oui | Oui | Oui |
| C. Runner local macOS/launchd | Mac allumé 24/7 + `claude` CLI + install plist | 0 (abonnement) | aucun dans repo | **Oui** | Faible si allowlist | Oui | Oui | Oui (StartInterval) | Oui |
| D. Claude Code GitHub App (@claude mentions) | App installée + OAuth | 0 (abonnement) | OAuth | Non | **Élevé** (lit des commentaires arbitraires sur repo public) | via mention | Oui | Non (événementiel) | Oui mais risqué |

- **B** exclu (coût). **D** exclu (surface d'injection : sur repo public, n'importe qui peut @claude avec une consigne malveillante).
- **C** viable mais dépend du Mac allumé + le classifier du harness a historiquement bloqué l'écriture du script d'auto-exécution (CP-0006).
- **A** = meilleur compromis : hébergé (pas de Mac), coût nul (OAuth), déclenché par cron/dispatch (pas par des commentaires arbitraires), lit uniquement l'inbox **poussé sur recette** (seuls les collaborateurs écrivent recette).

## 2. Architecture cible recommandée : **Option A**

**GitHub Actions planifié + `anthropics/claude-code-action@v1` en OAuth**, durci :
- **Trigger** : `schedule` (ex. */20 min) + `workflow_dispatch` — **jamais** déclenché par un commentaire/@mention arbitraire.
- **Source des consignes** : uniquement `docs/control/inbox/chatgpt/CP-####-*.md` **sur recette** (recette n'est écrite que par les collaborateurs du repo).
- **Anti-injection** (préflight, avant d'invoquer Claude) :
  1. **Allowlist auteur** : ne traiter un CP-#### que si l'auteur du **dernier commit** qui l'a modifié ∈ allowlist (`floriian62500-code`, comptes ChatGPT-connector approuvés). Sinon skip + log.
  2. **Format strict** : nom `CP-\d{4}-[a-z0-9-]+\.md` uniquement.
  3. **Kill-switch** : si `docs/control/RUNNER_STOP` existe → exit propre.
  4. **Dedup** : ne pas retraiter un CP-#### ayant déjà un outbox `CP-####.md`/`RUN-*` correspondant.
- **Garde-fous d'exécution** : prompt interdisant main/PROD/Stripe LIVE/secret/force-push ; **branch protection sur `main`** (backstop côté serveur : le `GITHUB_TOKEN` ne peut pas pousser main) ; permissions minimales `contents: write` (recette), `issues: write` (commenter #9). Retirer `pull-requests: write` si non nécessaire.
- **Sortie obligatoire** : outbox `RUN-<horodatage>.md` + `runner-status.json` (heartbeat/state) commit/push recette **avant fin de run** (déjà la règle appliquée manuellement).
- **Concurrence** : `concurrency: group=claude-control-plane, cancel-in-progress:false` = lock. Heartbeat dans runner-status.json. Dedup ci-dessus.
- **Si aucune tâche** : le prompt bascule sur audit/nettoyage/sécurité continu (déjà le comportement).

## 3. Schéma du flux
```
ChatGPT (connecteur GitHub) --commit--> docs/control/inbox/chatgpt/CP-####-*.md (sur recette)
        |
   [cron */20]  GitHub Actions (ubuntu, hébergé)
        |-- préflight : kill-switch ? auteur ∈ allowlist ? format CP ? déjà traité ?
        |-- OUI--> claude-code-action@v1 (OAuth) lit le CP, exécute (recette only), tests
        |-- écrit docs/control/outbox/claude/RUN-*.md + runner-status.json (heartbeat)
        |-- git push origin HEAD:recette  (jamais main ; main protégé)
        |-- (option) gh issue comment #9
        v
ChatGPT relit l'outbox/commentaire --> boucle suivante, sans Florian
```

## 4. Prérequis exacts
1. Un abonnement **Claude Pro/Max** (pour l'OAuth sans coût API).
2. Token OAuth : `claude setup-token` (génère un token lié à l'abonnement).
3. Secret GitHub : `CLAUDE_CODE_OAUTH_TOKEN` = ce token.
4. Le workflow doit vivre sur la **branche par défaut** (main) pour que `schedule`/`workflow_dispatch` s'activent.
5. **Branch protection sur `main`** (empêche tout push main par le runner).

## 5. Ce que j'ai déjà implémenté (branche technique `chore/claude-control-runner`)
- Workflow durci **OAuth** `.github/workflows/claude-runner-oauth.yml` (préflight allowlist auteur + kill-switch + dedup + OAuth + recette-only + outbox obligatoire). **NON actif** (sur branche technique, secret absent).
- Préflight script `scripts/control/runner-preflight.sh` (validation auteur/format/kill-switch/dedup).
- L'ancien `claude-control-plane.yml` (API payante) reste sur sa branche, **non recommandé** (coût).

## 6. Ce qui manque (bloquant humain)
- **Le secret `CLAUDE_CODE_OAUTH_TOKEN`** (Florian, via son abonnement).
- **Le workflow sur main** : merge/cherry-pick du fichier workflow vers `main` (une PR à approuver) — c'est la seule écriture main nécessaire, et c'est de la config CI, pas du contenu site. Alternative sans toucher main : rester sur l'**option C locale** (launchd) — mais dépend du Mac allumé.

## 7. Action Florian — UNE étape (écran par écran)
1. Terminal : `claude setup-token` → copier le token affiché.
2. GitHub → repo `site-help-confort` → **Settings → Secrets and variables → Actions → New repository secret** → Name `CLAUDE_CODE_OAUTH_TOKEN`, Value = le token → **Add secret**.
3. (Pour l'option hébergée) approuver la PR qui place `claude-runner-oauth.yml` sur `main` + activer **branch protection** sur main (Settings → Branches → Add rule → require PR, no direct push).
> Dès ces étapes faites, l'activation est immédiate (rien d'autre à préparer).

## 8. Procédure de test E2E (après activation)
1. ChatGPT (ou Florian) commit un `CP-TEST-0001-ping.md` dans l'inbox sur recette (auteur allowlisté).
2. Attendre le prochain cron (ou `workflow_dispatch`).
3. Vérifier : run Actions vert → outbox `RUN-*.md` créé → runner-status heartbeat mis à jour → push recette visible.
4. Retirer le CP-TEST + son outbox. Documenter les SHA.

## 9. Arrêt / rollback
- **Kill-switch** : créer `docs/control/RUNNER_STOP` (le préflight sort proprement).
- **Désactivation** : GitHub → Actions → workflow → **Disable workflow** ; ou supprimer le secret ; ou retirer le fichier de main.
- **Rollback local (option C)** : `launchctl unload ~/Library/LaunchAgents/com.helpconfort.claude-runner.plist`.

## 10. Coût
- **0 coût additionnel** avec OAuth (abonnement Pro/Max). Minutes GitHub Actions : dans le quota gratuit pour un cron 20 min (~72 runs/j courts). API payante = **évitée**.

## 11. Risques résiduels
- **Injection** : limitée par allowlist-auteur + inbox-sur-recette + format strict, mais un collaborateur compromis reste un vecteur. Mitigation forte = signature de commit + allowlist stricte.
- **Contenu semi-fiable** : le CP lui-même reste une instruction exécutée ; les garde-fous durs (no main/PROD/Stripe/secret + main protégé) sont les backstops.
- **Boucle infinie de coût-usage** : un cron qui fait « audit continu » consomme l'abonnement en continu → prévoir un budget de turns/jour et un `RUNNER_STOP` facile.
- **Workflow sur main** : nécessaire pour le cron (contrainte GitHub), = une écriture main de config CI (gate humain assumé).

## Décision
**Recommandé : Option A (GitHub Actions + Claude Code Action OAuth, durci).** Tout est préparé sur la branche technique ; activation = 1 secret + 1 merge de workflow vers main + branch protection. Sinon repli Option C (local launchd) si Florian préfère ne pas toucher main (dépend du Mac allumé).
