# REQ-20260926-017 — relance prioritaire : supprimer l'effet double page Contrats

date: 2026-09-29
priority: P0
status: TO_EXECUTE
source: retour visuel Florian 2026-09-29

## Constat Florian

Les captures de la preview montrent encore exactement le probleme refuse :
1. sur chauffagiste-saint-omer.html#entretien, un grand teaser "Contrats d'entretien" avec CTA "Decouvrir nos contrats d'entretien" ;
2. ce CTA ouvre une deuxieme page /contrats-entretien qui contient le vrai comparatif et les boutons Souscrire.

Florian dit explicitement : "j'ai toujours cette double page qui me derange".

Ce point est donc NON RESOLU. REQ-017 devient la priorite visuelle suivante des qu'un lot actif en cours n'entre pas en conflit.

## Direction obligatoire

La cible reste celle deja decidee :
- la page Chauffage doit contenir le module complet des contrats ;
- ne plus imposer au visiteur une navigation vers une deuxieme page pour comprendre/comparer/souscrire ;
- le module doit inclure au minimum Gaz / Fioul / Adoucisseur et le chauffe-eau ECS avec la bonne semantique annuelle ;
- conserver les prix canoniques existants, aucune invention ;
- utiliser la source canonique de donnees quand elle existe ;
- ne pas creer une troisieme copie de l'offre.

## UX attendue sur Chauffage

Remplacer le teaser actuel par le module complet :
- introduction courte ;
- onglets Gaz / Fioul / Adoucisseur ;
- cartes BASIC / CONFORT / SECURITE pour Gaz et Fioul ;
- offre adoucisseur ;
- entretien chauffe-eau 220 EUR TTC/an, clairement distingue des mensualites ;
- CTA de souscription directement depuis la page Chauffage ;
- action secondaire "entretien ponctuel" si elle reste utile ;
- rendu premium clair, coherent avec la page, sans grand bloc sombre publicitaire.

## Important : montrer avant suppression

Ne pas supprimer /contrats-entretien.html et ne poser aucune 301 dans ce lot.

Procedure :
1. construire le prototype uniquement sur une branche isolee ;
2. fournir preview 1440 + 390 ;
3. prouver que le module complet est utilisable sans passer par /contrats-entretien ;
4. lister tous les liens internes qui pointent encore vers /contrats-entretien ;
5. proposer ensuite seulement le plan de migration SEO/liens ;
6. attendre validation Florian avant suppression, redirection ou merge vers recette/main.

## Critere de succes

Le visiteur arrive sur Chauffage et peut :
- comprendre les formules ;
- comparer ;
- choisir ;
- souscrire ;
sans changer de page.

Il ne doit plus y avoir un "teaser Chauffage -> deuxieme page Contrats" comme experience principale.

## Preuves obligatoires

- URL preview exacte ;
- captures 1440 et 390 ;
- diff limite au lot ;
- source des prix ;
- tests ;
- SHA ;
- rollback ;
- aucun merge main ;
- aucune prod.

STOP apres la preview pour validation Florian.
