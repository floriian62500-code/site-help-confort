-- ═════════════════════════════════════════════════════════════════════
-- RÉINITIALISATION TOTALE page Contrats
-- ═════════════════════════════════════════════════════════════════════
-- Demande Florian : "réinitialiser la page contrat"
--
-- 8+ contrats "Jean [TEST]" polluent encore la base. La migration
-- précédente (20260515010000) n'a peut-être pas matché tous les cas.
-- Cette migration est PLUS RADICALE :
--   - Supprime tout contract dont nom contient TEST (en majuscules ou pas)
--   - Supprime tout contract avec téléphone bidon 06 00 00 00 00
--   - Supprime tout contract avec metadata.is_test = true
--   - Supprime tout contract avec montant = 0 (signe certain de test)
--   - Supprime tout contract avec client_email contenant 'test'
-- ═════════════════════════════════════════════════════════════════════

-- Compte avant
DO $$
DECLARE n_before integer;
BEGIN
  SELECT count(*) INTO n_before FROM public.contracts;
  RAISE NOTICE 'Contrats avant purge : %', n_before;
END $$;

-- PURGE RADICALE
DELETE FROM public.contracts
WHERE
  -- Noms évidents de test (insensible casse, peu importe l'orthographe)
  client_first_name ILIKE '%test%'
  OR client_last_name ILIKE '%test%'
  OR client_first_name ILIKE 'jean' AND client_last_name ILIKE '%test%'
  OR (client_first_name || ' ' || client_last_name) ILIKE '%[TEST]%'
  -- Téléphone bidon
  OR client_phone = '06 00 00 00 00'
  OR client_phone = '0600000000'
  OR client_phone = '0612345678'
  -- Email test
  OR client_email ILIKE '%test%'
  OR client_email ILIKE '%@example.%'
  OR client_email = ''
  -- Metadata test
  OR (metadata->>'is_test')::boolean = true
  -- Montant 0 (jamais valide pour un vrai contrat)
  OR monthly_amount = 0
  OR monthly_amount IS NULL;

-- Compte après
DO $$
DECLARE n_after integer;
BEGIN
  SELECT count(*) INTO n_after FROM public.contracts;
  RAISE NOTICE 'Contrats après purge : %', n_after;
END $$;

-- Vérification finale
SELECT
  client_first_name || ' ' || client_last_name AS client,
  type,
  metier,
  monthly_amount || ' €/mois' AS montant,
  status,
  CASE WHEN imported_to_crm_at IS NULL THEN '📥 à importer' ELSE '✓ importé' END AS crm,
  created_at::date AS reçu_le
FROM public.contracts
ORDER BY created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : 0 contrats "Jean [TEST]" restants
-- La page https://depan59-62.fr/admin-pro/contracts.html doit être vide
-- ou ne contenir que des vrais contrats clients.
-- ═══════════════════════════════════════════════════════════════
