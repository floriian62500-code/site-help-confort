# Audit liens internes vs sitemap.xml — 2026-05-18 06:58

Sonde #61 : croise les `href` locaux `.html` avec `sitemap.xml` et le disque.

- **Pages scannées** : 77
- **Liens internes uniques (par page)** : 2197
- **URLs dans sitemap.xml** : 144
- **🚨 Liens cassés (BROKEN)** : 0 (0 cibles uniques)
- **🟠 Liens orphelins (ORPHAN — absents du sitemap)** : 0 (0 cibles uniques)

## ✅ Aucun lien interne cassé

## ✅ Aucun lien orphelin (toutes les pages liées sont dans le sitemap)

## Notes

- URLs externes (http/https/mailto/tel/javascript/data) ignorées.
- Whitelist ORPHAN (jamais indexées) : `404.html`, `realisation.html`, `reset.html`.
- Whitelist préfixes ORPHAN : `admin/`, `admin-pro/`.
- Page `realisation.html` est une page de détail dynamique — les URLs
  canoniques sont les sous-pages `actualites/YYYY-MM-DD-*.html`.
