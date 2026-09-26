# P0 — GEL IMMÉDIAT DES MODIFICATIONS UX/FONCTIONNELLES

message_id: CHATGPT-2026-09-26-P0-FREEZE-AND-STABILIZE
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Décision Florian / contrôle ChatGPT

Le niveau de régressions visuelles et fonctionnelles est devenu inacceptable.
À partir de maintenant : GEL IMMÉDIAT de toute modification UX/fonctionnelle non strictement corrective.

## Règles

1. Ne plus ouvrir de nouveau sujet.
2. Ne plus refondre de section entière.
3. Ne plus modifier plusieurs pages/familles en même temps sans preuve préalable.
4. Toute correction se fait sur une seule REQ numérotée, puis contrôle, puis seulement la suivante.
5. Si une correction casse le rendu ou le routage, revenir au dernier état stable avant de retenter.
6. Aucun changement de production.

## Priorité absolue

Stabiliser les régressions actuellement visibles :
- page Chauffage / cartes prestations cassées ;
- CTA « Voir nos prestations chauffage avec prix » mal routé vers le tunnel ;
- pictos footer Métiers incorrects ;
- teaser contrats trop discret ;
- vérifier que les corrections déjà acceptées restent intactes.

## Méthode obligatoire

Pour chaque REQ :
- BEFORE avec capture/URL ;
- correction minimale ;
- AFTER ;
- test ciblé ;
- test de non-régression ;
- SHA exact ;
- rollback ;
- statut READY_FOR_CONTROL.

Claude ne marque jamais CLOSED.

## Interdiction

Pas de nouveau design global, pas de nouveau composant, pas de nouvelle logique métier, pas de nettoyage opportuniste dans les mêmes commits.

## Sortie attendue

ACK_FREEZE
CURRENT_OPEN_REQS
LAST_STABLE_SHA_PER_AREA
NEXT_REQ_ONLY
NO_PROD_MUTATION_PROOF

Puis STOP et attendre contrôle ChatGPT avant la prochaine modification.