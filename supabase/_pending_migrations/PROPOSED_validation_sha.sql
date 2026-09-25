-- PROPOSITION — NON APPLIQUÉE. Ce dossier n'est PAS déployé automatiquement (voir
-- supabase/migrations/LISEZ-MOI.md) : l'appliquer est une décision humaine, sur base partagée
-- avec la production.
--
-- Objet (CHATGPT-2026-09-25-CONTROL-3 §5) : rattacher chaque validation à l'état du code qu'elle a
-- vu, pour qu'elle se périme toute seule quand ce code change.
--
-- Le mécanisme fonctionne DÉJÀ sans cette migration : la colonne existante `recette_version` peut
-- porter l'empreinte calculée par scripts/release/versions-recette.mjs, et
-- scripts/release/validation-fraicheur.mjs classe les validations sans rien écrire en base.
-- Ce qui suit n'ajoute que la traçabilité (quel commit, quel build) et une vue de lecture.
--
-- Rien ici ne supprime ni ne modifie une ligne existante.

alter table public.recette_validation
  add column if not exists feature_id text,           -- identifiant stable de l'élément jugé
  add column if not exists code_sha   text,           -- commit vu au moment du clic
  add column if not exists build_id   text;           -- déploiement vu au moment du clic

comment on column public.recette_validation.feature_id is
  'Identifiant stable de l''élément validé (mod_id). Sert de clé de rattachement.';
comment on column public.recette_validation.code_sha is
  'Commit exact que le validateur avait sous les yeux. Sans lui, une validation ne prouve rien.';
comment on column public.recette_validation.recette_version is
  'Empreinte du contenu des fichiers de l''élément (versions-recette.mjs). Si elle diffère de
   l''empreinte actuelle, la validation est périmée — automatiquement, sans geste humain.';

-- Lecture : la dernière décision par élément, avec son âge en commits.
create or replace view public.v_validations_dernieres as
select distinct on (coalesce(feature_id, mod_id))
       coalesce(feature_id, mod_id) as feature_id,
       page, status, comment, recette_version, code_sha, build_id, actor, created_at
from public.recette_validation
where kind = 'feedback'
order by coalesce(feature_id, mod_id), created_at desc;

comment on view public.v_validations_dernieres is
  'Dernière décision par élément. La fraîcheur se juge en comparant recette_version à l''empreinte
   actuelle du code (assets/recette-versions.json) : la base ne sait pas seule si le code a bougé.';
