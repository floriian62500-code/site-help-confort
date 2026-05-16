-- ═════════════════════════════════════════════════════════════════════
-- FIX : notification_emails par défaut pointent vers le bon domaine
-- ═════════════════════════════════════════════════════════════════════
-- Pb : migration 20260513200000 utilisait `noreply@helpconfort-saintomer.fr`
-- (domaine inexistant) et `ON CONFLICT DO UPDATE` qui écrasait les changements
-- de Florian à chaque déploiement.
--
-- Fix : remplace par `noreply@depan59-62.fr` (le domaine du site, qui a
-- les DKIM Resend configurés dans Gandi), et garde les autres champs
-- tels que Florian les aura modifiés ensuite (DO NOTHING).
-- ═════════════════════════════════════════════════════════════════════

-- 1. Update conditionnel : ne touche QUE les champs qui sont encore aux
--    valeurs par défaut (helpconfort-saintomer.fr) — préserve les modifs admin
UPDATE public.app_settings
SET value = jsonb_set(
  value,
  '{from_email}',
  '"noreply@depan59-62.fr"'::jsonb
)
WHERE key = 'notification_emails'
  AND value->>'from_email' IN (
    'noreply@helpconfort-saintomer.fr',
    'noreply@help-confort.com',
    ''
  );

-- 2. Si pas du tout présent (cas où la migration précédente n'a pas tourné)
INSERT INTO public.app_settings (key, value)
VALUES ('notification_emails', jsonb_build_object(
  'subscriptions_to', 'florian.dhaillecourt@helpconfort.com',
  'orders_to',        'florian.dhaillecourt@helpconfort.com',
  'leads_to',         'florian.dhaillecourt@helpconfort.com',
  'reply_to',         'florian.dhaillecourt@helpconfort.com',
  'from_name',        'HELP Confort — Site',
  'from_email',       'noreply@depan59-62.fr',
  'agences', jsonb_build_object(
    'saint-omer', jsonb_build_object('email','saint-omer@helpconfort.com','phone','03 66 10 01 34','postal_codes','62500,62219,62570,62960,62575'),
    'dunkerque',  jsonb_build_object('email','dunkerque@helpconfort.com','phone','03 66 10 01 34','postal_codes','59140,59210,59380,59279,59123')
  )
))
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- Résultat attendu : "Success. N row affected" (1 si update, 0 sinon)
-- Vérification :
--   SELECT key, value->>'from_email' FROM app_settings WHERE key='notification_emails';
-- doit retourner : noreply@depan59-62.fr
-- ═══════════════════════════════════════════════════════════════
