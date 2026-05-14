-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — FIX RLS contracts (insert anonyme public_form)
-- ═══════════════════════════════════════════════════════════════
--
-- ERREUR ACTUELLE :
--   "new row violates row-level security policy for table 'contracts'"
--
-- CAUSE :
--   La table contracts a RLS activé mais aucune policy n'autorise
--   les INSERT depuis le rôle "anon" (= utilisateurs non connectés
--   qui remplissent le formulaire public).
--
-- FIX :
--   Autoriser INSERT anon UNIQUEMENT pour :
--     - status = 'prospect' (donc des nouvelles demandes, jamais des contrats actifs)
--     - subscription_source IN ('public_form', 'leadgate_prestations')
--   (= les sources légitimes des formulaires publics du site)
--
-- À EXÉCUTER UNE FOIS dans Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

-- 1) S'assurer que RLS est bien activé sur contracts (au cas où)
alter table public.contracts enable row level security;

-- 2) Supprimer l'ancienne policy si elle existe (re-exécutable)
drop policy if exists "contracts_anon_insert_prospect"   on public.contracts;
drop policy if exists "contracts_anon_insert_publicform" on public.contracts;

-- 3) Créer la policy d'INSERT anonyme limité aux demandes publiques
create policy "contracts_anon_insert_publicform"
  on public.contracts
  for insert
  to anon
  with check (
    status = 'prospect'
    and subscription_source in ('public_form', 'leadgate_prestations')
  );

-- 4) (Bonus) Permettre aussi aux utilisateurs authentifiés via leur dashboard d'insert
drop policy if exists "contracts_auth_insert_all" on public.contracts;
create policy "contracts_auth_insert_all"
  on public.contracts
  for insert
  to authenticated
  with check (true);

-- 5) Lecture admin (full access pour les utilisateurs authentifiés — dashboard /admin-pro/contracts.html)
drop policy if exists "contracts_auth_select_all" on public.contracts;
create policy "contracts_auth_select_all"
  on public.contracts
  for select
  to authenticated
  using (true);

drop policy if exists "contracts_auth_update_all" on public.contracts;
create policy "contracts_auth_update_all"
  on public.contracts
  for update
  to authenticated
  using (true);

drop policy if exists "contracts_auth_delete_all" on public.contracts;
create policy "contracts_auth_delete_all"
  on public.contracts
  for delete
  to authenticated
  using (true);

-- 6) Vérification
select 'Policies sur contracts :' as info;
select polname as policy_name, polcmd as command, polroles::regrole[] as roles
from pg_policy
where polrelid = 'public.contracts'::regclass
order by polname;
