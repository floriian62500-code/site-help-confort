# REQ-041 vérifiée en production · PR #32 : le critère manquant est mesuré

message_id: CLAUDE-2026-10-06-REQ-041-PROD-ET-PR32-COMPLET
repond_a: ordre Florian du 2026-10-06
suite_de: CLAUDE-2026-10-06-PR32-CARTE
date: 2026-10-06
verdict: **REQ-041 conforme en production** · **PR #32 PASS, les neuf critères**

## 1. Mon PASS sur la PR #32 était déjà publié

Il l'a été à **13h39h50**, commit `61323288`, fichier
`docs/control/outbox/claude/CLAUDE-2026-10-06-PR32-CARTE.md` — soit **24 secondes avant** la
fusion de REQ-041. Il s'est croisé avec votre relance, voilà tout.

Votre nouvelle liste ajoute toutefois un critère que je n'avais pas mesuré : **0 overflow**. Il
est traité ci-dessous, et le verdict ne change pas.

## 2. Le critère ajouté : débordement

| | 1440 | 390 |
| --- | --- | --- |
| débordement de la page, **PR #32** | **0 px** | **0 px** |
| débordement de la page, production | 0 px | 0 px |
| carte dans l'écran | `[767→1298]` dans `0→1440` ✅ | `[42→348]` dans `0→390` ✅ |

Le relevé signale « 3 descendants hors cadre » **à l'identique avant et après**. Ce sont **trois
tuiles Leaflet** (`img.leaflet-tile-loaded`) qui s'étendent jusqu'à 548 px dans un écran de 390 —
et le conteneur est en `overflow: hidden`, donc elles sont **découpées**. C'est le mécanisme normal
d'une carte à tuiles, pas un défaut : la page, elle, ne déborde pas d'un pixel.

**Les neuf critères sont donc tenus**, au head exact `4aa1814ac2059199fcbb345c85a3dcac1a9e05d5`.

## 3. REQ-041 vérifiée en production

Fusion `193db8fba6f8524a6c421365c86c370cd2b9fd84`. Relevé du **DOM rendu** sur les 117 pages de
`depan59-62.fr`, même méthode qu'avant, **0 erreur de chargement** :

| | avant | **en production** |
| --- | --- | --- |
| pages incohérentes sur 117 | **32** | **5** |

Artefact : `docs/qa/REQ-041-prod/releve-dom-production.json`.

Les 5 restantes sont exactement celles annoncées, aucune surprise :

| page | ce qui reste | statut |
| --- | --- | --- |
| `contact.html` | le libellé de la carte | **PR #32**, pas encore fusionnée |
| `nos-villes.html` | idem | **PR #32** |
| `zones-intervention.html` | idem | **PR #32** |
| `reseau-help-confort.html` | « 100+ agences locales **en France** » | rien à faire, réseau national |
| `a-propos.html` | la citation et le récit d'entreprise | **votre décision** |

Autrement dit : **tout ce que REQ-041 devait corriger est corrigé en production.** Ce qui reste
relève de la PR #32 et d'un arbitrage éditorial.

## 4. Ce qui reste après la fusion de la PR #32

Une seule page : `a-propos.html`. Elle porte une **citation entre guillemets** et le récit de la
société — on ne réécrit pas une citation, et la narration vous appartient.

Et la question de fond, inchangée : `agence-dunkerque.html` est toujours servie en 200, avec ses
horaires et sa fiche `schema.org Plumber`, **sous le même SIREN** que Dépan'Audo, alors que les
mentions légales ne déclarent qu'une entité. Corriger les phrases ne corrige pas ça.

## STOP

Je ne fusionne pas la PR #32. Je fais son contrôle public dès qu'elle est en ligne.
