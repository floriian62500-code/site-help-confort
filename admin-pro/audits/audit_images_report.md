# Audit images perf — 2026-05-15 13:30

> Sonde performance HELP! Confort — détecte les images > 200 KB et
> alerte si elles sont au-dessus du fold ou utilisées sur ≥ 5 pages.
> Lancement : `python3 admin-pro/audits/audit_images.py`

## Synthèse

- Images scannées : **84** (6349.0 KB total)
- Images > 200 KB : **6**
- Erreurs (>500 KB + ATF/5+ pages) : **0**
- Warnings : **6**

## Détail (par poids décroissant)

| Sévérité | Fichier | Poids | Pages | ATF | Raisons |
|----------|---------|-------|-------|-----|---------|
| ⚠️ | `images/mascotte-opt.tmp.png` | 688.4 KB | 0 | — | poids élevé (688.4 KB), non référencée (mort ?) |
| ⚠️ | `images/mascotte.tmp.png` | 688.4 KB | 0 | — | poids élevé (688.4 KB), non référencée (mort ?) |
| ⚠️ | `images/mascotte-with-bg.png` | 390.7 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/mascotte1.png` | 390.7 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/mascotte-opt.png` | 375.2 KB | 0 | — | non référencée (mort ?) |
| ⚠️ | `images/mascotte.png` | 375.2 KB | 0 | — | non référencée (mort ?) |

## Recommandations

- Convertir les PNG > 200 KB en WebP via `cwebp` (gain 60-80%).
- Pour les hero ATF, viser < 150 KB (WebP qualité 75).
- Images non référencées : à supprimer si vraiment inutilisées.

_Sonde IMG-PERF-V1 — à intégrer au scan quotidien._