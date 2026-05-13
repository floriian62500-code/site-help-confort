-- ═══════════════════════════════════════════════════════════════════════════
-- HELP! Confort — Table contract_offers
-- ═══════════════════════════════════════════════════════════════════════════
-- Stocke les offres de contrats d'entretien (BASIC/CONFORT/SÉCURITÉ × Gaz/Fioul/Adoucisseur)
-- qui étaient jusqu'ici codées en dur dans contrats-entretien.html.
--
-- La page publique fera désormais un fetch sur cette table → modifs en 2 secondes
-- depuis le back-office, sans toucher au HTML.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.contract_offers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  -- Catégorisation : gaz, fioul, adoucisseur, etc.
  energy         text NOT NULL CHECK (energy IN ('gaz','fioul','adoucisseur','autre')),
  energy_label   text NOT NULL,                                 -- "Gaz", "Fioul", "Adoucisseur d'eau"
  -- Tier : basic, confort, securite, custom
  tier           text NOT NULL CHECK (tier IN ('basic','confort','securite','custom')),
  tier_label     text NOT NULL,                                 -- "BASIC", "CONFORT", "SÉCURITÉ"
  -- Tarification mensuelle HT (l'annuel est calculé)
  price_ht_month numeric(6,2) NOT NULL,                         -- 9.00, 13.00…
  price_ht_year  numeric(7,2),                                  -- 108.00, 156.00… (optionnel, sinon = ×12)
  price_label    text,                                          -- "à partir de 8 €" pour le custom
  vat_rate       numeric(4,3) NOT NULL DEFAULT 0.100,            -- 10% particuliers, 20% pro
  -- Présentation
  baseline       text,                                          -- "L'essentiel pour rester en règle."
  badge          text,                                          -- "Le plus choisi", "Eau douce"
  features       jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Format de features : [{"text":"...", "included":true, "highlight":false}, ...]
  legal_note     text,                                          -- "Réservée aux chaudières < 5 ans"
  cta_label      text DEFAULT 'Souscrire',
  cta_action     text DEFAULT 'subscribe' CHECK (cta_action IN ('subscribe','quote')),
  -- Tri & visibilité
  position       int NOT NULL DEFAULT 0,
  is_recommended boolean NOT NULL DEFAULT false,                -- highlight visuel (carte "Confort")
  active         boolean NOT NULL DEFAULT true,
  -- Méta
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contract_offers_energy_idx   ON public.contract_offers(energy);
CREATE INDEX IF NOT EXISTS contract_offers_active_idx   ON public.contract_offers(active);
CREATE INDEX IF NOT EXISTS contract_offers_position_idx ON public.contract_offers(position);

DROP TRIGGER IF EXISTS contract_offers_touch ON public.contract_offers;
CREATE TRIGGER contract_offers_touch BEFORE UPDATE ON public.contract_offers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.contract_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contract_offers_public_read ON public.contract_offers;
CREATE POLICY contract_offers_public_read ON public.contract_offers
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS contract_offers_admin_all ON public.contract_offers;
CREATE POLICY contract_offers_admin_all ON public.contract_offers
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────
-- Seed : les 7 offres actuelles, extraites du HTML contrats-entretien.html
-- ───────────────────────────────────────────────────────────────────────────

-- ═══════════ GAZ ═══════════════════════════════════════════════════════════
INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, features, position, is_recommended)
VALUES (
  'gaz-basic', 'gaz', 'Gaz', 'basic', 'BASIC', 9.00, 108.00,
  'L''essentiel pour rester en règle.',
  '[
    {"text":"Visite annuelle & attestation officielle","included":true},
    {"text":"Rappel automatique 1 mois avant la date","included":true},
    {"text":"Dépannages facturés en sus","included":false},
    {"text":"Pièces de rechange non incluses","included":false}
  ]'::jsonb,
  10, false
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, updated_at=now();

INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, badge, features, position, is_recommended)
VALUES (
  'gaz-confort', 'gaz', 'Gaz', 'confort', 'CONFORT', 13.00, 156.00,
  'Sérénité au quotidien.',
  '★ Le plus choisi',
  '[
    {"text":"Tout BASIC inclus","included":true},
    {"text":"<strong>2 dépannages/an</strong> (MO + déplacement)","included":true,"highlight":true},
    {"text":"Intervention sous 48h max","included":true},
    {"text":"Pièces de rechange non incluses","included":false}
  ]'::jsonb,
  20, true
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, badge=EXCLUDED.badge, is_recommended=EXCLUDED.is_recommended, updated_at=now();

INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, features, legal_note, position)
VALUES (
  'gaz-securite', 'gaz', 'Gaz', 'securite', 'SÉCURITÉ', 23.00, 276.00,
  'Tranquillité totale.',
  '[
    {"text":"Tout CONFORT inclus","included":true},
    {"text":"<strong>Pièces incluses</strong> sans frais","included":true,"highlight":true},
    {"text":"Intervention sous 24h max","included":true}
  ]'::jsonb,
  'Réservée aux chaudières < 5 ans, après contrôle technique. Hors corps de chauffe, échangeur principal, ballon ECS et pièces non disponibles fabricant.',
  30
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, legal_note=EXCLUDED.legal_note, updated_at=now();

-- ═══════════ FIOUL ═════════════════════════════════════════════════════════
INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, features, position)
VALUES (
  'fioul-basic', 'fioul', 'Fioul', 'basic', 'BASIC', 12.00, 140.00,
  'L''essentiel pour rester en règle.',
  '[
    {"text":"Visite annuelle & attestation officielle","included":true},
    {"text":"Rappel automatique 1 mois avant","included":true},
    {"text":"Statut prioritaire","included":true},
    {"text":"Dépannages facturés en sus","included":false},
    {"text":"Pièces de rechange non incluses","included":false}
  ]'::jsonb,
  10
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, updated_at=now();

INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, badge, features, position, is_recommended)
VALUES (
  'fioul-confort', 'fioul', 'Fioul', 'confort', 'CONFORT', 16.00, 190.00,
  'Sérénité au quotidien.',
  '★ Le plus choisi',
  '[
    {"text":"Tout BASIC inclus","included":true},
    {"text":"<strong>2 dépannages/an</strong> (MO + déplacement)","included":true,"highlight":true},
    {"text":"Intervention sous 48h max","included":true},
    {"text":"Pièces de rechange non incluses","included":false}
  ]'::jsonb,
  20, true
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, badge=EXCLUDED.badge, is_recommended=EXCLUDED.is_recommended, updated_at=now();

INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_ht_year, baseline, features, legal_note, position)
VALUES (
  'fioul-securite', 'fioul', 'Fioul', 'securite', 'SÉCURITÉ', 27.00, 320.00,
  'Tranquillité totale.',
  '[
    {"text":"Tout CONFORT inclus","included":true},
    {"text":"<strong>Pièces jusqu''à 1 000 € HT</strong>","included":true,"highlight":true},
    {"text":"Au-delà : devis remplacement","included":true},
    {"text":"Intervention sous 24h max","included":true}
  ]'::jsonb,
  'Réservée aux chaudières < 5 ans, après contrôle technique.',
  30
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_ht_year=EXCLUDED.price_ht_year,
  features=EXCLUDED.features, legal_note=EXCLUDED.legal_note, updated_at=now();

-- ═══════════ ADOUCISSEUR ═══════════════════════════════════════════════════
INSERT INTO public.contract_offers (slug, energy, energy_label, tier, tier_label, price_ht_month, price_label, baseline, badge, features, cta_label, cta_action, position, is_recommended)
VALUES (
  'adoucisseur-standard', 'adoucisseur', 'Adoucisseur d''eau', 'custom', 'Contrat Adoucisseur', 8.00,
  'à partir de 8 € HT',
  'Une eau saine, des canalisations protégées.',
  'Eau douce',
  '[
    {"text":"Visite annuelle de contrôle & régénération","included":true},
    {"text":"Vérification dureté de l''eau (TH)","included":true},
    {"text":"Réapprovisionnement sel et résines","included":true},
    {"text":"Option <strong>extension de garantie 10 ans Waterpro</strong>","included":true,"highlight":true},
    {"text":"Intervention prioritaire en cas de panne","included":true}
  ]'::jsonb,
  'Demander un devis personnalisé',
  'quote',
  10, true
) ON CONFLICT (slug) DO UPDATE SET
  price_ht_month=EXCLUDED.price_ht_month, price_label=EXCLUDED.price_label,
  features=EXCLUDED.features, badge=EXCLUDED.badge, cta_label=EXCLUDED.cta_label, updated_at=now();

-- ───────────────────────────────────────────────────────────────────────────
-- Vue publique : offres groupées par énergie, avec prix TTC calculé
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_contract_offers AS
SELECT
  o.*,
  ROUND(o.price_ht_month * (1 + o.vat_rate), 2)   AS price_ttc_month,
  ROUND(COALESCE(o.price_ht_year, o.price_ht_month*12) * (1 + o.vat_rate), 2) AS price_ttc_year
FROM public.contract_offers o
WHERE o.active = true
ORDER BY
  CASE o.energy WHEN 'gaz' THEN 1 WHEN 'fioul' THEN 2 WHEN 'adoucisseur' THEN 3 ELSE 9 END,
  o.position;

GRANT SELECT ON public.v_contract_offers TO anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- Vérification
-- ───────────────────────────────────────────────────────────────────────────
SELECT energy_label, tier_label, price_ht_month || ' €/mois HT' AS prix,
       jsonb_array_length(features) AS nb_features
FROM public.contract_offers
ORDER BY position;
