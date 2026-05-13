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
-- ⚠ Chaque gamme (Éco / Stéatite, Nicoll / Geberit) = 1 prestation distincte
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

-- Nettoyage : on supprime les anciens slugs (version précédente avec variantes)
-- pour repartir sur les 12 prestations distinctes ci-dessous.
DELETE FROM public.services WHERE slug IN (
  'remplacement-mecanisme-chasse-eau',
  'remplacement-chauffe-eau-100l',
  'remplacement-chauffe-eau-150l',
  'remplacement-chauffe-eau-200l-mural',
  'remplacement-chauffe-eau-200l-sol',
  'remplacement-chauffe-eau-300l-sol'
);

-- ═══════════════ PLOMBERIE — 2 prestations ═══════════════════════════

-- 1. Mécanisme chasse d'eau STANDARD (Nicoll)
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='plomberie'),
  'mecanisme-chasse-eau-standard',
  'Mécanisme de chasse d''eau — Standard (Nicoll)',
  'WC suspendu ou bâti-support. Pose en 1 h, modèle Nicoll fiable.',
  E'**Intervention rapide** pour remplacer le mécanisme de votre chasse d''eau sur WC suspendu ou avec bâti-support.\n\nFourniture mécanisme **Nicoll** complet. Notre technicien dépose l''ancien mécanisme, installe le nouveau et vérifie l''étanchéité complète.',
  '["Dépose de l''ancien mécanisme","Fourniture mécanisme complet Nicoll","Pose et raccordement","Test étanchéité + réglage débit","Traitement des déchets","Déplacement (≤55 km)"]'::jsonb,
  'Express 1h',
  169.65, 0.100, 60,
  'Garantie pièce 2 ans · main d''œuvre 1 an', 'Nicoll',
  10, true
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, brand=EXCLUDED.brand, updated_at=now();

-- 2. Mécanisme chasse d'eau WC AU SOL (Geberit)
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='plomberie'),
  'mecanisme-chasse-eau-wc-au-sol',
  'Mécanisme de chasse d''eau — WC au sol (Geberit)',
  'WC classique au sol. Mécanisme Geberit haut de gamme.',
  E'**Intervention rapide** pour remplacer le mécanisme de votre chasse d''eau sur WC classique posé au sol.\n\nFourniture mécanisme **Geberit** haut de gamme, plus durable et silencieux. Notre technicien dépose l''ancien mécanisme, installe le nouveau et vérifie l''étanchéité.',
  '["Dépose de l''ancien mécanisme","Fourniture mécanisme complet Geberit","Pose et raccordement","Test étanchéité + réglage débit","Traitement des déchets","Déplacement (≤55 km)"]'::jsonb,
  null,
  184.55, 0.100, 60,
  'Garantie pièce 2 ans · main d''œuvre 1 an', 'Geberit',
  11, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, brand=EXCLUDED.brand, updated_at=now();

-- ═══════════════ CHAUFFE-EAU 100L — 2 prestations ═══════════════════════

-- 3. Chauffe-eau 100L mural/trépied — Gamme ÉCO (blindée)
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-100l-eco',
  'Chauffe-eau 100L mural — Gamme Éco (résistance blindée)',
  'Pour 1-2 pers. Atlantic blindée, idéal eau peu calcaire.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 100L installé au mur ou sur trépied.\n\nGamme **Éco** : résistance blindée Atlantic en contact direct avec l''eau.\n\n✔ Rapport qualité/prix optimal\n⚠ Sensible au calcaire — préférez la gamme Stéatite si votre eau est dure',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 100L blindé","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité SFR 3/4 + siphon","Petite fourniture plomberie","Mise en service et vérification","Forfait pose 2 techniciens","Déplacement (≤55 km) + traitement déchets"]'::jsonb,
  'Best-seller',
  701.18, 0.100, 150,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  20, true
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- 4. Chauffe-eau 100L mural/trépied — Gamme STÉATITE
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-100l-steatite',
  'Chauffe-eau 100L mural — Gamme Stéatite (anti-calcaire)',
  'Pour 1-2 pers. Résistance protégée + anode magnésium.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 100L installé au mur ou sur trépied.\n\nGamme **Stéatite** : résistance protégée par un fourreau (pas de contact direct avec l''eau) + **anode magnésium** pour une durée de vie prolongée.\n\n✔ Idéal en zone calcaire\n✔ Durée de vie significativement plus longue\n✔ Entretien facilité',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 100L Stéatite","Anode magnésium intégrée","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité SFR 3/4 + siphon","Petite fourniture plomberie","Mise en service et vérification","Forfait pose 2 techniciens","Déplacement (≤55 km) + traitement déchets"]'::jsonb,
  'Anti-calcaire',
  765.14, 0.100, 150,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  21, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- ═══════════════ CHAUFFE-EAU 150L — 2 prestations ═══════════════════════

-- 5. Chauffe-eau 150L mural/trépied — Gamme ÉCO
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-150l-eco',
  'Chauffe-eau 150L mural — Gamme Éco (résistance blindée)',
  'Pour 2-3 pers. Atlantic blindée, eau peu calcaire.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 150L installé au mur ou sur trépied.\n\nGamme **Éco** : résistance blindée Atlantic. Rapport qualité/prix optimal pour foyer de 2 à 3 personnes en eau peu calcaire.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 150L blindé","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  761.22, 0.100, 150,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  30, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, updated_at=now();

-- 6. Chauffe-eau 150L mural/trépied — Gamme STÉATITE
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-150l-steatite',
  'Chauffe-eau 150L mural — Gamme Stéatite (anti-calcaire)',
  'Pour 2-3 pers. Résistance protégée + anode magnésium.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 150L installé au mur ou sur trépied.\n\nGamme **Stéatite** : résistance protégée + anode magnésium. Idéal en zone calcaire, durée de vie prolongée.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 150L Stéatite","Anode magnésium intégrée","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Anti-calcaire',
  831.56, 0.100, 150,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  31, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- ═══════════════ CHAUFFE-EAU 200L mural — 2 prestations ═════════════════

-- 7. Chauffe-eau 200L mural/trépied — Gamme ÉCO
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-200l-mural-eco',
  'Chauffe-eau 200L mural — Gamme Éco (résistance blindée)',
  'Pour 3-4 pers. Atlantic blindée mural/trépied.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au mur ou sur trépied.\n\nGamme **Éco** : résistance blindée Atlantic. Idéal pour foyer de 3 à 4 personnes en eau peu calcaire.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 200L blindé","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  824.42, 0.100, 180,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  40, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, updated_at=now();

-- 8. Chauffe-eau 200L mural/trépied — Gamme STÉATITE
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-200l-mural-steatite',
  'Chauffe-eau 200L mural — Gamme Stéatite (anti-calcaire)',
  'Pour 3-4 pers. Mural/trépied + anode magnésium.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au mur ou sur trépied.\n\nGamme **Stéatite** : résistance protégée + anode magnésium. Durée de vie prolongée en zone calcaire.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 200L Stéatite","Anode magnésium intégrée","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Anti-calcaire',
  905.54, 0.100, 180,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  41, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- ═══════════════ CHAUFFE-EAU 200L au sol — 2 prestations ════════════════

-- 9. Chauffe-eau 200L au sol — Gamme ÉCO
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-200l-sol-eco',
  'Chauffe-eau 200L au sol — Gamme Éco (résistance blindée)',
  'Pour 3-4 pers. Pose stable au sol, sans trépied.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au sol (sans trépied, plus stable).\n\nGamme **Éco** : résistance blindée Atlantic. Pour foyer de 3 à 4 personnes.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 200L au sol","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  null,
  1212.14, 0.100, 180,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  50, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, updated_at=now();

-- 10. Chauffe-eau 200L au sol — Gamme STÉATITE
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-200l-sol-steatite',
  'Chauffe-eau 200L au sol — Gamme Stéatite (anti-calcaire)',
  'Pour 3-4 pers. Pose au sol + anode magnésium.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 200L installé au sol.\n\nGamme **Stéatite** : résistance protégée + anode magnésium. Idéal en zone calcaire.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 200L Stéatite au sol","Anode magnésium intégrée","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Anti-calcaire',
  1325.40, 0.100, 180,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  51, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- ═══════════════ CHAUFFE-EAU 300L au sol — 2 prestations ════════════════

-- 11. Chauffe-eau 300L au sol — Gamme ÉCO
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-300l-sol-eco',
  'Chauffe-eau 300L au sol — Gamme Éco (résistance blindée)',
  'Famille 5+. Grande capacité, pose au sol.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 300L installé au sol.\n\nGamme **Éco** : résistance blindée Atlantic. Idéal famille nombreuse (5 personnes et +) ou usage intensif.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 300L au sol","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Famille XL',
  1104.08, 0.100, 240,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  60, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- 12. Chauffe-eau 300L au sol — Gamme STÉATITE
INSERT INTO public.services
  (category_id, slug, name, short_desc, description, includes, badge, price_ht, vat_rate, duration_min, warranty, brand, position, featured)
SELECT
  (SELECT id FROM public.service_categories WHERE slug='chauffe-eau'),
  'chauffe-eau-300l-sol-steatite',
  'Chauffe-eau 300L au sol — Gamme Stéatite (anti-calcaire)',
  'Famille 5+. Grande capacité + anode magnésium.',
  E'**Forfait complet** pour remplacer votre chauffe-eau électrique 300L installé au sol.\n\nGamme **Stéatite** : résistance protégée + anode magnésium. Pour famille nombreuse en zone calcaire, durée de vie maximale.',
  '["Dépose de l''ancien appareil","Fourniture chauffe-eau Atlantic 300L Stéatite au sol","Anode magnésium intégrée","Raccordements hydrauliques EF/ECS","Raccordement électrique conforme NFC 15-100","Groupe de sécurité + siphon","Petite fourniture plomberie","Mise en service","Forfait pose 2 techniciens","Déplacement + traitement déchets"]'::jsonb,
  'Anti-calcaire',
  1295.08, 0.100, 240,
  'Garantie 5 ans cuve · 2 ans pièces', 'Atlantic',
  61, false
ON CONFLICT (slug) DO UPDATE
  SET price_ht=EXCLUDED.price_ht, includes=EXCLUDED.includes, description=EXCLUDED.description,
      short_desc=EXCLUDED.short_desc, badge=EXCLUDED.badge, updated_at=now();

-- ═══════════════ DEVIS SUR MESURE ═══════════════════════════════════════
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
