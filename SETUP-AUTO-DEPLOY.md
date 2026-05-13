# Auto-déploiement Supabase — Configuration initiale (3 minutes)

À faire **une seule fois**. Après ça, chaque migration SQL ajoutée dans `supabase/migrations/` est déployée automatiquement à chaque `git push`. Plus jamais de copier-coller dans le SQL Editor.

## Pourquoi

Avant : tu écris du SQL → tu ouvres Supabase → tu copies-colles → tu cliques Run → tu espères que ça passe.
Après : tu écris du SQL → tu push → GitHub Actions le déploie pendant que tu fais autre chose.

## Les 3 étapes

### 1. Générer un token Supabase (1 min)

1. Va sur https://supabase.com/dashboard/account/tokens
2. Bouton vert **« Générer un nouveau jeton »**
3. Nom : `github-actions-helpconfort`
4. **Copie le token** qui s'affiche (commence par `sbp_…`). Tu ne le reverras plus.

### 2. Récupérer le mot de passe Postgres (30 s)

1. Va sur https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/settings/database
2. Section **« Database password »**
3. Si tu te souviens du mot de passe → utilise-le. Sinon :
   - Clique **« Reset database password »**
   - **Copie le nouveau mot de passe** (tu ne le reverras plus)
   - Note : ça ne casse rien, juste à mettre à jour si une autre intégration l'utilise

### 3. Ajouter les 2 secrets à GitHub (1 min)

1. Va sur ton repo : https://github.com/floriian62500-code/aide-confort/settings/secrets/actions
2. Clique **« New repository secret »** :
   - Nom : `SUPABASE_ACCESS_TOKEN`
   - Valeur : le token `sbp_…` de l'étape 1
   - **Add secret**
3. **« New repository secret »** à nouveau :
   - Nom : `SUPABASE_DB_PASSWORD`
   - Valeur : le mot de passe Postgres de l'étape 2
   - **Add secret**

C'est tout. Les deux secrets sont chiffrés par GitHub, jamais visibles dans les logs, et ne s'affichent plus jamais en clair.

## Vérification

1. Va dans l'onglet **Actions** de ton repo : https://github.com/floriian62500-code/aide-confort/actions
2. Tu dois voir un workflow **« Supabase — Auto deploy SQL migrations »**
3. Au prochain push qui modifie un `.sql` dans `supabase/migrations/`, il tourne et applique la migration

## Utilisation au quotidien

### Pour Claude (moi)
Je crée un fichier dans `supabase/migrations/` avec un timestamp UTC (ex. `20260514093000_ma_migration.sql`) → commit → push → c'est en ligne.

### Pour toi (manuel)
Si tu veux modifier des données depuis l'interface admin (ex. changer le prix d'une offre dans `services.html` ou `contracts.html` → onglet Offres), ça met à jour directement la base, sans passer par une migration. Les migrations servent uniquement aux changements de **structure** (nouvelle table, nouvelle colonne) ou aux **données initiales**.

## En cas de problème

### Le workflow échoue avec « SUPABASE_ACCESS_TOKEN secret manquant »
→ Tu n'as pas (ou mal) ajouté le secret. Refais l'étape 3.

### Le workflow échoue avec une erreur SQL
→ Le message d'erreur est visible dans les logs Actions. Le plus souvent : contrainte FK incompatible, syntaxe SQL, ou typo. Corrige le fichier `.sql` → re-push → ça repart.

### Tu veux relancer manuellement
Onglet **Actions** → workflow → bouton **« Run workflow »**.

### Tu veux désactiver temporairement
Renomme le fichier `.github/workflows/supabase-deploy.yml` en `.disabled.yml` et push.

## Limites connues

- Les **Edge Functions** sont aussi déployées par le même workflow (best-effort, ne fait pas planter le job en cas d'échec).
- Le workflow **ne supprime pas** une migration déjà appliquée — c'est Postgres qui décide. Pour annuler, créer une nouvelle migration qui inverse les changements.
