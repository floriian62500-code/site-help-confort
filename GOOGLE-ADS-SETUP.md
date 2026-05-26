# Google Ads — Setup HELP Confort

> Tout est **prêt côté technique** dans le back-office. Il te reste **4 étapes côté Google** que je ne peux pas faire à ta place (CB, identité, validation profil). Compte ~2 heures de boulot étalées sur 1-2 semaines (à cause des délais de validation Google).

## ✅ Ce qui est DÉJÀ en place (fait automatiquement)

- Tables Supabase : `google_ads_campaigns`, `google_ads_metrics_daily`, `google_ads_alerts`
- Settings `app_settings.google_ads` avec plafond mensuel par défaut à 1 500 €
- Edge Function `sync-google-ads` V1 (déployée, fonctionne en mode stub tant que pas configurée)
- Cron Supabase `auto-sync-google-ads` toutes les 4h (24/7)
- Page dashboard : [admin-pro/google-ads.html](https://depan59-62.fr/admin-pro/google-ads.html)
- Entrée sidebar : Comm → **Google Ads**

Tu peux déjà ouvrir la page — elle affiche la bannière setup avec les étapes.

---

## 🚀 Ce que TU dois faire (4 étapes)

### Étape 1 — Créer ton compte Google Ads (10 min)

1. Va sur [ads.google.com](https://ads.google.com)
2. Connecte-toi avec le compte Google qui gère déjà ta fiche Google Business Profile (cohérence importante pour le linking)
3. Crée un nouveau compte Google Ads
4. Renseigne :
   - **Adresse fiscale** : adresse de ton entreprise HC
   - **CB** : la CB de l'entreprise (pas perso). Google débite chaque mois ou au seuil.
   - **Devise** : EUR
   - **Fuseau horaire** : Europe/Paris

**Important** : choisis le mode "expert" et pas "Smart Campaigns" (Google va vouloir te pousser le mode simplifié, mais on ne pourra pas piloter via API).

À la fin, note ton **Customer ID** (format `123-456-7890` en haut à droite). Tu me l'enverras.

---

### Étape 2 — Demander le Developer Token API (10 min + 2 sem délai)

Le Developer Token est nécessaire pour que mon dashboard puisse parler à Google Ads. C'est **gratuit** mais Google valide manuellement (~2 semaines).

1. Va sur [developers.google.com/google-ads/api/docs/get-started/dev-token](https://developers.google.com/google-ads/api/docs/get-started/dev-token)
2. Clique "Apply for access" → tu seras redirigé vers le **Google Ads API Center** dans ton compte
3. Remplis le formulaire :
   - **Tool name** : `HELP Confort Dashboard`
   - **Tool URL** : `https://depan59-62.fr/admin-pro/google-ads.html`
   - **Company / Organization** : `HELP Confort Saint-Omer & Dunkerque`
   - **Email contact** : `florian.dhaillecourt@helpconfort.com`
   - **Use case** : *"Internal dashboard for our 2 franchise agencies (Saint-Omer + Dunkerque). We need to monitor campaign performance, manage budgets, and automatically pause underperforming campaigns based on our internal KPIs. Read + write access required on our own account only (no third-party data)."*
4. Soumets

Tu recevras un token temporaire (test) tout de suite. Le **token de production** arrive sous 2 semaines après validation. Note les 2 tokens.

---

### Étape 3 — OAuth Google Ads (5 min, après réception du token)

Une fois ton Developer Token reçu :

1. Va dans le dashboard : [admin-pro/google-ads.html](https://depan59-62.fr/admin-pro/google-ads.html)
2. Clique "Configurer" (apparaîtra dans la bannière setup)
3. Renseigne :
   - **Customer ID** (récupéré étape 1)
   - **Developer Token** (récupéré étape 2)
   - **Plafond mensuel absolu** (kill switch — par défaut 1 500 €)
4. Lance l'OAuth Google Ads (connecte le même compte que ta fiche GBP)
5. Le système teste la connexion → si OK, le badge "Stub" passe en "Live"

À partir de là, la sync auto tourne toutes les 4h, et tu peux créer/piloter tes campagnes depuis le dashboard.

---

### Étape 4 — Local Services Ads (LSA) — 1 semaine de validation

LSA = paiement au lead, badge Google Garanti, affichage premium. C'est l'arme la plus rentable pour ton métier mais Google fait un check sérieux avant de t'activer.

1. Va sur [ads.google.com/local-services-ads/](https://ads.google.com/local-services-ads/)
2. Sélectionne ton secteur d'activité : **Home Services → Plumbing / Electrician / Locksmith** (créer 1 profil par métier ou multi-métiers selon ce que Google propose pour ta zone)
3. Renseigne :
   - **Zone géographique** : ville par ville (Saint-Omer, Longuenesse, Arques, Dunkerque, Grande-Synthe, etc.)
   - **Métiers** : tous ceux que tu fais
   - **Heures d'ouverture** : tes vraies horaires
   - **Numéro de tél** : 03 66 10 01 34
   - **Site web** : https://depan59-62.fr
4. Upload les justificatifs :
   - **Kbis** (moins de 3 mois)
   - **Attestation d'assurance professionnelle** (RC pro)
   - **Background check** : Google va vérifier ton identité (passeport ou CNI + selfie via leur partenaire Pinkerton)
5. Soumets

Délai validation : **5-10 jours ouvrés**. Une fois validé, tu reçois le badge "Google Garanti" et apparaît dans les LSA.

⚠️ Mon dashboard ne peut afficher que les stats LSA en lecture seule (limite Google API). Pour modifier le profil, tu dois passer par leur interface. J'ai mis un raccourci sur la page Google Ads du BO.

---

## 📊 Une fois tout en place, ce que tu verras dans le dashboard

- **4 KPI temps réel** : dépense mois, leads 30j, CPL moyen, ROAS
- **Jauge plafond** : ta dépense vs ton plafond mensuel (alerte 80%, pause auto 100%)
- **Tableau campagnes** : statut, budget, perf par campagne avec boutons pause/budget
- **Bloc LSA** : tes stats LSA + raccourci pour gérer côté Google
- **Alertes auto** : budget atteint, CPL anormal, campagne sans conversion depuis 3j

## 🎯 Recommandation budget pour démarrer

Une fois LSA + Google Ads actifs :
- **Mois 1 (pilote)** : 30 €/jour réparti sur 3 campagnes (Plomberie SO, Plomberie DK, Serrurerie SO) → ~900 €/mois
- **Mois 2** : doubler le budget sur les 1-2 campagnes qui convertissent, killer les autres
- **Mois 3+** : viser CPL < 30 € pour considérer rentable (lead → intervention moyenne ~150-300 €)

## 🔗 Liens utiles

- Dashboard HC : [admin-pro/google-ads.html](https://depan59-62.fr/admin-pro/google-ads.html)
- Google Ads : [ads.google.com](https://ads.google.com)
- Local Services Ads : [ads.google.com/local-services-ads/](https://ads.google.com/local-services-ads/)
- Developer Token doc : [developers.google.com/google-ads/api/docs/get-started/dev-token](https://developers.google.com/google-ads/api/docs/get-started/dev-token)
- Forum support FR : [support.google.com/google-ads](https://support.google.com/google-ads)

---

**Dès que tu as terminé l'étape 1 (compte créé) et l'étape 2 (Developer Token demandé), envoie-moi les infos. Je n'ai plus qu'à brancher.**
