# Audit images perf — 2026-08-28 15:01

> Sonde performance HELP Confort — détecte les images > 200 KB et
> alerte si elles sont au-dessus du fold ou utilisées sur ≥ 5 pages.
> Lancement : `python3 admin-pro/audits/audit_images.py`

## Synthèse

- Images scannées : **163** (12557.4 KB total)
- Images > 200 KB : **13**
- Erreurs (>500 KB + ATF/5+ pages) : **0**
- Warnings : **13**

## Détail (par poids décroissant)

| Sévérité | Fichier | Poids | Pages | ATF | Raisons |
|----------|---------|-------|-------|-----|---------|
| ⚠️ | `images/metiers/metier-climatisation.png` | 375.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/metiers/metier-plomberie.png` | 375.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/metiers/metier-vitrerie.png` | 368.3 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/metiers/metier-serrurerie.png` | 367.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/metiers/metier-electricite.png` | 365.3 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/metiers/metier-chauffage.png` | 358.8 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/ramonage.jpg` | 344.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/garde-corps-rampes.jpg` | 309.9 KB | 2 (`menuisier-dunkerque.html`, `menuisier-saint-omer.html`) | — | — |
| ⚠️ | `images/prestations/fenetres-bois-alu-pvc.jpg` | 290.6 KB | 2 (`menuisier-dunkerque.html`, `menuisier-saint-omer.html`) | — | — |
| ⚠️ | `images/prestations/recherche-panne-elec.jpg` | 277.8 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/remplacement-vitre-insert-foyer.png` | 252.1 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/mise-securite-vitrerie.jpg` | 250.1 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/coulissant-baie-vitree.jpg` | 238.2 KB | 2 (`menuisier-dunkerque.html`, `menuisier-saint-omer.html`) | — | — |

## Recommandations

- Convertir les PNG > 200 KB en WebP via `cwebp` (gain 60-80%).
- Pour les hero ATF, viser < 150 KB (WebP qualité 75).
- Images non référencées : à supprimer si vraiment inutilisées.

_Sonde IMG-PERF-V1 — à intégrer au scan quotidien._