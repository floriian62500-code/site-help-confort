# 🔄 Synchronisation automatique Facebook → site

> Ce guide t'explique comment **récupérer automatiquement tous tes posts Facebook (texte + images + stats)** et les publier sur ton site, sans intervention manuelle.
>
> ⏱ Setup initial : **30 minutes** (la première fois). Ensuite : 1 commande pour tout synchroniser.

---

## 🎯 Ce que ça va faire

Une fois en place, en lançant **une seule commande** dans ton terminal :

1. ✅ Récupère **toutes tes publications** de la page Facebook « Help Confort ST OMER »
2. ✅ Télécharge automatiquement **toutes les images** de chaque post
3. ✅ Crée une **page actualité HTML** par publication (avec photo en bannière)
4. ✅ Met à jour `content/actualites/index.json` pour que tout apparaisse sur `/actualites.html`
5. ✅ Récupère les **stats** (vues, réactions, partages) — facultatif

Le script est **idempotent** : tu peux le relancer 10 fois, il ne créera pas de doublons. Il ajoute juste les nouveaux posts depuis le dernier run.

---

## 📋 Prérequis

- Un **compte Facebook personnel** (le tien — déjà admin de la page Help Confort ST OMER)
- **Python 3** installé sur ton ordi (déjà installé sur Mac/Linux ; sur Windows : [python.org](https://www.python.org/downloads/))
- ~30 minutes de tranquillité

---

## ÉTAPE 1 — Créer l'App Facebook Developer (10 min)

> 💡 **Pourquoi ?** Pour que mon script puisse parler à Facebook en ton nom, il faut une « App Facebook » qui sert d'intermédiaire. C'est gratuit, ça reste privé.

1. Va sur **[developers.facebook.com](https://developers.facebook.com)** et clique **« Se connecter »** (avec ton compte Facebook habituel).

2. Clique en haut à droite sur **« Mes apps »** → **« Créer une app »**.

3. Choisis le type **« Autre »** → **« Suivant »**.

4. Choisis le sous-type **« Entreprise »** → **« Suivant »**.

5. Remplis :
   - **Nom de l'app** : `helpconfort-sync` (ou ce que tu veux)
   - **Email de contact** : ton email
   - **Compte Business Portfolio** : sélectionne ton compte Help Confort (sinon laisse vide)
   - Clique **« Créer une app »**

6. Tu arrives sur le **Tableau de bord** de l'app. ✅

---

## ÉTAPE 2 — Ajouter le produit « Pages API » (5 min)

1. Dans le menu gauche du tableau de bord, descends jusqu'à **« Ajouter des produits »**.

2. Trouve la carte **« Pages API »** (icône bleue avec un drapeau) → clique **« Configurer »**.

3. Une fois ajouté, tu verras dans le menu gauche **« Pages API »**. Tu peux passer à l'étape suivante.

---

## ÉTAPE 3 — Générer un Page Access Token courte durée (5 min)

> 💡 **Le Page Access Token est la « clé »** qui permet au script de récupérer tes posts. On va d'abord générer une version courte durée, puis l'échanger contre une version longue durée (60 jours).

1. Va sur **[developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)** (Graph API Explorer).

2. En haut à droite :
   - **Application Meta** : sélectionne `helpconfort-sync` (ton app)
   - **User or Page** : clique → choisis **Get Page Access Token**
   - Sélectionne **« Help Confort ST OMER »**

3. Dans le panneau de droite, clique **« Add Permissions »** et coche :
   - ✅ `pages_show_list`
   - ✅ `pages_read_engagement`
   - ✅ `pages_read_user_content`
   - ✅ `read_insights` (pour les stats)

4. Clique **« Generate Access Token »** en haut → autorise.

5. Tu vois maintenant un long token qui commence par `EAA…`. **Copie-le**.

> ⚠️ Ce token expire dans 1 heure. On va l'échanger contre un token longue durée à l'étape suivante.

---

## ÉTAPE 4 — Échanger contre un token longue durée (5 min)

> 💡 Un token longue durée dure **60 jours**. Tu n'auras à le régénérer que tous les 2 mois.

1. Récupère ton **App ID** et **App Secret** :
   - Tableau de bord de ton app → **« Paramètres » → « Général »**
   - **App ID** : visible en haut (15 chiffres)
   - **App Secret** : clique « Afficher » → entre ton mot de passe FB

2. Ouvre un terminal et tape (en remplaçant les 3 valeurs entre crochets) :

```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=[TON_APP_ID]&client_secret=[TON_APP_SECRET]&fb_exchange_token=[LE_TOKEN_DE_L_ETAPE_3]"
```

3. La réponse ressemble à :
```json
{"access_token":"EAA...LONGSTRING...","token_type":"bearer"}
```

→ **Garde ce nouveau token bien précieusement**. C'est lui qu'on va utiliser.

---

## ÉTAPE 5 — Configurer le script (3 min)

1. Dans le dossier `SITE INTERNET/`, crée un fichier `.env` (avec le point au début) :

```bash
# Token Facebook longue durée (à régénérer tous les 60 jours)
FB_PAGE_ACCESS_TOKEN=EAA...le_token_long_lived_de_l_etape_4...

# ID de la page Help Confort ST OMER
FB_PAGE_ID=100064802658263
```

> 🔒 **TRÈS IMPORTANT** : ne mets **JAMAIS** ce fichier `.env` sur GitHub ! J'ai déjà ajouté `.env` à `.gitignore` (à vérifier).

---

## ÉTAPE 6 — Lancer la première synchronisation (1 min)

Dans le terminal, dans le dossier `SITE INTERNET/` :

```bash
python3 scripts/sync-facebook-posts.py
```

Tu verras défiler :
```
🔄 Récupération des posts depuis Facebook…
✓ 47 posts trouvés
📥 Téléchargement de 38 images…
✓ images/posts/2026-04-14_panneau-pvc.jpg
✓ images/posts/2026-04-29_mitigeur.jpg
…
✓ 38 articles HTML créés/mis à jour
✓ index.json mis à jour
🎉 Synchronisation terminée !
```

→ Va sur `/actualites.html` : **toutes tes publications sont là, avec leurs photos**. 🎉

---

## 🔁 Workflow ensuite

À chaque fois que tu publies un nouveau post sur Facebook :

```bash
python3 scripts/sync-facebook-posts.py
```

→ Le script ne re-télécharge que les **nouveaux** posts (vérification par ID Facebook).

### Automatisation complète (facultatif)

Tu peux programmer le script pour qu'il tourne **automatiquement chaque jour** :

**Sur Mac (launchd)** :
```bash
# Créer un job qui tourne tous les jours à 8h
crontab -e
# Ajouter cette ligne :
0 8 * * * cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET" && python3 scripts/sync-facebook-posts.py >> sync.log 2>&1
```

**Ou via Netlify Build Hook** (si le site est déployé) — je te montre quand on en sera là.

---

## 🆘 Si tu bloques

Quand tu as ton token longue durée, **reviens me voir avec ton fichier `.env` rempli** (ou colle-le dans le chat — le token reste sur ton ordi, je n'y ai pas accès directement).

Je code le script `sync-facebook-posts.py` derrière, on fait un test ensemble, et c'est fini.

---

## ⚠️ Rappel sécurité

- Le token Facebook donne accès en **lecture** à ta page → un voleur ne peut pas publier en ton nom, mais il peut lire tes stats. À ne pas partager publiquement.
- Le fichier `.env` doit **rester local** (jamais committé sur GitHub).
- Tu peux **révoquer un token à tout moment** via [Paramètres FB → Apps & sites web](https://www.facebook.com/settings?tab=business_tools).

---

*Document généré le 10 mai 2026.*
