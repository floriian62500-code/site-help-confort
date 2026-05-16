-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATE des 55 publications HC France avec leurs images
-- ═══════════════════════════════════════════════════════════════════════════
-- Pour chaque post, on associe une image du même mois en ordre alphabétique
-- (row_number = seq dans le mois). Match approximatif mais cohérent.
-- ═══════════════════════════════════════════════════════════════════════════

with image_map as (
  select * from (values
  (1, 1, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-01.webp'),
  (1, 2, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-02.webp'),
  (1, 3, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-03.webp'),
  (1, 4, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-04.webp'),
  (1, 5, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-05.webp'),
  (1, 6, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-06.webp'),
  (1, 7, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-07.webp'),
  (1, 8, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-08.webp'),
  (1, 9, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-09.webp'),
  (1, 10, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-10.webp'),
  (1, 11, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-11.webp'),
  (1, 12, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-12.webp'),
  (1, 13, 'https://depan59-62.fr/images/actus-imports-hc-fr/01-13.webp'),
  (2, 1, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-01.webp'),
  (2, 2, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-02.webp'),
  (2, 3, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-03.webp'),
  (2, 4, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-04.webp'),
  (2, 5, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-05.webp'),
  (2, 6, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-06.webp'),
  (2, 7, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-07.webp'),
  (2, 8, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-08.webp'),
  (2, 9, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-09.webp'),
  (2, 10, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-10.webp'),
  (2, 11, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-11.webp'),
  (2, 12, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-12.webp'),
  (2, 13, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-13.webp'),
  (2, 14, 'https://depan59-62.fr/images/actus-imports-hc-fr/02-14.webp'),
  (3, 1, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-01.webp'),
  (3, 2, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-02.webp'),
  (3, 3, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-03.webp'),
  (3, 4, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-04.webp'),
  (3, 5, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-05.webp'),
  (3, 6, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-06.webp'),
  (3, 7, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-07.webp'),
  (3, 8, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-08.webp'),
  (3, 9, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-09.webp'),
  (3, 10, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-10.webp'),
  (3, 11, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-11.webp'),
  (3, 12, 'https://depan59-62.fr/images/actus-imports-hc-fr/03-12.webp'),
  (4, 1, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-01.webp'),
  (4, 2, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-02.webp'),
  (4, 3, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-03.webp'),
  (4, 4, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-04.webp'),
  (4, 5, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-05.webp'),
  (4, 6, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-06.webp'),
  (4, 7, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-07.webp'),
  (4, 8, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-08.webp'),
  (4, 9, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-09.webp'),
  (4, 10, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-10.webp'),
  (4, 11, 'https://depan59-62.fr/images/actus-imports-hc-fr/04-11.webp'),
  (5, 1, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-01.webp'),
  (5, 2, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-02.webp'),
  (5, 3, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-03.webp'),
  (5, 4, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-04.webp'),
  (5, 5, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-05.webp'),
  (5, 6, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-06.webp'),
  (5, 7, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-07.webp'),
  (5, 8, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-08.webp'),
  (5, 9, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-09.webp'),
  (5, 10, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-10.webp'),
  (5, 11, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-11.webp'),
  (5, 12, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-12.webp'),
  (5, 13, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-13.webp'),
  (5, 14, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-14.webp'),
  (5, 15, 'https://depan59-62.fr/images/actus-imports-hc-fr/05-15.webp')
  ) as v(mois_num, seq, url)
),
numbered_posts as (
  select
    r.id,
    extract(month from r.created_at)::int as mois_num,
    row_number() over (
      partition by extract(month from r.created_at)
      order by r.created_at, r.id
    ) as seq
  from public.realisations r
  where (r.ai_generated->>'imported_from') = 'helpconfortfr_planning_2026'
    and (r.image_after is null or r.image_after = '')
)
update public.realisations r
   set image_after = i.url
  from numbered_posts np
  join image_map i on i.mois_num = np.mois_num and i.seq = np.seq
 where r.id = np.id;

-- Verification
select count(*) as posts_avec_image
  from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026'
   and image_after is not null
   and image_after <> '';
