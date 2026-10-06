# PR #24 — mesures (reproducteur `mesures.mjs`)

Généré le 2026-10-04T07:20:21.179Z

## PR #24 (preview) — `f16d1749a76851af452f285c98f68afac9ab04e1`
URL : https://deploy-preview-24--remarkable-dragon-364e2b.netlify.app

- cache-bust `assets/hc-map-zones.js?v=20261003a` : `zones-intervention.html` 200 **conforme** · `contact.html` 200 **conforme** · `a-propos.html` 200 **conforme** · `nos-villes.html` 200 **conforme**

### 1440 px
- débordement : scrollWidth **1440** vs innerWidth **1440** → **0** px
- **carte, sans aucun défilement** (scrollY 0 puis 0) : Leaflet chargé · conteneur posé à **317 ms** · 1re tuile peinte à **419 ms** · 8 tuiles à **423 ms** · une fois posée : **12 tuiles**, couverture **100 %**, tuiles en erreur 0 · grise : **non** · cadre {"g":767,"d":1298,"h":545,"haut":560}
- pôles attendus présents : **4/4** — « Saint-Omer & Audomarois » (Agence Dépan'Audo) · « Dunkerque & Littoral » (Pôle d'intervention) · « Calais & Calaisis » (Pôle d'intervention) · « Boulogne-sur-Mer & Boulonnais » (Pôle d'intervention)
- revendication « Deux agences » : **non** · header présent (35 liens) · footer présent
- **contact.html** : avant défilement → 0 conteneur(s), 0 tuile(s) (**paresseux respecté**) · après défilement → 1 conteneur(s), 12 tuile(s)
- erreurs console imputables au site : **aucune** _(écartées, tiroir de preview : 2)_

### 390 px
- débordement : scrollWidth **390** vs innerWidth **390** → **0** px
- **carte, sans aucun défilement** (scrollY 0 puis 0) : Leaflet chargé · conteneur posé à **868 ms** · 1re tuile peinte à **910 ms** · 8 tuiles à **— ms** · une fois posée : **6 tuiles**, couverture **100 %**, tuiles en erreur 0 · grise : **non** · cadre {"g":42,"d":348,"h":1251,"haut":560}
- pôles attendus présents : **4/4** — « Saint-Omer & Audomarois » (Agence Dépan'Audo) · « Dunkerque & Littoral » (Pôle d'intervention) · « Calais & Calaisis » (Pôle d'intervention) · « Boulogne-sur-Mer & Boulonnais » (Pôle d'intervention)
- revendication « Deux agences » : **non** · header présent (35 liens) · footer présent
- **contact.html** : avant défilement → 0 conteneur(s), 0 tuile(s) (**paresseux respecté**) · après défilement → 1 conteneur(s), 2 tuile(s)
- erreurs console imputables au site : **aucune** _(écartées, tiroir de preview : 2)_

## main courant (production, référence avant) — `dc9b39eb7e9ee9edd73684d324fee7aa5911016d`
URL : https://remarkable-dragon-364e2b.netlify.app

- cache-bust `assets/hc-map-zones.js?v=20261003a` : `zones-intervention.html` 200 → hc-map-zones.js?v=20260603 · `contact.html` 200 → hc-map-zones.js?v=20260603 · `a-propos.html` 200 → hc-map-zones.js?v=20260603 · `nos-villes.html` 200 → hc-map-zones.js?v=20260603

### 1440 px
- débordement : scrollWidth **1440** vs innerWidth **1440** → **0** px
- **carte, sans aucun défilement** (scrollY 0 puis 0) : Leaflet chargé · conteneur posé à **1051 ms** · 1re tuile peinte à **1101 ms** · 8 tuiles à **1118 ms** · une fois posée : **12 tuiles**, couverture **100 %**, tuiles en erreur 0 · grise : **non** · cadre {"g":767,"d":1298,"h":545,"haut":560}
- pôles attendus présents : **1/4** — « Saint-Omer & Audomarois » (Dépan'Audo) · « Dunkerque & littoral » (Dépan'DK)
- revendication « Deux agences » : **OUI** · header présent (35 liens) · footer présent
- **contact.html** : avant défilement → 0 conteneur(s), 0 tuile(s) (**paresseux respecté**) · après défilement → 1 conteneur(s), 12 tuile(s)
- erreurs console imputables au site : **aucune** _(écartées, tiroir de preview : 0)_

### 390 px
- débordement : scrollWidth **390** vs innerWidth **390** → **0** px
- **carte, sans aucun défilement** (scrollY 0 puis 0) : Leaflet chargé · conteneur posé à **603 ms** · 1re tuile peinte à **648 ms** · 8 tuiles à **— ms** · une fois posée : **6 tuiles**, couverture **100 %**, tuiles en erreur 0 · grise : **non** · cadre {"g":42,"d":348,"h":1251,"haut":560}
- pôles attendus présents : **1/4** — « Saint-Omer & Audomarois » (Dépan'Audo) · « Dunkerque & littoral » (Dépan'DK)
- revendication « Deux agences » : **OUI** · header présent (35 liens) · footer présent
- **contact.html** : avant défilement → 0 conteneur(s), 0 tuile(s) (**paresseux respecté**) · après défilement → 1 conteneur(s), 2 tuile(s)
- erreurs console imputables au site : **aucune** _(écartées, tiroir de preview : 0)_

## Empreintes des captures produites par ce script

- `main-prod-1440-carte.jpg` — sha256 `f90a2992e7ed2760` — 66 Ko
- `main-prod-1440-zones-4poles.jpg` — sha256 `f7af271d0850d977` — 88 Ko
- `main-prod-390-carte.jpg` — sha256 `234f511823f0e5c5` — 69 Ko
- `main-prod-390-zones-4poles.jpg` — sha256 `84a21fd8008583ea` — 77 Ko
- `pr24-preview-1440-carte.jpg` — sha256 `aab810241f464dc5` — 61 Ko
- `pr24-preview-1440-zones-4poles.jpg` — sha256 `cb3ab3c38f3b6258` — 143 Ko
- `pr24-preview-390-carte.jpg` — sha256 `7f92fed65e109444` — 70 Ko
- `pr24-preview-390-zones-4poles.jpg` — sha256 `a0d293c919b20cc0` — 117 Ko
