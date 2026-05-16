# ⚠️ Erreur sync 16/05/2026

- **FB** : non exécuté — `SUPABASE_SERVICE_ROLE_KEY` introuvable
- **Reviews** : non exécuté — `SUPABASE_SERVICE_ROLE_KEY` introuvable

## Diagnostic

Le fichier `.autopush/.env` ne contient que `SUPABASE_DB_PASSWORD` (mot de passe DB), pas la clé `service_role` nécessaire pour appeler les Edge Functions `sync-facebook-posts` et `sync-reviews` (les deux ont `verify_jwt = true` par défaut).

## Action requise

Ajouter la ligne suivante dans [`~/Documents/Claude/Projects/SITE INTERNET/.autopush/.env`](file:///Users/HP/Documents/Claude/Projects/SITE INTERNET/.autopush/.env) :

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Récupérer la clé ici : [Supabase Dashboard → API Settings](https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/api) → section **Project API keys** → `service_role` (secret).

Une fois la clé en place, la sync repartira automatiquement au prochain run programmé (06h30) — ou la relancer manuellement.
