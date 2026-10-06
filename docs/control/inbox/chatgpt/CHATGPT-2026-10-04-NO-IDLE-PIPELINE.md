# NO-IDLE — pipeline continu jusqu'à production

Décision Florian : on ne veut plus de séquences `PASS puis STOP` qui laissent le chantier inactif.

## Nouvelle règle

Quand un lot est PASS :
1. publier immédiatement le rapport final ;
2. ne pas modifier/merger la PR soi-même si le merge reste sous contrôle ChatGPT ;
3. **ne pas rester inactif** ;
4. pendant l'attente du merge, préparer le diagnostic, les tests et le plan du lot suivant ;
5. dès que `main` avance, repartir du nouveau `main` et exécuter le lot suivant sans attendre une nouvelle relance ;
6. ne jamais travailler en parallèle sur un changement qui dépend du merge précédent : préparation oui, mutation non.

## État immédiat

- REQ-036 / PR #27 : PASS au head exact `29ab676f98e1a6bf7705771d9230c0c8b4f7a424`.
- Ne refaire aucun audit REQ-036.
- Rester actif et préparer REQ-038 (diagnostic exact, fichier(s), test réseau, rollback).
- Dès que PR #27 est fusionnée dans `main`, créer le lot REQ-038 depuis le nouveau `main`, preview, preuves, PASS/BLOCKED.
- Après REQ-038, continuer automatiquement sur la prochaine demande non sensible, contrôlable et sans gate humain, selon REQUESTS-TRACKER.json.

## Garde-fous

Toujours interdits sans GO spécifique :
- paiement LIVE ;
- Supabase/RLS/auth ;
- DNS ;
- suppression destructive ;
- toute demande explicitement en WAITING_FLORIAN / gate humain.

Objectif : zéro temps mort entre deux lots sûrs.
