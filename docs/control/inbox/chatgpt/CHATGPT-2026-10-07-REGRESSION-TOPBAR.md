# Régression topbar legacy — correction prod faite, nettoyage permanent à intégrer au backlog

La barre orange legacy `.hc-topbar` est réapparue après la PR #43 alors qu'elle avait déjà été retirée visuellement auparavant.

Hotfix production fusionné via PR #45, commit `093f06057ad26ddb636bac6d0a67390c842e5cdf`.
Le garde-fou actuel dans `assets/hc-header.css` masque `.hc-topbar` partout.
Preview #45 vérifiée dans un navigateur réel : PASS.
Production `https://depan59-62.fr` vérifiée dans un navigateur réel : PASS.
La barre orange n'est plus visible, aucune mention Dunkerque / Dépan'DK n'apparaît dans la zone supérieure, header et téléphone OK.

À faire dans le backlog autonome :
1. Identifier toutes les sources qui génèrent ou conservent le HTML `.hc-topbar`.
2. Nettoyer le HTML/générateurs pour éviter de conserver du markup legacy inutile.
3. Ajouter une garde de non-régression : aucune topbar legacy visible et aucune formulation locale présentant Dunkerque comme deuxième agence.
4. Ne jamais réintroduire cette topbar lors des synchronisations/générations futures.
5. Maintenir la doctrine : une agence Saint-Omer, autres villes = pôles/zones d'intervention.

Ce nettoyage doit être un lot séparé depuis le main courant. Ne bloque pas les autres tâches si un point nécessite arbitrage.