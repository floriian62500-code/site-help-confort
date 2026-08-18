# 🎯 Audit CTA cohérence URL — sonde #20

_Généré le 2026-08-18 03:46_

- Pages scannées : **116**
- CTA trouvés (toutes familles) : **120**
- Familles avec ≥ 1 occurrence : **3**
- Familles **divergentes** (alertes) : **2**

**Seuil** : 1 famille = 1 destination canonique attendue. Si > 1 → ALERTE.

## ❌ Familles divergentes

### Famille `devis` — 4 destinations

- **`contact.html`** — 109 occurrence(s)
  - `avant-apres.html` : « Demander un devis → » → `contact.html#form`
  - `blog.html` : « Demander un devis » → `contact.html`
  - `chauffagiste-coudekerque-branche.html` : « Devis gratuit » → `contact.html?presta=Chauffagiste&objet=Intervention Coudekerque-Branche#form`
- **`tel:+33366100134`** — 4 occurrence(s)
  - `blog-cout-renovation-salle-de-bain.html` : « Demander un devis » → `tel:+33366100134`
  - `blog-fenetres-double-vitrage-pvc-alu-bois.html` : « Demander un devis » → `tel:+33366100134`
  - `remplacement-chauffe-eau.html` : « Demander un devis 03 66 10 01 34 » → `tel:+33366100134`
- **`[button-js]`** — 1 occurrence(s)
  - `contact.html` : « Recevoir mon devis gratuit » → `[button-js]`
- **`devis-express.html`** — 1 occurrence(s)
  - `plan-du-site.html` : « Devis express » → `devis-express.html`

### Famille `reserver` — 3 destinations

- **`tel:+33366100134`** — 1 occurrence(s)
  - `blog-preparer-sa-maison-hiver-checklist.html` : « Réserver mon check-up » → `tel:+33366100134`
- **`index.html`** — 1 occurrence(s)
  - `entretien-chaudiere.html` : « Prendre rendez-vous » → `index.html?wizard=depannage&urg=chauffage#hc-reservation`
- **`contact.html`** — 1 occurrence(s)
  - `guide-entretien-chaudiere.html` : « Réserver mon entretien » → `contact.html?presta=entretien-chaudiere#form`

→ Décision Florian : harmoniser sur une URL canonique par famille.

---

## 📊 Stats par famille

### ⚠️ `devis` — 115 occurrence(s), 4 destination(s)
- `contact.html` × 109
- `tel:+33366100134` × 4
- `[button-js]` × 1
- `devis-express.html` × 1

### ✅ `estimation` — 2 occurrence(s), 1 destination(s)
- `tel:+33366100134` × 2

### ⚠️ `reserver` — 3 occurrence(s), 3 destination(s)
- `tel:+33366100134` × 1
- `index.html` × 1
- `contact.html` × 1
