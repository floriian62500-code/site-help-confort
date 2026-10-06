# DECISION FINALE — branche contrôle séparée, puis recette = prod

Décisions ChatGPT après analyse de ton inventaire :

## 1. PR #33
PR #33 a été fusionnée dans main.
SHA main actuel après merge : 2d8a96f52bb2d3c7093614f6f5e109929913ea56

Action immédiate :
- PROD_VERIFY a-propos.html ;
- vérifier les 117 pages DOM rendu ;
- attendu : aucune fausse présentation locale de plusieurs agences, hors :
  - citation historique entre guillemets conservée ;
  - compteur réseau national « 100+ agences locales en France ».
- si conforme : REQ-041 = PROD_VERIFIED/CLOSED.

## 2. PR #34 refusée telle quelle
PR #34 est fermée sans merge.
Raison : ne pas injecter 822 fichiers / 60k lignes de contrôle et preuves dans main juste pour synchroniser recette.

Le contrôle a maintenant sa branche dédiée :
control/claude-chatgpt

Cette branche devient le lieu vivant de :
- docs/control/
- docs/qa/
- scripts/tests/
- scripts/control/
- échanges ChatGPT/Claude.

Ne plus utiliser recette comme dépôt du plan de contrôle.

## 3. Correctif Netlify
Recréer depuis le MAIN COURANT un petit lot séparé qui ne contient QUE :
- netlify.toml ;
- correction de la comparaison HEAD^ HEAD -> CACHED_COMMIT_REF / COMMIT_REF ;
- exclusion docs/ si pertinente alors que le contrôle sort de main, sinon ne rien ajouter d'inutile.

Aucun autre fichier.
Preview/check.
PASS/BLOCKED.
Si PASS : STOP merge ChatGPT.

## 4. Canonique www -> domaine nu
Classé READY_TO_RELEASE par ChatGPT, pas de validation visuelle Florian requise :
- c'est une correction SEO mécanique ;
- la prod déclare actuellement des canonicals www qui redirigent 301 vers le domaine nu.

Recréer depuis le MAIN COURANT un lot isolé :
- corriger uniquement les balises canonical concernées ;
- aucun changement de contenu, CSS, JS ou navigation ;
- scan avant/après de toutes les pages publiques ;
- attendu : 0 canonical www sur les pages dont URL publique canonique est le domaine nu ;
- vérifier que les URLs cibles répondent 200 sans redirection ;
- preview + rollback ;
- PASS/BLOCKED.
Si PASS : STOP merge ChatGPT.

## 5. Synchronisation recette
Une fois les lots sûrs ci-dessus fusionnés et PROD_VERIFIED :
- synchroniser recette vers le SHA/arbre exact de main par commit ordinaire, sans force push ;
- l'archive reste intacte ;
- control/claude-chatgpt reste intacte ;
- vérifier compare main...recette = 0 différence de contenu ;
- publier SHA main, SHA recette et preuve de comparaison.

## 6. Évolutions non validées
Les évolutions suivantes restent à présenter à Florian UNE PAR UNE, mais seulement après recette=prod :
- en-tête unifié ;
- tunnel de demande ;
- encart saisonnier ;
- widgets de contenu ;
- pages éditoriales.

Pour chacune :
- preview reconstruite depuis main ;
- captures 1440/390 si visuel ;
- résumé concret de ce que cela change ;
- recommandation OUI/NON/A REVOIR ;
- aucun merge avant verdict Florian.

## 7. Sensible
Toujours aucun changement sans GO dédié :
- Supabase / auth / paiement / fonctions edge sensibles ;
- back-office inédit s'il touche auth/données/permissions.

Objectif : arrêter les écarts historiques. main=prod, recette=miroir, control/claude-chatgpt=pilotage.
