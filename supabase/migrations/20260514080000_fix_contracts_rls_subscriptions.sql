-- ═══════════════════════════════════════════════════════════════════════════
-- HELP Confort — FIX RLS contracts pour autoriser souscriptions publiques
-- ═══════════════════════════════════════════════════════════════════════════
-- BUG : "new row violates row-level security policy for table contracts"
-- lors de soumission du wizard contrat-entretien depuis le site public.
--
-- CAUSE : la policy précédente était trop restrictive. Le check
-- subscription_source IN ('public_form') ne couvre pas les variantes
-- comme 'leadgate_prestations' (capture lead avant tarif).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. S'assurer que la colonne subscription_source accepte toutes les sources publiques
ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_subscription_source_check;

ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_subscription_source_check
  CHECK (subscription_source IN (
    'admin',
    'public_form',
    'leadgate_prestations',
    'phone',
    'import',
    'cron_fb_sync',
    'manual_fb_sync'
  ));

-- 2. S'assurer que RLS est bien activé sur contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 3. Recréer la policy d'insertion publique avec toutes les sources autorisées
DROP POLICY IF EXISTS contracts_public_subscribe ON public.contracts;
CREATE POLICY contracts_public_subscribe ON public.contracts
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'prospect'
    AND subscription_source IN ('public_form', 'leadgate_prestations')
    AND client_last_name IS NOT NULL
    AND length(client_last_name) > 0
    AND client_phone IS NOT NULL
    AND length(client_phone) >= 8
  );

-- 4. Aussi pour les utilisateurs authentifiés (admin)
DROP POLICY IF EXISTS contracts_authenticated_all ON public.contracts;
CREATE POLICY contracts_authenticated_all ON public.contracts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Vérifications finales
DO $$
DECLARE
  v_rls_enabled boolean;
  v_policy_count int;
BEGIN
  SELECT relrowsecurity INTO v_rls_enabled
    FROM pg_class WHERE relname = 'contracts';
  SELECT count(*) INTO v_policy_count
    FROM pg_policies WHERE tablename = 'contracts';
  RAISE NOTICE 'contracts RLS enabled : %', v_rls_enabled;
  RAISE NOTICE 'contracts policies count : %', v_policy_count;
END $$;
