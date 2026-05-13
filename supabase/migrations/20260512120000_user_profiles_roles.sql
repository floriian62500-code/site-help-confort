-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Setup user_profiles (rôles & permissions)
-- ═══════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor (1 seule fois)
-- Crée :
--   1. Table user_profiles (extension de auth.users avec full_name, role, etc.)
--   2. RLS policies (lecture pour tous les authentifiés, écriture owner only)
--   3. Helper function public.is_owner() utilisée par d'autres tables
--   4. Trigger qui crée auto un profil à chaque nouvelle inscription
--   5. Backfill des users existants (Florian = owner, les autres = assistant)
-- ═══════════════════════════════════════════════════════════════

-- 1) TABLE user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        text NOT NULL DEFAULT 'assistant' CHECK (role IN ('owner', 'assistant', 'viewer')),
  is_active   boolean NOT NULL DEFAULT true,
  invited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 2) Trigger updated_at
CREATE OR REPLACE FUNCTION public.tg_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_user_profiles_updated_at();

-- 3) Helper : current user is owner ?
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
  );
$$;

-- Helper : current user role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles
     WHERE user_id = auth.uid() AND is_active = true),
    'viewer'
  );
$$;

-- 4) RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_select_all ON public.user_profiles;
CREATE POLICY user_profiles_select_all ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_profiles_update_owner ON public.user_profiles;
CREATE POLICY user_profiles_update_owner ON public.user_profiles
  FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS user_profiles_insert_owner ON public.user_profiles;
CREATE POLICY user_profiles_insert_owner ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS user_profiles_delete_owner ON public.user_profiles;
CREATE POLICY user_profiles_delete_owner ON public.user_profiles
  FOR DELETE TO authenticated USING (public.is_owner());

-- 5) Trigger auto-création de profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'assistant')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6) Backfill des users existants
INSERT INTO public.user_profiles (user_id, full_name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  CASE
    WHEN u.email = 'florian.dhaillecourt@helpconfort.com' THEN 'owner'
    WHEN u.email LIKE '%@helpconfort.com' THEN 'assistant'
    ELSE 'assistant'
  END
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 7) Sécurité : garantir qu'au moins Florian est owner
UPDATE public.user_profiles
SET role = 'owner', is_active = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'florian.dhaillecourt@helpconfort.com'
)
AND role != 'owner';

-- ═══════════════════════════════════════════════════════════════
-- POLICIES RÔLES POUR LES TABLES MÉTIER
-- ═══════════════════════════════════════════════════════════════
-- Stratégie :
--   - owner & assistant : read+write sur les tables métier
--   - viewer            : read only
-- ═══════════════════════════════════════════════════════════════

-- realisations : assistants peuvent écrire, viewer lecture seule
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='realisations') THEN
    EXECUTE 'ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_select ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_select ON public.realisations FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_write ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_write ON public.realisations FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_update ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_update ON public.realisations FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant'')) WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_delete ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_delete ON public.realisations FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- app_settings : SEULS LES OWNERS peuvent modifier (config sensible)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='app_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS app_settings_role_select ON public.app_settings';
    EXECUTE 'CREATE POLICY app_settings_role_select ON public.app_settings FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS app_settings_role_write ON public.app_settings';
    EXECUTE 'CREATE POLICY app_settings_role_write ON public.app_settings FOR ALL TO authenticated USING (public.current_role() = ''owner'') WITH CHECK (public.current_role() = ''owner'')';
  END IF;
END $$;

-- leads : owner + assistant peuvent tout, viewer lecture seule
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='leads') THEN
    EXECUTE 'DROP POLICY IF EXISTS leads_role_write ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_write ON public.leads FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS leads_role_update ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_update ON public.leads FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS leads_role_delete ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_delete ON public.leads FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- reviews : idem
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='reviews') THEN
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_write ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_write ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_update ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_update ON public.reviews FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_delete ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_delete ON public.reviews FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Vérifications
-- ═══════════════════════════════════════════════════════════════
SELECT 'Setup terminé. Users :' AS info;
SELECT
  up.user_id, up.full_name, up.role, up.is_active, u.email, u.last_sign_in_at
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.user_id
ORDER BY up.created_at ASC;
