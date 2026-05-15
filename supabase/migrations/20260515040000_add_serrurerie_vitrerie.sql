-- ═════════════════════════════════════════════════════════════════════
-- Compléments catalogue : Serrurerie + Vitrerie (depuis TARIFS_REFERENCE.md)
-- ═════════════════════════════════════════════════════════════════════
-- Source de vérité : admin-pro/TARIFS_REFERENCE.md validé par Florian le 15/05/2026
-- Tarifs HT = TTC / 1,10 (TVA 10% réduite logement >2 ans)
-- ═════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_cat_serrurerie uuid;
  v_cat_vitrerie uuid;
BEGIN
  SELECT id INTO v_cat_serrurerie FROM public.service_categories WHERE slug = 'serrurerie' LIMIT 1;
  SELECT id INTO v_cat_vitrerie   FROM public.service_categories WHERE slug = 'vitrerie' LIMIT 1;

  IF v_cat_vitrerie IS NULL THEN
    INSERT INTO public.service_categories (slug, name, icon, description, position, active)
    VALUES ('vitrerie', 'Vitrerie', 'vitrerie', 'Réparation et remplacement de vitres, mise en sécurité', 6, true)
    RETURNING id INTO v_cat_vitrerie;
  END IF;

  -- ─── Serrurerie : 3 ouvertures complémentaires ──────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('ouverture-porte-claquee', 'Ouverture porte claquée', 'Porte claquée par le vent ou sans clé. Ouverture sans casse en général.', v_cat_serrurerie, 160.00, 0.10, 30, true, true, 41,
     '["Ouverture sans casse si possible","Diagnostic état serrure","Devis remis si remplacement nécessaire"]'::jsonb, '[]'::jsonb),
    ('ouverture-porte-fermee-cle', 'Ouverture porte fermée à clé', 'Porte fermée à clé mais clé perdue, oubliée ou bloquée à l''intérieur.', v_cat_serrurerie, 207.27, 0.10, 30, true, false, 42,
     '["Ouverture (sans casse si possible)","Récupération clé bloquée","Devis remis si remplacement nécessaire"]'::jsonb, '[]'::jsonb),
    ('ouverture-porte-securite', 'Ouverture porte de sécurité', 'Porte blindée ou serrure A2P/multipoint. Intervention technique avancée.', v_cat_serrurerie, 285.45, 0.10, 30, true, false, 43,
     '["Ouverture porte blindée/sécurité","Diagnostic et démontage","Devis remplacement éventuel"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- ─── Vitrerie : 2 prestations ──────────────────────────────
  INSERT INTO public.services (slug, name, short_desc, category_id, price_ht, vat_rate, deposit_pct, active, featured, position, includes, variants)
  VALUES
    ('mise-en-securite-ouverture-exterieur', 'Mise en sécurité ouverture extérieur', 'Pose d''une protection provisoire après bris de vitre (cambriolage, casse). Tarif au m².', v_cat_vitrerie, 109.09, 0.10, 50, true, true, 50,
     '["Diagnostic","Protection provisoire au m²","Devis remplacement définitif"]'::jsonb, '[{"key":"forfait","label":"Au m²","price_ht":109.09}]'::jsonb),
    ('realisation-gabarit', 'Réalisation gabarit vitre', 'Prise de mesures précises pour commande sur mesure d''un vitrage non standard.', v_cat_vitrerie, 167.27, 0.10, 50, true, false, 51,
     '["Prise de mesures précises","Gabarit transmis au verrier","Devis vitrage sur mesure"]'::jsonb, '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Vérification
SELECT c.name AS categorie, s.name AS prestation,
       s.price_ht || ' € HT' AS ht,
       ROUND(s.price_ht * (1 + s.vat_rate), 0) || ' € TTC' AS ttc_calculé,
       s.position AS pos
FROM public.services s
LEFT JOIN public.service_categories c ON c.id = s.category_id
WHERE s.slug IN ('ouverture-porte-claquee','ouverture-porte-fermee-cle','ouverture-porte-securite','mise-en-securite-ouverture-exterieur','realisation-gabarit')
ORDER BY c.position, s.position;
