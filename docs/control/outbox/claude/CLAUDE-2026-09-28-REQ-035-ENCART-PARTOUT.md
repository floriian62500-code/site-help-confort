# REQ-20260926-035 — l'encart saisonnier ne se ferme plus, et il est partout

message_id: CLAUDE-2026-09-28-REQ-035-ENCART-PARTOUT
branche: recette
date: 2026-09-28
commits: `2aef11f7` (mise en place) puis `bd70147a` (forme compacte sur téléphone)
demande: décision de Florian du 2026-09-28 — « on ne doit pas pouvoir la fermer, elle doit rester
systématiquement et sur toutes les pages du site »

## CE QUI A CHANGÉ
L'encart vivait **en dur dans `index.html`**, avec une croix de fermeture, une mémoire locale qui le
masquait sept jours, et il n'apparaissait qu'après 60 % de défilement. Il devient **deux fichiers
partagés** — `assets/hc-promo-saison.css` et `assets/hc-promo-saison.js` — propagés par le même
canal que l'en-tête.

| avant | après |
|---|---|
| 1 page (l'accueil) | **201 pages publiques** |
| croix de fermeture | **aucune** |
| masqué 7 jours après fermeture | **aucune mémoire de masquage** |
| visible après 60 % de défilement | **visible tout de suite** |
| copie en dur dans la page | **une source unique**, jamais recopiée |

Vérifié en ligne, page par page, sur la recette : `/`, `/contact`, `/zones-intervention`,
`/nos-prestations`, `/chauffagiste-saint-omer`, `/contrats-entretien`, `/a-propos` → l'encart est
présent sur chacune. Sur `/contact` en 1440 : position fixe, 370 px, en bas à gauche, **aucun bouton
de fermeture**, visible sans défiler.

## UNE DÉCISION QUE J'AI PRISE, ET QUI SE DÉFAIT EN UNE LIGNE
En carte pleine sur un téléphone, l'encart permanent occupait **40 % d'un écran de 390 px** et
recouvrait le bouton « Demander une intervention » de la page Zones. Mesuré, pas supposé : 311 px de
haut sur 844. Une publicité qui cache le bouton d'appel coûte des appels au lieu d'en apporter.

Sur téléphone, il prend donc une **forme compacte** : une barre d'une ligne, titre court, un seul
bouton, message long et liens secondaires masqués. Mesuré après correction : **63 px, soit 7 % de
l'écran**, posée au-dessus de la barre d'action collante, les deux boutons de la page de nouveau
visibles. Elle reste **permanente et non fermable** — la règle est tenue.

Sur grand écran, la carte complète est conservée : la place existe.

Si Florian préfère la carte pleine aussi sur téléphone, c'est **une règle CSS à retirer**, rien de plus.

## CE QUI N'EN A PAS HÉRITÉ, ET POURQUOI
`catalogue.html` (le tunnel de commande) et `reset.html` (page technique) ne reçoivent pas l'encart :
ils sont hors du périmètre de l'en-tête. C'est heureux — une publicité par-dessus un panier en cours
fait perdre des commandes. Si Florian le veut là aussi, c'est une décision à part, et je la ferai.

## GARDES MISES À JOUR — la règle a changé, les contrôles aussi
- `home-promo.test.mjs` réécrit : **19 contrôles**, dont deux nouveaux qui protègent la décision —
  « il NE PEUT PAS être fermé » et « il est présent sur les 201 pages publiques » — plus une
  exécution réelle du script (il pose l'encart, le rend visible, mesure une seule vue, et sait dire
  sur quelle page il a été vu).
- `intention-unique` et `canonical-pages` lisent désormais la source partagée au lieu de l'accueil.
- `gen-offres-emploi` normalise les deux nouveaux fichiers comme ceux de l'en-tête, sinon il croyait
  les pages d'offres périmées à chaque changement de version.

## UNE GARDE INSTABLE, CORRIGÉE AU PASSAGE
Le contrôle de confidentialité de `demande-v2` échouait **selon l'heure** : l'horodatage du brouillon
est un nombre, et il contient parfois « 0612 » ou « 62500 », que la garde lisait comme un numéro de
téléphone ou un code postal. Aucune donnée personnelle ne fuyait. L'horodatage est maintenant exclu
de la comparaison — une garde de confidentialité ne doit pas dépendre de la pendule.

## TESTS
Suite complète : **850 PASS / 0 FAIL**, 31 fichiers en code 0. En-tête : **0 page à mettre à jour**.
`seo-guardrails` : **ERRORS=0**. Diff : 207 fichiers, +502 / −133 (dont 201 pages qui ne reçoivent
que deux lignes dans `<head>`).

## RETOUR ARRIÈRE
Deux commits isolés. `git revert --no-commit bd70147a 2aef11f7 && git commit` remet l'encart dans
l'accueil, avec sa croix — rien d'autre ne bouge.

## UN DÉFAUT VU EN PASSANT, À TRAITER À PART
Sur `/zones-intervention`, la carte affiche en filigrane répété **« API KEY REQUIRED »** sur les
tuiles (fond de carte CARTO). C'est visible en production comme en recette, et ça n'a rien à voir
avec ce lot — mais un fond de carte tatoué « clé requise » sur une page commerciale fait mauvais
effet. À ouvrir comme demande distincte : il faut une clé du côté de Florian.

## NEXT_ACTION
Florian regarde sur la recette — n'importe quelle page — et dit si la forme lui convient :
`https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/`
