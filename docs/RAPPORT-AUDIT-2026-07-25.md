# 🎯 Audit complet HELP Confort — Générateur de cash

**Date** : 2026-07-25
**Contexte** : session stratégique Florian → "je veux que le site devienne un vrai générateur de cash"
**Panier moyen** : 400 €
**Objectif** : max volume de leads via SEO longue traîne + optimisation funnel

---

## Score global : **5.9 / 10**

| Axe | Score | Verdict |
|---|:---:|---|
| Funnel conversion | 5.5/10 | Fondamentaux OK, mais wizard + formulaire contact tuent les leads |
| SEO | 6/10 | Base tier 1 solide, 18 pages tier 2 dupliquées risquent pénalité |
| Dette technique | 6.5/10 | 3 sources partenaires, 690 KB header dupliqué × 106 pages |
| Dashboard back-office | 5.5/10 | 22 pages orphelines, aucun KPI CA agrégé |
| Automations | 6/10 | 7/9 tâches éteintes depuis 2 mois, aucun digest leads |

---

## 🚨 TOP 10 ACTIONS priorisées par impact CA

### Tier 1 — Impact leads immédiat (+50 % visé en 30 jours)

| # | Action | Effort | Impact estimé | Statut |
|---|---|---|---|:---:|
| 1 | Photo **optionnelle** wizard urgence (step 2) | 30 min | +30-40 % completion step 2 | Task #13 |
| 2 | Mini-form "Rappelé en 15 min" en hero (3 champs) | 2 h | +40-60 % leads globaux | À arbitrer |
| 3 | Formulaire contact : 7 → 4 champs requis | 1 h | +20-35 % submits | Task #17 |
| 4 | Numéro tel visible sur mobile (actuellement caché <720 px) | 15 min | +15-25 % click_phone mobile | À intégrer |
| 5 | Deep-link `#form?service=X` sur CTA pages métier | 1 h | +10-15 % conversion pages métier | Task #19 |

### Tier 2 — Impact SEO 90 jours (x2 trafic organique visé)

| # | Action | Effort | Impact | Statut |
|---|---|---|---|:---:|
| 6 | Retirer meta `no-cache` des 117 pages HTML | 15 min | Indexation +20 % | Task #14 |
| 7 | De-indexer 18 pages métier tier 2 dupliquées | 30 min | Évite pénalité Google | Task #15 |
| 8 | Consolider 4 sitemaps → 1 sitemap-index | 30 min | Fix GSC "Pages avec redirection" | Task #18 |

### Tier 3 — Pilotage business Florian

| # | Action | Effort | Impact | Statut |
|---|---|---|---|:---:|
| 9 | **KPI CA mensuel agrégé** en dashboard racine | 3 h | Pilotage business en 1 coup d'œil | Task #20 |
| 10 | Workflow chantier 8-12 clics → 3 clics | 1 j | Publi multi-canal fluide | À arbitrer |

---

## 🔴 3 alertes critiques à traiter

1. **Token GitHub `ghp_0wUyIL...` en clair** dans `pipeline-health-check` (fallback) et URL git remote. **À révoquer côté GitHub + migrer en secret Supabase**. Task #22.
2. **18 pages métier tier 2 quasi-dupliquées** (plombier-marck, plombier-outreau, chauffagiste-marck, etc.) — risque pénalité duplicate content si Google Search Console monte en volume. Task #15.
3. **`FALLBACK_AVIS`** = 10 faux avis clients hardcodés dans `assets/hc-avis-carousel.js` (script non inclus mais présent). Risque juridique si réactivé accidentellement. Task #16 (suppression).

---

## 📋 Diagnostic détaillé par axe

### 1. Funnel conversion (5.5/10)

**Ce qui marche** :
- Sticky mobile bottom avec 2 CTA "Appeler / Devis express" après 400 px de scroll
- Preuves sociales "4,7/5 · 343 avis Google" au-dessus de la ligne de flottaison
- Événement GA4 `click_phone` déjà tracké dans `assets/tracking.js:143`
- Wizard mode "lock" cache header/footer pour focus conversion

**Ce qui bloque les leads** :
- **Photo obligatoire step 2 wizard** (`index.html:1052-1060`) → mobile en panique (fuite, main mouillée) abandonne
- **Formulaire contact 7 champs requis** (`contact.html:645-729`) — prénom, nom, tel, email, ville, service, message — trop long
- **Numéro tel invisible sur mobile <720 px** (`hc-btn-tel-num{display:none}`) — seule l'icône reste
- CTA "Devis" pages métier renvoient vers `contact.html` sans deep-link `#form` — scroll obligatoire sur mobile
- **Aucun mini-form "Être rappelé"** en hero — le lead le plus qualifiant pour dépannage panic-driven

**Chantier structurel** : refonte wizard en 2 modes (Urgence 3 champs vs Devis wizard actuel).

### 2. SEO (6/10)

**Ce qui marche** :
- 113/117 pages ont du structured data JSON-LD
- Pages métier Saint-Omer excellentes : 7500-8000 mots, schemas Plumber/HVACBusiness/Electrician, OfferCatalog
- Pages villes tier 1 (Longuenesse/Arques/Bergues) : ~2900 mots, FAQ locale, anecdote réelle

**Ce qui pénalise** :
- **18 pages métier tier 2 quasi-dupliquées** (plombier-marck, plombier-outreau, plombier-guines, chauffagiste-marck, etc.) : 58 lignes de diff hors nom, 1259 mots identiques
- **Meta `no-cache`** sur toutes les pages → force Google à re-crawler sans cache, tue le budget crawl
- **4 sitemaps concurrents** (sitemap.xml=189, sitemap-pages.xml=200, sitemap-actus.xml=19, sitemap-index.xml=2) → origine probable des "Pages avec redirection" GSC
- **7 pages orphelines** (0 lien interne) : plombier-{guines, coulogne, teteghem, outreau, le-portel, marck, grande-synthe}
- `nos-prestations.html` = seulement 12 liens vers pages villes/métier (devrait être un vrai hub)

**Chantier structurel** :
1. Générer 150-200 pages villes uniques via template Supabase (table `communes` = 222 rows non exploitées)
2. Silos thématiques par zone (audomarois, dunkerquois, calaisis, boulonnais)
3. Blog transactionnel long-tail : 80 articles "prix + [prestation] + [ville]"

**Potentiel** :
- Quick wins seuls : x1.5 à x2 trafic sous 2 mois (3-6k visites/mois)
- + Chantiers structurels : x5 à x8 sous 6-9 mois (10-25k visites/mois)

### 3. Dette technique (6.5/10)

**Top 10 hardcodes/doublons** :

| Fichier | Problème | Gain |
|---|---|---|
| `partenaires.html` (47 marques hardcodées) vs `content/apporteurs/index.json` (10) vs BDD `partners` (12) | 3 sources désync | 2h/mois évitées |
| `assets/hc-mini-zone.js:12-38` | 25 villes hardcodées vs BDD `communes` (222) | 1h par ville |
| `assets/hc-calculator.js:10-77` | Grille tarifaire en dur ← viole règle mémoire | 1 clic BO |
| `assets/hc-simulateur-aides.js:12-44` | Barèmes MaPrimeRenov hardcodés ← risque juridique | 2h/an |
| `assets/hc-pricing.js:10-70` | Prix contrats en dur | Cohérence BDD |
| `assets/hc-comparateur.js:9-170` | Chaudières/PAC + marques non-whitelist | Marques + tarifs |
| `assets/hc-avis-carousel.js:10-22` | **10 FAUX AVIS** dormants | Risque juridique |
| Header + megamenu dupliqués sur 106 pages | 690 KB × chaque page | 1h par évolution |
| Téléphone + email hardcodés sur 115 pages | Changement contact = 115 edits | Ligne 1 BDD |
| 3 sources villes (Python + JS + JS) | Régen manuel triple | Sync auto |

**Edge Functions probablement mortes** : `indexnow-ping` (pas d'appel), `refresh-meta-token` (obsolète depuis System User Token), `weekly-recap` (à vérifier logs), `generate-post-from-prompt`, `generate-service-content`, `suggest-prompt-improvement` (1 seul appel BO chacune).

**6 fichiers JS morts** (0 include) : `hc-avis-carousel.js`, `hc-avis.js`, `hc-edit-mode.js`, `hc-presta-ludique.js`, `hc-push-optin.js`, `hc-services-loader.js` = ~30 KB à supprimer.

### 4. Dashboard back-office (5.5/10)

**22 pages orphelines** (pas dans sidebar, accessibles uniquement en tapant l'URL) dont :
- `analytics.html` (69 KB, GA4 + 4 SQL agrégés)
- `publications.html` (module schedule complet)
- `bilan-mensuel.html`, `calendar.html`, `avis-non-repondus.html`, `contracts.html`, `chat-conversations.html`
- `backlinks-partenaires.html` (23 items `status: 'todo'` jamais démarré)

**Symptômes de dashboard incomplet** :
- 6 conteneurs `display:none` dans `admin-pro/index.html` (widgets abandonnés)
- Instagram flaggué "Bientôt" dans `realisations.html`
- Pas de section "Publications" dans la sidebar
- Aucun KPI CA affiché malgré les colonnes `leads.invoice_amount`, `contracts.monthly_amount`, `service_orders.price_ttc`

**Workflow "chantier → publication"** = **8-12 clics** actuellement. Cible : **3 clics**.

**Top 3 fonctionnalités manquantes** :
1. KPI CA mensuel agrégé (données existent, pas visualisées)
2. Pipeline commercial visuel (Lead → Devis → Acompte → Facturé) en € par métier
3. Publication auto post-intervention (nécessite API Apogée — bloqué projet CRM)

**12 pages mortes à supprimer** : `avis-google-toolkit.html`, `wizard-linkedin.html`, `photos-prestations.html`, `sync-fb.html`, `sync-ga4.html`, `sync-google-reviews.html`, `diagnostic-connexions.html`, `tarifs.html` (doublon `services.html`), `oauth-ga4.html` (accessible via wizard), `refresh-meta-token-client.html`, `SEO-CHECKLIST-GSC.html`, `ai.html` (doublon `magic.html`).

### 5. Automations & monitoring (6/10)

**Ce qui marche** :
- 8 crons pg_cron actifs (sync-reviews, sync-google-ads, indexnow-daily, pipeline-health-monitor, publish-scheduled, smoke-tests-prod/staging, weekly-recap, auto-sync-facebook-posts créé aujourd'hui)
- `pipeline-health-check` v5 monitore désormais GitHub/Netlify/GBP/Meta/GA4/sync FB/sync avis
- Système d'alerte email Resend avec dédup 24h

**Trous critiques** :
- **7 scheduled tasks Claude éteintes depuis 16/05/2026** : `helpconfort-daily-maintenance-scan`, `helpconfort-weekly-maintenance-report`, `helpconfort-evening-business-recap`, `helpconfort-daily-maintenance`, `helpconfort-hourly-monitoring`, `helpconfort-sync-social`, `helpconfort-keep-fb-token-alive` (ce dernier obsolète depuis System User Token 20/07)
- **`check-tokens` sans cron** alors qu'elle surveille 3 tokens critiques
- **`suggest-prompt-improvement`** jamais lancée → aucune boucle d'amélioration du chatbot
- **`actu-generator` mode auto** pas branché sur cron hebdo
- Pas d'alerte "0 lead depuis 48h en semaine"
- Pas d'alerte quota Anthropic (chat-assistant + generate-* consomment)
- Pas d'alerte échéance SSL depan59-62.fr

**Top 5 automations à ACTIVER** :
1. `helpconfort-daily-maintenance-scan` (scan quotidien + auto-fix CRITICAL)
2. `helpconfort-weekly-maintenance-report` (rapport hebdo dette technique)
3. `helpconfort-evening-business-recap` (récap 19h leads + CA + relances)
4. `helpconfort-daily-maintenance` (exécution auto TODO.md)
5. `helpconfort-hourly-monitoring` (5xx/latence/quota Edge Functions)

**Top 3 automations à CRÉER** :
1. **`digest-leads-hot`** (cron 8h) — top 5 leads chauds + CA estimé + zone → +15-25% conversion
2. **`auto-social-from-interventions`** (cron 20h) — brouillons FB/IG/GBP auto depuis chantiers Apogée → +3 publis/semaine sans effort
3. **`alert-bad-reviews`** (trigger sync-reviews) — notif immédiate + brouillon réponse dès avis 1-3★ → réputation

---

## 🎯 Plan d'exécution proposé (aligné avec S1→S4 déjà validé)

### Semaine 1 (en cours) — Quick wins zero-risk
- ✅ Tasks #14, #16, #18, #19, #22 (autonome, aucun arbitrage)
- 🟡 Tasks #13, #15, #17 (push staging + validation Florian)
- 🟡 Task #20 (widget KPI CA — livrable direct dashboard)

### Semaine 2 — Automations robustes + monitoring complet
- Réactiver les 5 scheduled tasks Claude essentielles
- Créer `digest-leads-hot` + `alert-bad-reviews`
- Fusionner analytics/seo-dashboard/bilan-mensuel
- Remettre `analytics.html` + `publications.html` dans la sidebar

### Semaine 3 — Funnel leads
- Mini-form hero "Rappelé en 15 min" (task Tier 1 #2)
- Refonte wizard en 2 modes (Urgence 3 champs / Devis wizard actuel)
- A/B test CTA principal hero
- 3 landings pages ultra-simplifiées SEA

### Semaine 4 — SEO longue traîne
- Générer 150-200 pages villes uniques via template Supabase (table `communes`)
- Silos thématiques 4 zones
- 20 articles blog long-tail "prix + [prestation] + [ville]"

---

## KPI à monitorer pour valider le succès

| KPI | Baseline actuel | Cible 30j | Cible 90j |
|---|---|---|---|
| Leads/mois via site | 3 (base actuelle) | +50 % (5-8) | ×3 (10-15) |
| Taux `click_phone` mobile | Inconnu (à mesurer GA4) | 8-12 % | 15-20 % |
| Sessions organiques/mois | ~1.5-3k | 3-6k | 10-25k |
| Pages indexées Google | À mesurer GSC | +30 % | +100 % |
| Workflow chantier → publi | 8-12 clics | 5 clics | 3 clics |
| CA/mois piloté depuis BO | Non visible | Widget dashboard | Pipeline complet |

---

*Rapport généré via 5 audits parallèles (funnel, SEO, dette technique, dashboard, automations) le 2026-07-25.*
*Tous les items sont trackés en tasks #13 à #22.*
