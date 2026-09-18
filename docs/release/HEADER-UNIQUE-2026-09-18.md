# En-tête unique du site — directive 5718214970 (18/09/2026)

Référence : l'en-tête de l'accueil en 1440 px. Correction faite à la source, pas page par page.

## 1. Constat (recette `30ba9d3d`)
- **Aucun en-tête partagé** : 199 pages publiques, environ 20 variantes de balisage.
- Un bloc CSS « critique » copié dans 94 pages ramenait le logo à 56 px (barre de 81 px sur Zones). Seul l'accueil ajoutait ensuite un bloc qui rétablissait le grand en-tête (barre 165, logo 140, signature « Dépan'Audo »).
- 25 articles d'actualité sans en-tête (petite barre sombre), 28 réalisations avec leur propre barre, 3 pages partenaires avec une barre minimale.
- 5 copies différentes du script d'en-tête, et environ 50 pages sans aucun script : le menu mobile n'y fonctionnait pas.
- L'accueil lui-même avait des défauts :
  - entre 980 et environ 1400 px, la navigation débordait (bouton téléphone hors écran en 1024) ;
  - sur mobile, la barre faisait 161 px de haut, le menu s'ouvrait sur la hauteur de la barre seulement (masqué par le contenu) et le logo grossissait (70 → 90 px) au défilement.

## 2. Source unique
| Fichier | Rôle |
|---|---|
| `partials/hc-header.html` | balisage de référence, dérivé de l'accueil : liens absolus, logo aux vraies proportions, menu mobile aligné sur le méga-menu (Menuiserie, Contrats d'entretien) |
| `assets/hc-header.css` | styles, tous préfixés `#hcHeader` : les restes propres à chaque page ne peuvent plus agir. Tailles en px, indépendantes de la police racine de chaque page |
| `assets/hc-header.js` | réduction au défilement, menu mobile (panneau sous la barre, Échap, `aria-expanded`), méga-menu : un seul script |
| `scripts/header/sync-header.mjs` | applique le tout à 198 pages : rubrique active, retrait des anciens styles et scripts, versions = empreinte du contenu. `--check` pour le contrôle |
| `scripts/tests/header.test.mjs` | 15 garanties : en-tête identique partout, aucune fuite de style, aucun ancien script, idempotence |

Exclusions : `catalogue.html` (le tunnel « Ma demande » garde sa propre barre) et `reset.html` (page technique non indexée).

## 3. Gabarit (identique sur toutes les pages)
| Largeur | Barre | Logo | Contenu |
|---|---|---|---|
| ≥ 1440 (référence) | 165 px, 111 au défilement | 140 → 90 | signature, navigation complète, numéro affiché |
| 1280–1439 | 141 px | 110 → 80 | signature, navigation resserrée, téléphone en icône |
| 980–1279 | 141 px | 110 → 80 | signature, téléphone, menu burger (la navigation complète ne tient pas) |
| 769–979 | 121 px | 90 → 72 | idem |
| ≤ 768 | 95 px (fixe) | 70 | signature, « Appeler », menu burger |

Au défilement, la boîte collante garde sa hauteur : seule la barre se réduit. Le contenu ne bouge pas (décalage mesuré : 0 px).

Choix assumé : sur mobile, la barre passe de 161 à 95 px sur toutes les pages, l'accueil compris. Même logo, même signature, mêmes actions ; seule la marge vide disparaît. Les 161 px occupaient 19 % de l'écran en permanence et cassaient le menu.

## 4. Preuves
**Local (copie servie par un serveur statique), 198 pages × 1440 / 1024 / 768 / 390** : 100 % identiques à l'accueil. 0 collision entre navigation et signature, 0 bouton téléphone hors écran, 0 lien d'évitement visible.

**Deploy Preview `dd512af4`, 6 pages demandées × 4 largeurs** (accueil, zones, plombier, prestation chauffe-eau, contact, à propos) — mêmes mesures sur chaque page :

| Largeur | Barre | Logo (x, y, l, h) | Signature | Navigation | Téléphone | Burger |
|---|---|---|---|---|---|---|
| 1440 | 165 | 58, 12, 140, 140 | 212, 66 | 8 liens dès x = 423 | 1206, 61, 162 × 41 | — |
| 1024 | 141 | 41, 15, 110, 110 | 165, 54 | — | 866, 48, 48 × 44 | 924, 48 |
| 768 | 95 | 20, 12, 70, 70 | 100, 34 | — | 633, 25, 48 × 44 | 689, 25 |
| 390 | 95 | 20, 12, 70, 70 | 100, 40 | — | 209, 25, 109 × 44 « Appeler » | 326, 25 |

La rubrique active est correcte sur chaque page (Accueil, Zones d'intervention, Métiers, Nos prestations, Contact, À propos).

Comportements vérifiés :
- menu mobile : panneau plein écran sous la barre, bouton toujours cliquable, fermeture par Échap et au clic sur un lien, liens hors tabulation une fois fermé ;
- méga-menu : ouverture au clic et au survol, aligné sous « Métiers », fermeture par Échap ;
- réduction au défilement : barre 165 → 111, logo 140 → 90, contenu 0 px.

Tests : en-tête 15/15, demande-v2 148/148, lead-cycle 67/67, price-gate 29/29, panier 12/12, SEO ERRORS=0.

## 5. Corrigé au passage
- Lien d'évitement « Aller au contenu principal » visible en haut de 82 pages (19 px) : masqué jusqu'au focus clavier, sur toutes les pages.
- `faq.html` : faute de balisage `…">>` dans la meta description ; le `>` en trop poussait l'en-tête de 24 px.
- Fragment `partials/` exclu du site public (`_redirects`, `robots.txt`) et de l'audit SEO.

## 6. Hors périmètre, constaté, non corrigé
La directive gèle les autres chantiers visuels.
- Débordement horizontal du **contenu** existant avant ce lot : `a-propos` en 1024 (cartes de labels, 1176 px pour 1009) ; 15 pages métier « chauffagiste » / « plombier » en 768 (cartes de contrats d'entretien, 856 px pour 753).
- En mobile, à la première visite, le bandeau cookies couvre le bas du tunnel.
- La navigation passe sur deux lignes entre 1280 et 1600 px, comme sur l'accueil de référence (la place manque avec logo 140 + signature + numéro).
