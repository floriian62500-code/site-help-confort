-- Cleanup TOTAL de l'import HC France du 2026-05-16
delete from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';

-- Vérification : doit retourner 0
select count(*) as restants
  from public.realisations
 where (ai_generated->>'imported_from') = 'helpconfortfr_planning_2026';
