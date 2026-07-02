# 🛡️ Audit CSP whitelist — Sonde IA #41

*Généré le 2026-07-02 06:42 — `admin-pro/audits/audit_csp.py`*

**Pages scannées** : 118
**Hosts externes distincts détectés** : 6
**Directives CSP parsées** : base-uri, connect-src, default-src, font-src, form-action, frame-ancestors, frame-src, img-src, script-src, style-src, upgrade-insecure-requests
**Alertes CSP block** : **0**

## 📋 Directives CSP actives (extrait netlify.toml)

- **script-src** → 'self', 'unsafe-eval', 'unsafe-inline', https://cdn.jsdelivr.net, https://connect.facebook.net, https://unpkg.com, https://www.google-analytics.com, https://www.googletagmanager.com
- **style-src** → 'self', 'unsafe-inline', https://fonts.googleapis.com, https://unpkg.com
- **img-src** → 'self', blob:, data:, https:, https://scontent-cdg2-1.xx.fbcdn.net, https://scontent.xx.fbcdn.net
- **connect-src** → 'self', https://*.fbcdn.net, https://*.googleapis.com, https://*.supabase.co, https://*.tile.openstreetmap.org, https://api-adresse.data.gouv.fr, https://api.anthropic.com, https://googleapis.com, https://graph.facebook.com, https://www.google-analytics.com
- **frame-src** → https://www.facebook.com, https://www.google.com, https://www.google.com/maps/, https://www.youtube.com
- **font-src** → 'self', data:, https://fonts.gstatic.com
- **default-src** → 'self'

## 🚨 Alertes (host non whitelisté)

✅ Aucune alerte — tous les hosts utilisés sont whitelistés.

## 📊 Hosts par directive

### script-src
- ✅ `cdn.jsdelivr.net` — 8 page(s)
- ✅ `connect.facebook.net` — 1 page(s)
- ✅ `unpkg.com` — 1 page(s)

### style-src
- ✅ `fonts.googleapis.com` — 115 page(s)
- ✅ `unpkg.com` — 1 page(s)

### img-src
- ✅ `btcbjwqiivhpwoszomhg.supabase.co` — 9 page(s)

### connect-src
- ✅ `btcbjwqiivhpwoszomhg.supabase.co` — 31 page(s)

### frame-src
- ✅ `www.google.com` — 1 page(s)

## 🛠️ Procédure de correction

Pour chaque host marqué ❌ :
1. Vérifier qu'il est légitime (intentionnel + à jour).
2. Ajouter le host à la directive CSP correspondante dans `netlify.toml`.
3. Re-deployer Netlify, puis ré-exécuter ce script.

*Sonde IA #41 — référence MEMOIRE_IA_MAINTENANCE.md addendum v9.*
