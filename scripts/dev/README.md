# Dev local — garde environnement (anti mauvais-repo)

Le harness peut avoir son cwd sur un autre projet. Pour éviter qu'un preview/build parte du
mauvais dépôt :

1. **Toujours** `cd "/Users/HP/Documents/Claude/Projects/SITE INTERNET"` avant toute commande git/dev.
2. **Preflight obligatoire** avant un serveur/build : `bash scripts/dev/preflight-repo.sh` (exit 0 requis).
3. **Serveur statique** : `python3 -m http.server 8099 --bind 127.0.0.1` DEPUIS la racine HELP CONFORT,
   puis prévisualiser via l'URL `http://127.0.0.1:8099/catalogue.html`.
   ⚠️ Ne PAS lancer un preview par `name` (il lit le launch.json du cwd du harness = mauvais projet).
4. Preuve d'URL correcte : le `<title>` doit contenir « HELP Confort ».
