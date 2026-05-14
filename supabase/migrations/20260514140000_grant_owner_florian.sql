-- ═════════════════════════════════════════════════════════════════════
-- Auto-grant rôle "owner" à florian.dhaillecourt@helpconfort.com
-- ═════════════════════════════════════════════════════════════════════
-- Idempotent : ne fait rien si le user n'existe pas dans auth.users
-- Idempotent : si le profile existe déjà, met juste à jour le rôle
-- ═════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Cherche le user_id de florian (créé via dashboard Supabase Auth)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'florian.dhaillecourt@helpconfort.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User florian.dhaillecourt@helpconfort.com non trouvé dans auth.users — créer le user dans Supabase Auth UI d''abord';
    RETURN;
  END IF;

  -- Upsert : crée OU met à jour le profile avec rôle owner
  INSERT INTO public.user_profiles (user_id, full_name, role, is_active)
  VALUES (v_user_id, 'Florian Dhaillecourt', 'owner', true)
  ON CONFLICT (user_id) DO UPDATE
    SET role      = 'owner',
        is_active = true,
        full_name = COALESCE(user_profiles.full_name, EXCLUDED.full_name),
        updated_at = now();

  RAISE NOTICE 'Florian Dhaillecourt promu owner (user_id=%)', v_user_id;
END $$;

-- Tant qu'on y est, on s'assure qu'admin@helpconfort.com a aussi le rôle
-- owner (legacy, au cas où il sert pour des scripts/automations)
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'admin@helpconfort.com'
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (user_id, full_name, role, is_active)
    VALUES (v_admin_id, 'Admin HELP! Confort', 'owner', true)
    ON CONFLICT (user_id) DO UPDATE
      SET role = 'owner', is_active = true;
  END IF;
END $$;

-- Vérification finale
SELECT
  u.email,
  p.role,
  p.full_name,
  p.is_active,
  p.created_at
FROM public.user_profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'owner'
ORDER BY p.created_at DESC;

-- ═══════════════════════════════════════════════════════════════
-- Après cette migration :
--   - florian.dhaillecourt@helpconfort.com peut se connecter et a
--     toutes les permissions admin
--   - admin@helpconfort.com reste en backup avec mêmes droits
-- ═══════════════════════════════════════════════════════════════
