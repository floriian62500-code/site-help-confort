# Audit lang attribute — Rapport

_Généré le 2026-08-31 09:27_

## Synthèse

- Pages scannées : **137**
- ✅ OK (`fr` ou `fr-FR`) : **136**
- ⚠️  Warnings (variantes `fr-XX`) : **0**
- ❌ Erreurs (lang manquant ou ≠ fr) : **1**
- Findings totaux : **1**
  - Erreurs : 1
  - Avertissements : 0

## Règles

- `<html lang="fr">` ou `<html lang="fr-FR">` → OK
- `<html lang="fr-XX">` (autres régions FR) → WARN
- lang absent, vide, ou ne commençant pas par `fr` → ERREUR

## Findings

### `googlef09a1887914c5a23.html`  (lang=None)
- ❌ HTML-TAG-MISSING : aucune balise `<html>` détectée
