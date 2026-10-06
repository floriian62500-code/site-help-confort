# REQ-20260926-024 — la carte des zones n'attend plus un défilement

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**
SHA : `65953e28` — **un seul commit, une seule REQ**

## ROOT_CAUSE

`assets/hc-map-zones.js` charge Leaflet paresseusement, via un `IntersectionObserver` posé sur
l'emplacement de la carte. L'intention est bonne : ne pas télécharger une bibliothèque de
cartographie pour une page qui ne la montre pas. Mais pour un élément **déjà visible au
chargement**, la notification n'arrive pas dans ce contexte, et rien ne se déclenche avant le
premier défilement.

Sur `/zones-intervention`, le hero **est** la carte. Le visiteur qui arrive et lit voyait donc un
rectangle gris.

## MESURE_AVANT — preview, sans défiler

| mesure | valeur |
|---|---|
| `window.L` après 10 s | **undefined** |
| tuiles `.leaflet-tile` | **0** |
| fond du conteneur | `rgb(229,237,243)` — le gris de réserve |
| élément hôte dans l'écran | oui (238 → 698 px, 573 × 460) |
| après un cran de défilement | Leaflet chargé, 9 tuiles |

## Correctif — trois lignes, un fichier

```js
      io.observe(el);
      // Un élément DÉJÀ visible au chargement ne déclenche pas toujours l'observateur…
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) + 100 && r.bottom > -100) { io.disconnect(); loadLeaflet(buildMap); }
```

Même marge de 100 px que l'observateur, pour que les deux chemins se comportent pareil.

## MESURE_APRES — preview, sans défiler

| | **1440 × 900** | **390 × 844** |
|---|---|---|
| `scrollY` au moment de la mesure | **0** | **0** |
| Leaflet | chargé | chargé |
| tuiles peintes | **9** | **4** |
| délai d'apparition | **402 ms** | **402 ms** |
| débordement horizontal | 0 | 0 |

À l'écran, la carte montre le cercle de couverture et les repères Saint-Omer, Dunkerque, Calais,
Boulogne-sur-Mer, Guînes, Watten.

## Pas de régression du chargement différé

Trois autres pages portent le même module : `contact.html`, `a-propos.html`, `nos-villes.html` —
la carte y est **bas de page**. Vérifié sur `/contact`, en 390, **sans défiler**, après 4 s :

| mesure | valeur |
|---|---|
| position de la carte | **5 212 px** (hauteur d'écran : 844) |
| hors écran | oui |
| `window.L` | **undefined** |
| tuiles | **0** |

Le chargement reste donc différé là où il doit l'être : la condition ajoutée est fausse au
chargement sur ces pages.

## FILES_CHANGED

`assets/hc-map-zones.js` (le correctif) et les quatre pages qui le référencent, pour le numéro de
version : `zones-intervention.html`, `contact.html`, `a-propos.html`, `nos-villes.html`.

Le bump `?v=20260808f` → `?v=20260926a` n'est pas cosmétique : `/assets` est servi avec un cache
immuable d'un an. Sans lui, le correctif resterait invisible derrière l'ancien fichier — c'est
l'erreur que j'ai déjà commise une fois dans cette session.

## TESTS

Suite complète : **791 contrôles, 0 échec**. SEO `ERRORS=0`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/zones-intervention

Sans défiler : la carte doit être peinte immédiatement. Forcer le rechargement.

## ROLLBACK

```
git revert --no-commit 65953e28 && git commit
```

Puis rebumper le numéro de version des modules, sinon les navigateurs garderont la version
corrigée en cache.

## NO_PROD_MUTATION_PROOF

- un commit sur `recette` ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- fichiers touchés : 1 asset et 4 pages HTML (numéro de version uniquement). **0** fichier sous
  `supabase/`, `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- aucun formulaire soumis.

## NEXT_ACTION

Contrôle, puis REQ-023 (quatre pôles) dans un commit séparé. Je ne marque pas CLOSED.
