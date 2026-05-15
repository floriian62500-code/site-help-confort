-- ═════════════════════════════════════════════════════════════════════
-- ALIGNEMENT prix chauffe-eau sur TARIFS_REFERENCE.md
-- ═════════════════════════════════════════════════════════════════════
-- Source de vérité : admin-pro/TARIFS_REFERENCE.md (validé Florian 15/05/2026)
--
-- Corrections :
--   - 100L mural Éco       : 771,30 € → 817 € TTC  (HT : 701,18 → 742,73)
--   - 100L mural Stéatite  : 841,65 € → 887 € TTC  (HT : 765,14 → 806,36)
--   - 150L mural Éco       : 837,34 € → 884 € TTC  (HT : 761,22 → 803,64)
--   - 150L mural Stéatite  : 914,72 € → 961 € TTC  (HT : 831,56 → 873,64)
--
-- Désactivations (active=false, données préservées) — non listées au référentiel :
--   - Chauffe-eau 200L mural Éco
--   - Chauffe-eau 200L mural Stéatite
--   - Chauffe-eau 300L au sol Éco
--   - Chauffe-eau 300L au sol Stéatite
--
-- ⚠ Ces 4 prestations sont cachées du public mais conservées en DB. Pour les
-- réactiver, Florian doit valider leur prix dans TARIFS_REFERENCE.md puis
-- toggler active=true depuis l'admin.
-- ═════════════════════════════════════════════════════════════════════

-- 1. CORRECTIONS prix (4 chauffe-eau mural alignés sur référentiel)
UPDATE public.services
  SET price_ht = 742.73   -- 742,73 × 1,10 = 817,00 € TTC
  WHERE slug = 'chauffe-eau-100l-mural-eco'
     OR (name ILIKE '%100L mural%' AND name ILIKE '%Éco%');

UPDATE public.services
  SET price_ht = 806.36   -- 806,36 × 1,10 = 886,996 ≈ 887,00 € TTC
  WHERE slug = 'chauffe-eau-100l-mural-steatite'
     OR (name ILIKE '%100L mural%' AND name ILIKE '%Stéatite%');

UPDATE public.services
  SET price_ht = 803.64   -- 803,64 × 1,10 = 884,004 ≈ 884,00 € TTC
  WHERE slug = 'chauffe-eau-150l-mural-eco'
     OR (name ILIKE '%150L mural%' AND name ILIKE '%Éco%');

UPDATE public.services
  SET price_ht = 873.64   -- 873,64 × 1,10 = 961,004 ≈ 961,00 € TTC
  WHERE slug = 'chauffe-eau-150l-mural-steatite'
     OR (name ILIKE '%150L mural%' AND name ILIKE '%Stéatite%');

-- 2. DÉSACTIVATIONS (preserve les données, masque du public)
UPDATE public.services
  SET active = false, featured = false
  WHERE slug IN (
    'chauffe-eau-200l-mural-eco',
    'chauffe-eau-200l-mural-steatite',
    'chauffe-eau-300l-au-sol-eco',
    'chauffe-eau-300l-au-sol-steatite'
  )
  OR (name ILIKE '%200L mural%')
  OR (name ILIKE '%300L au sol%')
  OR (name ILIKE '%300L mural%');

-- Vérification finale : doit afficher les bons prix TTC
SELECT
  s.name AS prestation,
  s.price_ht || ' € HT' AS ht,
  ROUND(s.price_ht * (1 + s.vat_rate), 2) || ' € TTC' AS ttc,
  CASE WHEN s.active THEN '🟢 actif' ELSE '⚫ désactivé' END AS statut
FROM public.services s
WHERE s.name ILIKE '%chauffe-eau%' OR s.name ILIKE '%chauffe eau%'
ORDER BY s.name;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu après migration :
--   100L Éco mural      → 817 € TTC ✅
--   100L Stéatite mural → 887 € TTC ✅
--   150L Éco mural      → 884 € TTC ✅
--   150L Stéatite mural → 961 € TTC ✅
--   200L Éco/Stéatite mural → ⚫ désactivés
--   300L Éco/Stéatite au sol → ⚫ désactivés
--   200L Éco/Stéatite au sol → 1332/1456 € TTC ✅ (inchangé)
-- ═══════════════════════════════════════════════════════════════
