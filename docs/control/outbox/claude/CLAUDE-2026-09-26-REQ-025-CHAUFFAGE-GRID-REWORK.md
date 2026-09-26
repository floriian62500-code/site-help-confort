# REQ-20260926-025 — bloc prestations Chauffage

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**

## REQUEST_ID

`REQ-20260926-025` — source `CHATGPT-2026-09-26-REQ-025-CHAUFFAGE-GRID-REWORK`, arrivée en
`REWORK_REQUIRED`.

## ROOT_CAUSE

Il y a **deux défauts dans ce constat, et un seul était encore vrai** quand il m'est parvenu. Je
sépare les deux, parce que la réponse n'est pas la même.

**a) Les très grands blocs orange en bas de la grille — déjà corrigé avant le constat.** C'est la
première capture. Cause : en remplaçant la grille, mon motif de remplacement s'est arrêté trop tôt
et les **anciennes cartes sont restées sous les nouvelles**. Les quatre pages affichaient neuf
cartes au lieu de six, les trois dernières sans image, donc en aplat orange pleine largeur. Corrigé
par `91991d4a`, avec une garde qui compte les cartes et refuse les doublons de titre — la page
servie aujourd'hui en compte six, mesurées. La capture montrait une page chargée avant ce correctif.

**b) Les aplats orange sur les cartes sans photo — c'était encore vrai, et c'est le vrai sujet.**
Trois prestations n'ont pas de photo dans la photothèque : Chaudière, Ramonage, Poêle ou insert.
Mon repli était un pictogramme blanc posé sur le dégradé orange de la carte. À 355 × 220 px, ça ne
se lit pas comme un choix graphique : ça se lit comme une image qui n'a pas chargé. Florian a
raison, et la formulation de sa demande est exactement juste — « pas un grand aplat orange vide ».

## WHY_THE_LAYOUT_BROKE

Pour (a) : un motif non gourmand (`[\s\S]*?\n </div>`) qui s'est refermé sur le premier `</div>`
rencontré au lieu de celui de la grille. Rien dans la suite de tests ne comptait les cartes : 719
contrôles verts au moment où la page en affichait neuf. C'est le vrai enseignement — le contrôle
manquant, pas le motif.

Pour (b) : aucune casse de mise en page. Les cartes ont toujours eu la même hauteur, parce que
c'est le conteneur d'image qui la tient (`aspect-ratio: 16/10`), pas l'image. Mesuré sur la
preview **avant** la correction comme après : six cartes de 344 px, zone d'image de 220 px,
identiques. Le défaut était esthétique, pas structurel — je le dis parce que la demande évoque une
« grille cassée », et il est important de savoir qu'une image absente ne peut pas casser la taille
d'une carte ici : c'est déjà garanti par la construction.

## OLD_LAYOUT

- 6 cartes, 3 avec image, 3 avec pictogramme blanc **sur aplat orange plein** ;
- hauteurs déjà homogènes (344 px en 1440, 341 px en 390) ;
- le reste inchangé : titre, texte, flèche, lien.

## NEW_LAYOUT

Le repli devient un vrai traitement graphique :

- fond **clair** (dégradé #F7FAFD → #E9F1F8) au lieu de l'orange plein ;
- fines diagonales à 4,5 % d'opacité — une texture, pas un vide ;
- au centre, un **médaillon blanc** de 74 px, bordure discrète et ombre douce, contenant le
  pictogramme **de la prestation** en orange de marque : une chaudière murale pour Chaudière, une
  brosse pour Ramonage, un insert pour Poêle ou insert ;
- le médaillon s'agrandit de 4 % au survol, comme les photos zooment déjà.

Les six prestations restent : Chaudière, Dépannage urgence, Entretien annuel, Ramonage, Poêle ou
insert, **Désembouage** — je le garde, c'est la seule carte qui porte une vraie photo de chantier.

## IMAGE_SOURCE_MAP

| carte | source du visuel | nature |
|---|---|---|
| Chaudière | *aucune* → repli médaillon | pictogramme chaudière |
| Dépannage urgence | bucket `prestations/depannage-recherche-panne-chauffage.jpg` | visuel de catalogue de la marque, cadré en portrait → `object-fit: contain` sur fond clair |
| Entretien annuel | bucket `prestations/contrat-chauffage-confort-gaz.jpg` | visuel de catalogue de la marque → `contain` |
| Ramonage | *aucune* → repli médaillon | pictogramme brosse |
| Poêle ou insert | *aucune* → repli médaillon | pictogramme insert |
| Désembouage | bucket `prestations/desembouage-radiateur.jpg` | **photo de chantier réelle**, paysage → `object-fit: cover` |

Le bucket est celui que le catalogue utilise déjà (`.../storage/v1/object/public/prestations/`).
Il ne contient **aucune** photo de chaudière, de ramonage ni de poêle : vérifié en le listant.
Le seul fichier local nommé « ramonage » est une photographie d'archive en noir et blanc d'un
ramoneur du XIXᵉ siècle, affichée nulle part.

**Trois photos à fournir** pour supprimer les trois derniers médaillons : une chaudière posée, un
ramonage en cours, un poêle ou insert entretenu. Paysage de préférence. Le câblage sera immédiat.

## FALLBACK_RULE

1. La hauteur de la carte ne dépend **jamais** de l'image : c'est le conteneur qui la fixe
   (`aspect-ratio: 16/10`). Une image absente, lente ou cassée ne change pas la grille.
2. Pas de photo disponible → médaillon sur fond clair texturé, avec le pictogramme **de la
   prestation** (pas un pictogramme générique).
3. Photo présente mais cadrée en portrait ou sur fond blanc → `contain` sur fond clair, jamais
   `cover` : recadrer un visuel portrait en 16/10 coupe le sujet.
4. Photo de chantier paysage → `cover`, qui remplit sans déformer.
5. Les cartes photo gardent leur `onerror` vers le fichier local équivalent quand il existe.

## SCREENSHOTS_1440_390

- **390** — capture faite : les cartes s'enchaînent en colonne, toutes à 341 px ; la carte
  Chaudière montre le médaillon blanc sur fond clair, la suivante la photo du dépannage, puis le
  visuel « CONTRAT » ;
- **1440** — **mesuré, non capturé** : six cartes de 344 px de haut, zones d'image de 220 px,
  hauteurs strictement identiques (un seul ensemble de valeurs), 0 débordement horizontal. Je le
  dis tel quel : la capture d'écran à cette profondeur de page est revenue blanche cinq fois de
  suite sur mon outil, alors que le DOM répondait correctement. Je préfère livrer la mesure et
  signaler l'échec de la capture plutôt que de laisser croire que j'ai regardé.

## FILES_CHANGED

`chauffagiste-saint-omer.html`, `chauffagiste-dunkerque.html`, `chauffagiste-calais.html`,
`chauffagiste-boulogne-sur-mer.html` et `scripts/tests/pages-metier.test.mjs`.

## TESTS

Suite complète : **784 contrôles, 0 échec**, SEO `ERRORS=0`.

Gardes qui couvrent ce défaut :

- `pages-metier` : aucune carte prestation en double (par son titre), ancres uniques — la garde
  née du défaut (a), qui échoue contre l'état fautif en nommant les quatre pages et leurs neuf
  cartes ;
- `pages-metier` : aucun bouton de consultation n'ouvre le tunnel (voir le rapport de routage) ;
- `prix-contrats` : la section contrats ne recopie aucune carte détaillée.

## SHA

`0f09e466` sur `recette`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#ramonage

Forcer le rechargement : les pages HTML restent en cache côté navigateur — les deux captures du
constat montraient un état antérieur au correctif `91991d4a`.

## ROLLBACK

```
git revert --no-commit 0f09e466 && git commit
```

Style en ligne dans les pages, aucun asset versionné : rien à rebumper.

## NO_PROD_MUTATION_PROOF

- commit présent sur `recette` uniquement ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- fichiers touchés : 4 pages HTML + 22 pages pour le routage (rapport séparé) + 1 fichier de test.
  **0** fichier sous `supabase/`, `assets/`, `.github/`, `netlify.toml`, `_redirects` ;
- les images sont **lues** depuis le bucket public par leur URL ; aucune écriture, aucun
  téléversement ;
- aucun formulaire soumis, aucune demande envoyée.

## Un point voisin que je n'ouvre pas

Le même repli orange existe sur les pages **électricien**, **serrurier** et **vitrier** (3 cartes
sans photo chacune). La règle de gel dit de ne pas ouvrir un autre sujet : je le signale, je ne le
touche pas. Ce sera une REQ dédiée, et elle sera courte — le style de repli est déjà écrit.
