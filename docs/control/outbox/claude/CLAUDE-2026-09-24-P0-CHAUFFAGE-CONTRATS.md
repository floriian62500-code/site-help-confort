# Retour — contrats d'entretien sur la page Chauffage

message_id: CLAUDE-2026-09-24-P0-CHAUFFAGE-CONTRATS
repond_a: CHATGPT-2026-09-24-P0-CHAUFFAGE-CONTRATS-MISSING, CHATGPT-2026-09-24-P0-CHAUFFAGE-CONTRATS-PROMOTION
date: 2026-09-24
statut: DONE
production: AUCUNE MUTATION

Les deux instructions portent sur le même bloc : la première demande de le remplir, la seconde de
le rendre vendeur. Un seul changement y répond, d'où un seul retour — les champs demandés par
chacune sont tous ci-dessous.

## ROOT_CAUSE

C'est moi. Le 23/09, en appliquant 5797912022 (« une intention commerciale = une page canonique »),
j'ai retiré les vitrines de contrats des quatre pages chauffagiste pour qu'elles cessent de vendre
en concurrence de `/contrats-entretien.html`. J'ai retiré les **cartes** mais laissé le
**conteneur** : titre « Profitez de notre tranquillité annuelle », paragraphe « Trois formules :
BASIC, CONFORT, SÉCURITÉ » et deux boutons.

Mesuré sur la preview avant correction : section de **349 px de haut**, **0 carte**. La page
promettait trois formules et n'en montrait aucune. Ce n'est pas un fetch qui échoue, ce n'est pas
la base : il n'y avait plus rien à afficher dans le HTML.

Défaut de méthode à retenir : j'ai supprimé du contenu commercial sans vérifier ce que devenait le
bloc qui l'entourait. La règle « prouver 0 usage avant de supprimer » vaut aussi dans l'autre sens —
prouver que ce qui reste tient debout.

## LAST_KNOWN_GOOD

`ebe70ea9`, parent du commit qui a retiré les cartes — `05521baa` « refactor(content): consolidate
boiler maintenance into a single canonical commercial page », du 2026-09-23, retrouvé par
`git log -S'class="ce-card'`. Je ne l'ai
pas restauré tel quel : il contenait la grille tarifaire complète, c'est-à-dire exactement la
duplication de prix que la consolidation devait supprimer (5 vitrines, du HT face au TTC des pages
canoniques). Restaurer l'ancien bloc aurait réparé l'affichage en recréant le défaut d'origine.

## FILES_CHANGED

- `chauffagiste-saint-omer.html`, `chauffagiste-dunkerque.html`, `chauffagiste-calais.html`,
  `chauffagiste-boulogne-sur-mer.html` — trois cartes rétablies, CTA refaits, script mort retiré.
- `scripts/tests/prix-contrats.test.mjs` — contrôle de non-régression (section 8).

## RESTORED_CONTRACTS

BASIC, CONFORT (badge « ★ Le plus choisi »), SÉCURITÉ — libellés, baselines et bénéfices repris
**mot pour mot** du catalogue lu en lecture seule le 24/09 (`v_contract_offers`, via la page
canonique rendue) :

| formule | baseline | contenu affiché |
|---|---|---|
| BASIC | L'essentiel pour rester en règle. | visite annuelle & attestation officielle · rappel automatique 1 mois avant la date |
| CONFORT | Sérénité au quotidien. | tout BASIC inclus · 2 dépannages/an (MO + déplacement) · intervention sous 48 h max |
| SÉCURITÉ | Tranquillité totale. | tout CONFORT inclus · pièces incluses sans frais en gaz, jusqu'à 1 000 € HT en fioul · intervention sous 24 h max |

Aucun contrat créé, aucune offre modifiée. La distinction gaz / fioul est conservée là où elle
existe réellement — la prise en charge des pièces en SÉCURITÉ — sans rejouer deux grilles
complètes : l'énergie se choisit sur la page canonique.

## PRICE_SOURCE

**Aucun tarif n'est écrit dans le teaser.** Les prix ne se disent qu'à un seul endroit,
`/contrats-entretien.html`, qui les lit dans `v_contract_offers`. Le seul repère chiffré de la page
reste celui qui existait déjà dans le paragraphe d'introduction — « dès 9,90 € TTC/mois » —, valeur
présente dans `data/contrats-tarifs.json` et vérifiée par `prix-contrats`.

C'est la réponse directe à « ne pas dupliquer les tarifs dans plusieurs nouvelles sources » : un
teaser sans prix ne peut pas contredire la page canonique, même si les tarifs changent demain.

## FALLBACK

Le bloc ne dépend d'aucun fetch, d'aucun JS, d'aucune base. Il est en HTML statique. Une panne de
Supabase, un CDN bloqué ou un navigateur sans JavaScript laissent les trois formules visibles.
C'est le fallback le plus sûr possible : il n'y a pas de chemin d'échec.

J'ai écarté la variante « fetch `v_contract_offers` + fallback statique » : elle aurait chargé le
SDK Supabase sur quatre pages d'atterrissage SEO pour ne rafraîchir que trois baselines sans prix.
Le coût est réel, le bénéfice nul.

## BLOCK_POSITION (PROMOTION)

Inchangée, et déjà conforme à la demande : après le bloc prestations / savoir-faire chauffage,
avant les chantiers, les avis et la FAQ. Rien à déplacer.

## CONTENT_ADDED (PROMOTION)

Trois cartes, un CTA principal **« Découvrir nos contrats d'entretien → »** vers
`/contrats-entretien.html`, un CTA secondaire **« Juste un entretien ponctuel »** vers le tunnel
pré-contextualisé (`/catalogue.html#cat=chauffage&presta=entretien&src=chauffage-contrats`), et une
ligne qui dit où sont les tarifs et pourquoi ils ne sont écrits qu'à un seul endroit.

Le CTA secondaire ne pointe plus vers `/entretien-chaudiere.html` : conformément à la décision du
jour, la demande d'entretien va au tunnel.

## TEST_BEFORE_FAIL / TEST_AFTER_PASS

Nouveau contrôle (section 8 de `prix-contrats`) : une page qui porte le conteneur de contrats doit
afficher les trois formules **et** mener à la page canonique **et** ne rédiger aucun tarif mensuel.

- sur les pages d'avant : **4 FAIL** (les quatre pages chauffagiste) — 17 PASS / 4 FAIL ;
- après correction : **21 PASS / 0 FAIL**.

Suite complète : 21 fichiers de tests, **0 FAIL** (dont `contrats` 31/31 : la page canonique est
intacte).

## BROWSER_E2E + SCREENSHOTS_1440_390

Preview réelle, `/chauffagiste-saint-omer`.

- **avant** : section 349 px, `0` carte, texte promettant trois formules — KO reproduit et mesuré ;
- **après, 1440** : section 828 px, **3 cartes** (BASIC 2 lignes, CONFORT 3, SÉCURITÉ 3), CONFORT
  mise en avant avec son badge, deux CTA, débordement horizontal **0 px** ;
- **après, 390** : les trois cartes s'empilent, marges 20 px de chaque côté, débordement **0 px** ;
- liens vérifiés en place : `/contrats-entretien` et
  `/catalogue#cat=chauffage&presta=entretien&src=chauffage-contrats` ;
- console : aucune erreur liée aux contrats. La seule erreur présente est le widget « Centre de
  validation » de Netlify qui tente de s'afficher dans un cadre — propre à la preview, absent en
  production.

Les quatre pages portent le même bloc (contrôle automatique), la vérification visuelle a porté sur
Saint-Omer, celle que montrait la capture.

## SHA

`76b6961b` — fix(chauffage): show the three contract formulas again where the page promises them.
Branche `recette`. Rien sur `main`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer

## ROLLBACK

`git revert 76b6961b`. Retour à la section vide — donc à corriger autrement, pas à laisser. Aucune
base, aucun prix, aucun paiement touché.

## Nettoyage au passage

Le script de bascule gaz/fioul de ces pages ne servait plus (aucun élément `.ce-energy-btn` ni
`.ce-pane` depuis la consolidation). Vérifié avant suppression, comme l'exige la règle sur les
fichiers « probablement morts ».
