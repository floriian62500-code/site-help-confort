# Benchmark — parcours de réservation / vente de prestations (dépannage & travaux FR)

> Tâche ledger : **UX-COMMERCE-1**. Source : issue #9 commentaire 5441880835 (Florian/ChatGPT).
> Objectif : comprendre les parcours leaders pour construire **un parcours supérieur** adapté au
> modèle Help Confort (techniciens **salariés**, agences locales Saint-Omer/Dunkerque, catalogue
> réel, multi-panier). **Aucune copie de contenu ni de design.** Analyse structurelle uniquement.
> Vérifié le 2026-08-27. Méthode : lecture publique des parcours (WebFetch), pas de compte créé,
> aucune donnée personnelle saisie, aucune réservation déclenchée.

## 1. Acteurs analysés

| # | Acteur | Modèle | Vérifié ce run |
|---|---|---|---|
| A | **Depanneo** (`/plombier/pas-de-calais/saint-omer/`) | Dépannage urgence, réseau d'artisans, prix en fourchette TTC | ✅ oui |
| B | **MesDépanneurs.fr** (homepage + diagnostic) | Dépannage, questionnaire progressif, réseau d'artisans certifiés | ✅ oui |
| C | **IZI by EDF (rénov)** | Travaux/rénovation, 100 % devis, conseiller dédié | ✅ oui |
| D | **Habitatpresto** | Pure mise en relation (lead-gen), multi-devis 48h | ✅ oui |
| E | **Frizbiz / HelloCasa** (catalogue prix ferme + créneau) | Services maison à prix ferme, réservation d'un créneau en ligne | ⚠️ non (403 ce run — décrit de mémoire générale, à re-vérifier avant de s'en inspirer) |

## 2. Tableau comparatif structurel

| Critère | A · Depanneo | B · MesDépanneurs | C · IZI by EDF | D · Habitatpresto | E · Frizbiz/HelloCasa* |
|---|---|---|---|---|---|
| **Entrée principale** | Appel tel (24/7) + « réserver mon intervention en ligne » | « J'ai besoin d'être dépanné » + « Diagnostic en ligne » | « Votre devis sans engagement » | « Devis Gratuits » / « Débuter votre projet » | « Réserver un jobber/pro » (catalogue) |
| **Nb d'étapes** | 2 voies : appel (1) / en ligne (2+) | Questionnaire progressif (≈4) | Linéaire pré-devis → visite → devis | Formulaire 4 étapes | Catalogue → options → créneau → paiement |
| **Localisation demandée** | Tard (champ code postal dans le tunnel) | Pendant la réservation (dispos + zone) | Phase pré-devis puis visite obligatoire | Étape 3 du formulaire | Tôt (adresse conditionne dispo/prix) |
| **Diagnostic guidé** | Non (grille de 6 services) | **Oui** : métier → équipement → problème | Non (projet décrit librement) | Type de projet → détails | Non (choix direct dans le catalogue) |
| **Catalogue / recherche** | Grille fixe + fourchettes | Cartes services + cas détaillés (débouchage WC, fuite ballon…) | Non (devis sur mesure) | Catégories de travaux | **Catalogue prix ferme** par service |
| **Affichage prix** | Fourchette TTC (« 149€–199€ ») + « sur devis » complexe | Fourchette TTC annoncée avant | 100 % « sur devis » (prix après visite) | Aucun prix (mise en relation) | **Prix ferme TTC** affiché |
| **Panier multi-prestations** | ❌ | ❌ | ❌ | ❌ | Partiel (souvent 1 service/résa) |
| **Urgence vs RDV** | Implicite (« sous 40 min » selon service, pas de choix) | Urgence signalée par le client (« dans l'heure ») | Sans objet (projet planifié) | Sans objet | Choix de créneau (RDV) |
| **Récap / sticky** | Tel persistant, pas de panier | Non exposé | Non (progression linéaire) | Non | Récap avant paiement |
| **Réassurance** | Charte qualité 1 700 artisans, « sans frais cachés », logos presse | Garantie 1 an, 1 300 pros assurés, 93 % satisfaction, Trustpilot | Artisans RGE, aides pré-intégrées, Trustpilot | 30 000 avis « seuls les utilisateurs évaluent », 21 ans | Assurance, avis, techniciens vérifiés |
| **Checkout / CTA final** | « réserver mon intervention » (par service) | Rappel/confirmation du pro | Validation du devis avec conseiller | Sélection du pro sur avis | Paiement en ligne du créneau |
| **Paiement** | Après intervention | Après intervention (devis validé) | Après devis + visite | N/A (relation) | En ligne à la réservation |

\* Ligne E non re-vérifiée ce run (HTTP 403) — à confirmer avant toute décision qui s'y appuie.

## 3. Bonnes idées à retenir (adaptées, pas copiées)

1. **Localisation tôt** (A, E) : demander adresse/CP dès le début pour contextualiser zone/agence/dispo
   et **ne jamais redemander** l'info ensuite.
2. **Diagnostic guidé progressif** (B) : pour le client qui ne sait pas nommer sa prestation —
   métier → équipement/zone → symptôme → prestations compatibles. Réduit la charge cognitive.
3. **Fourchette TTC honnête + « sur devis »** (A, B) : afficher un prix ferme **quand il l'est**,
   une fourchette sinon, « sur devis » quand un diagnostic est nécessaire. Jamais de prix ferme
   sur une prestation qui dépend d'un diagnostic.
4. **Catalogue par familles + recherche** (E) : entrée directe pour le client qui sait ce qu'il veut.
5. **Réassurance concrète** (B, C) : garantie réelle, avis vérifiés, pros identifiés — sobre.
6. **Paiement non bloquant** (A, B) : la réservation aboutit même sans paiement immédiat ; le
   paiement suit la stratégie (chez nous : Stripe **gated**, réservation possible sans payer).

## 4. Mauvaises idées / pièges à NE PAS reproduire

1. **Fausses promesses de délai** (« sous 40 min », « dans l'heure », 24/7) : Help Confort a des
   **horaires et une capacité réels** de techniciens salariés. On promet ce qu'on tient. → cf.
   mémoire `site-hc-test-lead-hygiene` / honnêteté.
2. **Dark patterns** : faux compteurs « X personnes regardent », fausse urgence, faux stock. Interdit.
3. **Sélection unique enfermante** (la plupart) : aucun ne permet un **vrai multi-panier**. C'est
   notre différenciateur → plusieurs prestations dans une seule commande.
4. **Prix caché derrière un formulaire** (D) : lead-gen pur sans transparence. On affiche le prix
   quand il est ferme.
5. **Design/contenu concurrent** : aucun copier-coller (texte, wording exact, mise en page).
6. **Tout « sur devis »** (C) : décourage le client qui voulait juste commander un débouchage à prix ferme.

## 5. Opportunité différenciante Help Confort

| Levier | Concurrents | Help Confort (cible) |
|---|---|---|
| Techniciens | Réseau d'artisans tiers | **Salariés**, agence locale → réassurance forte et vraie |
| Multi-prestations | Mono-service | **Multi-panier natif** (prestations de familles différentes) |
| Deux modes | Soit catalogue, soit diagnostic | **Un seul moteur** : catalogue *et* diagnostic guidé → même panier |
| Honnêteté prix/délai | Fourchettes + promesses agressives | Prix ferme / fourchette / sur devis **selon réalité** + délais réels |
| Local | National standardisé | Saint-Omer/Dunkerque, zone, agence, rappel humain |

→ Architecture cible détaillée dans **[help-confort-commerce-flow.md](help-confort-commerce-flow.md)**.
