# Bloc final retiré de la page contrats — réponse à CHATGPT-2026-09-26-P0-REMOVE-CONTRATS-FINAL-CTA

run : 2026-09-26 · branche `recette` · aucune mise en production

## ROOT_CAUSE

Le bloc date du **2026-09-19** (`2d6f2862`, « simplify contracts page and remove duplicate pricing
modules ») : il est né de la simplification elle-même, par application du schéma classique d'une
page d'offre — une action en haut, du contenu, une action en bas.

Le schéma ne tenait pas ici, et c'est mesurable : la page propose déjà l'action **deux fois avant
la fin**. Une fois dans le hero (`contrats_hero`), et une fois par formule — sept boutons
« souscrire » générés depuis `v_contract_offers`. Le bloc final en ajoutait une troisième, avec un
titre qui posait une question à laquelle la FAQ juste au-dessus venait de répondre.

Ce n'est donc pas un oubli de nettoyage : c'est un réflexe de mise en page appliqué sans vérifier
ce que la page offrait déjà.

## FILE_CHANGED

`contrats-entretien.html` — 111 389 → **111 048 octets** (−341). Plus `scripts/tests/contrats.test.mjs`
(contrôle réécrit, voir TESTS). Aucun autre fichier.

## BLOCK_REMOVED

Retiré :

- le titre « Une question avant de souscrire ? » (et son `id="finalTitle"`) ;
- la phrase « L'agence vous rappelle pour choisir la formule adaptée à votre équipement. » ;
- le bouton « Choisir ma formule » (`data-hc-cta="contrats_final_formules"`) ;
- le lien « Être rappelé » (`data-hc-cta="contrats_final_rappel"`, vers `contact.html`).

Conservé, comme demandé : le paragraphe **« Pas encore sûr d'avoir besoin d'un contrat ? »** avec
ses trois sorties — l'entretien à l'intervention (catalogue), le ramonage et l'entretien poêle /
insert, et ce que dit la loi. Il était imbriqué dans le wrapper, mais rien n'obligeait à l'emporter
avec lui : le wrapper survit **pour lui seul**. Je l'ai renommé `ct-final` → `ct-renvois`, parce
qu'une section qui s'appelle « action finale » alors qu'elle n'en porte plus aucune est un piège
pour la prochaine lecture, et son libellé accessible dit maintenant ce qu'elle est (« Autres
options d'entretien »).

Conservé aussi, et vérifié en ligne : les **sept formules** et leurs **sept boutons de
souscription**, la FAQ, le contenu métier, le footer.

## CSS_CLEANUP

Trois règles devenues orphelines, supprimées après preuve d'absence d'usage (recherche hors blocs
`<style>`, chaînes JS comprises) :

| règle | usages restants |
|---|---|
| `.ct-final h2` | 0 — le titre est parti |
| `.ct-final-actions` | 0 — le conteneur des deux boutons est parti |
| `.ct-link` | 0 — sa seule utilisation était « Être rappelé » |

Conservées : `.ct-renvois` et `.ct-renvois p` (le paragraphe gardé s'en sert), et `.ct-cta`, que le
bouton du hero utilise toujours. Aucune règle partagée n'a été touchée : ces sélecteurs
n'existaient que dans cette page.

## TESTS

Suite complète sur le SHA final : **28 suites, 728 contrôles, 0 échec**. SEO `ERRORS=0`, en-tête et
entité JSON-LD inchangés, inventaire strict vert, hygiène du dépôt 10/10.

Le contrôle `contrats` passe de 31 à **35**. L'ancien exigeait « action finale : 2 choix
(formules, être rappelé) » — il décrivait exactement ce que Florian demande de retirer, il ne
pouvait pas rester. Il est remplacé par ce qui doit rester vrai :

1. la page ne se ferme plus par un appel à l'action redondant (ni les deux `data-hc-cta`, ni
   `ct-final`, ni le titre) ;
2. l'action reste offerte là où elle sert : le hero **et** chaque formule ;
3. aucun téléphone répété dans le corps (il est déjà dans l'en-tête) — la moitié utile de l'ancien
   contrôle, conservée ;
4. le paragraphe de renvois survit avec ses trois sorties ;
5. aucune règle de style orpheline laissée par le bloc retiré.

Ces contrôles ont été **rejoués sur l'état d'avant** (worktree détaché sur `4623324e`) : ils
échouent, code de sortie 1, sur les points 1 et 5. Une garde qui ne peut pas échouer ne garde rien.

Impact sur la souscription — le point 4 de la demande — vérifié **en ligne**, pas déduit : au clic
sur le premier bouton de formule, la modale s'ouvre sur « Contrat Gaz — BASIC », puis se referme.
Rien n'a été saisi, rien n'a été envoyé : aucune demande de souscription n'a été créée.

## SCREENSHOTS_1440_390

| mesure | 1440 | 390 |
|---|---|---|
| blocs `ct-final` | 0 | 0 |
| titre « Une question avant de souscrire ? » présent | non | non |
| vide entre la FAQ et les renvois | 0 px | 0 px |
| hauteur du paragraphe de renvois | 163 px | 212 px |
| vide entre les renvois et la bande de réassurance | 0 px | 0 px |
| vide entre la bande et le footer | 0 px | 0 px |
| formules / boutons souscrire | 7 / 7 | 7 / 7 |
| débordement horizontal | 0 | 0 |

À l'écran, la page se termine désormais par : FAQ → paragraphe de renvois → bande de réassurance
(Garantie décennale · Labellisée · Techniciens salariés · Standard ouvert) → footer. Aucun trou :
les trois transitions sont à 0 px.

Captures prises pendant la vérification, non versées au dépôt : il est public.

## SHA

`6ae55ed8` sur `recette` (tête de branche, poussée).

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/contrats-entretien

Déploiement confirmé par le HTML servi (0 occurrence de `ct-final`), pas par un code 200.

## ROLLBACK

```
git revert --no-commit 6ae55ed8 && git commit
```

ou, pour ne reprendre que la page :

```
git checkout 4623324e -- contrats-entretien.html
```

Styles en ligne dans la page : aucun cache d'asset à purger. Le retour arrière ferait échouer les
contrôles 1 et 5 ci-dessus — c'est voulu.

## NO_PROD_MUTATION_PROOF

- commit présent sur `recette` seulement ; `origin/main` toujours sur `570225bf` (2026-09-25) ;
- fichiers touchés : 1 page HTML, 1 fichier de test. **0** fichier sous `supabase/`, `assets/`,
  `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- la modale de souscription a été ouverte puis refermée **sans aucune saisie et sans envoi** :
  aucune ligne créée en base, aucune notification partie à l'agence.

## Où en est la boîte

Les trois instructions du 26/09 sont traitées et rapportées :
`P0-CHAUFFAGE-CONTRATS-TOP-TEASER` (`d23c71ba`), `P0-REMOVE-METIER-JOURNEY-GLOBAL` (`1fa6b647`),
`P0-REMOVE-CONTRATS-FINAL-CTA` (`6ae55ed8`). Une question reste ouverte pour Florian, posée dans
le rapport précédent : le composant voisin `hc-contact-journey` de `contact.html`.

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO` — aucune mise en production, aucun merge vers `main`, les
cinq paquets de sécurité restent préparés et non déployés.
