# 🚀 Guide d'installation du back-office HELP Confort

> Ce guide t'explique pas à pas comment activer ton **back-office en ligne**
> pour publier articles + photos chantiers depuis n'importe où, sans m'appeler.
>
> ⏱ Durée totale : **1h** (la première fois uniquement). Ensuite tu publies en 5 min.

---

## 🎯 Ce que tu vas obtenir

À la fin de ce guide :
- ✅ Une URL **`https://www.depan59-62.fr/admin/`** où tu te connectes avec ton email
- ✅ Un éditeur visuel pour publier **articles d'actualité** et **photos chantiers** (avant/après)
- ✅ Tes contributions apparaissent automatiquement sur **`/actualites`** et **`/realisations`**
- ✅ Tout est **gratuit** (Netlify + Decap CMS, pas de carte bancaire)

---

## 📋 Prérequis

Tu as besoin de **2 comptes gratuits** (création 5 min chacun) :
1. **GitHub** — pour stocker ton site → https://github.com/signup
2. **Netlify** — pour héberger et donner accès au back-office → https://app.netlify.com/signup
   - 💡 Astuce : connecte-toi avec ton compte GitHub, ça simplifie tout

---

## 🛠 ÉTAPE 1 — Mettre ton site sur GitHub (15 min)

1. Va sur **https://github.com** (connecté avec ton compte)
2. Clique sur **« New repository »** (bouton vert en haut à droite)
3. Remplis :
   - **Repository name** : `helpconfort-saintomer-site`
   - **Description** : "Site internet HELP Confort Saint-Omer / Dunkerque"
   - Coche **Private** (ton site reste privé)
   - **Add a README** : ❌ (laisse décoché)
4. Clique **« Create repository »**

5. Sur ton ordi, ouvre un terminal dans le dossier `SITE INTERNET/` et tape :
```bash
git init
git add .
git commit -m "Premier dépôt du site HELP Confort"
git branch -M main
git remote add origin https://github.com/TON_PSEUDO/helpconfort-saintomer-site.git
git push -u origin main
```
*(Remplace `TON_PSEUDO` par ton pseudo GitHub.)*

> 💡 Si tu n'as jamais utilisé Git, installe **GitHub Desktop** (https://desktop.github.com/) — c'est une appli avec boutons, pas de terminal nécessaire.

---

## 🌐 ÉTAPE 2 — Connecter à Netlify (10 min)

1. Va sur **https://app.netlify.com**
2. Clique **« Add new site »** → **« Import an existing project »**
3. Choisis **GitHub** → autorise Netlify → sélectionne ton repo `helpconfort-saintomer-site`
4. Laisse les options par défaut (pas de build command, publish directory = `.`)
5. Clique **« Deploy site »**
6. ⏱ Attends 30 secondes — Netlify te donne une URL temporaire du type `https://random-name-12345.netlify.app`

> 🎉 **Ton site est en ligne !**

---

## 🔐 ÉTAPE 3 — Activer Identity (le système de login) (5 min)

Dans Netlify, sur ton site :

1. **Site configuration** → **Identity** → **Enable Identity**
2. **Registration preferences** → **Invite only** ⚠ *(important : empêche n'importe qui de créer un compte)*
3. **External providers** : tu peux activer Google et/ou Email (au choix)
4. **Services** → **Git Gateway** → **Enable Git Gateway** ⚠ *(c'est ce qui permet au CMS d'écrire sur GitHub)*

---

## 👤 ÉTAPE 4 — T'inviter toi-même comme admin (2 min)

1. Toujours dans **Identity** → onglet **« Invite users »**
2. Entre ton email → **Send invite**
3. Tu reçois un email **« You've been invited »**
4. Clique le lien, choisis ton mot de passe
5. ✅ Tu es maintenant admin

---

## 📝 ÉTAPE 5 — Te connecter au back-office

1. Va sur **`https://[ton-site].netlify.app/admin/`** *(remplace par ton URL Netlify)*
2. Clique **« Login with Netlify Identity »**
3. Connecte-toi avec ton email + mot de passe

> 🎉 **Tu es dans ton back-office !**

Tu vois dans le menu de gauche :
- 📰 **Actualités** — pour publier articles, conseils, infos saison
- 🛠 **Réalisations / Chantiers** — pour publier photos avant/après
- ⚙️ **Configuration générale** — pour modifier téléphone, slogan, tarifs, emails

---

## ✍️ ÉTAPE 6 — Publier ton premier article

1. Clique **📰 Actualités** → **« New Actualité »** (bouton en haut à droite)
2. Remplis le formulaire :
   - **Titre** : « 5 conseils pour entretenir sa chaudière avant l'hiver »
   - **Date** : aujourd'hui
   - **Image principale** : glisse-dépose une photo
   - **Catégorie** : Conseils
   - **Zone concernée** : Les deux
   - **Résumé** : « Avant les premières gelées, voici les 5 gestes simples pour éviter une panne… »
   - **Contenu** : écris ton article (titres, listes, photos comme dans Word)
3. Coche **Publier**
4. Clique **« Publish » → « Publish now »**

⏱ Patiente 30 secondes (Netlify regénère le site automatiquement)

5. Va voir **`https://[ton-site].netlify.app/actualites.html`** → ton article y est !

---

## 🎨 ÉTAPE 7 — Publier ton premier chantier avant/après

1. Clique **🛠 Réalisations** → **« New Réalisation »**
2. Remplis :
   - **Titre** : « Rénovation salle de bain à Longuenesse »
   - **Date** : la date du chantier
   - **Métier** : Rénovation
   - **Ville** : Longuenesse
   - **Zone** : Saint-Omer
   - **Photo AVANT** : upload
   - **Photo APRÈS** : upload
   - **Description** : « Baignoire vétuste remplacée par une douche italienne plain-pied… »
   - **Durée** : 5 jours
3. Publie

→ Ton chantier apparaît automatiquement sur `/realisations.html` avec **slider avant/après interactif**

---

## 🌍 ÉTAPE 8 — Brancher ton vrai nom de domaine

Dans Netlify : **Site configuration** → **Domain management** → **Add custom domain**
- Entre `depan59-62.fr`
- Suis les instructions DNS (à configurer chez ton registraire de domaine — OVH, Gandi…)

> ⚠️ Si tu n'as pas encore de domaine, tu peux laisser l'URL Netlify (`xxx.netlify.app`) en attendant.

---

## 🔄 Workflow quotidien (après installation)

1. Tu veux poster un article ? → tu vas sur `tonsite.com/admin/`
2. Tu te connectes
3. Tu remplis le formulaire et tu cliques **Publish**
4. ⏱ 30 secondes plus tard, c'est en ligne sur ton site public

**C'est tout. 5 minutes par publication, depuis ton ordi, ton tel, ta tablette.**

---

## 🆘 Problèmes fréquents

**« Login impossible »** → Vérifie que tu as bien activé **Identity** ET **Git Gateway** dans Netlify (étape 3).

**« Mes articles ne s'affichent pas »** → Vérifie que tu as bien coché **Publier** dans le CMS, et patiente 1 min (le rebuild prend du temps).

**« Erreur lors de l'upload d'image »** → Vérifie que ton image fait moins de 5 Mo. Au-delà, redimensionne avec n'importe quel outil (TinyPNG.com, Squoosh.app).

**« Je veux ajouter un autre admin (collaborateur, conjoint·e) »** → Netlify → Identity → Invite users → entre son email.

---

## 📞 Si tu bloques

Reviens me voir sur Cowork avec :
- L'étape qui pose problème (numéro)
- Le message d'erreur exact
- Une capture d'écran si possible

Je te débloque en 2 minutes.
