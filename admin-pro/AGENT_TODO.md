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
- [ ] **`carrieres.html`** — refonte : picto équipe + cards postes à pourvoir + CTA "Postuler".

## P2 — Pages locales depannage (cohérence inter-villes)

- [ ] **`depannage-longuenesse.html`** — ajouter picto multi-métier dans hero + CTA premium en bas.
- [ ] **`depannage-arques.html`** — idem.
- [ ] **`depannage-saint-martin-lez-tatinghem.html`** — idem.
- [ ] **`depannage-bergues.html`** — idem.
- [ ] **`depannage-gravelines.html`** — idem.
- [ ] **`depannage-saint-omer.html`** — vérifier cohérence avec les autres + harmonisation CTA.
- [ ] **`depannage-dunkerque.html`** — idem.

## P3 — SEO & structured data

- [ ] **Schema.org enrichi** sur les 5 pages métier : ajouter `LocalBusiness` complet (opening hours, geo, ratings agrégés, aggregateRating), `Service` pour chaque prestation avec `priceRange`.
- [ ] **Open Graph images** — créer un script qui génère des PNG 1200×630 pour chaque page principale (titre + métier + logo HC) — utiliser SVG → PNG via canvas dans une edge function.
- [ ] **JSON-LD breadcrumbs** sur les 4 guides (article + breadcrumb list).
- [ ] **Meta description optimisée** pour chaque page locale `depannage-*` avec ville + tarif anchor.
- [ ] **Sitemap.xml local** régénéré avec toutes les pages actuelles (audit complet, 49 actuelles à vérifier).

## P4 — Sécurité & performance

- [x] **`netlify.toml`** — ajouter Content Security Policy (CSP), HSTS, X-Frame-Options, Referrer-Policy. *(fait 14/05 12:00 — CSP complète + COOP, HSTS/XFO/CTO/RP/PP déjà présents)*
- [ ] **Compression** — vérifier que toutes les images PNG sont optimisées (passes via TinyPNG-like si présence d'outil dans le sandbox).
- [x] **Lazy-loading** — auditer que toutes les `<img>` sans `loading="lazy"` (hors above-the-fold) en aient un. *(fait 14/05 12:10 — 12 images patchées sur 9 fichiers)*
- [x] **Preconnect/dns-prefetch** — vérifier que toutes les pages ont preconnect vers `https://btcbjwqiivhpwoszomhg.supabase.co`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`. *(fait 14/05 12:13 — 31 pages patchées avec preconnect Supabase + dns-prefetch jsdelivr/api-adresse)*
- [ ] **Service Worker** — créer un SW basique de cache pour les pages métier (cache-first sur les images, network-first sur le HTML).

## P5 — Admin backoffice enrichi

- [ ] **`admin-pro/index.html`** (dashboard) — ajouter stats live : leads du jour, conversations chatbot, top prestation demandée.
- [ ] **`admin-pro/leads.html`** — ajouter export CSV.
- [ ] **`admin-pro/contracts.html`** — ajouter filtres par formule + recherche par nom client.
- [ ] **`admin-pro/services.html`** — ajouter colonne data-source pour traçabilité tarif.
- [ ] **Page admin "Tarifs"** — créer `admin-pro/tarifs.html` qui affiche `TARIFS_REFERENCE.md` parsé en table.

## P6 — Contenu marketing

- [ ] **Page FAQ globale** — créer `faq.html` qui agrège toutes les FAQ de chaque métier en un seul endroit indexable.
- [ ] **Page "Avant/Après"** — créer `avant-apres.html` qui montre des photos de chantiers (placeholder pour l'instant, données depuis `realisations` Supabase).
- [ ] **Page "Témoignages"** — créer `temoignages.html` qui agrège tous les avis 5★ avec photos clients (anonymisés).
- [ ] **Page "Devis express"** — créer `devis-express.html` avec un formulaire ultra-court (3 questions max) pour conversion mobile.

## P7 — Polish & cleanup

- [ ] **Vérifier les `data-source`** sur tous les tarifs des 5 pages métier (sonde IA #23).
- [ ] **Cleanup CSS mort** : supprimer les règles `.m-cta-final*` des 5 pages métier (HTML déjà retiré).
- [ ] **404.html** — refonte avec design unifié + bouton "Retour à l'accueil" + chatbot.
- [ ] **`mentions-legales.html`** — vérifier que toutes les infos sont à jour (SIRET, RCS, médiation conso).
- [ ] **Favicon** — vérifier que toutes les pages chargent le bon favicon `logo.svg`.

## P8 — Tests & qualité

- [ ] **Audit Lighthouse** simulé : checker performance/SEO/a11y des pages clés via curl + analyseur HTML basique.
- [x] **Broken links** : crawler local des `href=` internes et vérifier que les fichiers cibles existent. *(fait 14/05 12:08 — 2124 liens vérifiés, 0 cassé ✅)*
- [ ] **Schema.org Validator** : valider via curl le JSON-LD de chaque page métier auprès de https://validator.schema.org.
- [ ] **HTML5 validation** : passer chaque page publique au validateur W3C (via curl) et corriger les erreurs.

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
