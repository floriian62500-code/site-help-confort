-- ═══════════════════════════════════════════════════════════════
-- HELP! Confort — Catalogue de prestations en ligne
-- Tables : service_categories, services, service_orders
-- À exécuter dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Catégories (Plomberie, Chauffage, Électricité, etc.)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  icon        text,            -- nom d'icône lucide ou SVG inline
  description text,
  position    int  NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. Services (prestations achetables)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  short_desc      text,                                  -- 1 ligne pour les cards
  description     text,                                  -- détaillée (markdown)
  includes        jsonb DEFAULT '[]'::jsonb,             -- ["Dépose ancien appareil","Raccordement…"]
  image_url       text,                                  -- visuel principal
  badge           text,                                  -- ex: "Best-seller", "Nouveau"
  -- Prix forfait clé en main (gamme principale)
  price_ht        numeric(10,2) NOT NULL,
  vat_rate        numeric(4,3)  NOT NULL DEFAULT 0.100,  -- 10% par défaut (rénovation)
  -- Variantes (gamme Premium, options, …) en JSON :
  -- [{ "key":"premium","label":"Gamme Stéatite","price_ht": 765.14, "info":"Anode magnésium..." }]
  variants        jsonb DEFAULT '[]'::jsonb,
  duration_min    int,                                   -- estimation durée intervention (minutes)
  warranty        text,                                  -- ex: "Garantie 5 ans cuve, 2 ans pièces"
  brand           text,                                  -- ex: "Atlantic, Nicoll, Geberit"
  -- Conditions d'achat
  requires_quote  boolean NOT NULL DEFAULT false,        -- true = devis sur mesure (pas de prix fixe)
  deposit_pct     numeric(4,2) NOT NULL DEFAULT 40.00,   -- % acompte à la commande
  -- Tri & visibilité
  position        int     NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  featured        boolean NOT NULL DEFAULT false,        -- mis en avant home
  -- Méta
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_category_idx ON public.services(category_id);
CREATE INDEX IF NOT EXISTS services_active_idx   ON public.services(active);
CREATE INDEX IF NOT EXISTS services_position_idx ON public.services(position);

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS services_touch_updated_at ON public.services;
CREATE TRIGGER services_touch_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- 3. Commandes (réservations d'intervention en ligne)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text UNIQUE NOT NULL DEFAULT ('CMD-' || to_char(now(), 'YYMMDD') || '-' || lpad(((extract(epoch from now())::bigint) % 100000)::text, 5, '0')),
  service_id       uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name     text,                                  -- snapshot du nom à la commande
  variant_key      text,                                  -- 'eco' / 'premium' / null
  variant_label    text,                                  -- snapshot
  -- Client
  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  customer_phone   text,
  address          text,
  postal_code      text,
  city             text,
  notes            text,                                  -- demandes spécifiques
  -- Planning
  preferred_date   date,
  preferred_slot   text,                                  -- 'matin' / 'apres-midi' / 'urgent'
  -- Montants (snapshot au moment de la commande)
  price_ht         numeric(10,2) NOT NULL,
  vat_rate         numeric(4,3)  NOT NULL,
  price_ttc        numeric(10,2) NOT NULL,
  deposit_amount   numeric(10,2),                         -- acompte demandé
  deposit_paid     boolean NOT NULL DEFAULT false,
  stripe_payment_intent_id text,                          -- pour intégration Stripe future
  -- Statut
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','scheduled','done','cancelled')),
  -- Méta
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_orders_status_idx     ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS service_orders_service_idx    ON public.service_orders(service_id);
CREATE INDEX IF NOT EXISTS service_orders_created_idx    ON public.service_orders(created_at DESC);

DROP TRIGGER IF EXISTS service_orders_touch_updated_at ON public.service_orders;
CREATE TRIGGER service_orders_touch_updated_at BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- 4. RLS (Row-Level Security)
-- ───────────────────────────────────────────────────────────────
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders     ENABLE ROW LEVEL SECURITY;

-- Catalogue public (lecture anonyme des services & catégories actifs)
DROP POLICY IF EXISTS service_categories_public_read ON public.service_categories;
CREATE POLICY service_categories_public_read ON public.service_categories
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS services_public_read ON public.services;
CREATE POLICY services_public_read ON public.services
  FOR SELECT USING (active = true);

-- Lecture/écriture totale pour utilisateurs authentifiés (admin)
DROP POLICY IF EXISTS service_categories_admin_all ON public.service_categories;
CREATE POLICY service_categories_admin_all ON public.service_categories
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS services_admin_all ON public.services;
CREATE POLICY services_admin_all ON public.services
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Commandes : anonyme peut insérer (côté site public), admin lit/modifie
DROP POLICY IF EXISTS service_orders_anon_insert ON public.service_orders;
CREATE POLICY service_orders_anon_insert ON public.service_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS service_orders_admin_read ON public.service_orders;
CREATE POLICY service_orders_admin_read ON public.service_orders
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS service_orders_admin_update ON public.service_orders;
CREATE POLICY service_orders_admin_update ON public.service_orders
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────
-- 5. Données seed (extraites de tes devis du 12/05/2026)
-- ───────────────────────────────────────────────────────────────
INSERT INTO public.service_categories (slug, name, icon, description, position) VALUES
  ('plomberie',  'Plomberie & Sanitaires',       'Wrench',     'Fuites, robinetterie, mécanismes WC, débouchage', 10),
  ('chauffe-eau','Chauffe-eau & Production ECS', 'Flame',      'Remplacement, installation, entretien de chauffe-eau électriques', 20),
  ('chauffage',  'Chauffage & Climatisation',    'Thermometer','Chaudières, radiateurs, pompes à chaleur',         30),
  ('electricite','Électricité',                  'Zap',        'Mise aux normes, dépannage, installations',         40),
  ('serrurerie', 'Serrurerie',                   'Lock',       'Ouverture de porte, changement de serrure',         50),
  ('vitrerie',   'Vitrerie',                     'Square',     'Remplacement vitre, sécurisation',                   60),
  ('sur-mesure', 'Devis sur mesure',             'FileText',   'Travaux personnalisés, gros chantiers',             99)
ON CONFLICT (slug) DO UPDATE
  SET name=EXCLUDED.name, icon=EXCLUDED.icon, description=EXCLUDED.description, position=EXCLUDED.position;

-- Prestation 1 : Remplacement mécanisme chasse d'eau
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='plomberie'),
  'remplacement-mecanisme-chasse-eau',
  'Remplacement mécanisme chasse d''eau',
  'Mécanisme défaillant ? On le remplace en 1 h par un modèle fiable.',
  E'**Intervention rapide** pour remplacer le mécanisme de votre chasse d''eau qui fuit, ne se remplit plus ou consomme trop d''eau.\n\nNotre technicien intervient avec le matériel adapté, dépose l''ancien mécanisme, installe le nouveau et vérifie l''étanchéité complète.',
  '["Dépose de l''ancien mécanisme","Fourniture mécanisme neuf Nicoll","Pose et raccordement","Test étanchéité + réglage débit","Traitement des déchets","Déplacement (≤55 km)"]'::jsonb,
  'Express 1h',
  169.65, 0.100,
  '[{"key":"premium","label":"Variante WC classique au sol (Geberit)","price_ht":184.55,"info":"Pour WC classique au sol avec mécanisme Geberit haut de gamme"}]'::jsonb,
  60,
  'Garantie pièce 2 ans · main d''œuvre 1 an',
  'Nicoll, Geberit',
  10, true
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, includes=EXCLUDED.includes,
      description=EXCLUDED.description, short_desc=EXCLUDED.short_desc, updated_at=now();

-- Prestation 2 : Chauffe-eau 100L mural/trépied
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'remplacement-chauffe-eau-100l',
  'Remplacement chauffe-eau 100L (mural ou trépied)',
  'Pour 1 à 2 personnes. Pose comprise, 2 techniciens.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 100L installé au mur ou sur trépied.\n\nDeux gammes au choix :\n- **Éco** : résistance blindée Atlantic, idéale pour eau peu calcaire\n- **Stéatite** : résistance protégée + anode magnésium, durée de vie prolongée, idéale en zone calcaire',
  '["Dépose de l''ancien appareil","Fourniture du chauffe-eau Atlantic","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité SFR 3/4 + siphon","Petite fourniture plomberie","Mise en service et vérification","Forfait pose 2 techniciens","Déplacement (≤55 km) + traitement déchets"]'::jsonb,
  null,
  701.18, 0.100,
  '[{"key":"premium","label":"Gamme Stéatite (anode magnésium)","price_ht":765.14,"info":"Résistance stéatite protégée par fourreau, anode magnésium, durée de vie prolongée"}]'::jsonb,
  150,
  'Garantie 5 ans cuve · 2 ans pièces',
  'Atlantic',
  20, true
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, includes=EXCLUDED.includes,
      description=EXCLUDED.description, updated_at=now();

-- Prestation 3 : Chauffe-eau 150L mural/trépied
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'remplacement-chauffe-eau-150l',
  'Remplacement chauffe-eau 150L (mural ou trépied)',
  'Pour 2 à 3 personnes. Pose comprise, 2 techniciens.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 150L installé au mur ou sur trépied.\n\nDeux gammes au choix : Éco (résistance blindée) ou Stéatite (anode magnésium, anti-calcaire).',
  '["Dépose de l''ancien appareil","Fourniture du chauffe-eau Atlantic 150L","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  761.22, 0.100,
  '[{"key":"premium","label":"Gamme Stéatite (anode magnésium)","price_ht":831.56,"info":"Résistance stéatite + anode pour durée de vie prolongée"}]'::jsonb,
  150,
  'Garantie 5 ans cuve · 2 ans pièces',
  'Atlantic',
  30, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, updated_at=now();

-- Prestation 4 : Chauffe-eau 200L mural/trépied
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'remplacement-chauffe-eau-200l-mural',
  'Remplacement chauffe-eau 200L (mural ou trépied)',
  'Pour 3 à 4 personnes. Pose comprise, 2 techniciens.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au mur ou sur trépied.\n\nIdéal pour foyer de 3-4 personnes. Deux gammes au choix.',
  '["Dépose de l''ancien appareil","Fourniture du chauffe-eau Atlantic 200L","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  824.42, 0.100,
  '[{"key":"premium","label":"Gamme Stéatite (anode magnésium)","price_ht":905.54,"info":"Résistance stéatite + anode pour durée de vie prolongée"}]'::jsonb,
  180,
  'Garantie 5 ans cuve · 2 ans pièces',
  'Atlantic',
  40, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, updated_at=now();

-- Prestation 5 : Chauffe-eau 200L au sol
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'remplacement-chauffe-eau-200l-sol',
  'Remplacement chauffe-eau 200L au sol',
  'Pour 3 à 4 personnes. Pose au sol, 2 techniciens.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au sol (stable, sans trépied).\n\nDeux gammes au choix.',
  '["Dépose de l''ancien appareil","Fourniture du chauffe-eau Atlantic 200L au sol","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  1212.14, 0.100,
  '[{"key":"premium","label":"Gamme Stéatite (anode magnésium)","price_ht":1325.40,"info":"Résistance stéatite + anode pour durée de vie prolongée"}]'::jsonb,
  180,
  'Garantie 5 ans cuve · 2 ans pièces',
  'Atlantic',
  50, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, updated_at=now();

-- Prestation 6 : Chauffe-eau 300L au sol
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, variants, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'remplacement-chauffe-eau-300l-sol',
  'Remplacement chauffe-eau 300L au sol',
  'Grande famille (5+). Pose au sol, 2 techniciens.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 300L installé au sol.\n\nIdéal pour famille nombreuse ou usage intensif. Deux gammes au choix.',
  '["Dépose de l''ancien appareil","Fourniture du chauffe-eau Atlantic 300L au sol","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Famille XL',
  1104.08, 0.100,
  '[{"key":"premium","label":"Gamme Stéatite (anode magnésium)","price_ht":1295.08,"info":"Résistance stéatite + anode pour durée de vie prolongée"}]'::jsonb,
  240,
  'Garantie 5 ans cuve · 2 ans pièces',
  'Atlantic',
  60, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, variants=EXCLUDED.variants, updated_at=now();

-- Prestation "Devis sur mesure" (catch-all)
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, price_ht, vat_rate, requires_quote, deposit_pct, position, active, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='sur-mesure'),
  'devis-personnalise',
  'Demande de devis personnalisé',
  'Votre projet ne rentre pas dans nos forfaits ? Devis gratuit sous 48 h.',
  E'Vous avez un projet spécifique : rénovation salle de bain, mise aux normes électriques, installation pompe à chaleur, ouverture de mur, gros chantier ?\n\nDécrivez-nous votre besoin, on revient vers vous avec un devis détaillé sous 48 h ouvrées, **sans engagement**.',
  '["Visite technique sur site (selon projet)","Devis détaillé sous 48h","Tarification transparente","Sans engagement"]'::jsonb,
  0, 0.100, true, 0, 999, true, false
ON CONFLICT (slug) DO UPDATE
  SET short_desc=EXCLUDED.short_desc, description=EXCLUDED.description, updated_at=now();

-- ───────────────────────────────────────────────────────────────
-- 6. Vue helper : services_with_category (pour le site public)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_services_public AS
SELECT
  s.*,
  c.slug AS category_slug,
  c.name AS category_name,
  c.icon AS category_icon,
  ROUND(s.price_ht * (1 + s.vat_rate), 2) AS price_ttc,
  ROUND(s.price_ht * (1 + s.vat_rate) * (s.deposit_pct / 100), 2) AS deposit_ttc
FROM public.services s
LEFT JOIN public.service_categories c ON c.id = s.category_id
WHERE s.active = true AND (c.active = true OR c.id IS NULL)
ORDER BY c.position, s.position;

GRANT SELECT ON public.v_services_public TO anon, authenticated;

-- ═══════════════════════════════════════════════════════════════
-- FIN — vérifications
-- ═══════════════════════════════════════════════════════════════
SELECT
  c.name AS categorie,
  s.name AS prestation,
  s.price_ht || ' € HT' AS prix_ht,
  ROUND(s.price_ht * 1.10, 2) || ' € TTC' AS prix_ttc,
  jsonb_array_length(s.variants) AS nb_variantes
FROM public.services s
LEFT JOIN public.service_categories c ON c.id = s.category_id
ORDER BY c.position, s.position;
