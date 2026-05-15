-- ═════════════════════════════════════════════════════════════════════
-- LEADS : ajout des colonnes photos + suivi paiement
-- ═════════════════════════════════════════════════════════════════════
-- Demande Florian : "les demandes clients doivent être beaucoup plus claire
-- manque photos, si c'est payé ou non etc"
--
-- On ajoute :
--   - photos        : jsonb [{ url, label, uploaded_at }]
--   - quote_sent_at : timestamptz (date envoi devis)
--   - quote_amount  : numeric (montant devis HT)
--   - deposit_paid_at : timestamptz (date paiement acompte)
--   - deposit_amount : numeric (montant acompte reçu)
--   - invoiced_at   : timestamptz (date facturation)
--   - invoice_amount : numeric (montant facturé TTC)
--   - intervention_date : date (date intervention si planifiée)
-- ═════════════════════════════════════════════════════════════════════

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS photos          jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quote_sent_at   timestamptz,
  ADD COLUMN IF NOT EXISTS quote_amount    numeric(10,2),
  ADD COLUMN IF NOT EXISTS deposit_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS deposit_amount  numeric(10,2),
  ADD COLUMN IF NOT EXISTS invoiced_at     timestamptz,
  ADD COLUMN IF NOT EXISTS invoice_amount  numeric(10,2),
  ADD COLUMN IF NOT EXISTS intervention_date date;

COMMENT ON COLUMN public.leads.photos IS
  'Photos uploadées par le client via le formulaire wizard (urgence ou devis). Format : [{url, label?, uploaded_at?}]';
COMMENT ON COLUMN public.leads.quote_sent_at IS 'Timestamp envoi du devis au client';
COMMENT ON COLUMN public.leads.quote_amount IS 'Montant du devis HT';
COMMENT ON COLUMN public.leads.deposit_paid_at IS 'Timestamp réception acompte';
COMMENT ON COLUMN public.leads.deposit_amount IS 'Montant de l''acompte reçu';
COMMENT ON COLUMN public.leads.invoiced_at IS 'Timestamp facturation finale';
COMMENT ON COLUMN public.leads.invoice_amount IS 'Montant total facturé TTC';
COMMENT ON COLUMN public.leads.intervention_date IS 'Date de l''intervention planifiée';

-- Index utiles pour les filtres futurs
CREATE INDEX IF NOT EXISTS idx_leads_payment_status
  ON public.leads (deposit_paid_at)
  WHERE deposit_paid_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_invoiced
  ON public.leads (invoiced_at)
  WHERE invoiced_at IS NOT NULL;
