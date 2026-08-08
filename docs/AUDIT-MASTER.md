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
| A14 | nos-prestations « Voir le tarif » | **Revenu** | Le formulaire tarif doit créer un **lead exploitable** (form_type `tarif_prestation`, notif agence, statut CRM « Tarif consulté », tracking) | **P1** | À construire (front + submit-lead-v6 + routing agence + dashboard) — GO donné, test DB requis | — | — | ⏳ | — | — |
| A12b | sitemap réalisations | SEO | Écart apparent 25 vs 19 | P2 | Réconcilié : 25=25=25 (base publie=25, pages=25, edge direct=25) ; le « 19 » = cache Netlify Edge périmé 1h | ✅ | ✅ | ⏳ | — | — |
| A15 | Home + site (container global) | UX/Desktop | « Petit site centré » : container plafonné 1200px !important + section chantiers/actu coincée dans le wizard 920px | P2 | Container responsive 1320/1440/1520 + section chantiers sortie du wizard (57%→90% occupation) | ✅ 1600/1440/768/375 sans débordement | ✅ | ⏳ | — | — |
| A02 | zones-intervention (carte hero) | Bug carte | Carte rognée par `.z-hero-map` (overflow) → n'affichait que la mer | P1 | Structure + invalidateSize/ResizeObserver/setView | ✅ 4 tuiles/4 marqueurs desktop+mobile | ✅ | ⏳ | — | — |
| A03 | 104 pages | CSS/CLS | `@media` avalés du correctif CLS topbar (media-queries invalides) | P1 | Sweep 104 pages `@media(...)` | ✅ 0 restant | ✅ | ⏳ | — | — |
| A04 | realisation.html (header) | NAP | `tel:0366100134` ≠ `+33366100134` | P3 | Aligné `+33366100134` | ✅ | ✅ | ⏳ | — | — |
| A05 | /admin-pro/* (prod) | **Sécurité** | Back-office (HTML+md+json+sql+py) **servi publiquement** (noindex ≠ non accessible) | **P1** | Authentification requise (méthode + mdp = décision Florian) | — | — | **GATE FLORIAN** | — | — |
| A06 | realisation.html (legacy) | SEO/polish | Sans title, H1×3 (page noindex, remplacée par /realisations/*) | P3 | À nettoyer ou retirer du déploiement | — | — | ⏳ | — | — |
| A07 | 3 formulaires | Lead | `form_type` non explicite (défaut `demande_metier`) | P2 | Vérifier pertinence par page | — | — | ⏳ | — | — |
| A08 | 26 pages métiers (hc-reserve-modal) | Revenu/Paiement | Frontend créait un paiement Stripe avec montant lu dans le DOM. **Dormant** aujourd'hui (toutes cartes = `complex`/devis) mais dangereux dès l'ajout d'une carte prix-fixe | P2 | Frontend GELÉ → route devis/lead (défense) | ✅ test : 0 appel Stripe | ⏳ | ⏳ | — | — |
| A08b | edge `stripe-create-payment-link` (Supabase prod) | **Sécurité/Paiement** | Fonction **ouverte** (verify_jwt:false, CORS \*) qui crée un Checkout pour le **montant fourni par l'appelant** (aucun prix serveur, min 1€). Abus possible par appel direct | **P1** | Hardening backend requis (catalogue prix serveur OU restreindre à admin authentifié) + webhook signé + idempotence | — | — | **GATE FLORIAN (backend prod)** | — | — |

## Gates Florian (décision requise)
- **A05** : méthode d'authentification du back-office `/admin-pro/*` (mot de passe Netlify site-wide ? Identity ? blocage sélectif ?). Je ne modifie pas sans ton choix pour ne pas casser tes outils admin.
- **A08b** : hardening backend paiement (action Supabase prod = GO requis). Deux failles : (1) `stripe-create-payment-link` accepte un montant arbitraire de l'appelant ; (2) `stripe-webhook` **ne vérifie pas la signature Stripe** (`TODO`) → statut « payé » forgeable. **Conclusion : paiement client à garder GELÉ** tant que : prix serveur (catalogue) + endpoint restreint + signature webhook (`webhook_secret`) + idempotence ne sont pas en place et prouvés en TEST.

## Notes
- `secrets/ga4-service-account.json` : gitignore + **404 prod** → non exposé (OK).
- Prod = `main` (non modifiée). Tous les correctifs ci-dessus sont sur **recette** uniquement.
