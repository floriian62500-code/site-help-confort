# Audit script async/defer — Rapport

_Généré le 2026-06-01 08:38_

## Synthèse

- Pages scannées : **140**
- Scripts externes total : **1192**
- Scripts render-blocking : **98**
- ✅ OK : **86**
- ❌ Erreurs (script bloquant dans `<head>`) : **0**
- ⚠️ Avertissements (script bloquant en fin de `<body>`) : **54**

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
- ⚠️ L.1981 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2224 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-calais.html`
- ⚠️ L.1981 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2224 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-dunkerque.html`
- ⚠️ L.1986 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2229 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `chauffagiste-saint-omer.html`
- ⚠️ L.1992 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2235 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `contact.html`
- ⚠️ L.1058 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1316 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `contrats-entretien.html`
- ⚠️ L.907 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1578 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.1880 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-boulogne-sur-mer.html`
- ⚠️ L.1049 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1295 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-calais.html`
- ⚠️ L.1049 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1295 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-coquelles.html`
- ⚠️ L.1033 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1279 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-dunkerque.html`
- ⚠️ L.1026 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1272 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-omer.html`
- ⚠️ L.1036 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1282 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-saint-pol-sur-mer.html`
- ⚠️ L.1033 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1279 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `depannage-sangatte.html`
- ⚠️ L.1033 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1279 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-boulogne-sur-mer.html`
- ⚠️ L.1779 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2022 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-calais.html`
- ⚠️ L.1779 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2022 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-dunkerque.html`
- ⚠️ L.1781 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2024 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `electricien-saint-omer.html`
- ⚠️ L.1788 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2031 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `espace-client-dashboard.html`
- ⚠️ L.170 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `espace-client.html`
- ⚠️ L.492 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.854 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `index.html`
- ⚠️ L.2775 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2866 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `mentions-legales.html`
- ⚠️ L.711 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.955 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-dunkerque.html`
- ⚠️ L.1811 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2055 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `menuisier-saint-omer.html`
- ⚠️ L.1819 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2063 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `nos-prestations.html`
- ⚠️ L.665 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `plombier-boulogne-sur-mer.html`
- ⚠️ L.1822 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2065 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-calais.html`
- ⚠️ L.1822 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2065 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-dunkerque.html`
- ⚠️ L.1824 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2067 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `plombier-saint-omer.html`
- ⚠️ L.1830 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2073 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-dunkerque.html`
- ⚠️ L.1788 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2032 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pmr-saint-omer.html`
- ⚠️ L.1857 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2101 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `pro.html`
- ⚠️ L.1069 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `realisation.html`
- ⚠️ L.199 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `realisations.html`
- ⚠️ L.921 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`
- ⚠️ L.1374 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `remplacement-chauffe-eau.html`
- ⚠️ L.768 (head) `script.js` — ajouter `defer` ou `async`

### `serrurier-boulogne-sur-mer.html`
- ⚠️ L.1778 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2021 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-calais.html`
- ⚠️ L.1778 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2021 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-dunkerque.html`
- ⚠️ L.1781 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2024 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `serrurier-saint-omer.html`
- ⚠️ L.1787 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2030 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `sinistres.html`
- ⚠️ L.858 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `tarifs.html`
- ⚠️ L.749 (head) `script.js` — ajouter `defer` ou `async`

### `temoignages.html`
- ⚠️ L.141 (head) `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` — ajouter `defer` ou `async`

### `travaux-dunkerque.html`
- ⚠️ L.1719 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1962 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `travaux-saint-omer.html`
- ⚠️ L.1727 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1970 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `urgence.html`
- ⚠️ L.717 (head) `script.js` — ajouter `defer` ou `async`

### `vitrier-dunkerque.html`
- ⚠️ L.1767 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2011 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `vitrier-saint-omer.html`
- ⚠️ L.1775 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2019 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-dunkerque.html`
- ⚠️ L.1768 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2012 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-saint-omer.html`
- ⚠️ L.1797 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2041 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `volets-saint-omer.html 2.html`
- ⚠️ L.1999 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.2243 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`

### `zones-intervention.html`
- ⚠️ L.802 (head) `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — ajouter `defer` ou `async`
- ⚠️ L.1336 (head) `script.js` — ajouter `defer` ou `async`
- ⚠️ L.1580 (head) `assets/hc-leads-capture.js` — ajouter `defer` ou `async`
