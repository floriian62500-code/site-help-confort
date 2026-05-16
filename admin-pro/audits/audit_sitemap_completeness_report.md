# Audit Sitemap completeness — Rapport

Généré le : `2026-05-16T05:56:20`

Source de vérité : `sitemap.xml` (`<urlset>`) + `*.html` à la racine du repo.

## Synthèse

- Pages HTML racine sur disque : **38**
- URLs dans sitemap.xml : **54**
- Dont pages racine (`/X.html` ou `/`) : **37**
- ⚠️ Pages absentes du sitemap : **1**
- ❌ URLs sitemap orphelines (fichier introuvable) : **0**
- ℹ️ `<lastmod>` dans le futur : **0**

## ⚠️ MISSING_IN_SITEMAP

Ces pages HTML existent sur disque mais sont absentes du sitemap.
Correction : ajouter une `<url>` dans `sitemap.xml`.

- `realisation.html`

---

Pages exclues de l'audit (légitimement absentes du sitemap) : `404.html`, `reset.html`, `test.html`.