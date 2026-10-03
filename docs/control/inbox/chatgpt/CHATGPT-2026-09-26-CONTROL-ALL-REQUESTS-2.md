# Contrôle ChatGPT — suivi consolidé complet + relance REQ-023

message_id: CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-2
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Verdict général

Les derniers retours sont bien meilleurs et plusieurs demandes peuvent maintenant être considérées comme techniquement closes par contrôle.
Mais REQ-023 n'est PAS exécutée sur la preview : Florian a fourni une capture récente où seuls deux blocs sont visibles.

Le suivi ci-dessous devient la référence de contrôle à appliquer dans `REQUESTS-TRACKER.json`.

## Clôtures par contrôle ChatGPT

### REQ-002 — tracker numéroté
Verdict : CLOSED_BY_CONTROL.
Preuve : tracker existant, non-réutilisation des IDs, `prochain_id` géré, règle Claude != CLOSED.

### REQ-007 — suppression module parcours pages métier
Verdict : CLOSED_BY_CONTROL.
Périmètre : pages métier uniquement. `contact.html` est hors périmètre et ne bloque pas.

### REQ-008 — suppression bloc final contrats
Verdict : CLOSED_BY_CONTROL.

### REQ-009 — régression #intervention
Verdict : CLOSED_BY_CONTROL.

### REQ-016 — réconciliation tracker
Verdict : CLOSED_BY_CONTROL.

### REQ-019 — bug `_default`
Verdict : CLOSED_BY_CONTROL.
Preuve acceptée : 7 familles auditées, Plomberie + Serrurerie corrigées, 0 `_default` / undefined / null / NaN visible, test permanent, SHA `15c46539`.

### REQ-021 — audit fonctionnel complet
Verdict : CLOSED_BY_CONTROL.
L'audit reste la référence fonctionnelle du site.

### REQ-024 — carte grise avant scroll
Verdict : CLOSED_BY_CONTROL.
Preuve acceptée : SHA `65953e28`, Leaflet peint sans scroll en 402 ms, desktop/mobile, lazy-load conservé sur contact.

Pour toutes ces REQ, Claude ne doit pas écrire lui-même CLOSED avant ce verdict. Ce verdict l'autorise maintenant à mettre `status=CLOSED`, `closed_at=2026-09-26`, avec `closure_proof` correspondant.

## Demandes encore ouvertes / suivies

### REQ-001 — sécurité / paiement
Statut : WAITING_FLORIAN_GO / PROD_UNSAFE.
Ne pas clôturer. Aucun déploiement sans GO explicite.

### REQ-003 — grille prestations Chauffage
Statut : WAITING_FLORIAN_VISUAL.

### REQ-004 — pictos footer
Statut : REWORK_REQUIRED.
Le mapping technique ne suffit pas : rendu visuel à reprendre plus tard avec source unique.

### REQ-005 — bloc contrats Chauffage
Statut : SUPERSEDED_BY_REQ017 pour la direction fonctionnelle.
Ne plus investir dans le teaser sombre refusé.

### REQ-006 — bannière flottante
Statut : WAITING_FLORIAN_VISUAL.

### REQ-010
Statut : SUPERSEDED.

### REQ-011 — routage boutons consultation
Statut : TECH_ACCEPTED, mais garder la liste des 16 liens de cartes métier dans le plan global.

### REQ-012 — gel UX
Statut : IN_PROGRESS.
Maintenu jusqu'à validation visuelle/architecture.

### REQ-013 — HOLD sécurité production
Statut : WAITING_FLORIAN.

### REQ-014 — replis cartes autres métiers
Statut : OPEN / gelé.

### REQ-015 — photos chaudière / ramonage / poêle
Statut : WAITING_FLORIAN.

### REQ-017 — contrats sur une seule page
Statut : OPEN / NEXT_DESIGN.
Direction Florian : module complet sur Chauffage préféré, sans suppression ni 301 pour l'instant.
Prochaine action autorisée : prototype isolé sur recette, puis validation.

### REQ-018 — chauffe-eau / ECS
Statut : READY_FOR_DESIGN.
220 € TTC/an, distinct des formules mensuelles.

### REQ-020 — cartes prestations à deux actions
Statut : OPEN / RECETTE_ALLOWED.
Correction minimale autorisée : 1 action commerciale + lien détail, téléphone hors carte.

### REQ-022 — proposition cible
Statut : READY_FOR_FLORIAN_VALIDATION.
Les corrections Dunkerque/SEO sont acceptées.
Aucune implémentation globale sans validation Florian.

## REQ-023 — NON CONFORME / REWORK_REQUIRED

Capture Florian la plus récente : la section `zones-intervention` affiche toujours seulement :
- Saint-Omer & Audomarois ;
- Dunkerque & littoral.

Calais et Boulogne restent de simples pills / mentions dans ces blocs.

Ce n'est PAS la demande.

### Attendu exact
Afficher QUATRE blocs/pôles visuellement distincts :
1. Saint-Omer & Audomarois
2. Dunkerque & Littoral
3. Calais & Calaisis
4. Boulogne-sur-Mer & Boulonnais

### Contraintes
- même niveau de hiérarchie visuelle ;
- Calais et Boulogne ne sont pas des agences physiques ;
- Dunkerque reste `pôle / zone d'intervention` sans preuve d'implantation ;
- chaque bloc a titre, courte description, communes principales, lien ville pertinent ;
- desktop : grille 2x2 propre ou autre composition équivalente ;
- mobile : 1 colonne ;
- ne pas simplement ajouter des pills ;
- aucun changement prod.

### Preuve obligatoire REQ-023
- capture BEFORE (2 blocs) ;
- capture AFTER 1440 montrant les 4 blocs en même temps ;
- capture AFTER 390 montrant les 4 blocs en séquence ;
- DOM : exactement 4 `.zone/pole cards` dans la section ;
- liens Calais et Boulogne vérifiés ;
- SHA isolé ;
- rollback ;
- suite ciblée + non-régression ;
- NO_PROD_MUTATION_PROOF.

REQ-023 reste `REWORK_REQUIRED`, attempt 2 tant que cette preuve n'existe pas.

## Ordre d'exécution maintenant

1. Mettre le tracker à jour avec les clôtures et statuts ci-dessus.
2. REQ-023 uniquement : implémenter réellement les 4 pôles et fournir les preuves.
3. STOP pour contrôle visuel Florian.
4. Ensuite seulement REQ-020.
5. Puis REQ-017 prototype contrats.

Ne traiter aucun autre changement visuel entre-temps.

## Retour attendu

- TRACKER_RECONCILED
- CLOSED_BY_CONTROL_APPLIED
- OPEN_REQUESTS_SUMMARY
- REQ023_REWORK_ACK
- REQ023_SHA
- REQ023_SCREEN_1440
- REQ023_SCREEN_390
- REQ023_DOM_COUNT_4
- NO_PROD_MUTATION_PROOF
- NEXT_ACTION = WAIT_FLORIAN_VISUAL_REQ023