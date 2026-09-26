# Ce que la release change dans les prix affichés

*Pour Florian, avant tout passage en production. Demandé par `CHATGPT-2026-09-25-CONTROL-4` §4 :
aucun prix visible ne part en production sur une validation seulement technique.*

## En une phrase

Une seule page change de prix : l'article de blog sur l'entretien annuel obligatoire. Elle affiche
aujourd'hui des tarifs qui **ne correspondent à rien dans le catalogue** — dont une formule qui
n'existe pas et une statistique invérifiable. Après, elle affiche les tarifs réels.

**Page concernée :** `blog-entretien-chaudiere-annuel-obligatoire.html` — et elle seule.

## Ce qui disparaît, ce qui apparaît

| Aujourd'hui en ligne | Après la release | Pourquoi |
|---|---|---|
| Entretien chaudière gaz : **120 € à 180 € TTC** | **121 € TTC** à l'intervention | le catalogue a un prix ferme, pas une fourchette |
| Entretien chaudière fioul : **150 € à 220 € TTC** | **178,20 € TTC** (218,90 € gros volume) | idem |
| Entretien chaudière **à condensation : 130 € à 200 €** | *(retiré)* | cette prestation n'existe pas au catalogue |
| Contrat annuel **« Essentiel HC » : 12,90 €/mois** | **dès 9,90 € TTC/mois** en gaz, 13,20 € en fioul | la formule « Essentiel HC » n'existe pas ; le vrai prix d'entrée est **moins cher** |
| « 3 formules de **12,90 à 29,90 €/mois** » | « de **9,90 à 29,70 €** TTC/mois » | amplitude réelle du catalogue |
| « Notre formule Confort à **19,90 €/mois** est plébiscitée par nos clients (**78 % des contrats souscrits**) » | « La formule CONFORT (**14,30 €** en gaz, **17,60 €** en fioul) couvre le mieux les pannes courantes » | 19,90 € n'existe pas ; et les 78 % ne sont vérifiables nulle part |
| Bouton « Voir les formules » → **appelle le standard** | → ouvre la page contrats | le bouton promettait des formules et déclenchait un appel |

## Le sens commercial, en clair

**Tous les écarts vont dans le même sens : la page annonçait plus cher que la réalité.**
Un client qui la lisait voyait une entrée de gamme à 12,90 €/mois alors qu'elle est à 9,90 €, et un
entretien gaz « jusqu'à 180 € » alors qu'il est à 121 €. Corriger ne réduit aucune marge : cela
arrête de décourager des clients avec des prix qui n'existent pas.

Le seul point qui demande vraiment ton avis : la **statistique des 78 %** disparaît. C'est un
argument de vente. Je ne l'ai pas remplacé par un autre chiffre, faute de source ; la phrase dit
désormais ce que la formule couvre, pas combien de gens la choisissent. Si ce chiffre est vrai et
que tu peux l'appuyer, il peut revenir.

## Source utilisée

`data/contrats-tarifs.json` — relevé du catalogue de production (`v_services_public` et
`v_contract_offers`, lecture seule). **Comparé au catalogue réel le 2026-09-25** par le contrôle en
ligne : 6 contrats, 3 prestations, **aucun écart**. Aucun montant n'a été inventé ni arrondi ; un
test échoue si une page affiche un tarif absent de ce relevé.

## Ce que ça ne change pas

- aucun prix du catalogue, du tunnel de commande ou de la page contrats ;
- aucun prix en base ;
- aucune autre page du site ;
- rien dans le parcours de paiement.

## Classement

**`TECH_READY` + `WAITING_FLORIAN_BUSINESS`.** Les tests prouvent que les montants correspondent au
catalogue ; ils ne peuvent pas décider à ta place s'il faut afficher ces prix-là. C'est à toi.
