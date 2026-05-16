# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-16 07:47_

- Pages scannées : **41**
- `<img>` avec width+height : **448**
- Patchables (dimensions lues PIL) : **0**
- Externes (CDN/hot-link) : **24**
- Non-résolues (fichier absent) : **49**
- Dynamiques (template `${...}`) : **4**

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `plombier-saint-omer.html` (6) : L1025, L1035, L1045, L1055, L1065, L1075
- `pmr-saint-omer.html` (6) : L1003, L1013, L1023, L1033, L1043, L1053
- `vitrier-saint-omer.html` (6) : L1003, L1013, L1023, L1033, L1043, L1053
- `volets-saint-omer.html` (6) : L1003, L1013, L1023, L1033, L1043, L1053

## ❓ Sources non résolues

### `actualites.html` — 1
- L683 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L125 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L418 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 5
- L290 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L1246 — `'+r.image+'` (fichier introuvable sur disque)
- L1363 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1368 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1373 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `contrats-entretien.html` — 1
- L2054 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 4
- L1222 — `'+r.image+'` (fichier introuvable sur disque)
- L1339 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1344 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1349 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `index.html` — 5
- L462 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L686 — `'+data.logo+'` (fichier introuvable sur disque)
- L1116 — `'+a.image+'` (fichier introuvable sur disque)
- L1205 — `'+p.dataUrl+'` (fichier introuvable sur disque)
- L1909 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)

### `nos-prestations.html` — 1
- L358 — `' + src + '` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 4
- L1250 — `'+r.image+'` (fichier introuvable sur disque)
- L1367 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1372 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1377 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `pmr-saint-omer.html` — 4
- L1228 — `'+r.image+'` (fichier introuvable sur disque)
- L1345 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1350 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1355 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `realisations.html` — 4
- L508 — `(empty)` (src vide)
- L891 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L892 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L901 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 4
- L1234 — `'+r.image+'` (fichier introuvable sur disque)
- L1351 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1356 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1361 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `travaux-saint-omer.html` — 4
- L1233 — `'+r.image+'` (fichier introuvable sur disque)
- L1350 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1355 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1360 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `vitrier-saint-omer.html` — 4
- L1228 — `'+r.image+'` (fichier introuvable sur disque)
- L1345 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1350 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1355 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `volets-saint-omer.html` — 4
- L1228 — `'+r.image+'` (fichier introuvable sur disque)
- L1345 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1350 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1355 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

### `zones-intervention.html` — 2
- L1222 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L1342 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `realisation.html` (4) : L138, L139, L145, L210

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).