# Ce dossier est appliqué AUTOMATIQUEMENT en production

`.github/workflows/supabase-deploy.yml` exécute `supabase db push --linked` à chaque poussée sur
`main`. **Tout fichier `.sql` déposé ici finit donc par s'exécuter sur la base de production**, qui
est partagée avec la recette.

## Règle

- Une migration **validée et destinée à être appliquée** : ici.
- Une **proposition**, un brouillon, un correctif en attente de décision : dans
  `supabase/_pending_migrations/`, qui n'est jamais exécuté.
- Un **retour arrière** (`*.ROLLBACK.sql`) : dans `_pending_migrations/` également. Un rollback
  rangé ici annulerait son propre correctif à la migration suivante.

## Pourquoi cette note existe

Le 2026-09-24, en préparant l'inventaire de l'écart recette/production, j'ai trouvé deux fichiers
`PROPOSED_*` dans ce dossier — dont un qui durcit l'insertion dans `leads`, la table qui reçoit
toutes les demandes du site. Une fusion vers `main` les aurait **appliqués sans décision**, et un
durcissement mal calibré de `leads` casse le formulaire public.

Ils sont désormais dans `_pending_migrations/`. Le même piège avait déjà été relevé ailleurs avec
des fichiers `_rollback` rangés au milieu des migrations.
