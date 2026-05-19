# Audit Heading hierarchy — Rapport

Généré le : `2026-05-19T06:52:12`

Sonde MEMOIRE #53 — vérifie qu'il n'y a pas de saut de niveau h1→h3, qu'il y a exactement un <h1>, et que la séquence commence bien par un <h1>.

## Synthèse

- Pages auditées : **80**
- Pages clean : **77**
- Pages avec erreur(s) : **1**
- Pages avec warning(s) : **3**
- Findings totaux : **4**

## Top codes

- **1×** `NO_HEADINGS`
- **1×** `SKIP_LEVEL`
- **1×** `NO_H1`
- **1×** `WRONG_START`

## Détail par page (pages avec findings)

### `realisation.html`

- h1 sur la page : **0**
- Total headings : **3**
- Séquence : `h3 → h3 → h3`
- ❌ **NO_H1** — La page ne contient pas de <h1>.
- ⚠️ **WRONG_START** — Première heading = h3 (texte : 'Métiers'). Attendu : h1.

### `googlef09a1887914c5a23.html`

- h1 sur la page : **0**
- Total headings : **0**
- Séquence : `(aucune)`
- ⚠️ **NO_HEADINGS** — Aucune balise <h1>..<h6> trouvée sur la page.

### `pmr-saint-omer.html`

- h1 sur la page : **1**
- Total headings : **17**
- Séquence : `h1 → h3 → h2 → h3 → h3 → h3 → h2 → h2 → h2 → h2 → h3 → h4 → h2 → h2 → h3 → h3 → h3`
- ⚠️ **SKIP_LEVEL** — Saut h1 → h3 (de 'Adaptation PMR à domicile — Saint-Omer e' à "MaPrimeAdapt&apos; — jusqu'à 70 % d'aide").

## ✅ Pages sans finding

- `a-propos.html`
- `actualites.html`
- `agence-dunkerque.html`
- `agence-saint-omer.html`
- `aides.html`
- `avant-apres.html`
- `blog.html`
- `carrieres.html`
- `chauffagiste-boulogne-sur-mer.html`
- `chauffagiste-calais.html`
- `chauffagiste-dunkerque.html`
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
- `diagnostic-electrique.html`
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
- `panne-chaudiere.html`
- `partenaires.html`
- `plan-du-site.html`
- `plombier-boulogne-sur-mer.html`
- `plombier-calais.html`
- `plombier-dunkerque.html`
- `plombier-saint-omer.html`
- `pmr-dunkerque.html`
- `pro.html`
- `processus.html`
- `realisations.html`
- `remplacement-chauffe-eau.html`
- `reseau-help-confort.html`
- `serrurier-boulogne-sur-mer.html`
- `serrurier-calais.html`
- `serrurier-dunkerque.html`
- `serrurier-saint-omer.html`
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
