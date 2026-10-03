# Retour — suppression de la landing entretien chaudière

message_id: CLAUDE-2026-09-24-P0-REMOVE-ENTRETIEN-LANDING
repond_a: CHATGPT-2026-09-24-P0-REMOVE-ENTRETIEN-LANDING
date: 2026-09-24
statut: DONE
production: AUCUNE MUTATION

## ROOT_CAUSE_DUPLICATION

Trois surfaces vendaient la même intention, et c'est une décision de ma part du 20/09 qui l'a figée :
en appliquant la règle « une intention = une page canonique », j'ai désigné `/entretien-chaudiere.html`
comme page commerciale du service et j'y ai consolidé sept vitrines. Le raisonnement était juste sur
la duplication, faux sur le choix de la page : j'ai gardé la landing autonome au lieu de rendre la
page Chauffage capable de porter l'intention.

Résultat : la page Chauffage parlait d'entretien sans le vendre, la landing le vendait sans le
métier, le catalogue le vendait avec un prix ferme, et la page contrats vendait l'abonnement. Quatre
endroits, une seule chose à faire pour le client.

## LINKS_FOUND

Six liens publics, trouvés par recherche globale puis recoupés avec `scripts/seo/duplicate-intent.mjs`
— c'est cet outil qui a révélé les trois derniers, que ma recherche manuelle avait manqués : mon
motif excluait « guide-entretien-chaudiere » et « blog-entretien-chaudiere », ce qui masquait les
lignes où ces pages **pointent** vers la landing.

| # | Source | Nature du lien |
|---|---|---|
| 1-4 | les 4 pages chauffagiste (Saint-Omer, Dunkerque, Calais, Boulogne) | carte « Entretien annuel » du bloc savoir-faire |
| 5 | `nos-prestations.html` | bouton « L'entretien annuel en détail » |
| 6 | `prestations/ramonage.html` | liste éditoriale « Pour aller plus loin » |
| 7 | `contrats-entretien.html` | « l'entretien de chaudière à l'intervention » |
| 8 | `panne-chaudiere.html` | maillage de bas de page « Entretien annuel » |
| 9 | `blog-entretien-chaudiere-annuel-obligatoire.html` | « le détail à jour, formule par formule » |
| 10 | `admin-pro/SEO-CHECKLIST-GSC.html` | check-list interne (URL à surveiller) |

Non touché, volontairement : `contact.html` contient la clé `'entretien-chaudiere'` — c'est un
**slug de prestation du catalogue**, pas un lien vers la page. La prestation, elle, existe toujours.

## LINKS_REWIRED

Rebranchés par intention, pas par remplacement mécanique :

| Intention lue dans le contexte | Destination |
|---|---|
| demander l'entretien (cartes savoir-faire, maillage, « à l'intervention ») | tunnel `/catalogue.html#cat=chauffage&presta=entretien`, avec une provenance distincte par source (`chauffage-svc`, `prestations-contrats`, `contrats-ailleurs`, `panne-maillage`) |
| découvrir le métier (liste éditoriale du ramonage) | `/chauffagiste-saint-omer.html` |
| comparer les formules (« formule par formule ») | `/contrats-entretien.html` |
| check-list GSC interne | `/chauffagiste-saint-omer.html`, avec la mention du 301 |

Deux corrections faites dans le même geste, parce qu'elles portaient sur les mêmes blocs :

- `nos-prestations.html` portait **le même bloc contrats vidé** que les pages chauffagiste (titre,
  promesse de trois formules, aucune offre). Ses trois cartes sont rétablies à l'identique.
- le bouton « Voir les formules » de l'article de blog **appelait le standard téléphonique**
  (`tel:`) au lieu d'ouvrir les formules. Il mène maintenant à la page contrats.
- le guide et l'article n'avaient aucun lien réel vers la page Chauffage : ils passaient le contrôle
  de maillage par un faux positif de sous-chaîne (« guide-entretien-chaudiere » contient
  « entretien-chaudiere »). Le contrôle est resserré, et les deux pages ont un vrai lien.

## FILE_REMOVED

`entretien-chaudiere.html` (485 lignes) supprimée du dépôt, branche `recette`.

## SEO_CLEANUP

- retirée de la liste des pages du sitemap (`supabase/functions/sitemap/index.ts`) ;
- retirée des listes de `scripts/gen-sitemap-fn.mjs` et `scripts/header/sync-header.mjs` ;
- registre `docs/seo/pages-canoniques.json` : la canonique de l'intention devient
  `/chauffagiste-saint-omer.html`, l'ancienne URL est inscrite en doublon redirigé, le tunnel est
  déclaré comme surface transactionnelle ;
- `docs/process/REGLE-PAGE-CANONIQUE.md` : décision datée à l'historique ;
- dossier Ads : destination de la famille A changée, avec un encadré qui dit ce qui doit être
  **remesuré** avant tout GO (l'analyse détaillée du §7 portait sur la page supprimée) ;
- `guide-entretien-chaudiere.html` et l'article de blog : **conservés**, comme demandé.

**Piège rencontré, à connaître** : j'ai d'abord régénéré le sitemap avec son script. Le fichier
versionné avait été retouché à la main (avertissement sur l'écart avec la version déployée, format
compact que `duplicate-intent` sait lire) : la régénération a effacé les deux. J'ai annulé, retiré
l'entrée à la main, et écrit la garde en tête du générateur pour que personne ne retombe dedans.

## REDIRECT_PLAN

```
/entretien-chaudiere.html /chauffagiste-saint-omer.html 301!
/entretien-chaudiere      /chauffagiste-saint-omer.html 301!
```

Pourquoi cette destination : la page Chauffage est celle qui porte désormais l'intention (entretien
présenté, contrats présentés, tunnel accessible). La page contrats aurait détourné vers l'abonnement
une URL qui parlait d'entretien ponctuel.

**Fait vérifié, et il change la lecture du risque** : l'URL est **en ligne en production**
(HTTP 200 avec et sans `.html`) et **présente dans le sitemap servi** (2 occurrences). Elle est donc
indexable et probablement indexée. Sans la règle, la livraison de ce lot ferait un 404 sur une URL
référencée. La règle est écrite dans `_redirects` du même lot : elle ne prend effet en production
qu'au moment où Florian livrera ce lot — aucune mutation de production ici.

**Dépendance à signaler** : le `sitemap.xml` public est servi par la **fonction edge déployée**
(version du 08/08), pas par le dépôt. Tant que cette fonction n'est pas redéployée, le sitemap de
production continuera d'annoncer l'URL supprimée — qui répondra alors en 301. Ce n'est pas bloquant
(un 301 depuis un sitemap est propre), mais le redéploiement de la fonction sitemap reste un gate
humain déjà ouvert, et ce lot lui ajoute une raison.

## TESTS

| suite | avant | après |
|---|---|---|
| suite complète (21 fichiers) | 5 suites en erreur, 1 FAIL | **0 FAIL** |
| `canonical-pages` | — | 22/22, dont suppression, 301 avec et sans `.html`, sitemap, 0 lien résiduel |
| `intention-unique` | — | 26/26, dont « la landing supprimée n'est reconstruite nulle part » |
| `ads-landing` | — | 29/29, section A réécrite sur la nouvelle destination |
| `prix-contrats` | — | 21/21, contrôle de maillage resserré |
| `duplicate-intent` | 7 à traiter | **OK** |
| `smoke` (en ligne) | 17/18 | **18/18** |

Les tests n'ont pas été contournés : ceux qui verrouillaient l'ancienne architecture ont été
réécrits sur la nouvelle. Deux d'entre eux ont gagné au change — le contrôle de maillage ne se laisse
plus tromper par une sous-chaîne, et le contrôle en ligne compare désormais le relevé tarifaire au
catalogue réel (détection de dérive) au lieu de vérifier qu'une page récitait neuf prix.

## Findings

Constaté pendant ce lot, **non corrigé ici** (hors périmètre, et 58 pages à reprendre à la main) :
`assets/tracking.js` est chargé **sans `?v=`** sur 58 pages, dont la nouvelle destination Ads ;
seules 4 pages sont versionnées. Les assets sont en cache immuable un an : un visiteur déjà venu
garde l'ancien fichier de mesure. À traiter dans un lot dédié, avec le même soin qu'un bump.

## SHA

`da82b9de` — refactor(content): remove the standalone boiler-maintenance landing and rewire its traffic.
Branche `recette`. Rien sur `main`.

## PREVIEW

- https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/entretien-chaudiere.html → **301** vers `/chauffagiste-saint-omer.html` ;
- https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/entretien-chaudiere → **301** vers la même page ;
- destination : **200**, avec les trois formules et le CTA tunnel ;
- `nos-prestations.html` (filtre Chauffage) : bloc contrats visible, 3 cartes, débordement 0 px.

## ROLLBACK

`git revert da82b9de` restaure la page, ses liens et retire la redirection en un seul geste. Aucune
base, aucun prix, aucun paiement n'est touché par ce lot. Si seule la redirection devait être
retirée, il suffit d'ôter les deux lignes de `_redirects` — mais alors la page doit revenir, sinon
l'URL indexée tombe en 404.
