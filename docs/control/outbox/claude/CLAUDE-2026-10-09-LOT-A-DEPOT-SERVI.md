# CLAUDE-2026-10-09 — Lot A : 27 fichiers internes étaient servis sur depan59-62.fr

> Premier lot de l'inventaire des rouges. Branche `fix/notes-internes-servies@3228a846`, depuis `main` **c4f009a3**.
> **PR #62**, preview verte, blocage vérifié URL par URL. `depot-propre` : **8/2 → 11/0**.

## Le constat, mesuré sur la production

Le site est publié depuis la racine (`publish = "."`) : tout fichier suivi part chez Netlify. J'ai
interrogé `depan59-62.fr` pour chaque fichier de la racine. **27 répondaient 200** : notes de travail,
5 changelogs, deux générateurs Python, un script shell `.command`, un classeur de photos — et
**`index.html.bak.before-minify`**, une copie de **205 ko de l'accueil** en `robots: index, follow`,
soit un doublon indexable de la page d'accueil, avec l'ancienne marque dans son `<title>`.

`robots.txt` interdit `/*.md$` aux moteurs, mais ce n'est pas un contrôle d'accès. Seule une règle
`_redirects` terminée par `!` passe devant le fichier statique.

## Ce n'est pas une fuite de secret

Vérifié avant d'écrire quoi que ce soit : **aucune clé ni JWT complet** dans ces fichiers. Les
correspondances sont des noms de variables (`SERVICE_ROLE`, `password`) et la mention d'un jeton
GitHub **déjà révoqué**, dans une phrase qui le dit. Ce qui était exposé, c'est de l'historique
d'incidents et des consignes internes sur le domaine commercial. Gênant, pas critique — et je le
formule ainsi volontairement, le dépôt étant public.

## Ce qui reste servi, et pourquoi

`logo.svg` et `logo-officiel.jpg` (référencés par 207 et 238 pages), `styles.css`, `script.js`,
`sw*.js`, `manifest.json`, `robots.txt`, `humans.txt`, les 4 sitemaps, et
`9e0e7a806c9dc08d00dc44da895a8a1b.txt` — **un fichier de vérification de domaine**, dont le contenu
est son propre nom. Celui-là ressemble à un déchet : le bloquer aurait cassé une vérification.

## Deux corrections de la garde

1. **Elle réclamait l'impossible.** Son commentaire explique que `/admin/*` ne doit pas être bloqué
   (back-office Decap, lié depuis deux pages), mais `admin` manquait à la liste des dossiers publics :
   elle échouait sans qu'aucune correction du site ne puisse la satisfaire.
2. **Elle nommait 5 notes à la main**, la réalité en comptait 27. Elle part maintenant de ce que git
   suit, moins une liste courte et justifiée. Vérifiée mordante dans les deux sens : règle retirée
   (le `.bak` ressort), fichier neuf ajouté (il ressort).

## Un retrait, annoncé

Deux copies d'un **fichier propriétaire Word** (162 o, aucune chaîne lisible), dont l'une dans un
dossier au nom terminé par **une espace** : `_redirects` ne peut pas l'exprimer sans encodage.
Retirées du suivi, réversible, elles restent dans l'historique.

## Preuves

| | |
|---|---|
| base | `main` c4f009a3 · tête `3228a846` · **PR #62** |
| preview | bloqués → 404 : `TODO.md`, `POUR-FLORIAN.md`, `BUGS-HISTORY.md`, `index.html.bak.before-minify`, `Cleanup-Doublons.command`, `_gen_seo_pages.py`, `CHANGELOG.md` |
| preview | servis → 200 : `logo.svg`, `styles.css`, `robots.txt`, `sitemap.xml`, `manifest.json`, le fichier de vérification, `nos-metiers.html` |
| règles | 30 fichiers + 1 dossier en `404!` |
| suite | `depot-propre` 11/0 ; les 30 autres identiques à `main` |

## Suite

Lot H (5 suites qui plantent) puis la **CI** : `derive-release` plante sur
`.github/workflows/tests.yml`, qui n'existe pas. Tant qu'aucun workflow ne lance la suite, tout ce
que je remets au vert se re-dégradera.

Reste hors lot : ces 30 fichiers n'ont rien à faire à la racine d'un dépôt publié. Les bloquer est le
geste sûr ; les ranger dans `docs/` est un lot de rangement à part.
