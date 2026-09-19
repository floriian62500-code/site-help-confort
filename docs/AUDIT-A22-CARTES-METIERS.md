# A22 — Audit navigation cartes métiers / sous-métiers

> Constat : les cartes « savoir-faire » (`.m-svc`) des pages métiers pointent presque toutes
> vers le **catalogue générique** `nos-prestations.html#sec-<metier>` au lieu d'une **page dédiée**.
> C'est le symptôme « Menuiserie → Porte d'entrée » signalé par Florian, généralisé à tout le site.

## Chiffres (pages `*-saint-omer`, idem `*-dunkerque`)
- **28 cartes savoir-faire** · **24 (86 %) → `nos-prestations.html#sec-*`** (catalogue générique).
- **0 page sous-métier dédiée** existante (sauf `prestations/salle-de-bain-pmr.html`).
- 26 pages métiers portent une `.m-services-grid`.

## Inventaire (Page source | Carte | Destination actuelle | Destination attendue | Page dédiée existe ?)
| Métier | Carte | Destination actuelle | Attendue | Dédiée ? |
|--------|-------|----------------------|----------|----------|
| menuisier | Porte d'entrée | nos-prestations#sec-menuiserie | /porte-entree(-ville) | ❌ |
| menuisier | Porte de garage | nos-prestations#sec-menuiserie | /porte-garage | ❌ |
| menuisier | Portail & clôture | nos-prestations#sec-menuiserie | /portail-cloture | ❌ |
| menuisier | Fenêtres bois/alu/PVC | nos-prestations#sec-menuiserie | /fenetres | ❌ |
| menuisier | Coulissant & baie vitrée | nos-prestations#sec-menuiserie | /baie-vitree | ❌ |
| menuisier | Garde-corps & rampes | nos-prestations#sec-menuiserie | /garde-corps | ❌ |
| menuisier | Remplacement panneau de porte | nos-prestations#sec-menuiserie | /panneau-porte | ❌ |
| menuisier | Parquet | nos-prestations#sec-menuiserie | /parquet-sols | ❌ |
| chauffagiste | Chaudière | nos-prestations#sec-chauffage | /chaudiere | ❌ |
| chauffagiste | Entretien annuel | nos-prestations#sec-chauffage | /entretien-chaudiere.html (existe) | ✅ |
| electricien | Tableau électrique | nos-prestations#sec-electricite | /tableau-electrique | ❌ |
| electricien | Installation & rénovation | nos-prestations#sec-electricite | /renovation-electrique | ❌ |
| vitrier | (3 cartes) | nos-prestations#sec-vitrerie | /remplacement-vitre, /double-vitrage… | ❌ |
| volets | (3 cartes) | nos-prestations#sec-volets | /volet-roulant… | ❌ |
| plombier | (2 cartes) | nos-prestations#sec-plomberie | /fuite, /debouchage (certaines existent) | partiel |
| serrurier | Sécurité | contact.html?metier=Serrurerie | /ouverture-porte (existe) | partiel |
| pmr | Barres d'appui / WC PMR | contact.html?metier=PMR | /salle-de-bain-pmr (existe) | ✅ |

*Certaines pages dédiées existent déjà : `entretien-chaudiere.html`, `debouchage-canalisation.html`,
`ouverture-porte-claquee.html`, `remplacement-chauffe-eau.html`, `diagnostic-electrique.html`,
`prestations/salle-de-bain-pmr.html`… → il faut d'abord **rebrancher les cartes vers celles-ci**,
puis **créer les manquantes**.*

## Plan (page par page, chaque page → centre de validation)
1. **Rebrancher** les cartes vers les pages dédiées **déjà existantes** (correction sûre, immédiate).
2. **Créer** les pages sous-métier manquantes prioritaires (fort volume de recherche) avec :
   H1 clair · service · types d'interventions · photos/réalisations · fournisseurs du métier ·
   zone · FAQ · CTA tél · **questionnaire spécifique** · lead qualifié (`form_type`, sous-métier) ·
   SEO propre · maillage métier parent ↔ sous-métier.
3. **Prestation tarifée = niveau commercial séparé** : Métier → sous-métier/besoin → (éventuel) prestation.

## Statut
- Inventaire : ✅ fait. Rebranchement + création : **chantier en cours** (grande ampleur, page par page).
