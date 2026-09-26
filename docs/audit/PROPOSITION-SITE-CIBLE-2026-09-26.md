# Proposition — le site cible, montré avant d'être codé

REQ-20260926-022 · 2026-09-26 · **aucune page publique modifiée par ce document**

À lire comme une proposition à valider, pas comme une décision. Tout ce qui suit est réversible
tant que rien n'est codé. Là où deux options se valent, je donne les deux et je ne tranche pas.

> **Version visuelle** : une maquette cliquable accompagne ce document (lien donné à Florian dans
> la conversation). Elle montre les cinq écrans en vraie taille, sans toucher au site.

---

## 1. Arborescence cible

Neuf types de page, et **un seul rôle chacun**. C'est la règle qui manque aujourd'hui : plusieurs
pages font le même travail à moitié.

| # | page | rôle unique | contenu | CTA principal | CTA secondaire |
|---|---|---|---|---|---|
| 1 | **Accueil** | orienter | marque, engagements, 9 métiers, urgence, promo saisonnière | « Trouver mon métier » / les 3 intentions | « Demander une intervention » · téléphone |
| 2 | **Métier** (×44) | expliquer un métier | promesse, prestations en cartes, preuves, zones, FAQ, contrats si chauffage | « Voir les prestations <métier> » → catalogue filtré | « Demander un devis » · téléphone |
| 3 | **Nos prestations** | **catalogue public unique** | familles, sous-filtres métier, cartes | **une seule action par carte** selon le mode | « Voir la fiche » |
| 4 | **Fiche prestation** (×35) | détailler une prestation (SEO) | ce qui est inclus, durée, garantie, photos | action du mode de la prestation | « Voir les prestations voisines » |
| 5 | **Réalisations** | prouver | chantiers, avant/après, métier lié | « Voir le métier » | « Demander un devis » |
| 6 | **Contrats** | vendre l'entretien récurrent | comparatif par énergie, garanties, prix | « Souscrire » | « Juste un entretien ponctuel » |
| 7 | **Demande / devis** *(aujourd'hui `catalogue.html`)* | **tunnel** | 6 étapes | « Continuer » | « Reprendre ma demande » |
| 8 | **Achat / réservation** | transaction d'une prestation à prix ferme | récapitulatif, créneau, paiement **après validation** | « Réserver » | « Demander un devis à la place » |
| 9 | **Contact** | joindre l'agence | formulaire, téléphone, adresse, horaires | « Envoyer » | téléphone |

**Ce qui change par rapport à aujourd'hui** : le tunnel n'est plus une destination de navigation.
On n'y entre que par une intention explicite (devis, intervention, réservation).

---

## 2. Parcours utilisateur

```
A. Découvrir puis demander un devis
   Accueil ──▶ Métier ──▶ Prestation (fiche ou carte) ──▶ Demander un devis ──▶ Tunnel · devis

B. Découvrir puis acheter une prestation tarifée
   Accueil ──▶ Métier ──▶ Prestation à prix ferme ──▶ Réserver ──▶ Récapitulatif + créneau
                                                                   (paiement APRÈS validation)

C. Chercher directement dans le catalogue
   Accueil ──▶ Nos prestations ──▶ Filtre métier ──▶ Prestation ──▶ Action unique du mode

D. Souscrire un contrat d'entretien
   Métier Chauffage ──▶ Contrats ──▶ Comparatif gaz / fioul ──▶ Souscrire ──▶ Rappel agence

E. Se laisser convaincre par une réalisation
   Réalisations ──▶ Chantier ──▶ Métier ou prestation liée ──▶ Action

F. Reprendre une demande commencée
   N'importe quelle page ──▶ Tunnel ──▶ « Demande mise de côté · Reprendre » ──▶ étape d'avant
```

Aucun parcours ne dépasse cinq étapes. Aucun ne commence par le tunnel.

---

## 3. Décision proposée pour chaque doublon

Rien n'est appliqué. Je marque ce que je recommande, et l'alternative quand elle est défendable.

| doublon | proposition | pourquoi | alternative |
|---|---|---|---|
| `contrats-entretien.html` **vs** module contrats sur Chauffage | **voir §7** — deux options chiffrées, décision Florian | 571 liens pointent vers la page contrats | — |
| `nos-prestations.html` **vs** `/prestations/*.html` | **garder les deux** | rôles distincts, mesurés : les 35 fiches n'ont ni panier ni tunnel | fusionner ferait perdre 35 pages d'entrée SEO |
| `catalogue.html` **vs** catalogue public | **renommer la route du tunnel** (`/demande` ou `/ma-demande`), 301 depuis `/catalogue` | le nom est la cause de la moitié des erreurs de routage | garder le nom et n'en faire jamais une destination de CTA |
| 16 CTA de cartes métier vers le tunnel | **rediriger** vers fiche ou catalogue filtré | même composant, deux comportements selon le métier | — |
| footer en 5 versions | **fusionner** vers une source unique, comme l'en-tête | 9 métiers affichés sur 79 pages, 6 sur 14, 4 sur 12 | — |
| prix des contrats écrit en dur sur 4 pages | **fusionner** : lire `v_contract_offers` | un prix recopié ne suit pas sa source | garder l'écriture en dur **et** le test qui la vérifie |
| `create-payment-session` appelée mais absente | **supprimer l'appel** *ou* déployer la fonction | aujourd'hui : erreur silencieuse en fin de tunnel | — |

---

## 4. Maquettes

Simples volontairement : le but est un OUI/NON, pas un rendu final.

### 4.1 Accueil
```
┌──────────────────────────────────────────────────────────┐
│ en-tête · logo · métiers ▾ · zones · prestations · 03 66 │
├──────────────────────────────────────────────────────────┤
│  HERO   Un dépannage. Une rénovation.                    │
│         [ Demander une intervention ] [ Voir prestations ]│
│         ★ 4,7 Google   ★ 4,0 Trustville                  │
├──────────────────────────────────────────────────────────┤
│  QUE SOUHAITEZ-VOUS FAIRE ?   3 cartes d'intention       │
│  [ dépanné ]      [ projet/travaux ]   [ entretenir ]    │
├──────────────────────────────────────────────────────────┤
│  NOS MÉTIERS  9 pastilles → page métier                  │
├──────────────────────────────────────────────────────────┤
│  PREUVES  avis · labels · réalisations récentes          │
└──────────────────────────────────────────────────────────┘
        ┌───────────────────────┐   ← encart promo FLOTTANT
        │ AVANT L'HIVER         │      (saisonnier, fermable)
        │ Entretien & ramonage  │
        │ [ Entretien chaudière ]│
        │ [Poêle] [Ramonage]    │
        └───────────────────────┘
```

### 4.2 Page métier
```
┌──────────────────────────────────────────────────────────┐
│ HERO métier : promesse + 2 actions + réassurance         │
├──────────────────────────────────────────────────────────┤
│ [CHAUFFAGE UNIQUEMENT] Section contrats (voir §7)        │
├──────────────────────────────────────────────────────────┤
│ NOS PRESTATIONS   6 cartes homogènes (photo ou médaillon)│
│  ┌────┐ ┌────┐ ┌────┐   chaque carte → FICHE prestation  │
│  └────┘ └────┘ └────┘   (jamais le tunnel)               │
│        [ Voir les prestations <métier> avec prix ]       │
│               → catalogue public filtré                  │
├──────────────────────────────────────────────────────────┤
│ PREUVES · ZONES · FAQ                                    │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Nos prestations (catalogue public)
```
┌──────────────────────────────────────────────────────────┐
│ [Toutes 34] [Plomberie 15] [Chauffage 6] [Électricité 2] │
│ sous-filtres : [Tous] [Chauffe-eau] [Sanitaire] …        │
│   ⚠ aucun slug technique — « Autres prestations » sinon   │
├──────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│ │  photo    │ │  photo    │ │  photo    │                │
│ │ Titre     │ │ Titre     │ │ Titre     │                │
│ │ 3 lignes  │ │ 3 lignes  │ │ 3 lignes  │                │
│ │ ── inclus │ │ ── inclus │ │ ── inclus │                │
│ │ 149 € TTC │ │ Sur devis │ │ 89 € TTC  │                │
│ │ [Réserver]│ │ [Devis]   │ │ [Réserver]│  ← UNE action  │
│ └───────────┘ └───────────┘ └───────────┘                │
└──────────────────────────────────────────────────────────┘
```

### 4.4 Fiche prestation
```
┌──────────────────────────────────────────────────────────┐
│ Fil d'ariane · Métier › Prestation                       │
│ H1 prestation           [ photo ]                        │
│ ce qui est inclus · durée · garantie                     │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 149 € TTC — prix ferme        [ Réserver ]           │ │
│ │   ou  Sur devis               [ Demander un devis ]  │ │
│ └──────────────────────────────────────────────────────┘ │
│ prestations voisines · FAQ · zones                       │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Tunnel (demande / achat)
```
étape 1/6  Lieu      → 2 Besoin → 3 Précision → 4 Ma demande
                     → 5 Coordonnées → 6 Prise en charge
┌──────────────────────────────────────────────────────────┐
│ ‹ retour   Étape 1 sur 6 · Lieu            ✕             │
│ Où devons-nous intervenir ?                              │
│ [adresse] [CP] [ville]                                   │
│ (rappel non bloquant si une demande est mise de côté)    │
│                                   [ Continuer → ]        │
└──────────────────────────────────────────────────────────┘
Le paiement n'apparaît JAMAIS ici : il vient après validation de l'agence.
```

---

## 5. Commerce — une seule action par prestation

| mode | condition | prix affiché | action **unique** | actions interdites |
|---|---|---|---|---|
| `PRICE_FIXED` | forfait vérifiable sur place | oui, TTC | **Réserver** | « Devis » en parallèle |
| `QUOTE_ONLY` | non chiffrable sans visite | non | **Demander un devis** | un prix « à partir de » |
| `PRICE_CONFIRM` | prix indicatif | oui, marqué indicatif | **Demander confirmation** | « Réserver » |

**Ce mode n'existe pas encore en base.** `v_services_public` porte `price_ht`, `requires_quote`
et `deposit_pct` — trois champs dont on peut déduire le mode, mais rien qui le **dise**. Tant qu'il
n'est pas explicite, chaque page devra le deviner, et elles le devineront différemment. C'est, à
mon sens, le premier chantier de fond : une colonne, une valeur par prestation, et toutes les
surfaces s'alignent.

Le bouton téléphone reste présent **hors** de la carte (en-tête, barre mobile) : il n'est pas une
troisième action commerciale.

---

## 6. Paiement — ce qui existe, ce qui est faux, ce qui doit être sécurisé

| | parcours **client public** | parcours **back-office** |
|---|---|---|
| aujourd'hui | `assets/hc-demande.js` appelle `create-payment-session` — **fonction absente du projet** : erreur silencieuse | `admin-pro/paiements.html` → `stripe-create-payment-link` |
| mode | prévu TEST | **LIVE si la clé en base est LIVE** |
| montant | prévu serveur | **fourni par la requête** |
| appelant | prévu authentifié | **aucune authentification** |
| webhook | — | **signature non vérifiée** (`// TODO` dans le code servi) |
| paiement public depuis les cartes | **gelé** depuis le 2026-08-08 (aucun `fetch` dans `hc-reserve-modal.js`) | — |

**Cible** : le client ne paie **jamais avant validation**. L'agence valide, puis envoie un lien.
Avant toute activation LIVE : webhook signé · clé LIVE en variable d'environnement · appelant
authentifié · montant relu en base · idempotence · URL de retour en liste blanche · statut fiable ·
retour arrière écrit. Les versions durcies existent et sont testées (64 tests), **non déployées**.

---

## 7. Contrats — les deux options, chiffrées, sans trancher

### Option A — module complet sur la page Chauffage, puis 301 de `/contrats-entretien.html`

| | |
|---|---|
| UX | tout au même endroit, un clic de moins pour souscrire |
| SEO **contre** | la page contrats est **la cible de 571 liens internes**, dont le pied de page de 208 pages. Une 301 les fait tous transiter par une redirection |
| SEO **contre** | elle est indexée sur des requêtes propres (« contrat entretien chaudière Saint-Omer ») ; la page Chauffage vise déjà « chauffagiste Saint-Omer ». Fusionner, c'est demander à une page de se positionner sur deux intentions |
| SEO **pour** | une page forte plutôt que deux moyennes, si le contenu contrats est intégralement repris |
| risque | perte de position temporaire de 2 à 8 semaines, le temps que la 301 soit digérée |
| réversible ? | oui, mais une 301 remise à l'endroit coûte un second cycle |

### Option B — garder la page contrats, renforcer l'entrée depuis Chauffage

| | |
|---|---|
| UX | un clic de plus pour souscrire |
| SEO | rien ne bouge : 571 liens intacts, position conservée |
| coût | maintenir une seule source de prix (`v_contract_offers`) lue par les deux surfaces |
| réversible ? | totalement |

**Mon avis, puisque vous me le demanderez** : B, et on renforce la section Chauffage pour qu'elle
donne envie de cliquer — ce qui est déjà fait. A devient intéressant seulement si la page contrats
ne se positionne pas, et ça se mesure avant de décider. **La décision est à Florian.**

---

## Ce que je ne fais pas tant que ce document n'est pas validé

aucune modification HTML publique · aucune suppression · aucune 301 · aucun changement de
navigation · aucun changement Stripe · aucune mise en production.
