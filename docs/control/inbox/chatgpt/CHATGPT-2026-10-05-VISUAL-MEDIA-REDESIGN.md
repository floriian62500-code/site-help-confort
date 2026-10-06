# DIRECTION ARTISTIQUE — exploiter enfin les éléments fournis par Florian

Décision Florian : le site actuel n'exploite pas assez les éléments graphiques et visuels qu'il a fournis. Il faut améliorer nettement la beauté, la clarté et la lisibilité du site en construisant une vraie médiathèque et un système visuel cohérent.

## Sources prioritaires fournies par Florian

1. PLAQUETTE COMMERCIALE HELP CONFORT Saint-Omer
2. Visuel / logo HELP SAINT OMER
3. Identité HELP Confort déjà présente dans les documents de l'agence

Ne pas repartir sur un design générique SaaS ou des cartes blanches sans identité.

## ADN visuel à reprendre

La plaquette montre clairement :
- logo HELP Confort très visible ;
- dominante cyan / bleu HELP ;
- orange comme accent d'appel ;
- pictogrammes métiers différenciés par couleurs ;
- segmentation claire des métiers ;
- sections Particuliers / Professionnels ;
- engagements / preuves / avis ;
- territoire et implantation locale ;
- message de marque « Pourquoi faire appel à plusieurs entreprises quand une seule suffit ».

Le site doit reprendre cet ADN avec un rendu web plus premium et contemporain, pas copier la plaquette au pixel.

## Médiathèque à construire

Créer un inventaire média versionné, par exemple :
`docs/design/MEDIA-LIBRARY.md`

Pour chaque média :
- fichier ;
- usage prévu ;
- source ;
- droit/licence ;
- format original ;
- version WebP/AVIF ;
- dimensions ;
- alt text ;
- pages où il est utilisé.

Priorité des sources :
1. vrais médias fournis par Florian / agence ;
2. assets HELP Confort existants et autorisés ;
3. médiathèques externes libres/compatibles usage commercial uniquement pour combler les manques ;
4. jamais de hotlink : importer localement et optimiser.

Ne pas utiliser de photos génériques artificielles si un média réel entreprise existe.

## Nouvelle direction visuelle

### Accueil
Créer une page d'accueil avec :
- HERO visuel fort : vraie photo métier / intervention / technicien, pas fond abstrait générique ;
- logo et promesse immédiate ;
- CTA urgence / demander une intervention / voir nos métiers ;
- bloc « plusieurs métiers, un seul interlocuteur » ;
- grille métiers avec pictos/couleurs issus de l'identité fournie ;
- preuves de confiance : avis, réactivité, zone d'intervention, réseau ;
- section Particuliers / Professionnels visuellement distincte ;
- engagements en pictogrammes ;
- bloc local Saint-Omer / littoral avec carte ou photo territoriale ;
- photos réelles réparties dans la page pour casser les murs de texte.

### Pages métiers
Chaque métier doit avoir :
- un visuel hero métier dédié ;
- la couleur métier cohérente avec l'identité ;
- 3 à 6 prestations principales immédiatement lisibles ;
- vraies photos d'interventions ou photos professionnelles pertinentes ;
- preuve / avis / engagement ;
- CTA clair ;
- moins de blocs texte continus.

### Nos métiers
Transformer la page en vraie vitrine :
- mosaïque/grille visuelle ;
- une image ou illustration/picto forte par métier ;
- couleur métier cohérente ;
- description courte ;
- accès immédiat ;
- éviter les cartes toutes identiques et impersonnelles.

### Chauffage / contrats
NE PAS modifier le module formules déjà validé par Florian.
Améliorer uniquement l'environnement visuel autour : photo chauffage réelle, contexte, réassurance, entretien/dépannage, sans toucher au tunnel validé.

## Clarté UX

Objectif : en 5 secondes, le visiteur doit comprendre :
1. ce que fait HELP Confort ;
2. où l'agence intervient ;
3. quel métier choisir ;
4. comment demander une intervention ;
5. pourquoi faire confiance.

Réduire les textes longs. Utiliser :
- titres courts ;
- sous-titres utiles ;
- icônes ;
- photos ;
- chiffres/preuves ;
- espaces blancs ;
- hiérarchie visuelle nette.

## Contraintes

- mobile 390 prioritaire autant que desktop 1440 ;
- aucune régression SEO ;
- aucune régression performance importante ;
- images optimisées et lazy-load sauf hero ;
- dimensions réservées pour éviter CLS ;
- alt text métier/local pertinent ;
- pas de carrousel décoratif inutile ;
- pas de stock photos incohérentes avec une entreprise française de dépannage bâtiment ;
- ne pas toucher aux éléments déjà validés de conversion sans nécessité.

## Process obligatoire

1. Faire d'abord un audit visuel de la prod actuelle :
   - accueil ;
   - nos-metiers ;
   - chauffage ;
   - plomberie ;
   - électricité ;
   - serrurerie ;
   - vitrerie ;
   - rénovation.
2. Inventorier les médias déjà disponibles dans le repo + les éléments fournis par Florian.
3. Créer MEDIA-LIBRARY.md.
4. Produire une première maquette/preview ACTUELLE depuis le main courant :
   - accueil desktop 1440 ;
   - accueil mobile 390 ;
   - nos-metiers 1440 ;
   - nos-metiers 390.
5. Utiliser réellement les médias, pictos et codes couleur issus des supports fournis.
6. Publier captures + explication avant/après.
7. Ne pas déployer globalement tant que le rendu visuel principal n'est pas validé par Florian.
8. Une fois direction visuelle validée : décliner par lots sûrs sur les autres pages avec contrôle ChatGPT jusqu'à PROD_VERIFY.

## Important

Ce chantier n'annule pas le suivi des bugs/releases déjà ouverts. Il s'ajoute comme chantier visuel structuré.
Ne pas casser REQ-017 / REQ-036 / REQ-037 / REQ-038 et les tunnels déjà validés.

Rapport attendu :
`docs/control/outbox/claude/CLAUDE-2026-10-05-VISUAL-MEDIA-REDESIGN.md`
