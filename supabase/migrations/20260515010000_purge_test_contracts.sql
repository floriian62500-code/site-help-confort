-- ═════════════════════════════════════════════════════════════════════
-- PURGE des contrats de test "Jean [TEST]"
-- ═════════════════════════════════════════════════════════════════════
-- Le bouton "🧪 Tester le pipeline" insérait un faux contrat à chaque test,
-- ce qui a pollué la base avec 6+ entrées "Jean [TEST]".
-- Cette migration supprime tout ce qui matche les critères de test.
--
-- IMPORTANT : la suppression est définitive. Si tu veux garder une trace
-- pour audit, change DELETE en UPDATE SET status='archive'.
-- ═════════════════════════════════════════════════════════════════════

-- Critères : tout contrat dont metadata.is_test = true OU dont le nom
-- contient "[TEST]" OU dont l'email == test@example.com
DELETE FROM public.contracts
WHERE (metadata->>'is_test')::boolean = true
   OR client_last_name ILIKE '%[TEST]%'
   OR client_first_name ILIKE '%[TEST]%'
   OR client_email = 'test@example.com'
   OR client_phone = '06 00 00 00 00';

-- Vérification : compte ce qui reste
SELECT
  count(*) AS contracts_restants,
  count(*) FILTER (WHERE imported_to_crm_at IS NULL) AS a_importer,
  count(*) FILTER (WHERE imported_to_crm_at IS NOT NULL) AS importes
FROM public.contracts;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : 0 contrats de test après cette migration
-- ═══════════════════════════════════════════════════════════════
