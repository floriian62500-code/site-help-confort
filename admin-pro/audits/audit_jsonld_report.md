# Audit JSON-LD — 2026-06-20 07:02

> Audit local des blocs `<script type="application/ld+json">` de chaque page HTML.
> Lancement : `python3 admin-pro/audits/audit_jsonld.py`

## Synthèse

- Pages auditées : **118**
- Pages avec JSON-LD : **112**
- Pages sans JSON-LD : **6**
- Erreurs de syntaxe JSON : **0**
- Avertissements (champs manquants/dupliqués) : **792**

## ⚠️ Pages sans aucun JSON-LD

- `espace-client-dashboard.html`
- `fournisseur.html`
- `googlef09a1887914c5a23.html`
- `partenaire.html`
- `realisation.html`
- `reset.html`

## Détail par page

### `404.html` — 1 bloc(s) — types : WebPage, Organization, ImageObject

- ✅ Bloc #0 (`WebPage, Organization, ImageObject`) — OK

### `a-propos.html` — 4 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem, Person, Organization, AboutPage, Place

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`Person, Organization`) — OK
- ✅ Bloc #3 (`AboutPage, Organization, Person, Place`) — OK

### `actualites.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem, Blog, Organization, ImageObject

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`Blog, Organization, ImageObject`) — OK

### `agence-dunkerque.html` — 2 bloc(s) — types : Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `agence-saint-omer.html` — 2 bloc(s) — types : Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `aides.html` — 2 bloc(s) — types : WebPage, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`WebPage, FAQPage, Question, Answer`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `avant-apres.html` — 1 bloc(s) — types : BreadcrumbList, ListItem

- ✅ Bloc #0 (`BreadcrumbList, ListItem`) — OK

### `blog-comment-detecter-fuite-eau-cachee.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-cout-renovation-salle-de-bain.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-debouchage-canalisation-furet-hydrocurage.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-entretien-chaudiere-annuel-obligatoire.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-fenetres-double-vitrage-pvc-alu-bois.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-isolation-combles-aides-2026.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-panne-electrique-disjoncteur-saute.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-pmr-adapter-salle-de-bain-senior.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-pompe-a-chaleur-air-eau-tout-savoir.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-porte-claquee-cle-perdue-que-faire.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-preparer-sa-maison-hiver-checklist.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog-remplacement-chaudiere-gaz-aides-2026.html` — 2 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Article, Organization, ImageObject, WebPage`) :
    - Article sans image (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `blog.html` — 2 bloc(s) — types : Blog, Organization, ImageObject, BlogPosting, BreadcrumbList, ListItem

- ✅ Bloc #0 (`Blog, Organization, ImageObject, BlogPosting`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `carrieres.html` — 2 bloc(s) — types : Organization, PostalAddress, BreadcrumbList, ListItem

- ✅ Bloc #0 (`Organization, PostalAddress`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `chauffagiste-boulogne-sur-mer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HVACBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HVACBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `chauffagiste-calais.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HVACBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HVACBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `chauffagiste-coudekerque-branche.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `chauffagiste-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HVACBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HVACBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `chauffagiste-marck.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `chauffagiste-outreau.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `chauffagiste-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HVACBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HVACBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `chauffagiste-wimereux.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `contact.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `contrats-entretien.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `debouchage-canalisation.html` — 6 bloc(s) — types : Service, Plumber, PostalAddress, Offer, BreadcrumbList, ListItem, FAQPage, Question, Answer, HowTo, HowToStep, LocalBusiness, AggregateRating, Article, Organization, ImageObject, WebPage

- ⚠️ Bloc #0 (`Service, Plumber, PostalAddress, Offer`) :
    - Plumber sans url (recommandé) @ provider
    - Plumber sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep`) — OK
- ⚠️ Bloc #4 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #5 (`Article, Organization, ImageObject, WebPage`) — OK

### `depannage-arques.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-bergues.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-boulogne-sur-mer.html` — 4 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem, AggregateRating

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `depannage-calais.html` — 4 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem, AggregateRating

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `depannage-coquelles.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-dunkerque.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-gravelines.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-longuenesse.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-saint-martin-lez-tatinghem.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-saint-omer.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-saint-pol-sur-mer.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-sangatte.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `devis-express.html` — 1 bloc(s) — types : BreadcrumbList, ListItem

- ✅ Bloc #0 (`BreadcrumbList, ListItem`) — OK

### `diagnostic-electrique.html` — 4 bloc(s) — types : Service, Electrician, PostalAddress, Offer, BreadcrumbList, ListItem, FAQPage, Question, Answer, LocalBusiness, AggregateRating

- ⚠️ Bloc #0 (`Service, Electrician, PostalAddress, Offer`) :
    - Electrician sans url (recommandé) @ provider
    - Electrician sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `electricien-boulogne-sur-mer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Electrician, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Electrician, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `electricien-calais.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Electrician, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Electrician, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `electricien-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Electrician, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Electrician, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `electricien-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Electrician, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Electrician, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `entretien-chaudiere.html` — 5 bloc(s) — types : Service, HVACBusiness, PostalAddress, Offer, BreadcrumbList, ListItem, HowTo, HowToStep, FAQPage, Question, Answer, LocalBusiness, AggregateRating

- ⚠️ Bloc #0 (`Service, HVACBusiness, PostalAddress, Offer`) :
    - HVACBusiness sans url (recommandé) @ provider
    - HVACBusiness sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`HowTo, HowToStep`) — OK
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK
- ⚠️ Bloc #4 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `espace-client.html` — 2 bloc(s) — types : WebPage, BreadcrumbList, ListItem

- ✅ Bloc #0 (`WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `faq.html` — 2 bloc(s) — types : FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `garanties.html` — 2 bloc(s) — types : BreadcrumbList, ListItem, FAQPage, Question, Answer

- ✅ Bloc #0 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK

### `guide-adaptation-pmr.html` — 4 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience, HowTo, HowToStep

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep, Organization, ImageObject`) — OK

### `guide-entretien-chaudiere.html` — 4 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience, HowTo, HowToStep

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep, Organization, ImageObject`) — OK

### `guide-fuite-eau.html` — 4 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience, HowTo, HowToSupply, HowToTool, HowToStep

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK
- ✅ Bloc #3 (`HowTo, HowToSupply, HowToTool, HowToStep`) — OK

### `guide-mise-aux-normes-electriques.html` — 4 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience, HowTo, HowToStep

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep, Organization, ImageObject`) — OK

### `guides.html` — 2 bloc(s) — types : CollectionPage, Organization, ImageObject, Article, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`CollectionPage, Organization, ImageObject, Article`) :
    - Article sans headline (requis) @ hasPart[0]
    - Article sans datePublished (recommandé) @ hasPart[0]
    - Article sans author (recommandé) @ hasPart[0]
    - Article sans image (recommandé) @ hasPart[0]
    - Article sans headline (requis) @ hasPart[1]
    - Article sans datePublished (recommandé) @ hasPart[1]
    - Article sans author (recommandé) @ hasPart[1]
    - Article sans image (recommandé) @ hasPart[1]
    - Article sans headline (requis) @ hasPart[2]
    - Article sans datePublished (recommandé) @ hasPart[2]
    - Article sans author (recommandé) @ hasPart[2]
    - Article sans image (recommandé) @ hasPart[2]
    - Article sans headline (requis) @ hasPart[3]
    - Article sans datePublished (recommandé) @ hasPart[3]
    - Article sans author (recommandé) @ hasPart[3]
    - Article sans image (recommandé) @ hasPart[3]
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `index.html` — 2 bloc(s) — types : Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, OfferCatalog, Offer, Service, AggregateRating, WebSite, Organization, ImageObject

- ⚠️ Bloc #0 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
- ✅ Bloc #1 (`WebSite, Organization, ImageObject`) — OK

### `maprimeadapt.html` — 1 bloc(s) — types : Service, LocalBusiness, PostalAddress

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider

### `mentions-legales.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `menuisier-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `menuisier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `nos-metiers.html` — 3 bloc(s) — types : ItemList, ListItem, BreadcrumbList, LocalBusiness, PostalAddress, AggregateRating

- ✅ Bloc #0 (`ItemList, ListItem`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`LocalBusiness, PostalAddress, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine

### `nos-prestations.html` — 1 bloc(s) — types : BreadcrumbList, ListItem, OfferCatalog, LocalBusiness, PostalAddress

- ⚠️ Bloc #0 (`BreadcrumbList, ListItem, OfferCatalog, LocalBusiness, PostalAddress`) :
    - @type manquant à la racine
    - LocalBusiness sans url (recommandé) @ @graph[1].provider

### `nos-villes.html` — 2 bloc(s) — types : ItemList, ListItem, BreadcrumbList

- ✅ Bloc #0 (`ItemList, ListItem`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `notre-equipe.html` — 1 bloc(s) — types : BreadcrumbList, ListItem

- ✅ Bloc #0 (`BreadcrumbList, ListItem`) — OK

### `ouverture-porte-claquee.html` — 6 bloc(s) — types : Service, Locksmith, PostalAddress, Offer, BreadcrumbList, ListItem, FAQPage, Question, Answer, HowTo, HowToStep, LocalBusiness, AggregateRating, Article, Organization, ImageObject, WebPage

- ⚠️ Bloc #0 (`Service, Locksmith, PostalAddress, Offer`) :
    - Locksmith sans url (recommandé) @ provider
    - Locksmith sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep`) — OK
- ⚠️ Bloc #4 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #5 (`Article, Organization, ImageObject, WebPage`) — OK

### `panne-chaudiere.html` — 4 bloc(s) — types : Service, HVACBusiness, PostalAddress, Offer, BreadcrumbList, ListItem, FAQPage, Question, Answer, LocalBusiness, AggregateRating

- ⚠️ Bloc #0 (`Service, HVACBusiness, PostalAddress, Offer`) :
    - HVACBusiness sans url (recommandé) @ provider
    - HVACBusiness sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `partenaires.html` — 2 bloc(s) — types : LocalBusiness, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `plan-du-site.html` — 2 bloc(s) — types : BreadcrumbList, ListItem, SiteNavigationElement

- ✅ Bloc #0 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #1 (`SiteNavigationElement`) — OK

### `plombier-boulogne-sur-mer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `plombier-calais.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `plombier-coudekerque-branche.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-coulogne.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Plumber, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `plombier-grande-synthe.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-guines.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-le-portel.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-marck.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-outreau.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-saint-martin-boulogne.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Plumber, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `plombier-teteghem.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `plombier-wimereux.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `pmr-dunkerque.html` — 3 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `pmr-saint-omer.html` — 3 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `pro.html` — 2 bloc(s) — types : Service, LocalBusiness, PostalAddress, City, BusinessAudience, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress, City, BusinessAudience`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `processus.html` — 2 bloc(s) — types : HowTo, HowToStep, BreadcrumbList, ListItem

- ✅ Bloc #0 (`HowTo, HowToStep`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `realisations.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem, CollectionPage

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`CollectionPage`) — OK

### `remplacement-chauffe-eau.html` — 6 bloc(s) — types : Service, Plumber, PostalAddress, Offer, BreadcrumbList, ListItem, FAQPage, Question, Answer, HowTo, HowToStep, LocalBusiness, AggregateRating, Article, Organization, ImageObject, WebPage

- ⚠️ Bloc #0 (`Service, Plumber, PostalAddress, Offer`) :
    - Plumber sans url (recommandé) @ provider
    - Plumber sans areaServed (recommandé) @ provider
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #3 (`HowTo, HowToStep`) — OK
- ⚠️ Bloc #4 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #5 (`Article, Organization, ImageObject, WebPage`) — OK

### `reseau-help-confort.html` — 2 bloc(s) — types : WebPage, Organization, BreadcrumbList, ListItem

- ✅ Bloc #0 (`WebPage, Organization`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `serrurier-boulogne-sur-mer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Locksmith, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Locksmith, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `serrurier-calais.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Locksmith, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Locksmith, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `serrurier-coudekerque-branche.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `serrurier-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Locksmith, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Locksmith, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `serrurier-marck.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `serrurier-outreau.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `serrurier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Locksmith, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Locksmith, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `serrurier-wimereux.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, City, AggregateRating, BreadcrumbList, ListItem, Service, OfferCatalog, Offer

- ⚠️ Bloc #0 (`LocalBusiness, PostalAddress, City, AggregateRating`) :
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`Service, LocalBusiness, City, OfferCatalog, Offer`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ provider
    - LocalBusiness sans url (recommandé) @ provider

### `sinistres.html` — 2 bloc(s) — types : EmergencyService, PostalAddress, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`EmergencyService, PostalAddress, City, OpeningHoursSpecification, OfferCatalog, Offer, Service`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `tarifs.html` — 4 bloc(s) — types : PriceSpecification, BreadcrumbList, ListItem, LocalBusiness, AggregateRating, FAQPage, Question, Answer

- ✅ Bloc #0 (`PriceSpecification`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #2 (`LocalBusiness, AggregateRating`) :
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

### `temoignages.html` — 2 bloc(s) — types : LocalBusiness, AggregateRating, PostalAddress, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, AggregateRating, PostalAddress`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `travaux-dunkerque.html` — 3 bloc(s) — types : Service, LocalBusiness, PostalAddress, GeneralContractor, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`GeneralContractor, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `travaux-saint-omer.html` — 3 bloc(s) — types : Service, LocalBusiness, PostalAddress, GeneralContractor, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`GeneralContractor, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, UnitPriceSpecification, QuantitativeValue, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[6].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `urgence.html` — 3 bloc(s) — types : EmergencyService, PostalAddress, OpeningHoursSpecification, BreadcrumbList, ListItem, FAQPage, Question, Answer

- ✅ Bloc #0 (`EmergencyService, PostalAddress, OpeningHoursSpecification`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK

### `vitrier-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `vitrier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `volets-dunkerque.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `volets-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HomeAndConstructionBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`HomeAndConstructionBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[5].itemOffered
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #3 (`LocalBusiness, City`) :
    - LocalBusiness sans telephone (recommandé) @ racine
    - LocalBusiness sans address (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ racine

### `zones-intervention.html` — 5 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, City, OpeningHoursSpecification, OfferCatalog, Offer, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem, AdministrativeArea

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress`) :
    - Service sans offers (recommandé) @ racine
    - LocalBusiness sans url (recommandé) @ provider
- ⚠️ Bloc #1 (`Plumber, PostalAddress, City, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating`) :
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
- ✅ Bloc #2 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #3 (`BreadcrumbList, ListItem`) — OK
- ⚠️ Bloc #4 (`Service, LocalBusiness, PostalAddress, OpeningHoursSpecification, AggregateRating, City, AdministrativeArea, OfferCatalog, Offer`) :
    - Service sans offers (recommandé) @ racine
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[0].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[1].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[2].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[3].itemOffered
    - Service sans provider (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans areaServed (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
    - Service sans offers (recommandé) @ hasOfferCatalog.itemListElement[4].itemOffered
