# Apres PR56 — decisions et suite autonome

Etat production :
- PR56 fusionnee.
- PROD_VERIFY public OK sur chauffagiste-saint-omer.html et faq.html.
- main = recette.
- prix-contrats et intention-unique ont fortement progresse.

## Decision sur entretien-chaudiere.html

Ne supprime pas brutalement la page.

Decision : consolider la route vers la page canonique Chauffage.
- ajouter une redirection forcee 301 de /entretien-chaudiere.html vers /chauffagiste-saint-omer.html#entretien ;
- verifier qu'aucun lien interne public ne continue a pointer vers l'ancienne URL ;
- la retirer du sitemap si elle y apparait un jour ;
- adapter intention-unique : le critere utile est que l'ancienne route publique ne serve plus une page autonome, pas que le fichier physique disparaisse absolument ;
- ne pas perdre les signaux SEO par une suppression 404.

Motif : la page autonome actuelle est dupliquee et contient encore des informations anciennes (Dunkerque presente comme agence, granulés, anciens prix et promesses historiques). La 301 consolide vers la page metier canonique sans casser les anciennes URLs.

## Point visuel a corriger

Le controle navigateur de la PR56 a signale que l'encart flottant « Avant l'hiver » peut recouvrir partiellement le teaser contrats. Verifier desktop et 390, puis corriger la coexistence des deux blocs sans rendre l'encart fermable si la decision produit reste qu'il doit rester visible.

## Priorite suivante : page Contrats elle-meme

Poursuis REQ-017 depuis le main courant :
1. page contrats = seule source detaillee de l'offre ;
2. Gaz / Fioul / Adoucisseur ;
3. BASIC / CONFORT / SECURITE ;
4. chauffe-eau clairement separe ;
5. prix lus depuis la source canonique ;
6. TTC en principal pour particuliers ;
7. aucun paiement actif ;
8. mobile 390 + desktop 1440 ;
9. pas de duplication des garanties ou tarifs ailleurs.

Avant de publier les promesses commerciales, audite chaque claim contre la source canonique ou le contrat reel :
- nombre de depannages inclus ;
- delai 24 h / 48 h ;
- pieces incluses / exclusions ;
- week-end ;
- engagement / resiliation ;
- age maximal de chaudiere ;
- priorite d'intervention ;
- « illimite » ;
- « sans engagement » ;
- attestation / certificat.

Si la source ne prouve pas le claim, retire ou reformule sans inventer.

## Suite autonome longue

Apres la page contrats :
1. finir intention-unique ;
2. audit global des claims chauffage ;
3. audit global des prix particuliers ;
4. Nos metiers depuis main courant ;
5. cartes prestations a 2 actions max ;
6. doctrine Saint-Omer seule agence, autres villes = zones/poles ;
7. footer, titles, H1, JSON-LD qui parlent encore de deux agences ;
8. Realisations : flux, cartes, fiches, liens, metiers, generateur, idempotence ;
9. routage demandes vers saint-omer@helpconfort.com ;
10. back-office Decap : domaine, coordonnees, tarifs, metiers, liens ;
11. responsive 390 global ;
12. liens / 404 / assets / ancres / redirects ;
13. sitemap / robots / canonical / JSON-LD ;
14. SEO cannibalisation / pages orphelines ;
15. performance ;
16. accessibilite ;
17. tri des anciennes PR ;
18. tests globaux ;
19. relecture REQUESTS-TRACKER et poursuite de toutes les taches faisables ;
20. offres CDI en HOLD sans confirmation ;
21. runner autonome hors chemin critique si prerequis humain absent.

Regle : une tache bloquee = rapport court puis tache suivante. Retour uniquement pour PR READY_FOR_CONTROL, blocage humain/sensible, anomalie P0/P1 ou PROD_VERIFY.