-- PROPOSITION — NON APPLIQUÉE. Gate humain : base partagée avec la production.
-- Dossier volontairement hors de supabase/migrations/, qui est appliqué automatiquement.
--
-- P0-4 — `app_settings` est lisible par TOUT compte authentifié.
--
-- État constaté (source : supabase/migrations/20260512120000_user_profiles_roles.sql:153) :
--   CREATE POLICY app_settings_role_select ON public.app_settings
--     FOR SELECT TO authenticated USING (true);
--
-- Or cette table porte la configuration des API : clé secrète Stripe, clé Anthropic, client_secret
-- et refresh_token Google, jetons Meta. L'écriture est bien réservée aux owners ; la LECTURE ne
-- l'est pas. Le rôle le plus faible du système ouvre donc le coffre entier.
--
-- Vérifié le 2026-09-26 avec la clé publiable du site : HTTP 200 mais tableau VIDE — l'anonyme ne
-- lit rien, c'est déjà ça. Le risque porte sur les comptes AUTHENTIFIÉS. Il se combine avec
-- l'inscription ouverte : créer un compte suffit alors pour lire les secrets. Fermer l'inscription
-- (gate P0 déjà listé) réduit l'exposition sans corriger la politique ; les deux sont nécessaires.
--
-- Correctif minimal : la lecture suit la même règle que l'écriture — les owners.
-- Rien d'autre n'est touché : ni les colonnes, ni les données, ni les autres politiques.

do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'app_settings') then
    -- La politique de lecture actuelle, ouverte à tout compte authentifié.
    execute 'drop policy if exists app_settings_role_select on public.app_settings';
    -- La remplaçante : même portée que l'écriture, qui utilise déjà public.is_owner().
    execute 'create policy app_settings_owner_select on public.app_settings
             for select to authenticated using (public.is_owner())';
  end if;
end $$;

-- ── AVANT D'APPLIQUER, vérifier ce qui lit cette table avec un JWT d'utilisateur :
--   · les pages de `admin-pro/` (setup, settings, ai, wizards…) sont utilisées par un owner :
--     elles continueront de fonctionner ;
--   · les fonctions edge lisent avec la clé service_role, qui ignore la RLS : aucun impact ;
--   · un compte `viewer` ou `assistant` qui ouvrirait une page de configuration verra une liste
--     vide au lieu des secrets. C'est le comportement voulu.
--
-- ── RETOUR ARRIÈRE (exact) :
--   drop policy if exists app_settings_owner_select on public.app_settings;
--   create policy app_settings_role_select on public.app_settings
--     for select to authenticated using (true);
--
-- ── INTERRUPTION DE SERVICE : aucune. Une politique se remplace sans verrou long ni migration
--    de données. Le site public n'appelle pas cette table avec un JWT utilisateur.
