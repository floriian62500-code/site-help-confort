# P0 — Supprimer la landing autonome entretien-chaudiere et rétablir l'architecture canonique

message_id: CHATGPT-2026-09-24-P0-REMOVE-ENTRETIEN-LANDING
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Décision Florian

La page autonome `/entretien-chaudiere` n'a pas lieu d'exister.

Elle crée un doublon inutile entre :
- la page Chauffage ;
- la page contrats d'entretien ;
- le tunnel / catalogue qui possède déjà l'entretien chaudière.

## Architecture attendue

Conserver une structure simple et canonique :

1. Page Chauffage
   - présente l'entretien chaudière comme prestation
   - présente les contrats d'entretien
   - CTA entretien ponctuel -> ouvre le tunnel existant sur « Entretien chaudière »
   - CTA contrats -> `/contrats-entretien.html`

2. `/contrats-entretien.html`
   - page dédiée aux formules Basic / Confort / Sécurité

3. Tunnel / catalogue
   - source fonctionnelle pour demander l'entretien chaudière ponctuel

La landing autonome `entretien-chaudiere.html` doit disparaître du parcours public.

## Mission

1. supprimer `entretien-chaudiere.html` de la recette ;
2. rechercher TOUS les liens internes qui pointent vers cette URL ;
3. remplacer chaque lien selon son intention :
   - demande d'entretien -> tunnel existant précontextualisé « Entretien chaudière »
   - découverte métier -> page Chauffage
   - offre annuelle / contrat -> `/contrats-entretien.html`
4. supprimer l'URL des sources SEO / sitemap / pages canoniques si elle y est déclarée ;
5. vérifier qu'aucun CTA de la bannière saisonnière ne pointe encore vers cette page ;
6. si l'URL a déjà été publiée/indexée, préparer une redirection 301 appropriée vers la destination canonique la plus logique, sans la déployer en production sans gate ;
7. ne pas toucher à `guide-entretien-chaudiere.html` ou au blog sans raison prouvée : ils peuvent avoir une intention éditoriale distincte.

## Tests obligatoires

- recherche globale : 0 lien public non justifié vers `/entretien-chaudiere`
- CTA bannière « Entretien chaudière » -> tunnel existant
- page Chauffage -> entretien ponctuel fonctionnel
- page Chauffage -> contrats fonctionnel
- `/contrats-entretien.html` intacte
- pas de duplication SEO créée
- suite de tests verte

## Retour outbox

Publier :
- ROOT_CAUSE_DUPLICATION
- LINKS_FOUND
- LINKS_REWIRED
- FILE_REMOVED
- SEO_CLEANUP
- REDIRECT_PLAN
- TESTS
- SHA
- PREVIEW
- ROLLBACK

Aucune mutation production.
