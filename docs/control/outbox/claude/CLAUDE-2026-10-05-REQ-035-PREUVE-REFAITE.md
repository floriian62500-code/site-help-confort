# REQ-20260926-035 — preuve visuelle refaite, bandeau cookies compris

message_id: CLAUDE-2026-10-05-REQ-035-PREUVE-REFAITE
repond_a: rework REQ-035 (preuve visuelle invalide, tentative 4)
date: 2026-10-05
verdict: **preuve conforme** — reste le verdict visuel de Florian

## Ce qui était reproché

« Le bandeau cookies est visible sur 6 captures sur 8 malgré le README qui affirme le
consentement refusé avant capture. » C'était exact, et la preuve ne valait rien.

## Ce qui a été refait

Reproducteur versionné `docs/qa/REQ-035-v3/mesures.mjs`, sur la recette au SHA `8d44fd181a363e84f420277e30f40d640b80b07c`.
Il **refuse de se contenter d'une affirmation** : il pose le consentement avant tout script de
page, **constate** l'absence du bandeau après chargement, le referme s'il est là malgré tout, et
publie l'état constaté dans le tableau. Dix captures, cinq pages × deux largeurs.

| page | bandeau cookies | encart visible | sans défilement | dans l'écran | bouton de fermeture |
| --- | --- | --- | --- | --- | --- |
| `/` | **absent** | oui | scrollY 0 | oui | **0** |
| `/contact.html` | **absent** | oui | scrollY 0 | oui | **0** |
| `/catalogue.html` | **absent** | oui | scrollY 0 | oui | **0** |
| `/zones-intervention.html` | **absent** | oui | scrollY 0 | oui | **0** |
| `/chauffagiste-saint-omer.html` | **absent** | oui | scrollY 0 | oui | **0** |

Identique en **1440** et en **390**. Les cinq critères d'acceptation sont donc tenus par la
mesure : pas de bouton de fermeture, pas de condition de défilement, encart présent partout,
aucune mémoire de masquage — et le recouvrement, traité juste en dessous.

## Le recouvrement de la barre d'action collante, prouvé pour de bon

La barre `#hcStickyCta` **ne s'affiche qu'après défilement**. La mesurer à l'arrêt ne prouvait
rien : j'ai donc mesuré avec la barre **réellement affichée**, à 390 px, sur les trois pages qui
la portent.

| page | barre visible | barre | encart | recouvrement |
| --- | --- | --- | --- | --- |
| `/` | oui (scrollY 3438) | `[0→390]` haut **783** | `[10→380]` bas **760** | **aucun** |
| `/zones-intervention.html` | oui (scrollY 2314) | `[0→390]` haut **783** | `[10→380]` bas **760** | **aucun** |
| `/chauffagiste-saint-omer.html` | oui (scrollY 3761) | `[0→390]` haut **783** | `[10→380]` bas **760** | **aucun** |

**23 px de dégagement**, systématiquement. L'encart se pose au-dessus de la barre, exactement ce
que le code vise avec son `bottom: calc(84px + safe-area)`.

## Deux fausses pistes de ma méthode, corrigées

Je les expose parce qu'elles auraient produit une quatrième preuve bancale.

1. **Je cherchais la barre au mauvais sélecteur.** `.hc-sticky-cta` n'existe pas : l'élément est
   `#hcStickyCta`. Mon tableau annonçait « pas de barre sur cette page » sur les cinq pages —
   un **faux négatif** qui aurait fait passer le critère sans l'avoir testé.
2. **Je comptais comme recouvrement deux éléments qui n'en sont pas.** `#hctslModal` est un
   conteneur de modale à `opacity: 0` et `pointer-events: none`. Surtout, `#hc-sv-cta` est le
   **« Centre de validation », un widget de recette** : il est injecté par `assets/hc-widgets.js`,
   **absent de `main` et absent de la production** — vérifié. Un recouvrement avec lui ne concerne
   aucun visiteur.

## Preuves

`docs/qa/REQ-035-v3/` : `mesures.mjs`, `mesures.json`, `MESURES-REQ-035.md`, **10 captures**
avec leurs empreintes sha256, plus les captures de la barre collante affichée.

## Ce qui reste

Le **verdict visuel de Florian** sur la recette. C'est le gate de cette demande, et il ne
m'appartient pas. Je n'ai touché à aucun fichier du site : ce lot ne contient que des preuves.
