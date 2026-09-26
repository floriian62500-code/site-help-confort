# P0 — Mettre en avant les contrats depuis la page Chauffage

message_id: CHATGPT-2026-09-24-P0-CHAUFFAGE-CONTRATS-PROMOTION
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Constat Florian

La page dédiée contrats d'entretien est utile et visuellement correcte, mais elle se perd dans le site si elle n'est pas mise en avant depuis la page Chauffage.

Le besoin est donc NON PAS de recréer les contrats, mais de créer un lien commercial fort entre :
- page Chauffage
- page contrats d'entretien

## Mission

Sur la page Chauffage principale :

1. ajouter/restituer un bloc visible « Contrats d'entretien chauffage » ;
2. présenter clairement les 3 formules existantes :
   - Basic
   - Confort
   - Sécurité
3. afficher un CTA principal type :
   - « Voir les contrats »
   - ou « Découvrir nos contrats d'entretien »
4. ce CTA doit pointer vers la page canonique existante :
   `/contrats-entretien.html`
5. si pertinent, ajouter un CTA secondaire vers l'entretien ponctuel chaudière déjà existant ;
6. ne pas recopier toute la page contrats dans Chauffage : teaser commercial + bénéfices + CTA suffisent.

## Positionnement UX

Le bloc doit être placé à un endroit logique et visible :
- après les prestations / savoir-faire chauffage
- avant les avis / marques / FAQ si possible

Objectif :
un visiteur intéressé par le chauffage doit voir naturellement qu'il existe une offre de contrat annuel.

## Contenu minimum du bloc

- titre clair : « Nos contrats d'entretien chauffage »
- sous-titre court : entretien annuel + tranquillité
- 3 cartes ou 3 niveaux Basic / Confort / Sécurité
- éventuellement tarif « à partir de » uniquement si cohérent avec la source actuelle
- CTA vers `/contrats-entretien.html`

## Sources

Réutiliser les sources existantes :
- `contrats-entretien.html`
- `data/contrats-tarifs.json`

Ne pas créer une nouvelle source de prix.

## Tests

Vérifier :
- bloc visible desktop 1440
- bloc visible mobile 390
- CTA fonctionne
- page contrats accessible
- aucun lien cassé
- aucun prix contradictoire
- aucune duplication incohérente avec la page canonique

## Règle de non-régression

Ajouter un test qui vérifie que la page Chauffage contient un lien explicite vers `/contrats-entretien.html`.

## Retour outbox

Publier :
- PAGE_CHauffage_TARGET
- BLOCK_POSITION
- CONTENT_ADDED
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK

Ne pas toucher à la production.
