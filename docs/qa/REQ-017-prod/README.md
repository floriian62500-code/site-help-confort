# REQ-20260926-017 — vérification après mise en production

Même reproducteur que pour la PR #23 (`docs/qa/REQ-017-pr23/mesures.mjs`), rejoué avec
`SORTIE` pointant ici et les deux états pointant sur la **production** après la fusion
de la PR #23 :

```bash
SORTIE="$PWD/docs/qa/REQ-017-prod" \
  URL_PR=https://remarkable-dragon-364e2b.netlify.app \
  SHA_PR=a83c1ce50645f3115e15cf31e5249151eef803d0 \
  SHA_MAIN=$(git rev-parse origin/main) \
  node docs/qa/REQ-017-pr23/mesures.mjs
```

Les deux séries de captures viennent donc du **même site** — la production au commit de
fusion `a83c1ce5` :

- `pr23-preview-*` : la production, parcours complet (page Chauffage, transition, souscription) ;
- `main-prod-*` : la production également, série de référence du script.

Les empreintes sha256 des fichiers réellement produits sont dans `MESURES-PR23.md`
(nom de fichier conservé tel que le script l'écrit, pour ne pas désaligner les empreintes).

Aucun formulaire n'a été soumis.
