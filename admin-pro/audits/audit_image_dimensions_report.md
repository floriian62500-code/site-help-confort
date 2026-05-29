# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-29 06:58_

- Pages scannées : **82**
- `<img>` avec width+height : **1290**
- Patchables (dimensions lues PIL) : **0**
- Externes (CDN/hot-link) : **0**
- Non-résolues (fichier absent) : **50**
- Dynamiques (template `${...}`) : **5**

## ❓ Sources non résolues

### `actualites.html` — 1
- L760 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L151 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L424 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 1
- L1415 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-calais.html` — 1
- L1415 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-dunkerque.html` — 1
- L1415 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 1
- L1422 — `'+r.image+'` (fichier introuvable sur disque)

### `contrats-entretien.html` — 1
- L2078 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1221 — `'+r.image+'` (fichier introuvable sur disque)

### `index.html` — 4
- L731 — `'+data.logo+'` (fichier introuvable sur disque)
- L843 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1362 — `'+a.image+'` (fichier introuvable sur disque)
- L1451 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 1
- L1241 — `'+r.image+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 1
- L1250 — `'+r.image+'` (fichier introuvable sur disque)

### `nos-prestations.html` — 1
- L851 — `' + src + '` (fichier introuvable sur disque)

### `plombier-boulogne-sur-mer.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-calais.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-dunkerque.html` — 1
- L1248 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 1
- L1254 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-dunkerque.html` — 1
- L1220 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1290 — `'+r.image+'` (fichier introuvable sur disque)

### `pro.html` — 10
- L401 — `images/partenaires/homeserve.svg` (fichier introuvable sur disque)
- L405 — `images/partenaires/la-poste.svg` (fichier introuvable sur disque)
- L409 — `images/partenaires/dynaren.svg` (fichier introuvable sur disque)
- L413 — `images/partenaires/viaren.svg` (fichier introuvable sur disque)
- L417 — `images/partenaires/groupe-ima.svg` (fichier introuvable sur disque)
- L421 — `images/partenaires/domus.svg` (fichier introuvable sur disque)
- L425 — `images/partenaires/guy-hoquet.svg` (fichier introuvable sur disque)
- L429 — `images/partenaires/citya.svg` (fichier introuvable sur disque)
- L433 — `images/partenaires/ag-copro.svg` (fichier introuvable sur disque)
- L437 — `images/partenaires/fmb.svg` (fichier introuvable sur disque)

### `realisations.html` — 4
- L608 — `(empty)` (src vide)
- L1017 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L1018 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L1027 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-calais.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-dunkerque.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 1
- L1220 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-dunkerque.html` — 1
- L1147 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1156 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1196 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1205 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 1
- L1197 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 1
- L1206 — `'+r.image+'` (fichier introuvable sur disque)

### `zones-intervention.html` — 1
- L1216 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (1) : L1460
- `realisation.html` (4) : L282, L283, L289, L354

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).