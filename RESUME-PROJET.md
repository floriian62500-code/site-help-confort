# 📋 Résumé du projet — Site HELP! Confort Saint-Omer

> **À coller au début d'une nouvelle conversation Cowork** pour reprendre le travail sans repartir de zéro.
> Mise à jour : **11 mai 2026** (Vague Q : connexion Google Business Profile — wizard + diagnostic + Edge Functions consolidées)

---

## 🏢 Le client

- **Entreprise** : SARL Dépan'Audo, exploitante de la marque **HELP! Confort Saint-Omer / Dunkerque**
- **Métiers** (9) : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie, volets, rénovation, adaptation PMR
- **Zone** : Saint-Omer + Dunkerque + 55 km à la ronde
- **Adresse** : 242 route de Boulogne, Saint-Martin-lez-Tatinghem 62500
- **Téléphone** : 03 66 10 01 34
- **Slogan officiel** : « Un seul interlocuteur pour tous vos travaux. » / « Quand ça lâche, on répond. Et on règle. »
- **Note Google** : 4,7/5 sur 343 avis
- **Domaine cible** : `https://www.helpconfort-saintomer.fr`

---

## 🛠 Stack technique

- **Site statique HTML** (~31 pages racine + sous-dossiers actualités/réalisations)
- **CSS** : `styles.css` (cache busting unifié `?v=1778352000`) + styles inline par page
- **JS** : `assets/hc-widgets.js`
- **Polices** : Inter + Playfair Display + Plus Jakarta Sans
- **CMS** : Decap CMS (`/admin/config.yml`) + Netlify Identity + Git Gateway
- **Hébergement cible** : Netlify
- **Tracking placeholders** : GA4, GTM, Clarity (à remplacer par les vrais ID)

---

## 📊 Contenu dynamique

- **5 actualités** éditoriales (vœux, conseils, désembouage, hiver)
- **12 chantiers réalisations** classés par métier (Vitrerie 5, Menuiserie 3, Plomberie 2, Rénovation 2)
- **10 apporteurs d'affaires** (HomeServe, Dynaren, ViaREN, AXA, Groupe IMA, DOMUS, Guy Hoquet, Citya, AG-COPRO, FMB)
- **Fournisseurs/marques** par métier

---

## ✅ État final (après audit complet et améliorations 10 mai)

### Hero homepage
- Eyebrow badge orange « Agence officielle Réseau HELP! Confort » + zones (Saint-Omer · Dunkerque) + horaires (Lun-Sam · 8h-18h)
- H1 grand format : « Un dépannage. Une rénovation. *Une seule équipe pour tous vos travaux.* »
- Lead avec slogan « Quand ça lâche, on répond. Et on règle. »
- 2 cartes avis : Google 4,7/5 (343 avis) + Trustville 4,0/5
- 2 CTA pro grands : Urgence (rouge halo pulsant) + Demander un rappel (cyan)
- Mascotte avec **animation floating** (4.5s ease-in-out infinite) + accélération au survol
- 8 badges métiers orbital (avec vrais pictos PNG/SVG)

### Header
- Logo grand format (140px desktop / 90px scroll / 70px mobile)
- Nav central minimaliste avec mega-menus métiers + zones
- CTA tel toujours visible (numéro conservé même mobile)
- Bouton avis Google avec note + nombre d'avis

### Module réservation (3 colonnes desktop, vertical mobile)
- **Gauche** : « Pourquoi nous » avec 5 engagements numérotés (01-05) en design éditorial épuré + signature italique
- **Centre** : Module 4 étapes avec **barre de progression colorée** (25→50→75→100%)
- **Droite** : 2 mini-carousels horizontaux (chantiers + actualités) avec flèches manuelles
- **Mobile** : ordre fixé (card → engagements → chantiers)

### Bandeau confiance (au-dessus tunnel)
- 5 garanties : Décennale · Assurance pro · SARL Dépan'Audo · 4,7/5 sur 343 avis · Astreinte 7j/7

### FAB urgence flottant
- Mascotte tête au-dessus du bouton
- **Bulle de message rotative** (6 messages : "Une fuite ?", "Plus de chauffage ?", "Besoin d'un devis ?", etc.)
- Pulse animation rouge

### SEO local
- 5 meta descriptions personnalisées par ville (Arques, Bergues, Gravelines, Longuenesse, Saint-Martin-lez-Tatinghem) avec USP + km + 343 avis
- Schema LocalBusiness + aggregateRating sur les 7 pages dépannage
- Sitemap.xml : 48 URLs avec lastmod
- Mots-clés locaux : plombier-saint-omer, depannage-{ville}, chauffagiste-saint-omer, etc.

### Footer harmonisé
- Version standard (footer-grid 6263 chars) sur 31/31 pages
- Logo, tagline, contact, réseau HELP! Confort, mentions légales

### Pages métiers
- Plombier, chauffagiste, électricien, serrurier (vitrerie inclus), travaux (menuiserie/rénovation/volets)
- Section "Nos chantiers en X" auto-injectée filtrant par métier
- Embeds Facebook compacts pour les photos

### Pages actualités/réalisations
- 5 actu sur /actualites.html avec filtres par catégorie
- 12 chantiers sur /realisations.html avec filtres par 10 métiers
- Pages détails individuelles avec embed FB natif complet en bas

---

## 🎨 Charte graphique

- **Couleurs** :
  - Bleu marine foncé : `#0A1428`
  - Cyan turquoise : `#0DA0CF` / `#1FC4F0`
  - Bleu clair : `#E6F8FE`
  - Orange (CTA chantiers) : `#FF6B1A`
  - Vert (confiance) : `#22D48E` / `#16A34A`
  - Or (avis Google) : `#FFB400`
  - Rouge (urgence) : `#E11D48` / `#9F1239`
  - Violet (Trustville) : `#7C3AED`
- **Polices** : Inter (corps) + Playfair Display (italiques) + Plus Jakarta Sans (homepage)

---

## 💰 Tarifs de référence (modifiables via CMS)

- Main d'œuvre : **52 € HT / h**
- Déplacement Saint-Omer : **gratuit**
- Déplacement Dunkerque : **60 € HT**
- Contrats Gaz : BASIC 9 € / CONFORT 13 € / SÉCURITÉ 23 € / mois
- Contrats Fioul : BASIC 12 € / CONFORT 16 € / SÉCURITÉ 27 € / mois

---

## 🌐 Connexion Google Business Profile (Vague Q, 11 mai 2026)

État : **prête à brancher, en attente de push GitHub + déploiement Edge Functions**.

### Côté code (fini)
- **`admin-pro/wizard-google.html`** : assistant 9 étapes piloté pas-à-pas (progression sauvegardée en localStorage, bouton diagnostic réel en étape 9 qui appelle `gbp-diagnostic`)
- **`admin-pro/settings.html`** section GBP : 7 champs (Client ID, Client Secret, Access Token, Refresh Token, Account ID, 2 Location IDs) + bouton "Tester la connexion" qui appelle l'Edge Function réelle. Tous les boutons "Tester" des autres connecteurs (Anthropic, Meta, LinkedIn, GA4) appellent maintenant la vraie `check-tokens` aussi.
- **`admin-pro/reviews.html`** : sync button avec reporting détaillé par fiche (Saint-Omer / Dunkerque) + dernière sync affichée + erreurs détaillées + bouton "Suggérer (IA)" maintenant connecté à la nouvelle `suggest-reply`.
- **`admin-pro/setup.html`** : page diagnostic globale mise à jour pour vérifier `gbp-diagnostic` et `suggest-reply` ; le check `int-gbp` exige maintenant les nouveaux champs (`client_id`, `client_secret`, `refresh_token`, `account_id_audo`).
- **`admin-pro/assets/supabase.js`** : helpers `authHeaders()` et `fnUrl()` pour appeler les Edge Functions plus proprement.
- **`supabase/functions/gbp-diagnostic/index.ts`** : NOUVELLE — teste end-to-end (creds, refresh, accounts, locations, lecture avis).
- **`supabase/functions/suggest-reply/index.ts`** : NOUVELLE — Claude génère une réponse contextuelle à un avis (ton adapté selon le rating, signature, prénom, etc.).
- **`supabase/functions/sync-reviews/index.ts`** : pagination ajoutée (jusqu'à 500 avis), reporting par location, `last_synced_at` persisté, **callable en mode cron** via service_role.
- **`supabase/functions/reply-review/index.ts`** : ne dépend plus de l'access_token (refresh auto si absent ou 401).
- **`supabase/functions/publish-gbp/index.ts`** : idem (refresh auto).
- **`supabase/functions/check-tokens/index.ts`** : supporte le mode "single service" (paramètre `service`), test GA4 ajouté (signature JWT RS256 + Analytics Data API), test GBP utilise maintenant le refresh_token.
- **`admin-pro/scripts/setup_cron_sync_reviews.sql`** : NOUVEAU script SQL pour activer le cron Supabase (sync auto toutes les 6h).
- **`guides/gbp.md`** : doc mise à jour (7 valeurs au lieu de 5, mention test connexion).
- **`guides/deploy-edge-functions.md`** : liste complète à jour + section "Mise à jour rapide Vague Q".

### Ce qui reste à faire (par Florian)
1. **Push sur GitHub** — actuellement bloqué côté machine. Solution : **GitHub Desktop → Settings → Accounts → Sign out + Sign in** (auth navigateur).
2. **Déployer les Edge Functions** sur Supabase (cf. `guides/deploy-edge-functions.md` section Vague Q) :
   ```bash
   cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
   supabase functions deploy gbp-diagnostic --no-verify-jwt
   supabase functions deploy suggest-reply --no-verify-jwt
   supabase functions deploy sync-reviews --no-verify-jwt
   supabase functions deploy reply-review --no-verify-jwt
   supabase functions deploy publish-gbp --no-verify-jwt
   supabase functions deploy check-tokens --no-verify-jwt
   ```
3. **Suivre l'assistant** dans `back-office → Assistant Google` (9 étapes, ~25 min). Étape 3 = formulaire Google qui prend 1-3 jours ouvrés à être approuvé.
4. Une fois les 7 valeurs collées dans **Paramètres → GBP** + bouton **Tester la connexion** au vert : aller dans **Avis clients** → **Synchroniser** → les avis Google des 2 fiches remontent.
5. **Optionnel — activer le cron auto-sync** : copier le contenu de `admin-pro/scripts/setup_cron_sync_reviews.sql` dans Supabase → SQL Editor (remplacer `TON_SERVICE_ROLE_KEY` par la vraie clé). Une sync auto toutes les 6h.

### Push GitHub bloqué
Le push échoue avec `Password authentication is not supported for Git operations`. Solution la plus simple : **GitHub Desktop → Settings → Accounts → Sign out + Sign in** (auth navigateur). Sinon créer un Personal Access Token sur https://github.com/settings/tokens/new (scope `repo`) et le coller comme mot de passe quand `git push` demande.

---

## ⚠️ Ce qu'il reste à faire

### 🔴 URGENT (par Florian)
1. **Activer le tracking** (5 min, voir `ACTIVER-TRACKING.md`)
   ```bash
   cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"
   grep -rl "G-XXXXXXXXXX" --include="*.html" . | xargs sed -i '' 's/G-XXXXXXXXXX/G-TONIDREEL/g'
   ```
2. **Compresser `videos/hero-metier.mp4`** (130 Mo → ~3 Mo) avec [HandBrake](https://handbrake.fr) ou [Squoosh](https://squoosh.app) — script `scripts/compresser-video-hero.sh` fourni
3. **Re-uploader la mascotte HD** (la version actuelle 34K est dégradée par compression — uploader un PNG 256×256 ou plus en bonne qualité)
4. **Mettre sur GitHub + déployer Netlify** (suit `SETUP-CMS.md`)

### 🟡 IMPORTANT
5. **Connecter API Trustville + Google Places** pour synchronisation automatique des avis (actuellement les notes sont en dur)
6. **Activer API Facebook Graph** pour sync auto des nouveaux posts (suit `SETUP-API-FACEBOOK.md`)
7. **Brancher le domaine `helpconfort-saintomer.fr`** dans Netlify

### 🟢 OPTIONNEL
8. **Augmenter les contrastes** sur certaines petites typos (.hcv-body p, .urg-btn span)
9. **Vraies photos chantiers locales** (au lieu d'iframes FB) après setup API
10. **Mutualiser les pages dépannage-{ville}** par templating si tu en ajoutes plus de 5

---

## 📚 Documentation interne

- `SETUP-CMS.md` — Installation back-office Decap (GitHub + Netlify)
- `SETUP-API-FACEBOOK.md` — Création App FB Developer + token longue durée
- `GERER-APPORTEURS.md` — Gestion apporteurs/fournisseurs depuis CMS
- `ACTIVER-TRACKING.md` — Activation GA4 / GTM / Clarity
- `scripts/README.md` — Utilisation des scripts Python
- `scripts/sync-facebook-posts.py` — Sync auto des posts FB (avec API)
- `scripts/download-fb-photos.py` — Téléchargement photos via permaliens FB
- `scripts/compresser-video-hero.sh` — Compression vidéo hero localement

---

## 📞 Comment reprendre dans une nouvelle conversation

> Bonjour, je reprends mon projet **site HELP! Confort Saint-Omer**. Le dossier de travail est `/Users/HP/Documents/Claude/Projects/SITE INTERNET/`.
>
> Lis le fichier `RESUME-PROJET.md` à la racine pour avoir tout le contexte.
>
> Voici ma demande du jour : **[décris ici ce que tu veux faire]**

---

*Dernière mise à jour : 10 mai 2026 — après audit UX/UI complet, mascotte animée, FAB urgence interactif, bandeau confiance, barre de progression tunnel, mobile responsive, SEO local enrichi.*
