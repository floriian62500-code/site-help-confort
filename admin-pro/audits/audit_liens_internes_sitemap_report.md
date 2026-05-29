# Audit liens internes vs sitemap.xml — 2026-05-29 06:56

Sonde #61 : croise les `href` locaux `.html` avec `sitemap.xml` et le disque.

- **Pages scannées** : 83
- **Liens internes uniques (par page)** : 2535
- **URLs dans sitemap.xml** : 146
- **🚨 Liens cassés (BROKEN)** : 0 (0 cibles uniques)
- **🟠 Liens orphelins (ORPHAN — absents du sitemap)** : 162 (3 cibles uniques)

## ✅ Aucun lien interne cassé

## 🟠 Pages existantes mais absentes du sitemap.xml

Ces fichiers existent et sont liés depuis le site, mais Google ne les
découvrira pas via le sitemap. À ajouter à `sitemap.xml` ou à exclure
explicitement (whitelist du script si page technique/noindex).

| Cible | Pointée par |
|-------|-------------|
| `notre-equipe.html` | 81× — `a-propos.html`, `actualites.html`, `agence-dunkerque.html`, `agence-saint-omer.html`, `aides.html` … (+76) |
| `reseau-help-confort.html` | 79× — `404.html`, `a-propos.html`, `actualites.html`, `agence-dunkerque.html`, `agence-saint-omer.html` … (+74) |
| `prestations/salle-de-bain-pmr.html` | 2× — `pmr-dunkerque.html`, `pmr-saint-omer.html` |

## Notes

- URLs externes (http/https/mailto/tel/javascript/data) ignorées.
- Whitelist ORPHAN (jamais indexées) : `404.html`, `realisation.html`, `reset.html`.
- Whitelist préfixes ORPHAN : `admin/`, `admin-pro/`.
- Page `realisation.html` est une page de détail dynamique — les URLs
  canoniques sont les sous-pages `actualites/YYYY-MM-DD-*.html`.
