-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Setup Contrats & Interventions
-- ═══════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor APRÈS setup_user_profiles.sql
-- (car les policies utilisent public.current_role())
-- ═══════════════════════════════════════════════════════════════

-- ─── TABLE contracts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client
  client_first_name      text,
  client_last_name       text NOT NULL,
  client_phone           text,
  client_email           text,
  client_address         text,
  client_postal_code     text,
  client_city            text,

  -- Contrat
  contract_number        text,          -- numéro interne (généré ou saisi)
  type                   text NOT NULL CHECK (type IN ('basic','confort','securite','custom')),
  metier                 text NOT NULL DEFAULT 'chauffage',  -- chauffage|plomberie|multiservice...
  monthly_amount         numeric(8,2) NOT NULL DEFAULT 0,
  payment_method         text CHECK (payment_method IN ('sepa','cb','cheque','especes','virement') OR payment_method IS NULL),
  payment_day            int CHECK (payment_day BETWEEN 1 AND 31),  -- jour du mois de prélèvement

  start_date             date NOT NULL DEFAULT CURRENT_DATE,
  end_date               date,           -- null = sans fin
  next_intervention_date date,           -- prochain entretien programmé

  status                 text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled','prospect')),
  notes                  text,

  created_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_status        ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_next_date     ON public.contracts(next_intervention_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_contracts_last_name     ON public.contracts(client_last_name);

CREATE OR REPLACE FUNCTION public.tg_contracts_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contracts_updated_at ON public.contracts;
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.tg_contracts_updated_at();

-- ─── TABLE interventions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interventions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liens optionnels
  contract_id         uuid REFERENCES public.contracts(id)    ON DELETE SET NULL,
  lead_id             bigint REFERENCES public.leads(id)      ON DELETE SET NULL,
  realisation_id      uuid REFERENCES public.realisations(id) ON DELETE SET NULL,

  -- Client (peut être autonome, sans contrat)
  client_first_name   text,
  client_last_name    text NOT NULL,
  client_phone        text,
  client_email        text,
  client_address      text,
  client_postal_code  text,
  client_city         text,

  -- Planification
  scheduled_at        timestamptz NOT NULL,
  duration_minutes    int NOT NULL DEFAULT 60,
  type                text NOT NULL CHECK (type IN ('entretien','depannage','devis','chantier','installation')),
  metier              text NOT NULL DEFAULT 'multiservice',
  technician          text,                -- nom libre (plus tard : FK users)
  is_urgent           boolean NOT NULL DEFAULT false,

  status              text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','in_progress','done','cancelled','no_show')),
  notes               text,
  internal_notes      text,                -- visible équipe seulement, pas le client

  created_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interventions_scheduled ON public.interventions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interventions_status    ON public.interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_contract  ON public.interventions(contract_id);
CREATE INDEX IF NOT EXISTS idx_interventions_metier    ON public.interventions(metier);

CREATE OR REPLACE FUNCTION public.tg_interventions_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interventions_updated_at ON public.interventions;
CREATE TRIGGER interventions_updated_at BEFORE UPDATE ON public.interventions
  FOR EACH ROW EXECUTE FUNCTION public.tg_interventions_updated_at();

-- ─── Auto : mettre à jour next_intervention_date sur le contrat
-- quand une intervention liée passe en 'done'
CREATE OR REPLACE FUNCTION public.update_contract_next_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_id IS NOT NULL AND NEW.status = 'done' AND NEW.type = 'entretien' THEN
    -- Avance la prochaine date de 12 mois (entretien annuel typique)
    UPDATE public.contracts
       SET next_intervention_date = (NEW.scheduled_at::date + interval '12 months')::date
     WHERE id = NEW.contract_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interventions_after_done ON public.interventions;
CREATE TRIGGER interventions_after_done
  AFTER UPDATE OF status ON public.interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_contract_next_date();

-- ─── RLS contracts ───────────────────────────────────────────────
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contracts_read ON public.contracts;
CREATE POLICY contracts_read ON public.contracts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS contracts_insert ON public.contracts;
CREATE POLICY contracts_insert ON public.contracts
  FOR INSERT TO authenticated
  WITH CHECK (public.current_role() IN ('owner','assistant'));

DROP POLICY IF EXISTS contracts_update ON public.contracts;
CREATE POLICY contracts_update ON public.contracts
  FOR UPDATE TO authenticated
  USING (public.current_role() IN ('owner','assistant'))
  WITH CHECK (public.current_role() IN ('owner','assistant'));

DROP POLICY IF EXISTS contracts_delete ON public.contracts;
CREATE POLICY contracts_delete ON public.contracts
  FOR DELETE TO authenticated
  USING (public.current_role() = 'owner');

-- ─── RLS interventions ───────────────────────────────────────────
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS interventions_read ON public.interventions;
CREATE POLICY interventions_read ON public.interventions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS interventions_insert ON public.interventions;
CREATE POLICY interventions_insert ON public.interventions
  FOR INSERT TO authenticated
  WITH CHECK (public.current_role() IN ('owner','assistant'));

DROP POLICY IF EXISTS interventions_update ON public.interventions;
CREATE POLICY interventions_update ON public.interventions
  FOR UPDATE TO authenticated
  USING (public.current_role() IN ('owner','assistant'))
  WITH CHECK (public.current_role() IN ('owner','assistant'));

DROP POLICY IF EXISTS interventions_delete ON public.interventions;
CREATE POLICY interventions_delete ON public.interventions
  FOR DELETE TO authenticated
  USING (public.current_role() = 'owner');

-- ─── Vue helper : interventions du jour avec infos client ────────
CREATE OR REPLACE VIEW public.v_interventions_today AS
SELECT
  i.*,
  c.contract_number,
  c.type AS contract_type,
  c.monthly_amount
FROM public.interventions i
LEFT JOIN public.contracts c ON c.id = i.contract_id
WHERE i.scheduled_at::date = CURRENT_DATE
ORDER BY i.scheduled_at;

GRANT SELECT ON public.v_interventions_today TO authenticated;

SELECT 'Setup contracts + interventions OK' AS info;
