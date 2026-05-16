-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Cron auto-import Facebook
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════
--
-- Ce cron déclenche toutes les heures l'edge function sync-facebook-posts
-- qui importe les nouveaux posts de la page FB et les insère en BDD
-- (table realisations avec status='validation' par défaut, à valider manuellement).
--
-- Prérequis :
--   1. Extension pg_cron + pg_net activées (déjà fait pour sync-reviews)
--   2. Edge function "sync-facebook-posts" déployée
--   3. Config Meta présente dans app_settings (key='meta' avec page_access_token + fb_page_id)
-- ═══════════════════════════════════════════════════════════════

-- 1) Activer les extensions (idempotent)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Désactiver l'ancien job s'il existe (re-exécutable)
select cron.unschedule('auto-sync-facebook-posts') where exists (
  select 1 from cron.job where jobname = 'auto-sync-facebook-posts'
);

-- 3) Créer le job : toutes les heures (en haut de l'heure)
select cron.schedule(
  'auto-sync-facebook-posts',
  '0 * * * *',  -- chaque heure à minute 0
  $$
  select net.http_post(
    url := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/sync-facebook-posts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- 4) Vérifier que le job est bien créé
select jobname, schedule, command from cron.job where jobname = 'auto-sync-facebook-posts';

-- ═══════════════════════════════════════════════════════════════
-- NOTES :
-- - Si vault.decrypted_secrets n'a pas 'service_role_key', l'ajouter via Dashboard
--   → Vault → New secret → name: service_role_key, value: <ton service_role_key>
-- - Pour DÉSACTIVER : select cron.unschedule('auto-sync-facebook-posts');
-- - Pour ALTERNATIVE plus fréquente (toutes les 30 min) : remplacer '0 * * * *' par '*/30 * * * *'
-- - Pour VOIR les exécutions : select * from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'auto-sync-facebook-posts') order by start_time desc limit 10;
-- ═══════════════════════════════════════════════════════════════
