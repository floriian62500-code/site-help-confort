-- ═════════════════════════════════════════════════════════════════════════════════════════
-- Montant canonique d'une intervention (prérequis du lien de paiement durci, 5778526407 §2.A)
-- ═════════════════════════════════════════════════════════════════════════════════════════
-- Aujourd'hui le montant d'un lien de paiement est tapé dans une boîte de dialogue du back-office et
-- envoyé tel quel à la fonction. Désormais il est ENREGISTRÉ sur l'intervention (tracé : qui, quand),
-- sous les règles d'accès existantes (interventions_update = personnel), et la fonction le RELIT.
--
-- ⚠️ NON APPLIQUÉE — écriture sur la base de production = décision de Florian. Idempotente.
-- Retour arrière : 20260922140000_interventions_montant.ROLLBACK.sql (supprime les 3 colonnes).
-- ═════════════════════════════════════════════════════════════════════════════════════════
BEGIN;
ALTER TABLE public.interventions ADD COLUMN IF NOT EXISTS montant_ttc numeric(10,2);
ALTER TABLE public.interventions ADD COLUMN IF NOT EXISTS montant_saisi_par uuid;
ALTER TABLE public.interventions ADD COLUMN IF NOT EXISTS montant_saisi_le timestamptz;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interventions_montant_ttc_bornes') THEN
    ALTER TABLE public.interventions ADD CONSTRAINT interventions_montant_ttc_bornes
      CHECK (montant_ttc IS NULL OR (montant_ttc > 0 AND montant_ttc <= 10000));
  END IF;
END $$;
COMMENT ON COLUMN public.interventions.montant_ttc IS 'Montant TTC à encaisser, saisi par le personnel ; seule source du lien de paiement (stripe-create-payment-link durci).';
COMMIT;
