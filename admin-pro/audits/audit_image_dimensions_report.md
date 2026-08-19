# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-08-19 03:48_

- Pages scannées : **116**
- `<img>` avec width+height : **1378**
- Patchables (dimensions lues PIL) : **1**
- Externes (CDN/hot-link) : **3**
- Non-résolues (fichier absent) : **49**
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

- `volets-saint-omer.html` (3) : L1110, L1139, L1149

## ❓ Sources non résolues

### `actualites.html` — 1
- L762 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L192 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L423 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 1
- L1401 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-calais.html` — 1
- L1401 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-dunkerque.html` — 1
- L1403 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 2
- L1485 — `'+r.image+'` (fichier introuvable sur disque)
- L1812 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `contrats-entretien.html` — 1
- L1850 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1200 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1200 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1201 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 2
- L1284 — `'+r.image+'` (fichier introuvable sur disque)
- L1609 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `fournisseur.html` — 1
- L187 — `' + esc(s.logo_url) + '` (fichier introuvable sur disque)

### `index.html` — 4
- L782 — `'+data.logo+'` (fichier introuvable sur disque)
- L894 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1466 — `'+a.image+'` (fichier introuvable sur disque)
- L1555 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 1
- L1229 — `'+r.image+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 2
- L1312 — `'+r.image+'` (fichier introuvable sur disque)
- L1636 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `nos-prestations.html` — 2
- L941 — `' + src + '` (fichier introuvable sur disque)
- L1470 — `' + u + '` (fichier introuvable sur disque)

### `partenaire.html` — 1
- L126 — `' + esc(p.logo_url) + '` (fichier introuvable sur disque)

### `plombier-boulogne-sur-mer.html` — 1
- L1234 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-calais.html` — 1
- L1234 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-dunkerque.html` — 1
- L1236 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 2
- L1341 — `'+r.image+'` (fichier introuvable sur disque)
- L1669 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `pmr-dunkerque.html` — 1
- L1208 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1277 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L472 — `(empty)` (src vide)
- L883 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L884 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L893 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 1
- L1199 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-calais.html` — 1
- L1199 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-dunkerque.html` — 1
- L1201 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 2
- L1283 — `'+r.image+'` (fichier introuvable sur disque)
- L1608 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `travaux-dunkerque.html` — 1
- L1135 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 2
- L1219 — `'+r.image+'` (fichier introuvable sur disque)
- L1548 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1184 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 2
- L1267 — `'+r.image+'` (fichier introuvable sur disque)
- L1591 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 1
- L1185 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 1
- L1214 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (3) : L1438, L1565, L1579
- `realisation.html` (4) : L282, L283, L289, L354

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).