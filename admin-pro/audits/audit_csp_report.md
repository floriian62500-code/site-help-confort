# 🛡️ Audit CSP whitelist — Sonde IA #41

*Généré le 2026-05-15 13:07 — `admin-pro/audits/audit_csp.py`*

**Pages scannées** : 40
**Hosts externes distincts détectés** : 12
**Directives CSP parsées** : base-uri, connect-src, default-src, font-src, form-action, frame-ancestors, frame-src, img-src, script-src, style-src, upgrade-insecure-requests
**Alertes CSP block** : **159**

## 📋 Directives CSP actives (extrait netlify.toml)

- **script-src** → 'self', 'unsafe-eval', 'unsafe-inline', https://cdn.jsdelivr.net, https://unpkg.com, https://www.google-analytics.com, https://www.googletagmanager.com
- **style-src** → 'self', 'unsafe-inline', https://fonts.googleapis.com, https://unpkg.com
- **img-src** → 'self', blob:, data:, https:
- **connect-src** → 'self', https://*.supabase.co, https://*.tile.openstreetmap.org, https://api-adresse.data.gouv.fr, https://api.anthropic.com, https://www.google-analytics.com
- **frame-src** → https://www.facebook.com, https://www.google.com, https://www.google.com/maps/, https://www.youtube.com
- **font-src** → 'self', data:, https://fonts.gstatic.com
- **default-src** → 'self'

## 🚨 Alertes (host non whitelisté)

| Page | Host | Source | Directive attendue | URL |
|------|------|--------|---------------------|-----|
| 404.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| 404.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| a-propos.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/a-propos.html` |
| a-propos.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| a-propos.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| a-propos.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| actualites.html | `connect.facebook.net` | script | script-src | `https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v21.0` |
| actualites.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/actualites.html` |
| actualites.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| actualites.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| actualites.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| actualites.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| aides.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/aides.html` |
| aides.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| aides.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| avant-apres.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/avant-apres.html` |
| avant-apres.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| avant-apres.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| blog.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| blog.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/blog.html` |
| blog.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| blog.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| carrieres.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/carrieres.html` |
| carrieres.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| carrieres.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| carrieres.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| chauffagiste-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/chauffagiste-saint-omer.html` |
| chauffagiste-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| chauffagiste-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| chauffagiste-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| chauffagiste-saint-omer.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| contact.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/contact.html` |
| contact.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| contact.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| contact.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| contrats-entretien.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/contrats-entretien.html` |
| contrats-entretien.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| contrats-entretien.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| contrats-entretien.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-arques.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-arques.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-arques.html` |
| depannage-arques.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-arques.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-bergues.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-bergues.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-bergues.html` |
| depannage-bergues.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-bergues.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-dunkerque.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-dunkerque.html` |
| depannage-dunkerque.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-dunkerque.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-dunkerque.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-gravelines.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-gravelines.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-gravelines.html` |
| depannage-gravelines.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-gravelines.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-longuenesse.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-longuenesse.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-longuenesse.html` |
| depannage-longuenesse.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-longuenesse.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-saint-martin-lez-tatinghem.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| depannage-saint-martin-lez-tatinghem.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-saint-martin-lez-tatinghem.html` |
| depannage-saint-martin-lez-tatinghem.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-saint-martin-lez-tatinghem.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/depannage-saint-omer.html` |
| depannage-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| depannage-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| depannage-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| devis-express.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/devis-express.html` |
| devis-express.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| devis-express.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| electricien-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/electricien-saint-omer.html` |
| electricien-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| electricien-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| electricien-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| electricien-saint-omer.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| espace-client.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/espace-client.html` |
| espace-client.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| espace-client.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| espace-client.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| faq.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/faq.html` |
| faq.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| faq.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| faq.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| guide-adaptation-pmr.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| guide-adaptation-pmr.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/guide-adaptation-pmr.html` |
| guide-adaptation-pmr.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| guide-adaptation-pmr.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| guide-entretien-chaudiere.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| guide-entretien-chaudiere.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/guide-entretien-chaudiere.html` |
| guide-entretien-chaudiere.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| guide-entretien-chaudiere.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| guide-fuite-eau.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| guide-fuite-eau.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/guide-fuite-eau.html` |
| guide-fuite-eau.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| guide-fuite-eau.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| guide-mise-aux-normes-electriques.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| guide-mise-aux-normes-electriques.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/guide-mise-aux-normes-electriques.html` |
| guide-mise-aux-normes-electriques.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| guide-mise-aux-normes-electriques.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| guides.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| guides.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/guides.html` |
| guides.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| guides.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| index.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/` |
| index.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| index.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| index.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| index.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| mentions-legales.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/mentions-legales.html` |
| mentions-legales.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| mentions-legales.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| mentions-legales.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| nos-prestations.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| nos-prestations.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/nos-prestations.html` |
| nos-prestations.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| nos-prestations.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| plombier-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/plombier-saint-omer.html` |
| plombier-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| plombier-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| plombier-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| plombier-saint-omer.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| pro.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/pro.html` |
| pro.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| pro.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| pro.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| processus.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/processus.html` |
| processus.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| processus.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| realisation.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/realisation.html` |
| realisation.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| realisation.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| realisation.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| realisations.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/realisations.html` |
| realisations.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| realisations.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| realisations.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| realisations.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| serrurier-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/serrurier-saint-omer.html` |
| serrurier-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| serrurier-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| serrurier-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| serrurier-saint-omer.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| sinistres.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/sinistres.html` |
| sinistres.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| sinistres.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| sinistres.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| temoignages.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/temoignages.html` |
| temoignages.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| temoignages.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| travaux-saint-omer.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/travaux-saint-omer.html` |
| travaux-saint-omer.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| travaux-saint-omer.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| travaux-saint-omer.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| travaux-saint-omer.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |
| zones-intervention.html | `www.depan59-62.fr` | link-css | style-src | `https://www.depan59-62.fr/zones-intervention.html` |
| zones-intervention.html | `fonts.googleapis.com` | preconnect | connect-src | `https://fonts.googleapis.com` |
| zones-intervention.html | `fonts.gstatic.com` | preconnect | connect-src | `https://fonts.gstatic.com` |
| zones-intervention.html | `cdn.jsdelivr.net` | preconnect | connect-src | `https://cdn.jsdelivr.net` |
| zones-intervention.html | `www.facebook.com` | preconnect | connect-src | `https://www.facebook.com` |

## 📊 Hosts par directive

### script-src
- ✅ `cdn.jsdelivr.net` — 6 page(s)
- ❌ `connect.facebook.net` — 1 page(s)
- ✅ `unpkg.com` — 1 page(s)

### style-src
- ✅ `fonts.googleapis.com` — 39 page(s)
- ✅ `unpkg.com` — 1 page(s)
- ❌ `www.depan59-62.fr` — 38 page(s)

### img-src
- ✅ `images.unsplash.com` — 1 page(s)
- ✅ `plus.unsplash.com` — 1 page(s)

### connect-src
- ✅ `api-adresse.data.gouv.fr` — 32 page(s)
- ✅ `btcbjwqiivhpwoszomhg.supabase.co` — 36 page(s)
- ❌ `cdn.jsdelivr.net` — 33 page(s)
- ❌ `fonts.googleapis.com` — 39 page(s)
- ❌ `fonts.gstatic.com` — 39 page(s)
- ❌ `www.facebook.com` — 9 page(s)

### frame-src
- ✅ `www.google.com` — 1 page(s)

## 🛠️ Procédure de correction

Pour chaque host marqué ❌ :
1. Vérifier qu'il est légitime (intentionnel + à jour).
2. Ajouter le host à la directive CSP correspondante dans `netlify.toml`.
3. Re-deployer Netlify, puis ré-exécuter ce script.

*Sonde IA #41 — référence MEMOIRE_IA_MAINTENANCE.md addendum v9.*
