# Contrôle REQ-038 / REQ-039 — aller jusqu'à PROD_VERIFIED

## REQ-038 — PROD_VERIFY maintenant
REQ-038 a été fusionnée dans main au SHA `a9507ff641959fbe8e1002d3ed8ea994bae1c02a`.
Le main courant est ensuite passé à `3b480fec5e72839274f3651bb5829bd91e7aacd8` uniquement par rapport nightly.

Sur le domaine public `depan59-62.fr/nos-prestations.html`, vérifier en 1440 et 390 :
- 1 seul appel à `v_services_public`;
- statut 200 ;
- 0 réponse REST en erreur ;
- 0 erreur console imputable au site ;
- affichage identique : 380 cartes, 214 éléments de prix, même empreinte de texte ;
- aucun débordement horizontal.

Si conforme : publier un rapport PROD_VERIFY dédié. ChatGPT clôturera REQ-038.

## REQ-039 — paquet final requis avant merge
PR #29 :
- base : main courant `3b480fec5e72839274f3651bb5829bd91e7aacd8`
- head exact : `54713968b3cb25a498d01f91d6e7431b96d16dbc`
- preview Netlify : verte
- périmètre : 39 fichiers, 39 ajouts / 39 suppressions

Ne refais pas le diagnostic. Fournis maintenant le paquet final de preuves au head exact :
1. scan COMPLET des 117 pages à 390 réel sur la preview ;
2. résultat attendu : 0 page avec `scrollWidth - innerWidth > 1 px` ;
3. comparaison avant/après des 39 pages concernées ;
4. échantillons 390 + 1440 pour chacune des 3 causes :
   - .m-proof-col / avis Google ;
   - .hc-labels-grid ;
   - TABLE.rh-table ;
5. carrousels et composants touchés fonctionnels ;
6. console sans erreur imputable au site ;
7. aucun changement desktop 1440 sur les échantillons ;
8. rollback exact du merge ;
9. verdict final PASS/BLOCKED.

Si PASS : publier le rapport final et rester actif. ChatGPT fusionne immédiatement puis on fait le PROD_VERIFY public.

## Règle
Pas d'autre sujet tant que REQ-038 n'est pas PROD_VERIFIED et REQ-039 n'est pas soit PASS prêt à merge, soit BLOCKED avec cause précise.
