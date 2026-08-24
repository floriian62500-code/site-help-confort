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

## 5. Ce que j'ai déjà implémenté (stagé **inerte** sur recette)
- **Modèle de workflow durci OAuth** : `scripts/control/claude-runner-oauth.yml.inactive` — volontairement **hors** `.github/workflows/` et suffixé `.inactive` → **ne s'exécute pas**. Contient : préflight allowlist auteur + kill-switch + dedup + OAuth (coût nul) + recette-only + outbox obligatoire + permissions minimales.
- **Préflight anti-injection** : `scripts/control/runner-preflight.sh` (kill-switch, format strict CP-####, dedup outbox, **allowlist auteur du dernier commit**). Testé localement.
- L'ancien `claude-control-plane.yml` (API **payante**) reste sur la branche `chore/claude-control-runner`, **non recommandé** (coût).
- Activation = déplacer le `.inactive` vers `.github/workflows/claude-runner-oauth.yml` sur **main** (PR approuvée) + ajouter le secret. Rien d'autre à coder.

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

---

## 12. Tests du préflight (PASS/FAIL attendus) — `scripts/control/runner-preflight.test.sh`
Sandbox isolée, aucun effet sur le repo réel. **Résultat (préflight+postflight) : 16 PASS / 0 FAIL.**
| Scénario | Attendu | Obtenu |
|---|---|---|
| Mauvais nom CP (`CP-XX-bad.md`) | SKIP aucun CP valide | ✅ |
| Instruction valide + auteur allowlisté | PROCESS <path> | ✅ |
| Mauvais auteur (`attaquant-random`) | SKIP auteur non autorisé | ✅ |
| Doublon (outbox déjà présent) | SKIP déjà traité | ✅ |
| Kill-switch (`RUNNER_STOP`) | SKIP kill-switch | ✅ |
| Branche autre que recette (`main`) | SKIP branche non-recette | ✅ |

## 13. Pourquoi le workflow doit être sur `main` alors qu'il ne touche QUE `recette`
GitHub **n'exécute les triggers `schedule` (cron) et `workflow_dispatch` que depuis la branche par défaut** (`main`).
Un workflow présent uniquement sur `recette` ne serait jamais planifié. **Mais** le workflow, à l'exécution :
`checkout ref: recette` → travaille sur recette → `git push origin HEAD:refs/heads/recette` **uniquement**.
Garde dure dans le job (refus explicite de pousser `main`/`master`). Donc : **fichier sur main = obligatoire pour le scheduler ; exécution/écriture = recette exclusivement.** Le fichier workflow est de la config CI, pas du contenu site.

## 14. Branch protection minimale recommandée sur `main`
GitHub → Settings → Branches → Add rule (`main`) :
- ☑ Require a pull request before merging (pas de push direct).
- ☑ Do not allow bypassing the above settings.
- ☑ Block force pushes. ☑ Restrict deletions.
- (option) Require status checks : préflight/smoke si exposés en checks.
- ⚠️ **NE PAS ajouter « GitHub Actions » ni aucun rôle dans la bypass list du ruleset** (sinon le `GITHUB_TOKEN` du runner contournerait la protection).
- **Vérifier l'absence de bypass** : Settings → Rules → Rulesets → (le ruleset main) → « Bypass list » doit être **vide** ; ou API `gh api repos/OWNER/site-help-confort/rulesets` → `bypass_actors: []`. Test concret : tenter un push direct sur main via un run Actions doit être **refusé** (403).
→ Backstop serveur : même si un prompt tentait de pousser main, le `GITHUB_TOKEN` est refusé (à condition que la bypass list soit vide).

## 15. ACTIVATION CHECKLIST (Florian — ordre STRICT : protéger main AVANT de merger)
- [ ] **A.** Terminal : `claude setup-token` → GitHub → Settings → Secrets and variables → Actions → New repository secret : nom `CLAUDE_CODE_OAUTH_TOKEN`, valeur = le token. (Ne le colle nulle part d'autre.)
- [ ] **B.** **Activer la branch protection / ruleset `main` AVANT tout** (§14) : require PR, block push direct/force/suppression, **bypass list vide** (pas d'exception Actions). Vérifier l'absence de bypass.
- [ ] **C.** **Seulement ensuite**, merger la PR #10 (place le workflow sur `main`, désormais protégé).
- [ ] **D.** Onglet Actions → « Claude Runner (OAuth) » → *Run workflow* = test E2E témoin.
> L'ordre B avant C est impératif : le workflow autonome a `contents:write` ; le backstop serveur doit exister AVANT que le workflow existe sur main.

## 16. Test E2E d'activation NON destructif (à exécuter après les 5 cases)
1. Commit un `docs/control/inbox/chatgpt/CP-9999-ping.md` (auteur = Florian) sur `recette` : contenu « ping runner, écris un outbox témoin et t'arrête ».
2. Actions → Run workflow (ou attendre le cron).
3. Vérifier : préflight = PROCESS ; run vert ; `docs/control/outbox/claude/RUN-*.md` témoin créé ; `runner-status.json` heartbeat mis à jour ; **`git log origin/main` inchangé** (aucune écriture main).
4. Nettoyer : supprimer `CP-9999-ping.md` + l'outbox témoin. Documenter les SHA.
→ **PASS** = outbox témoin + heartbeat + 0 modif main/prod. Tant que non PASS, automatisation **non déclarée fonctionnelle**.

## 17. Rollback immédiat (preuve d'arrêt)
- **Kill-switch** : créer `docs/control/RUNNER_STOP` → au prochain run le préflight sort en SKIP (prouvé par le test #5) → **aucune tâche ne continue**.
- **Disable** : Actions → workflow → « Disable workflow » → plus aucun cron.
- **Secret** : supprimer `CLAUDE_CODE_OAUTH_TOKEN` → `claude-code-action` échoue au démarrage → aucune exécution.
Les trois sont indépendants et suffisants isolément.

## STATUT : `READY_FOR_HUMAN_ACTIVATION`
Workflow finalisé + préflight testé (5/5) + PR technique préparée + checklist + E2E + rollback documentés.
**Manque uniquement** : les 3 actions Florian (token OAuth, secret, merge PR + branch protection). Aucune activation faite.


---

## 18. Durcissements sécurité PR #10 (revue ChatGPT 5394944983) — matrice GARDE | TEST | RÉSULTAT
| # | GARDE | Implémentation | TEST | RÉSULTAT |
|---|---|---|---|---|
| 1 | Supply chain | `actions/checkout@11d5960a…` (v4) + `claude-code-action@c81e3bc6…` (v1) **pinnés SHA** | revue diff | ✅ |
| 2 | Least privilege | `issues:write` **retiré** (commentaires #9 restent manuels) ; seul `contents:write` | revue perms | ✅ |
| 3 | Garde branche avant/après | step « Garde branche (avant) » + postflight (après) : `HEAD==recette` sinon FAIL | POSTFLIGHT « branche != recette » | ✅ FAIL |
| 4 | Fichiers sensibles | postflight refuse diff touchant `.github/workflows/**`, `scripts/control/runner-*`, `.plist`, `.env`, secret | POSTFLIGHT « modif garde-fou » | ✅ FAIL |
| 5a | Outbox obligatoire | postflight exige un `RUN-*.md` dans le diff sinon FAIL | POSTFLIGHT « outbox manquant » | ✅ FAIL |
| 5b | runner-status JSON | postflight exige status modifié + JSON valide | POSTFLIGHT « JSON invalide » | ✅ FAIL |
| 6 | Distinction échec | step `Trace d'échec` (`RUN-FAIL-*.md`) sur `failure()` — claude/postflight/push distingués | revue workflow | ✅ |
| 7 | Anti-mélange auteur | préflight refuse un CP dont le commit touche aussi du code applicatif | PREFLIGHT « commit mélangé » | ✅ SKIP |
| 8 | Planif / Claude jamais appelé si skip | job `execute` gardé par `if: decision == process` ; préflight seul sinon | revue workflow | ✅ |

**Tests : 16/16 PASS** (7 préflight + 9 postflight) — `scripts/control/runner-preflight.test.sh`.

### Limite connue (#7) — provenance auteur
Le préflight compare `git log %an/%ae` (nom/email Git, **falsifiables** localement), **pas** un login GitHub signé.
Mitigations en place : allowlist email exact + CP dans un commit **control-only** (refus si mélange applicatif) +
inbox lu uniquement sur `recette` (write = collaborateurs). **Évolution recommandée** : exiger des **commits signés
vérifiés GitHub** (branch protection « require signed commits ») pour une provenance forte.

### Coût / quota (#8)
Cron */20 = ~72 déclenchements/j. Si aucun CP : **seul le job préflight** s'exécute (~secondes, Claude non appelé) →
consommation Actions négligeable, **0 usage abonnement**. Claude n'est invoqué que sur un CP PROCESS.

## RUNNER_STATE (mis à jour)
`RUNNER_STATE = READY_FOR_HUMAN_ACTIVATION_FINAL`
