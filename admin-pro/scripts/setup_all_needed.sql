-- ═══════════════════════════════════════════════════════════════════════════
-- HELP Confort — SCRIPT D'INSTALLATION COMPLET
-- ═══════════════════════════════════════════════════════════════════════════
-- À exécuter UNE SEULE FOIS dans Supabase → SQL Editor (https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/sql/new)
-- 
-- Ce script combine en 1 seul fichier les 3 migrations nécessaires :
--   1. Équipe & permissions (Owner / Assistant / Lecture seule)
--   2. Contrats d'entretien + Interventions / RDV
--   3. Catalogue de prestations en ligne (13 forfaits) + commandes
--
-- Le script est IDEMPOTENT : tu peux le relancer plusieurs fois sans casser
-- les données existantes (utilise CREATE IF NOT EXISTS, ON CONFLICT, etc.)
--
-- Durée : ~3 secondes
-- ═══════════════════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  1. ÉQUIPE & PERMISSIONS                                               ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Setup user_profiles (rôles & permissions)
-- ═══════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor (1 seule fois)
-- Crée :
--   1. Table user_profiles (extension de auth.users avec full_name, role, etc.)
--   2. RLS policies (lecture pour tous les authentifiés, écriture owner only)
--   3. Helper function public.is_owner() utilisée par d'autres tables
--   4. Trigger qui crée auto un profil à chaque nouvelle inscription
--   5. Backfill des users existants (Florian = owner, les autres = assistant)
-- ═══════════════════════════════════════════════════════════════

-- 1) TABLE user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  role        text NOT NULL DEFAULT 'assistant' CHECK (role IN ('owner', 'assistant', 'viewer')),
  is_active   boolean NOT NULL DEFAULT true,
  invited_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 2) Trigger updated_at
CREATE OR REPLACE FUNCTION public.tg_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_user_profiles_updated_at();

-- 3) Helper : current user is owner ?
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'owner' AND is_active = true
  );
$$;

-- Helper : current user role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_profiles
     WHERE user_id = auth.uid() AND is_active = true),
    'viewer'
  );
$$;

-- 4) RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_select_all ON public.user_profiles;
CREATE POLICY user_profiles_select_all ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS user_profiles_update_owner ON public.user_profiles;
CREATE POLICY user_profiles_update_owner ON public.user_profiles
  FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS user_profiles_insert_owner ON public.user_profiles;
CREATE POLICY user_profiles_insert_owner ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS user_profiles_delete_owner ON public.user_profiles;
CREATE POLICY user_profiles_delete_owner ON public.user_profiles
  FOR DELETE TO authenticated USING (public.is_owner());

-- 5) Trigger auto-création de profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'assistant')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6) Backfill des users existants
INSERT INTO public.user_profiles (user_id, full_name, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  CASE
    WHEN u.email = 'florian.dhaillecourt@helpconfort.com' THEN 'owner'
    WHEN u.email LIKE '%@helpconfort.com' THEN 'assistant'
    ELSE 'assistant'
  END
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 7) Sécurité : garantir qu'au moins Florian est owner
UPDATE public.user_profiles
SET role = 'owner', is_active = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'florian.dhaillecourt@helpconfort.com'
)
AND role != 'owner';

-- ═══════════════════════════════════════════════════════════════
-- POLICIES RÔLES POUR LES TABLES MÉTIER
-- ═══════════════════════════════════════════════════════════════
-- Stratégie :
--   - owner & assistant : read+write sur les tables métier
--   - viewer            : read only
-- ═══════════════════════════════════════════════════════════════

-- realisations : assistants peuvent écrire, viewer lecture seule
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='realisations') THEN
    EXECUTE 'ALTER TABLE public.realisations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_select ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_select ON public.realisations FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_write ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_write ON public.realisations FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_update ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_update ON public.realisations FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant'')) WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS realisations_role_delete ON public.realisations';
    EXECUTE 'CREATE POLICY realisations_role_delete ON public.realisations FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- app_settings : SEULS LES OWNERS peuvent modifier (config sensible)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='app_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS app_settings_role_select ON public.app_settings';
    EXECUTE 'CREATE POLICY app_settings_role_select ON public.app_settings FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS app_settings_role_write ON public.app_settings';
    EXECUTE 'CREATE POLICY app_settings_role_write ON public.app_settings FOR ALL TO authenticated USING (public.current_role() = ''owner'') WITH CHECK (public.current_role() = ''owner'')';
  END IF;
END $$;

-- leads : owner + assistant peuvent tout, viewer lecture seule
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='leads') THEN
    EXECUTE 'DROP POLICY IF EXISTS leads_role_write ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_write ON public.leads FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS leads_role_update ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_update ON public.leads FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS leads_role_delete ON public.leads';
    EXECUTE 'CREATE POLICY leads_role_delete ON public.leads FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- reviews : idem
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='reviews') THEN
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_write ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_write ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_update ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_update ON public.reviews FOR UPDATE TO authenticated USING (public.current_role() IN (''owner'',''assistant''))';
    EXECUTE 'DROP POLICY IF EXISTS reviews_role_delete ON public.reviews';
    EXECUTE 'CREATE POLICY reviews_role_delete ON public.reviews FOR DELETE TO authenticated USING (public.current_role() = ''owner'')';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Vérifications
-- ═══════════════════════════════════════════════════════════════
SELECT 'Setup terminé. Users :' AS info;
SELECT
  up.user_id, up.full_name, up.role, up.is_active, u.email, u.last_sign_in_at
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.user_id
ORDER BY up.created_at ASC;

-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  2. CONTRATS D'ENTRETIEN + INTERVENTIONS                               ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Setup Contrats & Interventions
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
  lead_id             uuid   REFERENCES public.leads(id)      ON DELETE SET NULL,
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

-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  3. CATALOGUE DE PRESTATIONS + COMMANDES                               ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════
-- HELP Confort — Catalogue de prestations en ligne
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

-- ═══════════════════════════════════════════════════════════════════════════
-- INSTALLATION TERMINÉE ✅
-- ═══════════════════════════════════════════════════════════════════════════
-- Vérifie que tu vois :
--   - 13 prestations dans le catalogue (12 forfaits + 1 devis personnalisé)
--   - Les 7 catégories de services créées
--   - Les tables user_profiles, contracts, interventions, services, service_orders
-- 
-- Rafraîchis tes pages admin et /nos-prestations.html → tout doit fonctionner.
-- ═══════════════════════════════════════════════════════════════════════════
