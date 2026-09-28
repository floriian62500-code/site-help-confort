# REQ-20260926-032 — Refonte « Nos métiers » : diagnostic, proposition, plan

> Demande Florian du 2026-09-28. **Aucune ligne de code n'a été écrite.** Ce document et la
> maquette qui l'accompagne sont les livrables 1 à 6 ; le livrable 7 est l'attente de validation.
> Maquette cliquable : **https://claude.ai/artifact/2WW7DyBSsoJmM8oCW5pNsm**
> (page privée — seul Florian y accède, sauf partage explicite de sa part).

---

## 1. Diagnostic de l'existant

### 1.1 La page que vous demandez existe déjà — et personne ne peut la trouver

`nos-metiers.html` est dans le dépôt, **36,9 Ko**, et elle répond **200 en production**
(`https://depan59-62.fr/nos-metiers`) comme sur la preview. Mais :

- **aucun lien du site n'y mène.** Deux fichiers seulement la citent : elle-même, et un rapport
  d'audit d'août. Le menu « Métiers » ne la référence pas ;
- elle n'est donc atteignable qu'en tapant l'URL, ou depuis Google.

C'est une page orpheline en ligne. Le premier gain de ce chantier n'est pas d'en créer une :
c'est de **rebrancher celle-ci**.

### 1.2 Ce que fait le menu « Métiers » aujourd'hui

Le menu déroulant envoie directement vers les **neuf pages ville de Saint-Omer** :
`/plombier-saint-omer.html`, `/chauffagiste-saint-omer.html`, `/electricien-saint-omer.html`,
`/serrurier-saint-omer.html`, `/vitrier-saint-omer.html`, `/menuisier-saint-omer.html`,
`/travaux-saint-omer.html`, `/volets-saint-omer.html`, `/pmr-saint-omer.html`, plus
« Contrats d'entretien ». Le mot « Métiers » lui-même n'est pas cliquable vers une page.

Conséquence : **un métier = une page de ville**. Un visiteur de Calais qui clique « Plomberie »
atterrit sur une page « Plombier Saint-Omer ». C'est le nœud du problème de lisibilité.

### 1.3 L'état réel de la page orpheline

| constat | détail |
|---|---|
| titre | « Nos **8** métiers » alors que la page en liste **neuf** |
| texte d'accroche | cite des « peintres », métier absent du menu et de l'offre affichée |
| visuels | **aucun** : neuf cartes de texte, une pastille de ville par carte |
| appels à l'action | **aucun devis, aucun achat** — seulement un numéro de téléphone en bas |
| mise en page | correcte mais générique ; rien qui ressemble à une vitrine de marque |

Autrement dit : la matière est là (les neuf descriptions sont bonnes et réutilisables), la
présentation et la conversion ne le sont pas.

### 1.4 Ce qu'on peut réellement vendre en ligne, métier par métier

Lu le 2026-09-28 dans `v_services_public` (la source publique des prestations) : **34 prestations
publiées**, dont **29 à prix fixe** et **5 sur devis**.

| métier | prestations publiées | achetables en ligne | à partir de |
|---|---|---|---|
| Plomberie | 15 | 15 | 114 € TTC |
| Chauffage | 6 | 6 | 105 € TTC |
| Serrurerie | 5 | 5 | 98 € TTC |
| Électricité | 2 | 1 | 114 € TTC |
| Vitrerie | 2 | 1 | 120 € TTC |
| Travaux & Rénovation | 4 | **0** (toutes sur devis) | — |
| **Menuiserie** | **0** | 0 | — |
| **Volets** | **0** | 0 | — |
| **Adaptation PMR** | **0** | 0 | — |

**C'est le point dur de votre demande.** Vous voulez « 2 CTA maximum : devis + achat en ligne si
prestation packagée ». Aujourd'hui, **quatre métiers sur neuf n'ont rien à vendre en ligne**, et
trois d'entre eux n'ont même aucune prestation publiée. Leur page ne pourra afficher qu'un devis.
Ce n'est pas un choix de maquette, c'est l'état du catalogue — et c'est une décision qui vous
revient (§ 7).

### 1.5 La règle qui encadre ce chantier

`docs/process/REGLE-PAGE-CANONIQUE.md`, imposée le 2026-09-20 après une landing parallèle de
qualité inférieure : **SEARCH_EXISTING → IDENTIFY_CANONICAL → REUSE_OR_EXTEND → CREATE_ONLY_IF_NONE**.
Une URL nouvelle n'est permise que si aucune page existante ne couvre le besoin. Ici une page
existe. **Donc : on refond, on ne crée pas.** Le registre `docs/seo/pages-canoniques.json` fixe par
ailleurs trois destinations à ne pas dupliquer :

- entretien chaudière (gaz et fioul) → `/chauffagiste-saint-omer.html` ;
- ramonage et entretien poêle / insert → `/prestations/ramonage.html` ;
- contrats d'entretien → `/contrats-entretien.html`.

### 1.6 Volume concerné

265 pages HTML suivies. Les pages métier × ville : **26** (plomberie, chauffage, électricité,
serrurerie sur 4 villes ; vitrerie, menuiserie, volets, PMR, rénovation sur 2). Elles ne bougent pas
dans ce chantier.

---

## 2. Proposition UX

### 2.1 Le principe : trois niveaux, pas quatre

```
ACCUEIL ─── bloc « Nos métiers » (vue d'ensemble) ──┐
                                                    ↓
                        PAGE « NOS MÉTIERS »  ← le menu « Métiers » y mène
                        maison cliquable, 9 zones
                                      │
              ┌───────────────────────┼───────────────────────┐
              ↓                       ↓                       ↓
      PAGE MÉTIER / VILLE     CATALOGUE FILTRÉ         DEVIS ou ACHAT
      (existante, inchangée)  /nos-prestations         (tunnels existants)
```

Trois niveaux : **je découvre → je choisis mon métier → j'agis**. Aucun quatrième hub. Le
`/catalogue` reste le parcours « Commander » et ne réaffiche pas les métiers : pas de doublon
de navigation.

### 2.2 Ce qui change dans la navigation

| aujourd'hui | demain |
|---|---|
| « Métiers » = menu déroulant seul, non cliquable | « Métiers » = **lien vers `/nos-metiers.html`** + le déroulant conservé |
| le déroulant liste 9 pages de Saint-Omer | il garde les 9 entrées, précédées de « **Voir tous nos métiers** » |
| la page métiers est orpheline | elle devient la porte d'entrée du menu et du bloc d'accueil |
| l'accueil liste les métiers en pastilles décoratives | l'accueil montre une **vue d'ensemble** qui envoie vers la page |

Le visiteur pressé garde son accès direct (le déroulant), le visiteur qui découvre a enfin une
page qui explique l'offre.

### 2.3 Ce que fait la page « Nos métiers »

1. **Une maison en coupe**, neuf zones cliquables — une par métier. C'est la vue d'ensemble
   que vous demandiez : on voit d'un coup d'œil que l'entreprise couvre toute la maison.
2. **Un panneau qui répond sans recharger** : au clic sur une zone, le panneau donne le métier,
   la pièce concernée, la description, **trois tarifs réels**, puis **deux actions maximum**.
3. **Deux CTA, jamais trois** : « Réserver en ligne — prix affiché » (uniquement pour les cinq
   métiers qui ont un tarif public) et « Demander un devis gratuit ». Pour les quatre autres,
   un seul bouton et une phrase honnête : pas de tarif public, la demande passe par le devis.
4. **La grille des neuf métiers** en bas, pour ceux qui préfèrent lire une liste — et pour le
   référencement, qui a besoin de liens texte vers les pages métier.
5. **Aucune page métier n'est remplacée** : chaque carte renvoie vers la page existante.

### 2.4 Mobile

La maison reste, avec des pastilles numérotées plus grosses (52 px de cible), mais **la liste des
neuf métiers en deux colonnes devient le moyen de navigation principal** : sur 390 px, viser une
zone d'un dessin n'est pas fiable. La maison sert alors à comprendre, la liste à naviguer. C'est
volontaire, et c'est visible dans la maquette mobile.

---

## 3. Proposition visuelle

**https://claude.ai/artifact/2WW7DyBSsoJmM8oCW5pNsm** — quatre planches :

1. page « Nos métiers » **desktop 1440** (maison cliquable, panneau, grille) ;
2. page « Nos métiers » **mobile 390** ;
3. bloc « Nos métiers » sur l'**accueil desktop 1440** ;
4. bloc « Nos métiers » sur l'**accueil mobile 390**.

Les deux planches de page sont **réellement cliquables** (bouton Lecture) : on choisit une pièce,
le panneau change. Ce n'est pas une image.

Parti pris respecté : charte existante (bleu `#0DA0CF`, encre `#0A6C8F`, marine `#0A1428`, orange
`#B83E0A`, fond `#F3F5F8`), Plus Jakarta Sans et Playfair Display en italique — les polices déjà
chargées par le site. **Tous les chiffres affichés sont réels** (34 prestations, tarifs lus en
base, 343 avis Google, 4,7). Aucune photo inventée : le dessin est un SVG, il pèse ~8 Ko et se
charge instantanément, là où neuf photos pèseraient plusieurs centaines de kilo-octets.

---

## 4. Plan de pages : conservées, refondues, simplifiées

### Conservées à l'identique — aucune suppression, aucune 301
- les **26 pages métier × ville** ;
- `/nos-prestations.html` (le catalogue, 34 prestations) ;
- `/contrats-entretien.html` ;
- `/prestations/*.html` (dont `ramonage.html`) ;
- `/catalogue.html` (tunnel de commande) et les tunnels devis / achat : **rien n'y est touché**.

### Refondue — une seule page
- `/nos-metiers.html` : même URL, même fichier, contenu refait. Pas de nouvelle adresse, donc
  aucun risque de cannibalisation ni de redirection.

### Simplifiées — dans un lot séparé, après validation visuelle
- les 9 pages métier de Saint-Omer : ramener les appels à l'action à **deux** (devis + achat si
  le métier a des prestations à prix fixe). Ce lot rejoint REQ-020, déjà ouverte sur le même sujet.

### Où vont les prestations que vous citez

| sujet | destination | raison |
|---|---|---|
| entretien chaudière gaz / fioul | `/chauffagiste-saint-omer.html` | page canonique déclarée |
| ramonage, poêle, insert | `/prestations/ramonage.html` | page canonique déclarée |
| chauffe-eau / ECS | catalogue, catégorie Plomberie (« Contrat entretien chauffe-eau annuel », 220 € TTC) | c'est là qu'il est publié aujourd'hui ; la question de l'offre ECS annuelle est **REQ-018**, non tranchée |
| contrats d'entretien | `/contrats-entretien.html` | page canonique ; la page Métiers y renvoie, elle ne la duplique pas |

---

## 5. Plan technique d'implémentation

Quatre lots isolés, un commit par lot, dans cet ordre. **Aucun ne démarre avant votre validation.**

| lot | contenu | fichiers | risque |
|---|---|---|---|
| **A** | refonte de la page | `nos-metiers.html` seul | faible — un seul fichier, page aujourd'hui orpheline |
| **B** | branchement du menu | `partials/hc-header.html` puis propagation par `scripts/header/sync-header.mjs` | **moyen** : l'en-tête est propagé sur 265 pages ; c'est le lot à surveiller |
| **C** | bloc sur l'accueil | `index.html` | faible |
| **D** | 2 CTA sur les pages métier | 9 pages métier | moyen — se coordonne avec REQ-020 |

Choix techniques : **SVG inline**, pas de librairie, pas d'image à télécharger, ~8 Ko ; le
comportement de sélection tient en une trentaine de lignes de JavaScript sans dépendance ; aucun
appel réseau nouveau ; aucun fichier dans `assets/` (donc pas de question de cache immuable), sauf
si vous voulez de vraies photos par métier — auquel cas il faudra les fournir, et ce sera un lot E.

Contrôles à passer avant chaque commit : suite complète (31 fichiers, 840 contrôles),
`duplicate-intent`, `canonical-pages`, `header`, `seo-guardrails` à **ERRORS=0**, puis QA visuelle
réelle sur la preview en **1440 et 390**, captures à l'appui.

---

## 6. Plan de retour arrière

1. **Avant le premier lot** : branche de sauvegarde immuable
   `backup/recette-2026-XX-XX-avant-metiers`, figée sur le SHA de départ, jamais déplacée.
2. **Par lot** : chaque lot est un commit unique, donc `git revert --no-commit <sha> && git commit`
   suffit à l'annuler sans toucher aux autres.
3. **Sur la page seule** : `git checkout <sha> -- nos-metiers.html` ramène l'ancienne version en
   une commande, puisque le lot A ne touche qu'un fichier.
4. **Sur le menu** (le lot le plus large) : `git checkout <sha> -- partials/hc-header.html` puis
   `node scripts/header/sync-header.mjs` régénère les 265 pages dans leur état antérieur ;
   `--check` prouve le retour.
5. **Rien en production** : tout reste sur `recette`. La production ne bouge qu'après votre GO
   explicite, et `HOLD_SECURITY` (REQ-001 / REQ-013) reste actif de toute façon.

---

## 7. Ce que j'attends de vous avant de coder

1. **La maquette vous convient ?** Si oui, je pars sur les lots A → D. Si non, dites ce qui cloche
   et je refais la planche concernée — c'est fait pour ça.
2. **Les quatre métiers sans prestation** (Menuiserie, Volets, PMR, et Rénovation en devis seul) :
   on assume le « devis uniquement », ou vous voulez qu'on leur publie des prestations à prix fixe ?
   C'est une décision commerciale, pas technique.
3. **Des photos par métier ?** La maquette fonctionne sans. Si vous en voulez, il m'en faut neuf —
   et cela devient un lot E avec un coût de chargement à surveiller.

Tant que ces réponses ne sont pas là, je ne touche à rien.

---

## Rappel de méthode

Ce chantier **ne lève pas le gel en cours** : REQ-023 (les quatre pôles de la page Zones) attend
toujours votre validation visuelle, et rien ne se code avant. La présente proposition est un
document, pas une modification du site : aucun fichier public n'a été touché pour la produire.
