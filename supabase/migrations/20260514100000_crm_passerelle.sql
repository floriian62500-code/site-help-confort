-- ═════════════════════════════════════════════════════════════════════
-- CRM PASSERELLE : flag d'import dans CRM externe + setting URL CRM
-- Florian gère interventions + contrats dans un CRM externe. Le back-office
-- HC sert de passerelle : capture les souscriptions du site → inbox →
-- import manuel/auto dans le CRM. Cette migration ajoute :
--   - contracts.imported_to_crm_at : timestamp d'import (NULL = à traiter)
--   - contracts.crm_external_id    : ID dans le CRM externe après import
--   - app_settings.crm             : { url, name }
-- ═════════════════════════════════════════════════════════════════════

-- 1. Colonnes contracts (idempotent)
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS imported_to_crm_at timestamptz,
  ADD COLUMN IF NOT EXISTS crm_external_id    text;

CREATE INDEX IF NOT EXISTS idx_contracts_imported_to_crm
  ON public.contracts (imported_to_crm_at);

COMMENT ON COLUMN public.contracts.imported_to_crm_at IS
  'Timestamp d''import dans le CRM externe. NULL = souscription non encore traitée.';
COMMENT ON COLUMN public.contracts.crm_external_id IS
  'ID du contrat dans le CRM externe après import (pour traçabilité).';

-- 2. Setting app_settings.crm (clé "crm" → { url, name })
INSERT INTO public.app_settings (key, value, updated_at)
VALUES ('crm', jsonb_build_object('url', '', 'name', ''), now())
ON CONFLICT (key) DO NOTHING;

-- 3. Vue helper : souscriptions à importer (inbox)
CREATE OR REPLACE VIEW public.v_subscriptions_inbox AS
SELECT
  id,
  client_first_name,
  client_last_name,
  client_email,
  client_phone,
  type,
  metier,
  monthly_amount,
  created_at,
  status,
  imported_to_crm_at,
  crm_external_id,
  EXTRACT(EPOCH FROM (now() - created_at))/3600 AS hours_since_created
FROM public.contracts
WHERE imported_to_crm_at IS NULL
ORDER BY created_at DESC;

GRANT SELECT ON public.v_subscriptions_inbox TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : "Success. No rows returned"
-- Pour marquer comme importé :
--   UPDATE contracts SET imported_to_crm_at = now(), crm_external_id = 'XXX' WHERE id = '...';
-- ═══════════════════════════════════════════════════════════════
