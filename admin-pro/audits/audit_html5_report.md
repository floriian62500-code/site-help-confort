# Audit HTML5 — 2026-05-15 10:49

> Audit local rapide HTML5 + a11y de base. Lancement : `python3 admin-pro/audits/audit_html5.py`
> ⚠️ Ce n'est pas un substitut au validateur W3C officiel, mais il pré-filtre les erreurs évidentes.

## Synthèse

- Pages auditées : **38**
- Pages avec erreurs : **1**
- Pages avec warnings : **31**
- Total erreurs : **2**
- Total warnings : **32**

## Top patterns d'erreurs

- **1×** <meta name="description"> manquant ou vide
- **1×** aucun <hN>

## Détail par page (pages problématiques uniquement)

### `realisation.html`

- ❌ <meta name="description"> manquant ou vide
- ❌ aucun <h1>

### `index.html`

- ⚠️ 3 <button> sans texte ni aria-label
- ⚠️ balisage déséquilibré (indicatif) : <a> 86↗ / 87↘, <div> 163↗ / 164↘
- ℹ️ 18 <img> avec alt vide (OK si décoratif)

### `404.html`

- ⚠️ <link rel="canonical"> manquant

### `a-propos.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 70↗ / 71↘, <div> 91↗ / 92↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `actualites.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 67↗ / 68↘, <div> 37↗ / 38↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `carrieres.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 75↗ / 76↘, <div> 94↗ / 95↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `chauffagiste-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 112↗ / 113↘, <div> 155↗ / 156↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `contact.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 73↗ / 74↘, <div> 63↗ / 64↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `contrats-entretien.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 161↗ / 162↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-arques.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 81↗ / 82↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-bergues.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 82↗ / 83↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-dunkerque.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 78↗ / 79↘, <div> 114↗ / 115↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-gravelines.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 81↗ / 82↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-longuenesse.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 82↗ / 83↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-saint-martin-lez-tatinghem.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 81↗ / 82↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `depannage-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 80↗ / 81↘, <div> 108↗ / 109↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `electricien-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 109↗ / 110↘, <div> 149↗ / 150↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `espace-client.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 68↗ / 69↘, <div> 60↗ / 61↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `faq.html`

- ⚠️ <title> long (88 chars, >70 recommandé)

### `guide-adaptation-pmr.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 31↗ / 32↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-entretien-chaudiere.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-fuite-eau.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guide-mise-aux-normes-electriques.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 30↗ / 31↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `guides.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 44↗ / 45↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `mentions-legales.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 76↗ / 77↘, <div> 34↗ / 35↘
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 113↗ / 114↘, <div> 157↗ / 158↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `pro.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 72↗ / 73↘, <div> 70↗ / 71↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `realisations.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 67↗ / 68↘, <div> 37↗ / 38↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `serrurier-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 112↗ / 113↘, <div> 155↗ / 156↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `sinistres.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 71↗ / 72↘, <div> 58↗ / 59↘
- ℹ️ 7 <img> avec alt vide (OK si décoratif)

### `travaux-saint-omer.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 112↗ / 113↘, <div> 155↗ / 156↘
- ℹ️ 10 <img> avec alt vide (OK si décoratif)

### `zones-intervention.html`

- ⚠️ balisage déséquilibré (indicatif) : <a> 83↗ / 84↘, <div> 101↗ / 102↘
- ℹ️ 16 <img> avec alt vide (OK si décoratif)

## ✅ Pages sans erreur ni warning

- `aides.html`
- `avant-apres.html`
- `devis-express.html`
- `nos-prestations.html`
- `processus.html`
- `temoignages.html`
