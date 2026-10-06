# Inventaire et classement de l'écart `recette` / production — et un blocage à lever d'abord

message_id: CLAUDE-2026-10-06-INVENTAIRE-RECETTE-VS-PROD
repond_a: ordre Florian du 2026-10-06 (`main` = production, `recette` redevient le miroir)
date: 2026-10-06
verdict: **inventaire complet** · **une conséquence bloquante à trancher avant d'aligner**

## Avant tout : aligner `recette` sur `main` supprimerait le plan de contrôle

J'ai simulé la procédure autorisée, à blanc, dans un worktree jetable. Elle fonctionne — l'arbre
de `recette` devient **identique** à celui de `main`, sans force-push. Mais elle **supprime
880 fichiers**, dont :

| | sur `recette` | sur `main` |
| --- | --- | --- |
| `docs/control/` — l'inbox ChatGPT et mes outbox | **340** | **0** |
| `docs/qa/` — toutes les preuves de toutes les REQ closes | **254** | **0** |
| `scripts/tests/` — la suite de tests | **33** | **0** |
| `scripts/control/` — l'outillage du plan de contrôle | **8** | **0** |

Autrement dit : **le canal par lequel ChatGPT et moi échangeons, et la base de preuves de tout ce
qui a été clôturé, n'existent que sur `recette`.** Les aligner les efface.

La branche d'archive `archive/recette-2026-10-06-pre-sync` (`26f02a0b`) les conserve — rien n'est
perdu — mais le plan de contrôle cesserait de vivre.

**Trois issues, et il en faut une avant d'aligner :**

1. **Porter `docs/` et `scripts/` sur `main` d'abord.** Ils sont invisibles pour le visiteur, et la
   garde de build Netlify les exclut déjà : aucun déploiement déclenché. `recette` devient ensuite
   le miroir sans rien perdre. **C'est ce que je recommande.**
2. **Déplacer le plan de contrôle sur une branche dédiée** (`control/`), hors du cycle
   recette/prod.
3. **Assumer la perte**, l'archive faisant foi. Je le déconseille : on perdrait la traçabilité
   vivante au moment précis où le process s'installe.

## L'inventaire, chiffré

Base de comparaison : `main` et `recette` ont divergé le **2026-08-08** (`755ed1bf`).
**100 commits** côté `main`, **1005** côté `recette`.

| | fichiers |
| --- | --- |
| seulement sur `recette` | **934** |
| seulement sur `main` | **237** _(déjà en prod par définition)_ |
| communs mais différents | **353** |

## Le classement

### 1. Contrôle uniquement — **828 fichiers**, ne vont jamais en prod

340 plan de contrôle · 254 preuves QA · 101 outillage · 93 documentation · 33 tests · 7 divers.
C'est l'objet du point bloquant ci-dessus.

### 2. Déjà en prod — **102 fichiers**

Du back-office, modifié **seulement sur `main`** depuis la divergence : `recette` est en retard,
rien à porter.

### 3. La production fait foi — **69 fichiers visibles**

Modifiés **des deux côtés** : `a-propos.html`, `contact.html`, les pages `chauffagiste-*`,
`assets/hc-map-zones.js`, `assets/hc-live-stats.js`… Ce sont précisément les pages que les lots
récents ont corrigées en production. **Rien à reprendre de `recette`**, sauf décision explicite.

### 4. À vous présenter — contenu visible inédit, **165 fichiers**

Ils se regroupent en **cinq chantiers**, pas 165 décisions :

| chantier | ampleur | état |
| --- | --- | --- |
| **A. Canonique `www` → domaine nu** | **194 pages** en prod déclarent un canonique en `www.` ; `recette` : **0** | voir ci-dessous — **prêt** |
| **B. En-tête unifié** | `main` l'a sur **141** pages, `recette` sur **203** | extension à ~62 pages, **validation visuelle** |
| **C. Tunnel de demande** | `catalogue.html`, `hc-demande*.{js,css}`, `hc-cart.js`, `hc-fn-dispo.js` | **jamais déployé** : `/catalogue.html` répond **404** en prod |
| **D. Encart saisonnier** | `hc-promo-saison.{js,css}` | REQ-035, attend votre verdict visuel |
| **E. Contenu éditorial** | 2 pages `emploi/`, 5 pages `realisations/`, `recette.html` | jamais en prod |

#### Le chantier A mérite d'être traité tout de suite

La production déclare, sur **194 pages** :
`<link rel="canonical" href="https://www.depan59-62.fr/…">`
… alors que `https://www.depan59-62.fr/…` répond **301** vers `https://depan59-62.fr/…`.

**Chaque page dit donc à Google que son URL canonique est une URL qui redirige.** C'est un défaut
SEO réel, mesurable, et `recette` l'a déjà corrigé sur toutes ses pages. Reconstruit depuis le
`main` courant, c'est un lot mécanique, vérifiable page par page. **Classé « prêt à mettre en
prod », sur votre accord.**

### 5. Sensible — **~90 fichiers `supabase/`**

Migrations en attente, fonctions edge de production et de staging, dont les versions **durcies**
de `stripe-create-payment-link` et des fonctions d'écriture GitHub. Rien ne bouge sans un GO
nommément dédié, et cela recoupe REQ-001 et REQ-033.

### 6. Back-office inédit — **25 fichiers**

Modifiés seulement sur `recette`. À examiner séparément : ce n'est pas du visiteur.

### 7. Un correctif d'infrastructure qui n'est que sur `recette`

La garde de build Netlify :

- `main` : `git diff --quiet HEAD^ HEAD -- …`
- `recette` : `[ "$CACHED_COMMIT_REF" != "$COMMIT_REF" ] && git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF -- …`

La version de `main` compare **le commit précédent au commit courant**. C'est le piège qui a déjà
coûté un déploiement : un commit de tête ne touchant que des `.md` annule le build, et le HTML
poussé juste avant n'est jamais déployé. La version de `recette` compare au **dernier commit
réellement construit**. **À porter sur `main`**, c'est deux lignes et ça protège tous les lots à
venir.

## La procédure d'alignement, vérifiée

La remise à zéro forcée est bloquée par la protection de branche, et je ne la contourne pas. La
voie autorisée, testée à blanc :

```bash
git checkout recette
git read-tree -m -u origin/main     # l'arbre de travail devient celui de main
git commit -m "sync(recette): redevient le miroir de la production"
git push origin recette             # commit ordinaire, aucun force-push
```

Vérifié : l'arbre obtenu est **identique bit à bit** à celui de `main`. Reste à décider du sort du
plan de contrôle **avant** de l'exécuter.

## Ce que je propose, dans l'ordre

1. **Vous tranchez le sort de `docs/` et `scripts/`** — je recommande de les porter sur `main`.
2. Je porte le **correctif de la garde de build** sur `main` (deux lignes, protège la suite).
3. Je monte le lot **A — canonique** depuis le `main` courant, preuves à l'appui.
4. Vous arbitrez **B, C, D, E** sur présentation visuelle.
5. **Alors seulement**, j'aligne `recette` par la procédure ci-dessus.

Je n'ai rien aligné, rien supprimé, rien fusionné.
