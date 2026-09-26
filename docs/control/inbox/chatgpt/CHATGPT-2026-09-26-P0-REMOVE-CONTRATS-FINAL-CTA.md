# Correction Florian — supprimer le bloc final inutile sur la page contrats

message_id: CHATGPT-2026-09-26-P0-REMOVE-CONTRATS-FINAL-CTA
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Décision Florian

Le bloc final de la page `/contrats-entretien.html` intitulé « Une question avant de souscrire ? » est à supprimer.

Ce bloc ne sert pas : il répète une action déjà présente plus haut sur la page et alourdit inutilement la fin du parcours.

## Élément à supprimer

Supprimer le bloc comprenant :
- le titre « Une question avant de souscrire ? » ;
- le texte « L'agence vous rappelle pour choisir la formule adaptée à votre équipement. » ;
- le bouton « Choisir ma formule » ;
- le lien « Être rappelé ».

Supprimer aussi le wrapper / styles dédiés uniquement à ce bloc si leur absence d'usage est prouvée.

## À conserver

- la FAQ « Vos questions » ;
- les cartes/formules ;
- les CTA utiles placés plus haut ;
- le contenu métier de la page ;
- le footer.

Le paragraphe « Pas encore sûr d'avoir besoin d'un contrat ? ... » est séparé du bloc : ne le supprimer que s'il est techniquement imbriqué dans le wrapper et impossible à conserver proprement. Sinon le laisser en place pour le moment.

## Tests

1. Le bloc « Une question avant de souscrire ? » n'existe plus.
2. Aucun trou visuel anormal entre FAQ / contenu suivant / footer.
3. Desktop 1440 et mobile 390.
4. Aucun impact sur les formulaires ou la souscription.
5. Suite complète verte.

## Retour attendu

- ROOT_CAUSE
- FILE_CHANGED
- BLOCK_REMOVED
- CSS_CLEANUP
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.