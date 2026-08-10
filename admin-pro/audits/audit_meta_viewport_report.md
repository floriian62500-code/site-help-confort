# Audit meta viewport — Rapport

_Généré le 2026-08-10 04:40_

## Synthèse

- Pages scannées : **137**
- ✅ OK (`width=device-width, initial-scale=1`) : **136**
- ⚠️  Warnings (zoom bloqué ou initial-scale absent) : **0**
- ❌ Erreurs (viewport absent ou cassé) : **1**
- Findings totaux : **1**
  - Erreurs : 1
  - Avertissements : 0

## Règles

- `width=device-width, initial-scale=1` → OK
- viewport absent ou pas de `width=device-width` → ERREUR
- `user-scalable=no` ou `maximum-scale=1` → WARN (anti-accessibilité)
- `initial-scale` absent → WARN (recommandé)

## Findings

### `googlef09a1887914c5a23.html`  (content=None)
- ❌ VIEWPORT-MISSING : aucune balise `<meta name="viewport">` détectée
