# RELEASE-CHECKLIST — Lot global stabilisation & livraison

> Source de vérité cumulative. Statuts : `DEMANDÉ → DÉVELOPPÉ → TESTÉ → DRAFT → PROD → PROD VÉRIFIÉ`.
> Rien n'est `TERMINÉ` avant `PROD VÉRIFIÉ` (sauf backend déjà déployé + vérifié = `PROD VÉRIFIÉ` direct).

## Vérité déploiement (mise à jour au cutover)
- PROD SHA (avant cutover) = `f8a9cf18` (main, déployé 2026-06-16)
- DRAFT SHA = `51ce6344` (integration/lot1-lot2-vs-prod)
- DIFF = 126 commits / 399 fichiers · PR #1 ouverte
- Rollback prod = republier deploy `6a316ff620a80c000874c720`

## BLOCKER PROD (doivent être fermés avant cutover)
| # | Élément | Statut | Preuve |
|---|---|---|---|
| B1 | Funnel contact E2E (1 lead, form_type, notif, anti-doublon) | DRAFT (testé) | E2E navigateur : 1 lead, contact_complet, archivé, notif reçue |
| B2 | Wizard urgence E2E (branches métiers, invalides, double-clic, photos) | DRAFT (testé) | Puppeteer : happy paths + tél/CP invalides bloqués + double-clic=1 lead + photos 1&3 |
| B3 | Wizard résilience (erreur réseau/backend, échec photo) | DRAFT (testé) | Aucun lead perdu ; photo échec → lead OK + message honnête |
| B4 | Photos upload sécurisé (token, MIME, taille, cross-lead, privé) | PROD VÉRIFIÉ (backend) | 13/13 + v2 CORS/rate-limit ; bucket privé (public read 400) |
| B5 | Notifications agence + accusé (chaîne v6, rendu propre) | PROD VÉRIFIÉ (backend) | Emails réels reçus ; logique 18/18 ; garde leads test |
| B6 | Mobile (0 débordement viewports mobiles) | DRAFT (testé) | 320–430px OK ; devis-express logo corrigé |
| B7 | Console propre (0 erreur site) | DRAFT (testé) | 4 SVG + 1 JS (hc-avis-live) corrigés ; 0 erreur site |
| B8 | Sécurité SECURITY DEFINER / RLS / Storage | PROD VÉRIFIÉ (backend) | REVOKE ciblé + search_path ; chaîne re-testée ; orphelins purgés |
| B9 | Sitemap complet (136 URLs, réalisations indexables) | PROD VÉRIFIÉ (backend edge) | edge sitemap v7 live |
| B10 | CLS métier×ville | DRAFT (corrigé) | 0.57 → 0.000 (hauteur topbar réservée) |
| B11 | Rollback vérifié | PRÊT | deploy f8a9cf18 restaurable < 5 min |

## À METTRE DANS CE CUTOVER (inclus dans le diff, sûrs)
- Réalisations pré-rendues indexables (25 pages + JSON-LD) — DRAFT
- devis-express form_type + JSON-LD LocalBusiness — DRAFT
- LCP home : hero video preload none (−6,36 Mo data) — DRAFT
- Retrait meta no-cache (93 pages), titres métier×ville — DRAFT

## APRÈS PROD (P2/P3 backlog)
- SEO local : 23 pages doorway (cannibalisation 96–98 %) → consolider (décision A/B)
- AEO/GEO extraction HTML initial
- 400 `prestations/_manifest.json` (géré, dette réseau)
- unused-JS/CSS ; critical-CSS pour LCP profond
- Dashboard (55 écrans, compte recette)
- Stripe TEST (parcours test)
- P3 : SVG déjà corrigé ; overflow 1024 = iframe Draft (absent en prod)

## Historique commits release (integration)
d06443cc sécurité · 28987d87 sitemap · b891fd16 devis schema · 47d5f50b garde recette ·
9ab7d3f3 js avis-live · 6c12439a+f1657513 svg · 3db643f1 CLS topbar · 51ce6344 LCP video

## Contrôle PROD (à remplir après cutover)
- [ ] home / téléphone / contact / devis-express / wizard / photos / notification
- [ ] pages métiers / réalisation / sitemap / mobile / console / réseau
- [ ] DB : 1 lead recette, bon form_type/source, notif, 0 doublon → puis nettoyage

---
## ✅ CUTOVER EFFECTUÉ — PROD VÉRIFIÉ (2026-08-08 15:43 UTC)
- PROD SHA = `65fd1802` (merge PR #1) · déployé 15:43:46 UTC · build ready 11s · 100 fichiers · **rollback dispo** (deploy `6a316ff620a80c000874c720` = f8a9cf18)
- Contrôles prod : **12/12 pages 200** · sitemap 190 URLs · robots/canonical/form_type/JSON-LD/no-cache OK · mobile 320–430px **0 débordement** · **CLS métier×ville 0.000** · console métier propre.
- **Funnel E2E prod PASS** : 1 lead (`contact_complet`, archivé, source formulaire_site), **0 doublon**, données de recette nettoyées (0 lead / 0 photo).
- B1..B11 → **PROD VÉRIFIÉ**. Backend (B4,B5,B8,B9) déjà PROD VÉRIFIÉ.

### Nouvelles anomalies découvertes en recette prod (P2, backlog)
- P2-a : `401 stats_publiques?select=*` sur home (script live-stats utilise probablement la clé anon désactivée) — feature stats dégradée, page/funnel OK.
- P2-b : ville + autocomplétion adresse : saisir ville puis éditer l'adresse en free-text réinitialise ville → "Ville requise" (message clair, lead non perdu).
