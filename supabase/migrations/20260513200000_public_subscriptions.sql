-- ═══════════════════════════════════════════════════════════════════════════
-- HELP! Confort — Accepter les souscriptions de contrat depuis le site public
-- ═══════════════════════════════════════════════════════════════════════════
-- Quand un client clique "Souscrire" sur /contrats-entretien.html :
--  1. INSERT dans contracts avec status='prospect' (anon autorisé via RLS)
--  2. L'app appelle l'Edge Function notify-subscription qui envoie un email
--  3. Florian voit la souscription dans /admin-pro/contracts.html (filtre Prospects)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions de la table contracts pour le contexte de souscription ──────
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS subscription_source text DEFAULT 'admin'
    CHECK (subscription_source IN ('admin','public_form','phone','import')),
  ADD COLUMN IF NOT EXISTS agence text,                 -- 'saint-omer' ou 'dunkerque'
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
  -- metadata stocke : energie (gaz/fioul/eau), formule_slug, marque, modele,
  -- annee_installation, dernier_entretien, type_logement, statut_logement,
  -- date_debut_souhaitee, commentaire, prix_label, cgv_accepted_at

CREATE INDEX IF NOT EXISTS idx_contracts_source ON public.contracts(subscription_source);
CREATE INDEX IF NOT EXISTS idx_contracts_agence ON public.contracts(agence);

-- ── RLS : autoriser INSERT anonyme uniquement avec status='prospect' ────────
-- (les autres status restent réservés aux utilisateurs authentifiés)
DROP POLICY IF EXISTS contracts_public_subscribe ON public.contracts;
CREATE POLICY contracts_public_subscribe ON public.contracts
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'prospect'
    AND subscription_source = 'public_form'
    AND client_last_name IS NOT NULL
    AND client_phone IS NOT NULL
  );

-- ── Settings : adresse email destinataire (Florian peut changer côté admin) ─
INSERT INTO public.app_settings (key, value)
VALUES ('notification_emails', jsonb_build_object(
  'subscriptions_to', 'florian.dhaillecourt@helpconfort.com',
  'orders_to',        'florian.dhaillecourt@helpconfort.com',
  'leads_to',         'florian.dhaillecourt@helpconfort.com',
  'reply_to',         'saint-omer@helpconfort.com',
  'from_name',        'HELP! Confort — Site',
  'from_email',       'noreply@helpconfort-saintomer.fr',
  'agences', jsonb_build_object(
    'saint-omer', jsonb_build_object('email','saint-omer@helpconfort.com','phone','03 66 10 01 34','postal_codes','62500,62219,62570,62960,62575'),
    'dunkerque',  jsonb_build_object('email','dunkerque@helpconfort.com','phone','03 66 10 01 34','postal_codes','59140,59210,59380,59279,59123')
  )
))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── Vue helper : prospects récents (pour widget dashboard) ──────────────────
CREATE OR REPLACE VIEW public.v_recent_prospects AS
SELECT
  c.id,
  c.created_at,
  c.client_first_name,
  c.client_last_name,
  c.client_phone,
  c.client_email,
  c.client_city,
  c.client_postal_code,
  c.type,
  c.metadata->>'energie' AS energie,
  c.metadata->>'prix_label' AS prix_label,
  c.monthly_amount,
  c.agence,
  c.subscription_source
FROM public.contracts c
WHERE c.status = 'prospect'
  AND c.subscription_source = 'public_form'
ORDER BY c.created_at DESC;

GRANT SELECT ON public.v_recent_prospects TO authenticated;

-- ── Vérif ──────────────────────────────────────────────────────────────────
SELECT
  'Contracts table OK' AS check_name,
  (SELECT count(*) FROM information_schema.columns
   WHERE table_name='contracts' AND column_name IN ('subscription_source','agence','metadata')) AS new_columns;
