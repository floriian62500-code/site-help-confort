# 🔎 Audit `required` / `pattern` hors `<form>` — sonde #25

_Généré le 2026-10-09 10:12_

- Pages scannées : **117**
- Pages avec orphelins : **0**
- Findings totaux : **0**

Règle : un `<input>` (ou `<textarea>`, `<select>`) qui porte 
`required` ou `pattern="..."` doit être à l'intérieur d'un 
`<form>...</form>` OU porter un attribut `form="id-du-form"`. 
Sinon, HTML5 n'applique aucune validation native → bug silencieux.

## ✅ Aucun input orphelin avec `required` / `pattern`
