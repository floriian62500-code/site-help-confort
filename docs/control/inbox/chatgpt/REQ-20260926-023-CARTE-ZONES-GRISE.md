# REQ-20260926-023 — La carte des zones reste grise tant qu'on ne défile pas

request_id: REQ-20260926-023
priority: P1
status: OPEN
date: 2026-09-26
source: signalée par Florian en conversation, capture annotée de `/zones-intervention`
        (flèche rouge sur la bande vide sous le hero). Enregistrée par Claude avant tout correctif.

## Constat

Sur `/zones-intervention`, le hero est construit en deux colonnes : le texte et les deux actions à
gauche, **la carte interactive à droite**. À l'arrivée sur la page, la carte ne s'affiche pas :
l'emplacement reste un rectangle gris de 573 × 460 px. Le haut de page paraît vide et cassé.

## Mesure

Vérifié sur la preview, sans défiler, à deux reprises :

- `window.L` (Leaflet) = **undefined** après 10 secondes ;
- `.leaflet-tile` = **0** ;
- fond du conteneur = `rgb(229,237,243)` — le gris de réserve ;
- l'élément hôte `[data-hc-map-zones]` est pourtant **dans l'écran** au chargement (238 → 698 px,
  573 × 460), et `IntersectionObserver` est supporté.

Dès qu'on défile d'un cran, Leaflet se charge et 9 tuiles apparaissent.

## Cause

`assets/hc-map-zones.js` charge Leaflet **paresseusement**, via un `IntersectionObserver` posé sur
l'élément hôte. Pour un élément **déjà visible au chargement**, la notification n'arrive pas dans
ce contexte : le chargement n'est déclenché que par le premier défilement.

Sur une page dont le hero *est* la carte, cela signifie qu'un visiteur qui arrive et lit voit un
rectangle gris.

## Correctif proposé (non appliqué)

Dans `inject()` : après avoir posé l'observateur, déclencher immédiatement le chargement si
l'élément est déjà dans l'écran. Trois lignes, un seul fichier, aucun changement de structure.

## Tests attendus

- sans défiler, la carte est peinte en moins de 3 secondes ;
- avec défilement, comportement inchangé ;
- desktop 1440 et mobile 390 ;
- aucune autre page affectée (le module sert aussi ailleurs) ;
- aucune mutation production.

## Retour attendu

ROOT_CAUSE · MESURE_AVANT · MESURE_APRES · FILES_CHANGED · TESTS · SCREENSHOTS_1440_390 · SHA ·
PREVIEW · ROLLBACK · NO_PROD_MUTATION_PROOF
