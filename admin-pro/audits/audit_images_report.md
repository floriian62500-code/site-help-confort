# Audit images perf — 2026-05-18 06:58

> Sonde performance HELP Confort — détecte les images > 200 KB et
> alerte si elles sont au-dessus du fold ou utilisées sur ≥ 5 pages.
> Lancement : `python3 admin-pro/audits/audit_images.py`

## Synthèse

- Images scannées : **127** (21836.2 KB total)
- Images > 200 KB : **17**
- Erreurs (>500 KB + ATF/5+ pages) : **0**
- Warnings : **17**

## Détail (par poids décroissant)

| Sévérité | Fichier | Poids | Pages | ATF | Raisons |
|----------|---------|-------|-------|-----|---------|
| ⚠️ | `images/prestations/ramonage.png` | 4379.4 KB | 0 | — | poids élevé (4379.4 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/ouverture-porte.jpg` | 2232.9 KB | 0 | — | poids élevé (2232.9 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/mise-securite-vitrerie.jpg` | 1142.8 KB | 0 | — | poids élevé (1142.8 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/remplacement-panneau-porte.jpg` | 1092.1 KB | 0 | — | poids élevé (1092.1 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/changement-cylindre.jpg` | 921.8 KB | 0 | — | poids élevé (921.8 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/remplacement-chaudiere.jpg` | 845.6 KB | 0 | — | poids élevé (845.6 KB), non référencée (mort ?) |
| ⚠️ | `images/mascotte-opt.tmp.png` | 688.4 KB | 0 | — | poids élevé (688.4 KB), non référencée (mort ?) |
| ⚠️ | `images/mascotte.tmp.png` | 688.4 KB | 0 | — | poids élevé (688.4 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/vitrage-simple-double-triple.jpg` | 532.8 KB | 0 | — | poids élevé (532.8 KB), non référencée (mort ?) |
| ⚠️ | `images/prestations/desembouage.png` | 418.1 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/vitrage-insert-poele.jpg` | 403.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/ramonage.jpg` | 344.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/salle-de-bain.jpg` | 313.6 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/recherche-panne-elec.jpg` | 278.0 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/debouchage.jpg` | 249.3 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/porte-fermee-cle.jpg` | 241.2 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/prestations/vitrerie-panneau-porte.jpg` | 213.9 KB | 0 | — | non référencée (mort ?) |

## Recommandations

- Convertir les PNG > 200 KB en WebP via `cwebp` (gain 60-80%).
- Pour les hero ATF, viser < 150 KB (WebP qualité 75).
- Images non référencées : à supprimer si vraiment inutilisées.

_Sonde IMG-PERF-V1 — à intégrer au scan quotidien._