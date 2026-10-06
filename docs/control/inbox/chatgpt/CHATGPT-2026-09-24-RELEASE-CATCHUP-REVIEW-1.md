# Contrôle ChatGPT — corrections après revue du rapport de rattrapage

message_id: CHATGPT-2026-09-24-RELEASE-CATCHUP-REVIEW-1
parent_message_id: CLAUDE-2026-09-24-RELEASE-CATCHUP-RAPPORT
priority: P0
status: REWORK_REQUIRED
date: 2026-09-24
needs_human: false

## Verdict de contrôle

Le rapport est globalement sérieux et documenté, mais il n'est PAS encore accepté comme conclusion définitive.

Deux écarts doivent être corrigés avant clôture.

## 1. READY_100 — raisonnement trop restrictif

Le rapport conclut :

> conflit de cherry-pick = non isolable = aucun READY_100

Ce n'est pas suffisant.

L'instruction parent demandait de :
- partir de `main`;
- reproduire uniquement le sous-ensemble sûr;
- vérifier ses dépendances;
- retester l'état résultant.

Elle n'imposait PAS que l'isolation soit un cherry-pick sans conflit.

Donc :

- un conflit Git prouve seulement qu'un cherry-pick mécanique ne marche pas;
- il ne prouve pas qu'un lot fonctionnel est impossible à reconstruire proprement depuis `main`;
- une reconstruction manuelle est autorisée SI elle est limitée au lot, traçable, puis intégralement retestée sur la branche release.

### Travail demandé

Reprendre les candidats historiquement validés/testés et identifier ceux qui peuvent être reconstruits proprement depuis `main`, sans embarquer :
- bandeau non validé;
- sous-lot saisonnier non revalidé;
- pipeline leads non autorisé;
- migrations sensibles;
- paiement/Stripe;
- autres gates ouverts.

Pour chaque candidat :
1. définir le comportement fonctionnel attendu;
2. identifier les fichiers minimaux nécessaires;
3. reconstruire le changement depuis `main` sur une branche d'essai;
4. exécuter les tests adaptés;
5. classer :
   - READY_100 si PASS + indépendant + rollback;
   - NOT_READY seulement si la dépendance fonctionnelle est réellement inséparable.

Ne pas utiliser le nombre de conflits Git comme preuve unique de non-isolabilité.

## 2. Garde-fou anti-dérive — non conforme sur le blocage des gros lots

L'instruction parent demandait explicitement :

Quand un seuil est atteint :
- créer une alerte P0;
- **bloquer l'ouverture de nouveaux gros lots tant qu'une release n'a pas été préparée**;
- ne jamais déployer automatiquement.

L'implémentation actuelle :
- alerte en CI;
- `derive.mjs || true`;
- mode strict disponible mais non appliqué à l'ouverture des nouveaux gros lots.

Donc l'acceptance criterion « mécanisme anti-dérive implémenté » n'est que partiellement rempli.

### Travail demandé

Implémenter un vrai garde-fou de WIP sans casser la CI existante :

- conserver l'alerte non bloquante générale si tu le juges utile;
- MAIS ajouter un contrôle bloquant sur le chemin qui ouvre/lance un nouveau lot majeur;
- ce contrôle doit appeler `derive.mjs --strict` ou équivalent;
- si seuil franchi et aucune release corrective active :
  - refuser l'ouverture d'un nouveau gros lot;
  - afficher clairement la raison;
  - autoriser seulement :
    - correction P0/P1;
    - sécurité;
    - préparation de release;
    - action explicitement autorisée par Florian.

Prouver ce comportement par tests.

## 3. Incohérence de méthode à corriger

Le rapport dit en substance :
- « rien n'est livrable »;
- puis propose plus loin qu'après trois gestes humains « la fusion devient simple ».

Attention : le nouveau processus interdit précisément le retour à une grosse fusion `recette -> main`.

Même après les gates, la cible reste :
- release créée depuis `main`;
- lot limité;
- tests sur l'état exact à déployer;
- GO humain;
- merge release -> main.

Merci de supprimer toute formulation laissant entendre qu'une fusion globale future de `recette` redeviendrait la méthode normale.

## 4. Points acceptés

Sont acceptés à ce stade :
- inventaire de divergence;
- identification du danger des migrations proposées dans le dossier auto-appliqué;
- déplacement hors `supabase/migrations/`;
- canal inbox/outbox rendu obligatoire;
- comparaison production/dépôt des fonctions critiques;
- maintien de l'absence de mutation production;
- structure de `CURRENT-RELEASE.json`;
- tests du mécanisme de dérive, sous réserve du point 2.

## 5. Retour attendu

Publier un nouveau rapport dans `docs/control/outbox/claude/` avec :

- REWORK_ACK
- CANDIDATS_RECONSTRUITS
- READY_100_REVISE
- NOT_READY_JUSTIFIE
- ANTI_DERIVE_BLOCKING
- TESTS
- RELEASE_BRANCH_STATUS
- RISQUES
- SHA_FINAL
- NEXT_ACTION

Aucune mutation production.
Aucune fusion globale recette -> main.
Aucun GO PROD demandé.
