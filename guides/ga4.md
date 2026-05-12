# Guide d'intégration — Google Analytics 4

**Durée estimée : 20 minutes** · **Coût : gratuit**

> 💡 **Méthode recommandée** : utilise l'**[Assistant pas-à-pas GA4](../admin-pro/wizard-ga4.html)** dans le back-office (menu → Assistants de connexion → Google Analytics 4). Il guide les 7 étapes (Property ID, projet GCP, API, service account, clé JSON, partage propriété) avec progression sauvegardée et diagnostic auto. Ce guide markdown reste utile en référence.

## Pourquoi

Affiche dans le dashboard les **vraies statistiques visiteurs** du site :
- Sessions, utilisateurs uniques, vues de pages
- Sources de trafic (Google, Facebook, direct)
- Pages les plus consultées
- Conversions (clics téléphone, formulaires)

## Pré-requis

- Compte Google admin de la propriété GA4 de ton site
- Si GA4 pas encore configuré sur le site : voir étape 0

### Étape 0 — Vérifier que GA4 est en place

Aller sur **https://analytics.google.com/**

Si tu vois `helpconfort-saintomer.fr` dans la liste des propriétés → c'est OK, passe à l'étape 1.

Sinon :
- Créer une propriété "Help Confort"
- Suivre les instructions Google pour installer le tag GA4 sur le site (le code `gtag.js` doit être présent dans `<head>` du site)
- *Note : ton site a déjà le tag GA4 installé selon ce que j'ai vu dans le code. Vérifie quand même.*

## Étapes

### 1. Récupérer le Property ID

Aller sur **https://analytics.google.com/** → ton compte Help Confort

- En bas à gauche → ⚙️ **Admin**
- Colonne "Property" → cliquer **"Property details"** ou **"Property Settings"**
- En haut à droite : **Property ID** (format : `123456789` — 9 chiffres)
- Copier cet ID

### 2. Créer un projet Google Cloud

Aller sur **https://console.cloud.google.com/**

- Sélectionner ou créer un projet `Help Confort Back-Office` (peut être le même que pour GBP)

### 3. Activer l'API Google Analytics Data

Menu → **APIs & Services** → **Library**

- Rechercher **"Google Analytics Data API"**
- Cliquer **"Enable"**

### 4. Créer un compte de service

Menu → **APIs & Services** → **Credentials**

- **Create credentials** → **Service account**
- Service account name : `help-confort-ga4-reader`
- Skip les rôles (laisser vide)
- **Done**

Tu vois maintenant le compte de service avec un email du genre `help-confort-ga4-reader@helpconfort-xxxxx.iam.gserviceaccount.com`. **Copie cet email**.

### 5. Générer la clé JSON

- Cliquer sur le compte de service que tu viens de créer
- Onglet **Keys** → **Add Key** → **Create new key**
- Type : **JSON**
- Cliquer **Create**

Un fichier JSON se télécharge automatiquement. **Garde-le précieusement** — il ne sera pas régénérable.

### 6. Donner accès au compte de service à ta propriété GA4

Retour sur **https://analytics.google.com/**

- ⚙️ Admin → Property → **Property access management**
- Cliquer le **+** en haut à droite → **Add users**
- Email : colle l'email du compte de service (étape 4)
- Direct roles : **Viewer**
- Cocher "Notify new users by email" (optionnel)
- Cliquer **Add**

### 7. Coller dans le back-office

- Back-office → **Paramètres** → **Google Analytics 4**
- Property ID : colle l'ID (9 chiffres)
- Service Account JSON : **ouvre le fichier JSON téléchargé à l'étape 5 avec TextEdit, copie tout son contenu et colle-le dans le champ**

⚠️ Le contenu doit commencer par `{` et finir par `}`. Ne pas modifier.

- Enregistrer

### 8. Vérifier

Voyant vert. Le dashboard affichera les vraies stats dès que la Vague D sera déployée.

## Sécurité du JSON

Le JSON contient une **clé privée**. Stockage Supabase RLS auth uniquement, jamais exposé côté navigateur. Si compromis :
- Aller sur Cloud Console → IAM → compte de service → Keys → supprimer la clé compromise
- Générer une nouvelle clé (étape 5) → mettre à jour dans Paramètres
