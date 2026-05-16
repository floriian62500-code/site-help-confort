-- Pour les posts dont l'image n'a PAS été matchée par row XLSX, vide image_after
-- pour que Florian uploade manuellement à la validation.
with bad_posts as (
  select * from (values
  (4, 4),
  (4, 6),
  (4, 9),
  (2, 6),
  (2, 9),
  (2, 11),
  (1, 4),
  (1, 6),
  (1, 9),
  (5, 1),
  (5, 2),
  (5, 3),
  (5, 4),
  (5, 5),
  (5, 6),
  (5, 7),
  (5, 8),
  (5, 9),
  (5, 10),
  (5, 11),
  (3, 3),
  (3, 6),
  (3, 9)
  ) v(mois_num, seq)
),
numbered as (
  select
    r.id,
    extract(month from r.created_at)::int as mois_num,
    row_number() over (partition by extract(month from r.created_at) order by r.created_at, r.id) as seq
  from public.realisations r
  where (r.ai_generated->>'imported_from') = 'helpconfortfr_planning_2026'
)
update public.realisations r
   set image_after = null
  from numbered n
  join bad_posts b on b.mois_num = n.mois_num and b.seq = n.seq
 where r.id = n.id;

-- Vérification
select 
  count(*) filter (where image_after is not null) as avec_image,
  count(*) filter (where image_after is null) as sans_image
  from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';
