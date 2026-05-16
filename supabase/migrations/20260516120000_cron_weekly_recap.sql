-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : cron pg_cron pour weekly-recap
-- Date : 2026-05-16
-- ═══════════════════════════════════════════════════════════════════════════
-- Planifie l'Edge Function weekly-recap tous les LUNDIS à 08:00 Europe/Paris.
-- Cron pg_cron tourne en UTC : 08:00 Paris = 06:00 UTC (été) / 07:00 UTC (hiver).
-- On utilise 06:00 UTC qui correspond à 08:00 CEST l'été (saison principale).
-- En hiver l'email partira à 07:00 — acceptable.
--
-- Pré-requis : extensions pg_cron et pg_net (Supabase les fournit).
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Supprime un éventuel ancien job du même nom (idempotence)
do $$
declare
  jid int;
begin
  select jobid into jid from cron.job where jobname = 'weekly-recap-monday-8am';
  if jid is not null then
    perform cron.unschedule(jid);
  end if;
end $$;

-- Planifie : tous les lundis à 06:00 UTC (≈ 08:00 Europe/Paris en CEST)
select cron.schedule(
  'weekly-recap-monday-8am',
  '0 6 * * 1',                 -- min hour DoM month DoW (1 = lundi)
  $$
  select net.http_post(
    url     := current_setting('app.settings.supabase_url', true) || '/functions/v1/weekly-recap',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Note : il faut configurer les settings dans la console Supabase si pas déjà :
--   alter system set app.settings.supabase_url = 'https://btcbjwqiivhpwoszomhg.supabase.co';
--   alter system set app.settings.service_role_key = '<SERVICE_ROLE_KEY>';
-- Sinon : remplacer current_setting() par les valeurs en dur.
