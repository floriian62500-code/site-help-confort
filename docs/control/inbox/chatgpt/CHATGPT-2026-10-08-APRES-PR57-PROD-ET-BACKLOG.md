# Apres PR57 — PROD OK et poursuite autonome

Etat :
- PR57 fusionnee en production : a4a9720de982cebfbb54463ddc646e5992b46735.
- PROD_VERIFY : /entretien-chaudiere.html et /entretien-chaudiere redirigent bien vers /chauffagiste-saint-omer.html#entretien.
- L'encart saisonnier ne recouvre plus le teaser contrats sur la preview.
- main = recette.

Le sitemap public reste servi par la fonction edge et annonce encore l'ancienne URL. Ne deploie pas la fonction sans GO. Garde ce point ouvert et passe a la suite.

Traite maintenant, une par une :

1. Finir la page contrats elle-meme : Gaz / Fioul / Adoucisseur, BASIC / CONFORT / SECURITE, chauffe-eau separe.
2. Auditer chaque promesse contractuelle contre une source reelle avant publication : delais, depannages, pieces, exclusions, week-end, engagement, resiliation, age chaudiere, priorite, illimite, sans engagement.
3. Supprimer toute promesse non prouvee ou la reformuler prudemment.
4. Verifier que les prix viennent de la source canonique et que le TTC est principal.
5. Aucun paiement actif.
6. Faire passer la suite contrats au maximum sans masquer les vrais defauts.
7. Verifier 1440 et 390.
8. Rejouer intention-unique, prix-contrats, header, promo, consent, tunnel.
9. Auditer toutes les autres pages chauffage pour anciens prix, HT, ancien nom de formule, anciennes promesses.
10. Auditer FAQ et JSON-LD ensemble, pas seulement le texte visible.
11. Auditer schema.org et metadonnees des pages chauffage.
12. Reprendre Nos metiers depuis le main courant.
13. Revoir cartes prestations : 2 actions max, reserver + devis.
14. Doctrine : Saint-Omer seule agence ; Dunkerque, Calais, Boulogne = zones/poles.
15. Corriger footer, titles, H1, JSON-LD qui parlent encore de plusieurs agences.
16. Auditer la page agence-dunkerque.html : conserver valeur SEO sans la presenter comme agence autonome.
17. Realisations : flux, cartes, fiches, liens, metiers, generateur, idempotence.
18. Routage de toutes les demandes vers saint-omer@helpconfort.com.
19. Decap : domaine, coordonnees, tarifs, metiers, liens publics.
20. Responsive 390 sur tous les gabarits principaux.
21. Crawl liens, 404, assets, ancres et redirects.
22. Sitemap/robots/canonical/JSON-LD : tout corriger cote depot ; pour la fonction edge, rapport uniquement jusqu'au GO.
23. SEO : cannibalisation, pages orphelines, doublons titles/H1.
24. Performance : JS/CSS historiques, duplications, cache-busting, images.
25. Accessibilite : clavier, focus, aria, labels, alt.
26. Fermer/classer les anciennes PR de preview devenues obsoletes.
27. Rejouer toutes les suites et reduire les rouges herites.
28. Relire REQUESTS-TRACKER et continuer toutes les demandes faisables.
29. Offres CDI en HOLD sans confirmation.
30. Runner autonome hors chemin critique si le prerequis humain manque.

Regle : si bloque, rapport court puis tache suivante. Retour uniquement pour PR READY_FOR_CONTROL, blocage humain/sensible, anomalie P0/P1 ou PROD_VERIFY.