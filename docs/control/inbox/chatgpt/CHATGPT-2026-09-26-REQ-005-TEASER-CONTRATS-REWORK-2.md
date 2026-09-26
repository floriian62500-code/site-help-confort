# REQ-20260926-005 — REWORK_REQUIRED — teaser contrats trop massif / hors design

request_id: REQ-20260926-005
attempt: 2
priority: P0
status: REWORK_REQUIRED
date: 2026-09-26
parent: CHATGPT-2026-09-26-CONTROL-NUMBERED-1

## Verdict Florian

Le rendu actuel de la section contrats est refusé visuellement.

Le bloc sombre pleine largeur avec gros prix, panneau interne et deux CTA fait trop « landing / pub » et casse le langage visuel de la page Chauffage.

Il est trop massif, trop sombre et prend trop de place par rapport au reste de la page.

## Direction obligatoire

Revenir à une mise en avant FORTE mais intégrée au design existant de la page.

Ne pas créer un nouveau langage visuel.
Réutiliser les codes déjà présents sur la page Chauffage :
- fond clair / crème ;
- texte bleu nuit ;
- accents orange ;
- carte blanche ou très légèrement teintée ;
- ombre et bordure discrètes ;
- hiérarchie nette sans effet « panneau publicitaire géant ».

## Composition attendue

Une seule section compacte, élégante et premium :
- titre clair « Contrats d'entretien chaudière » ou formulation équivalente ;
- une phrase courte de bénéfice ;
- rappel BASIC / CONFORT / SÉCURITÉ ;
- prix d'appel visible mais non surdimensionné ;
- 2 à 4 bénéfices maximum ;
- CTA principal vers `/contrats-entretien.html` ;
- CTA secondaire « Juste un entretien ponctuel ».

Le CTA principal doit ressortir, mais sans panneau dans le panneau.

## Contraintes visuelles

- pas de fond bleu nuit pleine largeur sur toute la section ;
- pas de gros panneau imbriqué à droite ;
- pas de prix géant dominant toute la composition ;
- pas de hauteur excessive ;
- conserver beaucoup d'air ;
- cohérence stricte avec les autres sections de la page ;
- desktop et mobile propres.

Le bloc doit être nettement plus visible que l'ancien teaser blanc, mais nettement plus léger que la version actuelle.

## Méthode

1. Partir du dernier teaser stable avant la version premium actuelle.
2. Faire une correction minimale de contraste et de hiérarchie.
3. Ne pas toucher aux autres sections.
4. Captures BEFORE / AFTER obligatoires.
5. Ne pas élargir le lot.

## Tests

- CTA principal correct ;
- CTA secondaire correct ;
- aucun doublon des cartes contrats détaillées ;
- aucun débordement 1440 / 390 ;
- prix canonique inchangé ;
- page contrats inchangée ;
- aucune régression des cartes prestations ou du footer.

## Retour attendu

- REQUEST_ID
- BEFORE
- AFTER
- FILES_CHANGED
- TESTS
- SCREENSHOTS_1440_390
- SHA
- PREVIEW
- ROLLBACK
- NO_PROD_MUTATION_PROOF

Ne pas marquer CLOSED. Passer uniquement READY_FOR_CONTROL après preuve.
Ne pas ouvrir un autre sujet avant retour de contrôle.