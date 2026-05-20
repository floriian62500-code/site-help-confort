# 📐 Audit dimensions images (PIL) — extension CLS prevention

_Généré le 2026-05-20 06:52_

- Pages scannées : **80**
- `<img>` avec width+height : **1018**
- Patchables (dimensions lues PIL) : **48**
- Externes (CDN/hot-link) : **196**
- Non-résolues (fichier absent) : **238**
- Dynamiques (template `${...}`) : **4**

## 🛠️ Patches proposés (dimensions lues PIL)

Pour chaque `<img>` ci-dessous, le patch est prêt à être appliqué
(décision masse → Florian).

### `menuisier-dunkerque.html` — 8 patch(es)

**L1102** (900×900px) — `images/prestations/porte-entree.jpg`

```html
AVANT : <img src="images/prestations/porte-entree.jpg" alt="Porte d\'entrée Finstral" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="900" src="images/prestations/porte-entree.jpg" alt="Porte d\'entrée Finstral" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1111** (1377×699px) — `images/prestations/porte-garage.jpg`

```html
AVANT : <img src="images/prestations/porte-garage.jpg" alt="Porte de garage motorisée Soprofen" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1377" height="699" src="images/prestations/porte-garage.jpg" alt="Porte de garage motorisée Soprofen" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1120** (800×600px) — `images/prestations/portail-cloture.jpg`

```html
AVANT : <img src="images/prestations/portail-cloture.jpg" alt="Portail & clôture aluminium" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="800" height="600" src="images/prestations/portail-cloture.jpg" alt="Portail & clôture aluminium" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1129** (1400×843px) — `images/prestations/fenetres-bois-alu-pvc.jpg`

```html
AVANT : <img src="images/prestations/fenetres-bois-alu-pvc.jpg" alt="Fenêtres bois alu PVC Groupe Millet" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="843" src="images/prestations/fenetres-bois-alu-pvc.jpg" alt="Fenêtres bois alu PVC Groupe Millet" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1138** (1400×972px) — `images/prestations/coulissant-baie-vitree.jpg`

```html
AVANT : <img src="images/prestations/coulissant-baie-vitree.jpg" alt="Coulissant et baie vitrée sur mesure" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="972" src="images/prestations/coulissant-baie-vitree.jpg" alt="Coulissant et baie vitrée sur mesure" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1147** (1400×1101px) — `images/prestations/garde-corps-rampes.jpg`

```html
AVANT : <img src="images/prestations/garde-corps-rampes.jpg" alt="Garde-corps et rampes" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="1101" src="images/prestations/garde-corps-rampes.jpg" alt="Garde-corps et rampes" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1156** (900×769px) — `images/prestations/remplacement-panneau-porte.jpg`

```html
AVANT : <img src="images/prestations/remplacement-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="769" src="images/prestations/remplacement-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1165** (480×640px) — `images/prestations/parquet.jpg`

```html
AVANT : <img src="images/prestations/parquet.jpg" alt="Parquet pose chevron" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="480" height="640" src="images/prestations/parquet.jpg" alt="Parquet pose chevron" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `menuisier-saint-omer.html` — 8 patch(es)

**L1111** (900×900px) — `images/prestations/porte-entree.jpg`

```html
AVANT : <img src="images/prestations/porte-entree.jpg" alt="Porte d\'entrée Finstral" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="900" src="images/prestations/porte-entree.jpg" alt="Porte d\'entrée Finstral" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1120** (1377×699px) — `images/prestations/porte-garage.jpg`

```html
AVANT : <img src="images/prestations/porte-garage.jpg" alt="Porte de garage motorisée Soprofen" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1377" height="699" src="images/prestations/porte-garage.jpg" alt="Porte de garage motorisée Soprofen" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1129** (800×600px) — `images/prestations/portail-cloture.jpg`

```html
AVANT : <img src="images/prestations/portail-cloture.jpg" alt="Portail & clôture aluminium" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="800" height="600" src="images/prestations/portail-cloture.jpg" alt="Portail & clôture aluminium" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1138** (1400×843px) — `images/prestations/fenetres-bois-alu-pvc.jpg`

```html
AVANT : <img src="images/prestations/fenetres-bois-alu-pvc.jpg" alt="Fenêtres bois alu PVC Groupe Millet" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="843" src="images/prestations/fenetres-bois-alu-pvc.jpg" alt="Fenêtres bois alu PVC Groupe Millet" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1147** (1400×972px) — `images/prestations/coulissant-baie-vitree.jpg`

```html
AVANT : <img src="images/prestations/coulissant-baie-vitree.jpg" alt="Coulissant et baie vitrée sur mesure" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="972" src="images/prestations/coulissant-baie-vitree.jpg" alt="Coulissant et baie vitrée sur mesure" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1156** (1400×1101px) — `images/prestations/garde-corps-rampes.jpg`

```html
AVANT : <img src="images/prestations/garde-corps-rampes.jpg" alt="Garde-corps et rampes" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1400" height="1101" src="images/prestations/garde-corps-rampes.jpg" alt="Garde-corps et rampes" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1165** (900×769px) — `images/prestations/remplacement-panneau-porte.jpg`

```html
AVANT : <img src="images/prestations/remplacement-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="769" src="images/prestations/remplacement-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1174** (480×640px) — `images/prestations/parquet.jpg`

```html
AVANT : <img src="images/prestations/parquet.jpg" alt="Parquet pose chevron" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="480" height="640" src="images/prestations/parquet.jpg" alt="Parquet pose chevron" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `plombier-boulogne-sur-mer.html` — 6 patch(es)

**L1127** (1300×941px) — `images/prestations/recherche-fuite.jpg`

```html
AVANT : <img src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1300" height="941" src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1136** (700×470px) — `images/prestations/debouchage.jpg`

```html
AVANT : <img src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="700" height="470" src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1145** (540×410px) — `images/prestations/chauffe-eau.jpg`

```html
AVANT : <img src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="540" height="410" src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1154** (760×760px) — `images/prestations/sanitaire.jpg`

```html
AVANT : <img src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1163** (1040×730px) — `images/prestations/salle-de-bain.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1172** (750×422px) — `images/prestations/reseaux-plomberie.jpg`

```html
AVANT : <img src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="750" height="422" src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `plombier-calais.html` — 6 patch(es)

**L1127** (1300×941px) — `images/prestations/recherche-fuite.jpg`

```html
AVANT : <img src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1300" height="941" src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1136** (700×470px) — `images/prestations/debouchage.jpg`

```html
AVANT : <img src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="700" height="470" src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1145** (540×410px) — `images/prestations/chauffe-eau.jpg`

```html
AVANT : <img src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="540" height="410" src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1154** (760×760px) — `images/prestations/sanitaire.jpg`

```html
AVANT : <img src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1163** (1040×730px) — `images/prestations/salle-de-bain.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1172** (750×422px) — `images/prestations/reseaux-plomberie.jpg`

```html
AVANT : <img src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="750" height="422" src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `plombier-dunkerque.html` — 6 patch(es)

**L1127** (1300×941px) — `images/prestations/recherche-fuite.jpg`

```html
AVANT : <img src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1300" height="941" src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1136** (700×470px) — `images/prestations/debouchage.jpg`

```html
AVANT : <img src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="700" height="470" src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1145** (540×410px) — `images/prestations/chauffe-eau.jpg`

```html
AVANT : <img src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="540" height="410" src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1154** (760×760px) — `images/prestations/sanitaire.jpg`

```html
AVANT : <img src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1163** (1040×730px) — `images/prestations/salle-de-bain.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1172** (750×422px) — `images/prestations/reseaux-plomberie.jpg`

```html
AVANT : <img src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="750" height="422" src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `plombier-saint-omer.html` — 6 patch(es)

**L1133** (1300×941px) — `images/prestations/recherche-fuite.jpg`

```html
AVANT : <img src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1300" height="941" src="images/prestations/recherche-fuite.jpg" alt="Recherche de fuite — caméra Milwaukee" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1142** (700×470px) — `images/prestations/debouchage.jpg`

```html
AVANT : <img src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="700" height="470" src="images/prestations/debouchage.jpg" alt="Débouchage canalisation — furet professionnel" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1151** (540×410px) — `images/prestations/chauffe-eau.jpg`

```html
AVANT : <img src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="540" height="410" src="images/prestations/chauffe-eau.jpg" alt="Chauffe-eau Atlantic — pose et remplacement" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1160** (760×760px) — `images/prestations/sanitaire.jpg`

```html
AVANT : <img src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/sanitaire.jpg" alt="Sanitaire WC suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1169** (1040×730px) — `images/prestations/salle-de-bain.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain.jpg" alt="Rénovation salle de bain Delpha" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1178** (750×422px) — `images/prestations/reseaux-plomberie.jpg`

```html
AVANT : <img src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="750" height="422" src="images/prestations/reseaux-plomberie.jpg" alt="Réseaux plomberie Geberit Duofix" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `pmr-dunkerque.html` — 3 patch(es)

**L1126** (400×400px) — `images/prestations/barres-appui.jpg`

```html
AVANT : <img src="images/prestations/barres-appui.jpg" alt="Barres d'appui PMR" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="400" height="400" src="images/prestations/barres-appui.jpg" alt="Barres d'appui PMR" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1135** (760×760px) — `images/prestations/wc-pmr.jpg`

```html
AVANT : <img src="images/prestations/wc-pmr.jpg" alt="WC PMR rehaussé suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/wc-pmr.jpg" alt="WC PMR rehaussé suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1144** (1040×730px) — `images/prestations/salle-de-bain-pmr.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain-pmr.jpg" alt="Salle de bain PMR adaptée" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain-pmr.jpg" alt="Salle de bain PMR adaptée" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `pmr-saint-omer.html` — 3 patch(es)

**L1196** (400×400px) — `images/prestations/barres-appui.jpg`

```html
AVANT : <img src="images/prestations/barres-appui.jpg" alt="Barres d'appui PMR" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="400" height="400" src="images/prestations/barres-appui.jpg" alt="Barres d'appui PMR" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1205** (760×760px) — `images/prestations/wc-pmr.jpg`

```html
AVANT : <img src="images/prestations/wc-pmr.jpg" alt="WC PMR rehaussé suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="760" height="760" src="images/prestations/wc-pmr.jpg" alt="WC PMR rehaussé suspendu" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

**L1214** (1040×730px) — `images/prestations/salle-de-bain-pmr.jpg`

```html
AVANT : <img src="images/prestations/salle-de-bain-pmr.jpg" alt="Salle de bain PMR adaptée" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="1040" height="730" src="images/prestations/salle-de-bain-pmr.jpg" alt="Salle de bain PMR adaptée" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `vitrier-dunkerque.html` — 1 patch(es)

**L1129** (900×769px) — `images/prestations/vitrerie-panneau-porte.jpg`

```html
AVANT : <img src="images/prestations/vitrerie-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="769" src="images/prestations/vitrerie-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

### `vitrier-saint-omer.html` — 1 patch(es)

**L1138** (900×769px) — `images/prestations/vitrerie-panneau-porte.jpg`

```html
AVANT : <img src="images/prestations/vitrerie-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
APRÈS : <img width="900" height="769" src="images/prestations/vitrerie-panneau-porte.jpg" alt="Remplacement panneau de porte" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
```

## 🌐 Images externes (à patcher manuellement)

Source externe (CDN, hot-link) — PIL ne peut pas les lire sans accès réseau.
Recommandation : rapatrier en local (cf. `audit_hotlink_cdn.py`) puis re-runner.

- `chauffagiste-boulogne-sur-mer.html` (6) : L1622, L1652, L1662, L1692, L1722, L1732
- `chauffagiste-calais.html` (6) : L1622, L1652, L1662, L1692, L1722, L1732
- `chauffagiste-dunkerque.html` (6) : L1622, L1652, L1662, L1692, L1722, L1732
- `chauffagiste-saint-omer.html` (6) : L1629, L1659, L1669, L1699, L1729, L1739
- `electricien-boulogne-sur-mer.html` (8) : L1408, L1418, L1428, L1438, L1448, L1458, L1468, L1478
- `electricien-calais.html` (8) : L1408, L1418, L1428, L1438, L1448, L1458, L1468, L1478
- `electricien-dunkerque.html` (8) : L1408, L1418, L1428, L1438, L1448, L1458, L1468, L1478
- `electricien-saint-omer.html` (8) : L1416, L1426, L1436, L1446, L1456, L1466, L1476, L1486
- `menuisier-dunkerque.html` (14) : L1410, L1420, L1460, L1480, L1500, L1510, L1520, L1530, L1540, L1580
- `menuisier-saint-omer.html` (14) : L1419, L1429, L1469, L1489, L1509, L1519, L1529, L1539, L1549, L1589
- `partenaires.html` (20) : L325, L385, L403, L409, L427, L433, L457, L463, L469, L487
- `plombier-boulogne-sur-mer.html` (4) : L1457, L1467, L1567, L1577
- `plombier-calais.html` (4) : L1457, L1467, L1567, L1577
- `plombier-dunkerque.html` (4) : L1457, L1467, L1567, L1577
- `plombier-saint-omer.html` (4) : L1463, L1473, L1573, L1583
- `serrurier-boulogne-sur-mer.html` (12) : L1419, L1429, L1439, L1469, L1479, L1499, L1529, L1539, L1549, L1579
- `serrurier-calais.html` (12) : L1419, L1429, L1439, L1469, L1479, L1499, L1529, L1539, L1549, L1579
- `serrurier-dunkerque.html` (12) : L1419, L1429, L1439, L1469, L1479, L1499, L1529, L1539, L1549, L1579
- `serrurier-saint-omer.html` (12) : L1426, L1436, L1446, L1476, L1486, L1506, L1536, L1546, L1556, L1586
- `vitrier-dunkerque.html` (8) : L1383, L1393, L1403, L1413, L1423, L1433, L1443, L1453
- `vitrier-saint-omer.html` (8) : L1392, L1402, L1412, L1422, L1432, L1442, L1452, L1462
- `volets-dunkerque.html` (6) : L1386, L1396, L1406, L1436, L1446, L1456
- `volets-saint-omer.html` (6) : L1395, L1405, L1415, L1445, L1455, L1465

## ❓ Sources non résolues

### `actualites.html` — 1
- L755 — `'+a.image+'` (fichier introuvable sur disque)

### `avant-apres.html` — 1
- L151 — `' + src + '` (fichier introuvable sur disque)

### `blog.html` — 1
- L421 — `'+a.image+'` (fichier introuvable sur disque)

### `chauffagiste-boulogne-sur-mer.html` — 9
- L1475 — `'+r.image+'` (fichier introuvable sur disque)
- L1602 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1612 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1632 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1642 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1672 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1682 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1702 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1712 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-calais.html` — 9
- L1475 — `'+r.image+'` (fichier introuvable sur disque)
- L1602 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1612 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1632 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1642 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1672 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1682 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1702 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1712 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-dunkerque.html` — 9
- L1475 — `'+r.image+'` (fichier introuvable sur disque)
- L1602 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1612 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1632 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1642 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1672 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1682 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1702 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1712 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `chauffagiste-saint-omer.html` — 9
- L1482 — `'+r.image+'` (fichier introuvable sur disque)
- L1609 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1619 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1639 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1649 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)
- L1679 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)
- L1689 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1709 — `images/marques/frisquet.svg` (PIL n'a pas pu lire les dimensions)
- L1719 — `images/marques/chappee.svg` (PIL n'a pas pu lire les dimensions)

### `contrats-entretien.html` — 1
- L2073 — `' + p.data + '` (fichier introuvable sur disque)

### `electricien-boulogne-sur-mer.html` — 1
- L1281 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-calais.html` — 1
- L1281 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-dunkerque.html` — 1
- L1281 — `'+r.image+'` (fichier introuvable sur disque)

### `electricien-saint-omer.html` — 1
- L1289 — `'+r.image+'` (fichier introuvable sur disque)

### `index.html` — 4
- L729 — `'+data.logo+'` (fichier introuvable sur disque)
- L841 — `' + escapeHtml(a.logo) + '` (fichier introuvable sur disque)
- L1360 — `'+a.image+'` (fichier introuvable sur disque)
- L1449 — `'+p.dataUrl+'` (fichier introuvable sur disque)

### `menuisier-dunkerque.html` — 11
- L1283 — `'+r.image+'` (fichier introuvable sur disque)
- L1430 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1440 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1450 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1470 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)
- L1490 — `images/marques/meister.svg` (PIL n'a pas pu lire les dimensions)
- L1550 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1560 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1570 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1590 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)

### `menuisier-saint-omer.html` — 11
- L1292 — `'+r.image+'` (fichier introuvable sur disque)
- L1439 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1449 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1459 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1479 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)
- L1499 — `images/marques/meister.svg` (PIL n'a pas pu lire les dimensions)
- L1559 — `images/marques/kostum.svg` (PIL n'a pas pu lire les dimensions)
- L1569 — `images/marques/jeldwen.svg` (PIL n'a pas pu lire les dimensions)
- L1579 — `images/marques/roziere.svg` (PIL n'a pas pu lire les dimensions)
- L1599 — `images/marques/parador.svg` (PIL n'a pas pu lire les dimensions)

### `nos-prestations.html` — 1
- L752 — `' + src + '` (fichier introuvable sur disque)

### `partenaires.html` — 25
- L301 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L307 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L313 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L319 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L331 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L337 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L343 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L349 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L355 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)
- L373 — `images/marques/finimetal.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-boulogne-sur-mer.html` — 19
- L1290 — `'+r.image+'` (fichier introuvable sur disque)
- L1417 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1427 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1437 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1447 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1477 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1487 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1497 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1507 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1517 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-calais.html` — 19
- L1290 — `'+r.image+'` (fichier introuvable sur disque)
- L1417 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1427 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1437 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1447 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1477 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1487 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1497 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1507 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1517 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-dunkerque.html` — 19
- L1290 — `'+r.image+'` (fichier introuvable sur disque)
- L1417 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1427 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1437 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1447 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1477 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1487 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1497 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1507 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1517 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `plombier-saint-omer.html` — 19
- L1296 — `'+r.image+'` (fichier introuvable sur disque)
- L1423 — `images/marques/logo-atlantic.svg` (PIL n'a pas pu lire les dimensions)
- L1433 — `images/marques/Hansgrohe-Logo-2.svg` (PIL n'a pas pu lire les dimensions)
- L1443 — `images/marques/geberit.svg` (PIL n'a pas pu lire les dimensions)
- L1453 — `images/marques/siamp.svg` (PIL n'a pas pu lire les dimensions)
- L1483 — `images/marques/logo-ramon-soler-azul.svg` (PIL n'a pas pu lire les dimensions)
- L1493 — `images/marques/hsk.svg` (PIL n'a pas pu lire les dimensions)
- L1503 — `images/marques/quare-design.svg` (PIL n'a pas pu lire les dimensions)
- L1513 — `images/marques/kinedo.svg` (PIL n'a pas pu lire les dimensions)
- L1523 — `images/marques/akw.svg` (PIL n'a pas pu lire les dimensions)

### `pmr-dunkerque.html` — 1
- L1253 — `'+r.image+'` (fichier introuvable sur disque)

### `pmr-saint-omer.html` — 1
- L1323 — `'+r.image+'` (fichier introuvable sur disque)

### `realisations.html` — 4
- L608 — `(empty)` (src vide)
- L1007 — `'+r.photo_apres+'` (fichier introuvable sur disque)
- L1008 — `'+r.photo_avant+'` (fichier introuvable sur disque)
- L1017 — `'+r.photo_apres+'` (fichier introuvable sur disque)

### `serrurier-boulogne-sur-mer.html` — 11
- L1282 — `'+r.image+'` (fichier introuvable sur disque)
- L1409 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1449 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1459 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1489 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1509 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1519 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1559 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1569 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1599 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-calais.html` — 11
- L1282 — `'+r.image+'` (fichier introuvable sur disque)
- L1409 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1449 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1459 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1489 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1509 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1519 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1559 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1569 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1599 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-dunkerque.html` — 11
- L1282 — `'+r.image+'` (fichier introuvable sur disque)
- L1409 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1449 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1459 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1489 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1509 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1519 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1559 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1569 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1599 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `serrurier-saint-omer.html` — 11
- L1289 — `'+r.image+'` (fichier introuvable sur disque)
- L1416 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1456 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1466 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1496 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)
- L1516 — `images/marques/schueco.svg` (PIL n'a pas pu lire les dimensions)
- L1526 — `images/marques/trenois.svg` (PIL n'a pas pu lire les dimensions)
- L1566 — `images/marques/maco.svg` (PIL n'a pas pu lire les dimensions)
- L1576 — `images/marques/ferco.svg` (PIL n'a pas pu lire les dimensions)
- L1606 — `images/marques/siegenia.svg` (PIL n'a pas pu lire les dimensions)

### `travaux-dunkerque.html` — 1
- L1255 — `'+r.image+'` (fichier introuvable sur disque)

### `travaux-saint-omer.html` — 1
- L1264 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-dunkerque.html` — 1
- L1256 — `'+r.image+'` (fichier introuvable sur disque)

### `vitrier-saint-omer.html` — 1
- L1265 — `'+r.image+'` (fichier introuvable sur disque)

### `volets-dunkerque.html` — 5
- L1239 — `'+r.image+'` (fichier introuvable sur disque)
- L1366 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1376 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)
- L1416 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1426 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)

### `volets-saint-omer.html` — 5
- L1248 — `'+r.image+'` (fichier introuvable sur disque)
- L1375 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1385 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)
- L1425 — `images/marques/somfy.svg` (PIL n'a pas pu lire les dimensions)
- L1435 — `images/marques/bubendorff.svg` (PIL n'a pas pu lire les dimensions)

### `zones-intervention.html` — 2
- L1208 — `images/picto-chauffage.svg` (PIL n'a pas pu lire les dimensions)
- L1336 — `'+r.image+'` (fichier introuvable sur disque)

## 🔁 Sources dynamiques (template JS)

Ces `<img>` reçoivent leur `src` via interpolation JS — dimensions doivent
être ajoutées soit en dur dans le template, soit calculées via `onload`.

- `realisation.html` (4) : L278, L279, L285, L350

---

Source : extension de `audit_cls_prevention.py` (sonde #56 MEMOIRE).