# Audit fonctionnel du site — 2026-09-26

REQ-20260926-021 (ex-014) · branche `recette` · **audit, aucune correction pendant l'audit**

Tout ce qui suit est **mesuré**, pas supposé : chaque nombre vient d'un balayage des 208 pages
publiques et des scripts de `assets/`, ou d'une lecture seule de la base. Là où je n'ai pas de
preuve, je l'écris.

## Ce que le site est aujourd'hui, en chiffres

| | |
|---|---|
| pages publiques | **208** |
| dont pages métier (9 métiers × villes) | 44 |
| dont fiches prestation (`/prestations/*.html`) | 35 |
| dont pages racine (accueil, contact, contrats, catalogue public, tunnel, légales…) | 64 |
| dont réalisations / actualités / guides / emploi / dépannage-ville | 65 |
| liens vers le **tunnel** (`/catalogue`) | **33**, dont 24 sur des pages métier |
| liens vers le **catalogue public** (`/nos-prestations`) | 435 |
| liens vers une **fiche prestation** | 168 |
| liens vers la page **contrats** | 571 |
| liens `tel:` | 856 |

Deux enseignements immédiats. D'abord, le tunnel est **marginal en nombre de liens** (33 contre
435) : le problème n'est pas qu'on y va trop, c'est qu'on y va **par erreur**. Ensuite, 571 liens
pointent vers la page contrats : c'est le bloc de liens du pied de page, présent partout — donc
toute décision sur cette page se répercute sur l'ensemble du site.

## A. Deux concepts appelés « catalogue » — confirmé

| URL | ce que c'est vraiment | ce que le nom laisse croire |
|---|---|---|
| `nos-prestations.html` | le **catalogue public** : familles, sous-filtres, cartes, prix ou devis | — |
| `catalogue.html` | le **tunnel** : « Votre demande », 6 étapes, première étape « Où devons-nous intervenir ? » | un catalogue |

C'est la racine de la moitié des défauts de routage constatés depuis trois jours : un développeur
qui cherche « le catalogue » trouve `catalogue.html`, et y envoie un bouton de consultation.

## B. Les pages métier ne routent pas de la même façon — confirmé, et mesuré

Après la correction du 26/09 (REQ-011, 22 boutons « Voir nos prestations … avec prix » recâblés),
il reste **16 liens directs vers le tunnel** portés par des **cartes de savoir-faire** :

| pages | carte | destination |
|---|---|---|
| électricien ×4 | « Installation & rénovation » | `/catalogue#cat=electricite` |
| serrurier ×4 | « Serrurerie & blindage » + « Dépannage urgence » | `/catalogue#cat=serrurerie` |
| volets ×2 | « Dépannage urgence » + « Motorisation & modernisation » | `/catalogue#cat=renovation` |

Sur les pages **chauffagiste**, les cartes équivalentes mènent à une **fiche prestation**
(`prestations/remplacement-chaudiere.html`…). Le même composant visuel, la même promesse, deux
destinations différentes selon le métier. C'est exactement le constat B.

## C. Contrats : trois endroits parlent des mêmes formules

| endroit | ce qu'il montre | source |
|---|---|---|
| `contrats-entretien.html` | le comparatif complet, par énergie | **`v_contract_offers`** (7 offres actives) |
| pages chauffagiste ×4 | section premium : 3 noms, prix d'appel, bénéfices | texte écrit en dur, **prix recopié** |
| `nos-prestations.html` | une section contrats visible quand le filtre Chauffage est actif | catalogue |
| pied de page (208 pages) | lien « Contrats d'entretien » | — |

Le risque n'est pas l'existence de plusieurs entrées, c'est que **le prix d'appel est écrit en dur
à quatre endroits** alors que la source (`v_contract_offers`) peut changer. Aujourd'hui un seul
chiffre est recopié (9,90 €) et un test le vérifie — mais c'est une vérification, pas une source.

## D. Fiches prestation — rôle sain, à confirmer

35 fiches. Mesuré : **0** contient un lien vers le tunnel, **0** embarque un panier, **5**
affichent un prix. Elles ne recréent donc **pas** un second catalogue ni un second tunnel. Leur
rôle de fiche détail SEO est tenu ; ce qui manque, c'est qu'elles conduisent explicitement à
l'action commerciale correspondant au mode de la prestation.

## E. Paiement en ligne — deux systèmes, dont un qui n'existe pas

| flux | où | état réel |
|---|---|---|
| `create-payment-session` | appelé par `assets/hc-demande.js` (tunnel client) | **la fonction n'existe pas** dans le projet Supabase — l'appel ne peut que échouer |
| `stripe-create-payment-link` | back-office `admin-pro/paiements.html` et `admin-pro/interventions.html` | déployée, **publique, montant venu du client, clé lue en base** |
| paiement public depuis le site | `assets/hc-reserve-modal.js` | **gelé** depuis le 2026-08-08 : le fichier ne contient **aucun `fetch`**, la mention de Stripe n'y est qu'un commentaire expliquant le gel |

Détail complet et matrice de classement : `CLAUDE-2026-09-26-REQ-001-CLOTURE-PAIEMENT-SECURITE.md`.

## F. Cartes du catalogue — trop d'actions concurrentes

Une carte de `nos-prestations.html` peut porter simultanément : « Voir le tarif » (verrouillé par
la porte des tarifs), « Devis », un bouton téléphone, et un renvoi. Le sous-filtre technique
`_default` y est apparu (corrigé le 26/09, REQ-019). La règle « une prestation, **un** mode
commercial principal » n'est pas appliquée : rien dans les données ne dit aujourd'hui si une
prestation est `PRICE_FIXED` ou `QUOTE_ONLY` — `v_services_public` porte `price_ht`,
`requires_quote`, `deposit_pct`, mais aucun champ de mode commercial unique.

## Table d'audit

| URL / composant | rôle actuel | rôle cible | source de données | CTA actuel | destination actuelle | destination cible | doublon avec | risque | recommandation | priorité |
|---|---|---|---|---|---|---|---|---|---|---|
| `index.html` | vitrine + 3 entrées + encart promo flottant | vitrine, oriente vers le métier | statique + `realisations-json` | « Demander une intervention » | tunnel `#intervention` | tunnel (explicite) ✔ | — | faible | conserver | — |
| `nos-prestations.html` | catalogue public, filtres, prix/devis | **catalogue public unique** | `v_services_public` | 3 actions par carte | mixte | **1 action principale** | — | confusion client | ajouter un mode commercial en base | P1 |
| `catalogue.html` | **tunnel** 6 étapes | tunnel transactionnel | `v_services_public` + `submit-lead-v6` | — | — | — | nom trompeur | structurel | renommer la route, garder une 301 | P1 |
| pages chauffagiste ×4 | métier + contrats + 6 cartes | métier | statique | cartes → fiches | fiche prestation ✔ | idem | — | faible | conserver | — |
| pages électricien ×4 | métier | métier | statique | 1 carte → tunnel | **tunnel** | fiche ou catalogue filtré | incohérence B | moyen | aligner sur Chauffage | P1 |
| pages serrurier ×4 | métier | métier | statique | 2 cartes → tunnel | **tunnel** | idem | incohérence B | moyen | aligner | P1 |
| pages volets ×2 | métier | métier | statique | 2 cartes → tunnel | **tunnel** | idem | incohérence B | moyen | aligner | P1 |
| `contrats-entretien.html` | comparatif complet | **seule page qui décrit** | `v_contract_offers` | souscrire | modale | idem | section premium ×4 | faible | conserver comme source | — |
| section contrats (4 pages métier) | mise en avant | annonce, ne décrit pas | **texte en dur** | vers page contrats ✔ | ✔ | ✔ | page contrats | **prix recopié** | lire le prix depuis la source | P1 |
| `prestations/*.html` ×35 | fiche détail SEO | fiche détail | statique (5 avec prix) | contact/devis | contact | action selon mode | — | faible | brancher sur le mode commercial | P2 |
| `assets/hc-demande.js` | tunnel + panier + brouillon + reprise + porte tarifs + paiement | tunnel | `v_services_public` | — | — | — | — | **appelle une fonction inexistante** | retirer ou déployer `create-payment-session` | **P0** |
| `admin-pro/paiements.html` | créer un lien de paiement | back-office | `payments` | « créer le lien » | fonction publique | fonction authentifiée | — | **PROD_UNSAFE** | paquet durci en attente de GO | **P0** |
| pied de page (208 pages) | navigation | navigation | statique | 9 liens métier | ✔ | ✔ | — | **5 versions différentes** | source unique, comme l'en-tête | P1 |

## PARCOURS-CIBLE

Chaque parcours en 5 étapes au maximum. Les étapes marquées ✔ existent déjà ; les autres sont la
cible à valider (REQ-022, rien n'est implémenté).

| parcours | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **comprendre un métier** | accueil ✔ | page métier ✔ | preuves / zones / FAQ ✔ | — | — |
| **voir les prestations** | page métier ✔ | catalogue public filtré ✔ | fiche prestation ✔ | — | — |
| **demander un devis** | catalogue ou fiche ✔ | CTA « Demander un devis » ✔ | tunnel, mode devis ✔ | envoi ✔ | accusé ✔ |
| **acheter une prestation tarifée** | catalogue ✔ | prix visible (porte des tarifs) ✔ | CTA « Réserver » (à définir) | tunnel, mode intervention ✔ | paiement **après** validation |
| **souscrire un contrat** | page métier / pied de page ✔ | page contrats ✔ | comparatif ✔ | souscription ✔ | rappel agence ✔ |
| **reprendre une demande** | retour sur le site ✔ | écran d'entrée du tunnel ✔ | reprise explicite ✔ | — | — |
| **payer après validation** | lien envoyé par l'agence | page de paiement | Stripe | retour site ✔ | statut fiable (**à sécuriser**) |

## Ce que je recommande, dans cet ordre

1. **P0 — l'appel fantôme.** `assets/hc-demande.js` appelle `create-payment-session`, qui n'existe
   pas. Soit la fonction est déployée, soit l'appel est retiré. Aujourd'hui, un client qui arrive
   au bout du tunnel avec une option de paiement tombe sur une erreur silencieuse.
2. **P0 — la chaîne Stripe** (webhook signé, montant serveur, authentification) : cinq actions en
   attente de GO, déjà écrites et testées.
3. **P1 — un mode commercial par prestation** en base (`PRICE_FIXED` / `QUOTE_ONLY` /
   `PRICE_CONFIRM`). C'est la seule façon d'avoir « une action principale par carte » sans la
   décider à la main page par page.
4. **P1 — aligner les cartes métier** : les 16 liens directs vers le tunnel deviennent des fiches
   ou du catalogue filtré.
5. **P1 — le prix des contrats lu depuis `v_contract_offers`** au lieu d'être recopié.
6. **P1 — une seule source pour le pied de page**, comme l'en-tête (cinq versions coexistent).
7. **P2 — renommer la route du tunnel** (`catalogue.html`), avec 301. Structurel : ne rien faire
   avant validation.

## Limites de cet audit

- il porte sur le **site public** ; `admin-pro/` n'est inventorié que pour ses appels au paiement ;
- « rôle cible » est une **proposition**, pas une décision : REQ-022 impose de montrer avant de
  modifier, et rien n'a été modifié pour produire ce document ;
- les compteurs de liens comptent les occurrences dans le HTML servi, pièges inclus (un lien
  présent sur 208 pages compte 208 fois) — c'est voulu, c'est ce que voit un visiteur.
