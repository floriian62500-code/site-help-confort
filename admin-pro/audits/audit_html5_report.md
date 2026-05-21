# Audit HTML5 — 2026-05-21 06:55

> Audit local rapide HTML5 + a11y de base. Lancement : `python3 admin-pro/audits/audit_html5.py`
> ⚠️ Ce n'est pas un substitut au validateur W3C officiel, mais il pré-filtre les erreurs évidentes.

## Synthèse

- Pages auditées : **82**
- Pages avec erreurs : **2**
- Pages avec warnings : **20**
- Total erreurs : **10**
- Total warnings : **21**

## Top patterns d'erreurs

- **2×** <meta name="description"> manquant ou vide
- **1×** DOCTYPE html manquant ou incorrect
- **1×** balise <html> manquante
- **1×** <meta charset> manquant
- **1×** <title> manquant ou vide
- **1×** <meta name="viewport"> manquant
- **1×** BODY-HEAD-MISSING : balise </head> introuvable
- **1×** BODY-HEAD-MISSING : balise <body> introuvable
- **1×** aucun <hN>

## Détail par page (pages problématiques uniquement)

### `googlef09a1887914c5a23.html`

- ❌ DOCTYPE html manquant ou incorrect
- ❌ balise <html> manquante
- ❌ <meta charset> manquant
- ❌ <title> manquant ou vide
- ❌ <meta name="description"> manquant ou vide
- ❌ <meta name="viewport"> manquant
- ❌ BODY-HEAD-MISSING : balise </head> introuvable
- ❌ BODY-HEAD-MISSING : balise <body> introuvable
- ❌ aucun <h1>
- ⚠️ <link rel="canonical"> manquant

### `diagnostic-electrique.html`

- ❌ <meta name="description"> manquant ou vide
- ⚠️ <title> long (83 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `reseau-help-confort.html`

- ⚠️ <title> long (108 chars, >70 recommandé)
- ⚠️ meta description longue (173 chars, >170 → tronquée)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-boulogne-sur-mer.html`

- ⚠️ meta description longue (176 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-dunkerque.html`

- ⚠️ meta description longue (172 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-boulogne-sur-mer.html`

- ⚠️ meta description longue (175 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-dunkerque.html`

- ⚠️ meta description longue (171 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-saint-omer.html`

- ⚠️ meta description longue (190 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `menuisier-dunkerque.html`

- ⚠️ meta description longue (174 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `nos-villes.html`

- ⚠️ <title> long (82 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `partenaires.html`

- ⚠️ meta description longue (196 chars, >170 → tronquée)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-boulogne-sur-mer.html`

- ⚠️ meta description longue (172 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `pmr-dunkerque.html`

- ⚠️ meta description longue (179 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-boulogne-sur-mer.html`

- ⚠️ meta description longue (173 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-saint-omer.html`

- ⚠️ meta description longue (183 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `travaux-dunkerque.html`

- ⚠️ meta description longue (185 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `travaux-saint-omer.html`

- ⚠️ <title> long (87 chars, >70 recommandé)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `urgence.html`

- ⚠️ <title> long (93 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `vitrier-dunkerque.html`

- ⚠️ meta description longue (172 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `volets-dunkerque.html`

- ⚠️ meta description longue (171 chars, >170 → tronquée)
- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `404.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `a-propos.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `actualites.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `agence-dunkerque.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `agence-saint-omer.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `aides.html`

- ℹ️ 8 <img> avec alt vide (OK si décoratif)

### `blog.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `carrieres.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `contact.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `contrats-entretien.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `debouchage-canalisation.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-arques.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-bergues.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-boulogne-sur-mer.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-calais.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-coquelles.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-dunkerque.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-gravelines.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-longuenesse.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-saint-martin-lez-tatinghem.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `depannage-saint-omer.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-saint-pol-sur-mer.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `depannage-sangatte.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `electricien-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `entretien-chaudiere.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `espace-client.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `guide-adaptation-pmr.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `guide-entretien-chaudiere.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `guide-fuite-eau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `guide-mise-aux-normes-electriques.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `guides.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `index.html`

- ℹ️ 20 <img> avec alt vide (OK si décoratif)

### `mentions-legales.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `menuisier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `nos-metiers.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `nos-prestations.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `ouverture-porte-claquee.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `panne-chaudiere.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `pmr-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `pro.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `realisation.html`

- ℹ️ aucun <h1> statique — injecté par JS (page dynamique)

### `realisations.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `remplacement-chauffe-eau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `serrurier-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `sinistres.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `tarifs.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `vitrier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `volets-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `zones-intervention.html`

- ℹ️ 20 <img> avec alt vide (OK si décoratif)

## ✅ Pages sans erreur ni warning

- `404.html`
- `a-propos.html`
- `actualites.html`
- `agence-dunkerque.html`
- `agence-saint-omer.html`
- `aides.html`
- `avant-apres.html`
- `blog.html`
- `carrieres.html`
- `chauffagiste-calais.html`
- `chauffagiste-saint-omer.html`
- `contact.html`
- `contrats-entretien.html`
- `debouchage-canalisation.html`
- `depannage-arques.html`
- `depannage-bergues.html`
- `depannage-boulogne-sur-mer.html`
- `depannage-calais.html`
- `depannage-coquelles.html`
- `depannage-dunkerque.html`
- `depannage-gravelines.html`
- `depannage-longuenesse.html`
- `depannage-saint-martin-lez-tatinghem.html`
- `depannage-saint-omer.html`
- `depannage-saint-pol-sur-mer.html`
- `depannage-sangatte.html`
- `devis-express.html`
- `electricien-calais.html`
- `entretien-chaudiere.html`
- `espace-client.html`
- `faq.html`
- `guide-adaptation-pmr.html`
- `guide-entretien-chaudiere.html`
- `guide-fuite-eau.html`
- `guide-mise-aux-normes-electriques.html`
- `guides.html`
- `index.html`
- `mentions-legales.html`
- `menuisier-saint-omer.html`
- `nos-metiers.html`
- `nos-prestations.html`
- `ouverture-porte-claquee.html`
- `panne-chaudiere.html`
- `plan-du-site.html`
- `plombier-calais.html`
- `plombier-dunkerque.html`
- `plombier-saint-omer.html`
- `pmr-saint-omer.html`
- `pro.html`
- `processus.html`
- `realisation.html`
- `realisations.html`
- `remplacement-chauffe-eau.html`
- `reset.html`
- `serrurier-calais.html`
- `serrurier-dunkerque.html`
- `sinistres.html`
- `tarifs.html`
- `temoignages.html`
- `vitrier-saint-omer.html`
- `volets-saint-omer.html`
- `zones-intervention.html`
