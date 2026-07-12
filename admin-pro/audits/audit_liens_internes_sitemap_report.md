# Audit liens internes vs sitemap.xml — 2026-07-12 06:05

Sonde #61 : croise les `href` locaux `.html` avec `sitemap.xml` et le disque.

- **Pages scannées** : 117
- **Liens internes uniques (par page)** : 3446
- **URLs dans sitemap.xml** : 190
- **🚨 Liens cassés (BROKEN)** : 1 (1 cibles uniques)
- **🟠 Liens orphelins (ORPHAN — absents du sitemap)** : 259 (9 cibles uniques)

## 🚨 Cibles introuvables sur le disque

| Cible | Pointée par |
|-------|-------------|
| `${METIER_PAGE}.html` | 1× — `fournisseur.html` |

## 🟠 Pages existantes mais absentes du sitemap.xml

Ces fichiers existent et sont liés depuis le site, mais Google ne les
découvrira pas via le sitemap. À ajouter à `sitemap.xml` ou à exclure
explicitement (whitelist du script si page technique/noindex).

| Cible | Pointée par |
|-------|-------------|
| `reseau-help-confort.html` | 98× — `404.html`, `a-propos.html`, `actualites.html`, `agence-dunkerque.html`, `agence-saint-omer.html` … (+93) |
| `notre-equipe.html` | 98× — `a-propos.html`, `actualites.html`, `agence-dunkerque.html`, `agence-saint-omer.html`, `aides.html` … (+93) |
| `garanties.html` | 13× — `blog-comment-detecter-fuite-eau-cachee.html`, `blog-cout-renovation-salle-de-bain.html`, `blog-debouchage-canalisation-furet-hydrocurage.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`, `blog-fenetres-double-vitrage-pvc-alu-bois.html` … (+8) |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 11× — `blog-comment-detecter-fuite-eau-cachee.html`, `blog-cout-renovation-salle-de-bain.html`, `blog-debouchage-canalisation-furet-hydrocurage.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`, `blog-fenetres-double-vitrage-pvc-alu-bois.html` … (+6) |
| `blog-pmr-adapter-salle-de-bain-senior.html` | 11× — `blog-comment-detecter-fuite-eau-cachee.html`, `blog-cout-renovation-salle-de-bain.html`, `blog-debouchage-canalisation-furet-hydrocurage.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`, `blog-fenetres-double-vitrage-pvc-alu-bois.html` … (+6) |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 11× — `blog-comment-detecter-fuite-eau-cachee.html`, `blog-cout-renovation-salle-de-bain.html`, `blog-debouchage-canalisation-furet-hydrocurage.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`, `blog-fenetres-double-vitrage-pvc-alu-bois.html` … (+6) |
| `blog-comment-detecter-fuite-eau-cachee.html` | 11× — `blog-cout-renovation-salle-de-bain.html`, `blog-debouchage-canalisation-furet-hydrocurage.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`, `blog-fenetres-double-vitrage-pvc-alu-bois.html`, `blog-isolation-combles-aides-2026.html` … (+6) |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 4× — `blog-comment-detecter-fuite-eau-cachee.html`, `blog-pmr-adapter-salle-de-bain-senior.html`, `blog-porte-claquee-cle-perdue-que-faire.html`, `blog-remplacement-chaudiere-gaz-aides-2026.html` |
| `prestations/salle-de-bain-pmr.html` | 2× — `pmr-dunkerque.html`, `pmr-saint-omer.html` |

## Notes

- URLs externes (http/https/mailto/tel/javascript/data) ignorées.
- Whitelist ORPHAN (jamais indexées) : `404.html`, `realisation.html`, `reset.html`.
- Whitelist préfixes ORPHAN : `admin/`, `admin-pro/`.
- Page `realisation.html` est une page de détail dynamique — les URLs
  canoniques sont les sous-pages `actualites/YYYY-MM-DD-*.html`.
