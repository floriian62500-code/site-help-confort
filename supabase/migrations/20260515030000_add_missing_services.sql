-- ═════════════════════════════════════════════════════════════════════
-- AJOUT prestations manquantes dans Supabase
-- ═════════════════════════════════════════════════════════════════════
-- Pb détecté : certaines prestations apparaissent sur les pages publiques
-- statiques (plombier-saint-omer.html, contact.html, tarifs.html) mais ne
-- sont pas dans la table `services` → incohérence catalogue admin ≠ public.
--
-- Cette migration ajoute :
--   - Recherche de fuite visuelle (148 € TTC)
--   - Recherche de fuite technique (383 € TTC)
--   - Désengorgement canalisation (165 € TTC)
--   - Détartrage installation sanitaire (237 € TTC)
--   - Entretien annuel chaudière gaz (121 € TTC)
--   - Désembouage par radiateur (105 € TTC)
--   - Recherche de panne électrique (107 € TTC)
--   - Ouverture porte simple (108 € TTC)
--   - Dépannage urgent T1 (75 € TTC)
-- ═════════════════════════════════════════════════════════════════════

-- Helper : récupère un category_id depuis son slug
DO $$
DECLARE
  v_cat_plomberie uuid;
  v_cat_chauffage uuid;
  v_cat_electricite uuid;
  v_cat_serrurerie uuid;
BEGIN
  SELECT id INTO v_cat_plomberie  FROM public.service_categories WHERE slug IN ('plomberie','plomberie-sanitaires') LIMIT 1;
  SELECT id INTO v_cat_chauffage  FROM public.service_categories WHERE slug IN ('chauffage','chauffe-eau','chauffe-eau-production-ecs') LIMIT 1;
  SELECT id INTO v_cat_electricite FROM public.service_categories WHERE slug = 'electricite' LIMIT 1;
  SELECT id INTO v_cat_serrurerie  FROM public.service_categories WHERE slug = 'serrurerie' LIMIT 1;

  -- Si certaines catégories manquent, on les crée
  IF v_cat_plomberie IS NULL THEN
    INSERT INTO public.service_categories (slug, name, icon, description, position, active)
    VALUES ('plomberie-sanitaires', 'Plomberie & Sanitaires', 'plomberie', 'Dépannage et installation plomberie', 1, true)
    RETURNING id INTO v_cat_plomberie;
  END IF;
  IF v_cat_chauffage IS NULL THEN
    INSERT INTO public.service_categories (slug, name, icon, description, position, active)
    VALUES ('chauffage', 'Chauffage', 'chauffage', 'Entretien et dépannage chauffage', 3, true)
    RETURNING id INTO v_cat_chauffage;
  END IF;
  IF v_cat_electricite IS NULL THEN
    INSERT INTO public.service_categories (slug, name, icon, description, position, active)
    VALUES ('electricite', 'Électricité', 'electricite', 'Dépannage et installation électrique', 4, true)
    RETURNING id INTO v_cat_electricite;
  END IF;
  IF v_cat_serrurerie IS NULL THEN
    INSERT INTO public.service_categories (slug, name, icon, description, position, active)
    VALUES ('serrurerie', 'Serrurerie', 'serrurerie', 'Ouverture de portes, changement de serrure', 5, true)
    RETURNING id INTO v_cat_serrurerie;
  END IF;

  -- ─── Plomberie ────────────────────────────────────────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('recherche-fuite-visuelle', 'Recherche de fuite visuelle', 'Localisation d''une fuite accessible, non encastrée. Diagnostic et devis remis.', v_cat_plomberie, 134.55, 0.10, 30, true, true, 10,
     '["Diagnostic visuel complet","Localisation fuite accessible","Rapport et devis remis","Sans casse"]'::jsonb, '[]'::jsonb),
    ('recherche-fuite-technique', 'Recherche de fuite technique (caméra/gaz/acoustique)', 'Fuite encastrée ou cachée : caméra thermique, gaz traceur, écoute acoustique. Sans casse.', v_cat_plomberie, 348.18, 0.10, 30, true, true, 11,
     '["Caméra thermique","Gaz traceur ou acoustique","Sans casse","Rapport détaillé","Devis remis"]'::jsonb, '[]'::jsonb),
    ('desengorgement-canalisation', 'Désengorgement canalisation', 'WC, évier, douche bouchés. Furet électrique ou hydrocurage selon le cas.', v_cat_plomberie, 150.00, 0.10, 30, true, true, 12,
     '["Furet ou hydrocurage","Évier, douche, WC","Garantie 1 mois","Sans casse"]'::jsonb, '[]'::jsonb),
    ('detartrage-installation-sanitaire', 'Détartrage installation sanitaire', 'Détartrage du chauffe-eau, ballon, robinetterie entartrée.', v_cat_plomberie, 215.45, 0.10, 30, true, false, 13,
     '["Détartrage complet","Vérification anode","Garantie 6 mois"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Chauffage ────────────────────────────────────────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('entretien-annuel-chaudiere-gaz', 'Entretien annuel chaudière gaz', 'Contrôle complet, nettoyage, attestation. Obligatoire 1×/an.', v_cat_chauffage, 110.00, 0.10, 0, true, true, 20,
     '["Contrôle complet conformité","Nettoyage corps de chauffe","Test combustion","Attestation légale"]'::jsonb, '[]'::jsonb),
    ('desembouage-radiateur', 'Désembouage par radiateur', 'Élimination des boues qui font perdre 25% de rendement.', v_cat_chauffage, 95.45, 0.10, 30, true, false, 21,
     '["Désembouage chimique","Test équilibrage","Garantie 1 an"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Électricité ──────────────────────────────────────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('recherche-panne-electrique', 'Recherche de panne électrique', 'Diagnostic et localisation panne sur tableau ou circuit.', v_cat_electricite, 97.27, 0.10, 30, true, true, 30,
     '["Diagnostic complet","Test tableau","Localisation panne","Rapport"]'::jsonb, '[]'::jsonb),
    ('forfait-t1-electrique', 'Forfait T1 panne sans fourniture (semaine)', 'Intervention dépannage rapide sans pièce à fournir.', v_cat_electricite, 68.18, 0.10, 30, true, false, 31,
     '["1h main d''œuvre","Diagnostic","Sans pièce"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Serrurerie ───────────────────────────────────────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('ouverture-porte-simple', 'Ouverture porte simple', 'Ouverture sans casse, porte simple cylindre.', v_cat_serrurerie, 98.18, 0.10, 30, true, true, 40,
     '["Ouverture sans casse","Diagnostic","Devis remis si remplacement nécessaire"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Vérification
SELECT c.name AS categorie, s.name AS prestation, s.price_ht || ' € HT' AS ht, ROUND(s.price_ht * (1 + s.vat_rate), 2) || ' € TTC' AS ttc
FROM public.services s
LEFT JOIN public.service_categories c ON c.id = s.category_id
WHERE s.slug IN ('recherche-fuite-visuelle','recherche-fuite-technique','desengorgement-canalisation','detartrage-installation-sanitaire','entretien-annuel-chaudiere-gaz','desembouage-radiateur','recherche-panne-electrique','forfait-t1-electrique','ouverture-porte-simple')
ORDER BY c.position, s.position;
