# REQ-20260926-041 — preuve corrigée : ma première mesure était incomplète

message_id: CLAUDE-2026-10-06-REQ-041-PREUVE-CORRIGEE
repond_a: décision Florian du 2026-10-06 (1 agence Saint-Omer, 3 pôles)
suite_de: CLAUDE-2026-10-06-REQ-041-UNE-AGENCE
date: 2026-10-06
verdict: **PASS** — 32 pages → 5, et les 5 sont nommées

## D'abord, l'erreur de ma première preuve

J'ai annoncé « 0 page incohérente ». C'était **faux**, et votre capture de la page Zones le
montrait : « nos 2 agences locales couvrent… » y était toujours.

La cause est ma méthode : mon relevé lisait le **HTML servi en écartant les `<script>`**. Il ne
pouvait donc pas voir ce qu'un composant écrit **à l'exécution** — et c'est précisément le cas du
panneau de la carte des zones, dont le texte vit dans `assets/hc-map-zones.js`.

J'ai refait le relevé sur le **DOM rendu** : chaque page est chargée, et je lis le texte que le
visiteur voit réellement. Reproducteur : `docs/qa/REQ-041/releve-dom.mjs`.

| mesure | pages incohérentes |
| --- | --- |
| HTML servi, sans les scripts _(ma première méthode)_ | 27 |
| **DOM rendu** _(la bonne méthode)_ | **32** |

Cinq pages échappaient à la première mesure. C'est exactement l'écart que votre capture a révélé.

## Le résultat, avec la bonne méthode

| | avant (production) | après (PR #31) |
| --- | --- | --- |
| pages incohérentes sur 117 | **32** | **5** |

Relevés versionnés : `releve-dom-avant.json`, `releve-dom-apres.json`.

### Les 5 restantes, nommées une par une

| page | ce qui reste | qui s'en charge |
| --- | --- | --- |
| `contact.html` | « nos 2 agences locales couvrent… » | **PR #32**, hotfix carte |
| `nos-villes.html` | idem | **PR #32** |
| `zones-intervention.html` | idem | **PR #32** |
| `reseau-help-confort.html` | « **AGENCES LOCALES** » — le compteur « 100+ en France » | **rien à faire**, c'est le réseau national, c'est vrai |
| `a-propos.html` | la citation entre guillemets et le récit d'entreprise | **votre décision** |

Autrement dit : une fois la PR #32 fusionnée, **il ne restera que `a-propos.html`**, qui attend
votre mot parce qu'on ne réécrit pas une citation.

## Ce que j'ai ajouté depuis le premier rapport

Deux formulations que ma première passe avait manquées — elles ne contiennent pas « agences
locales », mais présentent bien deux agences :

- `reseau-help-confort.html` : un bouton « Nos agences Saint-Omer & Dunkerque » → « Notre agence
  et nos pôles d'intervention » ;
- `plan-du-site.html` : la rubrique « 🏢 Nos agences » → « 🏢 Nos implantations », et le lien
  « Agence Dunkerque (Dépan'DK) » → « Pôle d'intervention Dunkerque (Dépan'DK) ».

Le lot passe donc à **31 fichiers**, head `e7dc1bd919fdfe945f85aba11f02affbdf806a77`.

## Sur la PR #32, que je n'ai pas touchée

Elle corrige le bon fichier et rien d'autre, et elle fait au passage une chose qui mérite d'être
relevée : elle **supprime la règle CSS qui masquait le lien d'attribution OpenStreetMap**. Masquer
cette attribution n'est pas conforme à la licence des tuiles. C'est une bonne correction.

## Ce qui reste ouvert, et qui ne dépend pas de moi

La question de fond posée dans mon rapport précédent n'a pas bougé : `agence-dunkerque.html` est
toujours servie en 200, avec ses horaires et sa fiche `schema.org Plumber`, sous le **même SIREN**
que Dépan'Audo, alors que les mentions légales ne déclarent qu'une entité. Corriger les phrases ne
corrige pas ça.

## STOP

Je ne fusionne pas la PR #31.
