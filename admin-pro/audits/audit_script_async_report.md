# Audit script async/defer — Rapport

_Généré le 2026-06-29 08:16_

## Synthèse

- Pages scannées : **137**
- Scripts externes total : **1366**
- Scripts render-blocking : **96**
- ✅ OK : **84**
- ❌ Erreurs (script bloquant dans `<head>`) : **0**
- ⚠️ Avertissements (script bloquant en fin de `<body>`) : **53**

## Findings

### `a-propos.html`
- ⚠️ L.957 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1201 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `actualites.html`
- ⚠️ L.1054 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `avant-apres.html`
- ⚠️ L.121 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `carrieres.html`
- ⚠️ L.889 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-boulogne-sur-mer.html`
- ⚠️ L.1976 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2219 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-calais.html`
- ⚠️ L.1976 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2219 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-dunkerque.html`
- ⚠️ L.1980 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2223 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-saint-omer.html`
- ⚠️ L.1986 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2229 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `contact.html`
- ⚠️ L.1069 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1327 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `contrats-entretien.html`
- ⚠️ L.907 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1578 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.1880 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-boulogne-sur-mer.html`
- ⚠️ L.1052 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1298 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-calais.html`
- ⚠️ L.1052 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1298 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-coquelles.html`
- ⚠️ L.1036 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1282 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-dunkerque.html`
- ⚠️ L.1028 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1274 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-omer.html`
- ⚠️ L.1038 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1284 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-pol-sur-mer.html`
- ⚠️ L.1036 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1282 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-sangatte.html`
- ⚠️ L.1036 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1282 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-boulogne-sur-mer.html`
- ⚠️ L.1774 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2017 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-calais.html`
- ⚠️ L.1774 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2017 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-dunkerque.html`
- ⚠️ L.1776 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2019 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-saint-omer.html`
- ⚠️ L.1783 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2026 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `espace-client-dashboard.html`
- ⚠️ L.170 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `espace-client.html`
- ⚠️ L.492 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.854 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `index.html`
- ⚠️ L.2776 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2867 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `mentions-legales.html`
- ⚠️ L.711 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.955 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-dunkerque.html`
- ⚠️ L.1806 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2050 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-saint-omer.html`
- ⚠️ L.1814 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2058 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `nos-prestations.html`
- ⚠️ L.668 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `plombier-boulogne-sur-mer.html`
- ⚠️ L.1816 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2059 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-calais.html`
- ⚠️ L.1816 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2059 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-dunkerque.html`
- ⚠️ L.1818 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2061 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-saint-omer.html`
- ⚠️ L.1824 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2067 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-dunkerque.html`
- ⚠️ L.1791 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2035 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-saint-omer.html`
- ⚠️ L.1860 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2104 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pro.html`
- ⚠️ L.1006 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `realisation.html`
- ⚠️ L.199 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `realisations.html`
- ⚠️ L.921 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.1374 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `remplacement-chauffe-eau.html`
- ⚠️ L.768 (head) `script.js` — ajouter `defer` ou `async`

### `serrurier-boulogne-sur-mer.html`
- ⚠️ L.1773 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2016 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-calais.html`
- ⚠️ L.1773 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2016 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-dunkerque.html`
- ⚠️ L.1776 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2019 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-saint-omer.html`
- ⚠️ L.1782 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2025 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `sinistres.html`
- ⚠️ L.858 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `tarifs.html`
- ⚠️ L.749 (head) `script.js` — ajouter `defer` ou `async`

### `temoignages.html`
- ⚠️ L.141 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `travaux-dunkerque.html`
- ⚠️ L.1714 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1957 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `travaux-saint-omer.html`
- ⚠️ L.1722 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1965 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `urgence.html`
- ⚠️ L.717 (head) `script.js` — ajouter `defer` ou `async`

### `vitrier-dunkerque.html`
- ⚠️ L.1762 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2006 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `vitrier-saint-omer.html`
- ⚠️ L.1770 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2014 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-dunkerque.html`
- ⚠️ L.1763 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2007 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-saint-omer.html`
- ⚠️ L.1792 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2036 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `zones-intervention.html`
- ⚠️ L.802 (head) `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — ajouter `defer` ou `async`
- ⚠️ L.1336 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1580 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`
