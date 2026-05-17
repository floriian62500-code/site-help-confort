# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-17 06:26_

- Pages scannées : **43**
- `<img>` avec width+height : **523**
- Patchables (dimensions lues PIL) : **1**
- Externes (CDN/hot-link) : **78**
- Non-résolues (fichier absent) : **100**
- Dynamiques (template `${...}`) : **4**

## 🛠️ Patches proposés (dimensions lues PIL)

Pour chaque `<img>` ci-dessous, le patch est prêt à être appliqué
(décision masse → Florian).

### `partenaires.html` — 1 patch(es)

**L63** (1080×1080px) — `logo-officiel.jpg`

```html
AVANT : <img src="logo-officiel.jpg" alt="HELP Confort" style="height:48px;width:auto">
APRÈS : <img width="1080" height="1080" src="logo-officiel.jpg" alt="HELP Confort" style="height:48px;width:auto">
```

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `chauffagiste-saint-omer.html` (6) : L1594, L1624, L1634, L1664, L1694, L1704
- `electricien-saint-omer.html` (8) : L1382, L1392, L1402, L1412, L1422, L1432, L1442, L1452
- `menuisier-saint-omer.html` (14) : L1387, L1397, L1437, L1457, L1477, L1487, L1497, L1507, L1517, L1557
- `partenaires.html` (20) : L120, L180, L198, L204, L222, L228, L252, L258, L264, L282
- `plombier-saint-omer.html` (4) : L1430, L1440, L1540, L1550
- `serrurier-saint-omer.html` (12) : L1392, L1402, L1412, L1442, L1452, L1472, L1502, L1512, L1522, L1552
- `vitrier-saint-omer.html` (8) : L1357, L1367, L1377, L1387, L1397, L1407, L1417, L1427
- `volets-saint-omer.html` (6) : L1388, L1398, L1408, L1438, L1448, L1458

## ❓ Sources non résolues

### `actualites.html` — 1
- L729 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L125 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L421 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 9
- L1447 — `'+r.image+'` (fichier introuvable sur disque)
- L1574 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1584 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1604 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1614 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1644 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1654 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1674 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1684 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `contrats-entretien.html` — 1
- L2066 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1255 — `'+r.image+'` (fichier introuvable sur disque)

### `index.html` — 5
- L471 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L730 — `'+data.logo+'` (fichier introuvable sur disque)
- L842 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1361 — `'+a.image+'` (fichier introuvable sur disque)
- L1450 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 11
- L1260 — `'+r.image+'` (fichier introuvable sur disque)
- L1407 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1417 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1427 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1447 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)
- L1467 — `images/marques/meister.svg` (PIL n'a pas pu lire les dimensions)
- L1527 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1537 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1547 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1567 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)

### `nos-prestations.html` — 1
- L745 — `' + src + '` (fichier introuvable sur disque)

### `partenaires.html` — 25
- L96 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L102 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L108 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L114 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L126 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L132 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L138 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L144 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L150 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)
- L168 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-saint-omer.html` — 19
- L1263 — `'+r.image+'` (fichier introuvable sur disque)
- L1390 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1400 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1410 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1420 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1450 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1460 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1470 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1480 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1490 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `pmr-saint-omer.html` — 1
- L1217 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L581 — `(empty)` (src vide)
- L973 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L974 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L983 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 11
- L1255 — `'+r.image+'` (fichier introuvable sur disque)
- L1382 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1422 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1432 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1462 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1482 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1492 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1532 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1542 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1572 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `travaux-saint-omer.html` — 1
- L1230 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1230 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 5
- L1241 — `'+r.image+'` (fichier introuvable sur disque)
- L1368 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1378 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)
- L1418 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1428 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)

### `zones-intervention.html` — 2
- L1208 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L1336 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `realisation.html` (4) : L256, L257, L263, L328

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).