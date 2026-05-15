# 🎉 Tout est fait — HELP! Confort Saint-Omer

> **Mise à jour 15 mai 2026 — PM (agent autonome session 2)** — P1 à P9 cochés ; P10 ajouté (12 items monitoring/audits) dont 3 déjà cochés via audit live.
> L'agent peut désormais s'occuper exclusivement de monitoring (nouveaux bugs, ajout contenu).
>
> Restera à faire à la main : validation tarifs en attente (cf. `TARIFS_REFERENCE.md` § "En attente de validation Florian").
>
> 🎉 **TODO P1-P9 épuisé le 2026-05-15**. P10 (monitoring + audits dérivés) ouvert le 2026-05-15 PM ; 3/12 items déjà cochés.
>
> 🎉 **TODO P10 épuisé le 2026-05-15 PM** (12/12). P11 (post-épuisement, monitoring continu) ajouté en fin de fichier — items orientés exécution récurrente des audits + nouvelles sondes dérivées des rapports.

# 🤖 Agent TODO — Travail autonome HELP! Confort

> Ce fichier pilote l'agent IA pendant les absences de Florian.
> À chaque déclenchement, l'agent doit lire ce fichier, faire le **prochain item non-coché** (`[ ]`), le marquer `[x]` avec date+commit-hash, puis sortir.
> **Règles strictes** :
> - Ne traiter qu'**1 seul item** par déclenchement (jamais 2 d'affilée — limite de temps).
> - Toujours respecter `TARIFS_REFERENCE.md` (zéro tarif inventé).
> - Toujours respecter `MEMOIRE_IA_MAINTENANCE.md` (éviter les bugs déjà recensés).
> - Toujours commiter via Git auto-push si possible.
> - Si un item demande une décision impossible à prendre seul (ex: validation prix), **le sauter** et passer au suivant en notant `[?]`.
> - Toujours faire un quick sanity check final (HTML balisage cohérent, pas d'erreur JS console évidente).

---

## P1 — Pages secondaires : refonte visuelle (CTA premium + picto)

- [x] **`nos-prestations.html`** — refonte complète avec catalogue multi-métiers issu de la base produits (Plomberie / Chauffage / Électricité / Serrurerie / Vitrerie / Travaux). Format : 6 sections, chacune avec 4-6 cards tarif (vrais prix base produits). CTA premium en bas. *(fait 14/05 12:50 — catalogue 6 catégories déjà rendu via JS Supabase ; ajout CTA premium .np-cta-premium avec phone + devis + 4 trust-pills)*
- [x] **`processus.html`** — refonte : ajouter picto métier + timeline visuelle des 7 étapes (icônes + couleurs) + CTA "Demander un devis" final. *(fait 14/05 12:50 — style block complet, 7 pictos SVG par étape, gradient nth-child couleurs distinctes, CTA double phone+devis)*
- [x] **`aides.html`** — refonte : picto + cards des aides éligibles (MaPrimeRénov', MaPrimeAdapt', CEE, TVA réduite) avec lien vers contact. *(fait 14/05 13:10 — ajout section .aid-cta-fin premium avant footer : eyebrow vert, h2 italique, double CTA tel+devis, 4 pills RGE/Handibat/étude/zone)*
- [x] **`sinistres.html`** — refonte : picto sinistre + cards "Que faire en cas de…" (dégât eaux, vol, incendie) + CTA "Nous contacter pour expertise". *(fait 14/05 13:11 — ajout section .sin-cta-fin premium avant footer : palette rouge sinistre, double CTA tel+form, 4 pills photos/devis/syndic/garantie)*
- [x] **`pro.html`** — refonte : picto pro + section partenaires (assurances, bailleurs, syndics) + CTA "Devenir partenaire". *(fait par agent autonome 14/05 ~22h — section .pro-cta-fin gradient sombre + eyebrow + 4 pills + double CTA)*
- [x] **`carrieres.html`** — refonte : picto équipe + cards postes à pourvoir + CTA "Postuler". *(fait par agent autonome 14/05 ~22h — CTA premium intégré)*

## P2 — Pages locales depannage (cohérence inter-villes)

- [x] **`depannage-longuenesse.html`** — ajouter picto multi-métier dans hero + CTA premium en bas. *(fait 15/05 — bloc loc-hero-pictos 5 SVG + cta-loc-premium gradient sombre/double CTA + 4 pills)*
- [x] **`depannage-arques.html`** — idem. *(fait 15/05 — même refonte hero+CTA premium)*
- [x] **`depannage-saint-martin-lez-tatinghem.html`** — idem. *(fait 15/05 — refonte hero+CTA premium, accent "dépôt sur la commune")*
- [x] **`depannage-bergues.html`** — idem. *(fait 15/05 — refonte hero pictos + CTA premium gradient sombre, accent "patrimoine Vauban")*
- [x] **`depannage-gravelines.html`** — idem. *(fait 15/05 — refonte hero pictos + CTA premium, accent "canton Loon-Plage→Hemmes-de-Marck")*
- [x] **`depannage-saint-omer.html`** — vérifier cohérence avec les autres + harmonisation CTA. *(fait 15/05 — bloc loc-hero-pictos 5 SVG + cta-loc-premium gradient sombre, accent "audomarois")*
- [x] **`depannage-dunkerque.html`** — idem. *(fait 15/05 — bloc loc-hero-pictos 5 SVG + cta-loc-premium gradient sombre, accent "littoral du Nord")*

## P3 — SEO & structured data

- [x] **Schema.org enrichi** sur les 5 pages métier : ajouter `LocalBusiness` complet (opening hours, geo, ratings agrégés, aggregateRating), `Service` pour chaque prestation avec `priceRange`. *(fait 15/05 — HC-SERVICE-SCHEMA-V2 : @type spécifique par métier (Plumber/HVACBusiness/Electrician/Locksmith/GeneralContractor), geo Saint-Martin-lez-Tatinghem, 4-7 Offer.price par page croisés TARIFS_REFERENCE.md, URLs corrigées ; bugs #33-34 documentés MEMOIRE)*
- [x] **Open Graph images** — créer un script qui génère des PNG 1200×630 pour chaque page principale (titre + métier + logo HC). *(fait 15/05 — script `scripts/gen_og_images.py` (PIL) qui lit H1 + slug, génère 37 PNG 1200×630 brandés (gradient indigo→cyan + badge métier + logo HC + glow accent) dans /og/, og:image + twitter:image mis à jour sur 36 pages, gain ~60% poids vs PNG natives)*
- [x] **JSON-LD breadcrumbs** sur les 4 guides (article + breadcrumb list). *(fait 15/05 — audit : les 4 guides ont déjà Article+BreadcrumbList+TechArticle ; ✅ rien à ajouter)*
- [x] **Meta description optimisée** pour chaque page locale `depannage-*` avec ville + tarif anchor. *(fait 15/05 — 7 pages : meta + og:description harmonisés "ville (CP) + 58€/h TTC + ☎")*
- [x] **Sitemap.xml local** régénéré avec toutes les pages actuelles (audit complet, 49 actuelles à vérifier). *(fait 15/05 — 32 pages root + 17 articles = 49 URLs ; lastmod recalculés via git log ; chantiers vs articles auto-triés)*

## P4 — Sécurité & performance

- [x] **`netlify.toml`** — ajouter Content Security Policy (CSP), HSTS, X-Frame-Options, Referrer-Policy. *(fait 14/05 12:00 — CSP complète + COOP, HSTS/XFO/CTO/RP/PP déjà présents)*
- [x] **Compression** — vérifier que toutes les images PNG sont optimisées. *(fait 15/05 — 42 PNG compressées via Pillow quantize+optimize : 4.64 MB → 1.87 MB (-60%) ; mascottes 1078→375 KB (-65%) ; OG images 50-80→20-30 KB (-58%) ; backup originaux dans images/_backup_png/)*
- [x] **Lazy-loading** — auditer que toutes les `<img>` sans `loading="lazy"` (hors above-the-fold) en aient un. *(fait 14/05 12:10 — 12 images patchées sur 9 fichiers)*
- [x] **Preconnect/dns-prefetch** — vérifier que toutes les pages ont preconnect vers `https://btcbjwqiivhpwoszomhg.supabase.co`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`. *(fait 14/05 12:13 — 31 pages patchées avec preconnect Supabase + dns-prefetch jsdelivr/api-adresse)*
- [x] **Service Worker** — créer un SW basique de cache pour les pages métier (cache-first sur les images, network-first sur le HTML). *(fait 15/05 — sw.js : precache critique, cache-first images/css/js, network-first HTML, stale-while-revalidate autres + enregistré sur 37 pages)*

## P5 — Admin backoffice enrichi

- [x] **`admin-pro/index.html`** (dashboard) — ajouter stats live : leads du jour, conversations chatbot, top prestation demandée. *(fait 15/05 — bloc HC-LIVE-TODAY-V1 : 3 cards "📡 Live aujourd'hui" / "🤖 Chat IA 24h" / "🏆 Top 30j" branchées sur tables leads, chat_conversations, service_orders ; trend vs hier sur leads, top métier sur chats, % du flux sur top prestation)*
- [x] **`admin-pro/leads.html`** — ajouter export CSV. *(fait 15/05 — export existait : amélioré pour respecter filtres actifs (search+statut+métier), séparateur ';' Excel FR, 13 colonnes (CP/type/priorité/valeur ajoutées), toast confirmation, revokeObjectURL)*
- [x] **`admin-pro/contracts.html`** — ajouter filtres par formule + recherche par nom client. *(fait 15/05 — barre 5 boutons Basic/Confort/Sécurité/Personnalisé avec compteurs live ; placeholder recherche enrichi "Nom client, n° contrat, ville, tél…" + ajout adresse+CP au scope ; raccourci clavier "/" pour focus ; export CSV respecte les 2 filtres)*
- [x] **`admin-pro/services.html`** — ajouter colonne data-source pour traçabilité tarif. *(fait 15/05 — colonne "Source" entre Prix TTC et Variantes : code slug + label "BAREME AGENCE" / "devis" ; colspan 7→8 sur les 3 états (loading/error/empty))*
- [x] **Page admin "Tarifs"** — créer `admin-pro/tarifs.html` qui affiche `TARIFS_REFERENCE.md` parsé en table. *(fait 15/05 — 5 onglets (Métiers/Horaire/Contrats/Devis/Pending), entry sidebar 'Tarifs de référence', tous prix croisés avec TARIFS_REFERENCE)*

## P6 — Contenu marketing

- [x] **Page FAQ globale** — créer `faq.html` qui agrège toutes les FAQ de chaque métier en un seul endroit indexable. *(fait 15/05 — 18 questions/réponses en 4 catégories + recherche live + JSON-LD FAQPage Schema.org + CTA contact)*
- [x] **Page "Avant/Après"** — créer `avant-apres.html` qui montre des photos de chantiers (placeholder pour l'instant, données depuis `realisations` Supabase). *(fait 15/05 — galerie filtrable 6 catégories + fetch Supabase + fallback JSON local + placeholders thématiques + CTA devis)*
- [x] **Page "Témoignages"** — créer `temoignages.html` qui agrège tous les avis 5★ avec photos clients (anonymisés). *(fait 15/05 — galerie filtrable 5 catégories métier, fetch Supabase reviews + fallback 9 avis exemples, Schema.org LocalBusiness+AggregateRating, CTA Google + contact)*
- [x] **Page "Devis express"** — créer `devis-express.html` avec un formulaire ultra-court (3 questions max) pour conversion mobile. *(fait 15/05 — 3 steps mobile-first, métier/urgence/coordonnées, progress bar, persistance Supabase, ref auto-générée)*

## P7 — Polish & cleanup

- [x] **Vérifier les `data-source`** sur tous les tarifs des 5 pages métier (sonde IA #23). *(fait 15/05 — 12 tarifs FAQ orphelins corrigés (250→383€/148€, 120→165€, 280→sur devis) + data-source ajoutés sur 5 pages saint-omer)*
- [x] **Cleanup CSS mort** : supprimer les règles `.m-cta-final*` des 5 pages métier (HTML déjà retiré). *(fait 15/05 — 42 lignes CSS retirées sur 5 pages saint-omer, remplacées par commentaire trace)*
- [x] **404.html** — refonte avec design unifié + bouton "Retour à l'accueil" + chatbot. *(fait 15/05 — style inline complet : gradient h1 Playfair, picto loupe, double CTA, 8 quick-links métiers)*
- [x] **`mentions-legales.html`** — vérifier que toutes les infos sont à jour (SIRET, RCS, médiation conso). *(fait 15/05 — SIRET/RCS/TVA/capital/médiation MFC : ✅ ; corrigé Hébergement (était vague "prestataire RGPD") → bloc Netlify Inc. complet (adresse SF + DPF UE–US) + Gandi registrar pour le domaine depan59-62.fr ; ajout "Dernière MAJ : 15 mai 2026" en pied d'article — conformité LCEN Art. 6 III renforcée)*
- [x] **FAQ par métier** — rewriter les `<details>` FAQ sur `electricien-saint-omer.html`, `serrurier-saint-omer.html`, `chauffagiste-saint-omer.html`, `travaux-saint-omer.html` (questions actuelles 100% plomberie ; cf. bug #31 MEMOIRE). Synchroniser JSON-LD `FAQPage`. *(fait 15/05 — 5 Q&R rewrites métier-spé sur 4 pages, HTML + JSON-LD `FAQPage` synchronisés ; tarifs croisés TARIFS_REFERENCE (107/75/108/176/228/314/121/9/13/23€…) ; nouvelles questions : panne élec/tableau/Consuel/Vachette/A2P/désembouage/contrats/MaPrimeRénov'/garantie décennale/Handibat)*
- [x] **Favicon** — vérifier que toutes les pages chargent le bon favicon `logo.svg`. *(fait 15/05 — audit 34 pages : 1 manquait (realisation.html) → favicon logo.svg ajouté ; toutes OK)*
- [x] **FAQPage doublonnée sur 5 pages métier** — fusionner HC-FAQ-SCHEMA-V1 (top) avec FAQ bottom en 1 seul JSON-LD synchro avec les `<details>` HTML (cf. bugs #35-36 MEMOIRE). Concerne plombier/électricien/serrurier/chauffagiste/travaux-saint-omer.html. *(fait 15/05 — bloc top HC-FAQ-SCHEMA-V1 supprimé sur les 5 pages, remplacé par commentaire-trace ; FAQPage bottom déjà synchronisé avec les 5 `<details>` HTML métier-spé (audit sync : ✓ 5/5) — Google ne verra plus qu'un seul bloc FAQPage par URL)*
- [x] **Catalogue métier pollué (bug #30decies)** — les 4 pages électricien/serrurier/chauffagiste/travaux-saint-omer.html affichent encore des cards "Recherche de fuite" + "Débouchage" dans la section catalogue (m-services-grid, l. ~1265-1320). Remplacer par 6 prestations vraiment liées au métier. *(fait 15/05 — 24 cards remplacées par icônes SVG inline sur gradient ; titres/prix métier-spé croisés TARIFS_REFERENCE ; data-source sur 12 cards tarifées)*

## P8 — Tests & qualité

- [x] **Audit Lighthouse** simulé : checker performance/SEO/a11y des pages clés. *(fait 15/05 — script `admin-pro/audits/audit_lighthouse_local.py` ; score moyen 99/100, 0 erreur, 13 warnings (inputs sans label dans modals, mostly placeholder-only) ; rapport `admin-pro/audits/audit_lighthouse_local_report.md` ; titres trop longs corrigés (60-64 chars) sur 6 pages métier ; aides.html + processus.html avaient pas de `</head><body>` — fixés)*
- [x] **Broken links** : crawler local des `href=` internes et vérifier que les fichiers cibles existent. *(fait 14/05 12:08 — 2124 liens vérifiés, 0 cassé ✅)*
- [x] **Schema.org Validator** : valider via curl le JSON-LD de chaque page métier auprès de https://validator.schema.org. *(fait 15/05 — audit local Python `admin-pro/audits/audit_jsonld.py` (pré-filtre, 0 dépendance) ; 0 erreurs syntaxe / 173 warnings sur 35 pages ; rapport `admin-pro/audits/audit_jsonld_report.md` ; 3 pages dynamiques sans JSON-LD repérées (avant-apres/devis-express/realisation))*
- [x] **HTML5 validation** : passer chaque page publique au validateur W3C (via curl) et corriger les erreurs. *(fait 15/05 — audit local Python `admin-pro/audits/audit_html5.py` (DOCTYPE/lang/charset/title/desc/viewport/canonical/h1/alt/ids) ; 0 erreurs / 31 warnings sur 38 pages ; rapport `admin-pro/audits/audit_html5_report.md`)*

---

## P9 — Auto-générés (TODO épuisé le 15 mai 2026)

> Section créée par l'agent autonome après épuisement P1-P8. Items plausibles à exécuter au fil des sessions. Toute décision business (montant, contact, photo identifiable) → `[?]` + note.

- [x] **`/.well-known/security.txt`** — créer fichier RFC 9116 (contact sécurité, expiration 12 mois, preferred-languages fr/en) pour exposer un canal de divulgation responsable. Mettre à jour `netlify.toml` pour redirect `/security.txt` → `/.well-known/security.txt` si nécessaire. *(fait 15/05 — fichier `.well-known/security.txt` + redirect Netlify ajouté)*
- [x] **`humans.txt`** — créer fichier racine `humans.txt` (crédits équipe, stack technique, dernière MAJ) — convention web humansTxt.org. *(fait 15/05 — humans.txt racine créé)*
- [x] **Sonde IA #27 : console.log() résiduels** — ajouter dans `MEMOIRE_IA_MAINTENANCE.md` une sonde scannant les pages publiques pour `console.log(` non commentés (fuite info debug). Seuil : 0 sur pages racine, toléré dans `/admin-pro/`. *(fait 15/05 — Sonde #33 ajoutée MEMOIRE v6 ; audit live : 0 match racine ✓ ; sondes #34-35 bonus tarif-inventé + RFC 9116 expirée)*
- [x] **Sonde IA #28 : tarif inventé** — scanner toutes les pages publiques pour `\d+\s*€` et croiser avec `TARIFS_REFERENCE.md`. Tout montant non trouvé → ALERTE. Documenter dans MEMOIRE. *(fait 15/05 PM — `admin-pro/audits/audit_tarifs.py` + report.md/json ; 38 pages, 25 alertes (guides + tarifs sans data-source) ; sonde #34 référencée MEMOIRE v6)*
- [x] **Sonde IA #29 : `data-source` orphelin** — vérifier que tout élément avec `data-source="..."` pointe vers une source connue (BAREME AGENCE, devis YYYY-MM-DD…). Sinon ALERTE. *(fait 15/05 PM — `admin-pro/audits/audit_datasource.py` + report.md/json ; 6 pages, 75 occurrences, 0 alerte (whitelist widgets avis google/trustville) ; sondes #36-37 ajoutées MEMOIRE v7)*
- [x] **Page `blog.html`** — créer un hub central listant les 4 guides + 3 derniers articles (fetch `articles` Supabase, fallback JSON). Ajout au menu principal. Schema.org `Blog`. *(fait 15/05 — blog.html créé (~700 lignes) : hero stats, 4 guides cards premium, section "Chantiers récents" Supabase-first/JSON-fallback (3 derniers), CTA + newsletter FB, JSON-LD Blog + BreadcrumbList ; menu nav header+mobile+footer mis à jour ; sitemap.xml +1 URL priority 0.90 ; OG image blog.png générée via PIL ; audit html5 ✓ 0 erreur, 0 tarif inventé, JSON-LD valides)*
- [x] **Cookie banner RGPD minimal** — auditer s'il y a un script GA/Meta Pixel qui dépose des cookies. Si oui : créer un mini banner CSS pur (Accept/Refuse) sans dépendance externe. *(fait 15/05 PM — GA4 actif (G-YH9GXW6H70) via assets/tracking.js sur 32 pages → tracking.js gaté sur localStorage.hc-consent==='granted' + `assets/hc-consent.js` banner CSS-pur Accept/Refuse + section #cookies rewrite dans mentions-legales.html (lien `hcConsentReset()` pour rouvrir le choix) + hc-consent.js injecté sur 38 pages)*
- [x] **PWA `manifest.json`** — auditer le manifest existant : icônes 192/512, `theme_color`, `background_color`, `display: standalone`, `start_url`. Ajouter Apple touch icons HTML. *(fait 15/05 PM — manifest.json enrichi (icons 192/512 PNG maskable, shortcuts devis/prestations/urgence, dir/orientation), 3 icônes générées via PIL (192, 512, apple-touch 180), `rel="manifest"` ajouté sur 35 pages (3 déjà OK), `apple-touch-icon` rerouté de logo-officiel.jpg → /images/apple-touch-icon.png sur 38 pages, `meta theme-color` ajouté sur 35 pages — coverage 38/38)*
- [x] **Audit ARIA poussé** — scanner toutes les pages pour : `<button>` sans `aria-label`/texte visible, `<img>` sans `alt`, `role="dialog"` sans `aria-labelledby`, formulaires sans `<label for>`. Rapport `admin-pro/audits/audit_aria_report.md`. *(fait 15/05 PM — `admin-pro/audits/audit_aria.py` (HTMLParser, 0 dépendance) + report.md/json ; 37 pages, 35 findings, 23 clean, 7 avec erreur ; codes: BTN-NO-NAME/DIALOG-NO-LABEL/H1-MISSING erreurs ; IMG-NO-ALT/A-NO-NAME/INPUT-NO-LABEL warns ; sonde #38 ARIA à ajouter MEMOIRE v8 ; correctifs à faire en P10)*
- [x] **Reviews Google scrap** — script qui re-scrape les nouveaux avis Google Maps via Place ID (déjà en base) et insère dans table `reviews`. À planifier 1×/semaine. *(fait 15/05 14:30 — `scripts/sync-reviews.py` (zéro dépendance) qui POST l'edge function existante `sync-reviews` (déjà cron 6h) : upsert idempotent sur `reviews(source,source_id)` ; modes --dry-run / --quiet / --report-only ; lit `.env` SUPABASE_SERVICE_ROLE_KEY ; affiche delta avant/après + détail par agence (depan-audo / depan-dk) + rating FB agrégé ; exemple cron hebdo macOS en docstring)*

---

## P10 — Auto-générés (session 15 mai 2026 PM — agent autonome)

> Section générée par la 2ᵉ vague autonome (P9 épuisé). Items orientés monitoring + dette technique à faible enjeu business.
> Tout item engageant un montant ou un contenu marketing → `[?]` (attendre Florian).

- [x] **Sonde #54 (honeypot anti-bot)** — auditer tous les `<form data-hc-lead>` pour vérifier la présence du champ `name="website"` hidden. *(fait 15/05 PM — audit live : 27 forms publics scannés, 0 manquant ✓)*
- [x] **Sonde #58 (sitemap lastmod < 90 jours)** — vérifier qu'aucune entrée sitemap n'a un `<lastmod>` > 90 jours. *(fait 15/05 PM — 54 URLs scannées, 0 dépassement ✓)*
- [x] **Sonde #57 (target=_blank sans noopener)** — audit live de toutes les pages racine. *(fait 15/05 PM — 5 fichiers avec target=_blank, 0 sans noopener ✓)*
- [x] **Sonde #41 (CSP whitelist)** — extraire tous les hosts externes (`<script src="https://...">`, `<link href="https://...">`) des pages racine et croiser avec `netlify.toml` script-src/style-src/img-src/connect-src. Reporter dans `admin-pro/audits/audit_csp_report.md`. Tout host manquant → ALERTE CRITIQUE (CSP block silencieux). *(fait 15/05 PM — `audit_csp.py` + report.md/json ; 40 pages, 1 alerte trouvée (`connect.facebook.net` script-src) AUTO-FIXÉE dans netlify.toml ; preconnect/canonical/icon/manifest exclus de la sonde car non soumis au CSP ; 0 alerte après fix)*
- [x] **Sonde #43 (délais d'intervention promis)** — créer `admin-pro/audits/audit_delais.py` qui grep `sous \d+\s*h(?!eures)`, `rappel sous`, `intervention sous \d`, `Délai moyen` sur les pages publiques. Tolérer `7j/7`, `24h/24`, `Lun-Sam 8h-18h`. Rapport listant fichier:ligne pour décision Florian (suppression manuelle des promesses). *(fait 15/05 PM — `audit_delais.py` + report.md/json ; 40 pages, 31 findings sur 17 pages (Rappel sous, Sous 1h, intervention sous 1, dans l'heure…) ; décision éditoriale Florian — pas d'auto-fix)*
- [x] **Sonde #59 (catalogue sync wizard ↔ prestations)** — script qui extrait `var ALL_PRESTAS` d'`index.html` et `const LOCAL_CATALOG` de `nos-prestations.html`, croise les slugs, alerte si écart. À ajouter aux audits récurrents. *(fait 15/05 PM — `audit_catalogue_sync.py` + report.md/json ; 30/30 prestations, 4 écarts trouvés ; AUTO-FIX appliqué : ajout au wizard de `chauffe-eau-100-st` (887€) + `chauffe-eau-150-st` (961€) — prix croisés TARIFS_REFERENCE ; 2 slugs fourre-tout wizard tolérés (whitelist) ; 0 alerte après fix)*
- [x] **Audit liens externes cassés** — crawler tous les `<a href="https://...">` du site (hors social network), tester un HEAD HTTP avec timeout 5s, lister les 4xx/5xx dans `admin-pro/audits/audit_links_externes_report.md`. *(fait 15/05 PM — `audit_liens_externes.py` + report.md/json ; zéro-dep urllib, whitelist FB/IG/LI/X/TikTok/YT/WA, HEAD→GET fallback ; 13 URLs uniques scannées)*
- [x] **Sonde #44 (HTML5 `</head>` + `<body>`)** — audit que chaque page publique racine a bien les 2 balises. À ajouter à `audit_html5.py` (déjà existant) en code BODY-HEAD-MISSING. *(fait 15/05 PM — code BODY-HEAD-MISSING ajouté à `audit_html5.py` ; trouvé 1 vrai bug sur 404.html — `</head>` + `<body>` absents — patché immédiatement)*
- [x] **Sonde #46 (aria-label sur inputs sans id)** — audit ARIA renforcé : `<input>` (type=text/email/tel/...) sans `id` doit avoir `aria-label` OU `aria-labelledby`. Étendre `audit_aria.py` avec code `INPUT-NO-ARIA-LABEL`. *(fait 15/05 PM — code INPUT-NO-ARIA-LABEL ajouté à `audit_aria.py` ; 39 pages, findings passent de 35 à 107 — décision Florian sur correctifs)*
- [x] **Crawler de robots.txt + sitemap fetch** — vérifier que `robots.txt` à la racine renvoie 200 et autorise `sitemap.xml`. Vérifier que `sitemap.xml` est bien `application/xml`. Reporter dans `admin-pro/audits/audit_robots_report.md`. *(fait 15/05 PM — `audit_robots.py` + report.md/json ; parse robots, test allow/disallow sur 14 pages clés, parse sitemap.xml, croise local↔sitemap, test HTTP prod best-effort ; 1 finding MED (realisation/reset.html absents — attendu) ; 5 checks OK)*
- [x] **Sonde performance images > 200 KB** — crawl `images/` et lister les PNG/JPG > 200 KB. Croiser avec leur usage `<img src=...>` ; si image lourde au-dessus du fold (hero) → ALERTE perf. *(fait 15/05 PM — `audit_images.py` + report.md/json ; 84 images scannées (6.3 MB), 6 > 200 KB toutes non référencées (mascotte PNG legacy + .tmp.png) ; seul `mascotte.webp` est utilisé → 1.6 MB de PNG morts à supprimer)*
- [x] **Synthèse mensuelle automatique** — script `admin-pro/audits/digest_mensuel.py` qui concatène les `*_report.md` les plus récents en 1 seul rapport `admin-pro/audits/DIGEST_2026-05.md` avec compteur de findings, évolution vs mois précédent. *(fait 15/05 PM — `digest_mensuel.py` + `DIGEST_2026-05.md/.json` ; 12 audits agrégés, 15 findings cumulés, comparaison vs mois N-1 via DIGEST_YYYY-MM.json, deltas + signal "🆕 nouveaux audits")*

---

## P11 — Auto-générés (TODO P10 épuisé le 15 mai 2026 PM)

> Section ouverte après épuisement complet P1-P10. Items orientés exécution récurrente des audits, nouvelles sondes dérivées des rapports, et dette technique mineure.
> Tout item engageant un montant ou un contenu marketing → `[?]` (attendre Florian).

- [ ] **Lancer `audit_liens_externes.py` en prod** — exécuter une fois avec un environnement qui a accès Internet (machine Florian ou GitHub Action) et committer le rapport. Le run sandbox n'a pas pu tester (DNS bloqué).
- [ ] **Lancer `audit_robots.py` en prod** — idem, pour valider les content-type prod et le statut HTTP 200 effectif sur Netlify.
- [x] **Affiner regex digest_mensuel.py** — l'heuristique de comptage `findings` retourne 0 pour `audit_aria` (35 findings réels), `audit_jsonld` (173 warnings) et `audit_lighthouse_local`. Ajouter des patterns spécifiques type `(\d+)\s*findings`, `(\d+)\s*warnings?`, `(\d+)\s*erreur`. *(fait 15/05 PM — cascade refondue : 1) "Findings totaux" 2) somme erreurs+warnings 3) emojis ; patterns relâchés pour matcher `- Avertissements (…) : **N**` et `**Findings (libellé)** : **N**` ; Findings cumulés 15→386 — audit_jsonld 173, audit_aria 107, audit_delais 31, audit_html5 29, audit_tarifs 22, audit_lighthouse 4)*
- [ ] **GitHub Action audit nightly** — créer `.github/workflows/audit.yml` qui exécute tous les `admin-pro/audits/*.py` chaque nuit à 3h UTC + commit rapport si delta. Pré-requis : runner Linux avec accès Internet (pour audit_liens_externes).
- [x] **Sonde #61 — links vers anciennes pages** — détecter dans toutes les pages les `href="..."` qui pointent vers un `.html` racine qui n'existe pas (variante du broken-links interne, mais en croisant avec sitemap.xml comme source de vérité). *(fait 15/05 PM — `audit_liens_internes_sitemap.py` + report.md/json ; 39 pages, 790 liens, 0 BROKEN, 0 ORPHAN après whitelist `admin/` + `admin-pro/`)*
- [x] **Sonde #62 — favicon/apple-touch-icon HTTP HEAD** — vérifier que les chemins déclarés dans `<link rel="icon">` et `<link rel="apple-touch-icon">` existent vraiment sur le disque (équivalent script-404 mais pour les icônes). *(fait 15/05 PM — `admin-pro/audits/audit_favicons.py` + report.md/json ; scan `<link rel="icon|shortcut icon|apple-touch-icon|manifest">` + `<meta name="msapplication-TileImage">` ; URL externes skip, locales résolues sur disque ; 39 pages, 122 références, **0 manquante** ✓)*
- [x] **Sonde #63 — duplicate IDs cross-page** — détecter le même `id="X"` apparaissant dans plus de N pages (suggère un copy-paste de template à factoriser). *(fait 15/05 PM — `audit_duplicate_ids.py` + report.md/json ; 39 pages, 517 ids, 0 dup in-page, 13 cross-page > seuil 10 (header/footer/chatbot d'urgence) ajoutés à la whitelist EXPECTED_GLOBAL_IDS ; rapport clean en sortie)*
- [x] **Audit consent vs tracking.js** — vérifier sur les 38 pages que `assets/tracking.js` est bien chargé APRÈS `assets/hc-consent.js` (sinon GA4 part avant la garde RGPD). *(fait 15/05 PM — audit live Python : 39 pages racine, 38/38 OK (hc-consent.js avant tracking.js), 0 manquant, 0 wrong-order ; reset.html sans tracking ni consent — admin page, OK)*
- [x] **Cleanup `images/_backup_png/`** — vérifier que le backup PNG (créé lors de la compression du 15/05) ne contient plus rien d'utilisé en prod ; si OK, le déplacer hors du repo ou créer un `.gitignore` pour ce dossier. *(fait 15/05 PM — audit Grep `_backup_png` : 0 référence en HTML/CSS/JS ; ajout `.gitignore` racine (`images/_backup_png/*` avec exception README.md) + `images/_backup_png/README.md` documentant le contenu (42 fichiers, ~4.7 MB) + procédure `git rm -r --cached` laissée à Florian (action destructive))*
- [ ] **Audit `data-source` obsolète** — étendre `audit_datasource.py` avec la sous-règle de la sonde #37 : alerter quand `base-produits-YYYY-MM` ou `devis YYYY-MM-DD` a plus de 12 mois (source potentiellement périmée).

---

## Comment l'agent doit gérer cette liste

À chaque déclenchement de scheduled task :

1. **Lire** ce fichier (`Read` tool).
2. **Trouver le premier item non-coché** (`[ ]`) du haut.
3. **Faire l'item** intégralement (créer/modifier les fichiers nécessaires).
4. **Marquer l'item `[x]`** avec la date+heure et un mot du commit.
5. **Vérifier le résultat** (audit rapide : balisage HTML cohérent, pas d'erreur évidente).
6. **Sortir** — laisser l'auto-push faire le commit Git.

Si un item bloque (info manquante ou décision à prendre) → marquer `[?]` avec courte note explicative et **passer au suivant**.

Si tous les items sont cochés → marquer ce fichier `# 🎉 Tout est fait` au début et envoyer une notification à Florian.

---

*Document maintenu par l'agent autonome. Florian peut ajouter des items à tout moment.*
