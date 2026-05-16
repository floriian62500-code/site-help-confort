update public.realisations
   set image_after = 'https://depan59-62.fr/images/actus-officielles/vitrerie-double-vitrage.webp'
 where (ai_generated->>'imported_from') = 'hc_fr_manual_adapted'
   and metier = 'vitrerie'
   and image_after is null;

update public.realisations
   set image_after = 'https://depan59-62.fr/images/actus-officielles/plomberie-chasse-eau.webp'
 where (ai_generated->>'imported_from') = 'hc_fr_manual_adapted'
   and metier = 'plomberie'
   and image_after is null;

update public.realisations
   set image_after = 'https://depan59-62.fr/images/actus-officielles/electricite-eclairage-led.webp'
 where (ai_generated->>'imported_from') = 'hc_fr_manual_adapted'
   and metier = 'electricite'
   and image_after is null;
