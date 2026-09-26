# Proposition — le site cible, montré avant d'être codé

REQ-20260926-022 · attempt 4 · 2026-09-26 · **aucune page publique modifiée par ce document**

Version corrigée après les contrôles `CHATGPT-2026-09-26-CONTROL-PROPOSAL-1` puis `-2`. Les affirmations SEO
que je ne pouvais pas prouver ont été retirées, l'achat en ligne direct est rétabli comme cible, et
le mode commercial est désormais **mesuré** sur les 34 prestations actives au lieu d'être supposé.

---

## 1. Arborescence cible

Neuf types de page, **un seul rôle chacun**.

| # | page | rôle unique | CTA principal | CTA secondaire |
|---|---|---|---|---|
| 1 | **Accueil** | orienter | les 3 intentions | « Demander une intervention » · téléphone |
| 2 | **Métier** (×44) | expliquer un métier | « Voir les prestations <métier> » → catalogue filtré | « Demander un devis » · téléphone |
| 3 | **Nos prestations** | **catalogue public unique** | **une action commerciale par carte** (§5) | « Voir le détail » → fiche |
| 4 | **Fiche prestation** (×35) | détailler (SEO) | action du mode de la prestation | prestations voisines |
| 5 | **Réalisations** | prouver | « Voir le métier » | « Demander un devis » |
| 6 | **Contrats** | vendre l'entretien récurrent | « Souscrire » | « Juste un entretien ponctuel » |
| 7 | **Demande / intervention / devis** *(aujourd'hui `catalogue.html`)* | **tunnel** | « Continuer » | « Reprendre ma demande » |
| 8 | **Achat / réservation** | transaction d'une prestation à prix ferme | « Réserver et payer » | « Demander un devis à la place » |
| 9 | **Contact** | joindre l'agence | « Envoyer » | téléphone |

Dans tout ce document, le tunnel est nommé par sa fonction — **Demande / intervention / devis**.
Son URL reste `catalogue.html` : **aucun renommage, aucune 301** n'est proposé ici (plan de
migration d'URL au §9, séparé, et non validé).

---

## 2. Parcours utilisateur

```
A. Devis (QUOTE_ONLY)
   Accueil ─▶ Métier ─▶ Prestation ─▶ « Demander un devis » ─▶ Tunnel · devis ─▶ Envoi

B. Achat direct (PRICE_FIXED) — cible
   Accueil ─▶ Métier ─▶ Prestation à prix ferme ─▶ « Réserver »
          ─▶ Zone + créneau + coordonnées ─▶ Récapitulatif ─▶ PAIEMENT EN LIGNE
   (aucune validation manuelle de l'agence n'est exigée si aucune règle métier ne l'impose)

C. Prix à confirmer (PRICE_CONFIRM)
   Prestation ─▶ « Demander confirmation » ─▶ Tunnel · devis (prix affiché comme indicatif)
          ─▶ l'agence confirme ─▶ lien de paiement envoyé au client

D. Panier mixte (au moins une ligne QUOTE_ONLY ou PRICE_CONFIRM)
   Panier ─▶ « Demander un devis global » ─▶ Tunnel · devis
   ⚠ aucun encaissement partiel : le panier mixte ne paie jamais une partie des lignes

E. Recherche directe
   Accueil ─▶ Nos prestations ─▶ Filtre métier ─▶ Prestation ─▶ action unique du mode

F. Contrat d'entretien
   Métier Chauffage ─▶ Contrats ─▶ Comparatif ─▶ Souscrire ─▶ Rappel agence

G. Réalisation
   Réalisations ─▶ Chantier ─▶ Métier ou prestation liée ─▶ action

H. Reprise
   N'importe quelle page ─▶ Tunnel ─▶ « Demande mise de côté · Reprendre » ─▶ étape d'avant
```

Aucun parcours ne dépasse cinq étapes utiles. Aucun ne commence par le tunnel.

---

## 3. Décision proposée pour chaque doublon — rien n'est appliqué

| doublon | proposition | fait mesuré |
|---|---|---|
| `contrats-entretien.html` vs module Chauffage | **voir §8** : A et B présentées à égalité, décision Florian | 571 liens internes pointent vers la page contrats |
| `nos-prestations.html` vs `/prestations/*.html` | **garder les deux** | les 35 fiches n'ont ni panier ni lien tunnel (mesuré) |
| `catalogue.html` vs catalogue public | **plan de migration séparé (§9)**, rien maintenant | 33 liens vers le tunnel, dont 24 sur des pages métier |
| 16 CTA de cartes métier → tunnel | **à recâbler** vers fiche ou catalogue filtré | liste exhaustive au §7 |
| footer en 5 versions | **source unique à préparer**, non implémentée | 9 entrées sur 79 pages, 6 sur 14, 8 sur 6, 4 sur 12, 0 sur 37 |
| prix des contrats en dur sur 4 pages | **lire `v_contract_offers`** | 4 recopies du prix d'appel |
| `create-payment-session` appelée mais absente | **supprimer l'appel ou déployer** | 0 fonction de ce nom dans le projet |

---

## 4. Maquettes

### 4.1 Accueil
```
┌──────────────────────────────────────────────────────────┐
│ en-tête · logo · métiers ▾ · zones · prestations · 03 66 │
├──────────────────────────────────────────────────────────┤
│  HERO   Un dépannage. Une rénovation.                    │
│         [ Demander une intervention ] [ Voir prestations ]│
├──────────────────────────────────────────────────────────┤
│  QUE SOUHAITEZ-VOUS FAIRE ?  [dépanné] [projet] [entretien]│
├──────────────────────────────────────────────────────────┤
│  NOS MÉTIERS · PREUVES · RÉALISATIONS                    │
└──────────────────────────────────────────────────────────┘
        ┌───────────────────────┐  ← encart promo saisonnier
        │ AVANT L'HIVER         │     (flottant, fermable)
        │ [ Entretien chaudière ]│
        │ [Poêle] [Ramonage]    │
        └───────────────────────┘
```

### 4.2 Page métier
```
┌──────────────────────────────────────────────────────────┐
│ HERO métier : promesse + 2 actions + réassurance         │
├──────────────────────────────────────────────────────────┤
│ [CHAUFFAGE] Module contrats : Gaz · Fioul · Adoucisseur  │
│             · Chauffe-eau/ECS (§8)                       │
├──────────────────────────────────────────────────────────┤
│ NOS PRESTATIONS — 6 cartes homogènes, photo ou médaillon │
│   chaque carte → FICHE prestation (jamais le tunnel)     │
│        [ Voir les prestations <métier> avec prix ]       │
│                 → catalogue public filtré                │
├──────────────────────────────────────────────────────────┤
│ PREUVES · ZONES · FAQ                                    │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Nos prestations — une action commerciale, un lien détail
```
┌──────────────────────────────────────────────────────────┐
│ [Toutes 34] [Plomberie 15] [Chauffage 6] [Électricité 2] │
│ sous-filtres : [Tous] [Chauffe-eau] [Sanitaire] …        │
│   ⚠ jamais de slug technique — « Autres prestations »     │
├──────────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│ │    photo      │ │    photo      │ │    photo      │    │
│ │ Titre         │ │ Titre         │ │ Titre         │    │
│ │ 2 lignes      │ │ 2 lignes      │ │ 2 lignes      │    │
│ │ ── inclus ─── │ │ ── inclus ─── │ │ ── inclus ─── │    │
│ │ 149 € TTC     │ │ Sur devis     │ │ 350 € indicatif│   │
│ │ [ Réserver ]  │ │ [ Devis ]     │ │ [ Confirmer ] │ ← 1 action
│ │  Voir le détail│ │ Voir le détail│ │ Voir le détail│ ← lien, pas bouton
│ └───────────────┘ └───────────────┘ └───────────────┘    │
└──────────────────────────────────────────────────────────┘
Le téléphone reste dans l'en-tête et la barre mobile : jamais une action de carte.
```

### 4.4 Fiche prestation
```
┌──────────────────────────────────────────────────────────┐
│ Fil d'ariane · Métier › Prestation                       │
│ H1 · photo · ce qui est inclus · durée · garantie        │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 149 € TTC — prix ferme             [ Réserver ]      │ │
│ │  ou Sur devis                      [ Demander devis ]│ │
│ │  ou 350 € indicatif                [ Faire confirmer]│ │
│ └──────────────────────────────────────────────────────┘ │
│ prestations voisines · FAQ · zones                       │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Tunnel — Demande / intervention / devis
```
1 Lieu → 2 Besoin → 3 Précision → 4 Ma demande → 5 Coordonnées → 6 Prise en charge
┌──────────────────────────────────────────────────────────┐
│ ‹ retour   Étape 1 sur 6 · Lieu                     ✕    │
│ Où devons-nous intervenir ?                              │
│ [adresse] [CP] [ville]      (rappel « demande mise de     │
│                              côté » si applicable)       │
│                                   [ Continuer → ]        │
└──────────────────────────────────────────────────────────┘
```

### 4.6 Achat / réservation (PRICE_FIXED) — écran nouveau
```
┌──────────────────────────────────────────────────────────┐
│ Réserver : Entretien chaudière gaz — 121 € TTC           │
│ 1 Zone desservie ✔  2 Préférence de créneau  3 Coordonnées│
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Récapitulatif                                        │ │
│ │ Entretien chaudière gaz            121,00 € TTC      │ │
│ │ (montant relu par le serveur, jamais par le navigateur)│
│ └──────────────────────────────────────────────────────┘ │
│              [ Payer en ligne · Stripe ]                 │
│  ou          [ Demander un devis à la place ]            │
└──────────────────────────────────────────────────────────┘
```

**Le créneau n'est pas un rendez-vous confirmé, et la maquette ne doit pas le laisser croire.**
Vérifié dans le code : la dernière étape du tunnel s'appelle « Prise en charge » et son texte dit
déjà *« Donnez vos préférences : l'agence fixe ensuite le créneau avec vous »*. Le modèle stocke
`quand` (dès que possible · dans la semaine · à partir d'une date) et `rappel` (au plus tôt ·
matin · après-midi) — **des préférences**. Il n'existe **aucune source de disponibilités
réservables** dans le site. Un vrai créneau garanti est donc un **composant futur**, qui suppose
d'abord une source d'agenda. D'ici là, l'écran d'achat demande une *préférence*, et le message de
confirmation ne promet pas d'heure.

---

## 5. Mode commercial — mesuré, pas supposé

**Question posée par le contrôle** : le mode peut-il être dérivé de façon fiable des champs
existants ? **Réponse : oui, sur 33 des 34 prestations actives.** Matrice complète, lue le
2026-09-26 dans `v_services_public` (lecture seule).

Règle de dérivation testée :

```
requires_quote = true                    → QUOTE_ONLY
requires_quote = false  et  price_ht > 0 → PRICE_FIXED
requires_quote = true   et  price_ht > 0 → PRICE_CONFIRM   ← le seul cas ambigu
```

| mode déduit | nombre | prestations |
|---|---|---|
| **PRICE_FIXED** | **28** | les 6 chauffe-eau, `contrat-entretien-chauffe-eau`, les 3 entretiens chaudière, `desembouage-radiateur`, `detartrage-circuit`, `detartrage-sanitaire`, `desengorgement`, `recherche-fuite-visuelle`, `depannage-recherche-panne-chauffage`, les 3 interventions urgentes, les 4 ouvertures de porte, les 3 mitigeurs, `mecanisme-chasse-eau-standard`, `mise-securite-vitre-m2` |
| **QUOTE_ONLY** | **5** | `devis-enduit`, `devis-isolation`, `devis-peinture`, `devis-revetements-muraux`, `devis-vitre-insert-poele` — tous à `price_ht = 0` |
| **PROPOSED_PRICE_CONFIRM / NEEDS_BUSINESS_DECISION** | **1** | `vmc` — `requires_quote = true` **et** `price_ht = 350` : je ne la classe pas définitivement |
| ambigus non classables | **0** | — |

Deux points à retenir :

1. **Aucune nouvelle colonne n'est nécessaire aujourd'hui.** Deux champs existants suffisent. Je
   propose donc **une fonction de dérivation partagée** (cœur `hc-demande-core.js`, lue par le
   catalogue, les fiches et le tunnel) plutôt qu'une migration. Une colonne ne se justifiera que le
   jour où le métier voudra un mode qui ne se déduit pas — et ce jour-là, la fonction devient la
   valeur par défaut de la colonne.
2. **`vmc` reste une décision métier, pas une déduction.** Une prestation « sur devis » qui porte
   un prix de 350 € HT : soit ce prix est indicatif — et c'est `PRICE_CONFIRM` — soit la donnée est
   à corriger. Statut retenu dans la matrice : **`PROPOSED_PRICE_CONFIRM / NEEDS_BUSINESS_DECISION`**.
   Je ne trancherai pas à la place de Florian.

Les **variantes** ne créent pas d'ambiguïté : `chauffe-eau-100l-eco` et
`mecanisme-chasse-eau-standard` portent une variante qui change le prix (stéatite, Geberit). Une
fois la variante choisie, le prix reste ferme. Elles restent `PRICE_FIXED`.

---

## 6. Paiement — cible, état actuel, étapes transitoires

### Deux architectures distinctes, qui ne doivent pas dépendre l'une de l'autre

| | **Flux A — achat public** | **Flux B — lien de paiement back-office** |
|---|---|---|
| qui déclenche | le client, seul | l'agence, depuis le back-office |
| source du prix | **`v_services_public`** | le dossier / l'intervention validée |
| ce que le navigateur envoie | **des identifiants et des quantités/variantes**, jamais un montant | rien du client |
| calcul | le **serveur** relit le catalogue, recalcule le total et vérifie l'éligibilité de zone | montant du dossier (`interventions.montant_ttc` a du sens **ici**) |
| session Stripe | créée à partir du calcul serveur | créée à partir du montant du dossier |
| authentification | client non authentifié, mais **montant non falsifiable** car serveur | **appelant authentifié + rôle vérifié** |
| idempotence | clé d'idempotence sur la création de session | idem |
| webhook | **signé**, commun aux deux flux | **signé** |

**Correction par rapport à ma version précédente** : j'avais placé la migration
`interventions_montant` comme préalable à l'achat public. C'est faux — cette colonne sert au
**flux B**. Le flux A ne lit que `v_services_public` et n'en dépend pas. Les deux chantiers sont
parallèles, pas séquentiels.

### A. Fonctionnement cible

| mode | le client peut-il payer en ligne ? | chemin |
|---|---|---|
| `PRICE_FIXED` | **oui, sans validation manuelle** si aucune règle métier ne l'exige | zone vérifiée → créneau → coordonnées → récapitulatif → paiement Stripe |
| `QUOTE_ONLY` | non | devis d'abord, aucun paiement |
| `PRICE_CONFIRM` | non directement | confirmation de l'agence, puis lien de paiement |
| panier mixte | **non** | devis global, **aucun encaissement partiel** |

Invariants de la cible : le **navigateur n'est jamais la source du montant** ; le serveur relit le
catalogue et recalcule ; l'éligibilité de zone est vérifiée avant le paiement ; le statut du
paiement est écrit par un webhook **signé**.

### B. État actuel — ce qui est sécurisé, ce qui ne l'est pas

| | état vérifié en production le 2026-09-26 |
|---|---|
| paiement client public | **gelé** depuis le 2026-08-08 (`hc-reserve-modal.js` ne contient aucun `fetch`) |
| `create-payment-session` (tunnel client) | **la fonction n'existe pas** dans le projet : l'appel échoue silencieusement |
| `stripe-create-payment-link` (back-office) | déployée, **publique**, **montant venu du client**, clé Stripe lue **en base** |
| `stripe-webhook` | déployée, **signature non vérifiée** (`// TODO` dans le code servi) |
| mode TEST / LIVE | dépend de la clé stockée dans `app_settings` |

### C. Étapes transitoires, par flux

**Socle commun — à faire d'abord, il sert aux deux :**

1. poser `STRIPE_MODE`, `STRIPE_TEST_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY` en variables
   d'environnement — plus aucune clé Stripe en base ;
2. déployer le **webhook signé** et vérifier un événement de test.

**Flux B — lien de paiement back-office** (le plus proche d'être sûr) :

3. appliquer la migration `interventions_montant` ;
4. déployer le lien de paiement **authentifié, à montant relu en base** ;
5. l'écran Interventions enregistre le montant **avant** d'appeler la fonction.

**Flux A — achat public `PRICE_FIXED`** (indépendant du point 3) :

6. définir le modèle de commande (§6bis) et le valider ;
7. écrire la fonction de création de session : elle reçoit **des identifiants**, relit
   `v_services_public`, vérifie la zone, calcule le total, pose une clé d'idempotence ;
8. brancher l'écran d'achat, **en Stripe TEST** ;
9. recette : faux webhook refusé, rejeu refusé, absence de secret = refus, **montant envoyé par le
   client ignoré**, URL de retour hors liste blanche refusée, panier mixte refusé au paiement ;
10. **seulement ensuite**, bascule LIVE — décision Florian.

Les versions durcies des fonctions existent et passent **64 tests**, elles ne sont **pas
déployées**.

---

## 6bis. Où vit la commande, avant et après Stripe — modèle logique proposé

Rien n'est créé en base. C'est un modèle à valider.

| champ | rôle | où il pourrait vivre aujourd'hui |
|---|---|---|
| `order_id` | identifiant de la commande, unique | **à créer** |
| lignes | `service_id`, variante, quantité | aujourd'hui : le panier vit dans le navigateur (`hc_cart_v1`) |
| `prix_serveur_ttc` | total **recalculé par le serveur**, jamais reçu du client | — |
| coordonnées | nom, téléphone, email | `leads` (déjà écrit par `submit-lead-v6`) |
| zone | commune + éligibilité vérifiée | `leads` |
| **préférence** de créneau | `quand` + `rappel` (§4.6) — pas un rendez-vous | `leads` |
| `status` | `draft` → `pending_payment` → `paid` · `payment_failed` · `cancelled` · `needs_review` | **à créer** |
| Stripe | `checkout_session_id`, `payment_intent_id` | `payments` (existe déjà) |
| `idempotency_key` | empêche la double création de session | **à créer** |
| horodatages | création, paiement, annulation | `payments` en partie |

**Trois options, honnêtement comparées :**

| option | avantage | inconvénient |
|---|---|---|
| **1. Réutiliser `leads` + `payments`** | rien à créer ; les deux tables existent et sont déjà alimentées | `leads` n'a pas de machine à états de commande ; le lien lead ↔ payment n'existe pas formellement ; `payments` est aujourd'hui écrite par une fonction non authentifiée |
| **2. Table `orders` dédiée** (recommandée pour une vraie vente) | états explicites, lignes, idempotence, lien clair vers `payments` | une migration à écrire et valider |
| **3. Hybride** : `leads` reste la demande, `orders` ne sert qu'aux achats `PRICE_FIXED` | ne touche pas au flux devis existant | deux notions à maintenir |

**Ma proposition** : option 3 — le devis continue de vivre dans `leads`, l'achat en ligne obtient
sa table `orders`. **À valider avant toute migration.** Aucune table n'est créée aujourd'hui.

## 7. Les 16 liens de cartes métier encore routés vers le tunnel

À recâbler dans le plan futur, **aucune correction maintenant**.

| pages | carte | destination actuelle | destination proposée |
|---|---|---|---|
| `electricien-{saint-omer, calais, dunkerque, boulogne-sur-mer}` | « Installation & rénovation » | `/catalogue#cat=electricite` | fiche prestation, ou catalogue filtré `#sec-electricite` |
| `serrurier-{saint-omer, calais, dunkerque, boulogne-sur-mer}` | « Serrurerie & blindage » | `/catalogue#cat=serrurerie` | idem `#sec-serrurerie` |
| `serrurier-{saint-omer, calais, dunkerque, boulogne-sur-mer}` | « Dépannage urgence » | `/catalogue#cat=serrurerie` | fiche « ouverture de porte », ou tunnel **si** le libellé devient explicitement « demander une intervention » |
| `volets-{saint-omer, dunkerque}` | « Dépannage urgence » | `/catalogue#cat=renovation` | idem |
| `volets-{saint-omer, dunkerque}` | « Motorisation & modernisation » | `/catalogue#cat=renovation` | fiche `motorisation-volet`, ou catalogue filtré |

Sur les pages chauffagiste, les cartes équivalentes mènent déjà à une fiche : c'est le modèle.

---

## 8. Contrats — A et B, présentées à égalité

La préférence métier exprimée par Florian est **une seule expérience contrats, idéalement sur la
page Chauffage**. Les deux options sont décrites ci-dessous **sans recommandation de ma part**, et
sans aucune estimation de délai ou de position SEO : je n'ai ni Search Console, ni analytics, ni
relevé de positions dans ce dépôt, donc je n'ai rien pour l'affirmer.

### Option A — module complet sur Chauffage, puis redirection de `/contrats-entretien.html`

| critère | fait |
|---|---|
| UX | tout au même endroit, un clic de moins pour souscrire |
| structure | une seule surface à maintenir ; la page Chauffage porte deux intentions (dépannage + contrats) |
| coût de migration | **571 liens internes** pointent vers la page contrats, dont le bloc du pied de page présent sur 208 pages. Ils **peuvent être recâblés** dans un plan de migration : un balayage + une règle de réécriture, puis une 301 de filet |
| risque SEO | théorique : une URL indexée disparaît au profit d'une autre. **Non mesuré ici** — à vérifier dans Search Console avant décision |
| réversible | oui, au prix d'un second cycle de redirection |

### Option B — garder la page contrats, renforcer l'entrée depuis Chauffage

| critère | fait |
|---|---|
| UX | un clic de plus pour souscrire |
| structure | deux surfaces, donc une source de prix commune obligatoire (`v_contract_offers`) |
| coût de migration | nul |
| risque SEO | nul par construction |
| réversible | oui |

### Ce que le module contrats doit montrer, dans les deux options

| offre | source | prix | périodicité |
|---|---|---|---|
| Gaz — BASIC / CONFORT / SÉCURITÉ | `v_contract_offers` | 9,90 / 14,30 / 25,30 € TTC | **par mois** |
| Fioul — BASIC / CONFORT / SÉCURITÉ | `v_contract_offers` | 13,20 / 17,60 / 29,70 € TTC | **par mois** |
| Adoucisseur d'eau | `v_contract_offers` | 8,80 € TTC | **par mois** |
| **Chauffe-eau / ECS** | **`v_services_public`**, slug `contrat-entretien-chauffe-eau` | **220,00 € TTC** (200 € HT) | **par an** — champ `warranty` = « Engagement annuel », `duration_min` = 90 |

**Deux natures commerciales différentes, à ne pas confondre :**

- **Gaz · Fioul · Adoucisseur** = *offres récurrentes*, issues de **`v_contract_offers`**, facturées
  **au mois** ;
- **Chauffe-eau / ECS** = *prestation annuelle tarifée*, issue de **`v_services_public`**, facturée
  **à l'année, en une fois**.

Elle peut — et doit — apparaître dans le même espace commercial « entretien / contrats », parce que
c'est là que le client la cherche. Mais elle **ne doit pas être présentée comme une formule
mensuelle**, puisque ce n'est pas sa nature.

**Le chauffe-eau n'est pas une offre de la même nature** : il vit dans le catalogue des
prestations, pas dans la table des contrats, et il se facture **à l'année, en une fois**. Je ne
convertis pas 220 € en mensualité : ce serait inventer une périodicité que la source ne donne pas.
Proposition d'affichage : une quatrième entrée, visuellement distincte des trois formules
mensuelles, libellée « Chauffe-eau / ECS — entretien annuel, 220 € TTC/an ».

**Réserve à lever avant affichage** : les prix de `v_services_public` sont aujourd'hui soumis à la
porte des tarifs (identification du visiteur), alors que ceux de `v_contract_offers` sont publics.
Afficher 220 € en clair change cette règle pour cette prestation. **Décision Florian.**

---

## 9. Plan de migration d'URL du tunnel — séparé, non validé

`catalogue.html` est le tunnel ; le nom induit en erreur. **Aucun renommage, aucune 301 proposés
aujourd'hui.** Si la décision était prise plus tard, le plan serait : nouvelle route
`/demande.html` → 301 de `/catalogue.html` → recâblage des 33 liens internes → mise à jour du
sitemap et des campagnes. Rien de tout cela n'est engagé.

---

## 10. Footer — source unique, préparée et non implémentée

Cinq versions coexistent : 9 entrées (79 pages), 6 (14), 8 (6), 4 (12), aucune (37).

Le modèle existe déjà pour l'en-tête : un partiel unique + un script de synchronisation +
un contrôle `--check` en CI. Le même dispositif s'applique au pied de page.

**Liste canonique proposée — 9 métiers, dans cet ordre :**

| ordre | métier | destination | principe de pictogramme |
|---|---|---|---|
| 1 | Plomberie | `plombier-saint-omer.html` | goutte |
| 2 | Chauffage | `chauffagiste-saint-omer.html` | flamme |
| 3 | Électricité | `electricien-saint-omer.html` | éclair |
| 4 | Serrurerie | `serrurier-saint-omer.html` | cadenas |
| 5 | Vitrerie | `vitrier-saint-omer.html` | vitrage |
| 6 | Menuiserie | `menuisier-saint-omer.html` | panneau |
| 7 | Rénovation & travaux | `travaux-saint-omer.html` | outil |
| 8 | Volets & stores | `volets-saint-omer.html` | volet |
| 9 | Adaptation PMR | `pmr-saint-omer.html` | accessibilité |

Principe : **un pictogramme par métier, le même partout** — pied de page, catalogue, cartes — pris
dans une source unique. Aujourd'hui les footers à 6 entrées agrègent (« Serrurerie & vitrerie »,
« Rénovation & travaux ») : vitrerie, menuiserie et volets n'y ont donc pas leur propre pictogramme.

**Le rendu visuel de ces pictogrammes reste `WAITING_FLORIAN_VISUAL`.** Mon audit montre que chaque
glyphe correspond à sa famille dans la référence du catalogue, mais cela ne répond pas à la question
posée, qui porte sur l'apparence. Ce point n'est pas clos.

**Le rendu des pictogrammes reste un gate de Florian** : mon audit a montré que chaque picto
correspond à sa famille dans la référence du catalogue, mais cela ne répond pas à la question
posée, qui porte sur l'apparence. Ce point n'est pas clos.

---

## 10bis. Zones d'intervention — quatre pôles (REQ-023)

Constat de Florian : la section principale de `/zones-intervention` n'affiche que **deux** cartes
de territoire — Saint-Omer & Audomarois, Dunkerque & littoral. Calais et Boulogne-sur-Mer ne sont
présentes que dans les listes de communes. Les données existent (H1, introduction, carte, pastilles,
pied de page) : **c'est un problème de hiérarchie visuelle, pas de données manquantes.**

**Point à ne jamais perdre de vue dans le rendu : Calais et Boulogne sont des ZONES D'INTERVENTION,
pas des agences.** Une seule agence physique, Saint-Omer (Dépan'Audo), plus l'antenne de Dunkerque.
Le libellé et le visuel doivent le dire sans ambiguïté, sinon on promet une implantation qui
n'existe pas.

### Desktop (≥ 980 px) — quatre cartes sur deux rangées
```
┌──────────────────────────────────────────────────────────┐
│        CÔTE D'OPALE · AUDOMAROIS · FLANDRES              │
│        Une agence, toute la Côte d'Opale                 │
│  Agence de Saint-Omer · antenne de Dunkerque             │
│  Calais et Boulogne : zones desservies, sans agence      │
├────────────────────────────┬─────────────────────────────┤
│ ◉ Saint-Omer & Audomarois  │ ◉ Dunkerque & littoral      │
│   AGENCE · Dépan'Audo      │   ANTENNE                   │
│   …texte…                  │   …texte…                   │
│   [pastilles de communes]  │   [pastilles de communes]   │
├────────────────────────────┼─────────────────────────────┤
│ ◉ Calais & Calaisis        │ ◉ Boulogne & Boulonnais     │
│   ZONE DESSERVIE           │   ZONE DESSERVIE            │
│   …texte…                  │   …texte…                   │
│   [pastilles de communes]  │   [pastilles de communes]   │
└────────────────────────────┴─────────────────────────────┘
```

### Mobile (390 px) — quatre cartes empilées
```
┌────────────────────┐
│ ◉ Saint-Omer       │
│   AGENCE           │
│   texte court      │
│   [communes]       │
├────────────────────┤
│ ◉ Dunkerque        │
│   ANTENNE          │
├────────────────────┤
│ ◉ Calais           │
│   ZONE DESSERVIE   │
├────────────────────┤
│ ◉ Boulogne         │
│   ZONE DESSERVIE   │
└────────────────────┘
```

Chaque carte garde la structure actuelle — pastille de couleur, titre, sous-titre, texte,
pastilles de communes — pour que rien ne paraisse rapporté. La **différence de statut** (agence /
antenne / zone desservie) est portée par le sous-titre, pas par la taille de la carte : les quatre
pôles ont le même poids visuel, c'est ce que demande Florian.

`REQ-20260926-023` reste **OPEN / WAITING_FLORIAN_VISUAL** : aucune page n'est modifiée.

## 11. Sécurité — statut exact

**AUDIT / PRÉPARATION COMPLÈTE · PRODUCTION NON SÛRE SUR PLUSIEURS POINTS · WAITING_FLORIAN_GO.**

Ce n'est pas une clôture. Les risques critiques restent bloquants pour toute mise en production :
webhook non signé, lien de paiement public à montant client, écriture GitHub sans authentification,
secrets lisibles en base.

---

## Ce que je ne fais pas tant que ce document n'est pas validé

aucune modification HTML publique · aucune suppression · aucune 301 · aucun changement de
navigation · aucun changement Stripe · aucune migration de base · aucune mise en production.
