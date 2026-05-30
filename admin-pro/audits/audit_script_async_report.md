# Audit script async/defer — Rapport

_Généré le 2026-05-30 06:27_

## Synthèse

- Pages scannées : **139**
- Scripts externes total : **1185**
- Scripts render-blocking : **96**
- ✅ OK : **86**
- ❌ Erreurs (script bloquant dans `<head>`) : **0**
- ⚠️ Avertissements (script bloquant en fin de `<body>`) : **53**

## Findings

### `a-propos.html`
- ⚠️ L.968 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1212 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `actualites.html`
- ⚠️ L.1054 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `avant-apres.html`
- ⚠️ L.120 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `carrieres.html`
- ⚠️ L.888 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-boulogne-sur-mer.html`
- ⚠️ L.2144 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2387 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-calais.html`
- ⚠️ L.2144 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2387 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-dunkerque.html`
- ⚠️ L.2160 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2403 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-saint-omer.html`
- ⚠️ L.2167 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2410 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `contact.html`
- ⚠️ L.1061 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1319 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

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
- ⚠️ L.1032 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1278 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-dunkerque.html`
- ⚠️ L.1029 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1275 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-omer.html`
- ⚠️ L.1039 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1285 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-pol-sur-mer.html`
- ⚠️ L.1032 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1278 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-sangatte.html`
- ⚠️ L.1032 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1278 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-boulogne-sur-mer.html`
- ⚠️ L.1878 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2121 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-calais.html`
- ⚠️ L.1878 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2121 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-dunkerque.html`
- ⚠️ L.1882 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2125 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-saint-omer.html`
- ⚠️ L.1890 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2133 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `espace-client-dashboard.html`
- ⚠️ L.169 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `espace-client.html`
- ⚠️ L.491 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.853 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `index.html`
- ⚠️ L.2760 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2851 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `mentions-legales.html`
- ⚠️ L.711 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.955 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-dunkerque.html`
- ⚠️ L.2069 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2313 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-saint-omer.html`
- ⚠️ L.2078 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2322 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `nos-prestations.html`
- ⚠️ L.665 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `plombier-boulogne-sur-mer.html`
- ⚠️ L.2065 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2308 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-calais.html`
- ⚠️ L.2065 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2308 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-dunkerque.html`
- ⚠️ L.2065 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2308 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-saint-omer.html`
- ⚠️ L.2071 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2314 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-dunkerque.html`
- ⚠️ L.1789 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2033 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-saint-omer.html`
- ⚠️ L.1859 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2103 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pro.html`
- ⚠️ L.1097 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `realisation.html`
- ⚠️ L.198 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `realisations.html`
- ⚠️ L.891 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.1344 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `remplacement-chauffe-eau.html`
- ⚠️ L.761 (head) `script.js` — ajouter `defer` ou `async`

### `serrurier-boulogne-sur-mer.html`
- ⚠️ L.2019 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2262 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-calais.html`
- ⚠️ L.2019 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2262 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-dunkerque.html`
- ⚠️ L.2023 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2266 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-saint-omer.html`
- ⚠️ L.2030 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2273 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `sinistres.html`
- ⚠️ L.861 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `tarifs.html`
- ⚠️ L.767 (head) `script.js` — ajouter `defer` ou `async`

### `temoignages.html`
- ⚠️ L.140 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `travaux-dunkerque.html`
- ⚠️ L.1727 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1970 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `travaux-saint-omer.html`
- ⚠️ L.1736 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1979 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `urgence.html`
- ⚠️ L.710 (head) `script.js` — ajouter `defer` ou `async`

### `vitrier-dunkerque.html`
- ⚠️ L.1866 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2110 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `vitrier-saint-omer.html`
- ⚠️ L.1875 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2119 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-dunkerque.html`
- ⚠️ L.1886 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2130 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-saint-omer.html`
- ⚠️ L.1895 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2139 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `zones-intervention.html`
- ⚠️ L.801 (head) `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — ajouter `defer` ou `async`
- ⚠️ L.1575 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1819 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`
