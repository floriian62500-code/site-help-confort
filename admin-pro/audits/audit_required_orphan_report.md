# 🔎 Audit `required` / `pattern` hors `<form>` — sonde #25

_Généré le 2026-08-18 03:46_

- Pages scannées : **116**
- Pages avec orphelins : **1**
- Findings totaux : **8**

Règle : un `<input>` (ou `<textarea>`, `<select>`) qui porte 
`required` ou `pattern="..."` doit être à l'intérieur d'un 
`<form>...</form>` OU porter un attribut `form="id-du-form"`. 
Sinon, HTML5 n'applique aucune validation native → bug silencieux.

## ❌ Findings

### `index.html` (8)

- L 1122 — `<textarea>` `resa-desc` → required
- L 1152 — `<input>` `resa-prenom` → required
- L 1156 — `<input>` `resa-nom` → required
- L 1163 — `<input>` `resa-tel` → required, pattern='[0-9 +.\\-]{10,}'
- L 1167 — `<input>` `resa-email` → required
- L 1173 — `<input>` `resa-adresse` → required
- L 1182 — `<input>` `resa-ville` → required
- L 1188 — `<input>` `resa-cp` → required, pattern='[0-9]{5}'

→ Action : encapsuler dans `<form novalidate>...</form>` si la 
validation est gérée par JS (wizard), ou retirer `required` / 
`pattern` pour éviter le faux sentiment de sécurité.
