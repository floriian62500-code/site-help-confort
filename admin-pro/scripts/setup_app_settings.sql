-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Table de configuration des APIs externes
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Table app_settings : stocke les clés API et configurations
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz default now(),
  updated_by text
);

-- Trigger updated_at
create or replace function public.touch_app_settings()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_settings_touch on public.app_settings;
create trigger trg_app_settings_touch
  before update on public.app_settings
  for each row execute function public.touch_app_settings();

-- RLS : lecture/écriture seulement par les utilisateurs authentifiés
alter table public.app_settings enable row level security;

drop policy if exists "app_settings_auth_select" on public.app_settings;
create policy "app_settings_auth_select"
  on public.app_settings for select
  to authenticated
  using (true);

drop policy if exists "app_settings_auth_insert" on public.app_settings;
create policy "app_settings_auth_insert"
  on public.app_settings for insert
  to authenticated
  with check (true);

drop policy if exists "app_settings_auth_update" on public.app_settings;
create policy "app_settings_auth_update"
  on public.app_settings for update
  to authenticated
  using (true);

drop policy if exists "app_settings_auth_delete" on public.app_settings;
create policy "app_settings_auth_delete"
  on public.app_settings for delete
  to authenticated
  using (true);

-- Seed des clés attendues (vides, à remplir via la page Paramètres)
insert into public.app_settings (key, description) values
  ('anthropic',     'Clé API Anthropic Claude (génération IA)'),
  ('meta',          'Token Page Access + Page ID + Instagram Business Account ID'),
  ('linkedin',      'Token LinkedIn + Organization ID'),
  ('gbp',           'Google Business Profile : token + account/location ID'),
  ('ga4',           'Google Analytics 4 : Property ID + Service Account JSON'),
  ('crm',           'Connecteur CRM (à définir)'),
  ('company',       'Infos société (raison sociale, SIRET, etc.)')
on conflict (key) do nothing;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : "Success. Rows: 7"
-- ═══════════════════════════════════════════════════════════════
