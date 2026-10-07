# Backlog autonome — tâches 1 à 3

## Tâche 1 — PROD_VERIFY de l'en-tête unifié (#43) : **conforme**

Commit prod `2a93cd902d1d7bd44d4a58ed16bc49a06432afd2`.

**Balayage complet des 204 pages publiques sur `depan59-62.fr`** — une requête par page :

```
204 / 204 conformes
```

Chacune porte exactement : une balise `id="hcHeader"`, un `hc-header.css?v=94dcff1173`,
un `hc-header.js?v=60b06a214a`, **zéro** `hc-critical-header`, un `hc-promo-saison.css?v=1c234e7b33`
et un `hc-promo-saison.js?v=b54f8db069`.

`/partials/hc-header.html` répond **404** (la règle de blocage fonctionne), les deux assets 200.

**Rendu, à 1440** — page métier, zones, prestation, fiche chantier, actualité, espace pro :
boîte collante **165 px** (la hauteur de référence), 37 liens, rubrique active juste à chaque fois
(`metiers`, `zones`, `prestations`, `actu`, `pro`), aucun débordement. Au défilement, la barre
interne passe à 111 px et le logo à 90 px — exactement le gabarit annoncé — sans que la boîte bouge.

**Rendu, à 390** — accueil et prestation : en-tête 95 px, largeur de page 390 exactement,
burger visible. Au clic : `aria-expanded` false → true, `html.hc-menu-open` posé, panneau ouvert
sous la barre, 18 liens. **Échap referme** : `aria-expanded` revient à false, verrou relâché.

## Tâche 2 — la garde d'hygiène : **PR #44**

`depot-propre.test.mjs` salissait le dépôt en s'exécutant : 111 pages de la racine modifiées et
laissées telles quelles, dont 6 pages `admin-pro/` aux sélecteurs CSS cassés.

Les sondes tournent désormais dans une copie jetable (`git worktree` depuis HEAD). Et **neuf
outils à passage unique réécrivaient des pages au simple import** : chacun est maintenant sous
garde de ligne de commande.

```
référence : 5 PASS / 5 FAIL      ce lot : 7 PASS / 3 FAIL
après exécution : git status ne renvoie plus rien (c'étaient 111 fichiers)
29 / 30 autres suites inchangées
```

Les 3 échecs restants sont REQ-046 (dossiers internes servis), un lot à part.

## Tâche 3 — les 4 échecs de `home-promo` : **PR #46**, un seul était un défaut de test

```
référence : 17 PASS / 4 FAIL      ce lot : 18 PASS / 3 FAIL
```

Corrigé : l'assertion figeait le titre « Que souhaitez-vous faire ? », réécrit depuis en
« Quel est votre besoin ? ». Elle vérifie maintenant le bloc d'aide à la décision lui-même.

**Bloqué, et c'est un défaut visible en production :** deux des trois boutons de l'encart
saisonnier ne mènent nulle part, sur les 204 pages.

| bouton | cible | ancre présente |
|---|---|---|
| Chaudière | `#entretien` | oui |
| Poêle ou insert | `#poele-insert` | **non** |
| Ramonage | `#ramonage` | **non** |

La page Chauffage ne mentionne **ni poêle ni insert** (zéro occurrence). L'encart met donc en avant
une prestation alors que la consigne retenue est « pas de poêles ni de granulés au catalogue ».
Deux chemins, et c'est une décision : retirer le bouton et décider où mène « Ramonage », ou créer
les deux sections si ces prestations sont bien au catalogue.

**Bloqué ailleurs :** l'encart sur le tunnel attend `catalogue.html` (tâche 4). Le prix de la carte
entretien — l'accueil affiche « Dès 9 € **HT**/mois », `/contrats-entretien` « 9 €/mois » sans
mention de taxe (26 HT contre 5 TTC) — relève de la tâche 5, qui doit traiter les deux pages
ensemble. Afficher un prix HT comme prix principal à un particulier n'est pas qu'une incohérence
d'affichage.

## Suite

Tâche 4 : reconstruire le tunnel « Ma demande » depuis le `main` actuel.
