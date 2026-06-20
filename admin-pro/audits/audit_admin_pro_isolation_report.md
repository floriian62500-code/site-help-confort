# Audit admin-pro isolation — Rapport

_Généré le 2026-06-20 07:03_

## Synthèse

- Pages publiques scannées : **137**
- Pages avec fuite admin-pro : **1**
- Total fuites détectées : **1**
- Whitelist : `admin-pro/index.html, admin/index.html`

## ❌ Fuites détectées

Ces pages publiques référencent en clair une URL `admin-pro/...html` (ou `admin/...html` hors whitelist). Recommandation : retirer le lien — l'admin doit rester accessible uniquement via URL connue + login.

### `nos-prestations.html` — 1 fuite(s)

- Ligne 979 → `admin-pro/services.html`  
  `admin-pro/services.html`
