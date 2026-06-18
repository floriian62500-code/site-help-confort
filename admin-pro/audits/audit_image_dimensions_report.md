# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-06-18 08:10_

- Pages scannées : **116**
- `<img>` avec width+height : **1460**
- Patchables (dimensions lues PIL) : **1**
- Externes (CDN/hot-link) : **3**
- Non-résolues (fichier absent) : **42**
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

- `volets-saint-omer.html` (3) : L1112, L1141, L1151

## ❓ Sources non résolues

### `actualites.html` — 1
- L764 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L192 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L425 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 1
- L1406 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-calais.html` — 1
- L1406 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-dunkerque.html` — 1
- L1408 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 1
- L1414 — `'+r.image+'` (fichier introuvable sur disque)

### `contrats-entretien.html` — 1
- L2082 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1205 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1205 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1206 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `fournisseur.html` — 1
- L136 — `' + esc(s.logo_url) + '` (fichier introuvable sur disque)

### `index.html` — 4
- L733 — `'+data.logo+'` (fichier introuvable sur disque)
- L845 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1386 — `'+a.image+'` (fichier introuvable sur disque)
- L1475 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 1
- L1234 — `'+r.image+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 1
- L1242 — `'+r.image+'` (fichier introuvable sur disque)

### `nos-prestations.html` — 2
- L918 — `' + src + '` (fichier introuvable sur disque)
- L1447 — `' + u + '` (fichier introuvable sur disque)

### `partenaire.html` — 1
- L110 — `' + esc(p.logo_url) + '` (fichier introuvable sur disque)

### `plombier-boulogne-sur-mer.html` — 1
- L1239 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-calais.html` — 1
- L1239 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-dunkerque.html` — 1
- L1241 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 1
- L1247 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-dunkerque.html` — 1
- L1213 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1282 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L624 — `(empty)` (src vide)
- L1035 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L1036 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L1045 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 1
- L1204 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-calais.html` — 1
- L1204 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-dunkerque.html` — 1
- L1206 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 1
- L1212 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-dunkerque.html` — 1
- L1140 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1148 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1189 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1197 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 1
- L1190 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 1
- L1219 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (3) : L1415, L1542, L1556
- `realisation.html` (4) : L283, L284, L290, L355

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).