-- ═════════════════════════════════════════════════════════════════════
-- NOTIFS EMAIL : router vers saint-omer@helpconfort.com en attendant
-- l'intégration Apogée par Dynoco
-- ═════════════════════════════════════════════════════════════════════
-- Demande Florian : "envoyer les demandes a saint-omer@helpconfort.com"
-- Met à jour les 3 adresses (souscriptions, commandes, leads) + reply_to.
-- Préserve les agences existantes (st-omer + dunkerque) au cas où une
-- souscription publique aurait `agence` renseigné.
-- ═════════════════════════════════════════════════════════════════════

UPDATE public.app_settings
SET value =
  jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(value, '{subscriptions_to}', '"saint-omer@helpconfort.com"'::jsonb),
        '{orders_to}',        '"saint-omer@helpconfort.com"'::jsonb
      ),
      '{leads_to}',           '"saint-omer@helpconfort.com"'::jsonb
    ),
    '{reply_to}',             '"saint-omer@helpconfort.com"'::jsonb
  )
WHERE key = 'notification_emails';

-- Si la ligne n'existait pas, on l'insère avec les bons défauts
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

-- ═══════════════════════════════════════════════════════════════
-- Vérif :
--   SELECT key, value FROM app_settings WHERE key='notification_emails';
-- Tous les champs subscriptions_to/orders_to/leads_to/reply_to doivent
-- être à 'saint-omer@helpconfort.com'
-- ═══════════════════════════════════════════════════════════════
