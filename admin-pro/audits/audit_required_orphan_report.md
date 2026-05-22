# 🔎 Audit `required` / `pattern` hors `<form>` — sonde #25

_Généré le 2026-05-22 06:52_

- Pages scannées : **82**
- Pages avec orphelins : **1**
- Findings totaux : **7**

Règle : un `<input>` (ou `<textarea>`, `<select>`) qui porte 
`required` ou `pattern="..."` doit être à l'intérieur d'un 
`<form>...</form>` OU porter un attribut `form="id-du-form"`. 
Sinon, HTML5 n'applique aucune validation native → bug silencieux.

## ❌ Findings

### `index.html` (7)

- L 1044 — `<textarea>` `resa-desc` → required
- L 1073 — `<input>` `resa-prenom` → required
- L 1077 — `<input>` `resa-nom` → required
- L 1084 — `<input>` `resa-tel` → required, pattern='[0-9 +.\\-]{10,}'
- L 1088 — `<input>` `resa-email` → required
- L 1094 — `<input>` `resa-adresse` → required
- L 1104 — `<input>` `resa-cp` → required, pattern='[0-9]{5}'

→ Action : encapsuler dans `<form novalidate>...</form>` si la 
validation est gérée par JS (wizard), ou retirer `required` / 
`pattern` pour éviter le faux sentiment de sécurité.
