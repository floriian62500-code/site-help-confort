# PR #32 — carte des zones : la panne est réparée

message_id: CLAUDE-2026-10-06-PR32-CARTE
repond_a: ordre Florian du 2026-10-06
date: 2026-10-06
verdict: **PASS** au head exact `4aa1814ac2059199fcbb345c85a3dcac1a9e05d5`

## Head contrôlé

| | valeur |
| --- | --- |
| head | `4aa1814ac2059199fcbb345c85a3dcac1a9e05d5` — **conforme** à celui annoncé |
| état | OPEN · MERGEABLE · **1 fichier** (`assets/hc-map-zones.js`) |
| preview | https://deploy-preview-32--remarkable-dragon-364e2b.netlify.app |

Reproducteur versionné : `docs/qa/REQ-CARTE-pr32/mesures.mjs`. Il mesure la preview **et** la
production, en 1440 et en 390.

## Les huit points demandés

| critère | 1440 | 390 |
| --- | --- | --- |
| plus aucun `API REQUIRED` | **tuiles servies par `a/b/c.tile.openstreetmap.org`**, 12 chargées, **0 en erreur**, couverture **100 %** | 6 chargées, 0 en erreur, **100 %** |
| zoom | bouton présent, tuiles rechargées 12 → 9 | 6 → 6 |
| déplacement | opérant, **0 tuile en erreur** après | 6 → 12, **0 en erreur** |
| 4 marqueurs | **4** | **4** |
| Saint-Omer = seule agence | **1 marqueur `agence` ★** | idem |
| Dunkerque / Calais / Boulogne = pôles | **3 marqueurs `zone`** — D, C, B | idem |
| attribution OpenStreetMap | **visible**, lien **visible** : « © OpenStreetMap contributors » | idem |
| console | **aucune erreur imputable au site** | **aucune** |

### L'avant / après, mesuré sur la production

| | production (avant) | PR #32 |
| --- | --- | --- |
| source des tuiles | `*.basemaps.cartocdn.com` | **`*.tile.openstreetmap.org`** |
| attribution | « Tuiles © CARTO », **lien OpenStreetMap masqué** | « © OpenStreetMap contributors », **lien visible** |
| rôles des marqueurs | **2 × `agence`** + 2 × `zone` | **1 × `agence`** + **3 × `zone`** |
| panneau | « **2 AGENCES LOCALES** » | « **1 AGENCE À SAINT-OMER** · **3 PÔLES D'INTERVENTION** » |

Le lien d'attribution OpenStreetMap était **masqué par une règle CSS** sur la production. Ce n'est
pas un détail de style : masquer cette attribution n'est pas conforme à la licence des tuiles. La
PR supprime cette règle. C'est une correction en plus de celle demandée, et elle est bonne.

## Une mention « 2 agences » subsiste sur cette preview — et ce n'est pas le fait de la PR #32

Le relevé trouve encore, sur la preview : « Plomberie, chauffage, électricité… : **2 agences
locales** (Dépan'Audo & Dépan'DK) ». Cette phrase est le **chapeau de `zones-intervention.html`**,
pas le composant de la carte. La PR #32 ne touche qu'`assets/hc-map-zones.js` : elle n'a pas à la
corriger, et c'est **ma PR #31 qui la corrige**.

Les deux lots sont complémentaires et ne se recouvrent pas :

| | fichier | ce qu'il corrige |
| --- | --- | --- |
| **PR #32** | `assets/hc-map-zones.js` | les tuiles, l'attribution, les rôles des marqueurs, le panneau |
| **PR #31** | 31 pages HTML | les phrases « deux agences » dans le contenu |

Une fois les deux fusionnés, il ne restera que `a-propos.html`, dont la citation et le récit
d'entreprise attendent votre décision.

## Verdict

**PASS.** Aucun `PROD_VERIFIED` déclaré de ma part : je ne fusionne pas, et je reste prêt à faire
le contrôle public dès que la fusion est faite.
