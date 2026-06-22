# Audit HTML5 — 2026-06-22 09:11

> Audit local rapide HTML5 + a11y de base. Lancement : `python3 admin-pro/audits/audit_html5.py`
> ⚠️ Ce n'est pas un substitut au validateur W3C officiel, mais il pré-filtre les erreurs évidentes.

## Synthèse

- Pages auditées : **118**
- Pages avec erreurs : **3**
- Pages avec warnings : **10**
- Total erreurs : **11**
- Total warnings : **10**

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
- **1×** N id(s) dupliqué(s) : #hc-avis-live×N

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
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `index.html`

- ❌ 1 id(s) dupliqué(s) : #hc-avis-live×2
- ℹ️ 20 <img> avec alt vide (OK si décoratif)

### `blog-cout-renovation-salle-de-bain.html`

- ⚠️ <title> long (82 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-entretien-chaudiere-annuel-obligatoire.html`

- ⚠️ <title> long (86 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-isolation-combles-aides-2026.html`

- ⚠️ <title> long (85 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-pompe-a-chaleur-air-eau-tout-savoir.html`

- ⚠️ <title> long (92 chars, >70 recommandé)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `maprimeadapt.html`

- ⚠️ meta description longue (191 chars, >170 → tronquée)

### `notre-equipe.html`

- ⚠️ meta description longue (178 chars, >170 → tronquée)

### `plombier-coudekerque-branche.html`

- ⚠️ meta description longue (180 chars, >170 → tronquée)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-grande-synthe.html`

- ⚠️ meta description longue (174 chars, >170 → tronquée)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-saint-martin-boulogne.html`

- ⚠️ meta description longue (182 chars, >170 → tronquée)
- ℹ️ 9 <img> avec alt vide (OK si décoratif)

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

### `blog-comment-detecter-fuite-eau-cachee.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-debouchage-canalisation-furet-hydrocurage.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-fenetres-double-vitrage-pvc-alu-bois.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-panne-electrique-disjoncteur-saute.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-pmr-adapter-salle-de-bain-senior.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-porte-claquee-cle-perdue-que-faire.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-preparer-sa-maison-hiver-checklist.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog-remplacement-chaudiere-gaz-aides-2026.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `blog.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `carrieres.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-boulogne-sur-mer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-coudekerque-branche.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-marck.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-outreau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `chauffagiste-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `chauffagiste-wimereux.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `contact.html`

- ℹ️ 20 <img> avec alt vide (OK si décoratif)

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

### `electricien-boulogne-sur-mer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `electricien-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `entretien-chaudiere.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `espace-client.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `fournisseur.html`

- ℹ️ aucun <h1> statique — injecté par JS (page dynamique)

### `garanties.html`

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

### `mentions-legales.html`

- ℹ️ 11 <img> avec alt vide (OK si décoratif)

### `menuisier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `menuisier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `nos-metiers.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `nos-prestations.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `nos-villes.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `ouverture-porte-claquee.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `panne-chaudiere.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `partenaire.html`

- ℹ️ aucun <h1> statique — injecté par JS (page dynamique)

### `partenaires.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-boulogne-sur-mer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-coulogne.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-guines.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-le-portel.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-marck.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-outreau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `plombier-teteghem.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `plombier-wimereux.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `pmr-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `pmr-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `pro.html`

- ℹ️ 15 <img> avec alt vide (OK si décoratif)

### `realisation.html`

- ℹ️ aucun <h1> statique — injecté par JS (page dynamique)

### `realisations.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `remplacement-chauffe-eau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `reseau-help-confort.html`

- ℹ️ 18 <img> avec alt vide (OK si décoratif)

### `serrurier-boulogne-sur-mer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-calais.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-coudekerque-branche.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `serrurier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-marck.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `serrurier-outreau.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `serrurier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `serrurier-wimereux.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `sinistres.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `tarifs.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `travaux-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `travaux-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `urgence.html`

- ℹ️ 9 <img> avec alt vide (OK si décoratif)

### `vitrier-dunkerque.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `vitrier-saint-omer.html`

- ℹ️ 12 <img> avec alt vide (OK si décoratif)

### `volets-dunkerque.html`

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
- `blog-comment-detecter-fuite-eau-cachee.html`
- `blog-debouchage-canalisation-furet-hydrocurage.html`
- `blog-fenetres-double-vitrage-pvc-alu-bois.html`
- `blog-panne-electrique-disjoncteur-saute.html`
- `blog-pmr-adapter-salle-de-bain-senior.html`
- `blog-porte-claquee-cle-perdue-que-faire.html`
- `blog-preparer-sa-maison-hiver-checklist.html`
- `blog-remplacement-chaudiere-gaz-aides-2026.html`
- `blog.html`
- `carrieres.html`
- `chauffagiste-boulogne-sur-mer.html`
- `chauffagiste-calais.html`
- `chauffagiste-coudekerque-branche.html`
- `chauffagiste-dunkerque.html`
- `chauffagiste-marck.html`
- `chauffagiste-outreau.html`
- `chauffagiste-saint-omer.html`
- `chauffagiste-wimereux.html`
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
- `espace-client-dashboard.html`
- `espace-client.html`
- `faq.html`
- `fournisseur.html`
- `garanties.html`
- `guide-adaptation-pmr.html`
- `guide-entretien-chaudiere.html`
- `guide-fuite-eau.html`
- `guide-mise-aux-normes-electriques.html`
- `guides.html`
- `mentions-legales.html`
- `menuisier-dunkerque.html`
- `menuisier-saint-omer.html`
- `nos-metiers.html`
- `nos-prestations.html`
- `nos-villes.html`
- `ouverture-porte-claquee.html`
- `panne-chaudiere.html`
- `partenaire.html`
- `partenaires.html`
- `plan-du-site.html`
- `plombier-boulogne-sur-mer.html`
- `plombier-calais.html`
- `plombier-coulogne.html`
- `plombier-dunkerque.html`
- `plombier-guines.html`
- `plombier-le-portel.html`
- `plombier-marck.html`
- `plombier-outreau.html`
- `plombier-saint-omer.html`
- `plombier-teteghem.html`
- `plombier-wimereux.html`
- `pmr-dunkerque.html`
- `pmr-saint-omer.html`
- `pro.html`
- `processus.html`
- `realisation.html`
- `realisations.html`
- `remplacement-chauffe-eau.html`
- `reseau-help-confort.html`
- `reset.html`
- `serrurier-boulogne-sur-mer.html`
- `serrurier-calais.html`
- `serrurier-coudekerque-branche.html`
- `serrurier-dunkerque.html`
- `serrurier-marck.html`
- `serrurier-outreau.html`
- `serrurier-saint-omer.html`
- `serrurier-wimereux.html`
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
