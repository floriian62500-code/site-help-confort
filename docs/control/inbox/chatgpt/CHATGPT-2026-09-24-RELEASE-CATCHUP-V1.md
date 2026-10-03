# Instruction ChatGPT — rattrapage PROD + nouveau flux de livraison

message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-V1
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: true

## Contexte

Constat validé avec Florian :
- il existe désormais un écart anormalement important entre la production `main` et le site de déploiement/recette ;
- `recette` est devenue une branche longue durée qui mélange :
  - éléments réellement validés,
  - éléments testés mais non validés métier,
  - expérimentations,
  - décisions encore ouvertes,
  - travaux techniques et documentation ;
- ce fonctionnement rend une fusion globale `recette -> main` dangereuse ;
- Florian demande explicitement de pousser rapidement en production tout ce qui est réellement validé à 100 %, tout en corrigeant le processus pour que cet écart ne puisse plus se reproduire.

Une branche propre a été créée depuis `main` :
`release/rattrapage-2026-09-24`

IMPORTANT :
- ne PAS merger `recette` en bloc ;
- ne PAS déployer en production sans gate humain ;
- ne PAS inclure une fonctionnalité si une décision Florian reste ouverte ;
- ne PAS inclure Stripe LIVE, mutation RLS/Supabase prod, DNS, secrets ou opération destructive sans GO explicite spécifique.

## Mission 1 — construire le rattrapage de production

À partir de `main`, `recette`, des preuves de tests et des documents de contrôle :

1. établir l'inventaire précis des changements depuis le dernier état réellement en production ;
2. classer chaque changement dans UNE catégorie :
   - READY_100 : totalement testé, preuve disponible, rollback connu, aucune décision métier ouverte ;
   - NEEDS_FLORIAN : validation visuelle/commerciale/métier requise ;
   - NEEDS_SECURITY_GO : auth/RLS/Supabase/Stripe/sensible ;
   - NOT_READY : test incomplet, dépendance manquante ou doute ;
   - OBSOLETE : changement dépassé/remplacé ;
3. pour chaque élément READY_100 :
   - identifier les commits/fichiers nécessaires ;
   - vérifier les dépendances entre commits ;
   - reproduire uniquement le sous-ensemble sûr sur `release/rattrapage-2026-09-24` ;
   - ne pas embarquer par dépendance implicite un changement non validé ;
4. exécuter toute la suite de tests disponible sur cette branche de release ;
5. produire une preuve claire : pages/fonctions concernées, tests, résultats, SHA, rollback ;
6. préparer le déploiement mais s'arrêter AVANT toute mutation de production ;
7. publier le rapport dans `docs/control/outbox/claude/`.

## Critère READY_100 obligatoire

Un changement n'est READY_100 que si les 4 conditions suivantes sont simultanément vraies :

1. TESTÉ : tests automatisés ou contrôle reproductible PASS ;
2. VALIDÉ : aucune validation Florian encore ouverte pour le périmètre visible/métier ;
3. ISOLABLE : le changement peut être livré sans entraîner un élément non validé ;
4. RÉVERSIBLE : rollback identifié et praticable.

En cas de doute : classer NOT_READY, jamais READY_100.

## Mission 2 — corriger définitivement le flux de livraison

Proposer puis implémenter, sur `recette` uniquement, les garde-fous suivants.

### Nouvelle règle de branches

- `main` = vérité exacte de la production.
- `recette` = laboratoire d'intégration, jamais source directe d'un gros merge production.
- chaque livraison prod passe par une branche `release/<date>-<lot>` créée depuis `main`.
- seuls les éléments explicitement READY_100 peuvent entrer dans une branche release.
- une fois la release validée et déployée, `main` est resynchronisée régulièrement vers `recette` pour garder la base proche de la production.

### États obligatoires par fonctionnalité

Chaque fonctionnalité/changement doit avoir exactement un état :
- DEV
- TESTED
- WAITING_FLORIAN
- READY_FOR_RELEASE
- IN_RELEASE
- PROD
- PROD_VERIFIED

Interdiction d'utiliser « terminé » avant PROD_VERIFIED.

### Limite de dérive

Créer un contrôle automatisé qui alerte si l'une de ces conditions est vraie :
- `recette` dépasse 30 commits fonctionnels d'avance sur `main` ;
- ou plus de 7 jours se sont écoulés depuis la dernière release contenant des READY_FOR_RELEASE ;
- ou plus de 10 éléments sont READY_FOR_RELEASE sans branche release active.

Les commits d'audit automatiques [skip ci] doivent être exclus du comptage fonctionnel.

Quand un seuil est atteint :
- créer une alerte P0 de pilotage ;
- bloquer l'ouverture de nouveaux gros lots tant qu'une release n'a pas été préparée ;
- ne jamais déployer automatiquement sans gate humain.

### Release candidate obligatoire

Créer un fichier source de vérité type :
`docs/release/CURRENT-RELEASE.json`

Il doit contenir au minimum :
- release_id
- base_main_sha
- release_branch
- included_items
- excluded_items
- validation_status
- test_status
- rollback
- needs_human
- production_status

Une release ne peut demander le GO PROD que si :
- tous les included_items = READY_FOR_RELEASE ;
- test_status = PASS ;
- excluded_items sont explicitement documentés ;
- rollback existe ;
- diff release -> main est lisible et limité au lot attendu.

### Centre de recette

Le centre `/recette.html` reste l'interface de validation Florian, MAIS :
- toute validation doit être rattachée à un identifiant de fonctionnalité + SHA ;
- toute modification après validation invalide automatiquement l'OK ;
- une fonctionnalité validée doit passer à READY_FOR_RELEASE et ne doit plus rester indéfiniment dans un état ambigu.

### Cadence de livraison

Objectif de fonctionnement :
- petites releases fréquentes ;
- pas de « méga merge » après plusieurs semaines ;
- dès qu'un lot cohérent est READY_FOR_RELEASE, préparer une release ;
- une décision métier non tranchée ne bloque jamais les autres éléments indépendants déjà prêts.

## Mission 3 — livrables attendus

Claude doit publier dans l'outbox :

1. inventaire complet READY_100 / NEEDS_FLORIAN / NEEDS_SECURITY_GO / NOT_READY / OBSOLETE ;
2. contenu exact proposé pour `release/rattrapage-2026-09-24` ;
3. liste des commits/fichiers réellement intégrés ;
4. tests exécutés + résultats ;
5. diff final release -> main ;
6. rollback ;
7. liste très courte des GO humains encore requis ;
8. modifications apportées au control-plane pour empêcher une nouvelle dérive ;
9. SHA final et état du push.

## Interdictions

- aucun merge global `recette -> main`;
- aucun déploiement production sans GO Florian ;
- aucune activation Stripe LIVE ;
- aucune modification sensible Supabase/RLS prod ;
- aucun secret dans Git ;
- aucun force-push/reset destructif ;
- aucune fonctionnalité avec validation métier ouverte dans la release de rattrapage.

## acceptance_criteria

- branche `release/rattrapage-2026-09-24` contient uniquement des changements READY_100 ;
- suite de tests pertinente PASS ;
- aucun élément WAITING_FLORIAN ou NEEDS_SECURITY_GO inclus ;
- release documentée et rollback défini ;
- mécanisme anti-dérive implémenté et testé sur `recette`;
- rapport Claude publié dans l'outbox ;
- aucune mutation production effectuée.

## expected_decision

Après retour Claude, ChatGPT vérifie les preuves et présente à Florian uniquement :
- le contenu exact de la release prête ;
- les risques résiduels ;
- le rollback ;
- le bouton décisionnel final : GO PROD / STOP / CORRIGER.

