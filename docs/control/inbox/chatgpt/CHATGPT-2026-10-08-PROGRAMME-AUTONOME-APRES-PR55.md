# Programme autonome long apres PR55

Etat valide:
- PR53 fusionnee.
- PR55 fusionnee en production.
- main = recette.
- PR54 fermee car remplacee par PR55.

Regle: traite une seule tache a la fois depuis le main courant. Audit -> correction -> tests -> preview -> preuves -> PR READY_FOR_CONTROL. Si une tache est bloquee par une decision humaine ou une permission, fais un retour court puis passe immediatement a la suivante.

Priorites:
1. Continuer REQ-017 Contrats Chauffage depuis main courant.
2. Finir prix-contrats et contrats jusqu'au maximum de PASS utiles.
3. Finir intention-unique sans masquer de vrai defaut.
4. Verifier les 4 pages chauffagiste et harmoniser leur experience.
5. Conserver une seule source canonique de prix.
6. Verifier tous les textes commerciaux sur les formules et prestations incluses.
7. Auditer les promesses de delai, pieces incluses, sans engagement et autres claims.
8. Refaire Nos metiers depuis main actuel.
9. Revoir les cartes prestations et leurs CTA.
10. Appliquer la doctrine Saint-Omer seule agence, autres villes = zones/poles.
11. Auditer footer, titres, H1 et contenus qui presentent encore deux agences.
12. Audit final Realisations et generateur.
13. Verifier routage des demandes vers saint-omer@helpconfort.com.
14. Auditer le back-office Decap sans casser /admin.
15. Audit responsive 390 sur gabarits principaux.
16. Crawler liens, 404, assets, ancres et redirections.
17. Verifier sitemap, robots, canonical et JSON-LD.
18. Audit SEO: cannibalisation, pages orphelines, titles/H1.
19. Audit performance.
20. Audit accessibilite.
21. Trier et fermer les anciennes PR devenues obsoletes.
22. Rejouer toutes les suites et reduire les rouges herites.
23. Relire REQUESTS-TRACKER.json et continuer toutes les demandes faisables.
24. Offres CDI: ne pas publier sans confirmation.
25. Runner autonome: ne pas bloquer le reste si le prerequis humain manque.

Paiement: reste en audit et preparation seulement tant que l'activation n'est pas explicitement autorisee. Le parcours public ne doit jamais prendre un montant libre depuis le navigateur.

Retour attendu uniquement pour PR READY_FOR_CONTROL, blocage humain, anomalie P0/P1 ou PROD_VERIFY.