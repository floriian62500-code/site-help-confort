-- Insertion de 2 actus adaptées des publications officielles HC France
-- (vitrerie double vitrage + plomberie chasse d'eau fuite)
-- Date : 2026-05-16 — adapté pour Saint-Omer / Dunkerque

insert into public.realisations
(title, description, metier, ville, status, slug, ai_generated, created_at)
values
(
  'Pourquoi changer ses vitrages : calme, fraîcheur, économies',
  E'Bruit de la rue, salon brûlant en été, fenêtres glacées l\'hiver ? Un double vitrage performant règle les trois d\'un coup : moins de nuisances sonores, meilleur confort thermique, baisse de facture d\'énergie. À Saint-Omer comme à Dunkerque, on vous fait un diagnostic + devis gratuit sous 48h. Pose par techniciens salariés, garantie incluse.',
  'vitrerie',
  'Saint-Omer',
  'validation',
  'pourquoi-changer-vitrages-calme-fraicheur-' || extract(epoch from now())::bigint,
  jsonb_build_object(
    'post_type', 'actualite',
    'imported_from', 'hc_fr_manual_adapted',
    'inspired_by', 'HELP Confort France — post double vitrage',
    'hashtags', array['doublevitrage','isolationthermique','confort','saintomer','dunkerque'],
    'cta', 'Demander un devis gratuit'
  ),
  now()
),
(
  E'Chasse d\'eau qui fuit : jusqu\'à 600 L gaspillés par jour',
  E'Une chasse d\'eau qui coule en continu, c\'est jusqu\'à 600 litres d\'eau perdus chaque jour — et une facture qui s\'envole. Avant les vacances d\'été, prenez 30 secondes pour vérifier vos WC. Nos plombiers Saint-Omer / Dunkerque interviennent sous 48h pour réparer proprement et durablement. Devis gratuit, techniciens salariés.',
  'plomberie',
  'Saint-Omer',
  'validation',
  'chasse-eau-fuit-600l-par-jour-' || extract(epoch from now())::bigint,
  jsonb_build_object(
    'post_type', 'actualite',
    'imported_from', 'hc_fr_manual_adapted',
    'inspired_by', 'HELP Confort France — post chasse d''eau fuite',
    'hashtags', array['plomberie','chassedeau','economiedeau','saintomer','dunkerque'],
    'cta', 'Demander un devis gratuit'
  ),
  now()
);

-- Vérif
select id, title, status, metier from public.realisations
 where (ai_generated->>'imported_from') = 'hc_fr_manual_adapted'
 order by created_at desc
 limit 5;
