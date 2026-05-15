-- ═════════════════════════════════════════════════════════════════════
-- FORCE from_email = noreply@depan59-62.fr (SANS condition)
-- ═════════════════════════════════════════════════════════════════════
-- La migration 20260514120000 utilisait un UPDATE conditionnel qui ne
-- semble pas avoir matché. Le test pipeline retourne :
--   "The helpconfort-saintomer.fr domain is not verified"
-- → preuve que from_email est toujours sur l'ancien domaine fictif.
--
-- Cette migration FORCE la valeur correcte, sans condition. À appliquer
-- une seule fois pour rattraper le retard.
-- ═════════════════════════════════════════════════════════════════════

UPDATE public.app_settings
SET value = jsonb_set(value, '{from_email}', '"noreply@depan59-62.fr"'::jsonb)
WHERE key = 'notification_emails';

-- Insert si la ligne n'existe pas du tout
INSERT INTO public.app_settings (key, value)
VALUES ('notification_emails', jsonb_build_object(
  'subscriptions_to', 'saint-omer@helpconfort.com',
  'orders_to',        'saint-omer@helpconfort.com',
  'leads_to',         'saint-omer@helpconfort.com',
  'reply_to',         'saint-omer@helpconfort.com',
  'from_name',        'HELP! Confort — Site',
  'from_email',       'noreply@depan59-62.fr',
  'agences', jsonb_build_object(
    'saint-omer', jsonb_build_object('email','saint-omer@helpconfort.com','phone','03 66 10 01 34','postal_codes','62500,62219,62570,62960,62575'),
    'dunkerque',  jsonb_build_object('email','dunkerque@helpconfort.com','phone','03 66 10 01 34','postal_codes','59140,59210,59380,59279,59123')
  )
))
ON CONFLICT (key) DO NOTHING;

-- Vérification
SELECT
  key,
  value->>'from_email'        AS from_email,
  value->>'subscriptions_to'  AS subscriptions_to,
  value->>'reply_to'          AS reply_to
FROM public.app_settings
WHERE key = 'notification_emails';

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu :
--   from_email        = noreply@depan59-62.fr
--   subscriptions_to  = saint-omer@helpconfort.com
--   reply_to          = saint-omer@helpconfort.com
-- ═══════════════════════════════════════════════════════════════
