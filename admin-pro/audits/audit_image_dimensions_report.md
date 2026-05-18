# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-18 07:00_

- Pages scannées : **76**
- `<img>` avec width+height : **864**
- Patchables (dimensions lues PIL) : **0**
- Externes (CDN/hot-link) : **196**
- Non-résolues (fichier absent) : **239**
- Dynamiques (template `${...}`) : **4**

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `chauffagiste-boulogne-sur-mer.html` (6) : L1588, L1618, L1628, L1658, L1688, L1698
- `chauffagiste-calais.html` (6) : L1588, L1618, L1628, L1658, L1688, L1698
- `chauffagiste-dunkerque.html` (6) : L1588, L1618, L1628, L1658, L1688, L1698
- `chauffagiste-saint-omer.html` (6) : L1597, L1627, L1637, L1667, L1697, L1707
- `electricien-boulogne-sur-mer.html` (8) : L1375, L1385, L1395, L1405, L1415, L1425, L1435, L1445
- `electricien-calais.html` (8) : L1375, L1385, L1395, L1405, L1415, L1425, L1435, L1445
- `electricien-dunkerque.html` (8) : L1375, L1385, L1395, L1405, L1415, L1425, L1435, L1445
- `electricien-saint-omer.html` (8) : L1384, L1394, L1404, L1414, L1424, L1434, L1444, L1454
- `menuisier-dunkerque.html` (14) : L1379, L1389, L1429, L1449, L1469, L1479, L1489, L1499, L1509, L1549
- `menuisier-saint-omer.html` (14) : L1388, L1398, L1438, L1458, L1478, L1488, L1498, L1508, L1518, L1558
- `partenaires.html` (20) : L148, L208, L226, L232, L250, L256, L280, L286, L292, L310
- `plombier-boulogne-sur-mer.html` (4) : L1424, L1434, L1534, L1544
- `plombier-calais.html` (4) : L1424, L1434, L1534, L1544
- `plombier-dunkerque.html` (4) : L1424, L1434, L1534, L1544
- `plombier-saint-omer.html` (4) : L1433, L1443, L1543, L1553
- `serrurier-boulogne-sur-mer.html` (12) : L1386, L1396, L1406, L1436, L1446, L1466, L1496, L1506, L1516, L1546
- `serrurier-calais.html` (12) : L1386, L1396, L1406, L1436, L1446, L1466, L1496, L1506, L1516, L1546
- `serrurier-dunkerque.html` (12) : L1386, L1396, L1406, L1436, L1446, L1466, L1496, L1506, L1516, L1546
- `serrurier-saint-omer.html` (12) : L1395, L1405, L1415, L1445, L1455, L1475, L1505, L1515, L1525, L1555
- `vitrier-dunkerque.html` (8) : L1349, L1359, L1369, L1379, L1389, L1399, L1409, L1419
- `vitrier-saint-omer.html` (8) : L1358, L1368, L1378, L1388, L1398, L1408, L1418, L1428
- `volets-dunkerque.html` (6) : L1380, L1390, L1400, L1430, L1440, L1450
- `volets-saint-omer.html` (6) : L1389, L1399, L1409, L1439, L1449, L1459

## ❓ Sources non résolues

### `actualites.html` — 1
- L748 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L151 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L421 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 9
- L1441 — `'+r.image+'` (fichier introuvable sur disque)
- L1568 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1578 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1598 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1608 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1638 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1648 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1668 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1678 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-calais.html` — 9
- L1441 — `'+r.image+'` (fichier introuvable sur disque)
- L1568 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1578 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1598 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1608 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1638 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1648 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1668 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1678 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-dunkerque.html` — 9
- L1441 — `'+r.image+'` (fichier introuvable sur disque)
- L1568 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1578 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1598 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1608 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1638 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1648 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1668 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1678 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-saint-omer.html` — 9
- L1450 — `'+r.image+'` (fichier introuvable sur disque)
- L1577 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1587 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1607 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1617 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1647 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1657 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1677 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1687 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `contrats-entretien.html` — 1
- L2066 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1257 — `'+r.image+'` (fichier introuvable sur disque)

### `index.html` — 5
- L471 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L730 — `'+data.logo+'` (fichier introuvable sur disque)
- L842 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1361 — `'+a.image+'` (fichier introuvable sur disque)
- L1450 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 11
- L1252 — `'+r.image+'` (fichier introuvable sur disque)
- L1399 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1409 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1419 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1439 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)
- L1459 — `images/marques/meister.svg` (PIL n'a pas pu lire les dimensions)
- L1519 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1529 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1539 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1559 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)

### `menuisier-saint-omer.html` — 11
- L1261 — `'+r.image+'` (fichier introuvable sur disque)
- L1408 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1418 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1428 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1448 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)
- L1468 — `images/marques/meister.svg` (PIL n'a pas pu lire les dimensions)
- L1528 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1538 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1548 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1568 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)

### `nos-prestations.html` — 1
- L745 — `' + src + '` (fichier introuvable sur disque)

### `partenaires.html` — 25
- L124 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L130 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L136 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L142 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L154 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L160 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L166 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L172 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L178 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)
- L196 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-boulogne-sur-mer.html` — 19
- L1257 — `'+r.image+'` (fichier introuvable sur disque)
- L1384 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1394 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1404 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1414 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1444 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1454 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1464 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1474 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1484 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-calais.html` — 19
- L1257 — `'+r.image+'` (fichier introuvable sur disque)
- L1384 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1394 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1404 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1414 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1444 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1454 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1464 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1474 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1484 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-dunkerque.html` — 19
- L1257 — `'+r.image+'` (fichier introuvable sur disque)
- L1384 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1394 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1404 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1414 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1444 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1454 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1464 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1474 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1484 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-saint-omer.html` — 19
- L1266 — `'+r.image+'` (fichier introuvable sur disque)
- L1393 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1403 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1413 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1423 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1453 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1463 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1473 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1483 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1493 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `pmr-dunkerque.html` — 1
- L1209 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1218 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L592 — `(empty)` (src vide)
- L984 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L985 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L994 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 11
- L1249 — `'+r.image+'` (fichier introuvable sur disque)
- L1376 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1416 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1426 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1456 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1476 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1486 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1526 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1536 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1566 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-calais.html` — 11
- L1249 — `'+r.image+'` (fichier introuvable sur disque)
- L1376 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1416 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1426 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1456 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1476 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1486 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1526 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1536 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1566 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-dunkerque.html` — 11
- L1249 — `'+r.image+'` (fichier introuvable sur disque)
- L1376 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1416 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1426 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1456 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1476 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1486 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1526 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1536 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1566 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-saint-omer.html` — 11
- L1258 — `'+r.image+'` (fichier introuvable sur disque)
- L1385 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1425 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1435 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1465 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1485 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1495 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1535 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1545 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1575 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `travaux-dunkerque.html` — 1
- L1222 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1231 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1222 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1231 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 5
- L1233 — `'+r.image+'` (fichier introuvable sur disque)
- L1360 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1370 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)
- L1410 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1420 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)

### `volets-saint-omer.html` — 5
- L1242 — `'+r.image+'` (fichier introuvable sur disque)
- L1369 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1379 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)
- L1419 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1429 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)

### `zones-intervention.html` — 2
- L1208 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L1336 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `realisation.html` (4) : L271, L272, L278, L343

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).