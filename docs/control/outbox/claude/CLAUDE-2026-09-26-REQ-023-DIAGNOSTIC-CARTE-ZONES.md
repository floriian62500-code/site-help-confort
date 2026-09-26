# REQ-20260926-023 — diagnostic de la carte grise, correctif préparé et **non appliqué**

run : 2026-09-26 · branche `recette` · **aucune modification de page dans ce lot**

## Pourquoi je n'applique pas tout de suite

REQ-022 impose de montrer avant de modifier, et le gel n'autorise que des corrections
« purement régressives, minimales et isolées » **déjà demandées**. Celle-ci vient d'être signalée
par Florian, elle est minimale et isolée — mais je préfère montrer le diagnostic et le correctif,
et appliquer sur un mot. Le correctif tient en trois lignes.

## ROOT_CAUSE

`assets/hc-map-zones.js` charge Leaflet de façon paresseuse :

```js
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) { io.disconnect(); loadLeaflet(buildMap); }
  });
}, { rootMargin: '100px' });
io.observe(el);
```

L'intention est bonne — ne pas charger une bibliothèque de cartographie pour rien. Le défaut est
que, sur cette page, **l'élément observé est déjà dans l'écran au chargement**, et la notification
n'arrive pas : rien ne se déclenche tant que le visiteur ne défile pas.

Sur `/zones-intervention`, le hero **est** la carte. Le visiteur arrive donc sur un rectangle gris
de 573 × 460 px, et le haut de page paraît vide.

## MESURE_AVANT (preuve, preview, sans défiler)

| mesure | valeur |
|---|---|
| `window.L` après 10 s | **undefined** |
| tuiles `.leaflet-tile` | **0** |
| fond du conteneur | `rgb(229,237,243)` (gris de réserve) |
| hôte `[data-hc-map-zones]` dans l'écran | **oui** — 238 → 698 px, 573 × 460 |
| `IntersectionObserver` supporté | oui |
| après un cran de défilement | Leaflet chargé, **9 tuiles** |

## Correctif proposé — trois lignes, un fichier

```js
      io.observe(el);
      // Un élément déjà visible au chargement ne déclenche pas toujours l'observateur : sur cette
      // page, le hero EST la carte, et le visiteur voyait un rectangle gris jusqu'au premier
      // défilement. On amorce donc tout de suite quand l'élément est déjà dans l'écran.
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) + 100 && r.bottom > -100) { io.disconnect(); loadLeaflet(buildMap); }
```

Aucun changement de structure, aucun changement de rendu quand la carte est hors écran : le
comportement paresseux est conservé pour toutes les autres pages qui utilisent le module.

## Ce que je vérifierai après application

- sans défiler : carte peinte en moins de 3 s, tuiles > 0 ;
- avec défilement : comportement inchangé ;
- 1440 et 390 ;
- les autres pages qui portent `[data-hc-map-zones]` : chargement toujours différé si la carte est
  plus bas dans la page ;
- suite complète.

## NO_PROD_MUTATION_PROOF

Ce lot ne contient que deux fichiers de contrôle (`docs/control/`). Aucun asset, aucune page,
aucun déploiement. `origin/main` toujours sur `570225bf`.

## NEXT_ACTION

Attendre le feu vert de Florian pour appliquer le correctif — ou son instruction de le laisser
dans le plan global si la page des zones entre de toute façon dans la refonte.
