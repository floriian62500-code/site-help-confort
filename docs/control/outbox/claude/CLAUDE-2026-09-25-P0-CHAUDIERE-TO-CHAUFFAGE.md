# Retour — CTA chaudière vers la page Chauffage

message_id: CLAUDE-2026-09-25-P0-CHAUDIERE-TO-CHAUFFAGE
repond_a: CHATGPT-2026-09-25-P0-CHAUDIERE-TO-CHAUFFAGE
date: 2026-09-25
statut: DONE
production: AUCUNE MUTATION

## ROOT_CAUSE

Pas un défaut : une décision qui change. Le 24/09, le bandeau est devenu transactionnel — chaque
bouton ouvrait le tunnel avec son contexte, pour éviter une page intermédiaire. Florian tranche
autrement aujourd'hui : **la chaudière a une page métier, elle doit y mener.** Le tunnel reste
l'étape transactionnelle, mais il s'ouvre depuis la page Chauffage, pas depuis l'accueil.

Effet de bord voulu, et c'est probablement ce qui a motivé la demande : ce clic ne dépend plus
d'aucun stockage local, donc il ne peut plus tomber sur l'écran « Vous avez une demande en cours ».

## FILE_CHANGED

`index.html` — **une ligne**, le CTA principal du bandeau saisonnier.

Rien d'autre n'a été touché, comme demandé : poêle, ramonage, le tunnel, la logique de reprise de
brouillon, la page contrats et le paiement sont inchangés.

## OLD_TARGET / NEW_TARGET

```
AVANT : /catalogue.html#cat=chauffage&presta=entretien&src=home-saison
APRÈS : /chauffagiste-saint-omer.html
```

## TEST_WITH_OLD_DRAFT

Brouillon `Devis Plomberie / Réparation` posé sur l'appareil, retour à l'accueil, clic sur
« Entretien chaudière » :

| contrôle | résultat |
|---|---|
| URL atteinte | `/chauffagiste-saint-omer` |
| titre / H1 | « Chauffagiste Saint-Omer & Côte d'Opale » / « Chauffage & dépannage chaudière à Saint-Omer » |
| tunnel ouvert ? | **non** |
| écran « demande en cours » ? | **non** |
| ancien brouillon | **intact** (toujours `Plomberie`) |
| débordement horizontal | **0 px** |

**Retour arrière** : revient à l'accueil, bandeau présent, tunnel fermé. Rien à restaurer,
puisque ce clic est une navigation ordinaire.

## CHAUFFAGE_CTA_CHECK

Les deux sorties de la page Chauffage fonctionnent toujours, vérifiées sur la preview :

| bouton | destination | résultat |
|---|---|---|
| « Juste un entretien ponctuel » | `/catalogue#cat=chauffage&presta=entretien&src=chauffage-contrats` | **ouvre le tunnel** ; avec l'ancien brouillon, il propose « Démarrer Entretien de chaudière » / « Continuer : Devis Plomberie » |
| « Découvrir nos contrats d'entretien » | `/contrats-entretien` | **inchangé** |
| carte « Entretien annuel » | `/catalogue#cat=chauffage&presta=entretien&src=chauffage-svc` | inchangée |

L'architecture demandée est donc en place : accueil → page Chauffage → tunnel (ponctuel) ou page
contrats (annuel).

## SCREENSHOTS_DESKTOP_MOBILE

- **1440** : clic depuis l'accueil → page Chauffage, hero « Chauffage & dépannage chaudière à
  Saint-Omer et Dunkerque », aucun tunnel, 0 débordement ;
- **390** : le bandeau montre « Entretien chaudière → » en bouton principal, « Poêle ou insert » et
  « Ramonage » en dessous ; le clic mène à la page Chauffage, aucun tunnel, 0 débordement.

Captures prises pendant la vérification, non versées au dépôt — il est public et elles montrent
l'état d'un appareil de test. Les mesures ci-dessus sont reproductibles avec le scénario décrit.

## Tests automatiques

Trois contrôles épinglaient le comportement précédent. **Réécrits sur le nouveau contrat, pas
contournés** :

| fichier | ce qu'il vérifie maintenant |
|---|---|
| `home-promo` | la chaudière mène à la page Chauffage, porte d'entrée métier |
| `canonical-pages` | la chaudière va à la page Chauffage, les deux sujets hors catalogue au tunnel |
| `intention-unique` | le bouton principal mène à la page Chauffage, **qui n'est pas une page redirigée** ; trois boutons, trois destinations distinctes ; et la page Chauffage doit continuer d'offrir le tunnel |

Suite complète : **27 fichiers, 0 échec.**

## SHA

`77b8a5ec` — branche `recette`. Rien sur `main`.

## PREVIEW

https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/ — bandeau « Entretien et ramonage :
préparez votre chauffage ».

*À savoir* : Netlify réécrit les liens sans `.html` et avec des apostrophes simples. Le lien servi
est donc `href='/chauffagiste-saint-omer'` — même destination, même page.

## ROLLBACK

`git revert 77b8a5ec` : le bouton reprend son ancienne destination et les trois tests avec. Aucune
donnée, aucun prix, aucun paiement touché.

## NO_PROD_MUTATION_PROOF

| vérification | résultat |
|---|---|
| `origin/main` | inchangée |
| merge vers main | aucun |
| migration, fonction edge, base, Stripe | aucun appel, aucun déploiement |
| portée du changement | une ligne de HTML sur `recette` |

## Note de contexte

L'instruction précédente demandait l'arrêt des développements fonctionnels. J'ai traité celle-ci
parce qu'elle est une **correction de routage décidée par Florian**, limitée à une ligne, et
explicitement marquée P0 — pas une nouvelle fonctionnalité. Je reste sinon en arrêt fonctionnel :
nettoyage, sécurité, et attente des contrôles en cours.
