# Audit HTML5 — 2026-05-15 13:28

> Audit local rapide HTML5 + a11y de base. Lancement : `python3 admin-pro/audits/audit_html5.py`
> ⚠️ Ce n'est pas un substitut au validateur W3C officiel, mais il pré-filtre les erreurs évidentes.

## Synthèse

- Pages auditées : **40**
- Pages avec erreurs : **2**
- Pages avec warnings : **29**
- Total erreurs : **3**
- Total warnings : **29**

## Top patterns d'erreurs

- **1×** BODY-HEAD-MISSING : balise </head> introuvable
- **1×** BODY-HEAD-MISSING : balise <body> introuvable
- **1×** <meta name="description"> manquant ou vide

## Détail par page (pages problématiques uniquement)

### `404.html`

- ❌ BODY-HEAD-MISSING : balise </head> introuvable
- ❌ BODY-HEAD-MISSING : balise <body> introuvable

### `reset.html`

- ❌ <meta name="description"> manquant ou vide

### `a-propos.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 65↗ / 66↘, <div> 90↗ / 91↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `actualites.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 64↗ / 65↘, <div> 37↗ / 38↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `carrieres.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 72↗ / 73↘, <div> 94↗ / 95↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `chauffagiste-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 107↗ / 108↘, <div> 154↗ / 155↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `contact.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 62↗ / 63↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `contrats-entretien.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 66↗ / 67↘, <div> 160↗ / 161↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-arques.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 78↗ / 79↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-bergues.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 79↗ / 80↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-dunkerque.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 75↗ / 76↘, <div> 114↗ / 115↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-gravelines.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 78↗ / 79↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-longuenesse.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 79↗ / 80↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-saint-martin-lez-tatinghem.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 78↗ / 79↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 77↗ / 78↘, <div> 108↗ / 109↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `electricien-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 104↗ / 105↘, <div> 148↗ / 149↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `espace-client.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 65↗ / 66↘, <div> 60↗ / 61↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-adaptation-pmr.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 31↗ / 32↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-entretien-chaudiere.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-fuite-eau.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-mise-aux-normes-electriques.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guides.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 44↗ / 45↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `index.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 81↗ / 82↘, <div> 163↗ / 164↘
- ℹ️ 18 <img> avec alt vide (OK si décoratif)

### `mentions-legales.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 72↗ / 73↘, <div> 33↗ / 34↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 108↗ / 109↘, <div> 156↗ / 157↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `pro.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 69↗ / 70↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `realisations.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 65↗ / 66↘, <div> 42↗ / 43↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `serrurier-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 107↗ / 108↘, <div> 154↗ / 155↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `sinistres.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 58↗ / 59↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `travaux-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 107↗ / 108↘, <div> 154↗ / 155↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `zones-intervention.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 78↗ / 79↘, <div> 100↗ / 101↘
- ℹ️ 16 <img> avec alt vide (OK si décoratif)

### `blog.html`

- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `realisation.html`

- ℹ️ aucun <h1> statique — injecté par JS (page dynamique)

## ✅ Pages sans erreur ni warning

- `aides.html`
- `avant-apres.html`
- `blog.html`
- `devis-express.html`
- `faq.html`
- `nos-prestations.html`
- `processus.html`
- `realisation.html`
- `temoignages.html`
