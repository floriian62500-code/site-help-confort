# Proposition — le site cible, montré avant d'être codé

REQ-20260926-022 · attempt 3 · 2026-09-26 · **aucune page publique modifiée par ce document**

Version corrigée après le contrôle `CHATGPT-2026-09-26-CONTROL-PROPOSAL-1`. Les affirmations SEO
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
│ 1 Zone desservie ✔   2 Créneau   3 Coordonnées           │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Récapitulatif                                        │ │
│ │ Entretien chaudière gaz            121,00 € TTC      │ │
│ │ (montant relu par le serveur, jamais par le navigateur)│
│ └──────────────────────────────────────────────────────┘ │
│              [ Payer en ligne · Stripe ]                 │
│  ou          [ Demander un devis à la place ]            │
└──────────────────────────────────────────────────────────┘
```

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
| **PRICE_CONFIRM** | **1** | `vmc` — `requires_quote = true` **et** `price_ht = 350` |
| ambigus non classables | **0** | — |

Deux points à retenir :

1. **Aucune nouvelle colonne n'est nécessaire aujourd'hui.** Deux champs existants suffisent. Je
   propose donc **une fonction de dérivation partagée** (cœur `hc-demande-core.js`, lue par le
   catalogue, les fiches et le tunnel) plutôt qu'une migration. Une colonne ne se justifiera que le
   jour où le métier voudra un mode qui ne se déduit pas — et ce jour-là, la fonction devient la
   valeur par défaut de la colonne.
2. **`vmc` est le seul cas à trancher** : une prestation « sur devis » qui porte pourtant un prix
   de 350 € HT. Soit c'est un prix indicatif — et c'est exactement `PRICE_CONFIRM` — soit c'est une
   donnée à corriger. **Question pour Florian**, pas pour moi.

Les **variantes** ne créent pas d'ambiguïté : `chauffe-eau-100l-eco` et
`mecanisme-chasse-eau-standard` portent une variante qui change le prix (stéatite, Geberit). Une
fois la variante choisie, le prix reste ferme. Elles restent `PRICE_FIXED`.

---

## 6. Paiement — cible, état actuel, étapes transitoires

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

### C. Étapes transitoires avant d'activer le paiement direct

1. appliquer la migration du montant serveur (`interventions_montant`) ;
2. poser `STRIPE_MODE`, `STRIPE_TEST_SECRET_KEY`, `STRIPE_LIVE_SECRET_KEY` en variables
   d'environnement — plus aucune clé en base ;
3. déployer le webhook **signé** ; vérifier un événement de test ;
4. déployer le lien de paiement **authentifié à montant serveur** ;
5. brancher le parcours d'achat sur le mode `PRICE_FIXED`, **en TEST d'abord** ;
6. recette complète sur Stripe TEST : faux webhook refusé, rejeu refusé, absence de secret =
   refus, montant client ignoré, URL de retour hors liste blanche refusée ;
7. **seulement ensuite**, bascule LIVE — décision Florian.

Les versions durcies des fonctions existent et passent **64 tests**, elles ne sont **pas
déployées**.

---

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

**Le rendu des pictogrammes reste un gate de Florian** : mon audit a montré que chaque picto
correspond à sa famille dans la référence du catalogue, mais cela ne répond pas à la question
posée, qui porte sur l'apparence. Ce point n'est pas clos.

---

## 11. Sécurité — statut exact

**AUDIT / PRÉPARATION COMPLÈTE · PRODUCTION NON SÛRE SUR PLUSIEURS POINTS · WAITING_FLORIAN_GO.**

Ce n'est pas une clôture. Les risques critiques restent bloquants pour toute mise en production :
webhook non signé, lien de paiement public à montant client, écriture GitHub sans authentification,
secrets lisibles en base.

---

## Ce que je ne fais pas tant que ce document n'est pas validé

aucune modification HTML publique · aucune suppression · aucune 301 · aucun changement de
navigation · aucun changement Stripe · aucune migration de base · aucune mise en production.
