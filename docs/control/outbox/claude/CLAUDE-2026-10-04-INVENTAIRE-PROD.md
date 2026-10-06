# Inventaire complet : ce qui est vert, ce qui est en production, ce qui reste

message_id: CLAUDE-2026-10-04-INVENTAIRE-PROD
repond_a: ordre Florian du 2026-10-04 (rattrapage production des lots verts)
date: 2026-10-04
verdict: **5 demandes vérifiées en production**, **1 PASS en attente de fusion**, **3 sans objet**, **1 outillage**, **1 bug neuf trouvé**

## Le tableau demandé

| REQ | statut tracker | déjà en prod | PR | SHA | preview | preuves | action suivante |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **007** parcours retiré des pages métier | TECH_ACCEPTED | **OUI** | #22 | `dc9b39eb` | — | `PROD-VERIFY-20261004` | PROD_VERIFIED (ChatGPT) |
| **017** module contrats sur Chauffage | READY_FOR_CONTROL | **OUI** | #23 | `a83c1ce5` | — | `REQ-017-prod` + `PROD-VERIFY` | PROD_VERIFIED |
| **019** slug technique `_default` | TECH_ACCEPTED | **OUI** | #22 | `dc9b39eb` | — | `PROD-VERIFY` | PROD_VERIFIED |
| **023** zones 4 pôles | TECH_ACCEPTED | **OUI** | #24 | `96e75d88` | — | `REQ-024-pr24` + `PROD-VERIFY` | PROD_VERIFIED |
| **024** carte zones + cache-bust | TECH_ACCEPTED | **OUI** | #24 | `96e75d88` | — | idem | PROD_VERIFIED |
| **037** cohérence TTC | READY_FOR_CONTROL | non | **#26** | `176c28d1` | deploy-preview-26 | `REQ-037`, 12 captures | **PASS** → fusion ChatGPT |
| **036** débordement 390 px | OPEN | non — **bug en ligne** | — | — | — | mesuré en prod | après #26 |
| **008** bloc final page contrats | TECH_ACCEPTED | **sans objet** | — | `6ae55ed8` | — | — | décision Florian, voir plus bas |
| **009** régression #intervention | TECH_ACCEPTED | **sans objet** | — | `020b2666` | — | — | ne pas porter |
| **011** routage boutons prestations | TECH_ACCEPTED | **sans objet** | — | `0f09e466` | — | — | ne pas porter |
| **026** garde de cohérence des zones | TECH_ACCEPTED | **non applicable** | — | `1534226d` | — | — | reste sur recette |
| **038** `_ts` casse la requête REST | *à ouvrir* | non — **bug en ligne** | — | — | — | mesuré en prod | ouvrir, P2 |

## Ce que j'ai vérifié sur `depan59-62.fr`, pas sur la recette

Reproducteur versionné `docs/qa/PROD-VERIFY-20261004/mesures.mjs`, `main` = `96e75d88f57dbe867fb8490dbdc2749093340a70`.

| contrôle | 1440 | 390 |
| --- | --- | --- |
| **REQ-007** — `hc-metier-journey` sur les 7 pages métier | **0 occurrence**, 7 pages en 200 | idem |
| **REQ-017** — module contrats | présent, onglets Gaz/Fioul/Adoucisseur, **9,90 / 14,30 / 25,30 € TTC**, 0 hors cadre | idem |
| **REQ-019** — slugs techniques en sous-filtre | **0** sur 37 libellés | idem |
| **REQ-023** — 4 pôles | les 4 cartes, « Agence Dépan'Audo » + 3 × « Pôle d'intervention », plus aucune revendication « Deux agences » | idem |
| **REQ-024** — carte, **sans défiler** (`scrollY = 0`) | 1re tuile à **576 ms**, 12 tuiles, **100 %** de couverture, 0 en erreur | 1re tuile à **402 ms**, 6 tuiles, **100 %**, 0 en erreur |
| **REQ-024** — `contact.html` avant défilement | 0 conteneur, 0 tuile : paresse préservée | idem |
| **REQ-024** — cache-bust `?v=20261003a` | servi par les **4** pages | idem |

Je ne déclare pas `PROD_VERIFIED` : c'est le contrôle ChatGPT qui le pose. Les mesures sont là.

## Pourquoi trois demandes vertes ne se « rattrapent » pas

Elles ont été construites sur la lignée `recette`, qui a divergé de `main` : **749 fichiers**
n'existent que sur recette, **237** que sur main, 845 sont communs — et les pages communes sont
souvent deux générations différentes du même fichier. Un report ligne à ligne n'a donc aucun sens,
exactement comme le contrôle n°25 le disait.

- **REQ-009** et **REQ-011** visent le tunnel de demande. En production, **`/catalogue.html`
  répond 404** et l'accueil ne charge aucun `hc-demande` : **le tunnel n'existe pas en ligne**.
  Corriger un écran de reprise ou des boutons qui ouvrent ce tunnel n'a pas d'objet sur le site
  public. Rien à porter.
- **REQ-008** retirait un bloc final de la page Contrats et le remplaçait par un bloc `ct-renvois`
  plus léger. **Ni l'un ni l'autre n'existe dans `main`** : la page de production se termine par
  une section `cta-band` qui lui est propre. Ce n'est donc pas un report, c'est une **décision
  visuelle neuve** : faut-il retirer ce bloc final-là ? Je ne l'engage pas sans votre réponse.
- **REQ-026** est une garde de test (`scripts/tests/zones-coherence.test.mjs`). `main` n'héberge
  pas la suite de tests — elle vit sur recette. Cette demande n'a pas vocation à partir en
  production ; c'est un écart d'outillage entre les deux lignées, à trancher séparément.

## Un bug neuf, trouvé en production pendant ce contrôle

Sur **`/nos-prestations.html`**, chaque visiteur déclenche une requête en erreur :

```
400 GET …/rest/v1/v_services_public?select=*&_ts=1791127911925
{"code":"PGRST100","details":"unexpected \"1\" expecting \"not\" or operator (eq, gt, ...)",
 "message":"\"failed to parse filter (1791127911925)\""}
```

Le paramètre `_ts` ajouté pour contourner le cache est interprété par PostgREST comme un **filtre
sur une colonne `_ts`**, qui n'existe pas. La page se rattrape ensuite avec un second appel sans
`_ts` (200, 34 lignes) : **l'affichage est correct**, les 41 cartes et leurs tarifs viennent bien
de la source. L'impact visible est donc nul aujourd'hui, mais :

- chaque visite paie un aller-retour perdu et une erreur de console ;
- un vrai échec de chargement serait noyé dans ce bruit ;
- le jour où le repli bouge, la page casse.

À ouvrir en **REQ-20260926-038**, priorité P2 — ce n'est pas un bloquant de campagne. Correctif :
passer l'horodatage en en-tête de cache plutôt qu'en paramètre d'URL, ou le nommer d'une façon que
PostgREST ignore.

## Ce que je n'ai pas fait

- aucune fusion, aucun déploiement, aucun `PROD_VERIFIED` déclaré ;
- aucun report de REQ-008 / 009 / 011 / 026 : trois sont sans objet, une est de l'outillage ;
- aucun formulaire soumis, aucun lead ;
- aucune mutation Supabase, RLS, auth, paiement, DNS ;
- rien touché aux demandes à gate humain (001, 003, 004, 006, 013, 014, 015, 027, 029, 030, 032,
  033, 035).

## NEXT ACTION

1. **REQ-037** : PASS, PR #26 attend la fusion ChatGPT.
2. **REQ-036** : dès que #26 est en production, lot isolé depuis le nouveau `main` — objectif
   `scrollWidth = innerWidth` à 1 px près à 390, en incluant si vous le voulez les **90 px** de la
   page Contrats relevés hier.
3. **PROD_VERIFIED** à poser par ChatGPT sur 007, 017, 019, 023, 024 : les mesures sont fournies.
4. **Décision attendue** : le bloc final de la page Contrats de production (REQ-008 revisitée).
5. **REQ-038** à ouvrir pour le `_ts`.
