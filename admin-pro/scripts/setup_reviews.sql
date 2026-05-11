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
