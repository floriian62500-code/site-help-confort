# Guide d'intégration — Google Business Profile

**Durée estimée : 25-30 minutes** · **Coût : gratuit**

## Ce que tu vas obtenir

Après cette config, ton back-office pourra :
- ✅ **Synchroniser tes avis Google** (Saint-Omer + Dunkerque) en temps réel dans la page Avis clients
- ✅ **Répondre aux avis Google** directement depuis le back-office (en 1 clic)
- ✅ **Publier des Posts Google** (actualités GBP) sur tes fiches depuis le back-office

Tu auras **7 valeurs** à coller dans **Paramètres → Google Business Profile** :
1. `client_id` (OAuth, étape 5) — **indispensable** pour régénérer le token expiré
2. `client_secret` (OAuth, étape 5) — **indispensable** aussi
3. `access_token` (OAuth Google, étape 6)
4. `refresh_token` (étape 6) — **indispensable**, durée illimitée
5. `account_id_audo` (étape 7) — l'ID du compte Dépan'Audo
6. `location_id_st_omer` (étape 7) — fiche Saint-Omer
7. `location_id_dk` (étape 7) — fiche Dunkerque

> 💡 **Plus simple** : utilise l'**assistant pas-à-pas** dans le back-office → **Assistant Google** (menu latéral) plutôt que ce guide manuel. Tout est piloté avec progression sauvegardée et tests automatiques.

## Pré-requis

- Compte Google **admin** des fiches Help Confort Saint-Omer ET Dunkerque
- Navigateur (Chrome ou Safari)
- ~30 min sans interruption

---

# Étape 1 — Créer un projet Google Cloud (5 min)

Google exige qu'on passe par leur "Cloud Console" pour activer leurs APIs (même les gratuites).

1. Ouvre **https://console.cloud.google.com/**

2. Connecte-toi avec **le compte Google qui gère tes fiches Business Profile**

3. En haut de la page, clique sur le sélecteur de projet (à côté de "Google Cloud") → **"Nouveau projet"**

4. Remplis :
   - **Nom du projet** : `Help Confort Back-Office`
   - **Organisation** : laisse "Aucune organisation"
   - Clique **"Créer"**

5. Patiente ~30 secondes que le projet soit créé. Vérifie en haut que le projet sélectionné est bien `Help Confort Back-Office`.

---

# Étape 2 — Activer les APIs Google (3 min)

1. Dans le menu de gauche (☰), va dans **"APIs et services"** → **"Bibliothèque"**

2. Une par une, **active ces 2 APIs** (cherche dans la barre puis clique **Activer**) :
   - **My Business Account Management API**
   - **My Business Business Information API**

⚠️ Si tu vois une 3e API "Google My Business API" — **NE l'active PAS**, elle est obsolète (deprecated par Google fin 2024).

3. Reviens dans **"APIs et services"** → **"APIs et services activés"** → vérifie que les 2 sont bien en vert "Activé".

---

# Étape 3 — Demander l'accès aux APIs Business Profile (15 min, async)

⚠️ **Étape importante et bloquante** : Google exige qu'on demande une **autorisation manuelle** pour accéder à leurs APIs Business Profile (pour éviter les abus).

1. Va sur **https://support.google.com/business/contact/api_default**

2. Remplis le formulaire :
   - **Nom de l'organisation** : `HELP! Confort Saint-Omer`
   - **Adresse e-mail** : l'email Google qui gère tes fiches
   - **Nom du contact** : Florian Dhaillecourt
   - **Numéro du projet Google Cloud** : récupère-le dans console.cloud.google.com → menu principal → "Tableau de bord" → "Numéro du projet" (12 chiffres)
   - **Description du cas d'usage** : copie-colle ceci :
     > Synchronisation des avis Google Business Profile de nos 2 fiches (Help Confort Saint-Omer et Help Confort Dunkerque) dans notre back-office interne, pour permettre à notre équipe de répondre aux avis depuis un point central. Volume estimé : ~500 avis/an et ~50 réponses/mois.

3. Soumets le formulaire.

⏱️ **Délai d'approbation Google** : généralement **1 à 3 jours ouvrés**. Tu recevras un mail de confirmation. **Sans cette approbation, l'API renvoie des erreurs 403**.

---

# Étape 4 — Configurer l'écran de consentement OAuth (3 min)

Pendant que Google traite ta demande, on continue.

1. Dans Google Cloud Console → **"APIs et services"** → **"Écran de consentement OAuth"**

2. Choisis **"Externe"** → clique "Créer"

3. Remplis les infos de base :
   - **Nom de l'application** : `Help Confort Back-Office`
   - **E-mail d'assistance utilisateur** : ton email
   - **Logo de l'application** : optionnel
   - **Domaines autorisés** : `helpconfort.com` (et ton URL Netlify si différente)
   - **Adresse e-mail du développeur** : ton email
   - Clique **"Enregistrer et continuer"**

4. **Champs d'application (Scopes)** : clique "Ajouter ou retirer des champs d'application" → cherche et coche :
   - `https://www.googleapis.com/auth/business.manage`
   - Clique "Update" puis "Enregistrer et continuer"

5. **Utilisateurs test** : ajoute **ton email Google** (celui qui gère les fiches) → Enregistrer

6. **Résumé** → "Retour au tableau de bord"

---

# Étape 5 — Créer des identifiants OAuth (3 min)

1. **"APIs et services"** → **"Identifiants"** → **"+ Créer des identifiants"** → **"ID client OAuth"**

2. **Type d'application** : "Application Web"

3. **Nom** : `Help Confort Back-Office`

4. **URIs de redirection autorisées** : ajoute exactement :
   ```
   https://developers.google.com/oauthplayground
   ```
   (On utilise le Playground Google pour générer le premier token, c'est officiel et sécurisé.)

5. Clique **"Créer"**

6. Une popup affiche **Client ID** + **Client Secret** — **copie-les et garde-les précieusement** (mets-les dans un texte temporaire à part).

---

# Étape 6 — Générer le Refresh Token via OAuth Playground (5 min)

1. Ouvre **https://developers.google.com/oauthplayground**

2. En haut à droite, clique sur l'icône **⚙️ paramètres**

3. Coche **"Use your own OAuth credentials"** → colle ton **Client ID** et **Client Secret** de l'étape 5 → ferme la modale

4. **Step 1** dans la colonne de gauche : dans le champ texte, tape :
   ```
   https://www.googleapis.com/auth/business.manage
   ```
   → Clique **"Authorize APIs"** (bouton bleu)

5. Une page Google s'ouvre. **Connecte-toi avec le compte qui gère tes fiches**. Tu verras un avertissement "Cette application n'est pas validée par Google" — c'est normal en mode développement. Clique **"Paramètres avancés"** → **"Accéder à Help Confort Back-Office (non sécurisé)"** → **"Continuer"**.

6. Tu reviens dans OAuth Playground. **Step 2** : clique **"Exchange authorization code for tokens"**.

7. Tu verras apparaître **Access token** (court, ~1h) ET **Refresh token** (longue durée).

8. **Garde précieusement** :
   - `access_token` (mais expire dans 1h, sera régénéré auto par l'Edge Function)
   - `refresh_token` (LE VRAI TRÉSOR — durée illimitée si pas révoqué)

---

# Étape 7 — Récupérer les Account ID et Location IDs (5 min)

Maintenant qu'on a un access_token, on peut demander à Google la liste de tes fiches.

1. Toujours dans OAuth Playground, **Step 3** : dans le champ "Request URI", tape :
   ```
   https://mybusinessaccountmanagement.googleapis.com/v1/accounts
   ```
   → Clique **"Send the request"**

2. La réponse JSON affiche tes comptes business. Cherche celui qui s'appelle **"Dépan'Audo"** (ou similaire). Note la valeur de **`name`** — ce sera quelque chose comme `accounts/123456789012345`.

   → **Copie cette valeur complète** (avec le préfixe `accounts/`) — c'est ton **`account_id_audo`**

3. Maintenant on récupère les locations. Tape :
   ```
   https://mybusinessbusinessinformation.googleapis.com/v1/accounts/123456789012345/locations?readMask=name,title,storefrontAddress
   ```
   ⚠️ Remplace `123456789012345` par TON numéro de compte (sans le préfixe `accounts/` cette fois).

4. La réponse liste tes 2 fiches : Saint-Omer + Dunkerque. Note les **`name`** de chacune :
   - Pour **Saint-Omer** : `locations/1234567890123456789` → **`location_id_st_omer`**
   - Pour **Dunkerque** : `locations/9876543210987654321` → **`location_id_dk`**

---

# Étape 8 — Coller le tout dans le back-office (2 min)

1. Va dans ton back-office → **Paramètres** → **Google Business Profile**

2. Colle dans l'ordre :
   - **Client ID OAuth** : `123456...apps.googleusercontent.com` ← **NOUVEAU, obligatoire**
   - **Client Secret OAuth** : `GOCSPX-xxxx...` ← **NOUVEAU, obligatoire**
   - **Access Token (OAuth Google)** : `ya29.xxxx...`
   - **Refresh Token** : `1//xxxx...`
   - **Account ID (Dépan'Audo)** : `accounts/123456789012345`
   - **Location ID Saint-Omer** : `locations/1234567890123456789`
   - **Location ID Dunkerque** : `locations/9876543210987654321`

3. Clique **Enregistrer**

4. Clique **Tester la connexion** — un diagnostic complet s'affiche (credentials ✓, refresh ✓, account ✓, locations ✓, lecture des avis ✓). Si tout est vert, tu peux passer à l'étape 9.

5. Va dans **Avis clients** → clique **Synchroniser** → tes avis Google des 2 fiches apparaissent (Saint-Omer + Dunkerque).

---

# Étape 9 — Activer le refresh automatique du token (optionnel)

L'Access Token Google expire au bout d'1h. L'Edge Function `sync-reviews` et `reply-review` sont déjà codées pour :
- Détecter si le token est expiré
- Utiliser le `refresh_token` pour en générer un nouveau automatiquement
- Sauvegarder le nouveau token dans `app_settings.gbp.access_token`

Donc une fois le `refresh_token` collé, **tu n'auras plus jamais à te reconnecter**. Ça tourne en autonomie.

---

# Problèmes courants

## "Erreur 403 — API not enabled / Not authorized"
→ L'étape 3 (autorisation Google) n'est pas encore validée. Patiente quelques jours, retry. Tu recevras un mail de Google.

## "Invalid_grant" en utilisant le refresh_token
→ Le refresh_token a été révoqué. Refais l'étape 6 (OAuth Playground) pour en obtenir un nouveau.

## Les avis Google ne remontent pas mais pas d'erreur
→ Vérifie que la fiche Google Business est bien vérifiée (le badge "Vérifié" sur Google Maps). Sinon Google bloque l'accès API même avec autorisation.

## Token expire toutes les heures et c'est lourd
→ Le refresh est automatique côté Edge Function. Si ça ne marche pas, vérifie que `refresh_token` est bien stocké en BDD (`SELECT value FROM app_settings WHERE key='gbp'`).

---

# Notes de sécurité

- Le `refresh_token` est l'équivalent d'un mot de passe — ne le partage jamais publiquement
- Il est stocké en BDD Supabase avec RLS authentifiée → seuls tes utilisateurs auth peuvent y accéder
- Si compromis, va dans **https://myaccount.google.com/permissions** → révoque "Help Confort Back-Office" → recommence l'étape 6
