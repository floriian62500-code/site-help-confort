# 🎯 RÉCAP COMPLET — Tout ce qui a été fait

> Document de référence pour Florian — synthèse exhaustive de l'autonomisation du projet HELP! Confort.
> Dernière mise à jour : 15 mai 2026.

---

## 🌐 1. INFRASTRUCTURE

### Domaine
- **Site web** : https://depan59-62.fr (HTTPS Let's Encrypt actif)
- **www** : redirige automatiquement vers la version sans www
- **Email pro** : `florian.dhaillecourt@helpconfort.com` (inchangé)
- **Notifs site** : `saint-omer@helpconfort.com`
- **Registrar DNS** : Gandi
- **Records DNS modifiés** :
  - `@` A → `75.2.60.5` (Netlify apex)
  - `www` CNAME → `remarkable-dragon-364e2b.netlify.app.`
  - Tous les records email (MX, SPF, DKIM, SRV) **intacts**
  - DKIM Resend (`resend._domainkey`) **présent**

### Hébergement
- **Netlify projet** : `remarkable-dragon-364e2b`
- **Deploys** : automatiques depuis GitHub via `autopush.sh` (Mac de Florian)
- **Debounce** : 15 min pour économiser les crédits build

### Base de données
- **Supabase projet** : `btcbjwqiivhpwoszomhg`
- **Tables principales** : `leads`, `contracts`, `realisations`, `services`, `service_orders`, `reviews`, `app_settings`, `user_profiles`, `scheduled_publications`, `interventions`
- **Vues** : `v_services_public`, `v_subscriptions_inbox`, `v_contract_offers`
- **Storage** : bucket `realisations` (public read, auth write)

### Auth
- **Site URL** : `https://depan59-62.fr` (corrigé)
- **User admin owner** : `florian.dhaillecourt@helpconfort.com`
- **User backup** : `admin@helpconfort.com`

---

## 🏠 2. SITE PUBLIC

### Pages améliorées
- **`index.html`** : domaine corrigé partout, chat urgence fixé
- **`nos-prestations.html`** : gradients colorés par métier (plomberie cyan, chauffage rouge, électricité jaune, serrurerie violet, vitrerie vert), icônes plus impactantes
- **`contrats-entretien.html`** : formulaire passe au SDK Supabase (bypass UNAUTHORIZED_LEGACY_JWT)
- **13 pages publiques** : bug critique apostrophe `l'heure` non échappée corrigé en masse
- **463 occurrences** de l'ancien domaine fictif `helpconfort-saintomer.fr` remplacées par `depan59-62.fr`
- **`sitemap.xml`** mis à jour avec le nouveau domaine

### SEO
- Schema.org JSON-LD aligné sur le nouveau domaine
- Canonical, og:url, twitter:card tous corrects
- Robots.txt à jour

---

## 🎛 3. BACK-OFFICE (admin-pro)

### Dashboard `index.html`
**4 KPI business-focused** :
- 📥 Leads (30j) avec trend
- 📄 Souscriptions à importer dans CRM
- 🛠️ Commandes (30j) à traiter
- ⭐ Note Google moyenne (ou Visiteurs si GA4)

**Bloc passerelle CRM** (interventions/contrats gérés dans Apogée) :
- Bouton "Ouvrir mon CRM" → ouvre l'URL configurée dans un nouvel onglet
- Inbox "Souscriptions à importer" (orange si en attente)

**Widgets** :
- Publications programmées (8 prochaines, FB+IG/LinkedIn/Google)
- Derniers avis Google (5 derniers, badge "À répondre")
- Synthèse commerciale 30j (CA facturé, devis envoyés, taux conversion, délai moyen, top métiers/villes)

**Alertes contextuelles** :
- Souscriptions à importer dans CRM (priorité TOP)
- Commandes à traiter
- Leads à qualifier
- Avis non répondus
- Chantiers en attente

### Page `leads.html` (Demandes clients)

**Liste enrichie** :
- Badges colorés par type : 🔥 URGENCE / 📄 SOUSCRIPTION / 💬 DEVIS
- Téléphone/email cliquables directement
- Preview message client
- Valeur estimée affichée
- 3 boutons d'action rapide par card : 📞 Appeler / 💬 SMS / 📧 Email
- Bouton "Détails →" → modale complète

**Modale détaillée** (sections) :
- 🆔 Identité + adresse complète
- 📄 Souscription contrat (si applicable, gradient bleu)
- 🔍 Caractéristiques de la demande (habitat, urgence, métiers cochés, parcours)
- 💰 Suivi commercial (devis envoyé / acompte payé / facture / intervention) + édition rapide
- 📸 Photos (upload drag-drop OK, photos client visibles, suppression possible)
- 📊 Tracking (source, page, referer, dates, assignation)
- 📊 Tracking UTM brut si pas de caracs structurées

**Actions** :
- Bouton "📄 PDF" → génère une fiche client complète imprimable
- Bouton "📞 Appeler" / "📧 Email" via tel:/mailto:
- Statut + notes internes éditables

### Page `contracts.html` (Contrats entretien)

**Liste enrichie** :
- Badge `📥 À IMPORTER` ou `✓ CRM`
- Énergie + équipement (marque/modèle) en sous-ligne
- Date de souscription affichée
- Onglet "Offres & tarifs" pour gérer le catalogue
- Filtre rapide "📥 À importer dans CRM"

**Actions bulk** :
- Bouton **"📥 Tout marquer importé"** (groupé)
- Bouton **"CSV"** → export Excel-compatible (séparateur `;` + BOM UTF-8)
- Bouton "🧪 Tester le pipeline" → simule une souscription complète

### Page `services.html` (Catalogue prestations + Commandes)

**Catalogue groupé par catégorie** :
- Chips de filtres rapides par métier (plomberie/chauffage/électricité/serrurerie/vitrerie/devis)
- Headers de section avec icône colorée + compteur
- Tri par position de catégorie puis nom

**Commandes** :
- Badge 🔥 URGENT si créneau "urgent"
- Téléphone client cliquable
- Indicateur "✓ acompte payé" ou montant
- Statut éditable

### Page `analytics.html` (SEO & Analytics)
- **Trafic GA4** : appelle l'Edge Function `ga4-stats` → affiche Visiteurs/Sessions/Pages vues/Durée moyenne
- **Couverture SEO** : % chantiers avec SEO complet
- **Répartition métiers** : combine réalisations + leads + contrats
- **Répartition villes** : idem

### Page `settings.html` (Paramètres)
- Sections : Société, Claude IA, Meta, LinkedIn, GBP, GA4, **CRM externe**, **Notifications email**
- UI dédiée Notifications avec 6 champs (subscriptions_to / orders_to / leads_to / reply_to / from_name / from_email)
- Configuration CRM (URL + nom) pour la passerelle

### Page `setup.html` (Diagnostic)
- 5 catégories de checks : DB, Storage, Edge Functions, Connexions, Intégrations
- Score % opérationnel sur 100%
- Storage check : fallback `list()` si `listBuckets()` bloqué par RLS
- Edge Functions check : SDK `functions.invoke()` au lieu de fetch direct
- LinkedIn neutralisé (B2B, non bloquant)

### Sidebar (`assets/layout.js`)
- Réorganisée en 5 sections collapsibles
- "Interventions / RDV" → **"Mon CRM (interventions)"** (lien direct vers Apogée)
- Badges dynamiques : Demandes / Catalogue / Contrats
- Bouton "Activer notifs leads" en bas (système notifications navigateur)

### Reviews (`reviews.html`)
- Liste avis Google + Facebook
- Bouton "Répondre avec IA" (appelle `suggest-reply` Edge Function)
- Stats : note moyenne, à répondre, négatifs, taux réponse

### Setup utilisateur
- Création du user `florian.dhaillecourt@helpconfort.com`
- Migration `grant_owner_florian.sql` auto-grant role owner

---

## ⚙️ 4. EDGE FUNCTIONS SUPABASE

### Fonctions modifiées / créées
| Fonction | Rôle | verify_jwt |
|---|---|---|
| `notify-subscription` | Email Resend à chaque souscription contrat | false |
| `generate-post-from-prompt` | Génère un post via Claude IA | false |
| `refresh-meta-token` ⭐ NEW | Renouvelle/maintient le Page Access Token FB à vie | (auth via service_role) |
| `sync-facebook-posts` | Importe les nouveaux posts FB en validation | true (fix client SDK) |
| `sync-reviews` | Synchronise avis GBP + Facebook | true |
| `reply-review` | Publie une réponse sur GBP | true |
| `suggest-reply` | Génère réponse IA pour un avis | true |
| `publish-meta` | Cross-post FB + IG | true |
| `publish-gbp` | Publie sur Google Business | true |
| `publish-linkedin` | Publie sur LinkedIn (désactivé pour l'instant) | true |
| `publish-scheduled` | Exécute les publications planifiées | true |
| `generate-content` | Génère contenu chantier via IA | true |
| `generate-service-content` | Génère SEO/FAQ pour une prestation | true |
| `ga4-stats` | Récupère stats Google Analytics 4 | true |
| `manage-users` | Gestion comptes admin | true |
| `auto-publish-from-photos` | Pipeline photos → publication FB auto | true |
| `gbp-diagnostic` | Diagnostic connexion GBP | true |
| `check-tokens` | Vérifie validité tokens externes | true |
| `notify-action` | Notifs Slack/email actions critiques | true |
| `sitemap` | Génère sitemap XML dynamique | true |

### Fixes critiques
- ✅ Bug `UNAUTHORIZED_LEGACY_JWT` corrigé : tous les appels client passent au **SDK `sb.functions.invoke()`** au lieu de fetch direct
- ✅ `autopush.sh` renforcé : parsing TOML robuste pour détecter `verify_jwt = false`
- ✅ FROM email Resend hardcodé sur `noreply@depan59-62.fr` (seul domaine vérifié)

---

## 🗄️ 5. MIGRATIONS SQL (Supabase)

### Nouvelles migrations
| # | Fichier | Effet |
|---|---|---|
| 1 | `20260514080000_fix_contracts_rls_subscriptions.sql` | RLS contracts pour insert public depuis formulaire site |
| 2 | `20260514100000_crm_passerelle.sql` | `contracts.imported_to_crm_at` + `crm_external_id` + vue `v_subscriptions_inbox` |
| 3 | `20260514110000_storage_bucket_realisations.sql` | Bucket `realisations` public + RLS policies |
| 4 | `20260514120000_fix_notification_emails_domain.sql` | FROM email par défaut = `noreply@depan59-62.fr` |
| 5 | `20260514130000_notif_saint_omer.sql` | Toutes notifs → `saint-omer@helpconfort.com` |
| 6 | `20260514140000_grant_owner_florian.sql` | Promotion Florian en owner automatique |
| 7 | `20260515000000_force_from_email_depan59_62.sql` | Force from_email sur tous les settings existants |
| 8 | `20260515010000_purge_test_contracts.sql` | Supprime les contracts test "Jean [TEST]" |
| 9 | `20260515020000_leads_photos_payments.sql` | Colonnes photos + devis/acompte/facture sur leads |
| 10 | `20260515030000_add_missing_services.sql` | +9 prestations (fuite, désengorgement, etc.) |
| 11 | `20260515040000_add_serrurerie_vitrerie.sql` | +5 prestations serrurerie/vitrerie |
| 12 | `20260515050000_align_chauffe_eau_prices.sql` | Alignement chauffe-eau sur TARIFS_REFERENCE.md |

### Modifications schéma
- **`contracts`** : ajout `imported_to_crm_at` + `crm_external_id` (workflow CRM)
- **`leads`** : ajout `photos`, `quote_sent_at`, `quote_amount`, `deposit_paid_at`, `deposit_amount`, `invoiced_at`, `invoice_amount`, `intervention_date`
- **`app_settings`** : ajout clé `crm` (URL + nom)
- **`services`** : +14 prestations alignées au référentiel

---

## 🤖 6. 9 AGENTS IA EN AUTONOMIE TOTALE

| Ordre | Nom (UI Cowork) | Fréquence | Mission |
|---|---|---|---|
| 1 | 🤖 **AGENT PRINCIPAL** — exécute le TODO toutes les 20 min | Toutes les 20 min (8h-22h) | Le plus actif, exécute des items du TODO en autonomie |
| 2 | 🔑 **TOKEN FACEBOOK à vie** | Chaque nuit 4h20 | Maintient le Page Access Token FB permanent |
| 3 | 🔄 **SYNC AUTO** Facebook + Avis Google | Chaque matin 6h30 | Importe automatiquement nouveaux posts FB + avis Google |
| 4 | 🔍 **AUDIT TECHNIQUE matin** | 7h chaque jour | Audit complet, fixes auto, rapport quotidien |
| 5 | ❤️ **MONITORING uptime** | Toutes les heures | Check site + Edge Functions, silencieux si OK |
| 6 | 📊 **RÉCAP BUSINESS soir** | Lun-sam 18h | Leads/contrats/CA + à-faire-demain |
| 7 | ✍️ **POSTS DE LA SEMAINE** | Vendredi 18h | 7 brouillons IA prêts pour validation lundi |
| 8 | 🌙 **SCAN SOIR régressions** | 22h chaque jour | Détecte les bugs introduits dans la journée |
| 9 | 📈 **RAPPORT HEBDO** | Dimanche 22h30 | Synthèse de la semaine en markdown |

**À faire une fois côté Florian** : sidebar Cowork → "Scheduled" → cliquer **"Run now"** sur chaque agent pour pré-approuver les tools. Après, ils tournent sans plus jamais te déranger.

### Rapports générés automatiquement
- `docs/AUDIT-QUOTIDIEN.md` (par AUDIT TECHNIQUE)
- `docs/RECAP-SOIR.md` (par RÉCAP BUSINESS)
- `docs/ALERT-MONITORING.md` (par MONITORING — uniquement si problème)
- `docs/ALERT-SYNC.md` (par SYNC AUTO — uniquement si erreur)
- `docs/ALERT-FB-TOKEN.md` (par TOKEN FB — uniquement si vraiment mort)
- `docs/POSTS-SEMAINE-{N}.md` (par POSTS — hebdomadaire)

---

## 🔌 7. CONNEXIONS EXTERNES

| Service | Statut | Notes |
|---|---|---|
| ✅ **Google Business Profile** | Configuré | Avis synchronisés, posts auto-publiés |
| ✅ **Facebook + Instagram** | Configuré | Cross-post auto (token à renouveler manuellement 1 fois) |
| ✅ **Google Analytics 4** | Configuré | Tag actif, stats remontées dans le dashboard |
| ✅ **Resend** | Configuré | API key dans Supabase Secrets, domaine `depan59-62.fr` vérifié |
| ⏸ **LinkedIn** | Volontairement désactivé | B2C focus, à réactiver si offre Pro lancée |
| ⏳ **Apogée (Dynoco)** | À développer | Spec dans `docs/INTEGRATION-APOGEE-DYNOCO.md` à envoyer à Dynoco |
| ❌ **Claude IA (Anthropic)** | Clé à ajouter | Settings → Claude IA (débloque la génération de posts/SEO) |

---

## 📚 8. DOCUMENTATION

### Fichiers `docs/` créés
- 📘 **`GUIDE-UTILISATEUR.md`** — Manuel complet du back-office (routines matin, workflows, dépannage)
- 📘 **`INTEGRATION-APOGEE-DYNOCO.md`** — Spec d'intégration à envoyer à Dynoco
- 📘 **`CHANGELOG-2026-05-14.md`** — Récap session 1 (technique)
- 📘 **`RECAP-AUTONOMIE-COMPLET.md`** — Ce document (vue d'ensemble)

### Référentiel tarifs
- ✅ **`admin-pro/TARIFS_REFERENCE.md`** — Source de vérité validée par Florian le 15/05
- ✅ **`admin-pro/tarifs.html`** — Page admin pour consulter les tarifs

### Mémoires Claude (persistent entre sessions)
- `feedback_auto_apply_fixes.md` — Daily scan + autonomie
- `project_crm_passerelle.md` — Dashboard = passerelle, pas un outil CRUD
- `reference_domain_netlify.md` — Site = depan59-62.fr, Netlify projet = remarkable-dragon-364e2b
- `feedback_always_clickable_links.md` — Toujours fournir URLs cliquables
- `project_b2c_focus_no_linkedin.md` — Cible B2C, LinkedIn en pause
- `feedback_langue_francais.md` — Réponses 100% français

---

## 🛠 9. WORKFLOW QUOTIDIEN POUR FLORIAN

### Routine matin (5 min)
1. Café ☕
2. Ouvrir https://depan59-62.fr/admin-pro/
3. Regarder les **alertes contextuelles** (sous les KPI)
4. Lire `docs/AUDIT-QUOTIDIEN.md` (généré à 7h par l'agent)
5. Si **inbox Souscriptions à importer** > 0 → cliquer **"Mon CRM"** → importer dans Apogée → revenir et cliquer **"📥 Importé"** sur chaque ligne traitée

### Routine soir (3 min)
1. Lire `docs/RECAP-SOIR.md` (généré à 18h)
2. Voir les leads/commandes du jour
3. Préparer la journée du lendemain

### Vendredi soir
1. Lire `docs/POSTS-SEMAINE-{N}.md` (généré à 18h)
2. Valider/ajuster les 7 brouillons → planifier la publication

### Dimanche soir
1. Lire `docs/RAPPORT-HEBDO.md` (généré à 22h30)
2. Préparer la semaine

---

## 🔧 10. ACTIONS RESTANTES POUR FLORIAN

### Bloquant
- 🔑 **Renouveler le Page Access Token Facebook** (1 fois, 5 min) — voir https://developers.facebook.com/tools/explorer/
- 🔑 **Ajouter `app_id` + `app_secret` Meta** dans Settings (pour l'auto-refresh permanent)

### Optionnel
- 🔑 **Ajouter la clé Anthropic Claude** dans Settings → débloque la génération IA
- 📧 **Envoyer le mail à Dynoco** (`docs/INTEGRATION-APOGEE-DYNOCO.md`)
- 🎯 **Pré-approuver les 9 agents IA** (cliquer "Run now" sur chacun dans la sidebar Cowork Scheduled)
- 🎨 **Valider les prix chauffe-eau 200L mural + 300L au sol** (désactivés en attendant, voir `docs/CHANGELOG-2026-05-14.md`)

---

## 📊 11. ÉTAT FINAL DU PROJET

| Métrique | Valeur |
|---|---|
| Pages HTML | ~85 (public + admin-pro) |
| Edge Functions Supabase | 20+ déployées |
| Migrations SQL | 18 dans le repo |
| Prestations catalogue | 22 actives + 4 désactivées en réserve |
| Agents IA autonomes | **9** |
| Domaine | depan59-62.fr (HTTPS Let's Encrypt) |
| Diagnostic opérationnel | ~95% (le reste = clé Anthropic + LinkedIn neutralisé) |

---

## 🎯 12. LIENS UTILES — À GARDER SOUS LA MAIN

### Site public
- 🏠 Site : https://depan59-62.fr
- 📋 Catalogue : https://depan59-62.fr/nos-prestations.html
- 📄 Contrats : https://depan59-62.fr/contrats-entretien.html

### Back-office
- 🎛 Dashboard : https://depan59-62.fr/admin-pro/
- 📥 Demandes : https://depan59-62.fr/admin-pro/leads.html
- 📄 Contrats : https://depan59-62.fr/admin-pro/contracts.html
- 🛠 Catalogue : https://depan59-62.fr/admin-pro/services.html
- ⭐ Avis : https://depan59-62.fr/admin-pro/reviews.html
- 🖼 Réalisations : https://depan59-62.fr/admin-pro/realisations.html
- 📊 Analytics : https://depan59-62.fr/admin-pro/analytics.html
- ⚙️ Réglages : https://depan59-62.fr/admin-pro/settings.html
- 🔍 Diagnostic : https://depan59-62.fr/admin-pro/setup.html

### Tableaux de bord externes
- 🚀 Netlify : https://app.netlify.com/projects/remarkable-dragon-364e2b
- 🗄 Supabase : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg
- 🌐 Gandi DNS : https://admin.gandi.net/domain
- 📧 Resend : https://resend.com/emails
- 📊 Google Analytics : https://analytics.google.com/analytics/web/#/p537770890
- 🏢 Google Business : https://business.google.com/
- 📘 Meta Business : https://business.facebook.com/
- 🤖 Claude in Chrome (extension à installer) : https://chromewebstore.google.com/

---

**Voilà, c'est tout. Tu as un back-office complet, des agents IA qui maintiennent l'ensemble en autonomie, et une stack solide pour scaler ton activité. Si quelque chose plante, demande à Claude — j'ai accès au code, je peux fixer en quelques minutes, et autopush déploie automatiquement.**

🛠 **Pour me redonner du travail :** dis simplement ce que tu veux que je fasse. Je continue en autonomie tant que tu ne me dis pas de stopper.
