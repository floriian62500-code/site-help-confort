insert into public.realisations
(title, description, metier, ville, status, slug, ai_generated, created_at)
values
(
  'Pourquoi changer ses vitrages : calme, fraîcheur, économies',
  E'Bruit de la rue, salon brûlant en été, fenêtres glacées l\'hiver ? Un double vitrage performant règle les trois d\'un coup : moins de nuisances sonores, meilleur confort thermique, baisse de facture d\'énergie. À Saint-Omer comme à Dunkerque, on vous fait un diagnostic + devis gratuit sous 48h. Pose par techniciens salariés, garantie incluse.',
  'vitrerie',
  'Saint-Omer',
  'validation',
  'pourquoi-changer-vitrages-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type', 'actualite', 'imported_from', 'hc_fr_manual_adapted', 'inspired_by', 'HC France — double vitrage', 'cta', 'Demander un devis gratuit'),
  now()
),
(
  E'Chasse d\'eau qui fuit : jusqu\'à 600 L gaspillés par jour',
  E'Une chasse d\'eau qui coule en continu, c\'est jusqu\'à 600 litres d\'eau perdus chaque jour — et une facture qui s\'envole. Avant les vacances d\'été, prenez 30 secondes pour vérifier vos WC. Nos plombiers Saint-Omer / Dunkerque interviennent sous 48h pour réparer proprement et durablement. Devis gratuit, techniciens salariés.',
  'plomberie',
  'Saint-Omer',
  'validation',
  'chasse-eau-fuit-600l-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type', 'actualite', 'imported_from', 'hc_fr_manual_adapted', 'inspired_by', 'HC France — chasse d''eau', 'cta', 'Demander un devis gratuit'),
  now()
),
(
  'Nouveau printemps, nouvel éclairage : modernise et sécurise',
  E'Spots encastrés, bandeaux LED, suspensions design… ou simplement cet interrupteur qui grésille depuis trop longtemps ? La lumière transforme une pièce. Nos électriciens Saint-Omer / Dunkerque installent vos luminaires, modernisent votre éclairage et sécurisent votre installation aux normes NF C 15-100. Conseil et devis gratuits.',
  'electricite',
  'Saint-Omer',
  'validation',
  'nouvel-eclairage-printemps-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type', 'actualite', 'imported_from', 'hc_fr_manual_adapted', 'inspired_by', 'HC France — éclairage printemps', 'cta', 'Demander un conseil'),
  now()
);
