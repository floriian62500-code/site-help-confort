# REQ-20260926-032 — captures contrôlées de la maquette

Prises sur la preview **reconstruite depuis `main`** (contrôle n°16),
`https://deploy-preview-20--remarkable-dragon-364e2b.netlify.app/maquette-metiers`,
commit **`8470a48a`**, le 2026-09-30.

| fichier | vue | largeur |
|---|---|---|
| `maquette-page-1440.jpg` | page « Nos métiers » | 1440 |
| `maquette-page-390.jpg` | page « Nos métiers » | 390 |
| `maquette-accueil-1440.jpg` | bloc d'accueil | 1440 |
| `maquette-accueil-390.jpg` | bloc d'accueil | 390 |

Contrôles faits par le script : la maison est dessinée dans chaque vue, et ses **9 pastilles** sont
présentes (18 éléments relevés = cercle + numéro par zone).

Isolation vérifiée sur la preview : `/maquette-metiers` répond **200**, `/docs/control/README.md`
répond **404**, la page porte **noindex**.
