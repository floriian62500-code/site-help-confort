# CONTEXTE ACTIF — Help Confort

> **À toi, instance Claude qui ouvres une nouvelle conversation dans ce dossier :**
> Ce fichier est la **source de vérité opérationnelle** validée par Florian.
> Lis-le intégralement **avant** ta première réponse à l'utilisateur dans toute conversation où ce fichier est accessible.
> Si Florian dit « applique le workflow », « lance la maintenance », « ajoute au TODO », etc., c'est ici que tu trouves la définition exacte.
> Date de dernière mise à jour : **2026-05-17** (par instance `hc-site-autonome` run 09:46).

---

## 1. Identité du projet

- **Marque** : Help Confort (siège), franchise dépannage multi-services (plomberie, serrurerie, électricité, vitrerie, chauffage, clim).
- **Site live** : `depan59-62.fr` (zone Nord/Pas-de-Calais). PAS `help-confort.com`.
- **Hébergement** : Netlify, projet `remarkable-dragon-364e2b`.
- **Base de données** : Supabase (cf. mémoire `project_ga4_oauth_success` pour GA4).
- **Dashboard back-office** : 2 modules — `comm` et `outils`. RH supprimé le 2026-05-16.
- **Référent** : Florian Dhaillecourt — `florian.dhaillecourt@helpconfort.com`.

## 2. Architecture des files de travail (validée 2026-05-17)

Deux files distinctes, avec des règles strictes :

### 2.1 `TODO.md` — file **autonome** (les agents traitent sans Florian)

- Une seule tâche par run d'agent.
- Priorisation : `URGENT` > `BUG:` > tâches avec client identifié > ordre chronologique.
- Format de ligne :
  ```
  - [ ] <description> (créée le AAAA-MM-JJ)
  - [ ] URGENT <description>
  - [ ] BUG: <symptôme> | source: <chat AAAA-MM-JJ> | sévérité: <critique|normale>
  ```
- Une fois exécutée : transformer en `- [x] ... (fait le AAAA-MM-JJ)`.

### 2.2 `POUR-FLORIAN.md` — file qui requiert son **attention humaine**

- Jamais exécutée par les agents, **uniquement alimentée**.
- Y mettre tout ce qui dépasse l'autonomie : OAuth à re-consentir, DROP suggéré par advisor, modif RLS/permissions, choix techniques à impact métier, comm à valider avant envoi, dépenses, conformité (RGPD, arrêté 24/01/2017).
- Format d'entrée :
  ```markdown
  ## AAAA-MM-JJ HH:MM — <titre court>
  **Source** : <conversation/agent>, <contexte>
  **Constat** : <description du problème>
  **Pourquoi je ne traite pas** : <raison>
  **Options** :
    1. <option 1>
    2. <option 2>
  **Reco** : option <n>.
  **Quand on se voit** : <temps estimé pour valider>.
  ```

### 2.3 `BUGS-HISTORY.md` — capitalisation des correctifs

- Format d'entrée :
  ```markdown
  ## AAAA-MM-JJ — <titre>
  - Symptôme : ...
  - Cause : ...
  - Fix : commit <hash> (X lignes)
  - Durée : X min
  - Pattern : ...
  ```
- Lu par l'agent maintenance avant chaque scan pour reconnaître les patterns récurrents.

## 3. Workflow Phase 7 — agent `hc-site-autonome`

**Statut** : brouillon prêt (`SKILL-hc-site-autonome-phase7-DRAFT.md` dans ce dossier), **pas encore poussé** sur la tâche planifiée (l'outil `update_scheduled_task` refuse les modifs depuis un run planifié, et le dossier `Scheduled/` est hors zone d'écriture).

**Pour appliquer** (à faire en chat libre, hors run planifié) :
1. Lire le brouillon `SKILL-hc-site-autonome-phase7-DRAFT.md`.
2. Appeler `mcp__scheduled-tasks__update_scheduled_task` sur `taskId=hc-site-autonome` avec `prompt=<contenu du brouillon hors frontmatter>`, `description=<frontmatter description>`, `cronExpression="*/30 8-21 * * *"`.
3. Vérifier avec `list_scheduled_tasks` que la modif est prise.

**Ce que fait l'agent une fois en Phase 7** : voir le brouillon. Synthèse :
- TODO en priorité (1 tâche/run).
- Si TODO vide → scan maintenance 4 volets (site live, build Netlify, dashboard, Supabase) avec auto-fix CRITICAL.
- Throttle 60 min entre scans, lock anti-overlap, état persistant entre runs.
- Supervision santé des autres agents planifiés, notif macOS si blocage.

## 4. Règles transverses pour toutes les conversations

- **Préfixe contextuel** : chaque réponse commence par `[💬 Chat libre]` ou `[🛠️ <taskId>]`.
- **Langue** : français de France, tutoiement, ton direct (cf. CLAUDE.md global).
- **Liens cliquables** obligatoires pour toute référence externe (Netlify, Supabase, Gandi…).
- **Capture bug cross-conversation** : tout bug détecté en chat → écrire immédiatement une ligne `- [ ] BUG: ...` dans `TODO.md`.
- **Au début de chaque nouvelle conversation** : lire ce fichier + `POUR-FLORIAN.md` + `ALERTES.md`. Si l'un n'est pas vide → en informer Florian et proposer de traiter avant d'attaquer autre chose.

## 5. Garde-fous absolus

- Jamais de `DROP` ni de suppression de données utilisateur, même suggérée par advisor → consigner dans `POUR-FLORIAN.md` sans exécuter.
- Jamais de modif RLS/permissions sans diff loggé.
- Trustville/WizVille : lecture seule (cf. mémoire).
- OAuth GA4 expiré : Florian doit re-consentir manuellement via `oauth-ga4.html`, jamais l'agent.
- Pas d'écriture sur LinkedIn (B2C focus, offre Pro pas lancée).

## 6. État actuel des agents planifiés (au 2026-05-17)

| Agent | Cron | État |
|---|---|---|
| `hc-site-autonome` | `*/20 8-21 * * *` (à passer à `*/30` en Phase 7) | ✅ actif |
| `helpconfort-weekly-post-drafts` | `0 18 * * 5` | ✅ actif |
| `helpconfort-daily-maintenance` | `0 7 * * *` | ⛔ |
| `helpconfort-daily-maintenance-scan` | `0 22 * * *` | ⛔ |
| `helpconfort-weekly-maintenance-report` | `30 22 * * 0` | ⛔ |
| `helpconfort-hourly-monitoring` | `15 * * * *` | ⛔ |
| `helpconfort-evening-business-recap` | `0 18 * * 1-6` | ⛔ |
| `helpconfort-sync-social` | `30 6 * * *` | ⛔ |
| `helpconfort-keep-fb-token-alive` | `15 4 * * *` | ⛔ |

Seuls 2/9 tournent. Phase 7 fait de `hc-site-autonome` l'agent unique de maintenance + TODO, ce qui rend les autres optionnels.

---

**Si tu as appliqué quelque chose de ce fichier, mets à jour la date en tête + signale-le à Florian dans ta réponse.**
