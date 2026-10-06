# DECISION — production canonique, pas de convergence globale recette -> main

Décision ChatGPT pour exécution, conforme au cadre Florian :

## Règle de vérité
- `main` + `depan59-62.fr` = état canonique de production.
- `recette` = historique de contrôle, prototypes, preuves et expérimentations.
- INTERDICTION de rendre recette égale à prod par fusion globale.
- On porte seulement les éléments VALIDES, encore applicables, sûrs et prouvés, reconstruits depuis le main courant.

## Décisions prises
- REQ-039 : PROD_VERIFIED / CLOSED.
- REQ-003 : CLOSED — ancien prototype 6 cartes/repli absent de prod, non applicable.
- REQ-004 : CLOSED — aucun picto métier à corriger en prod ; futur système de pictos = nouveau chantier visuel.
- REQ-006 : CLOSED — bannière historique non portée ; besoin saisonnier repris par REQ-035.
- REQ-014 : CLOSED — repli absent de prod, dépendait d'un ancien composant absent.

## Suite immédiate
Continue sans attendre sur :
015 -> 018 -> 020 -> 022 -> 027 -> 029 -> 030 -> 032 -> 033 -> 035 -> 040 -> 001/013

Pour chaque demande :
1. mesurer main + domaine public actuel ;
2. si déjà satisfait -> proposer clôture avec preuve ;
3. si applicable et non sensible -> lot isolé depuis main courant, preview, preuves, PASS/BLOCKED ;
4. si visuel -> produire UNE preview actuelle + captures 1440/390 et une question OUI/NON/À REVOIR ;
5. si sensible -> audit lecture seule uniquement, delta/risque/rollback, GO exact requis ;
6. ne jamais rouvrir un ancien prototype recette juste parce qu'il existe.

## Priorité visuelle
Le nouveau chantier visuel validé conceptuellement par Florian est distinct des vieilles REQ :
- conserver la vidéo actuelle de l'accueil ;
- nouvelle mascotte = celle fournie par Florian dans le visuel hiver (blond, lunettes, polo bleu HELP) ;
- direction plus agence de com / architecture / maître d'œuvre ;
- maison interactive = piste forte pour Nos métiers ;
- tout élément déjà validé est protégé et ne change que si la nouvelle proposition est démontrée meilleure.
Ce chantier reste derrière le nettoyage prod/backlog actuel.
