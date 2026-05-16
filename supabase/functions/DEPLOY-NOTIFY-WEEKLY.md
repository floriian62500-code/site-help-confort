# 🚀 Déployer notify-lead + weekly-recap (2026-05-16)

## 1. Pré-requis

Vérifier que **RESEND_API_KEY** est bien configuré dans les secrets Supabase :

```bash
supabase secrets list --project-ref btcbjwqiivhpwoszomhg | grep RESEND
```

Si absent :
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxx --project-ref btcbjwqiivhpwoszomhg
```

## 2. Déployer notify-lead

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
supabase functions deploy notify-lead --no-verify-jwt --project-ref btcbjwqiivhpwoszomhg
```

Le `--no-verify-jwt` est nécessaire car la fonction est appelée depuis le site public
(visiteurs anonymes via hc-leads-capture.js).

## 3. Déployer weekly-recap

```bash
supabase functions deploy weekly-recap --project-ref btcbjwqiivhpwoszomhg
```

Pas de `--no-verify-jwt` car la fonction est appelée par pg_cron en interne avec service_role_key.

## 4. Appliquer la migration pg_cron

```bash
supabase db push --project-ref btcbjwqiivhpwoszomhg
```

Ou via le SQL Editor : copier-coller le contenu de
`supabase/migrations/20260516120000_cron_weekly_recap.sql`.

## 5. Configurer les settings pg_cron (1x)

Dans le SQL Editor de Supabase :

```sql
-- À exécuter UNE FOIS pour que le cron puisse appeler l'Edge Function
alter system set app.settings.supabase_url = 'https://btcbjwqiivhpwoszomhg.supabase.co';
alter system set app.settings.service_role_key = '<SERVICE_ROLE_KEY_RÉCUPÉRÉE_DANS_SETTINGS>';
select pg_reload_conf();
```

## 6. Tester en local

**notify-lead** : créer un faux lead depuis le formulaire de contact public, vérifier
l'arrivée de l'email à `saint-omer@helpconfort.com`.

**weekly-recap** : depuis le SQL Editor :
```sql
select net.http_post(
  url     := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/weekly-recap',
  headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || '<SERVICE_ROLE_KEY>'),
  body    := '{"force": true}'::jsonb
);
```

## 7. Vérifier le cron actif

```sql
select * from cron.job where jobname = 'weekly-recap-monday-8am';
```

Doit retourner 1 ligne avec `schedule = '0 6 * * 1'`.

## 8. Logs

```bash
supabase functions logs notify-lead --project-ref btcbjwqiivhpwoszomhg
supabase functions logs weekly-recap --project-ref btcbjwqiivhpwoszomhg
```

## 9. Désactiver le récap hebdo (si besoin)

Dans `app_settings` :
```sql
update app_settings
   set value = jsonb_set(value, '{weekly_recap_disabled}', 'true')
 where key = 'notification_emails';
```

Ou dans la console Supabase, supprimer le cron :
```sql
select cron.unschedule('weekly-recap-monday-8am');
```
