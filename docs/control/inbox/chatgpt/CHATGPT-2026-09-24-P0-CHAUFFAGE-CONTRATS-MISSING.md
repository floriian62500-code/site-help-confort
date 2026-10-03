# P0 — Régression page Chauffage : contrats d'entretien disparus

message_id: CHATGPT-2026-09-24-P0-CHAUFFAGE-CONTRATS-MISSING
priority: P0
status: TO_EXECUTE
date: 2026-09-24
needs_human: false

## Preuve utilisateur

Sur la preview actuelle, dans la page / espace Chauffage, la section « Nos contrats chauffage » est vide.
La capture utilisateur montre le titre/zone de section, mais plus les offres de contrats.

C'est une régression visible d'un contenu commercial déjà existant.

## Constat dépôt

Les contrats existent toujours dans le projet :
- page canonique : `contrats-entretien.html`
- référentiel tarifaire : `data/contrats-tarifs.json`
- contrats gaz : Basic / Confort / Sécurité
- contrats fioul : Basic / Confort / Sécurité
- les tarifs de référence sont présents dans `data/contrats-tarifs.json`

Donc :
**ne recrée pas les contrats, ne réinvente pas leurs offres, restaure leur affichage dans l'espace Chauffage.**

## Mission

1. Identifier la page exacte affichée dans la preview utilisateur.
2. Identifier le commit / changement qui a supprimé ou cassé l'affichage des contrats.
3. Comparer avec la dernière version où les cartes étaient visibles.
4. Restaurer la section contrats dans la page Chauffage en réutilisant la source canonique existante.
5. Ne pas dupliquer les tarifs dans plusieurs nouvelles sources.
6. Si la section dépend d'un JS ou d'un fetch :
   - identifier précisément pourquoi elle rend vide ;
   - prévoir un fallback sûr afin qu'une panne de source ne laisse jamais un grand bloc vide.
7. Conserver le design actuel de la page sauf ce qui est strictement nécessaire à la restauration.

## Résultat attendu

Dans « Nos contrats chauffage », afficher de nouveau les offres attendues avec au minimum :
- Basic
- Confort
- Sécurité

et permettre d'aller vers le détail / la souscription existante.

Si gaz/fioul est présenté séparément dans la version canonique, conserver cette distinction.

## Interdictions

- ne pas créer de nouveaux contrats;
- ne pas inventer de nouveaux tarifs;
- ne pas modifier les tarifs existants;
- ne pas refaire toute la page Chauffage;
- ne pas toucher à Stripe;
- ne pas toucher à la production;
- ne pas supprimer la source canonique `contrats-entretien.html`.

## Tests obligatoires

Reproduire d'abord le KO sur la preview actuelle.

Puis vérifier après correction :
- section contrats non vide en desktop 1440;
- section contrats non vide en mobile 390;
- Basic / Confort / Sécurité visibles;
- liens / CTA fonctionnels;
- aucun prix inventé;
- cohérence avec `data/contrats-tarifs.json`;
- page `contrats-entretien.html` toujours fonctionnelle;
- aucune erreur console liée au rendu des contrats;
- suite de tests existante sur les contrats PASS.

## Régression à prévenir

Ajouter un test qui échoue si la page Chauffage contient le conteneur « Nos contrats chauffage » mais aucune offre visible / aucun CTA de contrat.

## Retour outbox obligatoire

Publier :
- ROOT_CAUSE
- LAST_KNOWN_GOOD
- FILES_CHANGED
- RESTORED_CONTRACTS
- PRICE_SOURCE
- TEST_BEFORE_FAIL
- TEST_AFTER_PASS
- BROWSER_E2E
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK

Ne pas déclarer DONE tant que la section n'est pas visuellement restaurée sur la preview.
