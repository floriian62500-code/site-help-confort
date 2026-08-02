# Handoff Claude Code — HELP Confort

**Date du handoff** : 2026-07-29
**Handoff depuis** : session Cowork Florian (Anthropic Claude)
**Destination** : Claude Code (CLI dans le repo local)

Ce document est ton **cahier de reprise complet**. Après lecture, tu peux prendre le relais sur n'importe quel sujet HC.

---

## 1. Contexte projet en 30 secondes

HELP Confort Saint-Omer & Dunkerque, dépannage multi-services habitat. Site depan59-62.fr, Netlify, Supabase, GitHub. Panier moyen 400 €. Objectif business : générer plus de leads via le site.

**Ce que HC vend** : plomberie, chauffage, électricité, serrurerie, vitrerie, menuiserie, travaux/rénovation, contrats d'entretien, réservation de prestations en ligne (à venir).

**Séparation métier stricte** : HC utilise déjà un CRM externe (Apogée) pour gérer interventions/planning/devis/factures/contrats/techniciens. Le site + BO ne doivent **jamais** doublonner ces fonctions. Le BO est un **centre de pilotage du site** (contenus, SEO, réseaux sociaux, publications, monitoring), pas un CRM/ERP.

---

## 2. État actuel des développements (2026-07-29)

### Lots livrés côté code (🟠 en attente déploiement)

**Lot 1 — Homepage qui convertit** (voir `index.html` + `contact.html` + 7 pages métier)
- Wizard urgence : photo incitative (pas bloquante) + message empathique
- Parcours narratif 5 étapes sur home + contact (rassurance)
- CTA hero harmonisés sur 7 pages métier vers `contact.html?metier=X#form`
- Responsive mobile <480px vertical
- Meta `no-cache` retiré des 62 pages HTML (SEO indexation)

**Lot 2 — Pages métiers premium** (7 pages tier 1 : plombier / chauffagiste / électricien / serrurier / vitrier / menuisier / travaux)
Ordre des sections (validé Florian) :
1. Hero métier (existant)
2. Trust-band (existant)
3. **§1 Pourquoi HELP Confort** — 6 engagements concrets (nouveau)
4. **§2 Zone d'intervention** — 222 communes / 4 zones (nouveau, Edge Fn communes-list v1)
5. **§3 Notre savoir-faire** (existant)
6. **§3-bis Nos chantiers récents** — 4 chantiers filtrés par métier + deep-link slug (amélioré)
7. **§4 Marques et fournisseurs** — Edge Fn suppliers-by-metier v1 (nouveau)
8. **§5 FAQ métier + schema.org FAQPage** — 6 questions/réponses par métier (nouveau, SEO en dernier)
9. **§8 Parcours narratif** — 5 étapes rassurantes avant footer (nouveau)
10. Footer

### Ce qui bloque le déploiement

- **GitHub token révoqué** (`ghp_0wUyIL...`) → GitHub API retourne 401 partout
- `gh-edit-file` Edge Function ne peut plus pusher
- Repo local : `ahead 60+ commits · behind ~80` sur `origin/main`
- Netlify auto-deploy inutile sans push GitHub

### Solutions débloquantes

Voir `tools/Deploy-Full-Prod.command` (créé 2026-07-25) — deploy direct Netlify API via curl, ne nécessite QUE un Netlify Personal Access Token (2 min à générer sur netlify.com).

ZIP preview prêt dans `outputs/help-confort-preview.zip` (46 MB) pour drag-drop sur https://app.netlify.com/drop si besoin d'une preview immédiate sans deploy.

---

## 3. Roadmap validée (à exécuter dans l'ordre)

| Sem | Lot | Statut | Contenu |
|---|---|:---:|---|
| S1 | Lot 1 Homepage | 🟠 code | En attente prod |
| S2 | Lot 2 Pages métiers | 🟠 code | En attente prod |
| S3 | Lot 3 IA publication | ⏳ | 1 chantier CRM → 6 sorties web auto (réal + actu + FB + IG + LinkedIn + GBP + fiche SEO) |
| S4 | Lot 4 Réservation en ligne | ⏳ | Stripe branché sur `service_orders` (5-10 prestations forfaitaires) |
| S5 | Lot 5 SEO local massif | ⏳ | 150-200 pages villes×métier riches depuis table `communes` |
| S6 | Lot 6 Passerelle CRM + IA qualité | ⏳ | Webhook Apogée + IA hebdo pages faibles perf |

### Hors scope explicite (relève CRM Apogée)

- Scoring commercial des leads (vente)
- Devis auto avec pièces/marges/temps
- Réponses devis
- Planning technicien, facturation, contrats signés, RH

---

## 4. Infrastructure & ressources techniques

### Supabase (projet `btcbjwqiivhpwoszomhg`)

**URL dashboard** : https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg

**Tables clés** :
- `realisations` (24 rows, chantiers publiés sur site) — colonnes : `id, title, slug, description, metier, ville, image_after, published, published_at, ai_generated`
- `services` (36 rows) — catalogue prestations
- `communes` (222 rows) — table géo secteur Nord+PdC, groupée par `zone` (audomarois, calaisis, boulonnais, dunkerque) et `agence` (saint-omer, dunkerque)
- `suppliers` (36 rows) — fournisseurs/marques par métier (colonnes `metiers` array + `is_preferred` bool)
- `partners` (12 rows) — apporteurs d'affaires (syndics, réseaux, assurances)
- `leads` — leads reçus depuis formulaires
- `reviews` — avis clients (sync Google + Trustville)
- `app_settings` — clés config (`meta`, `gbp`, `ga4_oauth`, etc.)

**Edge Functions actives (37 déployées)** :

*Cœur métier* :
- `sitemap` v6 — sitemap.xml dynamique (SITE_URL corrigé `depan59-62.fr` le 20/07)
- `realisations-json` v1 — feed public des chantiers
- `partners-json` v1 — feed partenaires
- `suppliers-by-metier` v1 (nouveau 25/07) — filtre suppliers par métier pour Lot 2 §4
- `communes-list` v1 (nouveau 25/07) — communes groupées par zone pour Lot 2 §2

*Synchro données* :
- `sync-facebook-posts` v9 — sync FB → `realisations` (cron pg_cron `auto-sync-facebook-posts` toutes 30 min)
- `sync-reviews` v5 — avis Google
- `sync-google-ads` v3 — stats campagnes
- `publish-meta` / `publish-gbp` / `publish-linkedin` / `publish-scheduled` — chaîne publication
- `refresh-meta-token` — obsolete depuis System User Token

*Monitoring* :
- `pipeline-health-check` v6 — check GitHub/Netlify/GBP/Meta/GA4/sync FB. Cron pg_cron 30 min. Envoie mail Resend si CRITICAL.
- `check-tokens` v4
- `smoke-tests-prod` / `smoke-tests-staging` v1

*IA & contenus* :
- `chat-assistant` v1 — chatbot site (Anthropic Claude API)
- `generate-content` v5
- `generate-post-from-prompt`
- `actu-generator`

*Leads & paiement* :
- `submit-lead` v4 — form → INSERT leads
- `notify-lead` v5 — notif email nouveau lead
- `lead-auto-reply` v1
- `stripe-create-payment-link` v1 (à brancher pour Lot 4)
- `stripe-webhook` v1

*Outils déploiement/GitHub* :
- `gh-edit-file` v3 — bloqué actuellement (token révoqué)
- `gh-push-inline` / `gh-push-batch` / `gh-push-from-chunks`
- `gh-delete-files`
- `gh-bulk-purge-seo-stats`

### GitHub

- Repo : `floriian62500-code/site-help-confort`
- Branche prod : `main`
- Branche preview : `staging`
- Token en dur historique : `ghp_0wUyIL...` **RÉVOQUÉ** — à regénérer
- Auto-push local via LaunchAgent (voir `tools/Install-AutoPush.command`)

### Netlify

- Site : `remarkable-dragon-364e2b`
- URL prod : https://depan59-62.fr
- URL staging : https://staging--remarkable-dragon-364e2b.netlify.app
- Build hook : `https://api.netlify.com/build_hooks/6a26eff522f7d312d7a47790` (dans `tools/.netlify-build-hook`)
- `NETLIFY_TOKEN` en Supabase Secret (utilisé par pipeline-health-check)

### Meta / Facebook

- App ID : `986385010519313` (Help Confort Back-Office)
- App Secret : dans `app_settings.meta` (JAMAIS en clair)
- Page FB : `107405408058063` (Help Confort ST OMER)
- Business Manager : `1096494215681031`
- **System User Token permanent en place depuis 20/07/2026** (voir `docs/META-SYSTEM-USER-TOKEN.md`)
- User system : `Helpconfortapi` (id `61591756427273`)

### GA4

- Property : `537770890`
- OAuth user en place (voir mémoire `project_ga4_oauth_success`)
- **Refresh_token cassé actuellement** (invalid_grant) → à reconnecter via `/admin-pro/oauth-ga4.html`

### Google Business Profile

- OAuth OK (voir `/admin-pro/wizard-gbp.html`)
- Quota API en attente Google (case 3-5353000041141, envoyée 11/06)

---

## 5. Secrets à configurer (voir `docs/GUIDE-SECRETS-CONFIGURATION.md`)

Statut actuel :
- `GITHUB_TOKEN` : 🔴 révoqué → **URGENT** à regénérer (Fine-grained PAT scope `Contents: R/W` sur `site-help-confort`) → stocker en Supabase Secret
- `HC_CRON_SECRET` : 🟡 en dur dans `sync-facebook-posts` → à migrer
- `RESEND_API_KEY` : ✅ configuré
- `NETLIFY_TOKEN` : ✅ configuré
- `ANTHROPIC_API_KEY` : ✅ configuré
- `STRIPE_SECRET_KEY` : ⚪ à configurer quand Lot 4 démarre
- `STRIPE_WEBHOOK_SECRET` : ⚪ idem
- `TWILIO_*` : ⚪ backlog SMS avis clients
- Meta `page_access_token` : ✅ System User permanent
- GBP OAuth : 🔴 refresh cassé → reconnecter
- GA4 OAuth : 🔴 refresh cassé → reconnecter

**Règle absolue** : aucun secret dans le code, aucun secret dans les échanges. Stockage exclusif Supabase Secrets / GitHub Secrets. Lecture Edge Fn via `Deno.env.get()`.

---

## 6. Procédures opérationnelles

### Deploy prod (recommandé après config Netlify PAT)

```bash
# 1. Génération Netlify PAT (une fois)
#    → https://app.netlify.com/user/applications#personal-access-tokens
#    → coller dans tools/.netlify-access-token

# 2. Chaque deploy = double-clic
open "tools/Deploy-Full-Prod.command"
# ou en CLI :
./tools/Deploy-Full-Prod.command
```

Le script zippe le local (avec exclusions sécurité), POST à Netlify API, poll état, retourne URL de deploy en 90 sec.

### Deploy via GitHub (nominal, quand token restauré)

```bash
git add . && git commit -m "..."
git push origin staging   # ou main pour prod
# Netlify auto-deploy déclenché
```

### Test Edge Function

```bash
curl -sS "https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/pipeline-health-check" | jq
```

### Query Supabase depuis Claude Code

Utiliser le MCP Supabase si configuré, sinon curl avec token service_role (attention sensible).

---

## 7. Fichiers de contexte à connaître

**Mémoires opérationnelles** (à lire en priorité) :
- `CONTEXTE-ACTIF.md` — brief opérationnel principal Florian
- `POUR-FLORIAN.md` — items en attente d'arbitrage humain
- `BUGS-HISTORY.md` — capitalisation des bugs résolus (patterns récurrents)
- `ALERTES.md` — alertes en cours

**Guides techniques** :
- `docs/GUIDE-SECRETS-CONFIGURATION.md` — tous les secrets
- `docs/META-SYSTEM-USER-TOKEN.md` — token Meta permanent
- `docs/SPEC-LOT-2-PAGES-METIERS-PREMIUM.md` — spec Lot 2
- `docs/BACKLOG.md` — idées parkées
- `docs/RAPPORT-AUDIT-2026-07-25.md` — audit initial

**Configuration** :
- `netlify.toml` — config Netlify + build ignore rules
- `_redirects` — routing (dont sitemap → Edge Fn)
- `robots.txt` — 1 seul sitemap (simplifié 25/07)

**Structure repo** :
```
SITE INTERNET/
├── *.html (117 pages)
├── admin-pro/ (BO, 53 pages)
├── admin/ (auth)
├── assets/ (JS/CSS)
├── content/ (JSON statiques)
├── images/, prestations/, guides/, actualites/, og/, videos/
├── realisations/ (page détail dynamique via ?slug=)
├── supabase/functions/ (code Edge Functions)
├── tools/ (scripts .command — jamais deployés)
├── scripts/, logs/, docs/ (internes — pas deployés)
├── secrets/ ⚠️ SENSIBLE (Google Cloud JSON, jamais deployés)
├── CLAUDE.md ← ton point d'entrée
├── CONTEXTE-ACTIF.md ← contexte détaillé
├── BUGS-HISTORY.md, POUR-FLORIAN.md, ALERTES.md
└── netlify.toml, _redirects, robots.txt, sitemap.xml
```

---

## 8. Comportements et règles d'or (résumé)

Extrait des mémoires opérationnelles Florian :

1. **Filtre unique** : "Est-ce que ça aide le site à générer plus de CA ?" Sinon hors scope.
2. **Grille 7 critères business** : chaque feature coche ≥1 (demandes/appels/ventes en ligne/confiance/SEO/auto comm/gain temps).
3. **Grille 8 questions produit** : émotion visiteur, confiance, passage à l'action, friction, SEO, auto comm, temps, différenciation vs concurrent.
4. **WIP=1** : un seul lot majeur ouvert. Terminé > commencé.
5. **DVCV** : Dev → Vérif → Corriger → Optim → Livrer → Valider. Jamais accumuler.
6. **3 états** : 🟡 Développé / 🟠 Vérifié techniquement / 🟢 Validé navigateur réel.
7. **Rapports factuels** : chaque affirmation démontrable, format "Item testé sur X : OK (preuve)". Zéro ✅ vagues. Zéro % hypothétique.
8. **Lot gelé = pas de retouche** : quand un lot est en attente validation, ne plus modifier son code.
9. **Livrer > proposer** : nouvelles idées → `docs/BACKLOG.md`. Max 1 proposition à la fois seulement si blocage/gain démontré.
10. **Parcours utilisateur > page isolée** : toujours penser tunnel complet.
11. **Émotion avant technique** : on vend confiance.
12. **1 page = 1 objectif unique**.
13. **Différenciation vs concurrent** : jamais "parce que c'est joli", toujours "plus organisé/rassurant/moderne/pro/transparent/réactif/crédible".
14. **Charte HC** : bleus #0DA0CF/#1FC4F0, orange urgence, Inter+Playfair.
15. **Home vitrine minimaliste** : 5 sections max, tout nouveau composant demander OÙ.
16. **AUCUN hardcode** de prestations/tarifs/promesses. Source unique Supabase.
17. **Whitelist fournisseurs** : Delpha, Atlantic autorisés. JAMAIS de concurrents (TRYBA, LAPEYRE).
18. **B2C uniquement** — LinkedIn en pause.
19. **Français partout** (chat, commits, docs).
20. **Secrets JAMAIS en clair** — ni code, ni échanges.
21. **Staging obligatoire** avant merge main.
22. **Push monitoring** — alerter si divergence ahead/behind.
23. **Diagnostic profond** avant 1er fix (BDD/deps/cache).
24. **Grep HTML inline** avant de toucher au JS externe (bug récurrent).
25. **Auto-fix maintenance** — daily scan avec correction critical, pas juste rapport.
26. **Contrôle qualité audio** obligatoire entre intervention et SMS avis client (jamais auto post-intervention).
27. **Pas d'annonce "session finie" prématurée**.
28. **Récap final court** — 5-7 lignes max, format liste sèche.
29. **Bug visuel "encore/toujours"** → check deploy avant de re-lire le code.
30. **Toujours fournir lien cliquable** — chaque référence à une page/URL inclut l'URL complète.

---

## 9. Prochaines actions concrètes (ordre)

1. **Toi (Claude Code)** : lire `CLAUDE.md`, ce handoff, puis `CONTEXTE-ACTIF.md` et `POUR-FLORIAN.md` avant première action.
2. **Florian** : configurer nouveau GitHub PAT OU générer Netlify PAT pour `Deploy-Full-Prod.command` (5 min max).
3. **Toi** : dès que Florian confirme, exécuter deploy prod, puis vérification runtime (Lighthouse, console, navigation clavier, click test CTA, Edge Fn 200 OK).
4. **Toi** : monitorer conversions GA4 sur les 7 jours suivants (click_phone, form_submit, wizard funnel step 1→4).
5. **Toi** : après mise en prod stable, ouvrir Lot 3 IA publication (spec dispo dans mémoires + sur ce doc §3 Roadmap).

---

## 10. Contacts humains

- **Florian Dhaillecourt** — florian.dhaillecourt@helpconfort.com — décision produit + validation tout GO en production
- **Arnaud Louiset** — Trustville/WizVille réponses avis (au siège HC, hors périmètre technique)
- **Éditeur CRM Apogée** — API webhook chantier terminé (à contacter pour Lot 6 Passerelle CRM)

---

*Handoff préparé le 2026-07-29. Ce document est la source de vérité pour la reprise. Toute divergence entre ce doc et un autre = ce doc gagne, sauf mention explicite de mise à jour datée.*
