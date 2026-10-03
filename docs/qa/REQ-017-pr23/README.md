# REQ-20260926-017 — preuves de la PR #23

Tout ce dossier est produit par `mesures.mjs`, qui mesure **deux états exacts** et
n'envoie **aucun** formulaire.

| état | ce qui est servi | SHA |
| --- | --- | --- |
| `main-prod` | production Netlify (`https://remarkable-dragon-364e2b.netlify.app`) | `dc9b39eb7e9ee9edd73684d324fee7aa5911016d` |
| `pr23-preview` | preview de la PR #23 (`https://deploy-preview-23--remarkable-dragon-364e2b.netlify.app`) | `46906e4ec548fc11c31796b8a86f067687840578` |

Rejouer à l'identique :

```bash
SHA_MAIN=$(git rev-parse origin/main) SHA_PR=$(git rev-parse pr23) \
  PLAYWRIGHT_IMPORT=/chemin/vers/node_modules/playwright/index.js \
  node docs/qa/REQ-017-pr23/mesures.mjs
```

Sorties : `mesures.json` (brut), `MESURES-PR23.md` (lisible, avec les empreintes
sha256 des captures réellement produites), et les captures JPEG. Les captures sont
écrites directement en JPEG par le script : il n'y a pas d'étape de conversion, donc
pas d'écart possible entre l'artefact mesuré et l'artefact versionné.

Nommage : `<état>-<largeur>-<étape>.jpg`.
L'étape `souscription-reference` est la **même** modale ouverte depuis
`/contrats-entretien.html` sur la production : elle sert de référence pour attribuer
ou non un défaut à la PR.

Le tiroir de preview Netlify (iframe `app.netlify.com`) est retiré avant chaque
capture et chaque clic : ce n'est pas le site, il intercepte les clics et il pollue la
console. Les erreurs console qu'il produit sont comptées à part.
