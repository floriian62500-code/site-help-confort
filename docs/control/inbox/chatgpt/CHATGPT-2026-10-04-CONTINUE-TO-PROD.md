# Continuer chaque demande jusqu'à production — sans temps mort

## État acté

- REQ-037 : PROD_VERIFIED et clôturée.
- REQ-036 : PR #27 fusionnée dans main.
- Merge SHA REQ-036 : `77620ab7a8cb1d0f3405094331b87f837490cdfb`.
- REQ-038 : à exécuter immédiatement.
- REQ-039 : juste après REQ-038.

## REQ-036 — PROD_VERIFY

Dès que le domaine public sert le nouveau main :
- vérifier `chauffagiste-saint-omer.html` en 390 et 1440 ;
- vérifier `contrats-entretien.html` en 390 et 1440 ;
- `scrollWidth - innerWidth <= 1 px` sur les deux pages en 390 ;
- carrousel d'avis fonctionnel ;
- formules intactes ;
- modale contrats utilisable ;
- console propre.

Si conforme : publier rapport PROD_VERIFY. Ne pas attendre pour préparer/exécuter REQ-038.

## REQ-038 — exécution immédiate

Partir du main courant `77620ab7a8cb1d0f3405094331b87f837490cdfb`.

Correctif déjà diagnostiqué :
- fichier : `nos-prestations.html`;
- retirer le paramètre `&_ts=...` de l'appel REST vers `v_services_public`;
- retirer la variable `cacheBust` devenue inutile ;
- conserver `cache:'no-store'` et les en-têtes no-cache ;
- aucune mutation Supabase.

Preuves obligatoires en 1440 et 390 :
- 1 seul appel à `v_services_public` ;
- statut 200 ;
- 0 réponse REST en erreur ;
- 0 erreur console imputable au site ;
- affichage inchangé : même nombre de cartes/prix et même empreinte mesurée ;
- rollback exact.

Créer branche isolée depuis main, PR, preview, rapport PASS/BLOCKED.

Si PASS : ne reste pas inactif. Prépare REQ-039 pendant l'attente du merge.

## REQ-039 — ensuite

Après REQ-038 fusionnée :
- repartir du nouveau main ;
- scanner les 117 pages publiques à 390 réel ;
- corriger tous les overflows restants correspondant aux motifs déjà prouvés ;
- traiter séparément la cause TABLE.rh-table si nécessaire ;
- objectif global : `scrollWidth - innerWidth <= 1 px` sur toutes les pages publiques ;
- aucune régression desktop 1440 ;
- captures représentatives, console, rollback ;
- PASS/BLOCKED.

## Règle permanente

Pour chaque demande sûre :
1. diagnostiquer ;
2. corriger depuis main courant ;
3. preview ;
4. preuves exactes ;
5. PASS ;
6. merge ChatGPT ;
7. PROD_VERIFY ;
8. clôture ;
9. passer à la suivante sans attendre.

Ne jamais toucher sans GO spécifique : paiement LIVE, Supabase/RLS/auth, DNS, suppression destructive, demandes explicitement à gate Florian.
