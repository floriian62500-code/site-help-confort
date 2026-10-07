# REQ-044 — En-tête unifié : PR #43

**Branche** `feat/en-tete-unique` — base `main` à `a5cf4fa2` — 5 commits, 211 fichiers.
**Preview** https://deploy-preview-43--remarkable-dragon-364e2b.netlify.app
**Statut demandé** READY_FOR_CONTROL. Aucun merge, aucune mise en production de ma part.

## Pourquoi ce lot était à portée

`main` portait déjà `scripts/header/sync-header.mjs` **et** `scripts/tests/header.test.mjs`.
Manquaient `partials/hc-header.html`, `assets/hc-header.css`, `assets/hc-header.js` : les deux
s'arrêtaient sur ENOENT. C'est aussi l'explication des 5 fiches cassées de la PR #40 — elles
appelaient ces assets, jamais publiés.

Les 3 fichiers sont repris **tels quels** de `archive/recette-2026-10-06-pre-sync`, identiques à
l'octet près sur toutes les branches qui les portent. `sync-header.mjs` et `header.test.mjs` de
`main` sont eux-mêmes identiques à ceux de cette lignée.

## État avant

118 pages à la racine, **27 en-têtes différents**, 4 pages sans aucun `<header>`.

## Trois corrections au synchroniseur, sans lesquelles il abîme le site

1. **Empreinte sha1 au lieu du sha256 du site.** Appliqué tel quel, il faisait repasser 204 pages
   de `?v=1c234e7b33` à `?v=fb525678f2` pour l'encart saisonnier — l'écart même que la PR #40
   vient de refermer sur 5 fiches. Après correction : 206 pages sur la même valeur.
2. **`scripts/` traité comme un dossier de pages** : deux fragments de corps y entraient.
3. **Une page exclue absente faisait planter le script** (le tunnel `catalogue.html` n'est pas
   encore dans le dépôt). Même traitement pour l'assertion correspondante, qui le dit en clair.

## Et une quatrième, trouvée en vérifiant

**Deux générateurs écrivaient dans `realisations/` avec deux en-têtes différents.** Une exécution
de `gen-realisations.mjs` défaisait la synchronisation sur les 34 fiches, sans rien signaler.
Le générateur passe maintenant par `transform()` du synchroniseur. Vérifié : après
`gen-realisations.mjs`, `sync-header.mjs --check` sort 0 et une seconde exécution ne change rien.

## Preuves

```
RÉSULTAT EN-TÊTE UNIQUE : 15 PASS / 0 FAIL      (ne démarrait pas sur main)
```

Les 29 autres suites, jouées sur `main` puis sur le lot : **28 / 30 strictement inchangées**.
Les 2 qui bougent ne démarraient pas sur `main` : `header` (15/0) et `home-promo`
(17 PASS / 4 FAIL, sur des sujets hors lot : tunnel absent, formulation d'accueil disparue,
ancres de la page Chauffage, un prix).

Preview, 1440 : en-tête **165 px** — la hauteur de référence exigée — sur page métier,
prestation et fiche chantier ; 37 liens ; rubrique active juste ; aucun débordement.
Preview, 390 : en-tête 95 px, page à 390 exactement, burger visible, `aria-expanded`
false → true, verrou de défilement posé, panneau ouvert sous la barre, 18 liens.

Périmètre : 114 racine · 35 prestations/ · 34 realisations/ · 21 actualites/ · 2 scripts/ ·
2 assets/ · 1 partials/ · **0 admin/ · 0 admin-pro/ · 0 supabase/**.

## Trois constats à traiter à part

**1. La garde d'hygiène salit le dépôt.** `scripts/tests/depot-propre.test.mjs` détecte les
scripts qui écrivent en important chaque module de `scripts/` et en jouant chaque autre suite —
et ne restaure jamais ce que ces exécutions ont écrit. Sur `main` nu :

```
node scripts/tests/depot-propre.test.mjs  ->  111 pages de la racine modifiées, laissées telles quelles
```

Elle a aussi réécrit 6 pages de `admin-pro/` en cassant des sélecteurs CSS composés
(`.dropzone.over` -> `.dropzone .over`). C'est le piège qui a faussé ma première mesure de ce lot :
j'ai dû reconstruire la branche à zéro.

**2. Des dossiers internes sont servis en production.** La même suite liste 12 dossiers à bloquer
par une règle `404!` dans `_redirects` : **aucun des 12 n'a de règle**. Relevé sur
`depan59-62.fr` : `/docs/`, `/scripts/`, `/supabase/`, `/logs/`, `/secrets/`, `/admin/`,
`/admin-pro/audits/`, `/admin-pro/scripts/` répondent **200** ; `/tools/`, `/.github/`,
`/.autopush/` répondent 404. Le dépôt étant public, ce n'est pas une divulgation nouvelle, mais
servir ces chemins depuis le site reste à fermer. Ce lot ajoute la règle pour `/partials/*`
seulement — le dossier qu'il crée.

**3. La barre au-dessus de l'en-tête reste hétérogène.** 139 pages sur 204 portent une
`.hc-topbar`, en **7 balisages différents** ; 65 n'en ont aucune. Elle est hors du `<header>`.
Décision à prendre : la faire entrer dans le partiel, ou la retirer. Elle affiche les deux
agences et les horaires — le sujet rejoint « une seule agence à Saint-Omer ».
