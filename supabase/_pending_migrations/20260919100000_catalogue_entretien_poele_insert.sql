-- ═════════════════════════════════════════════════════════════════════
-- Catalogue : entretien annuel poêle / insert (bois, granulés) — ramonage compris
-- ═════════════════════════════════════════════════════════════════════
-- Source : barème agence « BAREME AGENCE > PLOMBERIE > FORFAIT & MAIN D'OEUVRE > CHAUFFAGE »,
-- transmis par Florian le 18/09/2026 (directive GitHub 5733225819) :
--   EPB — Entretien annuel poêle / insert à bois — ramonage compris      : 115 € HT
--   EPG — Entretien annuel poêle / insert à granulés — ramonage compris  : 136 € HT
-- Stockage : price_ht (montant HT du barème) + vat_rate 0.100, comme les autres entretiens du
-- catalogue (TVA 10 % : entretien d'un logement de plus de 2 ans ; 20 % sinon, voir TARIFS_REFERENCE.md).
--
-- ⚠️ NON APPLIQUÉE. Écrire dans `services` modifie le catalogue de PRODUCTION (base partagée) :
-- application = GO Florian (supabase db push, ou SQL Editor). Rangée dans _pending_migrations pour
-- qu'un merge recette → main ne l'applique pas à son insu. Idempotente (ON CONFLICT sur slug).
-- ═════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_cat_chauffage uuid;
BEGIN
  SELECT id INTO v_cat_chauffage FROM public.service_categories WHERE slug = 'chauffage' LIMIT 1;
  IF v_cat_chauffage IS NULL THEN
    RAISE EXCEPTION 'Catégorie « chauffage » introuvable : migration interrompue, rien n''est écrit.';
  END IF;

  INSERT INTO public.services (category_id, slug, name, short_desc, includes, price_ht, vat_rate, requires_quote, position, active)
  VALUES
    (v_cat_chauffage, 'entretien-poele-insert-bois', 'Entretien poêle / insert à bois (ramonage compris)',
     'Entretien annuel de l''appareil, ramonage du conduit compris. Certificat de ramonage remis.',
     '["Ramonage du conduit compris","Certificat de ramonage remis"]'::jsonb, 115.00, 0.100, false, 5, true),
    (v_cat_chauffage, 'entretien-poele-insert-granules', 'Entretien poêle / insert à granulés (ramonage compris)',
     'Entretien annuel de l''appareil, ramonage du conduit compris. Certificat de ramonage remis.',
     '["Ramonage du conduit compris","Certificat de ramonage remis"]'::jsonb, 136.00, 0.100, false, 6, true)
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, short_desc = EXCLUDED.short_desc, includes = EXCLUDED.includes,
        price_ht = EXCLUDED.price_ht, vat_rate = EXCLUDED.vat_rate, requires_quote = EXCLUDED.requires_quote,
        updated_at = now();
END $$;

-- Contrôle attendu après application :
--   SELECT slug, price_ht, vat_rate, price_ttc FROM public.v_services_public WHERE slug LIKE 'entretien-poele-insert-%';
--   → bois 115.00 / 0.100 / 126.50 ; granulés 136.00 / 0.100 / 149.60
