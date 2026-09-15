-- ============================================================================
-- HC — bootstrap schéma MINIMAL pour E2E LOCAL isolé (voie A, `supabase start`).
-- À appliquer UNIQUEMENT sur le stack LOCAL (localhost:54321). JAMAIS sur PROD.
-- (Fichier volontairement HORS de supabase/migrations/ pour ne jamais partir en `db push`.)
-- Le schéma PROD est en partie hors-migrations (cf docs), d'où ce bootstrap dédié au test.
-- Fournit le strict nécessaire aux 6 parcours du tunnel + pipeline photos.
-- ============================================================================

-- 1) Table leads (colonnes utilisées par submit-lead-v6 + metadata pour upload_token/photos)
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  prenom        text,
  nom           text,
  email         text,
  telephone     text,
  adresse       text,
  code_postal   text,
  ville         text,
  metier        text,
  message       text,
  type_demande  text,
  form_type     text,
  source        text,
  source_page   text,
  realisation_id text,
  metadata      jsonb not null default '{}'::jsonb
);

-- 2) Catalogue : table prestations + vue publique v_services_public (lecture anon)
create table if not exists public.prestations (
  id          uuid primary key default gen_random_uuid(),
  active      boolean not null default true,
  position    int not null default 0,
  category    text,
  category_icon text,
  name        text not null,
  price_ttc   numeric,
  description text,
  image_url   text
);

create or replace view public.v_services_public as
  select id, category, category_icon, name, price_ttc, description, image_url, position, active
  from public.prestations where active = true;

-- Fixtures ANONYMES (aucune donnée réelle client)
insert into public.prestations (active,position,category,category_icon,name,price_ttc,description)
values
  (true,1,'Plomberie & Sanitaires','Wrench','TEST — Intervention plomberie 1h',114,'Fixture E2E locale — ne pas facturer'),
  (true,2,'Chauffage & Climatisation','Thermometer','TEST — Entretien chaudière',129,'Fixture E2E locale'),
  (true,3,'Électricité','Zap','TEST — Diagnostic électrique',89,'Fixture E2E locale')
on conflict do nothing;

-- 3) Storage : bucket privé lead-photos (comme prod), aucune lecture publique
insert into storage.buckets (id, name, public)
values ('lead-photos','lead-photos', false)
on conflict (id) do nothing;

-- 4) RLS : la vue catalogue est lisible en anon ; les leads ne sont écrits que par les
--    edge functions (service_role, bypass RLS). On active RLS + politiques minimales.
alter table public.leads enable row level security;
-- Pas de policy anon SELECT/INSERT sur leads : seul service_role (edge) écrit/lit. Fail-safe.
-- (Le front n'insère jamais en direct ; il passe par submit-lead-v6.)

-- Vue publique : accessible via l'API REST anon (les vues héritent des grants).
grant select on public.v_services_public to anon;
grant select on public.prestations to anon;

-- ============================================================================
-- Purge fixtures E2E (à lancer après les tests) :
--   delete from public.leads where source like '%e2e%' or message ilike '%NE PAS TRAITER%';
--   -- storage : supprimer les objets sous leads/<id>/ via l'API ou studio local.
-- ============================================================================
