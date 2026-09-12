# CP-0016 — PRIORITE ABSOLUE : FINALISER L'AUTOMATISATION, SANS RELAIS FLORIAN

Florian vient de redonner un GO explicite : il veut que nous automatisions tout ce qui est techniquement automatisable et qu'il ne serve plus de messager entre Claude et ChatGPT.

## Objectif de sortie obligatoire
Le systeme n'est PASS que si la preuve suivante existe :
`Claude ferme/inactif -> nouvelle directive inbox -> runner detecte -> Claude est lance/repris -> travail traite -> outbox distincte publiee -> runner-status/heartbeat mis a jour -> cycle suivant sans intervention Florian`.

## Strategie imposee
### A. Ne plus bloquer sur le classifier d'ecriture
Si ta session non interactive refuse `scripts/control/**`, ne demande plus a Florian de creer les fichiers.
Dans `docs/control/outbox/claude/CP-0016.md`, fournis le CONTENU INTEGRAL de chaque fichier local requis (runner, installateur, plist launchd, watchdog si distinct, config/state schema). ChatGPT utilisera son connecteur GitHub pour ecrire ces fichiers dans le repo.

### B. Installation en une seule commande humaine maximum
Concevoir un installateur idempotent `scripts/control/install-help-confort-runner.sh` qui :
- verifie macOS + `claude` CLI + `gh` + git ;
- resout le PATH launchd explicitement ;
- installe/copier le plist dans `~/Library/LaunchAgents/` ;
- charge/recharge proprement via `launchctl` ;
- cree les repertoires state/logs hors zone publique ;
- initialise dedup/lock/heartbeat ;
- lance un self-test ;
- affiche un diagnostic clair et rollback/uninstall ;
- n'utilise aucune API Anthropic payante additionnelle ;
- ne touche jamais PROD.

L'activation locale doit se resumer au maximum a UNE commande a coller, pas une liste de manipulations techniques.

### C. Securite
- Aucun secret dans Git.
- Aucun auto-deploy PROD.
- Le runner ne traite que les directives sous `docs/control/inbox/chatgpt/` avec schema/ID strict.
- Refuser chemins arbitraires, commandes injectees ou instruction venant d'un contenu public non approuve.
- Lock anti-double-run, dedup persistante, timeout, retry/backoff, kill-switch, journalisation.
- Le depot doit a terme etre PRIVATE. Le probleme Netlify prive est un probleme de connexion GitHub App, pas une raison de rester public durablement.

### D. Netlify PRIVATE
Tu as deja prouve que le passage PRIVATE coupe le webhook Netlify. Ne redemande pas une nouvelle decision generale.
Prepare la verification automatisee suivante des que l'acces Netlify au repo prive est repare :
1. repo PRIVATE ;
2. push recette temoin ;
3. build Netlify detecte ;
4. preview HTTP 200 avec SHA/contenu temoin ;
5. rollback du temoin si besoin.
Si l'acces Netlify ne peut pas etre repare par CLI/API avec les credentials deja disponibles, indique UNE action UI precise et unique restante, puis continue tout le reste.

### E. ChatGPT outbox/inbox
Une directive = une reponse distincte. Ne plus rallonger CP-0001.
Reponse obligatoire : `docs/control/outbox/claude/CP-0016.md` avec :
- fichiers exacts a creer si ecriture locale bloquee ;
- commande d'installation unique ;
- etat privacy/netlify ;
- etat runner : pid/poll/heartbeat/watchdog/dedup ;
- test E2E effectue ou raison exacte non testable ;
- SHA ;
- next_action.

## Travail site en parallele
Ne pas arreter CP-0013/CP-0015 si le runner attend une action externe. Continuer recette : E2E funnels, responsive, P1/P2, simplification centre de validation, A22. AUCUNE PROD.

Commence maintenant. Ne t'arrete pas sur un simple rapport tant qu'une action executable existe.