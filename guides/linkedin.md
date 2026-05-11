# Guide d'intégration — LinkedIn

**Durée estimée : 10-15 minutes**
**Coût : gratuit**

## Pourquoi

Permet de publier vos chantiers sur la **page entreprise LinkedIn** Help Confort (pas le profil personnel).

## Pré-requis

- Compte LinkedIn personnel admin de la page entreprise Help Confort
- Si pas de page entreprise : la créer sur https://www.linkedin.com/company/setup/new/

## Étapes

### 1. Créer une app LinkedIn Developer

Aller sur **https://www.linkedin.com/developers/apps**

- Cliquer **"Create app"**
- App name : `Help Confort Back-Office`
- Company : sélectionner ta page entreprise Help Confort
- Privacy policy URL : `https://remarkable-dragon-364e2b.netlify.app/mentions-legales.html`
- App logo : uploader le logo Help Confort
- Cocher "I have read and agree…"
- Cliquer **"Create app"**

### 2. Demander les produits requis

Dans le dashboard de l'app → onglet **"Products"** :

- Demander **"Share on LinkedIn"** → request access
- Demander **"Sign In with LinkedIn"** → request access
- Demander **"Marketing Developer Platform"** (si éligible — sinon ignorer pour l'instant, ça limite l'auto-publication)

Validation LinkedIn : peut prendre quelques heures à 1 jour.

### 3. Récupérer Client ID + Client Secret

- Onglet **"Auth"** dans l'app
- Noter **Client ID** et **Client Secret** (cliquer "Show" pour le voir)

### 4. Générer un Access Token

LinkedIn impose OAuth 2.0. Le plus simple est d'utiliser leur outil :

**Option simple — Postman collection LinkedIn :**
1. Importer la collection Postman officielle LinkedIn : https://www.postman.com/linkedin-developer-apis/workspace/linkedin-developer-apis/overview
2. Configurer l'environnement avec Client ID + Secret
3. Exécuter le flow OAuth → tu obtiens un Access Token

**Option développeur — manuelle :**
1. Construire l'URL d'auth :
```
https://www.linkedin.com/oauth/v2/authorization?
  response_type=code
  &client_id={CLIENT_ID}
  &redirect_uri=https://remarkable-dragon-364e2b.netlify.app/admin-pro/settings.html
  &scope=w_member_social%20r_organization_social%20w_organization_social
```
2. Coller dans le navigateur → autoriser → tu es redirigé avec `?code=...`
3. Échanger le code contre un access token via curl :
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -d "grant_type=authorization_code" \
  -d "code={CODE_RECUPERE}" \
  -d "redirect_uri=https://remarkable-dragon-364e2b.netlify.app/admin-pro/settings.html" \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}"
```

Tu reçois un `access_token` (valide 60 jours).

### 5. Récupérer l'Organization URN

```bash
curl https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

Dans la réponse, repérer `organizationalTarget` → format : `urn:li:organization:12345678`

### 6. Coller dans le back-office

- Back-office → **Paramètres** → **LinkedIn**
- Access Token : colle ton token
- Organization URN : colle l'URN (avec le préfixe `urn:li:organization:`)
- Enregistrer

### 7. Vérifier

Voyant à gauche → vert. Statut → "Configuré".

## Renouvellement

Le token expire dans **60 jours**. Le back-office t'enverra une alerte avant. Refaire l'étape 4 quand nécessaire.

## Note

LinkedIn est plus rigide que Meta pour la validation. Si ta demande "Marketing Developer Platform" est refusée, tu peux quand même publier en tant qu'utilisateur (via `w_member_social`), mais pas en tant que page entreprise sans validation manuelle.
