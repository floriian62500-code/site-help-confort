# 🕐 Activation du CRON Publication Programmée

> **Status** : ⚠️ Mécanisme installé mais **CRON pas encore activé**
> Les publications s'enregistrent dans la BDD mais ne se déclenchent pas automatiquement.

## État actuel

✅ Table `scheduled_publications` créée
✅ Edge Function `publish-scheduled` déployée
❌ **CRON pg_cron NON ACTIVÉ** (les SQL `cron.schedule(...)` sont en commentaire dans `setup_scheduled_publications.sql`)

## Pour activer le CRON (5 minutes)

### Étape 1 — Activer pg_cron

1. Va sur **Supabase Dashboard** → projet `btcbjwqiivhpwoszomhg`
2. Menu de gauche → **Database** → **Extensions**
3. Cherche `pg_cron` → clique **Enable**

### Étape 2 — Récupérer la SERVICE_ROLE_KEY

1. Supabase Dashboard → **Project Settings** → **API**
2. Section "Project API keys" → copie la **service_role key** (commence par `eyJ...`)
3. ⚠️ **JAMAIS partager publiquement** cette clé (admin total sur la BDD)

### Étape 3 — Lancer le CRON

1. Supabase Dashboard → **SQL Editor**
2. **New query** → colle ce SQL en remplaçant `<SERVICE_ROLE_KEY>` :

```sql
select cron.schedule(
  'publish-scheduled-job',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/publish-scheduled',
      headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>', 'content-type', 'application/json'),
      body := '{}'::jsonb
    );
  $$
);
```

3. **Run** → tu dois voir `Success`.

## Vérifier que le CRON est actif

```sql
-- Liste des jobs cron actifs
select * from cron.job;

-- Historique des exécutions
select * from cron.job_run_details order by start_time desc limit 10;
```

## Vérifier qu'une publication programmée part bien

1. Côté admin : programme une publication à **dans 6 minutes**
2. Attends 6 min
3. Refresh Supabase SQL Editor :
```sql
select id, realisation_id, scheduled_at, status, executed_at, last_error
from scheduled_publications
order by created_at desc limit 5;
```
4. Le `status` doit passer de `pending` → `running` → `done`
5. Si `failed`, regarde `last_error` pour diagnostiquer

## Pour désactiver le CRON

```sql
select cron.unschedule('publish-scheduled-job');
```

## Channels supportés

Le job appelle automatiquement les Edge Functions selon ce que tu as coché à la programmation :
- `channels.meta = true` → appelle `publish-meta` (Facebook + Instagram)
- `channels.linkedin = true` → appelle `publish-linkedin`
- `channels.gbp = true` → appelle `publish-gbp` (Google Business Profile)

Le job retient le succès/échec de chaque canal dans `result_log`.

## Avantages du système

- **Resilient** : si l'Edge Function plante, le statut reste `running` (à corriger manuellement)
- **Idempotent** : exécuté toutes les 5 min, traite tout ce qui est `pending` et `scheduled_at <= now()`
- **Multi-canal** : 1 programmation peut déclencher Meta + LinkedIn + GBP simultanément
- **Logs complets** : `result_log` contient le détail de chaque appel (status code, response)

## En cas de problème

| Symptôme | Diagnostic | Solution |
|---|---|---|
| Publication reste `pending` après l'heure prévue | CRON pas actif | Vérifier `select * from cron.job` |
| `status = failed`, `last_error` non vide | Edge Function en erreur | Lire l'erreur, redéployer si besoin |
| `status = running` depuis > 1h | Crash mid-exécution | `update scheduled_publications set status='pending' where status='running'` |
| Aucune action après 5 min | Cron lancé mais Edge Function 401 | Vérifier que la SERVICE_ROLE_KEY est correcte |
