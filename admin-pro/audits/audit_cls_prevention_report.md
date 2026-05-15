# 📐 Audit CLS prevention (img width/height) — sonde #56

_Généré le 2026-05-15 18:29_

- Pages scannées : **38**
- `<img>` total : **453**
- `<img>` avec width+height : **401**
- `<img>` **sans dimensions** (alertes CLS) : **52**
- Pages avec au moins 1 alerte : **17**

Taux de couverture dimensions : **88.5%**

## ⚠️ Pages avec `<img>` sans width/height

### `actualites.html` — 1 `<img>` à corriger

- L673 (width+height manquant) — `'+a.image+'`

### `avant-apres.html` — 2 `<img>` à corriger

- L42 (width+height manquant) — `logo-officiel.jpg`
- L125 (width+height manquant) — `' + src + '`

### `blog.html` — 1 `<img>` à corriger

- L417 (width+height manquant) — `'+a.image+'`

### `chauffagiste-saint-omer.html` — 5 `<img>` à corriger

- L290 (width+height manquant) — `images/picto-chauffage.svg`
- L1246 (width+height manquant) — `'+r.image+'`
- L1363 (width+height manquant) — `images/marques/logo-atlantic.svg`
- L1368 (width+height manquant) — `images/marques/Hansgrohe-Logo-2.svg`
- L1373 (width+height manquant) — `images/marques/logo-ramon-soler-azul.svg`

### `contrats-entretien.html` — 1 `<img>` à corriger

- L2044 (width+height manquant) — `' + p.data + '`

### `devis-express.html` — 1 `<img>` à corriger

- L50 (width+height manquant) — `logo-officiel.jpg`

### `electricien-saint-omer.html` — 4 `<img>` à corriger

- L1198 (width+height manquant) — `'+r.image+'`
- L1315 (width+height manquant) — `images/marques/logo-atlantic.svg`
- L1320 (width+height manquant) — `images/marques/Hansgrohe-Logo-2.svg`
- L1325 (width+height manquant) — `images/marques/logo-ramon-soler-azul.svg`

### `faq.html` — 1 `<img>` à corriger

- L65 (width+height manquant) — `logo-officiel.jpg`

### `index.html` — 5 `<img>` à corriger

- L461 (width+height manquant) — `images/picto-chauffage.svg`
- L685 (width+height manquant) — `'+data.logo+'`
- L1115 (width+height manquant) — `'+a.image+'`
- L1204 (width+height manquant) — `'+p.dataUrl+'`
- L1908 (width+height manquant) — `' + escapeHtml(a.logo) + '`

### `nos-prestations.html` — 1 `<img>` à corriger

- L358 (width+height manquant) — `' + src + '`

### `plombier-saint-omer.html` — 10 `<img>` à corriger

- L992 (width+height manquant) — `https://plus.unsplash.com/premium_photo-1664301972519-506636f0245d?fm=jpg&q=70&w`
- L1002 (width+height manquant) — `https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?fm=jpg&q=70&w=600&h`
- L1012 (width+height manquant) — `https://plus.unsplash.com/premium_photo-1661301068444-8ac48208d017?fm=jpg&q=70&w`
- L1022 (width+height manquant) — `https://plus.unsplash.com/premium_photo-1661884973994-d7625e52631a?fm=jpg&q=70&w`
- L1032 (width+height manquant) — `https://images.unsplash.com/photo-1744869524920-f0efc925b82f?fm=jpg&q=70&w=600&h`
- L1042 (width+height manquant) — `https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?fm=jpg&q=70&w=600&h`
- L1259 (width+height manquant) — `'+r.image+'`
- L1376 (width+height manquant) — `images/marques/logo-atlantic.svg`
- L1381 (width+height manquant) — `images/marques/Hansgrohe-Logo-2.svg`
- L1386 (width+height manquant) — `images/marques/logo-ramon-soler-azul.svg`

### `realisation.html` — 5 `<img>` à corriger

- L45 (width+height manquant) — `logo-officiel.jpg`
- L138 (width+height manquant) — `${r.image_before}`
- L139 (width+height manquant) — `${r.image_after}`
- L145 (width+height manquant) — `${photo}`
- L210 (width+height manquant) — `${p}`

### `realisations.html` — 4 `<img>` à corriger

- L500 (width+height manquant) — `(no src)`
- L881 (width+height manquant) — `'+r.photo_apres+'`
- L882 (width+height manquant) — `'+r.photo_avant+'`
- L891 (width+height manquant) — `'+r.photo_apres+'`

### `serrurier-saint-omer.html` — 4 `<img>` à corriger

- L1234 (width+height manquant) — `'+r.image+'`
- L1351 (width+height manquant) — `images/marques/logo-atlantic.svg`
- L1356 (width+height manquant) — `images/marques/Hansgrohe-Logo-2.svg`
- L1361 (width+height manquant) — `images/marques/logo-ramon-soler-azul.svg`

### `temoignages.html` — 1 `<img>` à corriger

- L66 (width+height manquant) — `logo-officiel.jpg`

### `travaux-saint-omer.html` — 4 `<img>` à corriger

- L1233 (width+height manquant) — `'+r.image+'`
- L1350 (width+height manquant) — `images/marques/logo-atlantic.svg`
- L1355 (width+height manquant) — `images/marques/Hansgrohe-Logo-2.svg`
- L1360 (width+height manquant) — `images/marques/logo-ramon-soler-azul.svg`

### `zones-intervention.html` — 2 `<img>` à corriger

- L1214 (width+height manquant) — `images/picto-chauffage.svg`
- L1334 (width+height manquant) — `'+r.image+'`

---

Recommandation : pour chaque `<img>` flaggué, lire les vraies dimensions du fichier (PIL) et ajouter `width="X" height="Y"`.