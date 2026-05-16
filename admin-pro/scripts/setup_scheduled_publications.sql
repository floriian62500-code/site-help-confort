-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Planification de publications
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.scheduled_publications (
  id              uuid primary key default gen_random_uuid(),
  realisation_id  uuid not null references public.realisations(id) on delete cascade,
  scheduled_at    timestamptz not null,
  channels        jsonb not null default '{"meta":false,"linkedin":false,"gbp":false}'::jsonb,
  status          text not null default 'pending', -- pending | running | done | failed | cancelled
  executed_at     timestamptz,
  last_error      text,
  result_log      jsonb,
  created_by      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_sched_pub_status_time
  on public.scheduled_publications (status, scheduled_at);
create index if not exists idx_sched_pub_realisation
  on public.scheduled_publications (realisation_id);

-- Trigger updated_at
create or replace function public.touch_scheduled_pub()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sched_pub_touch on public.scheduled_publications;
create trigger trg_sched_pub_touch
  before update on public.scheduled_publications
  for each row execute function public.touch_scheduled_pub();

-- RLS : seulement utilisateurs authentifiés
alter table public.scheduled_publications enable row level security;

drop policy if exists "sched_pub_auth_select" on public.scheduled_publications;
create policy "sched_pub_auth_select"
  on public.scheduled_publications for select
  to authenticated
  using (true);

drop policy if exists "sched_pub_auth_insert" on public.scheduled_publications;
create policy "sched_pub_auth_insert"
  on public.scheduled_publications for insert
  to authenticated
  with check (true);

drop policy if exists "sched_pub_auth_update" on public.scheduled_publications;
create policy "sched_pub_auth_update"
  on public.scheduled_publications for update
  to authenticated
  using (true);

drop policy if exists "sched_pub_auth_delete" on public.scheduled_publications;
create policy "sched_pub_auth_delete"
  on public.scheduled_publications for delete
  to authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════════
-- CRON via pg_cron (planifier l'Edge Function toutes les 5 min)
-- ═══════════════════════════════════════════════════════════════
-- Tu peux activer pg_cron dans Supabase → Database → Extensions
-- Puis exécuter (en remplaçant <SERVICE_ROLE_KEY> par la clé service role) :
--
-- select cron.schedule(
--   'publish-scheduled-job',
--   '*/5 * * * *',
--   $$
--     select net.http_post(
--       url := 'https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/publish-scheduled',
--       headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>', 'content-type', 'application/json'),
--       body := '{}'::jsonb
--     );
--   $$
-- );
--
-- Pour arrêter : select cron.unschedule('publish-scheduled-job');
-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : "Success."
-- ═══════════════════════════════════════════════════════════════
