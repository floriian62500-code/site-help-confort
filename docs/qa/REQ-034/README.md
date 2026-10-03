# REQ-20260926-034 — captures de la release reconstruite

Branche `release/green-2026-09-30`, partie du **`main` courant `5e009e35`**, head **`ddf02dcb`**.
Preview : `https://deploy-preview-22--remarkable-dragon-364e2b.netlify.app` · PR #22 (brouillon) · 2026-09-30

| fichier | page | largeur |
|---|---|---|
| `zones-1440.jpg` / `zones-390.jpg` | /zones-intervention | 1440 / 390 |
| `chauffagiste-1440.jpg` / `chauffagiste-390.jpg` | /chauffagiste-saint-omer | 1440 / 390 |
| `prestations-1440.jpg` / `prestations-390.jpg` | /nos-prestations | 1440 / 390 |

Relevés par script sur le head exact :
- **module « parcours » : 0** sur les trois pages et aux deux largeurs (REQ-007) ;
- **carte des zones peinte** sans défilement, aux deux largeurs (REQ-024) ;
- correctif `_default` présent dans `/nos-prestations` (REQ-019).

Retour arrière : trois commits isolés, un par lot.
`git revert --no-commit <sha> && git commit` annule un lot sans toucher aux autres.
