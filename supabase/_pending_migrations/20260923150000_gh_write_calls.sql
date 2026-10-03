-- Journal d'appels des fonctions d'écriture GitHub durcies (directive 5778526407 §2.B,
-- précisée par 5795806773 §3B). PRÉREQUIS de gh-push-inline/HARDENED_index.ts et
-- gh-edit-file/HARDENED_index.ts. NON APPLIQUÉE : une migration est une décision humaine.
--
-- Sert à deux choses : limiter le débit par appelant, et garder une trace d'audit.
-- Aucune donnée personnelle : l'identifiant du compte, la cible, rien d'autre.
-- Rejouable : tout est IF NOT EXISTS. Retour arrière exact dans le fichier .ROLLBACK.sql.

create table if not exists public.gh_write_calls (
  id          bigint generated always as identity primary key,
  caller      uuid        not null,
  owner_repo  text,
  branch      text,
  files       integer,
  commit_sha  text,
  created_at  timestamptz not null default now()
);

comment on table public.gh_write_calls is
  'Appels aux fonctions edge d''écriture GitHub : limitation de débit et piste d''audit. Sans donnée personnelle.';

-- Lecture de la fenêtre courante par appelant (limitation de débit).
create index if not exists gh_write_calls_caller_date_idx
  on public.gh_write_calls (caller, created_at desc);

-- Personne n'y touche depuis le navigateur : seules les fonctions edge écrivent,
-- en service_role, qui contourne RLS. RLS activée SANS politique = aucun accès anon/authenticated.
alter table public.gh_write_calls enable row level security;

-- Purge : au-delà de 90 jours, la trace n'a plus d'utilité.
create or replace function public.purge_gh_write_calls() returns void
language sql security definer set search_path = public as $$
  delete from public.gh_write_calls where created_at < now() - interval '90 days';
$$;

revoke all on function public.purge_gh_write_calls() from public, anon, authenticated;
