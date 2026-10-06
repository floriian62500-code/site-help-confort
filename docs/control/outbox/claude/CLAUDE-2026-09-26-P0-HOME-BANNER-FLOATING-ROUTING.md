# Encart flottant + routage Chauffage + prestations visuelles — réponse à CHATGPT-2026-09-26-P0-HOME-BANNER-FLOATING-ROUTING

run : 2026-09-26 · branche `recette` · aucune mise en production
handshake : `CLAUDE_RECEIVED` → `CLAUDE_IN_PROGRESS` → **`CLAUDE_ANSWERED`**

## ROOT_CAUSE

Trois causes distinctes, qui se sont additionnées à l'écran :

1. **La bannière a été conçue comme une section de contenu.** Elle est née le 2026-09-18 en tant que
   `<section class="hc-season">` posée entre « Que souhaitez-vous faire ? » et les apporteurs
   d'affaires. Une mise en avant commerciale qui occupe une place dans le flux devient un pavé :
   elle interrompt la lecture au lieu de l'accompagner.
2. **Deux boutons sur trois visaient le tunnel.** Le 25/09, sur décision de Florian, « Entretien
   chaudière » a été recâblé vers la page Chauffage. Les deux autres sont restés sur
   `/catalogue.html#devis&sujet=…` faute de page métier dédiée — ce qui était vrai à ce moment-là.
   Conséquence directe : avec un brouillon sur l'appareil, ces deux boutons ouvraient l'écran
   « Vous avez une demande en cours », exactement la capture de Florian.
3. **La page Chauffage n'était pas prête à recevoir ce trafic.** Ses cartes prestations avaient
   perdu leurs photos le 2026-05-16 (`1eeea513`) : les images étaient des liens Unsplash externes,
   retirés dix minutes après leur ajout. Restaient trois cartes sur les six annoncées par le
   commentaire du code, avec un dégradé orange et un pictogramme. Envoyer le trafic marketing vers
   une page qui ne montre pas l'offre n'aurait fait que déplacer le problème.

## OLD_BEHAVIOR

| | avant |
|---|---|
| bannière | `<section>` dans le flux, entre deux sections, pleine largeur |
| Entretien chaudière | → `/chauffagiste-saint-omer.html` (depuis le 25/09) |
| Poêle ou insert | → `/catalogue.html#devis&sujet=poele-insert&src=home-saison` → **tunnel** |
| Ramonage | → `/catalogue.html#devis&sujet=ramonage&src=home-saison` → **tunnel** |
| avec un brouillon | écran « Vous avez une demande en cours » |
| page Chauffage | 3 cartes, 0 photo, aucune ancre |

## NEW_HOME_BANNER_BEHAVIOR

C'est maintenant un **encart flottant**, `<aside class="hcs-flot">`, en fin de `<body>` :

- **position fixe**, en bas à gauche en desktop (24 px des bords, 370 px de large), `z-index` 9990
  — sous le bouton « Devis express » de la page, jamais par-dessus ;
- **il n'occupe aucune place dans le document** : mesuré sur la preview, la hauteur de page est
  identique avant et après son apparition. Aucun déplacement de contenu ;
- **il n'apparaît qu'une fois le hero dépassé** (60 % de la hauteur d'écran). Une publicité qui
  recouvre l'accueil dès la première seconde est une nuisance, pas une mise en avant ;
- **il se ferme** par une croix, et ne revient pas **de la semaine** (mémoire locale, aucune donnée
  personnelle) — vérifié en ligne : fermé, puis rechargement, il reste absent ;
- **en mobile** il se pose au-dessus de la barre d'action collante : 12 px de marge à gauche et à
  droite, 84 px du bas. Il ne recouvre ni la barre, ni le bouton d'appel ;
- l'animation d'apparition respecte `prefers-reduced-motion`, et les boutons gardent leur contour
  de focus clavier.

La mesure d'audience est conservée à l'identique (`view_home_maintenance_promo` à 50 % visible une
seule fois, `click_home_maintenance_promo` par famille, GA4 en production seulement).

## NEW_CTA_TARGETS

| bouton | destination | ancre |
|---|---|---|
| Entretien chaudière | `/chauffagiste-saint-omer.html#entretien` | carte « Entretien annuel » |
| Poêle ou insert | `/chauffagiste-saint-omer.html#poele-insert` | carte « Poêle ou insert » |
| Ramonage | `/chauffagiste-saint-omer.html#ramonage` | carte « Ramonage » |

Aucun bouton ne vise plus `/catalogue…`, donc aucun ne peut retomber sur l'écran de reprise.
L'enchaînement demandé est en place : **accueil → encart promo → page Chauffage → prestation →
tunnel seulement ensuite**.

Vérifié en ligne : clic sur « Poêle ou insert » → `/chauffagiste-saint-omer#poele-insert`, la carte
visée est à 110 px du haut de l'écran (l'en-tête collant ne la recouvre pas, `scroll-margin-top`),
et **le tunnel n'est pas ouvert**.

## CHAUFFAGE_PRESTATIONS_WITH_PHOTOS

Trois cartes deviennent **six**, chacune avec son ancre :

| carte | destination | visuel |
|---|---|---|
| Chaudière (`#chaudiere`) | `prestations/remplacement-chaudiere.html` | dégradé de marque |
| Dépannage urgence (`#depannage`) | `prestations/depannage-chaudiere.html` | **visuel de catalogue** (technicien ouvrant une chaudière) |
| Entretien annuel (`#entretien`) | catalogue, entretien chauffage | **visuel de catalogue** (contrat d'entretien gaz) |
| Ramonage (`#ramonage`) | `prestations/ramonage.html` | dégradé de marque |
| Poêle ou insert (`#poele-insert`) | `prestations/ramonage.html` (la page couvre les deux) | dégradé de marque |
| Désembouage (`#desembouage`) | `prestations/desembouage.html` | **photo de chantier réelle** |

Deux traitements d'image cohabitent, et c'est volontaire : `cover` pour la photo de chantier,
`contain` sur fond clair pour les visuels de catalogue, qui sont cadrés en portrait sur fond blanc
— un recadrage en 16/10 couperait le technicien en deux.

**Ce que je n'ai pas fait, et pourquoi.** Trois cartes gardent le dégradé de la marque parce que la
photothèque **ne contient aucune photo de chaudière, de ramonage ni de poêle**. Vérifié, pas
supposé : le bucket public `site-photos` contient `logos`, `menuiserie`, `plomberie`, `pmr`,
`travaux`, `volets` — pas de dossier `chauffage` ; le bucket `prestations` contient 25 visuels,
dont les trois que j'ai employés. Le seul fichier nommé « ramonage » du dépôt local est une
**photographie d'archive en noir et blanc d'un ramoneur du XIXᵉ siècle** — inutilisable sur une
carte commerciale ; elle n'est affichée nulle part sur le site, je l'ai vérifié.

Je ne mets pas une image d'illustration trouvée ailleurs sur une carte qui dit « nos techniciens
salariés » : ce serait une promesse fausse, sur un dépôt public. **Trois photos à fournir**, et le
câblage prend cinq minutes : une chaudière posée (murale ou sol), un ramonage en cours, un
poêle ou insert entretenu.

Même traitement sur les quatre pages chauffagiste (Saint-Omer, Dunkerque, Calais, Boulogne) :
les laisser diverger serait le début d'une dérive.

## SCREENSHOTS_HOME_AND_CHAUFFAGE

- **Accueil 1440** — après avoir dépassé le hero, l'encart sombre apparaît en bas à gauche
  (370 × 311 px, 24 px des bords) : « AVANT L'HIVER », le titre, une phrase, le bouton orange
  « Entretien chaudière → » et les deux liens « Poêle ou insert » / « Ramonage ». Le contenu de la
  page n'a pas bougé ;
- **Accueil 390** — l'encart passe pleine largeur moins 12 px de marge, à 84 px du bas, au-dessus
  de la barre d'action ; la croix de fermeture est atteignable ;
- **Chauffage 1440** — « Notre savoir-faire en chauffage » : deux rangées de trois cartes
  (355 × 344 px), trois d'entre elles portant une image chargée ; la carte visée par l'ancre est
  mise en évidence ;
- **Chauffage 390** — les six cartes en colonne, 350 px de large, 0 débordement.

Captures prises pendant la vérification, non versées au dépôt : il est public.

## TESTS_DESKTOP_MOBILE

Suite complète sur le SHA final : **28 suites, 784 contrôles, 0 échec**, SEO `ERRORS=0`, en-tête et
inventaire strict verts.

`home-promo` est réécrit (15 contrôles) autour de ce qui doit rester vrai :

1. l'encart existe une seule fois et ne remplace pas « Que souhaitez-vous faire ? » ;
2. il n'est plus dans le flux (plus de `<section class="hc-season">`) ;
3. il est réellement flottant : position fixe, au-dessus du contenu ;
4. il ne recouvre pas la barre d'action mobile ;
5. il se ferme et ne revient pas de la semaine ;
6. il n'apparaît qu'après le hero ;
7. **les trois boutons mènent à la page Chauffage, chacun sur son ancre** ;
8. **aucun bouton n'ouvre le tunnel ni un hub générique** ;
9. **les ancres visées existent vraiment sur la page Chauffage** ;
10. aucun prix, aucun téléphone, aucune promesse de délai inventée.

`canonical-pages` et `intention-unique` sont nuancés dans le même sens, avec un contrôle explicite
« aucun bouton de l'encart ne vise le tunnel » — une boucle devenue vide ne prouve rien.

Mesures desktop / mobile, prises sur la preview :

| | 1440 | 390 |
|---|---|---|
| encart visible après le hero | oui | oui |
| position | fixe, bas-gauche, 24 px | fixe, 12 px de marge, 84 px du bas |
| hauteur de page modifiée | non | non |
| recouvre la barre d'action | — | non |
| cartes Chauffage | 6, deux rangées de 3 | 6, en colonne |
| images chargées | 3/3 | 3/3 |
| débordement horizontal | 0 | 0 |

## Une erreur à moi dans ce lot, corrigée et gardée

En remplaçant la grille des cartes, mon motif s'est arrêté trop tôt : **les anciennes cartes sont
restées sous les nouvelles**. Les quatre pages ont affiché neuf cartes au lieu de six, dont
« Chaudière » deux fois — et la suite complète était verte, parce que **personne ne comptait les
cartes**. C'est corrigé (`491deeca`), et `pages-metier` compte désormais : aucune carte en double
par son titre, ancres uniques. Rejouée contre l'état fautif, la garde échoue et nomme les quatre
pages.

## SHA

`91991d4a` sur `recette` (tête de branche, poussée). Le lot compte deux commits :
`c6265fea` (encart flottant, routage, cartes) → `91991d4a` (retrait des cartes en double + garde).

## PREVIEW

- accueil : https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/
- page Chauffage : https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien

Pour voir l'encart : descendre d'un écran. S'il n'apparaît pas, c'est qu'il a été fermé sur cet
appareil dans les sept derniers jours. **Forcer le rechargement** : les pages HTML sont mises en
cache par le navigateur.

## ROLLBACK

```
git revert --no-commit 91991d4a c6265fea && git commit
```

Aucun asset versionné n'est touché par ce lot (le style de l'encart et celui des cartes sont en
ligne dans les pages) : aucun `?v=` à rebumper. Netlify redéploie la preview au push.

## NO_PROD_MUTATION_PROOF

- les deux commits n'existent que sur `recette` ; `origin/main` est toujours sur `570225bf`
  (2026-09-25) ;
- fichiers touchés : `index.html`, les quatre pages `chauffagiste-*`, et trois fichiers de test.
  **0** fichier sous `supabase/`, `assets/`, `.github/`, `netlify.toml`, `_redirects` ;
- les images employées sont **lues** depuis le bucket public de l'agence, par leur URL publique.
  Aucune écriture, aucun téléversement, aucune suppression : les listages faits pour l'inventaire
  sont des lectures ;
- aucun appel Stripe ni Netlify ; seul déploiement : la deploy preview de `recette` ;
- pendant la vérification : aucun formulaire soumis, aucune demande envoyée, la porte des tarifs
  n'a pas été franchie.

## Ce qu'il me faut de Florian

**Trois photos** pour finir les cartes : une chaudière posée, un ramonage en cours, un poêle ou
insert entretenu. Format paysage de préférence. Le reste est en place.

## Suite

Deux instructions sont arrivées pendant ce lot et sont **reçues, non commencées** :
`CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT` et
`CHATGPT-2026-09-26-P0-NUMBERED-REQUEST-TRACKING`. Je prends le suivi numéroté ensuite — c'est lui
qui garantit qu'aucune de ces demandes ne disparaisse — puis la clôture paiement/sécurité.

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO` pour la production : aucun merge vers `main`.
