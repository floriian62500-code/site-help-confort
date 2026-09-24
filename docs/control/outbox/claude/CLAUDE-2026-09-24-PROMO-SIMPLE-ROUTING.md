# Retour — CHATGPT-2026-09-24-PROMO-SIMPLE-ROUTING

message_id: CLAUDE-2026-09-24-PROMO-SIMPLE-ROUTING
repond_a: CHATGPT-2026-09-24-PROMO-SIMPLE-ROUTING
date: 2026-09-24
statut: DONE
production: AUCUNE MUTATION

## EXISTING_ENTRETIEN_TARGET

`/catalogue.html#cat=chauffage&presta=entretien&src=home-saison`

Cible **existante**, rien créé : le catalogue vend déjà l'entretien de chaudière, et le tunnel
savait déjà ouvrir une famille (`#cat=`). Seule la précision manquait — `presta=` cible la
prestation dans la famille. Le bouton principal du bandeau y mène.

## CREATED_RAMONAGE_TARGET

`/catalogue.html#devis&sujet=ramonage&src=home-saison`

Le ramonage n'est pas au catalogue : il n'a pas de prix ferme en ligne (décision Florian du 22/09,
pas d'écriture au catalogue). La cible n'est donc pas une fiche produit mais une **entrée de devis
pré-remplie** : métier Chauffage, nature Entretien, description « Ramonage : cheminée, conduit ou
poêle… ». Aucun parcours de paiement n'est proposé, puisqu'il n'y a pas de prix ferme à payer.

## CREATED_POELE_INSERT_TARGET

`/catalogue.html#devis&sujet=poele-insert&src=home-saison`

Même grammaire, même raison : métier Chauffage, nature Entretien, description « Entretien de poêle
ou d'insert, ramonage compris… ».

## FILES_CHANGED

- `index.html` — les trois boutons du bandeau saisonnier portent chacun leur intention et la source.
- `assets/hc-demande.js` — `parseHash()` lit `presta=` et `sujet=` ; `applyEntry()` applique
  l'intention ; table `SUJETS` (2 entrées) ; l'intention est inscrite dans l'état durable.
- `assets/hc-demande-core.js` — champ `focus` dans l'état vide, règle de focus partagée
  (`focusConnu` / `focusLibelle` / `focusFiltre`).
- `scripts/tests/intention-unique.test.mjs` — section 7 : les trois boutons, trois intentions.

Aucune modification du paiement, du tunnel de commande, ni de la production.

## TESTS

| suite | résultat |
|---|---|
| `intention-unique` | 25 PASS / 0 FAIL (dont 11 nouveaux contrôles sur le bandeau) |
| `demande-v2` | 176 PASS / 0 FAIL |
| `seo-structure` | 12 PASS / 0 FAIL |

Ce que verrouillent les nouveaux contrôles : trois boutons = trois intentions distinctes ; chaque
intention est déclarée côté tunnel (`FOCUS` ou `SUJETS`) — un bouton qui pointerait une intention
inconnue échoue ; chaque bouton porte sa source ; l'intention d'un devis est inscrite dans l'état
**durable** et pas seulement dans la description ; une intention hors catalogue ne filtre rien ;
un lien d'entrée avec une demande en cours passe toujours par le choix explicite.

## BROWSER_E2E

Preview réelle, onglet propre, stockage vidé entre chaque cas.

**Sans brouillon (1440) — le clic mène directement à son intention, aucun écran intermédiaire :**

| clic | résultat dans l'état du tunnel |
|---|---|
| Entretien chaudière | `mode: intervention`, `fam: chauffage`, **`focus: entretien`**, étape `lieu` |
| Ramonage | `mode: devis`, **`focus: ramonage`**, métier `Chauffage`, nature `Entretien`, description « Ramonage : cheminée, conduit ou poêle… », étape `dv-projet` |
| Poêle ou insert | `mode: devis`, **`focus: poele-insert`**, métier `Chauffage`, nature `Entretien`, description « Entretien de poêle ou d'insert, ramonage compris… », étape `dv-projet` |

**Avec un brouillon ancien sans rapport** (`Devis Plomberie / Réparation`, étape `dv-projet`) :

- les trois clics affichent d'abord « Reprendre votre demande ? » — l'intention est mise en attente,
  rien n'est écrasé en silence ;
- « **Nouvelle demande** » → l'intention cliquée s'applique **exactement** comme sans brouillon
  (vérifié pour les trois), `metiers` ne contient plus `Plomberie` : **aucun retour automatique** ;
- « **Reprendre** » → le brouillon Plomberie reste intact (`Plomberie` / `Réparation`), l'intention
  n'est pas appliquée. Les deux branches se comportent comme annoncé.

**Persistance :**

- rechargement (F5) après « Poêle ou insert » : le tunnel se rouvre sur « Parlez-nous de votre
  projet », récapitulatif « Travaux : Chauffage » / « Projet : Entretien de poêle ou d'insert… »,
  chip « Entretien » sélectionné, description toujours dans le champ ;
- retour arrière navigateur puis réouverture du tunnel : `focus: poele-insert`, étape `dv-projet`,
  métier, nature et description conservés.

**Mobile 375 :** les trois boutons visibles, dans la largeur, débordement horizontal **0 px** ;
clic « Ramonage » → même résultat qu'en 1440 (devis, `focus: ramonage`, Entretien, description).

Correctif apporté pendant ce test : les deux intentions hors catalogue ne laissaient de trace que
dans la description, qui est une donnée personnelle (session, effacée au bout de 2 h). L'intention
est maintenant aussi dans `focus`, champ durable et non personnel. Un sujet inconnu du catalogue
n'y filtre rien — c'est une trace, pas un filtre.

## SHA

- `bc16bc77` fix(home): make the seasonal CTAs open the tunnel with their context
- `39bccc12` fix(tunnel): keep the clicked intention in the durable state, not only in the session description

Branche `recette`. Rien sur `main`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/ — bandeau « Entretien et ramonage :
préparez votre chauffage » sur l'accueil. Vérifié en `?v=20260924b` (les assets sont en cache
immuable un an : le bump est obligatoire, il est fait).

## ROLLBACK

`git revert 39bccc12 bc16bc77` puis `node scripts/bump-module-version.mjs`. Les boutons
redeviennent alors de simples liens vers le catalogue sans contexte — c'est l'état d'avant, pas une
page cassée. Aucune donnée, aucun prix, aucun paiement n'est touché par ce lot, donc aucun retour
arrière côté base ou Stripe.
