# Mon erreur sur `admin/`, et ce que la suite des évolutions a révélé

message_id: CLAUDE-2026-10-07-SUITE-EVOLUTIONS
repond_a: clôture PROD de l'encart saisonnier
date: 2026-10-07
verdict: **encart conforme en production** · **le plan des évolutions change : les widgets dépendent des pages éditoriales**

## 1. Mon erreur, reconnue

J'ai écrit « le back-office n'est pas concerné ». C'était faux : mon filtre excluait `admin-pro/`
et **pas `admin/`**, donc `admin/index.html` chargeait l'encart. Vous l'avez vu avant moi.

La faute n'est pas le filtre, c'est de l'avoir cru sur parole. **Désormais, après toute injection
de masse, je compte ce qui a été touché par famille de dossier et je l'écris** — « N pages
publiques, 0 dans `admin`, 0 dans `admin-pro` » — au lieu d'affirmer un périmètre à partir du code.

## 2. L'état de production, vérifié de mon côté

| contrôle | résultat |
| --- | --- |
| fusion | `7bec4bd33b53b51a2c1b68f98cbeadf685d35ab2` |
| `main` et `recette` | même commit · **arbres identiques** · **0 fichier de différence** |
| pages publiques portant l'encart | **197** |
| pages `admin/` ou `admin-pro/` | **0** |
| `reset.html` | **0** |

Conforme.

## 3. Ce que la préparation des widgets a révélé

J'allais prendre « le plus petit » des quatre widgets. En les ouvrant, trois choses ont changé le
plan.

### `hc-review.js` n'a rien à faire en production

Son en-tête est explicite : « Mode *revue Florian* pour le centre de validation. S'active
**UNIQUEMENT** si l'URL contient `?review=<id>` **et pas en prod** ». C'est l'outil de revue, pas
une évolution du site.

**Je le reclasse en « contrôle seulement ».** Il ne doit pas partir en production — et il ne figure
donc plus dans la liste des évolutions à valider.

### Trois des quatre dépendent des pages éditoriales

| widget | ce qu'il fait | ce qui lui manque |
| --- | --- | --- |
| `hc-realisations.js` | la règle unique de classement des publications « réalisations », sur 30 pages | le manifeste `realisations/index.json` et **5 fiches** absents de `main` |
| `hc-recrutement.js` | mesure du parcours recrutement (GA4, sans donnée personnelle) | les **2 annonces d'emploi** absentes de `main` |
| `hc-landing.js` | mesure des pages d'atterrissage « entretien » (Ads) | 2 de ses 4 pages cibles sont ces mêmes annonces |

**Les pages éditoriales ne sont donc pas la dernière étape, c'est la première.** Les livrer débloque
les trois widgets ; les livrer après obligerait à repasser trois fois.

## 4. Le lot éditorial, chiffré

**8 fichiers** manquent à `main` — et seulement 8, car **25 fiches réalisations y sont déjà** :

| fichier | nature |
| --- | --- |
| `emploi/plombier-chauffagiste-saint-omer.html` | **annonce d'emploi** — « Plombier chauffagiste CDI à Saint-Omer » |
| `emploi/plombier-sanitaire-saint-omer.html` | **annonce d'emploi** — « Plombier sanitaire CDI à Saint-Omer » |
| `realisations/nouvelle-intervention-plomberie-help-confort-saint-omer.html` | fiche chantier |
| `realisations/nouvelle-realisation-signee-help-confort-saint-omer.html` | fiche chantier |
| `realisations/nouvelle-renovation-realisee-par-help-confort-saint-omer.html` | fiche chantier |
| `realisations/remplacement-de-la-serrurerie-sur-porte-dentree.html` | fiche chantier |
| `realisations/remplacement-de-parquet-massif.html` | fiche chantier |
| `realisations/index.json` | manifeste des fiches réellement générées |

**Les deux annonces d'emploi sont une décision d'entreprise, pas une évolution technique** :
publier une offre en CDI vous engage. Je ne les mets pas en ligne sans que vous les ayez lues.

Les cinq fiches chantier et le manifeste sont du contenu déjà produit, de même nature que les 25
déjà publiées.

## 5. Ce que je propose

1. **Vous lisez les deux annonces d'emploi** — je peux vous les sortir en texte lisible si vous
   préférez ne pas ouvrir le HTML. Recrutez-vous encore sur ces deux postes ?
2. Selon votre réponse : un lot « fiches chantier + manifeste » seul, ou le lot complet.
3. Puis les trois widgets, qui n'auront plus de dépendance manquante.
4. Restent ensuite l'**en-tête unifié** et le **tunnel de demande** — les deux gros morceaux.

Rien n'est engagé tant que vous n'avez pas répondu sur les annonces.
