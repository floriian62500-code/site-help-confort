# Contrats d'entretien en section premium — réponse à CHATGPT-2026-09-26-P0-CHAUFFAGE-CONTRATS-PREMIUM

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**

## ROOT_CAUSE

Le bloc était exact, complet… et invisible. La cause n'est pas sa taille, c'est son **contraste** :
une carte **blanche**, posée sur un fond crème très clair, au milieu d'une page blanche. Rien ne
signalait à l'œil qu'il se passait là quelque chose de différent du reste — d'où l'impression
d'« un encart parmi d'autres » que décrit Florian.

Trois choix du lot précédent y ont contribué, et ils venaient tous d'une bonne intention mal
calibrée : j'avais reçu la consigne « compact, pas de doublon », et j'ai traité *compact* comme
*discret*. Le titre était en 1,5 rem (la taille d'un sous-titre de section), le prix d'appel était
noyé dans une phrase, et les deux actions avaient la même largeur — donc aucune ne dominait.

## OLD_LAYOUT

- bande blanche `\.ct-teaser`, hauteur **222 px** en 1440 ;
- titre 1,5 rem, une phrase de trois lignes, deux boutons empilés à droite de largeur identique ;
- prix cité à l'intérieur du texte courant : « — dès 9,90 € TTC/mois. » ;
- aucun repère visuel des formules (elles n'étaient que trois mots en gras dans la phrase) ;
- position : 3ᵉ section, juste après le hero et la bande de réassurance.

## NEW_LAYOUT

Une **section premium**, `\.m-contrats-premium`, au même endroit dans le parcours de lecture :

- **carte bleu nuit** en dégradé, filet orange en haut, halo chaud — le seul bloc sombre du
  premier écran et demi ;
- **colonne gauche** : pastille « Contrats d'entretien », titre en clamp(1,6 → 2,35 rem)
  « Entretenez votre chaudière *sans y penser* », chapô, puis **quatre bénéfices à puces cochées**
  (visite annuelle par un technicien de l'agence · attestation remise · rappel automatique un mois
  avant · engagement 1 an renouvelable) ;
- **panneau droit** : le prix d'appel en clamp(2,2 → 2,9 rem) — « dès **9,90 €** TTC/mois » —, les
  **trois formules en pastilles** (BASIC · ★ CONFORT mise en avant · SÉCURITÉ), l'**action
  principale** en pleine couleur orange, puis la sortie secondaire en simple contour, et une ligne
  discrète « Comparatif complet et prix par énergie sur la page contrats » ;
- en dessous de 900 px, tout passe en une colonne, les bénéfices aussi.

**Ce qui n'est pas revenu** : les trois cartes détaillées. Les formules sont **nommées** ici,
**décrites** sur `/contrats-entretien.html`, qui reste la seule page à jour — elle lit
`v_contract_offers`. Un seul repère de prix, celui du catalogue.

## WHY_MORE_VISIBLE

Mesuré sur la preview, pas estimé :

| | avant | après | |
|---|---|---|---|
| hauteur de la section (1440) | 222 px | **555 px** | ×2,5 |
| hauteur (390) | 471 px | **911 px** | ×1,9 |
| fond | blanc sur crème | **bleu nuit sur crème** | seul bloc sombre du haut de page |
| titre | 1,5 rem | jusqu'à **2,35 rem** | ×1,6 |
| prix d'appel | dans le texte courant | **jusqu'à 2,9 rem**, isolé | — |
| formules | trois mots en gras | **trois pastilles**, dont une mise en avant | — |
| action principale | 48 px de haut, même largeur que la secondaire | **59 × 358 px**, pleine couleur, ombre portée | 20 998 px² |
| sortie secondaire | 50 px, filet | 46 px, simple contour | 16 314 px² |

La domination du CTA principal n'est donc pas une impression : **+29 % de surface**, fond plein
contre contour, et c'est vérifié par un contrôle automatique (hauteur minimale et fond plein d'un
côté, contour de l'autre).

La position, elle, ne change pas : **3ᵉ section sur 9**, à **1 077 px** du haut en 1440, juste
après le hero et la bande de réassurance, avant « Pourquoi HELP Confort ». C'est ce que demandait
la consigne « très tôt dans la page, juste après l'introduction ».

## FILES_CHANGED

`chauffagiste-saint-omer.html`, `chauffagiste-dunkerque.html`, `chauffagiste-calais.html`,
`chauffagiste-boulogne-sur-mer.html` (3 461 → 7 605 octets de bloc par page) et
`scripts/tests/prix-contrats.test.mjs`.

Les quatre pages reçoivent le même traitement : les laisser diverger serait le début d'une dérive.

## SCREENSHOTS_1440_390

- **1440** — la carte sombre occupe toute la largeur du contenu juste sous la réassurance : titre
  sur deux lignes, quatre bénéfices sur deux colonnes, et à droite le panneau « dès 9,90 €
  TTC/mois », les trois pastilles, le bouton orange puis le lien contour ;
- **390** — tout passe en colonne : pastille, titre, chapô, les quatre bénéfices l'un sous l'autre,
  le prix en grand, les trois pastilles sur deux lignes, puis les deux actions pleine largeur.
  0 débordement.

Captures prises pendant la vérification, non versées au dépôt : il est public.

## TESTS

Suite complète : **28 suites, 784 contrôles, 0 échec**, SEO `ERRORS=0`, en-tête et inventaire
stricts verts.

`prix-contrats` passe de 25 à **41 contrôles**. Les six points de la demande, dans l'ordre :

1. *plus visible en desktop* → la section tranche (fond sombre vérifié dans la feuille de style) ;
2. *lisible en mobile* → une colonne sous 900 px, 0 débordement mesuré en 390 ;
3. *le CTA principal ressort* → hauteur 58 px et fond plein contre 44 px et contour, contrôlé ;
4. *aucun doublon détaillé* → ni `ce-card`, ni `formula-card`, ni « Tout BASIC inclus » ; les trois
   formules sont des **pastilles**, au nombre de trois exactement ;
5. *aucun impact sur les autres CTA Chauffage* → les six cartes prestations et leurs ancres sont
   inchangées, contrôlées par `pages-metier` ;
6. *aucun impact production* → voir plus bas.

## SHA

`330210c9` sur `recette` (tête de branche). Deux commits : `c805737d` (la section premium) →
`330210c9` (les deux régressions du gel, ci-dessous).

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer

Forcer le rechargement (`Cmd+Shift+R`) : les pages HTML restent en cache côté navigateur.

## ROLLBACK

```
git revert --no-commit c805737d && git commit
```

Style en ligne dans les pages : aucun `?v=` à rebumper.

## NO_PROD_MUTATION_PROOF

- commits présents sur `recette` uniquement ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- fichiers touchés : 4 pages HTML (+ 14 pages pour le footer, voir ci-dessous) et 2 fichiers de
  test. **0** fichier sous `supabase/`, `assets/`, `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- aucun formulaire soumis pendant la vérification.

---

# Deux régressions de la liste de gel, corrigées dans la foulée — `330210c9`

`CHATGPT-2026-09-26-P0-FREEZE-AND-STABILIZE` demande de stabiliser les régressions visibles. Deux
étaient mesurables tout de suite, et leur correction est minimale.

## 1. Footer « Métiers » : un lien vers la plomberie appelé « Chauffage »

**BEFORE** — sur `/chauffagiste-saint-omer`, le premier lien du footer mène à
`plombier-saint-omer.html` et porte le libellé **« Chauffage »**. Le picto, lui, est le bon : la
goutte.

**Mesure** — 14 pages touchées, toutes métier : les quatre pages chauffagiste affichent
« Chauffage », les pages électricien « Électricité », les pages serrurier « Serrurerie », les
pages travaux « Travaux ». Toujours sur le **premier** lien, toujours vers la plomberie. C'est la
signature d'un remplacement automatique passé trop large : quelqu'un a remplacé « Plomberie » par
le métier de la page, et le footer a été emporté avec le reste.

**AFTER** — le libellé redevient « Plomberie ». Rien d'autre ne bouge : ni l'URL, ni le picto, ni
l'ordre.

**Garde** — sur les **148 footers** du site, chaque lien métier doit porter le nom de sa
destination (`pages-metier`).

## 2. « Voir nos prestations chauffage avec prix » ouvrait le tunnel

**BEFORE** — le bouton visait `/catalogue#cat=chauffage`. Or `/catalogue` est le tunnel de
demande, pas le catalogue public : un bouton qui promet des prix ouvrait un formulaire.

**AFTER** — il mène à `/nos-prestations.html#sec-chauffage`. Cette ancre existe déjà dans la page
prestations, qui sait pré-sélectionner le filtre métier au chargement ; vérifié en ligne, le
bouton servi pointe bien là.

**Garde** — contrôlé sur les quatre pages chauffagiste (`prix-contrats`).

## Reste de la liste de gel

- *cartes prestations cassées* : corrigé avant le gel (`91991d4a`, neuf cartes ramenées à six,
  garde anti-doublon) ;
- *teaser contrats trop discret* : objet du présent rapport ;
- *vérifier que les corrections acceptées restent intactes* : la suite complète les couvre, 784
  contrôles verts, dont les ancres de l'encart d'accueil et les six cartes.

## Suite

Deux demandes de fond restent **reçues et non traitées**, dans cet ordre :
`CHATGPT-2026-09-26-P0-NUMBERED-REQUEST-TRACKING` puis
`CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT`. Le suivi numéroté d'abord — c'est lui qui
garantit qu'aucune de ces demandes ne se perde dans un rapport global, ce que reproche justement
le contrôle.

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO` pour la production. Statut de ce lot :
**READY_FOR_CONTROL** — je ne marque jamais CLOSED.
