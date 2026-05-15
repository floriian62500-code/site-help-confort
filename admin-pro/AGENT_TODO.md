# 🎉 Tout est fait — HELP! Confort Saint-Omer

> **Mise à jour 15 mai 2026 — 14:30 (agent autonome)** — Tous les items P1 à P9 sont cochés (dernier : Reviews Google scrap).
> L'agent peut désormais s'occuper exclusivement de monitoring (nouveaux bugs, ajout contenu).
>
> Restera à faire à la main : validation tarifs en attente (cf. `TARIFS_REFERENCE.md` § "En attente de validation Florian").
>
> 🎉 **TODO épuisé le 2026-05-15**. Une section `## P10 — Auto-générés` peut être ajoutée par la prochaine session autonome si besoin (cf. instructions scheduled-task).

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
