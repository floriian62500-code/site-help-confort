# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-10-07 09:58_

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

**L94** (1080×1080px) — `logo-officiel.jpg`

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
- L194 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L425 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 1
- L1403 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-calais.html` — 1
- L1403 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-dunkerque.html` — 1
- L1405 — `'+r.image+'` (fichier introuvable sur disque)

### `chauffagiste-saint-omer.html` — 2
- L1385 — `'+r.image+'` (fichier introuvable sur disque)
- L1712 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `contrats-entretien.html` — 1
- L1895 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1202 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1202 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1203 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 2
- L1286 — `'+r.image+'` (fichier introuvable sur disque)
- L1611 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `fournisseur.html` — 1
- L189 — `' + esc(s.logo_url) + '` (fichier introuvable sur disque)

### `index.html` — 4
- L784 — `'+data.logo+'` (fichier introuvable sur disque)
- L896 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1468 — `'+a.image+'` (fichier introuvable sur disque)
- L1557 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 1
- L1231 — `'+r.image+'` (fichier introuvable sur disque)

### `menuisier-saint-omer.html` — 2
- L1314 — `'+r.image+'` (fichier introuvable sur disque)
- L1638 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `nos-prestations.html` — 2
- L943 — `' + src + '` (fichier introuvable sur disque)
- L1479 — `' + u + '` (fichier introuvable sur disque)

### `partenaire.html` — 1
- L128 — `' + esc(p.logo_url) + '` (fichier introuvable sur disque)

### `plombier-boulogne-sur-mer.html` — 1
- L1236 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-calais.html` — 1
- L1236 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-dunkerque.html` — 1
- L1238 — `'+r.image+'` (fichier introuvable sur disque)

### `plombier-saint-omer.html` — 2
- L1343 — `'+r.image+'` (fichier introuvable sur disque)
- L1671 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `pmr-dunkerque.html` — 1
- L1210 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1279 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L474 — `(empty)` (src vide)
- L885 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L886 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L895 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 1
- L1201 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-calais.html` — 1
- L1201 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-dunkerque.html` — 1
- L1203 — `'+r.image+'` (fichier introuvable sur disque)

### `serrurier-saint-omer.html` — 2
- L1285 — `'+r.image+'` (fichier introuvable sur disque)
- L1610 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `travaux-dunkerque.html` — 1
- L1137 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 2
- L1221 — `'+r.image+'` (fichier introuvable sur disque)
- L1550 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1186 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 2
- L1269 — `'+r.image+'` (fichier introuvable sur disque)
- L1593 — `' + escapeHtml(s.logo_url) + '` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 1
- L1187 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-saint-omer.html` — 1
- L1216 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `nos-prestations.html` (3) : L1447, L1574, L1588
- `realisation.html` (4) : L284, L285, L291, L356

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).