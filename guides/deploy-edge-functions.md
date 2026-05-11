# Déploiement des Edge Functions Supabase

**Durée estimée : 10 minutes (une seule fois)**

Les Edge Functions sont du code serveur qui tourne sur l'infrastructure Supabase. Elles sont nécessaires pour :
- Appeler l'API Claude (génération IA)
- Publier sur Facebook / Instagram
- Publier sur LinkedIn
- Publier sur Google Business Profile

## Pré-requis

- Node.js installé sur ton Mac (vérifie avec `node --version` dans Terminal — sinon installe-le depuis https://nodejs.org/)
- Le dossier du projet ouvert dans Terminal

## Étape 1 : Installer Supabase CLI

Ouvre **Terminal** (cmd+espace → "Terminal" → entrée).

```bash
npm install -g supabase
```

Si erreur de permission, fais :
```bash
sudo npm install -g supabase
```

Vérifie :
```bash
supabase --version
```

## Étape 2 : Se positionner dans le dossier du projet

```bash
cd ~/Documents/Claude/Projects/SITE\ INTERNET
```

(Note l'antislash devant l'espace dans le nom du dossier.)

## Étape 3 : Se connecter à Supabase

```bash
supabase login
```

Ça va ouvrir ton navigateur sur Supabase pour t'authentifier. Accepte.

## Étape 4 : Lier le projet local au projet distant

```bash
supabase link --project-ref btcbjwqiivhpwoszomhg
```

Si on te demande le mot de passe de la base, tape celui que tu as défini lors de la création du projet Supabase.

## Étape 5 : Déployer les 4 Edge Functions

```bash
supabase functions deploy generate-content --no-verify-jwt
supabase functions deploy publish-meta --no-verify-jwt
supabase functions deploy publish-linkedin --no-verify-jwt
supabase functions deploy publish-gbp --no-verify-jwt
supabase functions deploy sitemap --no-verify-jwt
```

Chaque commande met ~10-30 secondes. Tu dois voir "Deployed Function …" à la fin.

⚠️ Le flag `--no-verify-jwt` est important : il permet à ton back-office (front-end) d'appeler la fonction avec ton token utilisateur, et la fonction vérifie elle-même l'auth (plus sécurisé que sans flag mais accessible).

## Étape 6 : Vérifier dans Supabase Dashboard

Va sur **https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg/functions**

Tu dois voir les 4 fonctions listées avec un statut **"Active"**.

## Tester `generate-content`

1. Va sur ton back-office → **Paramètres → Claude IA**
2. Colle ta clé Anthropic (`sk-ant-api03-…`) → Enregistrer
3. Va sur **Réalisations** → **Créer un chantier**
4. Choisis Métier + Ville → un bandeau violet "Générer titre, descriptions et hashtags avec Claude IA" apparaît
5. Clique **Générer** → patiente 5-15 secondes
6. Les champs titre/description se remplissent automatiquement

## Mettre à jour une fonction

Si tu modifies une fonction, relance simplement la commande de déploiement correspondante :

```bash
supabase functions deploy generate-content --no-verify-jwt
```

## Voir les logs en cas d'erreur

```bash
supabase functions logs generate-content --tail
```

Ou via le dashboard Supabase → Functions → cliquer sur la fonction → onglet **Logs**.

## Problèmes courants

- **"Function not found"** → la fonction n'a pas été déployée. Refais l'étape 5.
- **"401 Unauthorized" côté front** → l'utilisateur n'est pas connecté. Reconnecte-toi sur `/admin-pro/login.html`.
- **"Clé Anthropic non configurée"** → tu n'as pas sauvegardé la clé dans Paramètres. Refais.
- **"Réponse Claude non parsable"** → rare, problème ponctuel d'API Claude. Réessaie. Si persistant, change de modèle dans Paramètres.

## Notes de sécurité

- Les clés API sont stockées dans la table `app_settings` avec **RLS authentifiée** → seuls tes utilisateurs Supabase Auth y ont accès
- Les Edge Functions vérifient le JWT à chaque appel
- Aucune clé n'est exposée côté navigateur ni dans le code HTML
