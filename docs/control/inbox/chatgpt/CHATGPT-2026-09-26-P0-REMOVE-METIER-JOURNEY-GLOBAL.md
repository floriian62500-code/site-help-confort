# Correction Florian — supprimer le module parcours de toutes les pages métier

message_id: CHATGPT-2026-09-26-P0-REMOVE-METIER-JOURNEY-GLOBAL
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Décision Florian

Le module « Voici comment ça se passe une fois votre demande envoyée » doit être supprimé de TOUTES les pages métier.

Ce point avait déjà été demandé. La présence actuelle sur chauffagiste-saint-omer montre que le nettoyage n'a pas été appliqué globalement.

## Élément à supprimer

Sur chauffagiste-saint-omer.html, le module est identifié par :
- section class="hc-metier-journey"
- aria-label="Voici comment ça se passe"
- titre « Voici comment ça se passe une fois votre demande envoyée »

Contenu type :
1. Décrivez votre besoin
2. Nous préparons votre dossier
3. Un conseiller vous rappelle
4. Vous recevez votre devis
5. Nos techniciens interviennent

## Travail demandé

Faire une recherche globale du dépôt recette et supprimer ce module sur toutes les pages métier qui le contiennent.

Ne pas se limiter à Chauffage.
Contrôler notamment toutes les variantes métier et ville : chauffage, plomberie, électricité, serrurerie, vitrerie, menuiserie, volets, PMR, travaux, dépannage et autres pages métier utilisant ce composant.

Supprimer également les CSS/JS dédiés uniquement à ce module SI et seulement SI leur absence d'usage est prouvée après recherche globale.

Ne pas supprimer un style partagé avec d'autres composants.

## Règle de validation

Après correction, une recherche globale sur :
- hc-metier-journey
- hmj-title
- hmj-num
- « Voici comment ça se passe une fois votre demande envoyée »

doit retourner 0 occurrence sur les pages publiques, hors tests/documentation éventuellement nécessaires.

## Tests obligatoires

1. 0 module journey sur toutes les pages métier publiques.
2. Aucun trou visuel ou marge anormale après suppression.
3. Footer et FAQ remontent proprement.
4. Desktop 1440 + mobile 390 sur au moins Chauffage, Plomberie, Électricité et Menuiserie.
5. Aucun JS/CSS mort laissé si dédié uniquement au module.
6. Suite complète verte.

## Retour attendu

- ROOT_CAUSE
- GLOBAL_OCCURRENCES_BEFORE
- PAGES_CHANGED
- GLOBAL_OCCURRENCES_AFTER
- CSS_JS_CLEANUP
- TESTS
- SCREENSHOTS_SAMPLE
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.