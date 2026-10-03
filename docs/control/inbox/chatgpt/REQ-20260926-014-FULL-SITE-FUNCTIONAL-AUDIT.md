# REQ-20260926-014 — Audit fonctionnel complet et simplification de l'architecture du site

request_id: REQ-20260926-014
priority: P0
status: OPEN
date: 2026-09-26

## Décision Florian

Le fonctionnement global du site est devenu trop complexe et incohérent. Florian soupçonne des doublons fonctionnels et demande un audit complet avant toute nouvelle évolution.

Objectif métier très simple :
1. expliquer clairement tous les métiers proposés ;
2. permettre de découvrir les prestations de chaque métier ;
3. pour une prestation à prix ferme : pouvoir voir le prix puis acheter/réserver en ligne ;
4. pour une prestation non chiffrable : pouvoir demander un devis ;
5. éviter les doubles pages, doubles tunnels et CTA contradictoires.

## Constat déjà vérifié par ChatGPT

### A. Deux concepts appelés catalogue
`nos-prestations.html` est le vrai catalogue public : familles, filtres, cartes, prix/devis.
`catalogue.html` est en réalité le tunnel transactionnel / wizard de demande.
Le nom et les liens créent une ambiguïté structurelle.

### B. Les pages métier routent de façon incohérente
Exemples vérifiés :
- Chauffage contient des liens vers `nos-prestations` ET vers `catalogue.html` ;
- Électricité / Serrurerie / Volets ont encore des liens directs vers `/catalogue#cat=...` ;
- Plomberie / Vitrerie / Menuiserie / Travaux / PMR routent davantage vers `nos-prestations`.

Donc un même type de CTA produit des parcours différents selon le métier.

### C. Contrats en doublon
La page Chauffage, la page `/contrats-entretien.html`, le catalogue prestations et certaines cartes d'entretien se recouvrent.
REQ-20260926-010 impose une cible : module contrats complet sur la page Chauffage et audit SEO avant retrait/301 de la page contrats.

### D. Prestations individuelles
Il existe de nombreuses pages `/prestations/*.html` en plus de `nos-prestations.html`.
Ces pages peuvent être utiles SEO/contenu, mais leur rôle doit être défini : page détail d'une prestation, jamais second catalogue ni second tunnel.

### E. Paiement en ligne : deux systèmes
`create-payment-session` = tunnel client, Stripe TEST uniquement, montant recalculé serveur, pay_token, idempotence, URL retour contrôlée.
`stripe-create-payment-link` = back-office, version production actuelle vulnérable : appelant non authentifié, montant fourni par requête, clé LIVE en base.
Ces deux flux doivent être clairement séparés et le flux LIVE ne doit pas rester ambigu.

### F. Cartes catalogue trop complexes
`nos-prestations.html` gère : prix, devis, reserve, bouton devis ghost, bouton téléphone, verrouillage tarif, sous-filtres, fallback `_default`.
On a déjà observé : slug `_default` exposé et 3 boutons sur une carte.

## Architecture cible obligatoire

Le site doit tendre vers seulement 5 rôles fonctionnels :

### 1. Accueil
Rôle : présenter l'entreprise, les métiers, les urgences, les grandes offres et envoyer vers le bon métier.
Pas de tunnel complexe embarqué.

### 2. Pages métier
Rôle : expliquer le métier, montrer les prestations, photos, preuves, FAQ, zones, contrats éventuels.
CTA prestation -> catalogue public filtré OU page détail prestation.
CTA devis explicite -> tunnel demande/devis.
CTA achat/réservation explicite -> parcours transactionnel d'une prestation tarifée.

### 3. `nos-prestations.html` = catalogue public unique
Rôle : source UX unique de consultation des prestations.
Une prestation a UN mode commercial principal :
- `PRICE_FIXED` -> prix visible + CTA Acheter/Réserver ;
- `QUOTE_ONLY` -> CTA Demander un devis ;
- éventuellement `PRICE_CONFIRM` -> prix indicatif/non payable + CTA Demander confirmation/devis.

Ne pas afficher trois actions concurrentes.
Ne jamais exposer un slug technique.

### 4. Pages `/prestations/*.html` = fiches détail SEO
Rôle : expliquer une prestation précise.
Elles doivent réutiliser la même source de données et conduire vers l'action commerciale correspondant au mode de la prestation.
Elles ne doivent pas recréer un catalogue parallèle.

### 5. Tunnel transactionnel
`catalogue.html` doit être considéré comme le tunnel/wizard, pas comme un catalogue.
À terme, prévoir un nom fonctionnel plus clair ou au minimum cesser de l'utiliser comme destination d'un CTA 'voir les prestations'.

Le tunnel ne s'ouvre que si l'utilisateur choisit explicitement :
- demander un devis ;
- demander une intervention ;
- acheter/réserver une prestation.

## Paiement cible

Le principe commercial cible :
- prestation prix ferme -> paiement/réservation en ligne possible ;
- prestation sur devis -> aucun paiement avant devis/validation ;
- panier mixte -> devis global, aucun encaissement partiel.

Le navigateur n'est jamais source du montant.
Le serveur relit le catalogue et recalcule le total.

Avant tout LIVE :
- webhook signé ;
- clé LIVE uniquement en secret environnement ;
- auth appelant ;
- montant serveur ;
- idempotence ;
- retour URL whitelist ;
- statut de paiement fiable ;
- rollback.

## Audit complet demandé

Claude doit produire un inventaire exhaustif, sans corriger pendant l'audit :

1. Toutes les pages publiques et leur rôle.
2. Toutes les pages métier et tous leurs CTA.
3. Toutes les pages prestation détail.
4. Toutes les destinations CTA : métier / catalogue public / tunnel / contact / contrats / paiement.
5. Tous les doublons de contenu ou de fonction.
6. Tous les flux devis.
7. Tous les flux achat/réservation/paiement.
8. Tous les endpoints Supabase utilisés par ces flux.
9. Toutes les sources de vérité : services, v_services_public, contracts, v_contract_offers, data JSON éventuels.
10. Tous les mécanismes de panier / brouillon / reprise.
11. Tous les CTA qui promettent une chose mais ouvrent autre chose.
12. Toutes les URLs dont le nom ne correspond plus à leur fonction.

## Livrable d'audit

Créer `docs/audit/AUDIT-FONCTIONNEL-SITE-2026-09-26.md` avec une table :
- URL / composant
- rôle actuel
- rôle cible
- source de données
- CTA actuel
- destination actuelle
- destination cible
- doublon avec
- risque
- recommandation
- priorité

Puis une seconde table `PARCOURS-CIBLE` :
- Visiteur veut comprendre un métier
- Visiteur veut voir les prestations
- Visiteur veut un devis
- Visiteur veut acheter une prestation tarifée
- Visiteur veut un contrat d'entretien
- Visiteur veut reprendre une demande
- Visiteur veut payer après validation

Pour chaque parcours : 3 à 5 étapes MAXIMUM.

## Règle importante

Pendant REQ-014 : AUCUNE nouvelle refonte, AUCUNE correction UX opportuniste.
Audit d'abord. Plan ensuite. Exécution uniquement après validation ChatGPT + Florian.

## Retour attendu

- REQUEST_ID
- AUDIT_FILE
- PAGES_INVENTORIED
- CTA_INVENTORY
- DUPLICATES_FOUND
- PAYMENT_FLOWS
- DATA_SOURCES
- TARGET_ARCHITECTURE
- MIGRATION_PLAN
- ITEMS_TO_DELETE_OR_REDIRECT
- ITEMS_TO_KEEP
- HUMAN_DECISIONS
- SHA
- NO_PROD_MUTATION_PROOF

Statut attendu : READY_FOR_CONTROL.
Claude ne marque pas CLOSED.
Aucune mise en production.