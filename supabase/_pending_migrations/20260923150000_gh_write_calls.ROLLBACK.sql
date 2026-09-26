-- Retour arrière exact de 20260923150000_gh_write_calls.sql.
-- Après exécution, les fonctions durcies ne peuvent plus limiter le débit : ne pas l'appliquer
-- tant qu'une version durcie est déployée.
drop function if exists public.purge_gh_write_calls();
drop index if exists public.gh_write_calls_caller_date_idx;
drop table if exists public.gh_write_calls;
