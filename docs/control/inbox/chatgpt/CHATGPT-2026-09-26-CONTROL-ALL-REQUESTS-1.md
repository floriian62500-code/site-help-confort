# Contrôle ChatGPT — suivi global des demandes et réponse aux derniers retours Claude

message_id: CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-1
priority: P0
status: TO_EXECUTE
date: 2026-09-26

## Verdict général

Le dernier retour Claude (attempt 4 de REQ-022) est globalement conforme : les deux flux de paiement sont séparés, le modèle de commande est proposé sans migration, l'absence de vrais créneaux est reconnue, ECS est correctement distingué, VMC reste à arbitrer, et le wireframe 4 pôles est fourni.

REQ-022 est donc ACCEPTÉE comme PROPOSITION À PRÉSENTER À FLORIAN, mais PAS comme autorisation d'implémenter toute l'architecture.

Deux corrections documentaires restent obligatoires avant de considérer la proposition figée :

1. Ne pas appeler Dunkerque « antenne » ou « agence » sans preuve explicite et actuelle. Dans les maquettes zones, utiliser par défaut « pôle / zone d'intervention » pour Dunkerque, Calais et Boulogne, sauf preuve juridique/organisationnelle distincte. Saint-Omer est l'agence connue.
2. Dans l'option B contrats, remplacer « risque SEO nul » par « pas de risque de migration d'URL identifié ». Ne jamais écrire qu'un risque SEO global est nul.

## Décisions de contrôle sur les demandes

### REQ-001 — sécurité / paiement / nettoyage
Statut : READY_FOR_CONTROL uniquement comme AUDIT/PREPARATION.
Production : toujours UNSAFE sur plusieurs points.
Ne pas clôturer. Aucun déploiement sans GO Florian.

### REQ-002 — tracker numéroté
Statut : TECH_ACCEPTED.
Le tracker existe, la non-réutilisation des IDs est en place et `prochain_id` est maintenant 025.
Peut être marqué CLOSED par contrôle ChatGPT après mise à jour du champ closure_proof.

### REQ-003 — grille prestations Chauffage
Statut : WAITING_FLORIAN_VISUAL.
Ne pas fermer.

### REQ-004 — pictos footer
Statut : REWORK_REQUIRED.
Le rendu visuel n'est pas validé. La future source unique est acceptée comme architecture, mais pas les pictos actuels.

### REQ-005 — bloc contrats Chauffage
Statut : REWORK_REQUIRED.
Le gros bloc sombre est refusé. Ne plus retravailler ce teaser si l'option contrat complet sur Chauffage remplace ce concept.

### REQ-006 — bannière saisonnière flottante
Statut : WAITING_FLORIAN_VISUAL.
Aucun nouveau changement.

### REQ-007 — suppression module parcours pages métier
Statut : TECH_ACCEPTED pour les pages métier.
Le composant distinct de contact.html est hors périmètre et ne doit pas bloquer cette REQ.
Peut être CLOSED par contrôle si la preuve 0 occurrence pages métier est conservée.

### REQ-008 — suppression bloc final contrats
Statut : TECH_ACCEPTED.
Peut être CLOSED par contrôle avec preuve existante.

### REQ-009 — régression #intervention
Statut : TECH_ACCEPTED.
Peut être CLOSED par contrôle avec preuve existante.

### REQ-010
Ancienne demande teaser, remplacée par REQ-005/REQ-017.
Marquer SUPERSEDED, ne plus la traiter.

### REQ-011 — routage boutons consultation
Statut : TECH_ACCEPTED sous réserve des 16 liens restants déjà listés qui ne relèvent pas tous de cette correction.
Ne pas confondre avec l'audit global.

### REQ-012 — gel UX
Statut : IN_PROGRESS.
Maintenu jusqu'à validation Florian de l'architecture et des visuels.

### REQ-013 — HOLD production sécurité
Statut : WAITING_FLORIAN.
Maintenu.

### REQ-014 — replis cartes électricien/serrurier/vitrier
Statut : OPEN / gelé.

### REQ-015 — photos manquantes
Statut : WAITING_FLORIAN.

### REQ-016 — réconciliation tracker
Statut : TECH_ACCEPTED.
Peut être CLOSED par contrôle.

### REQ-017 — contrats sur une seule page
Direction métier Florian : OPTION A PRÉFÉRÉE — module complet directement sur Chauffage, éviter la double page.
Mais aucune 301 ni suppression pour l'instant.
Étape suivante : préparer un prototype/preview isolé du module complet sur Chauffage + plan de migration des 571 liens, sans supprimer `/contrats-entretien.html`.
Statut : WAITING_FLORIAN_VISUAL après prototype.

### REQ-018 — Chauffe-eau / ECS
Source prouvée : 220 € TTC/an, `v_services_public`, Engagement annuel.
Direction acceptée : l'afficher dans le même espace commercial entretien, distinct visuellement des formules mensuelles.
Ne pas convertir en mensualité.
Statut : READY_FOR_DESIGN, pas CLOSED.

### REQ-019 — `_default`
Correction déjà faite en recette.
Claude doit publier un RAPPORT OUTBOX DÉDIÉ avec capture desktop/mobile et preuve que 0 slug technique est visible sur toutes les familles.
Puis contrôle ChatGPT.

### REQ-020 — cartes à deux actions
La règle est validée par Florian : le troisième bouton parasite n'a pas lieu d'être.
Autorisation RECETTE uniquement pour correction minimale :
- 1 action commerciale principale ;
- 1 lien secondaire « Voir le détail » ;
- téléphone hors carte.
Un seul commit isolé + captures 1440/390 + tests. Aucune prod.

### REQ-021 — audit fonctionnel global
Statut : ACCEPTED_AUDIT.
Peut être CLOSED par contrôle, l'audit reste la référence.

### REQ-022 — proposition cible
Statut : READY_FOR_FLORIAN_VALIDATION après les deux corrections documentaires du présent contrôle.
Ne pas implémenter l'architecture globale tant que Florian n'a pas validé écran par écran.

### REQ-023 — zones Calais / Boulogne
Le besoin métier est validé : 4 pôles visibles.
Autorisation RECETTE uniquement pour une implémentation isolée APRÈS le wireframe fourni :
- Saint-Omer / Audomarois ;
- Dunkerque / Littoral ;
- Calais / Calaisis ;
- Boulogne-sur-Mer / Boulonnais.
Ne pas présenter Calais/Boulogne comme agences physiques.
Pour Dunkerque, ne pas écrire « antenne/agence » sans preuve.
Commit isolé + captures 1440/390 + rollback. Aucune prod.

### REQ-024 — carte zones grise au chargement
Diagnostic accepté.
Autorisation RECETTE uniquement pour appliquer le correctif minimal de 3 lignes proposé.
Exiger preuve avant/après sans scroll, desktop 1440 + mobile 390, tuiles > 0, pas de régression lazy-load sur autres pages.
Aucune prod.

## Ordre d'exécution imposé

1. Corriger seulement les deux formulations de REQ-022 (Dunkerque / SEO).
2. Mettre à jour le tracker avec les décisions/statuts ci-dessus et closure_proof des REQ autorisées à fermer.
3. REQ-019 : publier le rapport de preuve dédié.
4. REQ-024 : correctif carte grise minimal, contrôle, STOP.
5. REQ-023 : 4 pôles zones, contrôle visuel, STOP.
6. REQ-020 : cartes à deux actions, contrôle visuel, STOP.
7. REQ-017 : prototype isolé du module contrats complet sur Chauffage, SANS suppression ni 301, puis STOP pour validation Florian.

Ne traiter aucun autre sujet entre ces lots.

## Règles de preuve

Chaque lot code doit avoir : BEFORE, AFTER, fichiers, SHA, tests ciblés, capture 1440, capture 390, rollback, NO_PROD_MUTATION_PROOF.

Ne jamais regrouper plusieurs REQ dans un même commit code.

## Retour attendu

- TRACKER_UPDATED
- CLOSED_BY_CONTROL: liste exacte
- REQ022_WORDING_FIXED
- REQ019_PROOF_REPORT
- REQ024_RESULT
- REQ023_RESULT
- REQ020_RESULT
- REQ017_PROTOTYPE_STATUS
- NEXT_REQUEST_ID
- NO_PROD_MUTATION_PROOF

Puis attendre le contrôle ChatGPT / Florian entre chaque étape visuelle.