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
| A02 | zones-intervention (carte hero) | Bug carte | Carte rognée par `.z-hero-map` (overflow) → n'affichait que la mer | P1 | Structure + invalidateSize/ResizeObserver/setView | ✅ 4 tuiles/4 marqueurs desktop+mobile | ✅ | ⏳ | — | — |
| A03 | 104 pages | CSS/CLS | `@media` avalés du correctif CLS topbar (media-queries invalides) | P1 | Sweep 104 pages `@media(...)` | ✅ 0 restant | ✅ | ⏳ | — | — |
| A04 | realisation.html (header) | NAP | `tel:0366100134` ≠ `+33366100134` | P3 | Aligné `+33366100134` | ✅ | ✅ | ⏳ | — | — |
| A05 | /admin-pro/* (prod) | **Sécurité** | Back-office (HTML+md+json+sql+py) **servi publiquement** (noindex ≠ non accessible) | **P1** | Authentification requise (méthode + mdp = décision Florian) | — | — | **GATE FLORIAN** | — | — |
| A06 | realisation.html (legacy) | SEO/polish | Sans title, H1×3 (page noindex, remplacée par /realisations/*) | P3 | À nettoyer ou retirer du déploiement | — | — | ⏳ | — | — |
| A07 | 3 formulaires | Lead | `form_type` non explicite (défaut `demande_metier`) | P2 | Vérifier pertinence par page | — | — | ⏳ | — | — |
| A08 | 26 pages métiers (m-tarif-action) | **Revenu/Paiement** | Montant Stripe venait du DOM (client pouvait payer 1€) ; endpoint verify_jwt:false | **P0** | Paiement public GELÉ → route vers devis/lead ; usage admin intact | ✅ code | ⏳ | ⏳ | — | — |

## Gates Florian (décision requise)
- **A05** : méthode d'authentification du back-office `/admin-pro/*` (mot de passe Netlify site-wide ? Identity ? blocage sélectif ?). Je ne modifie pas sans ton choix pour ne pas casser tes outils admin.

## Notes
- `secrets/ga4-service-account.json` : gitignore + **404 prod** → non exposé (OK).
- Prod = `main` (non modifiée). Tous les correctifs ci-dessus sont sur **recette** uniquement.
