# P0 regression — CTA accueil Demander une intervention ne doit plus revenir au resume gate générique

message_id: CHATGPT-2026-09-26-P0-HOME-INTERVENTION-REGRESSION
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Constat Florian

Régression visible sur la preview.

Depuis l'accueil, le CTA principal « Demander une intervention » pointe vers `/catalogue.html#intervention`.
Avec un ancien brouillon Plomberie présent, ce clic affiche de nouveau l'ancien écran générique :
« Reprendre votre demande ? » / « Nouvelle demande » / « Reprendre ».

Florian indique que ce comportement fonctionnait auparavant et refuse toute régression.

## Cause technique observée

Le moteur `assets/hc-demande.js` garde encore un fallback générique quand l'entrée ne porte pas d'intention nommable.
Le CTA accueil utilise `#intervention`, donc il retombe dans ce fallback.

Ce n'est pas acceptable pour un CTA qui exprime explicitement l'action de DEMARRER UNE INTERVENTION.

## Comportement attendu

Accueil -> clic « Demander une intervention » -> démarrer une NOUVELLE demande d'intervention.

Le clic ne doit pas afficher le resume gate générique.

Un ancien brouillon ne doit jamais reprendre silencieusement la main sur ce CTA.

Le brouillon existant doit être préservé tant que possible, mais ne doit pas bloquer le démarrage explicite d'une nouvelle demande.

Si l'architecture de stockage ne permet pas de conserver deux brouillons simultanément, ne pas supprimer silencieusement l'ancien : implémenter une conservation/archivage minimale ou une transition explicite qui ne réintroduit pas l'écran générique.

## Portée

Corriger au minimum les CTA explicites de démarrage :
- hero accueil « Demander une intervention » (`#intervention`)
- carte accueil « Demander une intervention » (`#intervention`)

Auditer les autres CTA génériques `#intervention` pour éviter la même régression.

Ne pas modifier :
- CTA Chaudière -> page Chauffage
- Ramonage / Poêle-insert tant que leur nouvelle règle de routage n'est pas traitée séparément
- paiement
- production

## Tests obligatoires

1. Sans brouillon : clic hero accueil -> nouvelle intervention.
2. Avec brouillon Plomberie : clic hero accueil -> nouvelle intervention, aucun écran « Reprendre votre demande ? ».
3. Avec brouillon Plomberie : clic carte intervention -> même résultat.
4. L'ancien brouillon n'est pas repris silencieusement.
5. Le bouton/lien de reprise reste disponible uniquement dans les parcours où l'utilisateur demande réellement à reprendre.
6. Refresh / back / forward cohérents.
7. Desktop 1440 + mobile 390.
8. Test de régression automatisé qui échoue contre l'ancien comportement.
9. Suite complète verte.

## Anti-régression

Ajouter un test nommé explicitement :
`home_intervention_cta_bypasses_generic_resume_gate`

Ce test doit rester dans la suite permanente.

## Retour attendu

- ROOT_CAUSE
- REGRESSION_INTRODUCED_BY_OR_EXPOSED_BY
- FILES_CHANGED
- BEFORE_FAIL
- AFTER_PASS
- OLD_DRAFT_PRESERVATION
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Aucune mise en production.