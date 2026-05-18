# Audit Heading hierarchy — Rapport

Généré le : `2026-05-18T07:00:38`

Sonde MEMOIRE #53 — vérifie qu'il n'y a pas de saut de niveau h1→h3, qu'il y a exactement un <h1>, et que la séquence commence bien par un <h1>.

## Synthèse

- Pages auditées : **76**
- Pages clean : **66**
- Pages avec erreur(s) : **1**
- Pages avec warning(s) : **10**
- Findings totaux : **11**

## Top codes

- **9×** `SKIP_LEVEL`
- **1×** `NO_H1`
- **1×** `WRONG_START`

## Détail par page (pages avec findings)

### `realisation.html`

- h1 sur la page : **0**
- Total headings : **3**
- Séquence : `h3 → h3 → h3`
- ❌ **NO_H1** — La page ne contient pas de <h1>.
- ⚠️ **WRONG_START** — Première heading = h3 (texte : 'Métiers'). Attendu : h1.

### `chauffagiste-boulogne-sur-mer.html`

- h1 sur la page : **1**
- Total headings : **28**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Chauffage & dépannage chaudière à Boulog' à 'Prestations détaillées').

### `chauffagiste-calais.html`

- h1 sur la page : **1**
- Total headings : **28**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Chauffage & dépannage chaudière à Calais' à 'Prestations détaillées').

### `chauffagiste-saint-omer.html`

- h1 sur la page : **1**
- Total headings : **27**
- Séquence : `h1 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Chauffage & dépannage chaudière à Saint-' à 'Prestations détaillées').

### `plombier-boulogne-sur-mer.html`

- h1 sur la page : **1**
- Total headings : **22**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Plomberie &amp; dépannage rapide à Boulo' à 'Prestations détaillées').

### `plombier-calais.html`

- h1 sur la page : **1**
- Total headings : **22**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Plomberie &amp; dépannage rapide à Calai' à 'Prestations détaillées').

### `plombier-saint-omer.html`

- h1 sur la page : **1**
- Total headings : **21**
- Séquence : `h1 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Plomberie &amp; dépannage rapide à Saint' à 'Prestations détaillées').

### `serrurier-boulogne-sur-mer.html`

- h1 sur la page : **1**
- Total headings : **22**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Serrurerie & ouverture de porte à Boulog' à 'Prestations détaillées').

### `serrurier-calais.html`

- h1 sur la page : **1**
- Total headings : **22**
- Séquence : `h1 → h3 → h2 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Serrurerie & ouverture de porte à Calais' à 'Prestations détaillées').

### `serrurier-saint-omer.html`

- h1 sur la page : **1**
- Total headings : **21**
- Séquence : `h1 → h3 → h2 → h3 → h3 → h3 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Serrurerie & ouverture de porte à Saint-' à 'Prestations détaillées').

## ✅ Pages sans finding

- `a-propos.html`
- `actualites.html`
- `agence-dunkerque.html`
- `agence-saint-omer.html`
- `aides.html`
- `avant-apres.html`
- `blog.html`
- `carrieres.html`
- `chauffagiste-dunkerque.html`
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
- `electricien-boulogne-sur-mer.html`
- `electricien-calais.html`
- `electricien-dunkerque.html`
- `electricien-saint-omer.html`
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
- `menuisier-dunkerque.html`
- `menuisier-saint-omer.html`
- `nos-metiers.html`
- `nos-prestations.html`
- `nos-villes.html`
- `ouverture-porte-claquee.html`
- `partenaires.html`
- `plan-du-site.html`
- `plombier-dunkerque.html`
- `pmr-dunkerque.html`
- `pmr-saint-omer.html`
- `pro.html`
- `processus.html`
- `realisations.html`
- `remplacement-chauffe-eau.html`
- `serrurier-dunkerque.html`
- `sinistres.html`
- `tarifs.html`
- `temoignages.html`
- `travaux-dunkerque.html`
- `travaux-saint-omer.html`
- `urgence.html`
- `vitrier-dunkerque.html`
- `vitrier-saint-omer.html`
- `volets-dunkerque.html`
- `volets-saint-omer.html`
- `zones-intervention.html`
