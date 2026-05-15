# 🤖 Audit robots.txt + sitemap.xml — P10

*Généré le 2026-05-15 13:49 — `admin-pro/audits/audit_robots.py`*

**Findings totaux** : 1 (0 critical, 0 high, 1 med, 0 low)
**Vérifications OK** : 5
**Vérifications skipped** : 2

## ✅ Vérifications réussies

- ✅ robots.txt présent
- ✅ User-agent: * présent
- ✅ 14 pages publiques principales autorisées
- ✅ Sitemap référencé dans robots.txt : 1
- ✅ sitemap.xml présent + bien formé (54 URLs)
- ⏭️ /robots.txt test HTTP prod : SKIPPED (no network: URLError: <urlopen error Tunnel connection failed: 403 Forbi)
- ⏭️ /sitemap.xml test HTTP prod : SKIPPED (no network: URLError: <urlopen error Tunnel connection failed: 403 Forbi)

## 🚨 Findings

- 🟡 **MED** : 2 page(s) racine absente(s) du sitemap
  - `realisation.html`
  - `reset.html`

## 📋 robots.txt (extrait)

```
User-agent: *
Allow: /

# Bloquer le back-office et zones admin
Disallow: /admin/
Disallow: /admin-pro/

# Bloquer la documentation interne et les outils
Disallow: /docs/
Disallow: /tools/
Disallow: /scripts/
Disallow: /logs/

# Bloquer les sources de données et fichiers techniques
Disallow: /*.json$
Disallow: /*.md$
Disallow: /*.command$
Disallow: /*.sh$
Disallow: /*.docx$
Disallow: /*.pdf$
Disallow: /content/
Disallow: /supabase/
Disallow: /assets/

# Bloquer template de réalisation (rendu dynamique côté client)
Disallow: /realisation.html
Disallow: /realisation.html?*

# Bloquer fichiers ca
…(tronqué)
```

## 🌍 Tests HTTP prod

- `/robots.txt` → status 0 content-type ``
- `/sitemap.xml` → status 0 content-type ``

## 🛠️ Procédure

1. Si robots.txt absent → créer fichier racine standard.
2. Si pages publiques bloquées → corriger les `Disallow` trop larges.
3. Si sitemap absent → générer via script.
4. Si content-type sitemap KO → ajouter override headers dans `netlify.toml`.

*Item P10 — `AGENT_TODO.md`.*
