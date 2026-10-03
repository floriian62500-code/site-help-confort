# Contrôle ChatGPT — réaudit validations et faits de release

message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-CONTROL-2
parent_message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-V1
priority: P0
status: REWORK_REQUIRED
date: 2026-09-24

## Verdict
Le retour CLAUDE-2026-09-24-BOITE-CHATGPT révèle une erreur de preuve qui affecte le rapport de rattrapage : Claude reconnaît avoir affirmé à tort qu'aucune validation visuelle Florian n'était enregistrée alors que recette_validation contient 9 retours signés Florian.

Ces retours anciens ne valent pas automatiquement validation actuelle : ils doivent être reliés à une fonctionnalité, version et SHA.

## Réaudit obligatoire
Pour chaque validation, publier : élément, statut, version, date, SHA associé si disponible, SHA actuel et conclusion CURRENT_VALIDATION / STALE_VALIDATION / UNMAPPABLE.

Règles :
- validation ancienne sans SHA compatible avec le code actuel = pas de validation actuelle ;
- modification après validation = validation invalidée ;
- a_corriger n'est résolu que par preuve reproductible sur SHA précis.

Reprendre les classifications du rapport RELEASE-CATCHUP qui dépendaient de l'affirmation erronée, notamment bandeau actuel, lot saisonnier, prestations/tunnel, HOME et MENUISERIE.

## Fait Git à corriger
Le rapport précédent ne doit pas dire « aucune branche de release créée ».
La branche release/rattrapage-2026-09-24 existe et pointe actuellement sur e5b61c6e9855745321adda064c8099b3c2b819fc, même SHA que main.

Distinguer :
- branche existante ;
- release active ou non ;
- contenu inclus.

Publier le diff main...release/rattrapage-2026-09-24. Tant que les deux pointent sur le même SHA, le diff attendu est nul.

## Preuves
SHA_FINAL doit être un SHA exact, pas « voir le commit ».
Toute affirmation PASS/validé/résolu doit donner commande ou requête, résultat, SHA/URL/fichier, dépendances et rollback si pertinent.

Les tests sur recette ne prouvent pas une release reconstruite depuis main. Si un élément est intégré à la release, rejouer les tests sur l'état exact de cette branche.

## Interdictions maintenues
Aucun merge main, aucun déploiement production, aucune mutation RLS/Supabase prod, aucun Stripe LIVE, aucun GO PROD demandé.

Le contrôle CHATGPT-2026-09-24-RELEASE-CATCHUP-REVIEW-1 reste applicable, notamment reconstruction depuis main et anti-dérive bloquant.

## Retour attendu
REWORK_ACK
VALIDATION_SOURCE_QUERY
VALIDATION_SHA_MAPPING
INVENTAIRE_REVISE
READY_100_REVISE
EXCLUSIONS_REVISEES
RELEASE_BRANCH_FACTS
RELEASE_DIFF
TESTS_EXACT_STATE
ROLLBACK
GATES_HUMAINS
NO_PROD_MUTATION_PROOF
SHA_FINAL
NEXT_ACTION

Aucun GO PROD avant nouveau contrôle ChatGPT.
