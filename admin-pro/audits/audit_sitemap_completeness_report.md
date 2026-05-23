# Audit Sitemap completeness — Rapport

Généré le : `2026-05-23T06:15:54`

Source de vérité : `sitemap.xml` (`<urlset>`) + `*.html` à la racine du repo.

## Synthèse

- Pages HTML racine sur disque : **82**
- URLs dans sitemap.xml : **146**
- Dont pages racine (`/X.html` ou `/`) : **77**
- ⚠️ Pages absentes du sitemap : **5**
- ❌ URLs sitemap orphelines (fichier introuvable) : **0**
- ℹ️ `<lastmod>` dans le futur : **0**

## ⚠️ MISSING_IN_SITEMAP

Ces pages HTML existent sur disque mais sont absentes du sitemap.
Correction : ajouter une `<url>` dans `sitemap.xml`.

- `googlef09a1887914c5a23.html`
- `notre-equipe 2.html`
- `notre-equipe.html`
- `realisation.html`
- `reseau-help-confort.html`

---

Pages exclues de l'audit (légitimement absentes du sitemap) : `404.html`, `reset.html`, `test.html`.