-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Cron auto-sync des avis Google (toutes les 6h)
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- Pré-requis : extensions pg_cron + pg_net activées
-- (Supabase → Database → Extensions → activer pg_cron et pg_net)
-- ═══════════════════════════════════════════════════════════════

-- 1. Activer les extensions si pas déjà fait
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Stocker la clé service_role dans Vault (chiffrée)
-- ⚠️ Remplace 'TON_SERVICE_ROLE_KEY' par la VRAIE clé (Settings → API → service_role secret)
-- N'exécute cette ligne qu'UNE seule fois.
select vault.create_secret(
  'TON_SERVICE_ROLE_KEY',
  'sync_reviews_service_key',
  'Clé service_role pour appeler sync-reviews depuis le cron'
);

-- 3. Programmer le cron : appelle sync-reviews toutes les 6h
-- Si le cron existe déjà avec ce nom, il sera remplacé
select cron.unschedule('auto-sync-reviews') where exists (
  select 1 from cron.job where jobname = 'auto-sync-reviews'
);

select cron.schedule(
  'auto-sync-reviews',
  '0 */6 * * *',  -- toutes les 6h pile (00:00, 06:00, 12:00, 18:00 UTC)
  $$
  select net.http_post(
    url := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/sync-reviews',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'sync_reviews_service_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Vérifier que c'est bien programmé
select jobid, schedule, jobname, active from cron.job where jobname = 'auto-sync-reviews';

-- ═══════════════════════════════════════════════════════════════
-- Pour DÉSACTIVER : select cron.unschedule('auto-sync-reviews');
-- Pour CHANGER L'INTERVALLE : modifier '0 */6 * * *' puis re-exécuter
--   - '*/30 * * * *' = toutes les 30 min
--   - '0 */1 * * *' = toutes les heures
--   - '0 8,18 * * *' = 8h et 18h chaque jour
--   - '0 9 * * 1' = lundi 9h uniquement
-- ═══════════════════════════════════════════════════════════════

-- 5. Voir l'historique d'exécution du cron
-- select * from cron.job_run_details where jobname = 'auto-sync-reviews' order by start_time desc limit 10;
