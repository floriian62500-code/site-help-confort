# Audit JSON-LD — 2026-05-15 10:50

> Audit local des blocs `<script type="application/ld+json">` de chaque page HTML.
> Lancement : `python3 admin-pro/audits/audit_jsonld.py`

## Synthèse

- Pages auditées : **38**
- Pages avec JSON-LD : **35**
- Pages sans JSON-LD : **3**
- Erreurs de syntaxe JSON : **0**
- Avertissements (champs manquants/dupliqués) : **173**

## ⚠️ Pages sans aucun JSON-LD

- `avant-apres.html`
- `devis-express.html`
- `realisation.html`

## Détail par page

### `404.html` — 1 bloc(s) — types : WebPage, Organization, ImageObject

- ✅ Bloc #0 (`WebPage, Organization, ImageObject`) — OK

### `a-propos.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `actualites.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `aides.html` — 1 bloc(s) — types : WebPage, FAQPage, Question, Answer

- ✅ Bloc #0 (`WebPage, FAQPage, Question, Answer`) — OK

### `carrieres.html` — 2 bloc(s) — types : Organization, PostalAddress, BreadcrumbList, ListItem

- ✅ Bloc #0 (`Organization, PostalAddress`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `chauffagiste-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, HVACBusiness, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem, FAQPage, Question, Answer

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
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

### `contact.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `contrats-entretien.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-arques.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
- ✅ Bloc #1 (`FAQPage, Question, Answer`) — OK
- ✅ Bloc #2 (`BreadcrumbList, ListItem`) — OK

### `depannage-bergues.html` — 3 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating, FAQPage, Question, Answer, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, City, OpeningHoursSpecification, AggregateRating`) — OK
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

### `electricien-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Electrician, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem, FAQPage, Question, Answer

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
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

### `espace-client.html` — 2 bloc(s) — types : WebPage, BreadcrumbList, ListItem

- ✅ Bloc #0 (`WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `faq.html` — 1 bloc(s) — types : FAQPage, Question, Answer

- ✅ Bloc #0 (`FAQPage, Question, Answer`) — OK

### `guide-adaptation-pmr.html` — 3 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK

### `guide-entretien-chaudiere.html` — 3 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK

### `guide-fuite-eau.html` — 4 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience, HowTo, HowToSupply, HowToTool, HowToStep

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK
- ✅ Bloc #3 (`HowTo, HowToSupply, HowToTool, HowToStep`) — OK

### `guide-mise-aux-normes-electriques.html` — 3 bloc(s) — types : Article, Organization, ImageObject, WebPage, BreadcrumbList, ListItem, TechArticle, Audience

- ✅ Bloc #0 (`Article, Organization, ImageObject, WebPage`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK
- ✅ Bloc #2 (`TechArticle, Organization, ImageObject, WebPage, Audience`) — OK

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

### `mentions-legales.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `nos-prestations.html` — 1 bloc(s) — types : BreadcrumbList, ListItem, OfferCatalog, LocalBusiness, PostalAddress

- ⚠️ Bloc #0 (`BreadcrumbList, ListItem, OfferCatalog, LocalBusiness, PostalAddress`) :
    - @type manquant à la racine
    - LocalBusiness sans url (recommandé) @ @graph[1].provider

### `plombier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Plumber, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem, FAQPage, Question, Answer

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
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

### `pro.html` — 2 bloc(s) — types : Service, LocalBusiness, PostalAddress, City, BusinessAudience, BreadcrumbList, ListItem

- ⚠️ Bloc #0 (`Service, LocalBusiness, PostalAddress, City, BusinessAudience`) :
    - Service sans name (requis) @ racine
    - Service sans offers (recommandé) @ racine
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `processus.html` — 1 bloc(s) — types : HowTo, HowToStep

- ✅ Bloc #0 (`HowTo, HowToStep`) — OK

### `realisations.html` — 2 bloc(s) — types : LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating, BreadcrumbList, ListItem

- ✅ Bloc #0 (`LocalBusiness, PostalAddress, GeoCoordinates, OpeningHoursSpecification, City, AggregateRating`) — OK
- ✅ Bloc #1 (`BreadcrumbList, ListItem`) — OK

### `serrurier-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, Locksmith, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem, FAQPage, Question, Answer

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
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

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

### `temoignages.html` — 1 bloc(s) — types : LocalBusiness, AggregateRating, PostalAddress

- ✅ Bloc #0 (`LocalBusiness, AggregateRating, PostalAddress`) — OK

### `travaux-saint-omer.html` — 4 bloc(s) — types : Service, LocalBusiness, PostalAddress, GeneralContractor, GeoCoordinates, City, OpeningHoursSpecification, OfferCatalog, Offer, UnitPriceSpecification, QuantitativeValue, AggregateRating, BreadcrumbList, ListItem, FAQPage, Question, Answer

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
- ✅ Bloc #3 (`FAQPage, Question, Answer`) — OK

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
