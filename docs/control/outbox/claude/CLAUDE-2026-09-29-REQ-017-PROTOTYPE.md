# REQ-20260926-017 — prototype : les contrats sur la page Chauffage, plus de double page

message_id: CLAUDE-2026-09-29-REQ-017-PROTOTYPE
branche: `feat/req-017-contrats-sur-chauffage` (isolée, **non fusionnée**)
PR: #17, brouillon, ouverte **uniquement pour obtenir la preview**
date: 2026-09-29

## L'ADRESSE À REGARDER
**https://deploy-preview-17--remarkable-dragon-364e2b.netlify.app/chauffagiste-saint-omer#entretien**

## CRITÈRE DE SUCCÈS — vérifié par script, pas à l'œil
Le visiteur arrive sur Chauffage et peut comprendre, comparer, choisir et souscrire **sans changer
de page**. Relevé automatiquement sur la preview, en 1440 **et** en 390 :

```
cartes gaz : 3   prix : 9,90 € / 14,30 € / 25,30 €   bloc chauffe-eau : visible
modale de souscription ouverte sur place : true   ·   URL inchangée : true
```

Captures archivées dans `docs/qa/REQ-017/`, reliées au SHA `57bf79cd`.

## CE QUI EST EN PLACE
- **onglets Gaz / Fioul / Adoucisseur**, cartes **BASIC / CONFORT / SÉCURITÉ**, badge
  « le plus choisi », mentions légales — exactement le module de la page Contrats ;
- **entretien annuel du chauffe-eau**, présenté **à part** des mensualités, avec son unité écrite
  en toutes lettres : « par an, et non par mois » ;
- **souscription sur place** : la modale s'ouvre sur la page Chauffage, l'URL ne bouge pas ;
- **action secondaire conservée** : « Je veux juste un entretien ponctuel », vers le tunnel, avec
  sa provenance mesurable ;
- le teaser sombre a disparu : plus de « grand bloc sombre publicitaire ».

## AUCUNE TROISIÈME COPIE DE L'OFFRE
- `assets/hc-contrats.{css,js}` sont **extraits** de `contrats-entretien.html` — pas réécrits :
  même balisage, mêmes styles, même logique de souscription. Ils se montent par un simple
  `<div data-hc-contrats>` ;
- **aucun prix n'est écrit dans la page ni dans le module** : tout vient de `v_contract_offers`,
  la vue que le back-office alimente. La garde le vérifie ;
- le chauffe-eau vient de `v_services_public`, slug `contrat-entretien-chauffe-eau`, **220 € TTC** ;
- le module charge le client Supabase lui-même si la page ne l'a pas.

## CE QUI N'EST PAS FAIT, VOLONTAIREMENT
- **`/contrats-entretien.html` n'est ni supprimée ni redirigée**, aucune 301 ;
- **seule la page de Saint-Omer** porte le module. Les trois pages de ville gardent le teaser : un
  prototype se juge sur une page avant de se répandre sur quatre ;
- rien n'est fusionné, ni vers `recette`, ni vers `main`.

## LIENS INTERNES VERS /contrats-entretien — l'inventaire demandé
206 pages citent l'adresse. Il faut distinguer :
- **201** le portent par l'**en-tête partagé** (« Contrats d'entretien → » dans le menu Métiers) :
  une seule source, un seul geste à faire le jour venu ;
- **139 pages** la lient **ailleurs que dans l'en-tête**, soit **168 liens de contenu**. Les plus
  denses : `blog-entretien-chaudiere-annuel-obligatoire`, les trois `chauffagiste-*` de ville,
  `guide-entretien-chaudiere`, `panne-chaudiere` (3 liens chacune).

**Plan de migration — proposé, pas exécuté** (l'instruction demande de l'attendre) :
1. garder `/contrats-entretien.html` **en ligne**, comme page de référence et cible SEO ;
2. faire pointer les liens de contenu des pages **chauffage** vers `#entretien` de leur propre page,
   là où le module est monté — le visiteur ne change plus de page ;
3. laisser les autres pages (blog, guides, prestations) pointer vers `/contrats-entretien` : leur
   contexte n'est pas le chauffage ;
4. ne toucher au lien de l'en-tête qu'en dernier, et seulement si Florian veut que « Contrats
   d'entretien » ouvre la page Chauffage ;
5. aucune 301 tant que la page reste en ligne.

## UN DÉFAUT VISIBLE SUR LA CAPTURE, QUI N'EST PAS DE CE LOT
Sur la capture 1440, **l'encart saisonnier (REQ-035) recouvre la carte BASIC** et son bouton
« Souscrire ». C'est la conséquence directe de « permanent et non fermable » sur une page
commerciale : ici, il cache une offre à vendre. Je ne le corrige pas dans ce lot — c'est une
décision de Florian. Trois options : le laisser, le réduire sur les pages qui vendent, ou le
décaler quand un bloc commercial est à l'écran.

## TESTS
Suite complète sur la branche : **851 PASS / 0 FAIL**. `seo-guardrails` **ERRORS=0**. En-tête :
0 page à mettre à jour.

Gardes mises à jour, parce que la règle a changé : `prix-contrats` contrôle désormais le **module**
sur Saint-Omer (source canonique, aucun prix en dur, souscription sur place, chauffe-eau distingué)
**et** le teaser sur les trois pages de ville ; `ads-landing` et `canonical-pages` suivent.

## SHA ET RETOUR ARRIÈRE
| SHA | objet |
|---|---|
| `bfa95218` | module extrait + monté sur la page Chauffage + gardes |
| `1abdcb7d` | récupération des requêtes média perdues à l'extraction |
| `c7eadd0f` | ancre `#entretien` : marge de défilement |
| `57bf79cd` | captures archivées |

Retour arrière : la branche n'est pas fusionnée. Il suffit de **fermer la PR #17 et de supprimer la
branche** — `recette` n'a jamais bougé.

## NEXT_ACTION
**STOP, comme demandé.** J'attends le verdict visuel de Florian sur la preview avant toute
suppression, redirection ou fusion.
