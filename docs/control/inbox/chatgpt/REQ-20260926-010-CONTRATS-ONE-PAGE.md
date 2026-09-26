# REQ-20260926-010 — Simplifier les contrats : une seule vraie page, pas de doublon

request_id: REQ-20260926-010
priority: P0
status: OPEN
date: 2026-09-26

## Décision Florian

Le fonctionnement actuel fait doublon entre la page Chauffage et `/contrats-entretien.html`.
Florian préfère une architecture simple : afficher directement le vrai module de formules (Gaz / Fioul / Adoucisseur + BASIC / CONFORT / SÉCURITÉ + prix + souscription) sur la page Chauffage, plutôt qu'un teaser qui renvoie vers une seconde page presque identique.

## Architecture cible

Page Chauffage = page métier principale ET point d'entrée contrats.

Sur `/chauffagiste-saint-omer.html`, afficher directement le module complet des contrats, avec :
- onglets Gaz / Fioul / Adoucisseur ;
- cartes BASIC / CONFORT / SÉCURITÉ ;
- prix ;
- garanties principales ;
- boutons Souscrire ;
- comportement de souscription existant ;
- données provenant de la même source canonique existante.

## Conséquence

La page `/contrats-entretien.html` devient redondante.

Ne pas supprimer brutalement la page tant que son usage SEO / liens / indexation n'est pas audité.
Faire d'abord l'inventaire :
- liens internes vers `/contrats-entretien.html` ;
- sitemap ;
- canonical ;
- éventuelles campagnes/CTA ;
- trafic/SEO disponible dans le dépôt si présent.

Puis proposer l'une des deux issues :
A. supprimer la page et mettre une 301 vers `/chauffagiste-saint-omer.html#contrats` ;
B. conserver temporairement la page comme alias SEO minimal, sans dupliquer le module complet, jusqu'à migration contrôlée.

Préférence Florian : A si aucune contrainte SEO réelle ne l'empêche.

## À supprimer de la page Chauffage

Le teaser intermédiaire actuel doit disparaître. Il ne faut pas teaser vers une autre page si le module complet est déjà sur Chauffage.

## Position

Le module contrats complet doit être placé haut dans la page Chauffage, après le hero / réassurance immédiate, avant les longs blocs éditoriaux.

## Important

- ne pas recréer une troisième version du module ;
- réutiliser le module existant de `/contrats-entretien.html` ;
- une seule source de données et une seule logique de souscription ;
- éviter toute duplication de prix codés en dur ;
- ne pas casser les onglets Gaz / Fioul / Adoucisseur ;
- ne pas modifier Stripe/paiement dans ce lot ;
- aucune mise en production.

## Tests obligatoires

1. Module contrats complet visible sur Chauffage.
2. Les 3 onglets fonctionnent.
3. Les formules et prix viennent de la source canonique existante.
4. Les boutons Souscrire fonctionnent comme avant en recette.
5. 0 teaser redondant restant sur Chauffage.
6. Inventaire complet des liens vers `/contrats-entretien.html`.
7. Plan 301 documenté avant suppression éventuelle.
8. Desktop 1440 et mobile 390.
9. Aucun impact sur entretien ponctuel, ramonage, poêle/insert, paiement.

## Retour attendu

- ROOT_CAUSE_DUPLICATION
- SOURCE_MODULE
- SOURCE_DATA
- CHAUFFAGE_INTEGRATION
- LINKS_TO_CONTRACTS_PAGE
- SEO_IMPACT
- REDIRECT_RECOMMENDATION
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Statut attendu après correction : READY_FOR_CONTROL.
Claude ne marque pas CLOSED.
Aucune mise en production.