-- ═════════════════════════════════════════════════════════════════════
-- PURGE des leads de test
-- ═════════════════════════════════════════════════════════════════════
-- Demande Florian (15/05/2026) : "nettoyer les leads"
--
-- Les 3 leads visibles dans la base sont tous des tests :
--   - fezezf efzefz (Plomberie URGENCE, ferf@fref.fr, 06836003333)
--   - Wizard (Souscription, test@helpconfort.com, 0612345678)
--   - D'haillecourt (Souscription, helconfort.com — typo, 0683600333)
--
-- Cette migration supprime tout ce qui matche des critères de test :
--   - nom contenant "test", "wizard", "demo", ou caractères aléatoires
--   - email avec domaine test (test@, example.com, fref.fr)
--   - email avec typo (helconfort sans P)
--   - téléphones de test classiques (0612345678, 0683600333, 06 00 00 00 00)
-- ═════════════════════════════════════════════════════════════════════

-- Compte avant
DO $$
DECLARE n_before integer;
BEGIN
  SELECT count(*) INTO n_before FROM public.leads;
  RAISE NOTICE 'Leads avant purge : %', n_before;
END $$;

-- Suppression ciblée
DELETE FROM public.leads
WHERE
  -- Noms évidents de test
  nom ILIKE '%test%'
  OR nom ILIKE '%wizard%'
  OR nom ILIKE '%demo%'
  OR nom IN ('fezezf efzefz', 'fezezf', 'efzefz', 'jean test', 'jean dupont')
  -- Pattern "azertyuiop" / clavier aléatoire (3+ consonnes ou voyelles d'affilée bizarres)
  OR nom ~ '^[a-z]{4,}\s+[a-z]{4,}$'  -- mots tout en minuscules sans majuscule (Wizard accepté car capitale)
  -- Emails de test
  OR email ILIKE '%@example.%'
  OR email ILIKE '%@test.%'
  OR email = 'test@helpconfort.com'
  OR email ILIKE '%@fref.fr'
  OR email ILIKE '%@fref.%'
  -- Emails avec typo helconfort (sans P)
  OR email ILIKE '%@helconfort.com'
  OR email ILIKE '%@helconfort.fr'
  -- Téléphones de test
  OR telephone IN ('0612345678', '06 00 00 00 00', '0683600333', '06836003333', '0606060606', '0123456789');

-- Compte après
DO $$
DECLARE n_after integer;
BEGIN
  SELECT count(*) INTO n_after FROM public.leads;
  RAISE NOTICE 'Leads après purge : %', n_after;
END $$;

-- Vérification : liste ce qui reste
SELECT id, nom, email, telephone, status, created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════
-- Note : si tu veux re-supprimer manuellement plus tard, va dans
-- l'admin (https://depan59-62.fr/admin-pro/leads.html) et utilise
-- le bouton Supprimer dans la modale de chaque lead.
-- ═══════════════════════════════════════════════════════════════
