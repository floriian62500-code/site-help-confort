-- ═════════════════════════════════════════════════════════════════════
-- Catalogue : entretien annuel poêle / insert (bois, granulés) — ramonage compris
-- ═════════════════════════════════════════════════════════════════════
-- Source : barème agence « BAREME AGENCE > PLOMBERIE > FORFAIT & MAIN D'OEUVRE > CHAUFFAGE »,
-- transmis par Florian le 18/09/2026 (directive GitHub 5733225819) :
--   EPB — Entretien annuel poêle / insert à bois — ramonage compris      : 115 € HT
--   EPG — Entretien annuel poêle / insert à granulés — ramonage compris  : 136 € HT
-- Stockage : price_ht (montant HT du barème) + vat_rate 0.100, comme les autres entretiens du
-- catalogue. Le site affiche « TTC · TVA 10 % » avec la bascule Particulier / Pro (20 %) déjà en
-- place : bois 126,50 € TTC, granulés 149,60 € TTC pour un particulier (logement de plus de 2 ans).
--
-- ⚠️ NON APPLIQUÉE — décision de Florian le 2026-09-22 : « pas maintenant ».
-- Écrire dans `services` modifie le catalogue de PRODUCTION (base partagée, visible aussitôt sur
-- depan59-62.fr). Rangée dans _pending_migrations pour qu'un merge recette → main ne l'applique pas
-- à son insu. Idempotente (ON CONFLICT sur le slug, index unique services_slug_key).
--
-- Le site est prêt (commit « feat(catalogue): add stove and insert maintenance services to heating
-- category ») : sur nos-prestations, ces lignes se rangent dans « Entretien & dépannage » avec
-- l'icône 🔥 ; dans le tunnel, un panier qui les contient est mesuré en famille « poele ».
-- ═════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_cat_chauffage uuid;
BEGIN
  SELECT id INTO v_cat_chauffage FROM public.service_categories WHERE slug = 'chauffage' LIMIT 1;
  IF v_cat_chauffage IS NULL THEN
    RAISE EXCEPTION 'Catégorie « chauffage » introuvable : migration interrompue, rien n''est écrit.';
  END IF;

  INSERT INTO public.services (category_id, slug, name, short_desc, includes, price_ht, vat_rate, requires_quote, deposit_pct, position, active)
  VALUES
    (v_cat_chauffage, 'entretien-poele-insert-bois', 'Entretien poêle / insert à bois',
     'Ramonage du conduit compris. Entretien annuel de l''appareil, certificat de ramonage remis.',
     '["Entretien annuel de l''appareil","Ramonage du conduit compris","Certificat de ramonage remis"]'::jsonb,
     115.00, 0.100, false, 40, 4, true),
    (v_cat_chauffage, 'entretien-poele-insert-granules', 'Entretien poêle / insert à granulés',
     'Ramonage du conduit compris. Entretien annuel de l''appareil, certificat de ramonage remis.',
     '["Entretien annuel de l''appareil","Ramonage du conduit compris","Certificat de ramonage remis"]'::jsonb,
     136.00, 0.100, false, 40, 5, true)
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, short_desc = EXCLUDED.short_desc, includes = EXCLUDED.includes,
        price_ht = EXCLUDED.price_ht, vat_rate = EXCLUDED.vat_rate, requires_quote = EXCLUDED.requires_quote,
        deposit_pct = EXCLUDED.deposit_pct, position = EXCLUDED.position, updated_at = now();
END $$;

-- Contrôle attendu après application :
--   SELECT slug, price_ht, vat_rate, price_ttc, deposit_ttc FROM public.v_services_public
--    WHERE slug LIKE 'entretien-poele-insert-%' ORDER BY position;
--   → bois 115.00 / 0.100 / 126.50 ; granulés 136.00 / 0.100 / 149.60
--
-- Retour arrière (sans supprimer de donnée) :
--   UPDATE public.services SET active = false, updated_at = now()
--    WHERE slug IN ('entretien-poele-insert-bois', 'entretien-poele-insert-granules');
