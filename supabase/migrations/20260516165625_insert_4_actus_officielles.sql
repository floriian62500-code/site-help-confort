-- 4 actus officielles HC France adaptées Saint-Omer / Dunkerque
-- Date : 2026-05-16 — status='validation' = visibles dans pile à valider
-- Florian valide en 1 clic + upload son image dans le back-office

insert into public.realisations
(title, description, metier, ville, status, slug, ai_generated, created_at)
values
-- 1) Vitrerie / Double vitrage
(
  'Pourquoi changer ses vitrages : calme, fraîcheur, économies',
  E'Bruit de la rue, salon brûlant en été, fenêtres glacées l\'hiver ? Un double vitrage performant règle les trois d\'un coup : moins de nuisances sonores, meilleur confort thermique, baisse de facture d\'énergie. À Saint-Omer comme à Dunkerque, on vous fait un diagnostic + devis gratuit sous 48h. Pose par techniciens salariés, garantie incluse.',
  'vitrerie', 'Saint-Omer', 'validation',
  'pourquoi-changer-vitrages-calme-fraicheur-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type','actualite','imported_from','hc_fr_manual_adapted','inspired_by','HC France double vitrage','hashtags',array['doublevitrage','isolation','saintomer','dunkerque'],'cta','Demander un devis gratuit'),
  now()
),
-- 2) Plomberie / Chasse d'eau qui fuit
(
  E'Chasse d\'eau qui fuit : jusqu\'à 600 L gaspillés par jour',
  E'Une chasse d\'eau qui coule en continu, c\'est jusqu\'à 600 litres d\'eau perdus chaque jour — et une facture qui s\'envole. Avant les vacances d\'été, prenez 30 secondes pour vérifier vos WC. Nos plombiers Saint-Omer / Dunkerque interviennent sous 48h pour réparer proprement et durablement. Devis gratuit, techniciens salariés.',
  'plomberie', 'Saint-Omer', 'validation',
  'chasse-eau-fuit-600l-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type','actualite','imported_from','hc_fr_manual_adapted','inspired_by','HC France chasse d''eau','hashtags',array['plomberie','chassedeau','saintomer','dunkerque'],'cta','Demander un devis gratuit'),
  now()
),
-- 3) Électricité / Éclairage printemps
(
  E'Changer d\'ambiance avec un nouvel éclairage',
  E'Spots encastrés modernes, bandeaux LED, suspension design… ou tout simplement cet interrupteur qui grésille depuis trop longtemps. Nos électriciens Saint-Omer / Dunkerque interviennent pour installer vos luminaires, moderniser votre éclairage et sécuriser votre installation. Un intérieur plus lumineux, plus chaleureux et parfaitement aux normes.',
  'electricite', 'Saint-Omer', 'validation',
  'changer-ambiance-nouvel-eclairage-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type','actualite','imported_from','hc_fr_manual_adapted','inspired_by','HC France éclairage printemps','hashtags',array['electricite','eclairage','led','saintomer','dunkerque'],'cta','Demander un conseil'),
  now()
),
-- 4) Plomberie / Dégât des eaux conseils
(
  E'Éviter le dégât des eaux : nos conseils pratiques',
  E'Un joint qui fuit, une canalisation mal entretenue, une toiture qui laisse passer l\'eau… et c\'est tout un océan de problèmes qui peut débarquer chez vous : dégâts matériels, assurances, stress. Nos plombiers Saint-Omer / Dunkerque partagent leurs meilleurs conseils pour anticiper les fuites avant qu\'elles ne deviennent un sinistre.',
  'plomberie', 'Saint-Omer', 'validation',
  'eviter-degat-des-eaux-conseils-' || extract(epoch from now())::bigint,
  jsonb_build_object('post_type','actualite','imported_from','hc_fr_manual_adapted','inspired_by','HC France dégât des eaux','hashtags',array['plomberie','degatdeseaux','prevention','saintomer','dunkerque'],'cta','Demander un devis gratuit'),
  now()
);

-- Vérif
select count(*) filter (where (ai_generated->>'imported_from') = 'hc_fr_manual_adapted') as actus_hc_fr_pretes
  from public.realisations;
