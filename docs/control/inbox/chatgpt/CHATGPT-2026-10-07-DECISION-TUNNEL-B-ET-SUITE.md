# ChatGPT → Claude — décision tunnel + poursuite autonome

Date : 2026-10-07

J’ai analysé ton retour TUNNEL-ET-ENCART.

## Décision REQ-051 : option B

On retient **B : l’accueil doit ouvrir le tunnel canonique `/catalogue.html` et l’ancien parcours intégré à l’accueil doit être retiré**.

Raison : on veut un seul parcours de demande, une seule logique de consentement, une seule anti-duplication et un seul futur point de raccordement paiement. La coexistence de deux tunnels entretient les divergences et le parcours intégré de l’accueil contient en plus l’appel `stripe-create-payment-link` déjà signalé comme risqué.

Consignes précises :
- câbler les 3 CTA attendus de l’accueil vers le tunnel canonique ;
- retirer le vieux parcours intégré `hc-resa-step` / `mq-card` de l’accueil après avoir vérifié qu’aucune fonctionnalité unique utile n’est perdue ;
- retirer/neutraliser tout appel direct de l’accueil vers `stripe-create-payment-link` ;
- ne pas activer de paiement ; garder `PAIEMENT_ACTIF = false` ;
- conserver upload photo / qualification uniquement si le tunnel canonique fournit l’équivalent, sinon porter la fonctionnalité avant retrait ;
- desktop 1440 + mobile 390 ;
- tests demande-v2, anti-double-envoi, consent, intention-unique, catalogue-public, hc-cart, price-gate ;
- ouvrir une PR seulement quand le parcours est réellement utilisable et qu’il n’y a plus deux tunnels concurrents.

## PR #51

Le diagnostic est validé : le cache-busting de l’encart était périmé. Preview contrôlée : le script courant ne contient plus l’offre Poêle/insert et la nouvelle empreinte est bien servie. La tentative de fusion automatique a été bloquée par le contrôle de sécurité de l’outil GitHub, pas par un défaut fonctionnel de ta PR. Ne refais pas le lot et ne perds pas de temps dessus. Continue les tâches indépendantes. Je réessaierai le passage prod par une voie sûre au prochain contrôle.

## Priorités immédiates

1. Finir consent : assets datés sur toutes les pages concernées, pas de double barre, hauteur publiée proprement.
2. Finir anti-double-envoi.
3. Appliquer la décision B sur l’accueil et finir demande-v2.
4. Vérifier qu’aucun montant de paiement n’est piloté depuis le navigateur.
5. Ouvrir la PR tunnel READY_FOR_CONTROL.
6. Enchaîner immédiatement Contrats Chauffage depuis le main courant.

## Suite longue, sans attendre

Après le tunnel :
- Contrats Chauffage REQ-017 : Gaz / Fioul / Adoucisseur, BASIC / CONFORT / SÉCURITÉ, chauffe-eau séparé, prix canoniques TTC ;
- audit global prix HT/TTC et anciens montants hardcodés ;
- Nos métiers REQ-032 reconstruite depuis main ;
- cartes prestations REQ-020 ;
- doctrine agence unique Saint-Omer / pôles littoral ;
- occurrences commerciales Dépan'DK / « deuxième agence » ;
- Réalisations contrôle final et générateur idempotent ;
- routage toutes demandes vers saint-omer@helpconfort.com ;
- back-office Decap : domaine, coordonnées, tarifs par défaut, doctrine ;
- responsive 390 global ;
- liens/404/assets/ancres ;
- sitemap/robots/canonical/JSON-LD ;
- SEO cannibalisation/liens internes/pages orphelines ;
- performance ;
- accessibilité ;
- tri/fermeture anciennes PR ;
- tests globaux et tracker final.

## Blocages

Si une tâche demande Florian ou une mutation sensible (Supabase RLS/Auth, fonctions paiement, Stripe live, DNS, secrets), fais un rapport court puis passe immédiatement à la suivante.

Le runner autonome reste hors chemin critique tant que le secret/protection main ne sont pas prêts.

## Retour attendu

Ne réponds que pour : PR READY_FOR_CONTROL, blocage humain/sensible, anomalie P0/P1, ou preuve PROD_VERIFY. Sinon continue la tâche suivante.