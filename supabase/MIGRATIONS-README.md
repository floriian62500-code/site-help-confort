# Migrations Supabase — Auto-deploy

À chaque push sur `main` modifiant un fichier ici, le workflow GitHub Actions `.github/workflows/supabase-deploy.yml` exécute automatiquement `supabase db push --linked` sur le projet `btcbjwqiivhpwoszomhg`. Plus besoin de copier-coller dans le SQL Editor.

## Setup initial (une fois)

Deux secrets à ajouter dans GitHub → Settings → Secrets and variables → Actions → New repository secret :

| Nom                       | Où le trouver                                                                                          |
|---------------------------|--------------------------------------------------------------------------------------------------------|
| `SUPABASE_ACCESS_TOKEN`   | https://supabase.com/dashboard/account/tokens → "Generate new token" → nom `github-actions`            |
| `SUPABASE_DB_PASSWORD`    | Mot de passe de la base Postgres du projet (visible une fois lors de la création du projet, sinon le réinitialiser : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/database → "Reset database password") |

Une fois ajoutés, ils sont chiffrés et ne sont jamais visibles dans les logs.

## Workflow

```
Tu écris une nouvelle migration   →   git push   →   GitHub Action s'exécute   →   Supabase à jour
   supabase/migrations/...sql                          (~30 secondes)
```

## Convention de nommage

```
YYYYMMDDHHMMSS_description_snake_case.sql
```

Exemple : `20260514093000_add_loyalty_program.sql`

Le timestamp doit être strictement croissant — c'est lui qui détermine l'ordre d'application. Pour générer un timestamp valide :

```bash
date -u +%Y%m%d%H%M%S
```

## Migrations existantes

| Fichier                                          | Contenu                                              |
|--------------------------------------------------|------------------------------------------------------|
| `20260511000000_baseline_existing.sql`           | app_settings, leads, reviews, scheduled_publications |
| `20260511150000_cron_sync_reviews.sql`           | Cron job de sync avis Google                          |
| `20260512120000_user_profiles_roles.sql`         | Profils utilisateurs + rôles Owner/Assistant/Lecteur  |
| `20260512120100_contracts_interventions.sql`     | Contrats clients + interventions/RDV                  |
| `20260513000000_services_catalog.sql`            | Catalogue de prestations en ligne                     |

Toutes les migrations sont idempotentes (utilisent `CREATE … IF NOT EXISTS`, `ON CONFLICT DO UPDATE`).

## Exécution manuelle (depuis ton Mac)

Si tu préfères pousser depuis ton terminal au lieu d'attendre GitHub Actions :

```bash
cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
supabase login   # une fois, ouvre le navigateur
supabase link --project-ref btcbjwqiivhpwoszomhg
supabase db push
```

## Vérifier l'historique des migrations appliquées

Dans le SQL Editor Supabase :

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;
```

## Rollback

Supabase ne supporte pas le rollback automatique. Pour annuler une migration :

1. Créer une nouvelle migration qui annule les changements (DROP TABLE, ALTER, etc.)
2. Pousser → l'inverse est appliqué

Ne **jamais** supprimer un fichier de migration déjà appliqué : ça crée des incohérences.
