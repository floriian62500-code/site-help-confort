# Guide d'intégration — Facebook + Instagram (Meta)

**Durée estimée : 15-20 minutes**
**Coût : gratuit**

## Pourquoi

Permet de publier automatiquement vos chantiers sur :
- Votre page Facebook (`@depanaudo`)
- Votre compte Instagram Business

Sans intervention manuelle, depuis le back-office.

## Pré-requis

- Compte Facebook personnel admin de la page `@depanaudo`
- Compte Instagram **converti en compte Business** et lié à la page FB
  - Si pas encore fait : Instagram → Paramètres → Compte → "Passer à un compte professionnel" → choisir "Entreprise" → lier à la page FB
- Numéro de téléphone pour validation 2FA (probable)

## Étapes

### 1. Créer une app Meta

Aller sur **https://developers.facebook.com/apps**

- Se connecter avec ton compte Facebook
- Cliquer **"Créer une application"**
- **Cas d'utilisation** : "Autre" → Suivant
- **Type** : choisir **"Entreprise"** → Suivant
- **Nom de l'app** : `Help Confort Back-Office`
- **Email de contact** : ton email
- **Compte business** : choisir le tien (créé si pas existant)
- Cliquer **"Créer l'app"**

### 2. Ajouter les produits

Dans le dashboard de l'app, panneau de gauche → **Ajouter des produits** :

- **Pages API** → cliquer "Configurer"
- **Instagram Graph API** → cliquer "Configurer"

### 3. Récupérer le Page Access Token

Aller sur **https://developers.facebook.com/tools/explorer/**

- En haut à droite, sélectionner ton app `Help Confort Back-Office`
- Cliquer "Get Token" → "Get Page Access Token"
- Choisir la page **`@depanaudo`** (Help Confort Saint-Omer)
- Cliquer "Continue"
- Accorder les permissions demandées :
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_posts`
  - `instagram_basic`
  - `instagram_content_publish`
  - `business_management`

Tu obtiens un **token court** (1h). Pour avoir un token longue durée (60 jours) :

### 4. Échanger contre un token longue durée

Aller sur **https://developers.facebook.com/tools/debug/accesstoken/**

- Coller ton token court
- Cliquer "Debug"
- En bas → "Extend Access Token"
- Tu obtiens un token longue durée (60 jours) → **copie-le** 📋

Ce token expire dans **60 jours**. Tu devras le régénérer à ce rythme (le back-office t'enverra une alerte 7 jours avant).

### 5. Récupérer le Page ID Facebook

- Va sur ta page Facebook `@depanaudo`
- Menu de gauche → **À propos**
- Tout en bas → **ID de la page**
- Copie l'ID (ex : `100064802658263`)

### 6. Récupérer l'Instagram Business Account ID

Toujours dans **Graph API Explorer** :

- Coller dans le champ Query :

```
me/accounts?fields=instagram_business_account
```

- Cliquer "Submit"
- Dans la réponse JSON, repérer `instagram_business_account.id` pour la page Dépan'Audo
- Copie cet ID (format : `17841401234567890`)

### 7. Coller dans le back-office

- Back-office → **Paramètres** → section **Facebook & Instagram**
- Page Access Token : colle le token longue durée
- Page ID Facebook : colle l'ID page
- Instagram Business Account ID : colle l'ID IG
- Cliquer **"Enregistrer"**

### 8. Vérifier

- Voyant à gauche → vert
- Statut en haut de la section → "Configuré"

## Renouvellement du token

Tous les **~55 jours**, refaire les étapes 3-4 pour générer un nouveau token longue durée. Le back-office t'enverra une alerte dans la page Alertes.

## Erreurs courantes

- **"Insufficient permission"** → tu n'as pas accepté toutes les permissions à l'étape 3. Recommence.
- **"Instagram not connected"** → ton compte IG n'est pas converti en Business, ou pas lié à la page FB. Va dans IG → Paramètres → Compte.
- **"Page not found"** → l'ID page est faux. Re-vérifie l'étape 5.

## Sécurité

Le token est stocké dans ta base Supabase (RLS auth). Si compromis, va sur **https://www.facebook.com/settings?tab=business_tools** et révoque-le.
