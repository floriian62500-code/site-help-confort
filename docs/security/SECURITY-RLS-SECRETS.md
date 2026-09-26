# Paquet SECURITY-RLS-SECRETS — P0-4

*Préparé, non appliqué. Base partagée avec la production.*

## État exact

`supabase/migrations/20260512120000_user_profiles_roles.sql:153` :

```sql
CREATE POLICY app_settings_role_select ON public.app_settings
  FOR SELECT TO authenticated USING (true);
```

L'écriture est réservée aux owners. **La lecture ne l'est pas.** Or cette table porte la clé
secrète Stripe, la clé Anthropic, le `client_secret` et le `refresh_token` Google, les jetons Meta.

**Mesuré le 2026-09-26** avec la clé publiable du site : HTTP 200 mais **tableau vide**. L'anonyme
ne lit donc rien — la faille porte sur les comptes **authentifiés**.

**Ce qui la rend critique, c'est la combinaison** : l'inscription est ouverte. Créer un compte
suffit alors pour lire les secrets. Fermer l'inscription (gate P0 déjà listé ailleurs) réduit
l'exposition sans corriger la politique. Les deux sont nécessaires, et fermer l'inscription est le
geste le plus rapide.

## Correctif minimal

`supabase/_pending_migrations/PROPOSED_app_settings_lecture_restreinte.sql` : la lecture suit la
même règle que l'écriture, `public.is_owner()`. Rien d'autre n'est touché — ni colonnes, ni
données, ni autres politiques.

## Dépendances

Aucune. La fonction `public.is_owner()` existe déjà et sert aux politiques d'écriture.

## Ce qu'il faut vérifier avant d'appliquer

| qui lit `app_settings` | impact |
|---|---|
| pages `admin-pro/` (setup, settings, ai, wizards) | utilisées par un owner → **aucun impact** |
| fonctions edge | lisent en `service_role`, qui ignore la RLS → **aucun impact** |
| compte `viewer` ou `assistant` | verra une liste vide au lieu des secrets → **comportement voulu** |

## Tests

Pas de test automatisé possible sans toucher la base. Vérification manuelle, après application :
avec un compte non-owner, une lecture de `app_settings` doit renvoyer un tableau vide ; avec le
compte owner, les réglages doivent s'afficher comme avant.

## Ordre

1. fermer l'inscription publique (10 secondes, gate déjà identifié) ;
2. appliquer la migration ;
3. ouvrir une page de configuration avec le compte owner pour confirmer.

## Rollback exact

```sql
drop policy if exists app_settings_owner_select on public.app_settings;
create policy app_settings_role_select on public.app_settings
  for select to authenticated using (true);
```

## Interruption de service

Aucune : une politique se remplace sans verrou long ni migration de données.

## GO humain : oui — migration sur base partagée.
