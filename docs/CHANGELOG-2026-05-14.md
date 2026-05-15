# CHANGELOG — Session du 14 mai 2026

Récap exhaustif de tout ce qui a été modifié / ajouté / corrigé pendant cette grosse session de travail autonome avec Florian.

---

## 🔥 Bugs critiques corrigés

### 1. Chat d'urgence cassé sur 15 pages (apostrophe non échappée)

**Symptôme :** sur 13 pages publiques, le JavaScript du chat d'urgence (`chatUrg*`) crashait à cause d'une string non échappée :

```js
// AVANT (cassé) :
confirm.innerHTML = '<p>... dans l\'heure (en horaires d\'ouverture).</p>';
// L'apostrophe de "l'heure" termine la string JS → SyntaxError
```

**Pages corrigées** (sed find/replace global) :
- `contact.html`, `mentions-legales.html`, `realisations.html`
- `depannage-saint-omer.html`, `depannage-dunkerque.html`, `depannage-arques.html`, `depannage-bergues.html`, `depannage-gravelines.html`, `depannage-longuenesse.html`, `depannage-saint-martin-lez-tatinghem.html`
- `chauffagiste-saint-omer.html`, `serrurier-saint-omer.html`, `plombier-saint-omer.html`, `electricien-saint-omer.html`, `travaux-saint-omer.html`
- `zones-intervention.html`, `a-propos.html`, `actualites.html`
- `index.html`, `contrats-entretien.html` (déjà fixés en début de session)

### 2. Bug `UNAUTHORIZED_LEGACY_JWT` sur appels Edge Functions

**Symptôme :** le bouton "Test pipeline" appelait `notify-subscription` via un `fetch()` direct avec header Authorization manuel, et Supabase rejettait avec `401 UNAUTHORIZED_LEGACY_JWT` à cause de la migration vers le nouveau format de clé publishable.

**Fix appliqué :**
- `admin-pro/contracts.html` : `fetch()` remplacé par `sb.functions.invoke()` (SDK Supabase gère la nouvelle auth automatiquement)
- `.autopush/autopush.sh` : détection du flag `verify_jwt = false` rendue plus robuste (parsing TOML avec `awk` au lieu de `grep -A2`)
- `supabase/functions/notify-subscription/index.ts` : bump version `v1.0.1 → v1.0.2` pour forcer le redéploiement avec `--no-verify-jwt`
- `supabase/functions/generate-post-from-prompt/index.ts` : idem

### 3. `setup.html` — diagnostic ne détectait pas le bucket Storage ni certaines Edge Functions

**Symptôme :** check `listBuckets()` bloqué par RLS, et check OPTIONS preflight des Edge Functions bloqué par CORS strict.

**Fix appliqué :**
- Storage check : fallback sur `from('realisations').list('')` si `listBuckets()` échoue
- Edge Functions check : 3 tentatives (OPTIONS → HEAD → POST minimal), tout statut ≠ 404 = fonction déployée

---

## 🚪 Dashboard transformé en passerelle CRM

### Avant
Le dashboard back-office tentait de gérer les interventions, contrats et plannings directement depuis Supabase.

### Après
Le dashboard est une **passerelle vers le CRM Apogée** (géré par Dynoco) :
- Bloc large "Mon CRM" avec bouton "Ouvrir mon CRM" en orange
- URL configurable dans Réglages → CRM externe
- Inbox "Souscriptions à importer dans le CRM" (apparaît si des contracts ont `imported_to_crm_at = NULL`)
- Filtre "📥 À importer dans CRM" sur la page `contracts.html`
- Bouton "📥 Importé" par ligne (saisie ID externe + horodatage)

**Mémoires sauvegardées :**
- `project_crm_passerelle.md` : interventions et contrats gérés dans CRM externe, dashboard = passerelle

---

## 📊 Dashboard KPI business-focused

Les 4 KPI du haut sont passés de "chantier-focused" à **business-focused** :

- **Leads (30j)** avec trend vs 30j précédents → `leads.html`
- **Souscriptions (30j)** + nb à importer dans CRM → `contracts.html`
- **Commandes (30j)** + à traiter → `services.html`
- **Note Google** moyenne + nb d'avis (basculé en Visiteurs si GA4) → `reviews.html`

Nouveau widget 2 colonnes sous le widget terrain :
- **Publications programmées** (8 prochains avec canaux FB+IG/LinkedIn/Google)
- **Derniers avis Google** (5 derniers avec badges "À répondre")

Nouvelles alertes contextuelles : commandes à traiter, leads à qualifier, avis non répondus.

---

## 🎨 Page publique `nos-prestations.html` relookée

Les cards de prestations avaient toutes le même fond bleu marine générique. Remplacé par :
- **Gradients colorés par métier** (plomberie cyan, chauffage rouge/orange, électricité jaune, serrurerie violet, vitrerie vert, sur-mesure orange)
- Icône plus grande et impactante (108px au lieu de 88px)
- Texture pointillée subtile en overlay (mix-blend-mode overlay)
- Badges et catégories repositionnés

---

## 🌐 Domaine `depan59-62.fr` branché sur Netlify

### Setup
- Domaine ajouté sur le projet Netlify `remarkable-dragon-364e2b`
- DNS configuré chez Gandi (registrar) :
  - `@` A record `75.2.60.5` (apex Netlify load balancer)
  - `www` CNAME `remarkable-dragon-364e2b.netlify.app.`
- Records MX, SPF, SRV, DKIM email Gandi **préservés intacts**
- Certificat HTTPS Let's Encrypt provisionné automatiquement
- Site URL Supabase Auth : `https://depan59-62.fr` (au lieu de `localhost:3000`)
- Redirect URLs Auth ajoutées

### Find/Replace global
**463 occurrences** de `helpconfort-saintomer.fr` (ancien domaine fictif) remplacées par `depan59-62.fr` dans :
- Toutes les balises canonical, og:url, schema.org JSON-LD
- `sitemap.xml`, `robots.txt`
- Tous les guides Markdown
- `supabase/config.toml` (site_url Auth)
- `supabase/functions/notify-subscription/index.ts` (FROM email par défaut)

---

## 🔐 Setup utilisateur + permissions

- User `florian.dhaillecourt@helpconfort.com` créé dans Supabase Auth
- Migration `20260514140000_grant_owner_florian.sql` : auto-grant rôle `owner` à ce user (et à `admin@helpconfort.com` en backup)

---

## 📧 Resend pour notifications email

- `RESEND_API_KEY` configurée dans Supabase Secrets
- Domaine `depan59-62.fr` : DKIM `resend._domainkey` + MX `send` + SPF `send` présents dans Gandi DNS
- Edge Function `notify-subscription` : FROM email corrigé `noreply@depan59-62.fr`
- Toutes les notifs (souscriptions, commandes, leads) routées vers `saint-omer@helpconfort.com`
- Nouvelle UI dans Settings → "Notifications email" pour changer les destinataires sans toucher au SQL

---

## 🗄️ Migrations SQL (10 nouvelles)

| Fichier | Effet |
|---|---|
| `20260514080000_fix_contracts_rls_subscriptions.sql` | RLS contracts pour insert public depuis formulaire site |
| `20260514100000_crm_passerelle.sql` | `contracts.imported_to_crm_at` + `crm_external_id` + vue `v_subscriptions_inbox` |
| `20260514110000_storage_bucket_realisations.sql` | Bucket `realisations` (photos chantiers) + RLS policies |
| `20260514120000_fix_notification_emails_domain.sql` | FROM email = `noreply@depan59-62.fr` |
| `20260514130000_notif_saint_omer.sql` | Routage toutes notifs → `saint-omer@helpconfort.com` |
| `20260514140000_grant_owner_florian.sql` | Promotion automatique de Florian en `owner` |

---

## ⚙️ Edge Functions

### Modifiées
- `notify-subscription` v1.0.2 (FROM email + redeploy)
- `generate-post-from-prompt` v2026-05-14
- `auto-publish-from-photos` v2026-05-14
- `manage-users` v2026-05-14
- `gbp-diagnostic` v2026-05-14

### `config.toml` mis à jour
- `[functions.notify-subscription] verify_jwt = false` (déjà présent)
- `[functions.generate-post-from-prompt] verify_jwt = false` (déjà présent)
- `[functions.notify-order]` commenté car la fonction n'existe pas encore

### `autopush.sh` renforcé
- Parsing TOML robuste via `awk` (au lieu de `grep -A2` fragile)
- Log explicite `🔓 Function 'X' : verify_jwt=false détecté → flag --no-verify-jwt`

---

## 📑 Documentation créée

- `docs/INTEGRATION-APOGEE-DYNOCO.md` : spec complète pour Dynoco (architecture webhook + payloads JSON)
- `docs/CHANGELOG-2026-05-14.md` : ce fichier
- Mémoires persistantes Claude :
  - `feedback_auto_apply_fixes.md` : règle daily-scan & autonomie
  - `project_crm_passerelle.md` : interventions/contrats dans CRM externe
  - `reference_domain_netlify.md` : domaine = depan59-62.fr, projet Netlify
  - `feedback_always_clickable_links.md` : toujours fournir URLs complètes
  - `project_b2c_focus_no_linkedin.md` : cible B2C, pas LinkedIn

---

## 🎯 LinkedIn neutralisé

LinkedIn (B2B) déprioritisé dans le diagnostic :
- Badge violet "B2B — OPTIONNEL"
- `weight: 0` + `skipInScore: true` (n'impacte plus le score)
- Sortie de la liste des "actions prioritaires"
- À réactiver quand l'offre Pro sera lancée (page `pro.html` existe déjà mais pas reliée à la nav principale)

---

## ✅ État final du projet (fin de session)

- Site public live sur `https://depan59-62.fr` (HTTPS Let's Encrypt)
- Back-office accessible : `https://depan59-62.fr/admin-pro/`
- Florian connecté en owner
- Resend API key configurée → emails partent (à valider via test pipeline)
- Diagnostic setup ~86% → devrait passer à ~95%+ une fois autopush déployé
- Passerelle CRM Apogée prête côté code (en attente intégration Dynoco)

## 🟡 Items restants pour atteindre 100% (côté Florian)

1. **Clé Anthropic Claude** → débloque le générateur IA — `settings.html#section-anthropic`
2. **Validation domaine `depan59-62.fr` sur Resend** → débloque l'envoi d'emails réels — `https://resend.com/domains`
3. **Envoi de l'email à Dynoco** pour démarrer l'intégration Apogée — voir `docs/INTEGRATION-APOGEE-DYNOCO.md`
4. **Test pipeline final** → quand Resend domaine est validé, le bouton "🧪 Test pipeline" doit afficher 3 étapes vertes et un email reçu à `saint-omer@helpconfort.com`
