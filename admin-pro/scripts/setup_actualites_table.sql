-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Table public.actualites
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════
--
-- Cette table reçoit les ACTUALITÉS (communications, vœux, marketing,
-- contenu pédagogique) — différentes des CHANTIERS (table realisations
-- qui stocke les vraies interventions techniques avec avant/après).
--
-- Alimentée par :
--   - Import FB automatique (edge function sync-facebook-posts)
--     pour les posts détectés comme "actualité" (vœux, fêtes, recrutement…)
--   - Création manuelle via /admin-pro/actualites.html (à créer)
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.actualites (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  content         text,                          -- contenu complet (peut être markdown)
  excerpt         text,                          -- résumé court (~200c)
  categorie       text default 'Conseils',       -- Conseils, Agence, Sécurité, Économies, Réglementation, Saisonnier
  zone            text default 'Saint-Omer',     -- Saint-Omer, Dunkerque, Les deux
  image_url       text,                          -- URL image principale
  source_facebook text,                          -- URL post FB d'origine (si import auto)
  status          text not null default 'brouillon',  -- brouillon | validation | publie
  published       boolean not null default false,
  published_at    timestamptz,
  pinned          boolean default false,         -- épinglé en haut
  views           int default 0,
  reactions       int default 0,
  shares          int default 0,
  ai_generated    jsonb default '{}'::jsonb,     -- traces génération IA (titre, meta, FAQ)
  metadata        jsonb default '{}'::jsonb,     -- libre (campagne, tags, etc.)
  created_by      text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Index pour requêtes fréquentes (filtrage par statut + date)
create index if not exists idx_actualites_status_pub on public.actualites (status, published_at desc);
create index if not exists idx_actualites_categorie  on public.actualites (categorie);
create index if not exists idx_actualites_zone       on public.actualites (zone);
create index if not exists idx_actualites_source_fb  on public.actualites (source_facebook) where source_facebook is not null;

-- Trigger updated_at
create or replace function public.touch_actualites()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_actualites_touch on public.actualites;
create trigger trg_actualites_touch
  before update on public.actualites
  for each row execute function public.touch_actualites();

-- ═══════════════════════════════════════════════════════════════
-- RLS — Row Level Security
-- ═══════════════════════════════════════════════════════════════
alter table public.actualites enable row level security;

-- 1) Lecture publique : seulement les actualités status='publie' + published=true
drop policy if exists "actu_public_select" on public.actualites;
create policy "actu_public_select"
  on public.actualites
  for select
  to anon, authenticated
  using (status = 'publie' and published = true);

-- 2) Lecture admin (authentifiés) : tout, peu importe le statut
drop policy if exists "actu_admin_select_all" on public.actualites;
create policy "actu_admin_select_all"
  on public.actualites
  for select
  to authenticated
  using (true);

-- 3) Insert/Update/Delete : seulement utilisateurs authentifiés (admin-pro)
drop policy if exists "actu_admin_insert" on public.actualites;
create policy "actu_admin_insert"
  on public.actualites
  for insert
  to authenticated
  with check (true);

drop policy if exists "actu_admin_update" on public.actualites;
create policy "actu_admin_update"
  on public.actualites
  for update
  to authenticated
  using (true);

drop policy if exists "actu_admin_delete" on public.actualites;
create policy "actu_admin_delete"
  on public.actualites
  for delete
  to authenticated
  using (true);

-- ═══════════════════════════════════════════════════════════════
-- Vue publique (pratique pour le widget vitrine)
-- ═══════════════════════════════════════════════════════════════
create or replace view public.v_actualites_public as
select
  id,
  title,
  slug,
  excerpt,
  categorie,
  zone,
  image_url,
  source_facebook,
  pinned,
  views,
  reactions,
  shares,
  published_at,
  created_at
from public.actualites
where status = 'publie' and published = true
order by pinned desc, coalesce(published_at, created_at) desc;

grant select on public.v_actualites_public to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Données de migration : importer les actualités legacy
-- depuis realisations (qui ont été mal catégorisées comme chantiers).
-- Décommenter et exécuter SI vous voulez déplacer automatiquement.
-- ═══════════════════════════════════════════════════════════════
-- insert into public.actualites (title, slug, content, excerpt, categorie, zone, image_url, source_facebook, status, published, published_at, created_by, created_at)
-- select
--   r.title,
--   r.slug,
--   r.description_long,
--   left(coalesce(r.description, r.description_long), 200),
--   case
--     when lower(r.title) like '%vœux%' or lower(r.title) like '%voeux%' or lower(r.title) like '%fêtes%' then 'Agence'
--     when lower(r.title) like 'votre %' or lower(r.title) like 'envie %' then 'Conseils'
--     when lower(r.title) like 'pourquoi %' then 'Conseils'
--     else 'Conseils'
--   end,
--   r.ville,
--   r.image_after,
--   (r.ai_generated->>'source_fb'),
--   'publie',
--   true,
--   coalesce(r.published_at, r.created_at),
--   'migration_legacy',
--   r.created_at
-- from public.realisations r
-- where r.status = 'publie'
--   and (
--     lower(r.title) like 'votre %'
--     or lower(r.title) like 'envie %'
--     or lower(r.title) like 'pourquoi %'
--     or lower(r.title) like 'en plein %'
--     or lower(r.title) like '%vœux%'
--     or lower(r.title) like '%voeux%'
--   )
-- on conflict (slug) do nothing;
--
-- -- Puis supprimer les originaux dans realisations (ou les passer en status='archive')
-- update public.realisations
-- set status = 'archive'
-- where status = 'publie'
--   and (
--     lower(title) like 'votre %'
--     or lower(title) like 'envie %'
--     or lower(title) like 'pourquoi %'
--     or lower(title) like 'en plein %'
--     or lower(title) like '%vœux%'
--     or lower(title) like '%voeux%'
--   );

-- ═══════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ═══════════════════════════════════════════════════════════════
select 'Table actualites créée — ' || count(*) || ' ligne(s)' as message
from public.actualites;

select 'Vue v_actualites_public créée — ' || count(*) || ' ligne(s) publiques' as message
from public.v_actualites_public;
