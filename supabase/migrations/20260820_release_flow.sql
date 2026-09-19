-- P0 #8 — Flux release recette → prod (lots immuables). NON APPLIQUÉE sans GO humain.
-- Aucune donnée prod touchée ; tables de traçabilité des lots de release.

create table if not exists release_lots (
  release_id   text primary key,
  base_sha     text not null,               -- SHA prod/main de référence
  head_sha     text not null,               -- SHA recette validé
  status       text not null default 'A_TESTER'
               check (status in ('A_TESTER','VALIDE_RECETTE','PRET_PROD','DEPLOYE_PROD','BLOQUE')),
  created_at   timestamptz not null default now(),
  created_by   text,
  deployed_sha text,
  deployed_at  timestamptz,
  proofs       jsonb,
  note         text
);

create table if not exists release_commits (
  release_id text references release_lots(release_id) on delete cascade,
  sha        text not null,
  subject    text,
  files      jsonb,
  primary key (release_id, sha)
);

create table if not exists release_items (
  release_id text references release_lots(release_id) on delete cascade,
  mod_id     text not null,
  version    text not null,
  status     text not null default 'A_TESTER'
             check (status in ('A_TESTER','VALIDE','A_REVALIDER')),
  primary key (release_id, mod_id)
);

create table if not exists promotion_requests (
  id           bigserial primary key,
  release_id   text references release_lots(release_id),
  base_sha     text,
  head_sha     text,
  commits      jsonb,
  requested_at timestamptz default now(),
  requested_by text,
  test_proofs  jsonb,
  decision     text default 'PENDING' check (decision in ('PENDING','APPROVED','REJECTED','DEPLOYED'))
);

-- RLS : lecture publique (anon) du STATUT des lots pour le centre ; écriture réservée (service_role).
alter table release_lots enable row level security;
alter table release_items enable row level security;
create policy release_lots_read on release_lots for select using (true);
create policy release_items_read on release_items for select using (true);
-- promotion_requests : pas de lecture anon (contient des détails de commits).
alter table promotion_requests enable row level security;
