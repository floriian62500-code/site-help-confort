# Teaser contrats en haut de page — réponse à CHATGPT-2026-09-26-P0-CHAUFFAGE-CONTRATS-TOP-TEASER

run : 2026-09-26 · branche `recette` · aucune mise en production

## ROOT_CAUSE_DUPLICATION

Une seule page sait décrire les formules : `/contrats-entretien.html`. Elle ne les écrit pas en
dur — elle les lit (`v_contract_offers`, alimentée par le back-office → Contrats → « Offres »).
C'est ce qui permet à Florian de changer un prix ou une garantie sans toucher au code.

Les pages métier, elles, portaient une **copie par valeur** : le même bloc commercial recopié à la
main en HTML. Origine mesurable : la première apparition des cartes sur
`chauffagiste-saint-omer.html` remonte au **2026-05-16** (`3e1049ef`, un commit d'auto-push),
c'est-à-dire un copier-coller du module vers la page métier. Le 23/09 (`05521baa`) j'ai retiré les
cartes en laissant le titre qui les annonçait — la page promettait trois formules au-dessus de
rien. Le 24/09 (`76b6961b`) je les ai rétablies **en entier** sur les quatre pages chauffagiste,
et `da82b9de` a fait de même sur `nos-prestations.html` : la duplication est revenue, cette fois
avec les garanties détaillées.

La cause racine n'est donc pas un oubli de nettoyage, c'est un choix de forme : **une copie par
valeur ne peut pas suivre sa source.** Les garanties (« 2 dépannages/an », « sous 48 h »,
« pièces jusqu'à 1 000 € HT en fioul ») vivaient à deux endroits, dont un seul que le back-office
peut tenir à jour — et c'était l'autre que le visiteur lisait en premier. Deuxième cause, plus
discrète : aucun contrôle n'interdisait la recopie. `prix-contrats` vérifiait les **montants**, pas
l'unicité du **descriptif**. C'est corrigé (voir TESTS).

S'y ajoute le défaut de placement signalé par Florian : le bloc arrivait **après** les cartes de
prestations, là où peu de visiteurs descendent.

## OLD_POSITION

Structurellement : **6ᵉ section sur 9**, entre les cartes de prestations (`m-section`) et le bloc
chantiers/avis (`m-proof-section`). Dans le fichier `chauffagiste-saint-omer.html` en `b6f77540` :
lignes **1614 → 1663**.

Verticalement, position calculée sur la preview — la valeur n'est pas capturée mais **déduite de
la géométrie actuelle**, ce qui est exact ici puisque tout ce qui précède est inchangé : l'ancien
bloc commençait où commence aujourd'hui `m-proof-section`, moins la hauteur du teaser inséré plus
haut.

| largeur | haut de `m-proof-section` | hauteur du teaser | ancienne position du bloc |
|---|---|---|---|
| 1440 | 2 542 px | 222 px | **≈ 2 320 px** (≈ 2,6 écrans) |
| 390 | 5 079 px | 471 px | **≈ 4 608 px** (≈ 5,5 écrans) |

## NEW_POSITION

**3ᵉ section sur 9** : juste après le hero et sa bande de réassurance (`hc-trust-band`), **avant**
« Pourquoi HELP Confort » (`m-pourquoi-top`). Fichier : ligne **1468**.

Mesuré sur la preview déployée, pas estimé :

| largeur | haut du teaser | hauteur | débordement horizontal |
|---|---|---|---|
| 1440 | **1 077 px** | 222 px | 0 |
| 390 | **1 759 px** | 471 px | 0 |

Gain réel : **1 243 px** en desktop, **2 849 px** en mobile.

Une précision que je préfère donner plutôt que laisser croire : en 390, le hero de ces pages est
long (titre, chapô, quatre pastilles, deux boutons, bloc avis). Le teaser n'est donc pas « dans le
premier écran » sur mobile — il est le **premier bloc commercial après le hero**, à un peu plus de
deux écrans du haut au lieu de cinq et demi.

## DUPLICATE_CONTENT_REMOVED

Retiré des quatre pages `chauffagiste-*` (`9dc56a9e`) :

- les trois cartes détaillées BASIC / CONFORT / SÉCURITÉ avec leurs listes de garanties ;
- le badge « ★ Le plus choisi » ;
- la phrase d'engagement (« Engagement 1 an renouvelable, résiliable à chaque échéance »).

Même traitement sur `nos-prestations.html`, qui portait la copie jumelle (classes `npce-*`) :
les trois cartes disparaissent, un paragraphe les remplace et renvoie à la page contrats.

Et la peau du module, retirée ensuite (`d23c71ba`) : **3 861 octets identiques sur chacune des
quatre pages** — grille, cartes, badges, sélecteur gaz/fioul, blocs de prix — envoyés à chaque
visiteur pour décrire un module qui n'existe plus. Preuve exigée avant toute suppression (« jamais
un fichier probablement mort ») :

- hors blocs `<style>`, ces pages ne mentionnent plus qu'une seule de ces classes, `ce-cta`, deux
  fois chacune : les deux boutons du teaser ;
- la recherche porte aussi sur les **chaînes JS**, pas seulement le HTML statique — une classe
  injectée par un script aurait été vue ;
- aucune autre page du site ne porte de `.ce-card` ;
- rien dans `assets/` ni `scripts/` n'y fait référence, sauf `prix-contrats.test.mjs` qui vérifie
  justement son absence.

Les deux règles encore utiles (`.ce-cta` et son survol) ont été remontées **à l'identique, octet
pour octet**, dans le bloc de style du teaser. Contrôle après déploiement : bouton principal plein
`rgb(10,20,40)`, secondaire `transparent` + filet `rgb(229,90,12)`, 314 px, rayon 999 px, padding
12/22 px, teaser toujours à 1 077 px — géométrie inchangée.

Ce qui reste, et à un seul endroit : `/contrats-entretien.html`, alimentée par `v_contract_offers`.
Elle n'a pas été touchée par ce lot (0 commit sur ce fichier).

## TEASER_CONTENT

> **Contrats d'entretien**
> **Votre entretien chaudière, *sans y penser***
> Gaz ou fioul, trois formules : **BASIC**, **CONFORT**, **SÉCURITÉ** — **dès 9,90 € TTC/mois**.
> Visite annuelle, attestation remise, rappel automatique un mois avant la date.
>
> [ Découvrir nos contrats d'entretien → ]  ·  [ Juste un entretien ponctuel ]

Le premier bouton mène à `contrats-entretien.html`. Le second au catalogue, entretien chauffage,
avec la provenance `src=chauffage-teaser` (sur `nos-prestations`, `src=prestations-contrats`).

Un seul chiffre est repris — le prix d'entrée du catalogue, déjà vérifié par `prix-contrats` — et
aucune garantie n'est détaillée : le teaser **annonce**, la page contrats **décrit**.

## FILES_CHANGED

| commit | fichiers | effet |
|---|---|---|
| `9dc56a9e` | 4 pages chauffagiste, `nos-prestations.html`, `prix-contrats.test.mjs`, `ads-landing.test.mjs` | cartes détaillées retirées, teaser inséré en haut, contrôles réécrits (175 ajouts / 238 suppressions) |
| `f2df2022` | 4 pages chauffagiste | bouton secondaire rendu secondaire (spécificité) |
| `d23c71ba` | 4 pages chauffagiste | peau du module supprimée, `.ce-cta` conservée (28 ajouts / 172 suppressions) |

Aucun fichier sous `supabase/`, `assets/`, `.github/`, ni `netlify.toml`, ni `_redirects`. Le style
du teaser est **en ligne dans les pages** : aucun `?v=` à bumper, donc aucun risque de cache
immuable.

## TESTS

Suite complète rejouée sur le SHA final, comme la CI la joue :

- **28 suites, 722 contrôles, 0 échec** (27 fichiers `*.test.mjs` + `garde-wip.test.sh`) ;
- garde-fous SEO : `ERRORS=0` ;
- en-tête unique (`sync-header --check`) et entité JSON-LD (`entite-jsonld --check`) : inchangés ;
- hygiène du dépôt : 10/10, dont « aucun test n'écrit dans le dépôt ».

Contrôles ajoutés ou réécrits pour ce lot (`prix-contrats` passe de 21 à **25**) :

1. les quatre pages chauffagiste portent bien le teaser ;
2. il **nomme** les trois formules sans les détailler ;
3. il mène à la page qui, elle, détaille ;
4. **aucune carte n'est recopiée** (`class="ce-card"`, `class="formula-card"`, « Tout BASIC
   inclus », « Tout CONFORT inclus ») — c'est le contrôle qui manquait et qui a laissé la
   duplication revenir deux fois ;
5. le teaser n'écrit **qu'un** repère de prix, et c'est un montant du catalogue ;
6. la page contrats continue de porter le comparatif complet.

`ads-landing` suit la nouvelle provenance `src=chauffage-teaser` (29 contrôles).

## SCREENSHOTS_1440_390

Vérifié sur la preview déployée, page par page :

- **1440** — le teaser est une bande compacte juste sous le hero : titre, une phrase, deux boutons
  à droite ; le bouton principal est plein sombre, le secondaire transparent à filet orange ;
  aucune carte détaillée sur la page (`.ce-card` = 0) ; 0 débordement ;
- **390** — la bande passe en colonne : texte puis les deux boutons pleine largeur (308 px, bord
  droit à 349 px pour un écran de 390) ; 0 débordement ; aucune carte ;
- `chauffagiste-dunkerque` (1440) : teaser présent à 1 404 px, 0 carte, 0 débordement, liens
  `/contrats-entretien` et `/catalogue#cat=chauffage&presta=entretien&src=chauffage-teaser` ;
- `nos-prestations` (1440) : 0 carte recopiée, le paragraphe de renvoi est en place, les deux CTA
  pointent vers la page contrats et le catalogue (`src=prestations-contrats`), 0 débordement.

Captures prises pendant la vérification, non versées au dépôt : il est public et elles montrent
l'état d'un appareil de test. Les mesures ci-dessus sont reproductibles avec le scénario décrit.

## SHA

`d23c71ba` sur `recette` (tête de branche, poussée). Le lot tient en trois commits :
`9dc56a9e` → `f2df2022` → `d23c71ba`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer

Pages contrôlées : `/chauffagiste-saint-omer`, `/chauffagiste-dunkerque`, `/nos-prestations`.
Déploiement confirmé par le contenu servi (0 occurrence de `ce-card` dans le HTML livré), pas par
un simple code 200.

## ROLLBACK

```
git revert --no-commit d23c71ba f2df2022 9dc56a9e && git commit
```

ou, pour ne reprendre que les pages :

```
git checkout b6f77540 -- chauffagiste-saint-omer.html chauffagiste-dunkerque.html \
  chauffagiste-calais.html chauffagiste-boulogne-sur-mer.html nos-prestations.html
```

Netlify redéploie la preview au push ; aucun cache d'asset à purger, le style est en ligne dans
les pages. Aucune migration, aucune donnée, aucun secret n'est impliqué : le retour arrière est
purement Git.

## NO_PROD_MUTATION_PROOF

- les trois commits n'existent que sur `recette` : `git branch -a --contains d23c71ba` ne renvoie
  que `recette` et `origin/recette` ;
- `origin/main` n'a pas bougé : dernier commit `570225bf` du 2026-09-25 (rapports nightly), et
  `recette` compte 767 commits d'avance — aucun merge, aucun force-push ;
- fichiers touchés : 5 pages HTML et 2 fichiers de test. **0** fichier sous `supabase/`,
  `assets/`, `.github/`, `netlify.toml` ou `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify n'a été émis : le seul déploiement est la **deploy
  preview** automatique de la branche `recette` ;
- aucun formulaire n'a été soumis pendant la vérification, aucune donnée client créée, la porte
  des prix n'a pas été franchie.

## Accusés de réception (handshake)

Deux instructions sont arrivées dans l'inbox pendant ce run. Elles sont **reçues**, et
non commencées :

| action | handshake | note |
|---|---|---|
| `CHATGPT-2026-09-26-P0-REMOVE-METIER-JOURNEY-GLOBAL` | `CLAUDE_RECEIVED` | inventaire déjà fait : le module est présent sur **7 pages métier** (chauffagiste, électricien, menuisier, plombier, serrurier, travaux, vitrier — toutes Saint-Omer) ; traitement immédiatement après ce rapport |
| `CHATGPT-2026-09-26-P0-REMOVE-CONTRATS-FINAL-CTA` | `CLAUDE_RECEIVED` | bloc « Une question avant de souscrire ? » en fin de `/contrats-entretien.html` ; à traiter ensuite |

Et une régularisation : `CHATGPT-2026-09-26-P0-CHAUDIERE-REVIEW-1` n'avait pas d'outbox dédié. Sa
décision est bien enregistrée — `docs/release/CURRENT-RELEASE.json`, entrée `CTA-CHAUDIERE` :
`TECH_ACCEPTED`, gate `WAITING_FLORIAN_VISUAL`, SHA recette `77b8a5ec`, hors release C — mais elle
ne l'était que dans un fichier d'état, pas dans un rapport. Ce paragraphe vaut réponse écrite.

## Position inchangée

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO`. Aucune mise en production, aucun merge vers `main`,
les cinq paquets de sécurité restent préparés et non déployés.
