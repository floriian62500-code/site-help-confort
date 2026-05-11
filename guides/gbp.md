# Guide d'intégration — Google Business Profile

**Durée estimée : 30-45 minutes** (le plus long des 5)
**Coût : gratuit**

## Pourquoi

Permet :
- De publier des **"Posts Google"** (actualités) directement sur tes fiches Google Business Saint-Omer + Dunkerque
- De **synchroniser les avis Google** en temps réel dans le dashboard
- De répondre aux avis depuis le back-office

## Pré-requis

- Compte Google admin de la fiche Google Business Profile (Saint-Omer ET Dunkerque)
- Accès à Google Cloud Console (gratuit)

## Étapes

### 1. Créer un projet Google Cloud

Aller sur **https://console.cloud.google.com/**

- En haut, cliquer le sélecteur de projet → **"New Project"**
- Nom : `Help Confort Back-Office`
- Organisation : laisser par défaut
- Créer

Bien sélectionner ce projet ensuite dans le sélecteur en haut.

### 2. Activer les APIs

Menu de gauche → **APIs & Services** → **Library**

Rechercher et activer **les 4 APIs suivantes** (une par une) :

1. **Google My Business Account Management API**
2. **Google My Business Business Information API**
3. **My Business Posts API**
4. **My Business Q&A API**

⚠️ Note : Google a fragmenté l'ancienne API GMB en plusieurs sous-APIs. Tu dois toutes les activer.

### 3. Demander l'accès à l'API GBP

L'API GBP nécessite une **demande d'accès manuelle** auprès de Google :

- Aller sur **https://developers.google.com/my-business/content/prereqs**
- Cliquer **"Request access"** → remplir le formulaire :
  - Project Number : visible dans Cloud Console → IAM → "Project number"
  - Use case : "We use this API to publish updates and read reviews for our verified Google Business Profile locations"
- Soumettre

Délai d'approbation : **1 à 3 jours ouvrés**. Google t'enverra un email.

⚠️ Sans cette validation, tu ne peux pas appeler l'API. Lance cette étape **en premier**.

### 4. Créer des credentials OAuth 2.0

En attendant la validation, prépare les credentials :

Menu Cloud Console → **APIs & Services** → **Credentials**

- Cliquer **"Create credentials"** → **"OAuth client ID"**
- Si demandé : configurer l'écran de consentement (User type : External, app name : Help Confort, support email)
- Type d'application : **Web application**
- Name : `Help Confort Back-Office`
- Authorized redirect URIs : `https://remarkable-dragon-364e2b.netlify.app/admin-pro/settings.html`
- Créer

Copie le **Client ID** et **Client Secret**.

### 5. Effectuer le flow OAuth (après validation Google)

Une fois que Google a approuvé ta demande (étape 3) :

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id={CLIENT_ID}
  &redirect_uri=https://remarkable-dragon-364e2b.netlify.app/admin-pro/settings.html
  &response_type=code
  &scope=https://www.googleapis.com/auth/business.manage
  &access_type=offline
  &prompt=consent
```

- Coller dans navigateur → autoriser
- Récupérer le `code` dans l'URL de retour
- Échanger le code contre les tokens :

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "code={CODE}" \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "redirect_uri=https://remarkable-dragon-364e2b.netlify.app/admin-pro/settings.html" \
  -d "grant_type=authorization_code"
```

Tu obtiens :
- `access_token` (valide 1h)
- `refresh_token` (permanent, sert à régénérer l'access_token)

### 6. Récupérer Account ID et Location IDs

```bash
# Liste de tes comptes
curl https://mybusinessaccountmanagement.googleapis.com/v1/accounts \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

Repère le `name` (format : `accounts/12345...`) → c'est ton **Account ID**.

```bash
# Liste tes locations (fiches GBP)
curl https://mybusinessbusinessinformation.googleapis.com/v1/{ACCOUNT_NAME}/locations \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

Tu obtiens 2 locations (Saint-Omer + Dunkerque). Note les 2 IDs (format : `locations/9876...`).

### 7. Coller dans le back-office

- Back-office → **Paramètres** → **Google Business Profile**
- Access Token, Refresh Token, Account ID
- Location ID Saint-Omer
- Location ID Dunkerque
- Enregistrer

### 8. Vérifier

Voyant vert. Le dashboard commencera à afficher les vrais avis Google (intégration Vague D).

## Note importante

Le refresh_token permet de régénérer l'access_token automatiquement à chaque expiration (sans réintervention). Le back-office gère ça côté Edge Function.

Si tu révoques l'app dans https://myaccount.google.com/permissions, il faudra refaire le flow OAuth.
