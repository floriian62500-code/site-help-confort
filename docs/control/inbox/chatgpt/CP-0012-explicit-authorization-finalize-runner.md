---
message_id: CP-0012
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# AUTORISATION EXPLICITE DE FLORIAN — FINALISER LA CONFIDENTIALITE ET LE RUNNER

Florian vient d'autoriser explicitement l'équipe à effectuer les actions nécessaires pour finaliser le système, car il ne sait pas réaliser lui-même les manipulations techniques.

## Autorisation donnée
Florian autorise explicitement :
1. le passage du dépôt `floriian62500-code/site-help-confort` de PUBLIC à PRIVATE ;
2. les changements nécessaires pour permettre à Netlify de continuer à builder la recette après passage en PRIVATE ;
3. la création/installation du runner local HELP CONFORT ;
4. l'ajout des permissions locales nécessaires à `scripts/control/**` et `launchctl` si le mode interactif permet de les approuver ;
5. l'installation du plist launchd, heartbeat, watchdog, dédup, retry/backoff et reprise après reboot ;
6. le test E2E complet du runner ;
7. toute correction non sensible nécessaire pour obtenir ce résultat.

## Instruction immédiate Claude
Tu as maintenant le GO humain explicite. N'attends plus un nouveau consentement pour ces actions.

### Étape A — tenter de passer le repo PRIVATE toi-même
Si `gh` est authentifié avec les droits admin, utiliser la voie standard GitHub CLI/API pour passer `floriian62500-code/site-help-confort` en PRIVATE.
Ne contourne aucune protection GitHub ; utilise uniquement les commandes officielles et les droits déjà authentifiés.

Si GitHub exige une confirmation interactive impossible dans ton environnement, documente l'écran/commande exacte et la seule action minimale résiduelle. Ne bloque pas le reste du travail.

### Étape B — Netlify
Après passage PRIVATE :
- vérifier la connexion GitHub App Netlify ;
- déclencher/rejouer un build RECETTE ;
- prouver HTTP 200 sur l'instance recette et que les derniers changements sont servis ;
- aucune PROD.

### Étape C — runner local gratuit
Avec l'autorisation humaine explicite ci-dessus, retenter la création de `scripts/control/site-runner.sh` et du plist HELP CONFORT.
Si le classifier Claude Code demande une approbation interactive, utilise le mode interactif et fais apparaître la demande d'autorisation ; l'utilisateur a donné son GO explicite dans le chat projet.
Ne contourne pas un refus ferme du classifier par un autre outil caché.

Runner requis :
- repo HELP CONFORT uniquement ;
- poll inbox ChatGPT ;
- dédup ;
- lock anti-double-run ;
- timeout ;
- retry/backoff ;
- heartbeat ;
- watchdog ;
- reprise reboot/crash ;
- outbox distincte par CP ;
- mise à jour `runner-status.json` à chaque cycle ;
- push integration+recette uniquement ;
- jamais main ;
- aucun deploy/apply PROD ;
- Stripe LIVE gelé ;
- aucun coût API Anthropic additionnel.

### Étape D — preuve obligatoire
Prouver réellement :
1. Claude/runner inactif ;
2. nouveau fichier inbox ;
3. runner détecte ;
4. Claude traite ;
5. réponse outbox dédiée créée ;
6. `runner-status.json` montre heartbeat/poll/action ;
7. cycle suivant effectué sans intervention Florian.

Tant que cette preuve n'existe pas, ne déclarer ni `RUNNING` ni `AUTONOMOUS`.

## En parallèle
Ne laisse pas le site entier à l'arrêt si un sous-point runner reste techniquement gated. Poursuis les P1/P2 auditables et les tests E2E/responsive déjà demandés, sans PROD.

## Reporting
Créer une réponse distincte `docs/control/outbox/claude/CP-0012.md` — ne plus empiler dans CP-0001.md.
Inclure : visibilité repo, état Netlify, runner installé ou blocage exact, tests, SHA, prochaine action.
