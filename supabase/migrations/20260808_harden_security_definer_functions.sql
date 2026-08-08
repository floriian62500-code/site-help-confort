-- Durcissement des fonctions SECURITY DEFINER exposées via PUBLIC (anon/authenticated).
-- Appliqué en prod le 2026-08-08. service_role conserve son grant EXPLICIT (non affecté par REVOKE FROM PUBLIC).
-- Analyse préalable : current_role() et is_owner() sont utilisées dans des policies RLS `authenticated`
-- (leads, realisations, app_settings, reviews, contracts, interventions, user_profiles) → authenticated RE-GRANTé.
-- Les autres (gen_lead_action_token, handle_new_user, ping_indexnow_on_publish, rls_auto_enable) n'ont
-- aucun appel navigateur légitime (appelées par service_role ou comme triggers).
-- Tests: anon RPC current_role/gen_lead_action_token → 401 permission denied (après) ;
--        chaîne lead→notify(jetons)→lead-action→photos → OK (service_role préservé).

-- gen_lead_action_token : appelée uniquement par notify-lead-v6 (service_role).
REVOKE EXECUTE ON FUNCTION public.gen_lead_action_token(uuid, text) FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.gen_lead_action_token(uuid, text) SET search_path = public, extensions; -- fix search_path mutable

-- Triggers / event-triggers : jamais appelés en RPC.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ping_indexnow_on_publish() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

-- Fonctions de policy RLS : retirer PUBLIC (donc anon), conserver authenticated.
REVOKE EXECUTE ON FUNCTION public.current_role() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_role() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_owner() TO authenticated;

-- ── ROLLBACK ────────────────────────────────────────────────────────────────
-- GRANT EXECUTE ON FUNCTION public.gen_lead_action_token(uuid, text) TO PUBLIC;
-- ALTER FUNCTION public.gen_lead_action_token(uuid, text) RESET search_path;
-- GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.ping_indexnow_on_publish() TO PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.current_role() TO PUBLIC;
-- GRANT EXECUTE ON FUNCTION public.is_owner() TO PUBLIC;
