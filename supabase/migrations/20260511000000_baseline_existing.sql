-- ═════════════════════════════════════════════════════════════════════
-- BASELINE : tables existantes dans la base avant l'automatisation
-- Combine setup_app_settings + setup_leads + setup_reviews + setup_scheduled_publications
-- Idempotent : toutes les commandes utilisent CREATE IF NOT EXISTS, ON CONFLICT
-- ═════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Table de configuration des APIs externes
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

-- ── setup_leads.sql ─────────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Système de capture des leads (formulaires site)
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,

  -- Identité
  nom text not null,
  email text,
  telephone text,

  -- Localisation
  ville text,
  code_postal text,
  adresse text,

  -- Demande
  metier text,
  type_demande text default 'devis',  -- devis, urgence, info, rappel
  message text,
  budget text,

  -- Source / contexte
  source text default 'formulaire_site',  -- formulaire_site, telephone, ai_chat, autre
  source_page text,                       -- URL d'où vient le lead
  source_referer text,                    -- referer HTTP
  utm jsonb default '{}'::jsonb,          -- utm_source, utm_medium, utm_campaign

  -- Workflow
  status text not null default 'nouveau',  -- nouveau, en_cours, qualifie, devis_envoye, gagne, perdu, archive
  assigned_to text,                       -- email user qui suit
  priority text default 'normale',        -- urgente, haute, normale, basse
  tags jsonb default '[]'::jsonb,

  -- Suivi
  notes_internes text,
  last_contact_at timestamptz,
  next_action_at timestamptz,
  next_action_desc text,

  -- Conversion
  realisation_id uuid references public.realisations(id) on delete set null,  -- si converti en chantier
  estimated_value numeric,
  closed_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour recherches courantes
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_metier on public.leads(metier);
create index if not exists idx_leads_ville on public.leads(ville);

-- Trigger updated_at
create or replace function public.touch_leads()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_touch on public.leads;
create trigger trg_leads_touch
  before update on public.leads
  for each row execute function public.touch_leads();

-- RLS
alter table public.leads enable row level security;

-- Lecture / modification : admins authentifiés
drop policy if exists "leads_auth_all" on public.leads;
create policy "leads_auth_all"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);

-- Insertion publique (formulaires du site public)
-- Le site public peut créer des leads avec la clé anon
drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
  on public.leads for insert
  to anon
  with check (status = 'nouveau' and assigned_to is null);

-- ═══════════════════════════════════════════════════════════════
-- Résultat : "Success. No rows returned"
-- Vérifier dans Table Editor que la table 'leads' existe
-- ═══════════════════════════════════════════════════════════════

-- ── setup_reviews.sql ───────────────────────────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Table des avis clients (synchronisation GBP + FB)
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,

  -- Source
  source text not null,                       -- google, facebook, trustpilot, manual
  source_id text,                             -- ID unique côté plateforme (évite doublons)
  source_url text,                            -- lien direct vers l'avis

  -- Localisation (quel établissement)
  agence text,                                -- depan-audo, depan-dk
  location_id text,                           -- ID GBP location

  -- Auteur
  author_name text not null,
  author_photo_url text,
  author_profile_url text,

  -- Avis
  rating numeric(2,1) not null,               -- 1.0 à 5.0
  comment text,
  language text default 'fr',
  posted_at timestamptz not null,

  -- Réponse propriétaire
  reply_text text,
  reply_posted_at timestamptz,
  reply_by text,                              -- email user qui a répondu

  -- Workflow
  status text default 'new',                  -- new, replied, ignored, flagged, archive
  priority text default 'normale',            -- urgente (négatif), haute (3 étoiles), normale (4-5)
  tags jsonb default '[]'::jsonb,
  notes_internes text,

  -- Timestamps
  synced_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (source, source_id)
);

create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_posted_at on public.reviews(posted_at desc);
create index if not exists idx_reviews_source on public.reviews(source);

-- Trigger updated_at + priority auto selon rating
create or replace function public.touch_reviews()
returns trigger as $$
begin
  new.updated_at = now();
  if new.rating <= 2 then new.priority = 'urgente';
  elsif new.rating = 3 then new.priority = 'haute';
  else new.priority = 'normale';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reviews_touch on public.reviews;
create trigger trg_reviews_touch
  before insert or update on public.reviews
  for each row execute function public.touch_reviews();

-- RLS : admins seulement
alter table public.reviews enable row level security;

drop policy if exists "reviews_auth_all" on public.reviews;
create policy "reviews_auth_all"
  on public.reviews for all
  to authenticated
  using (true)
  with check (true);

-- Lecture publique seulement des avis non flag/archive (pour afficher sur le site)
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
  on public.reviews for select
  to anon
  using (status not in ('flagged','archive'));

-- ═══════════════════════════════════════════════════════════════
-- Résultat : "Success. No rows returned"
-- ═══════════════════════════════════════════════════════════════

-- ── setup_scheduled_publications.sql ───────────────────────────────
-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Planification de publications
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
