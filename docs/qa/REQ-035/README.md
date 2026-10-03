# REQ-20260926-035 — captures de contrôle

Prises sur la **preview de recette**
`https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app`, après déploiement du commit
**`ee2b2984`** ("fix(promo): figer box-sizing…"), le 2026-09-29.

| fichier | page | largeur | encart | taille mesurée | bouton de fermeture |
|---|---|---|---|---|---|
| `accueil-1440.jpg` | / | 1440 | visible | 370 × 311 px | **0** |
| `contact-1440.jpg` | /contact | 1440 | visible | 370 × 311 px | **0** |
| `catalogue-1440.jpg` | /catalogue (tunnel) | 1440 | visible | 370 × 351 px | **0** |
| `zones-1440.jpg` | /zones-intervention | 1440 | visible | 370 × 311 px | **0** |
| `accueil-390.jpg` | / | 390 | visible | 370 × 63 px | **0** |
| `contact-390.jpg` | /contact | 390 | visible | 370 × 63 px | **0** |
| `catalogue-390.jpg` | /catalogue (tunnel) | 390 | visible | 370 × 82 px | **0** |
| `zones-390.jpg` | /zones-intervention | 390 | visible | 370 × 63 px | **0** |

Méthode : Chromium piloté par Playwright 1.55, émulation iPhone 13 pour le 390, viewport
1440 × 900 pour le desktop, attente de visibilité réelle de `#entretien-saison` puis capture.
Le consentement est posé sur « refusé » avant chargement — c'est le choix le plus protecteur, et
cela évite que le bandeau de consentement recouvre justement ce qu'on vient prouver.

Les tailles sont relevées sur l'élément, pas estimées à l'œil.
