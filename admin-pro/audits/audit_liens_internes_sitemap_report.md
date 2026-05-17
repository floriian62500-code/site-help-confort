# Audit liens internes vs sitemap.xml — 2026-05-17 06:24

Sonde #61 : croise les `href` locaux `.html` avec `sitemap.xml` et le disque.

- **Pages scannées** : 44
- **Liens internes uniques (par page)** : 1233
- **URLs dans sitemap.xml** : 82
- **🚨 Liens cassés (BROKEN)** : 0 (0 cibles uniques)
- **🟠 Liens orphelins (ORPHAN — absents du sitemap)** : 48 (9 cibles uniques)

## ✅ Aucun lien interne cassé

## 🟠 Pages existantes mais absentes du sitemap.xml

Ces fichiers existent et sont liés depuis le site, mais Google ne les
découvrira pas via le sitemap. À ajouter à `sitemap.xml` ou à exclure
explicitement (whitelist du script si page technique/noindex).

| Cible | Pointée par |
|-------|-------------|
| `partenaires.html` | 40× — `a-propos.html`, `actualites.html`, `aides.html`, `avant-apres.html`, `blog.html` … (+35) |
| `prestations/depannage-electrique.html` | 1× — `electricien-saint-omer.html` |
| `prestations/luminaire.html` | 1× — `electricien-saint-omer.html` |
| `prestations/debouchage.html` | 1× — `plombier-saint-omer.html` |
| `prestations/chauffe-eau.html` | 1× — `plombier-saint-omer.html` |
| `prestations/sanitaire.html` | 1× — `plombier-saint-omer.html` |
| `prestations/reseaux-plomberie.html` | 1× — `plombier-saint-omer.html` |
| `prestations/porte-fermee-cle.html` | 1× — `serrurier-saint-omer.html` |
| `prestations/volet-roulant.html` | 1× — `volets-saint-omer.html` |

## Notes

- URLs externes (http/https/mailto/tel/javascript/data) ignorées.
- Whitelist ORPHAN (jamais indexées) : `404.html`, `realisation.html`, `reset.html`.
- Whitelist préfixes ORPHAN : `admin/`, `admin-pro/`.
- Page `realisation.html` est une page de détail dynamique — les URLs
  canoniques sont les sous-pages `actualites/YYYY-MM-DD-*.html`.
