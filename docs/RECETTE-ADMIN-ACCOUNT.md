# Compte administrateur de RECETTE — spécification (préparé, activation gouvernée)

⚠️ Le compte n'est **pas créé**. Sa création = un accès/credential → **validation groupée** au moment du déploiement.

## Auth en place
Supabase Auth (email + mot de passe) → `getSession` → table `public.user_profiles`
(`user_id`, `full_name`, `role`, `is_active`). Rôles existants : `owner`, `assistant`.
RLS leads : `assistant` peut lire/écrire/mettre à jour ; **suppression = `owner` uniquement** (donc pas d'irréversible pour assistant).

## Compte recette recommandé
- **Email** : `recette@depan59-62.fr` (clairement marqué RECETTE)
- **full_name** : `RECETTE — NE PAS UTILISER EN PROD`
- **Rôle** : `assistant` (lecture/écriture, **pas** de suppression owner-only → aucune action irréversible de prod)
- **is_active** : bascule immédiate `true`/`false` pour activer/désactiver
- **Mot de passe** : temporaire, fourni hors dépôt, à roter/désactiver après recette

## Ce qu'il permet de tester
Connexion · déconnexion · expiration de session · pages autorisées · lecture des **leads de test** ·
consultation photos (URL signée) · modification d'un **contenu de recette** · contrôle des permissions.

## Actions interdites / à surveiller
- Aucune suppression de lead (owner-only) · aucune opération prod irréversible
- ⚠️ Réserve : le rôle `assistant` peut lire **tous** les leads (dont réels). Si tu veux un accès
  **strictement limité aux données de test**, il faut un **nouveau rôle `recette`** + policies RLS dédiées
  → migration RLS (gouvernée). Recommandation : commencer en `assistant` (simple, désactivable), passer à
  un rôle `recette` restreint si tu le souhaites (option décrite ci-dessous).

## Procédure de CRÉATION (à exécuter sur GO — via Dashboard Supabase Auth + SQL)
1. Supabase → Authentication → Add user : `recette@depan59-62.fr` + mot de passe temporaire (hors dépôt).
2. SQL (remplacer `<uuid>` par le user_id créé) :
```sql
insert into public.user_profiles (user_id, full_name, role, is_active)
values ('<uuid>', 'RECETTE — NE PAS UTILISER EN PROD', 'assistant', true)
on conflict (user_id) do update set role='assistant', is_active=true;
```

## Procédure de DÉSACTIVATION / SUPPRESSION (après recette)
```sql
update public.user_profiles set is_active=false where full_name ilike 'RECETTE%';
```
Puis Supabase → Authentication → supprimer l'utilisateur `recette@depan59-62.fr`.

## Logs
Connexions visibles dans Supabase → Authentication → Logs. Contrôler les accès du compte RECETTE.

## Option rôle `recette` restreint (si demandé — migration RLS gouvernée)
Créer un rôle applicatif `recette` + policies RLS n'autorisant que les leads `status='archive'`/tagués test,
lecture seule sur le reste, aucune écriture sur les tables sensibles. À préparer en migration séparée.
