# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-10-10 09:33_

- Pages scannées : **117**
- `<img>` avec width+height : **1476**
- Patchables (dimensions lues PIL) : **1**
- Externes (CDN/hot-link) : **3**
- Non-résolues (fichier absent) : **20**
- Dynamiques (template `${...}`) : **7**

## 🛠️ Patches proposés (dimensions lues PIL)

Pour chaque `<img>` ci-dessous, le patch est prêt à être appliqué
(décision masse → Florian).

### `espace-client-dashboard.html` — 1 patch(es)

**L94** (1080×1080px) — `logo-officiel.jpg`

```html
AVANT : <img src="logo-officiel.jpg" alt="HELP Confort">
APRÈS : <img width="1080" height="1080" src="logo-officiel.jpg" alt="HELP Confort">
```

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `volets-saint-omer.html` (3) : L999, L1028, L1038

## ❓ Sources non résolues

### `actualites.html` — 1
- L648 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L261 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L381 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 1
- L1642 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1476 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `fournisseur.html` — 1
- L254 — `' + esc(s.logo_url) + '` (fichier introuvable sur disque)

### `index.html` — 2
- L626 — `'+data.logo+'` (fichier introuvable sur disque)
- L738 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 1
- L1504 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `nos-prestations.html` — 2
- L861 — `' + src + '` (fichier introuvable sur disque)
- L1399 — `' + u + '` (fichier introuvable sur disque)

### `partenaire.html` — 1
- L195 — `' + esc(p.logo_url) + '` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 1
- L1537 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `realisations.html` — 4
- L359 — `(empty)` (src vide)
- L770 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L771 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L780 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 1
- L1475 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1407 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1459 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (3) : L1367, L1494, L1508
- `realisation.html` (4) : L350, L351, L357, L422

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).