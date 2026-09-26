# Documentation mainteneur — site HELP Confort

> Objectif : qu'un développeur qui découvre le projet puisse le comprendre, le faire tourner,
> le modifier et le dépanner **sans avoir à deviner**. Mise à jour : 2026-09-20.

## Par où commencer

| Vous voulez… | Lisez |
|---|---|
| comprendre le projet en 10 minutes | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **savoir où modifier telle chose** | [OU-MODIFIER-QUOI.md](OU-MODIFIER-QUOI.md) ⭐ |
| faire tourner le site en local | [LOCAL-SETUP.md](LOCAL-SETUP.md) |
| lancer les contrôles avant de committer | [TESTING.md](TESTING.md) |
| comprendre la mise en ligne | [DEPLOYMENT.md](DEPLOYMENT.md) |
| savoir quelles variables existent | [ENVIRONMENT.md](ENVIRONMENT.md) |
| comprendre les données | [DATABASE.md](DATABASE.md) |
| comprendre le paiement | [PAYMENTS.md](PAYMENTS.md) |
| comprendre le parcours d'une demande | [LEADS-AND-NOTIFICATIONS.md](LEADS-AND-NOTIFICATIONS.md) |
| comprendre la mesure d'audience | [TRACKING.md](TRACKING.md) |
| réparer quelque chose qui casse | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) et [INCIDENT-RUNBOOK.md](INCIDENT-RUNBOOK.md) |
| toucher au catalogue / au panier | [CATALOGUE-PANIER-ARCHITECTURE.md](CATALOGUE-PANIER-ARCHITECTURE.md) |
| créer une page | [../process/REGLE-PAGE-CANONIQUE.md](../process/REGLE-PAGE-CANONIQUE.md) |
| gérer l'auto-push de la machine | [../ops/AUTO-PUSH.md](../ops/AUTO-PUSH.md) |

## Les cinq règles qui évitent 90 % des ennuis

1. **On travaille sur `recette`.** `main` est la production ; on n'y pousse pas sans décision explicite.
2. **Un fichier de `assets/` est en cache un an** (immuable). Toute modification d'un asset exige de
   **bumper son `?v=`** dans les pages qui le chargent, sinon personne ne voit le changement.
3. **On ne crée pas une page avant d'avoir cherché l'existante** :
   `node scripts/seo/duplicate-intent.mjs --intent "…"`.
4. **On ne soumet jamais un formulaire du site « pour tester »** : les leads partent réellement à
   l'agence. Pour vérifier un contrat serveur, envoyer un payload volontairement invalide (réponse 400,
   rien n'est créé) — voir [TESTING.md](TESTING.md).
5. **Prix, délais et conditions ne s'inventent pas.** Ils viennent de Supabase ou d'un document de
   l'agence ; sans source, on n'affiche pas.

## État des lieux (inventaire du 2026-09-20)

`node scripts/audit/inventaire.mjs` — compte les usages réels avant toute suppression :

| | |
|---|---|
| pages HTML publiques | 210 |
| assets js/css | 46 (1 sans aucune référence) |
| images | 188 (57 sans aucune référence) |
| fonctions edge | 40 (3 récupérées depuis la production le 20/09, elles n'avaient pas de source) |
| scripts | 130 (79 jamais cités ailleurs : scripts « one-shot » historiques) |
| sélecteurs CSS cassés par l'ancienne minification | **0** (1 901 rétablis le 20/09) |
