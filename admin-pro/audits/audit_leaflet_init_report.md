# Audit Leaflet map init — 2026-05-27 07:07

- **Pages scannées** : 83
- **Pages avec init Leaflet (`L.map(` / `new L.Map(`)** : 1
- **Pages avec garde anti-tuiles-grises** : 1
- **Alertes (init sans garde)** : 0

> Un conteneur Leaflet avec `aspect-ratio`, `display:none` initial, onglet caché ou layout retardé rend des tuiles grises tant que `map.invalidateSize()` n'est pas explicitement appelé après le calcul du layout. Gardes acceptées : `setTimeout`, `window.addEventListener('load')`, `ResizeObserver`, `IntersectionObserver`, `requestAnimationFrame`.

## ✅ Aucune alerte

## Détail (toutes pages Leaflet)

- ✅ `zones-intervention.html` — 1 init, invalidateSize=oui, gardes=2
