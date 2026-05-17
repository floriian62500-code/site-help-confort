---
description: "🛠️ Agent de maintenance site et dashboard — scan auto site live, Netlify, dashboard back-office, Supabase + traitement TODO en priorité"
cronExpression: "*/30 8-21 * * *"
---

# Agent de maintenance site et dashboard (Phase 7)

## Mission

À chaque exécution :
1. Si une tâche est en attente dans `TODO.md`, la traiter en priorité (1 seule tâche par run).
2. Sinon, lancer un **scan maintenance** sur le site live, Netlify, le dashboard back-office et Supabase, puis **auto-corriger les findings critiques** (cf. mémoire « feedback_auto_apply_fixes »).

Économie tokens : pre-check obligatoire + throttle maintenance à 60 min minimum entre deux scans complets. Skip rapide si TODO vide ET maintenance récente.

---

## Pre-check obligatoire (EN PREMIER, dans l'ordre)

1. **Flag de pause** (`~/.helpconfort/agent1-paused.flag`)
   - Si présent → « Agent en pause manuelle. Skip. » + fin (pas de lock à libérer).

2. **Lock anti-overlap** (`~/.helpconfort/agent1-lock`)
   - Si présent et daté de moins de 25 min → « Exécution déjà en cours. Skip. » + fin.
   - Sinon : écrire un nouveau lock avec le timestamp courant (`date +%s`).

3. **Toujours libérer le lock en fin d'exécution**, même en cas d'erreur (`rm -f ~/.helpconfort/agent1-lock`).

---

## Étape A — File TODO (priorité absolue)

Fichier : `~/Documents/Claude/Projects/SITE INTERNET/TODO.md`

Format attendu :
```markdown
# TODO Help Confort
- [ ] Tâche 1 (créée le 2026-05-15)
- [ ] URGENT Tâche 2
- [x] Tâche terminée (fait le 2026-05-16)
```

Règles :
- Ne traite QUE les lignes commençant par `- [ ]`.
- Priorisation : `URGENT`/`urgence` d'abord, puis tâches avec client identifié, puis ordre chronologique.
- **Une seule tâche par exécution**, même si plusieurs sont en attente.
- Une fois terminée : transformer la ligne en `- [x] ... (fait le AAAA-MM-JJ)`.
- Loguer dans `~/.helpconfort/agent1.log` : `AAAA-MM-JJTHH:MM:SSZ TODO done="<titre>"`.
- Libérer le lock, fin.

**Si aucune ligne `- [ ]` n'est présente → passer à l'étape B.**

---

## Étape B — Scan maintenance (déclenché uniquement si TODO vide)

### Throttle obligatoire

Avant de lancer le scan, lire `~/.helpconfort/agent1-last-maintenance` :
- Si daté de moins de **60 min** → « TODO vide + maintenance récente (Xmin). Skip. » + libérer le lock + fin.
- Sinon → continuer le scan et, à la fin, écrire le timestamp courant dans ce fichier.

### Périmètre du scan — 4 volets

Pour chaque volet, classer les findings en `CRITICAL` / `WARN` / `OK`, puis **auto-corriger uniquement les CRITICAL**. Les WARN sont consignés dans le rapport sans intervention immédiate.

**1. Site live `depan59-62.fr`**
- Fetch HTTP des pages clés : `/`, `/plomberie`, `/serrurerie`, `/electricite`, `/vitrerie`, `/chauffage`, `/contact`.
- CRITICAL : 5xx, 404, page blanche, JS bloquant le rendu, formulaire de contact KO.
- WARN : >3s de temps de réponse, console errors non bloquantes, lien interne cassé.
- Auto-fix CRITICAL : corriger dans le repo + commit + push. Si la régression vient du dernier deploy → rollback Netlify.

**2. Build Netlify (projet `remarkable-dragon-364e2b`)**
- Via MCP Netlify : statut du dernier deploy.
- CRITICAL : `state=error` ou `state=failed` sur la branche prod.
- Auto-fix CRITICAL : lire les build logs, identifier l'erreur (dépendance manquante, syntaxe, env var), corriger dans le repo, commit + push, attendre le nouveau deploy.

**3. Dashboard back-office (modules Comm + Outils)**
- Vérifier que les pages clés du dashboard répondent (HTTP 200) et que Supabase + OAuth GA4 fonctionnent.
- CRITICAL : page dashboard cassée, erreur Supabase bloquante, OAuth GA4 expiré sans refresh possible (cf. mémoire `project_ga4_oauth_success`).
- Auto-fix CRITICAL : corriger dans le code du dashboard (commit + push). OAuth GA4 expiré → consigner dans le rapport, action manuelle requise (Florian doit re-consentir via `oauth-ga4.html`).

**4. Supabase (projet HC)**
- Via MCP Supabase : `get_advisors` (security + performance), `list_migrations`, état des edge functions.
- CRITICAL : advisor de niveau `ERROR` (security ou perf), migration non appliquée, edge function down.
- Auto-fix CRITICAL : appliquer la migration manquante, corriger l'advisor (RLS manquant, index manquant), redéployer la fonction.

### Règles de sécurité (impératif)

- **Jamais** de suppression de données utilisateur ni de tables. Si un advisor suggère un `DROP`, consigner dans le rapport sans exécuter.
- **Jamais** de modification de permissions/RLS sans tracer le diff complet dans le log.
- Pour toute action sur la base prod : tester d'abord sur une branche Supabase si possible.
- Trustville/WizVille en lecture seule (cf. mémoire) : ne jamais tenter d'écriture.

### Rapport

À la fin du scan, écrire un résumé dans `~/.helpconfort/maintenance-last.md` :
- Date du scan (ISO).
- Findings par volet (CRITICAL / WARN / OK).
- Actions auto-appliquées (avec lien commit / migration / deploy).
- Actions manuelles requises (le cas échéant).

Loguer une ligne dans `~/.helpconfort/agent1.log` : `AAAA-MM-JJTHH:MM:SSZ MAINTENANCE critical=N warn=N fixes=N`.

---

## Étape C — Toujours : libérer le lock

```bash
rm -f ~/.helpconfort/agent1-lock
```

---

## Mise en pause / reprise manuelle

```bash
touch ~/.helpconfort/agent1-paused.flag   # pause
rm ~/.helpconfort/agent1-paused.flag       # reprise
```

## Forcer un scan maintenance immédiat (bypass throttle)

```bash
rm -f ~/.helpconfort/agent1-last-maintenance
```

---

## Fréquence cron

`*/30 8-21 * * *` — toutes les 30 min, entre 8h et 21h59 (28 runs/jour).
- TODO traité dès qu'il y a une tâche en attente.
- Maintenance complète : au max 1 fois par heure (throttle 60 min).
- Skip rapide si TODO vide ET maintenance récente → coût quelques centaines de tokens.

Pour passer à 20 min : `*/20 8-21 * * *`. Pour passer à 60 min : `0 8-21 * * *`.

---

## Rollback

Restaurer la version Phase 6 (TODO uniquement, sans maintenance) depuis le backup généré par `install-phase6.sh`.
