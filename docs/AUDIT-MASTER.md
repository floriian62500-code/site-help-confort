# AUDIT MASTER — Site depan59-62.fr (lot maître)

> Source de vérité de l'audit exhaustif. Une anomalie n'est close qu'à **VÉRIFIÉ PROD**.
> Chaîne : DÉTECTÉ → CORRIGÉ → TESTÉ CLAUDE → RECETTE → VALIDÉ FLORIAN → PROD → VÉRIFIÉ PROD.
> Démarré 2026-08-08. Recette : https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app

## Inventaire
- Pages `.html` racine : **118** · Réalisations statiques `/realisations/*` : **25** · **Total 143** (139 indexables, 4 noindex).
- SEO : titles 139/139 uniques · descriptions 139/139 uniques · **0 lien interne cassé** · **0 titre dupliqué**.
- NAP téléphone : cohérent `+33366100134` (une seule occurrence divergente corrigée).
- Formulaires lead (statiques) : **35** — 34 `demande_metier` (dont 3 par défaut), 1 `contact_complet`. Wizard/rappel/devis générés en JS (hc-widgets).

## Registre des anomalies

| ID | URL / zone | Catégorie | Anomalie | Sév. | Correction | Test Claude | Recette | Validé Florian | Prod | Vérifié Prod |
|----|-----------|-----------|----------|------|-----------|-------------|---------|----------------|------|--------------|
| A01 | realisation.html + /realisations/* | UX | Double bouton « retour » (header + contenu) | P2 | Header dédupliqué | ✅ 1 seul lien | ✅ | ⏳ | — | — |
| A09 | carte zones (hc-map-zones, 4 pages) | UX/Design | Style multicolore jugé « peu classe » par Florian | P3 | Restyle façon référence : points bleus + labels permanents + halo unique + communes secondaires ; légende retirée | ✅ desktop+mobile | ✅ | ⏳ | — | — |
| A10 | actualites.html:714 | Routing | Dernier lien à l'ancienne convention `/realisation/<slug>.html` | P2 | → `/realisations/<slug>` | ✅ 0 ancien motif sur tout le site | ✅ | ⏳ | — | — |
| A11 | realisation.html (legacy) | Nettoyage | Page orpheline noindex | P3 | Redirect 301 forcé → listing | ✅ 301 vérifié recette | ✅ | ⏳ | — | — |
| A12 | routing réalisations (global) | Routing | Sweep : cards, pages métiers, actus, sitemap, breadcrumbs | P1 | Convention unique `/realisations/<slug>` | ✅ clics testés : cards+métier = 200 ; legacy = 301 | ✅ | ⏳ | — | — |
| A13 | homepage + pages métiers | UX/CTA | Doublon CTA téléphone (header + hero « Appeler maintenant ») | P3 | À harmoniser (header desktop plus discret) — lot suivant | — | — | ⏳ | — | — |
| A14 | nos-prestations « Voir le tarif » | **Revenu** | Lead-gate créait un lead **parallèle** (`contracts`), sans form_type, sans prestation/prix, sans notif, sans anti-doublon | **P1** | Branché sur **submit-lead-v6** : `form_type=tarif_prestation`, **prestation_id serveur autoritaire** (prix DOM = simple instantané), slug/métier/ville/CP/**agence déduite CP**/source_page, anti-doublon (verrou in-flight + localStorage 30min), 6 events tracking, RGPD reformulé | ✅ **E2E→DB PASS** : happy path 1 lead · **double-clic=1** · invalides bloqués (0 POST) · **Dunkerque→depan-dk** · prestation_id capturé · mobile gate OK · tests archivés/silencieux, nettoyés | ✅ | ⏳ | — | — |
| A12b | sitemap public (`/sitemap.xml`) | SEO | Public servait **19** alors que l'edge direct = 25. **Cause réelle : un `sitemap.xml` statique périmé (2 août, 19) masquait la redirection edge** (fichier statique > redirect 200 non forcé) | P2 | Supprimé les 4 sitemap statiques périmés + redirection **forcée** (`200!`) → **public recette = 25, 0 doublon, XML valide** | ✅ 25 servies sur recette | ✅ | ⏳ (revalider public PROD après TTL) | — | — |
| A15 | Home + site (container global) | UX/Desktop | « Petit site centré » : container plafonné 1200px !important + section chantiers/actu coincée dans le wizard 920px | P2 | Container responsive 1320/1440/1520 + section chantiers sortie du wizard (57%→90% occupation) | ✅ **sweep non-régression 1024–1920 sur 9 gabarits : 0 débordement** | ✅ | ⏳ | — | — |
| A17 | canonique (sitemap + canonical) | SEO | www vs apex | P2 | **Frontend fait** : canonical/og/JSON-LD/liens = apex (141 pages, 0 www), robots + générateurs. Sitemap edge (backend partagé) préparé → redéploiement AU CUTOVER prod (avec le frontend, pour aligner en même temps) | ✅ canonical apex servi sur recette | ✅ | ⏳ | — | — |
| A02 | zones-intervention (carte hero) | Bug carte | Carte rognée par `.z-hero-map` (overflow) → n'affichait que la mer | P1 | Structure + invalidateSize/ResizeObserver/setView | ✅ 4 tuiles/4 marqueurs desktop+mobile | ✅ | ⏳ | — | — |
| A03 | 104 pages | CSS/CLS | `@media` avalés du correctif CLS topbar (media-queries invalides) | P1 | Sweep 104 pages `@media(...)` | ✅ 0 restant | ✅ | ⏳ | — | — |
| A04 | realisation.html (header) | NAP | `tel:0366100134` ≠ `+33366100134` | P3 | Aligné `+33366100134` | ✅ | ✅ | ⏳ | — | — |
| A05 | /admin-pro/* (prod) | **Sécurité** | Back-office (HTML+md+json+sql+py) **servi publiquement** (noindex ≠ non accessible) | **P1** | Authentification requise (méthode + mdp = décision Florian) | — | — | **GATE FLORIAN** | — | — |
| A06 | realisation.html (legacy) | SEO/polish | Sans title, H1×3 (page noindex, remplacée par /realisations/*) | P3 | À nettoyer ou retirer du déploiement | — | — | ⏳ | — | — |
| A07 | 3 formulaires | Lead | `form_type` non explicite (défaut `demande_metier`) | P2 | Vérifier pertinence par page | — | — | ⏳ | — | — |
| A08 | 26 pages métiers (hc-reserve-modal) | Revenu/Paiement | Frontend créait un paiement Stripe avec montant lu dans le DOM. **Dormant** aujourd'hui (toutes cartes = `complex`/devis) mais dangereux dès l'ajout d'une carte prix-fixe | P2 | Frontend GELÉ → route devis/lead (défense) | ✅ test : 0 appel Stripe | ⏳ | ⏳ | — | — |
| A08b | edge `stripe-create-payment-link` (Supabase prod) | **Sécurité/Paiement** | Fonction **ouverte** (verify_jwt:false, CORS \*) qui crée un Checkout pour le **montant fourni par l'appelant** (aucun prix serveur, min 1€). Abus possible par appel direct | **P1** | Hardening backend requis (catalogue prix serveur OU restreindre à admin authentifié) + webhook signé + idempotence | — | — | **GATE FLORIAN (backend prod)** | — | — |

| A14b | v_services_public (34 prestations) | Données | Audit prestations : 28 prix-fixe / 6 devis · **1 anomalie** : prestation `requires_quote=true` **avec** `price_ttc>0` (devis marqué payable) | P2 | Corriger la donnée en admin (identifier + trancher) | ⏳ à identifier | — | ⏳ | — | — |
| A16 | SEO local / citations | SEO | Fiche « Achetez en Pays de Saint-Omer » (backlink existant) à mentionner sobrement (rubrique « Ancrage local / Ils nous référencent ») + module Dashboard Citations + audit citations (GBP, PagesJaunes, CAPSO, Côte d'Opale…) | P2 | QUEUED — ne pas classer comme fournisseur/partenaire | — | — | ⏳ | — | — |

| A19 | Home — wizard `#resa-pay` | **Sécurité/Paiement** | **P0 trouvé au contrôle final Home** : le wizard envoyait `amount_eur` **client** à `stripe-create-payment-link` (endpoint non sécurisé) → paiement à montant manipulable | **P0** | GELÉ : le wizard **s'arrête sur le lead** (déjà enregistré), agence recontacte. Les 2 chemins (Payment Link + création à la volée) neutralisés | ✅ gel servi | ✅ | ⏳ (revalidation fonctionnelle Home) | — | — |
| A18 | /realisations (page) | UX/SEO/Data | Actualités (9 `status=actu`) mal exposées ; cartes : titres emoji/markdown bruts, tronqués ; carrousel/filtres à revoir ; actus non ouvrables | P1 | **Page en cours** (refonte cartes + séparation réal/actu + filtres + pages actu + SEO + responsive) | ⏳ inventaire fait (25 réal / 9 actu / 0 sans slug) | — | ⏳ | — | — |

| A21 | Centre de validation `/recette.html` + `hc-review.js` | Process | Validation Florian trop technique | P1 | **7 points livrés** : (1) VOIR = surlignage réel + bandeau OK/À corriger sur la page (`data-review-id` + `?review=`), desktop+mobile ; (2) **sécurité** : anon **ne lit pas** les commentaires (vue sans commentaire), insert borné, pas d'update/delete (test négatif réel) ; (3) OK **lié à la version** de l'item → « à revalider » si l'item change ; (4) **gel par page** ; (5) Home contrôle wizard fait ; (6) bouton prod **enregistre** la décision (ne déploie pas) ; (7) vue **« en production »** | ✅ E2E : surlignage OK, RLS OK, lecture vue OK | ✅ | ⏳ | — | — |
| A20 | clé anon Supabase (site) | Bug/SEO | La clé **anon JWT est désactivée** → **401 sur toute API REST** (stats home `stats_publiques`, etc.). Les leads marchent car edge=verify_jwt:false | P2 | Migrer les appels REST du site vers la **publishable key** `sb_publishable_…` (fait pour recette.html ; reste : live-stats home + autres) | ⏳ | — | ⏳ | — | — |

## Gates Florian (décision requise)
- **A05** : méthode d'authentification du back-office `/admin-pro/*` (mot de passe Netlify site-wide ? Identity ? blocage sélectif ?). Je ne modifie pas sans ton choix pour ne pas casser tes outils admin.
- **A08b** : hardening backend paiement (action Supabase prod = GO requis). Deux failles : (1) `stripe-create-payment-link` accepte un montant arbitraire de l'appelant ; (2) `stripe-webhook` **ne vérifie pas la signature Stripe** (`TODO`) → statut « payé » forgeable. **Conclusion : paiement client à garder GELÉ** tant que : prix serveur (catalogue) + endpoint restreint + signature webhook (`webhook_secret`) + idempotence ne sont pas en place et prouvés en TEST.

## Notes
- `secrets/ga4-service-account.json` : gitignore + **404 prod** → non exposé (OK).
- Prod = `main` (non modifiée). Tous les correctifs ci-dessus sont sur **recette** uniquement.
