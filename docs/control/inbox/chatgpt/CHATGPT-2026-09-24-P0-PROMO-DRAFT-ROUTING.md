# P0 — Bug campagne Entretien / Ramonage : ancien brouillon prend encore le dessus

message_id: CHATGPT-2026-09-24-P0-PROMO-DRAFT-ROUTING
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Preuve utilisateur

Test réel sur la preview : après clic sur la publicité / le bandeau Entretien-Ramonage, le tunnel affiche encore :

- « Reprendre votre demande ? »
- « Vous avez une demande en cours »
- « Devis Plomberie »
- boutons « Nouvelle demande » / « Reprendre »

Donc le clic explicite Entretien/Ramonage n'est toujours pas respecté lorsqu'un ancien brouillon existe sur l'appareil.

Le correctif précédent n'est donc PAS fonctionnel sur ce cas réel.

## Diagnostic fonctionnel attendu

Le problème n'est plus seulement le routage du CTA vers le tunnel.

Le problème est la PRIORITÉ entre :
1. une intention explicite fraîche venant d'un CTA/campagne ;
2. un ancien brouillon mémorisé sur l'appareil.

Aujourd'hui, l'ancien brouillon prend la main avant l'intention entrante.

Ce comportement est faux.

## Règle métier à implémenter

Une intention explicite issue d'un CTA / campagne / lien contextualisé est prioritaire sur un brouillon antérieur NON correspondant.

Exemples :
- clic « Entretien chaudière » + brouillon « Devis Plomberie » => ne jamais proposer seulement de reprendre Plomberie ;
- clic « Ramonage » + brouillon « Devis Plomberie » => ne jamais perdre Ramonage ;
- clic « Poêle ou insert » + ancien devis sans rapport => intention poêle/insert conservée.

### UX autorisée

Deux comportements sont acceptables :

A. démarrer directement la nouvelle demande contextualisée, en conservant éventuellement l'ancien brouillon séparément ;

OU

B. afficher un choix EXPLICITE et contextualisé :
- « Continuer mon ancienne demande : Devis Plomberie »
- « Démarrer Entretien chaudière »
avec la nouvelle intention mise en avant.

Comportement interdit :
- afficher « Nouvelle demande » générique en perdant le contexte Entretien/Ramonage ;
- obliger le client à re-sélectionner ce qu'il vient de cliquer ;
- reprendre silencieusement l'ancien brouillon.

## Cas de test obligatoire à reproduire AVANT correction

1. créer un brouillon « Devis Plomberie » ;
2. quitter le tunnel ;
3. revenir à l'accueil ;
4. cliquer le CTA Entretien chaudière ;
5. constater le comportement actuel KO ;
6. corriger ;
7. rejouer exactement le même parcours.

Faire aussi :
- brouillon Plomberie -> Ramonage ;
- brouillon Plomberie -> Poêle ou insert ;
- sans brouillon -> chacun des 3 CTA ;
- brouillon correspondant -> comportement cohérent ;
- refresh après arrivée par CTA ;
- back navigateur puis retour ;
- mobile 390 ;
- desktop 1440.

## Tests automatisés obligatoires

Ajouter des tests couvrant au minimum :

- explicit_intent_overrides_unrelated_draft
- explicit_intent_survives_resume_gate
- new_request_preserves_campaign_intent
- resume_old_draft_does_not_destroy_new_intent
- refresh_keeps_explicit_intent
- back_forward_keeps_explicit_intent

Le test doit échouer avant correction et passer après.

## Vérification réelle obligatoire

Ne pas se contenter de tests unitaires.

Faire un parcours navigateur réel sur la preview avec un ancien brouillon déjà présent.

Preuves demandées :
- URL / SHA preview ;
- capture avant ;
- capture après ;
- état local/session pertinent sans données personnelles ;
- résultat du clic pour les 3 CTA ;
- suite complète de tests.

## Important

Ne touche pas au paiement.
Ne touche pas à la production.
Ne contourne pas le problème en supprimant toute reprise de brouillon.
Ne remplace pas la reprise utile : corrige seulement la priorité quand une intention explicite fraîche existe.

## Retour obligatoire dans l'outbox

Publier :
- ROOT_CAUSE
- FILES_CHANGED
- TEST_BEFORE_FAIL
- FIX
- TEST_AFTER_PASS
- BROWSER_E2E
- SCREENSHOTS
- SHA
- PREVIEW
- ROLLBACK
- NEXT_ACTION

Ne déclare pas DONE sans preuve du scénario exact « ancien Devis Plomberie -> clic Entretien/Ramonage ».
