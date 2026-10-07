# REQ-042 — Réalisations : les cartes renvoient un 404, et la PR #39 a publié 5 fiches cassées

**Branche** `fix/realisations-lot-cartes-et-fiches` — **PR** #40 — base `main` à `76ca7c5e`
**Preview** https://deploy-preview-40--remarkable-dragon-364e2b.netlify.app
**Statut demandé** READY_FOR_CONTROL — aucun merge, aucune mise en production de ma part.

---

## 1. L'instruction reçue, et pourquoi elle ne s'applique plus telle quelle

> « Monte immédiatement depuis le `main` courant un lot isolé avec uniquement : les 5 fiches
> chantier listées dans ton rapport ; `realisations/index.json`. Ouvre une PR vers `main`,
> sans aucun autre fichier. »

Ce lot **est déjà en production** : la PR #39 a été fusionnée ce matin et déployée à
`76ca7c5e` (deploy Netlify `6ac60cac…`, publié le 2026-10-07 à 09:11 UTC, branche `main`).
`main` porte maintenant 30 fiches et le manifeste.

Mon analyse précédente portait sur `7bec4bd3`, qui était alors le `main` publié. Je l'ai
reprise sur le `main` réel avant d'écrire une seule ligne.

Ce qui reste n'est pas la copie de 5 fiches : c'est ce que cette publication laisse derrière
elle, plus ce que le dépôt réclamait déjà.

## 2. Ce que fait la production aujourd'hui — mesuré, pas supposé

**a. Les 34 cartes de `/realisations.html` renvoient un 404.**
`realisations.html:837` et `actualites.html:716` construisent le lien sur
`realisation/<slug>.html` — singulier — alors que les fiches sont dans `realisations/`.

```
GET https://depan59-62.fr/realisation/remplacement-de-parquet-massif.html   -> 404
GET https://depan59-62.fr/realisations/remplacement-de-parquet-massif.html  -> 200
```

L'accueil utilise le pluriel : il n'était pas touché. C'est le « clic sans effet » que la
suite de tests versionnée décrit depuis le 19/09.

**b. Les 5 fiches publiées par la PR #39 ont un en-tête cassé.**
Elles appellent `/assets/hc-header.css` et `/assets/hc-header.js`, absents de toute branche,
404 en production. Mesuré sur `depan59-62.fr` :

| largeur | fiche PR #39 (parquet massif) | fiche saine (vitre d'insert) |
|---|---|---|
| 390 px | en-tête **2889 px**, page 5223 px, **débordement horizontal** | en-tête 69 px, pas de débordement |
| 1440 px | en-tête **1209 px** : le contenu n'est pas visible sans défiler | — |

**c. Quatre chantiers publiés n'ont pas de fiche.** Le visiteur atterrit sur la page héritée :
« Chantier introuvable — Ce chantier n'existe pas ou n'est pas publié. » (relevé dans le DOM
rendu, pas dans le HTML servi).

**d. Le générateur et sa suite de tests ne démarrent pas.** `scripts/gen-realisations.mjs` et
`scripts/tests/realisations.test.mjs` sont versionnés sur `main` et font tous deux
`require('../assets/hc-realisations.js')`. Le fichier n'existe nulle part : `MODULE_NOT_FOUND`.

**e. Le générateur efface l'encart saisonnier.** Son gabarit ne contient aucune des deux
balises de la PR #38 : toute régénération les retire des fiches en ligne.

**f. Les corrections de métier de la PR #39 ne survivent pas à une régénération.** Elles ont
été faites à la main dans le HTML ; la base renvoie toujours « rénovation » pour une serrurerie
et « serrurerie » pour un parquet.

## 3. Le lot livré — 5 commits, un sujet par commit

| commit | effet |
|---|---|
| `1e993a69` | pluriel rétabli sur les deux pages — 2 lignes |
| `80c0cb96` | `assets/hc-realisations.js`, le module que le dépôt réclame déjà |
| `3834db1a` | le générateur écrit l'encart saisonnier (empreinte sha256, comme les 197 pages) |
| `91449ff6` | sortie du générateur : 34 fiches, manifeste, `_redirects` 25 → 34 règles |
| `6c1c0391` | table de correction du métier, pour que la correction manuelle survive |

Effet de bord utile : les 5 fiches de la PR #39 rejoignent l'empreinte du reste du site
(`sha1 fb525678f2` → `sha256 1c234e7b33`). Elles étaient les 5 seules pages sur 202 à porter
une autre valeur.

## 4. Preuves

**Suite de tests versionnée.** Elle ne démarrait pas sur `main` ; référence prise sur
`main` + le seul module, pour que la comparaison ait un sens :

```
référence (main 76ca7c5e + module) : 12 PASS / 11 FAIL
ce lot                             : 13 PASS / 10 FAIL
```

Un seul verdict bouge, dans le bon sens. Les **10 échecs restants sont antérieurs** et
identiques à la référence : ils portent tous sur le câblage du classement partagé dans les
pages de racine (accueil, avant/après, 26 pages métier, actualités). Ce lot ne les ouvre pas.

**Sur la preview #40**, à 1440 : 34 cartes, **34/34 liens en HTTP 200** (c'étaient 34 × 404),
0 fiche référençant `hc-header`, pas de débordement. Clic réel sur une carte → la fiche
s'ouvre. À 390 : en-tête 69 px, pas de débordement, encart saisonnier présent.

**Métier** sur la preview : serrurerie → Serrurerie, parquet → Rénovation,
entretien chauffage → Chauffage, chauffe-eau → Plomberie.

**Périmètre, par famille de dossier :** `realisations/` 35 · racine 3 · `scripts/` 1 ·
`assets/` 1 · `admin/` 0 · `admin-pro/` 0 · `supabase/` 0.
Aucune migration, aucune fonction edge, aucune 301, aucune suppression de page, aucun
changement de navigation, aucun secret.

## 5. Ce que je n'ai pas fait, et qui vous revient

1. **La donnée du back-office reste fausse.** Les cartes de `/realisations.html` lisent la base
   directement : elles affichent encore le mauvais métier, alors que la fiche affiche le bon.
   Le correctif de fond est une écriture en base — je n'y touche pas.
2. **« Avant l'hiver, pensez à l'entretien de votre chauffage » est un conseil, pas un chantier.**
   La base ne le marque pas comme actualité, donc il sort en fiche chantier. Je lui ai donné une
   fiche pour ne pas laisser sa carte sans destination, mais la décision est à vous :
   soit il est marqué actualité en base, soit il reste un chantier.
3. **Les 10 échecs de la suite de tests** appellent le chantier « une seule logique de sélection »
   (module partagé sur l'accueil, avant/après, 26 pages métier, actualités). C'est un lot à part.
4. **Aucun merge de ma part.** La PR #40 attend votre contrôle.
