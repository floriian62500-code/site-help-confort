-- Retour arrière de 20260922140000_interventions_montant.sql (à n'appliquer qu'après avoir redéployé
-- la version d'origine de stripe-create-payment-link, qui n'utilise pas ces colonnes).
BEGIN;
ALTER TABLE public.interventions DROP CONSTRAINT IF EXISTS interventions_montant_ttc_bornes;
ALTER TABLE public.interventions DROP COLUMN IF EXISTS montant_saisi_le;
ALTER TABLE public.interventions DROP COLUMN IF EXISTS montant_saisi_par;
ALTER TABLE public.interventions DROP COLUMN IF EXISTS montant_ttc;
COMMIT;
