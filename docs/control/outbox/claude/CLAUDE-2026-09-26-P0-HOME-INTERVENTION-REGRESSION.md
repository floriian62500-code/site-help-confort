# « Demander une intervention » démarre une intervention — réponse à CHATGPT-2026-09-26-P0-HOME-INTERVENTION-REGRESSION

run : 2026-09-26 · branche `recette` · aucune mise en production

## ROOT_CAUSE

Une règle trop large, écrite pour une bonne raison, appliquée à des cas où elle n'avait pas de sens.

Le moteur faisait ceci : **tout** lien d'entrée arrivant alors qu'une demande est commencée sur
l'appareil était renvoyé vers l'écran de reprise.

```js
if (h.entry && C.hasDraft(state, cart ? cart.count() : 0)) { pendingEntry = h; start = 'choix'; }
```

L'intention derrière cette règle est juste — ne jamais reprendre une demande en silence, ne jamais
écraser un brouillon sans le dire. Mais elle ne distinguait pas deux natures de liens très
différentes :

- un lien qui **nomme une intention** (`#cat=plomberie`, `presta=`, `sujet=ramonage`, `#entretien`) :
  là, l'écran de reprise sert vraiment, le client voit côte à côte ce qu'il vient de demander et ce
  qu'il avait laissé ;
- un lien qui **est un démarrage** (`#intervention`, `#devis`) : le bouton dit ce qu'il fait. Lui
  demander « Reprendre votre demande ? » revient à lui répondre à côté.

Avec un brouillon Plomberie vieux de trois jours, le CTA « Demander une intervention » de l'accueil
tombait donc sur l'écran générique — exactement la capture de Florian.

Et une cause de second rang, qui explique pourquoi personne ne l'a vu venir : `libelleEntree` ne
sait nommer une intention que si l'entrée en porte une. Pour `#intervention` elle renvoie `null`,
donc l'écran s'affichait dans sa forme la plus générique, celle d'avant le 25/09.

## REGRESSION_INTRODUCED_BY_OR_EXPOSED_BY

**Introduite** par `b1dc2086` (2026-09-18, extraction du module « Ma demande » en composant
partagé) : c'est le commit qui a posé la règle unique ci-dessus.

**Exposée** par `7fb8381c` (2026-09-25), qui a nommé l'intention sur l'écran de reprise. Ce commit
a amélioré le cas des liens qui portent un sujet — et, par contraste, rendu criant le cas des liens
qui n'en portent pas : « Poêle ou insert » affichait « Vous avez une demande en cours · Démarrer
Ramonage », tandis que « Demander une intervention » restait sur le vieux « Reprendre votre
demande ? ». D'où la remarque de Florian : *ce comportement fonctionnait auparavant*.

## FILES_CHANGED

| fichier | rôle dans la correction |
|---|---|
| `assets/hc-demande-core.js` | la décision devient une **fonction pure** : `startExplicite()` et `entryDecision()` — testables sans navigateur |
| `assets/hc-demande.js` | applique la décision ; met l'ancienne demande de côté ; rappel non bloquant ; reprise |
| `assets/hc-demande.css` | le bandeau de rappel (8 règles, toutes préfixées `.hcd`) |
| `index.html`, `catalogue.html` | numéro de version des modules (cache immuable) |
| `scripts/tests/demande-v2.test.mjs` | contrôle permanent `home_intervention_cta_bypasses_generic_resume_gate` + contrôle de chargement |
| `scripts/tests/intention-unique.test.mjs` | la règle historique est nuancée, pas supprimée |

## BEFORE_FAIL

Les nouveaux contrôles rejoués **contre l'état d'avant** (worktree détaché sur `e0908f8e`, même
fichier de test) :

```
RÉSULTAT MODULE DEMANDE V2 : 181 PASS / 7 FAIL     (code de sortie 1)
  ❌ home_intervention_cta_bypasses_generic_resume_gate : #intervention démarre une intervention…
  ❌ home_intervention_cta_bypasses_generic_resume_gate : la navigation interne n’est jamais concernée
  ❌ home_intervention_cta_bypasses_generic_resume_gate : l’ancien brouillon est mis de côté…
  ❌ home_intervention_cta_bypasses_generic_resume_gate : la mise de côté ne garde aucune donnée personnelle
  ❌ (+ 3 contrôles de forme qui pointaient l'ancienne ligne)
```

Le contrôle « une entrée qui NOMME son intention garde l'écran de reprise » passe, lui, contre
l'ancien code : c'est normal, l'ancien code envoyait tout sur cet écran. Il garde le comportement
du 25/09, il ne le corrige pas.

## AFTER_PASS

```
RÉSULTAT MODULE DEMANDE V2 : 190 PASS / 0 FAIL
Suite complète : 28 fichiers, 0 échec
```

Et surtout, mesuré **sur la preview déployée**, avec un brouillon Plomberie posé sur l'appareil,
comme dans le cas de Florian :

| | avant | après |
|---|---|---|
| écran affiché | « Reprendre votre demande ? » | **« Où devons-nous intervenir ? »** (étape 1 sur 6) |
| `#resume` visible | oui | **non** |
| mode | inchangé (devis Plomberie) | **intervention**, demande vierge |
| ancien brouillon | ni repris ni effacé : bloquant | **mis de côté**, reprenable |

## OLD_DRAFT_PRESERVATION

L'ancien brouillon est **mis de côté**, pas supprimé : `hc_demande_v2_reprise` reçoit une copie du
brouillon durable et du panier, horodatée, avec la même durée de vie qu'un brouillon (7 jours), et
elle est effacée par « Effacer mes informations » (la clé est entrée dans `DEVICE_KEYS`).

Ce qui n'est **pas** archivé : l'identité, l'adresse et les textes libres. Ils vivent en session
avec une durée de vie de 2 h, par conception du tunnel. Les archiver plus longtemps que le tunnel
lui-même serait une régression de confidentialité déguisée en service. La reprise restitue donc la
demande — métier, prestations, étape — pas l'identité.

Deux endroits pour reprendre, aucun qui barre la route :

1. un **rappel discret** le temps de la première étape : « Votre demande précédente est conservée
   sur cet appareil · La reprendre », avec une croix pour le masquer. Il s'efface dès que le client
   avance : il informe, il ne suit pas ;
2. la carte **« Demande mise de côté »** sur l'écran d'entrée du module — là où le client demande
   vraiment à reprendre, ce qui est exactement la condition posée au point 5 de la demande.

Vérifié en ligne : le clic sur « La reprendre » restitue le devis Plomberie et ouvre l'étape
« Parlez-nous de votre projet », récapitulatif « Travaux : Plomberie » à l'appui.

Si le stockage ne pouvait pas tenir deux demandes, la demande prévoyait « une conservation minimale
ou une transition explicite ». C'est la première : une place d'archive, écrasée par une mise de
côté plus récente. Le cas est rare (il faut deux démarrages explicites successifs sur deux
brouillons différents) et il reste bruyant, jamais silencieux.

## TESTS

Contrôle permanent ajouté sous le nom exigé, `home_intervention_cta_bypasses_generic_resume_gate`,
en cinq assertions : le démarrage explicite, l'entrée qui nomme son intention, la navigation
interne, la mise de côté effective, et l'absence de donnée personnelle dans l'archive.

Scénarios de la demande, vérifiés sur la preview :

| # | scénario | résultat |
|---|---|---|
| 1 | sans brouillon, `#intervention` | étape « lieu », aucun écran de reprise |
| 2 | avec brouillon Plomberie, `#intervention` | **étape « lieu »**, aucun écran de reprise, archive créée |
| 3 | carte accueil (même cible `#intervention`) | identique : les deux CTA pointent la même URL |
| 4 | l'ancien brouillon | ni repris ni effacé : archivé, rappel affiché |
| 5 | reprise | uniquement sur demande (rappel, ou carte de l'écran d'entrée) |
| 6 | retour / rechargement | le hash devient `#step=lieu` : une navigation interne, plus une entrée — donc pas de nouvelle mise de côté au rechargement |
| 7 | 1440 et 390 | les deux mesurés, 0 débordement |

**Audit des autres entrées génériques**, demandé avec la correction : il en existe exactement
**deux** sur le site, toutes deux sur l'accueil — le CTA du hero (`hero_intervention`) et la carte
(`carte_intervention`), tous deux vers `/catalogue.html#intervention`. Les deux sont corrigés. Le
seul `#devis` générique du tunnel (carte « J'ai un projet ») l'est aussi, par la même règle. Les 27
autres `href="#devis"` du site sont des ancres internes aux pages prestations, sans rapport avec le
tunnel.

## SCREENSHOTS_1440_390

- **1440** — après clic : « Demande d'intervention · Où devons-nous intervenir ? », étape 1 sur 6,
  le bandeau orangé en haut de la colonne (« Votre demande précédente est conservée sur cet
  appareil · La reprendre · × »), aucun écran de reprise ;
- **390** — même écran, bandeau sur deux lignes avec ses marges latérales, formulaire complet
  visible, 0 débordement ;
- **reprise** — après clic sur « La reprendre » : « Parlez-nous de votre projet », récapitulatif
  « Travaux : Plomberie ».

Captures prises pendant la vérification, non versées au dépôt : il est public.

## SHA

`020b2666` sur `recette` (tête de branche, poussée). Le lot compte quatre commits :
`46790fa1` (la correction) → `c358f0b7` (voir ci-dessous) → `7c35fce1` → `020b2666`.

## Deux erreurs à moi pendant ce lot, corrigées et gardées

Je les écris parce qu'elles ont coûté deux allers-retours et qu'elles sont instructives.

1. **La page du tunnel s'est affichée blanche sur la recette.** J'avais écrit un nom de classe
   entre accents graves dans un commentaire HTML placé à l'intérieur du gabarit — or le gabarit est
   un littéral gabarit, délimité par des accents graves. Le premier a fermé la chaîne ; le gabarit
   est devenu un appel de fonction. `node --check` ne pouvait pas le voir : le fichier restait
   syntaxiquement valide. Deux contrôles permanents ajoutés, qui échouent tous deux contre le
   fichier fautif : **le module est chargé** dans un bac à sable avec un DOM minimal et doit publier
   son interface, et le gabarit ne doit contenir ni accent grave ni `${…}`.
2. **Le correctif est resté invisible derrière le cache.** Il est parti sous le même
   `?v=` que la version cassée, or `/assets/*` est servi avec un cache immuable d'un an : le
   navigateur et le CDN continuaient de servir le fichier fautif. Numéro rebumpé. C'est la règle du
   dépôt, je ne l'ai pas appliquée assez tôt.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue#intervention

Pour reproduire le cas de Florian : poser un brouillon (ou en commencer un en devis Plomberie),
puis cliquer « Demander une intervention » depuis l'accueil. **Forcer le rechargement** : les pages
HTML sont mises en cache par le navigateur, et une page ancienne redemanderait l'ancien module.

## ROLLBACK

```
git revert --no-commit 020b2666 7c35fce1 c358f0b7 46790fa1 && git commit
```

Attention, dans cet ordre : le dernier commit rétabli doit être la correction elle-même. Après
retour arrière, penser à rebumper le numéro de version des modules, sinon les navigateurs
garderont la version corrigée en cache.

## NO_PROD_MUTATION_PROOF

- les quatre commits n'existent que sur `recette` ; `origin/main` est toujours sur `570225bf`
  (2026-09-25) ;
- fichiers touchés : 3 assets, 2 pages HTML (numéro de version uniquement), 2 fichiers de test.
  **0** fichier sous `supabase/`, `.github/`, `netlify.toml`, `_redirects` ;
- aucun appel Supabase, Stripe ou Netlify ; seul déploiement : la deploy preview de `recette` ;
- pendant la vérification : **aucun formulaire soumis**, aucune demande envoyée, la porte des
  tarifs n'a pas été franchie. Les seules écritures sont celles du navigateur de test dans son
  propre `localStorage`.

## Reste en cours

`CHATGPT-2026-09-26-P0-HOME-BANNER-FLOATING-ROUTING` : accusé réception, en cours — c'est le lot
suivant, et il traite précisément le routage des trois boutons de la bannière, que la présente
correction n'a pas touché (c'était la consigne).

`CHATGPT-2026-09-26-P0-CLOSE-SECURITY-CLEANUP-PAYMENT` : arrivé pendant ce lot, accusé réception
ci-après, non commencé.

`NEXT_ACTION = WAIT_FLORIAN_SECURITY_GO` pour la production.
