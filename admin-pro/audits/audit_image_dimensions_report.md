# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-31 07:01_

- Pages scannées : **115**
- `<img>` avec width+height : **1473**
- Patchables (dimensions lues PIL) : **1**
- Externes (CDN/hot-link) : **9**
- Non-résolues (fichier absent) : **54**
- Dynamiques (template `${...}`) : **7**

## 🛠️ Patches proposés (dimensions lues PIL)

Pour chaque `<img>` ci-dessous, le patch est prêt à être appliqué
(décision masse → Florian).

### `espace-client-dashboard.html` — 1 patch(es)

**L92** (1080×1080px) — `logo-officiel.jpg`

```html
AVANT : <img src="logo-officiel.jpg" alt="HELP Confort">
APRÈS : <img width="1080" height="1080" src="logo-officiel.jpg" alt="HELP Confort">
```

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `volets-saint-omer.html` (3) : L1111, L1140, L1150
- `volets-saint-omer.html 2.html` (6) : L1024, L1034, L1044, L1054, L1064, L1074

## ❓ Sources non résolues

### `actualites.html` — 1
- L764 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L192 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L425 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 1
- L1413 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-calais.html` — 1
- L1413 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-dunkerque.html` — 1
- L1415 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 1
- L1421 — `'+r.image+'` (fichier introuvable sur disque)

### `contrats-entretien.html` — 1
- L2082 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1212 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1212 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1220 — `'+r.image+'` (fichier introuvable sur disque)

### `index.html` — 4
- L732 — `'+data.logo+'` (fichier introuvable sur disque)
- L844 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1385 — `'+a.image+'` (fichier introuvable sur disque)
- L1474 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 1
- L1241 — `'+r.image+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 1
- L1249 — `'+r.image+'` (fichier introuvable sur disque)

### `nos-prestations.html` — 2
- L838 — `' + src + '` (fichier introuvable sur disque)
- L1367 — `' + u + '` (fichier introuvable sur disque)

### `plombier-boulogne-sur-mer.html` — 1
- L1246 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-calais.html` — 1
- L1246 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-dunkerque.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 1
- L1254 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-dunkerque.html` — 1
- L1220 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1289 — `'+r.image+'` (fichier introuvable sur disque)

### `pro.html` — 10
- L402 — `images/partenaires/homeserve.svg` (fichier introuvable sur disque)
- L406 — `images/partenaires/la-poste.svg` (fichier introuvable sur disque)
- L410 — `images/partenaires/dynaren.svg` (fichier introuvable sur disque)
- L414 — `images/partenaires/viaren.svg` (fichier introuvable sur disque)
- L418 — `images/partenaires/groupe-ima.svg` (fichier introuvable sur disque)
- L422 — `images/partenaires/domus.svg` (fichier introuvable sur disque)
- L426 — `images/partenaires/guy-hoquet.svg` (fichier introuvable sur disque)
- L430 — `images/partenaires/citya.svg` (fichier introuvable sur disque)
- L434 — `images/partenaires/ag-copro.svg` (fichier introuvable sur disque)
- L438 — `images/partenaires/fmb.svg` (fichier introuvable sur disque)

### `realisations.html` — 4
- L624 — `(empty)` (src vide)
- L1035 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L1036 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L1045 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 1
- L1211 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-calais.html` — 1
- L1211 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-dunkerque.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 1
- L1219 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-dunkerque.html` — 1
- L1147 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1155 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1196 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1204 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 1
- L1197 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 1
- L1226 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html 2.html` — 4
- L1249 — `'+r.image+'` (fichier introuvable sur disque)
- L1366 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1371 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1376 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (3) : L1335, L1462, L1476
- `realisation.html` (4) : L283, L284, L290, L355

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).