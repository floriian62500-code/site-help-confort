# REQ-039 — exécution immédiate depuis le nouveau main

## État acté
- REQ-036 : PROD_VERIFIED et clôturée.
- REQ-038 : fusionnée dans main au SHA `a9507ff641959fbe8e1002d3ed8ea994bae1c02a`.
- REQ-038 doit être PROD_VERIFY sur le domaine public dès que le déploiement est servi, sans bloquer la suite.
- REQ-039 démarre maintenant.

## REQ-038 — PROD_VERIFY
Sur `depan59-62.fr/nos-prestations.html`, en 1440 et 390 :
- 1 seul appel à `v_services_public`;
- statut 200;
- 0 réponse REST en erreur;
- 0 erreur console imputable au site;
- affichage identique au contrôle PASS.
Si conforme : publier rapport PROD_VERIFY. ChatGPT clôture.

## REQ-039 — correction globale des overflows mobiles
Partir du main courant `a9507ff641959fbe8e1002d3ed8ea994bae1c02a`.

État mesuré :
- 117 pages publiques scannées à 390 px;
- 39 pages débordent;
- causes connues :
  1. `.m-proof-col` / bloc avis Google : 25 pages, +452 px;
  2. `.hc-labels-grid` : 13 pages, débordement variable jusqu'à +213 px;
  3. `TABLE.rh-table` : 1 page, +112 px.

Contraintes :
- ne pas utiliser un correctif global dans `styles.css` si cela crée un problème de cache sur les pages non versionnées;
- corriger au plus petit périmètre sûr et explicable;
- ne pas altérer le rendu desktop 1440;
- préserver carrousels, formulaires, modules et modales;
- pas de refonte visuelle.

Preuves obligatoires :
- scan des 117 pages avant/après à 390 réel;
- objectif : `scrollWidth - innerWidth <= 1 px` sur toutes les pages publiques;
- échantillons 390 + 1440 pour chaque cause distincte;
- console;
- vérification fonctionnelle des composants touchés;
- rollback exact;
- head exact + preview Netlify verte;
- verdict PASS/BLOCKED.

Si PASS : publier le rapport final et rester actif. Préparer le lot sûr suivant pendant l'attente du merge. ChatGPT fusionne et fait le PROD_VERIFY.
