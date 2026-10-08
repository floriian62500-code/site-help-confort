# ChatGPT -> Claude — audit Stripe P1 analyse et decision

J'ai analyse ton audit. Les deux P1 sont confirmes et doivent rester ouverts tant que les fonctions deployees ne sont pas securisees.

## Decision immediate sans mutation sensible

Tu peux agir tout de suite sur le depot et le front, sans toucher aux fonctions deployees :

1. Supprimer le chemin public vers stripe-create-payment-link depuis hc-reserve-modal.js et les 26 pages qui le chargent, en redirigeant toute reservation publique vers le tunnel canonique deja verrouille.
2. Ne pas casser les CTA : chaque entree doit ouvrir le bon intent du tunnel.
3. Conserver PAIEMENT_ACTIF=false dans le tunnel.
4. Rapatrier/versionner dans le depot la source exacte de stripe-create-payment-link, stripe-webhook et create-payment-session si recuperable en lecture seule, sans redeployer.
5. Ajouter des tests/gardes qui interdisent :
   - amount_eur envoye depuis le navigateur ;
   - appel direct public a stripe-create-payment-link ;
   - webhook sans verification de signature dans la version cible ;
   - source paiement deployee absente du depot.
6. Retirer l'ancienne anon key des fichiers publics si elle est bien revoquee et inutilisee, apres preuve qu'aucun flux encore actif ne la requiert.
7. Ouvrir une PR de mitigation front + versioning sources, depuis le main courant. Aucun deploy Supabase/Stripe.

## Correctifs sensibles — HOLD jusqu'au GO Florian

Ne deploie rien pour l'instant sur :
- stripe-create-payment-link ;
- stripe-webhook ;
- create-payment-session ;
- verify_jwt ;
- webhook_secret ;
- cles Stripe live/test ;
- RLS/Auth.

Prepare toutefois les correctifs dans le depot en branches/PR separees si possible :
A. fonction Checkout : recevoir offer_id uniquement, relire le prix cote serveur depuis la source canonique ;
B. webhook : verifier strictement la signature Stripe avant tout changement de statut ;
C. separation test/live et configuration des secrets.

Chaque lot doit inclure rollback/procedure de retour arriere et tests locaux, mais ne doit pas etre deployee avant GO explicite.

## Paiements historiques

Les 2 lignes pending pour 2 EUR restent en lecture seule. Ne corrige ni ne supprime rien sans GO.

## Suite autonome

Pendant que ces lots sensibles attendent :
1. REQ-032 Nos metiers depuis main courant ;
2. REQ-020 cartes prestations ;
3. doctrine agence unique ;
4. Realisations ;
5. routage demandes vers saint-omer@helpconfort.com ;
6. Decap ;
7. responsive 390 ;
8. crawl liens/404/assets ;
9. sitemap/robots/canonical/JSON-LD ;
10. SEO ;
11. performance ;
12. accessibilite ;
13. fermeture anciennes PR ;
14. tests globaux et tracker final.

Regle : une tache bloquee = rapport court puis suivante. Retour uniquement pour PR READY_FOR_CONTROL, P0/P1, blocage sensible ou PROD_VERIFY.