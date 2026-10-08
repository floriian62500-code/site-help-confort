# 📐 Audit CLS prevention (img width/height) — sonde #56

_Généré le 2026-10-08 10:10_

- Pages scannées : **117**
- `<img>` total : **1512**
- `<img>` avec width+height : **1480**
- `<img>` **sans dimensions** (alertes CLS) : **32**
- Pages avec au moins 1 alerte : **19**

Taux de couverture dimensions : **97.9%**

## ⚠️ Pages avec `<img>` sans width/height

### `actualites.html` — 1 `<img>` à corriger

- L648 (width+height manquant) — `'+a.image+'`

### `avant-apres.html` — 1 `<img>` à corriger

- L261 (width+height manquant) — `' + src + '`

### `blog.html` — 1 `<img>` à corriger

- L381 (width+height manquant) — `'+a.image+'`

### `chauffagiste-saint-omer.html` — 1 `<img>` à corriger

- L1642 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `contrats-entretien.html` — 1 `<img>` à corriger

- L1780 (width+height manquant) — `' + p.data + '`

### `electricien-saint-omer.html` — 1 `<img>` à corriger

- L1476 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `espace-client-dashboard.html` — 1 `<img>` à corriger

- L94 (width+height manquant) — `logo-officiel.jpg`

### `fournisseur.html` — 1 `<img>` à corriger

- L254 (width+height manquant) — `' + esc(s.logo_url) + '`

### `index.html` — 2 `<img>` à corriger

- L626 (width+height manquant) — `'+data.logo+'`
- L738 (width+height manquant) — `' + escapeHtml(a.logo) + '`

### `menuisier-saint-omer.html` — 1 `<img>` à corriger

- L1504 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `nos-prestations.html` — 5 `<img>` à corriger

- L861 (width+height manquant) — `' + src + '`
- L1367 (width+height manquant) — `${imgUrl}`
- L1399 (width+height manquant) — `' + u + '`
- L1494 (width+height manquant) — `${svc.image_url || 'https://btcbjwqiivhpwoszomhg.supabase.co/storage/v1/object/p`
- L1508 (width+height manquant) — `${variantPhoto}`

### `partenaire.html` — 1 `<img>` à corriger

- L195 (width+height manquant) — `' + esc(p.logo_url) + '`

### `plombier-saint-omer.html` — 1 `<img>` à corriger

- L1537 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `realisation.html` — 4 `<img>` à corriger

- L350 (width+height manquant) — `${r.image_before}`
- L351 (width+height manquant) — `${r.image_after}`
- L357 (width+height manquant) — `${photo}`
- L422 (width+height manquant) — `${p}`

### `realisations.html` — 4 `<img>` à corriger

- L359 (width+height manquant) — `(no src)`
- L770 (width+height manquant) — `'+r.photo_apres+'`
- L771 (width+height manquant) — `'+r.photo_avant+'`
- L780 (width+height manquant) — `'+r.photo_apres+'`

### `serrurier-saint-omer.html` — 1 `<img>` à corriger

- L1475 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `travaux-saint-omer.html` — 1 `<img>` à corriger

- L1407 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `vitrier-saint-omer.html` — 1 `<img>` à corriger

- L1459 (width+height manquant) — `' + escapeHtml(s.logo_url) + '`

### `volets-saint-omer.html` — 3 `<img>` à corriger

- L999 (width+height manquant) — `https://btcbjwqiivhpwoszomhg.supabase.co/storage/v1/object/public/site-photos/vo`
- L1028 (width+height manquant) — `https://btcbjwqiivhpwoszomhg.supabase.co/storage/v1/object/public/site-photos/vo`
- L1038 (width+height manquant) — `https://btcbjwqiivhpwoszomhg.supabase.co/storage/v1/object/public/site-photos/vo`

---

Recommandation : pour chaque `<img>` flaggué, lire les vraies dimensions du fichier (PIL) et ajouter `width="X" height="Y"`.