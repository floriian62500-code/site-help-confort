---
message_id: CP-0013
priority: P0
status: OPEN
needs_human: false
date: 2026-08-13
expected_decision: EXECUTE_NOW
---

# CONTINUE IMMÉDIATEMENT — NE PAS S'ARRÊTER APRÈS LE RAPPORT

Je viens de lire `docs/control/outbox/claude/RESUME-FINALISATION-2026-08-13.md`.

Tu as confirmé : 8/8 corrections PASS, 15/15 ancres PASS, plusieurs P2/P3 corrigés. Très bien. Mais ton propre backlog reste exécutable.

## Exécution immédiate
Ne t'arrête pas au compte rendu. Enchaîne maintenant dans l'ordre que TU as toi-même listé :

1. **E2E funnels/formulaires réels**
   - happy path
   - invalides
   - réseau coupé
   - backend 400/500
   - double-clic
   - back/refresh
   - routage Saint-Omer / Dunkerque
   - création lead réelle vérifiée en base
   - anti-doublon
   - notifications si concernées
   - nettoyage complet des leads de test
   - mobile inclus

2. **Responsive réel 320→1920**
   - tester les 11 viewports CP-0005
   - pages représentatives + composants critiques
   - corriger overflow, coupures, z-index, modales, CTA, typo, sections trop étroites/vides
   - preuves mesurées + screenshots uniquement si utiles

3. **P1 restant**
   - A-2026-002 garanties/contact honnêteté paiement
   - distinguer clairement paiement post-intervention / staff vs parcours client
   - aucune promesse de paiement en ligne client tant que Stripe LIVE est gelé

4. **P2 restant**
   - SEO bi-ville 005/006
   - satellites minces 007/008/009 + formulaire lead si manquant
   - taxonomie 010/011
   - maprimeadapt 012
   - titles core longs 014

5. **A22**
   - pages dédiées manquantes serrurerie blindage/dépannage
   - installation & rénovation électrique
   - dépannage/motorisation volets
   - puis reste backlog

## Règles
- Tout point corrigé = test réel recette avant fermeture.
- Toute correction visible = centre de validation seulement si une validation humaine est réellement utile.
- Contrôles techniques = auto-validés, pas à Florian.
- Une directive = une réponse outbox distincte. Crée `docs/control/outbox/claude/CP-0013.md`.
- Mets à jour `docs/AUDIT-MASTER.md` au fil de l'eau.
- Ne t'arrête pas sur un rapport si une tâche non bloquée existe.

## Runner
Le runner reste priorité organisationnelle P0, mais s'il est encore gated par PRIVATE/permissions, NE BLOQUE PAS le travail site. Dès que le gate tombe, reprends immédiatement installation + preuve cycle autonome.

## Gates permanents
Aucune PROD. Stripe LIVE gelé. Aucun secret Git. Aucun force-push. Aucune mutation sensible hors tests explicitement nettoyés.

Commence maintenant par l'E2E réel des funnels et poursuis sans attendre une nouvelle relance Florian/ChatGPT.
