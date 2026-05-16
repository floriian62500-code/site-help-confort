# 🚀 Instructions SEO — Soumission Search Console & Sync GBP

Ces 2 actions **nécessitent ton login Google** — je ne peux pas les faire à ta place.
Mais le terrain est préparé : les meta tags de vérification sont déjà placés dans `index.html`.

---

## 1️⃣ Google Search Console (10 min)

### Étape A — Ajouter ta propriété
1. Va sur https://search.google.com/search-console
2. Connecte-toi avec ton compte Google
3. Clique **Ajouter une propriété** → choisis **Préfixe d'URL** (pas le domaine)
4. Saisis : `https://www.depan59-62.fr/`

### Étape B — Vérifier la propriété
Google va te proposer plusieurs méthodes. Choisis **« Balise HTML »** (la plus simple) :
1. Google te donne un code du type `<meta name="google-site-verification" content="ABC123XYZ...">`
2. Copie la valeur du `content="..."` (ex: `ABC123XYZ...`)
3. Ouvre `index.html` ligne ~12
4. Remplace `PLACEHOLDER_GOOGLE_VERIFY_CODE` par cette valeur
5. Sauvegarde → auto-push GitHub → Netlify déploie
6. Reviens sur Search Console → clique **Vérifier**

### Étape C — Soumettre le sitemap
1. Dans Search Console, menu gauche : **Sitemaps**
2. Saisis : `sitemap.xml`
3. Clique **Envoyer**
4. Google va indexer 57 URLs

---

## 2️⃣ Bing Webmaster Tools (5 min, bonus)

1. Va sur https://www.bing.com/webmasters
2. Connecte-toi (Microsoft/Live)
3. Ajoute le site `https://www.depan59-62.fr/`
4. Méthode : **Balise meta**
5. Récupère le code → remplace `PLACEHOLDER_BING_VERIFY_CODE` dans `index.html`
6. Soumets le sitemap : `https://www.depan59-62.fr/sitemap.xml`

---

## 3️⃣ Google Business Profile (5 min)

1. Va sur https://business.google.com
2. Connecte-toi avec ton compte Google (celui qui gère HELP! Confort Saint-Omer)
3. Sélectionne la fiche **HELP! Confort Saint-Omer**
4. Onglet **Infos** → **Horaires** :
   - Lundi : 9h00 – 17h00
   - Mardi : 9h00 – 17h00
   - Mercredi : 9h00 – 17h00
   - Jeudi : 9h00 – 17h00
   - Vendredi : 9h00 – 17h00
   - Samedi : 9h00 – 16h00
   - Dimanche : Fermé
5. **Important** : décoche « Ouvert 24h/24 » si activé
6. Vérifie l'adresse : `242 route de Boulogne, 62500 Saint-Martin-lez-Tatinghem`
7. Vérifie le tél : `03 66 10 01 34`
8. Sauvegarde

---

## 🎁 Bonus : pourquoi c'est critique

- **Search Console** = indexation rapide + suivi des requêtes Google qui amènent du trafic
- **Sitemap soumis** = 57 URLs indexées en ~7 jours au lieu de plusieurs mois
- **GBP synchronisé** = Google fait remonter ta fiche dans le « Local Pack » (3 cartes en haut des résultats)
- **Cohérence horaires site ↔ GBP** = Google pénalise quand les infos divergent

---

## 📊 Mes prédictions

Avec ces 3 actions + tout ce qui a été fait sur le site :

| Période | Effet attendu |
|---|---|
| 7 jours | 50+ pages indexées Google |
| 30 jours | Apparition top 20 sur « plombier saint-omer », « chauffagiste dunkerque »... |
| 90 jours | Position dans le Local Pack (3 cartes top) sur les requêtes ciblées |
| 180 jours | +30 à +60 % de trafic organique |

Bonne route 🚀
