# 🤖 Audit robots.txt + sitemap.xml — P10

*Généré le 2026-07-27 06:33 — `admin-pro/audits/audit_robots.py`*

**Findings totaux** : 1 (0 critical, 0 high, 1 med, 0 low)
**Vérifications OK** : 8
**Vérifications skipped** : 0

## ✅ Vérifications réussies

- ✅ robots.txt présent
- ✅ User-agent: * présent
- ✅ 14 pages publiques principales autorisées
- ✅ Sitemap référencé dans robots.txt : 4
- ✅ sitemap.xml présent + bien formé (190 URLs)
- ✅ /robots.txt → HTTP 200 en prod
- ✅ /sitemap.xml → HTTP 200 en prod
- ✅ sitemap.xml content-type OK (application/xml; charset=utf-8)

## 🚨 Findings

- 🟡 **MED** : 37 page(s) racine absente(s) du sitemap
  - `blog-comment-detecter-fuite-eau-cachee.html`
  - `blog-cout-renovation-salle-de-bain.html`
  - `blog-debouchage-canalisation-furet-hydrocurage.html`
  - `blog-entretien-chaudiere-annuel-obligatoire.html`
  - `blog-fenetres-double-vitrage-pvc-alu-bois.html`
  - `blog-isolation-combles-aides-2026.html`
  - `blog-panne-electrique-disjoncteur-saute.html`
  - `blog-pmr-adapter-salle-de-bain-senior.html`
  - `blog-pompe-a-chaleur-air-eau-tout-savoir.html`
  - `blog-porte-claquee-cle-perdue-que-faire.html`

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
# /assets/ AUTORISÉ : Google a besoin du JS/CSS pour rendre correctement la page
# (sans ça, le rendu serait jugé "mobile-unfriendly" + risque de cloaking)
Allow: /
…(tronqué)
```

## 🌍 Tests HTTP prod

- `/robots.txt` → status 200 content-type `text/plain; charset=utf-8`
- `/sitemap.xml` → status 200 content-type `application/xml; charset=utf-8`

## 🛠️ Procédure

1. Si robots.txt absent → créer fichier racine standard.
2. Si pages publiques bloquées → corriger les `Disallow` trop larges.
3. Si sitemap absent → générer via script.
4. Si content-type sitemap KO → ajouter override headers dans `netlify.toml`.

*Item P10 — `AGENT_TODO.md`.*
