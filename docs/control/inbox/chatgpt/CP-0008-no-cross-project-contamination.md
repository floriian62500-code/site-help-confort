---
message_id: CP-0008
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# IMPORTANT — NE PAS MELANGER LES PROJETS

Florian signale à juste titre que HELP CONFORT / `site-help-confort` n'est PAS le projet `click-and-clock`.

Tu peux t'inspirer d'un pattern de runner déjà prouvé ailleurs, mais uniquement comme référence conceptuelle. Interdiction de :
- lire/écrire des fichiers métier dans `click-and-clock` ;
- utiliser ses branches, issues, statuts, backlog, variables, chemins ou données ;
- copier aveuglément son runner avec des chemins/noms/conventions spécifiques ;
- faire remonter des références click-and-clock dans l'outbox HELP CONFORT ;
- coupler les deux projets.

## Pour HELP CONFORT, tout doit vivre dans :
repo : `floriian62500-code/site-help-confort`
branche : `recette` / intégration du site selon le process existant
control-plane : `docs/control/`
inbox : `docs/control/inbox/chatgpt/`
outbox : `docs/control/outbox/claude/`
status : `docs/control/runner-status.json`

## Action
1. Si tu as lu `click-and-clock` uniquement pour comprendre un pattern technique, arrête là et adapte proprement le design au repo site.
2. Audit le code runner que tu viens de préparer et retire toute dépendance/référence/path/branch spécifique à click-and-clock.
3. Documente dans l'outbox la liste exacte des fichiers créés/modifiés pour le runner site.
4. Prouve que le runner HELP CONFORT ne touche qu'au repo site-help-confort.
5. Le runner doit rester incapable de pousser sur `main`/PROD automatiquement.

## Rappel
Le site HELP CONFORT est un projet séparé. Aucune contamination croisée n'est acceptable.
