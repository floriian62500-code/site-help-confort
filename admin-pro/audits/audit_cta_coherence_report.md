# 🎯 Audit CTA cohérence URL — sonde #20

_Généré le 2026-05-27 07:07_

- Pages scannées : **82**
- CTA trouvés (toutes familles) : **65**
- Familles avec ≥ 1 occurrence : **3**
- Familles **divergentes** (alertes) : **2**

**Seuil** : 1 famille = 1 destination canonique attendue. Si > 1 → ALERTE.

## ❌ Familles divergentes

### Famille `devis` — 4 destinations

- **`contact.html`** — 57 occurrence(s)
  - `avant-apres.html` : « Demander un devis → » → `contact.html#form`
  - `blog.html` : « Demander un devis » → `contact.html`
  - `chauffagiste-boulogne-sur-mer.html` : « Demander un devis → » → `contact.html?metier=chauffage#form`
- **`tel:+33366100134`** — 2 occurrence(s)
  - `remplacement-chauffe-eau.html` : « Demander un devis 03 66 10 01 34 » → `tel:+33366100134`
  - `tarifs.html` : « 📞 Devis gratuit 03 66 10 01 34 » → `tel:+33366100134`
- **`[button-js]`** — 1 occurrence(s)
  - `contact.html` : « Recevoir mon devis gratuit » → `[button-js]`
- **`devis-express.html`** — 1 occurrence(s)
  - `plan-du-site.html` : « Devis express » → `devis-express.html`

### Famille `reserver` — 2 destinations

- **`index.html`** — 1 occurrence(s)
  - `entretien-chaudiere.html` : « Prendre rendez-vous » → `index.html?wizard=depannage&urg=chauffage#hc-reservation`
- **`contact.html`** — 1 occurrence(s)
  - `guide-entretien-chaudiere.html` : « Réserver mon entretien » → `contact.html?presta=entretien-chaudiere#form`

→ Décision Florian : harmoniser sur une URL canonique par famille.

---

## 📊 Stats par famille

### ⚠️ `devis` — 61 occurrence(s), 4 destination(s)
- `contact.html` × 57
- `tel:+33366100134` × 2
- `[button-js]` × 1
- `devis-express.html` × 1

### ✅ `estimation` — 2 occurrence(s), 1 destination(s)
- `tel:+33366100134` × 2

### ⚠️ `reserver` — 2 occurrence(s), 2 destination(s)
- `index.html` × 1
- `contact.html` × 1
