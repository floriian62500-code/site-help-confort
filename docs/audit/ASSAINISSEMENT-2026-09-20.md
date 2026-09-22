# Assainissement du dépôt — 2026-09-20

> Dernière phase de la directive `5732805778`.
> Méthode imposée : **AUDIT → preuve d'inutilité/duplication → correction → tests → commit atomique → suite.**
> Rien n'a été supprimé sans preuve d'usage nul ; tout est récupérable dans l'historique git.

## L'outil de preuve

```bash
node scripts/audit/inventaire.mjs          # rapport lisible
node scripts/audit/inventaire.mjs --json   # rapport machine
```

Il compte les **usages réels** : assets chargés par des pages, images citées, liens entrants,
présence au sitemap, redirections, appels de fonctions edge, scripts cités ailleurs, et sélecteurs
CSS cassés. C'est la base de toutes les décisions ci-dessous.

| Mesure | Avant | Après |
|---|---|---|
| sélecteurs CSS cassés | **1 901** sur 155 pages | **0** |
| images sans aucun usage | 57 | 4 (conservées volontairement) |
| assets sans aucun usage | 1 | 1 (capacité non câblée, conservée) |
| fonctions edge sans source dans le dépôt | 4 | 1 (`partner-logo`, à récupérer) |
| scripts jamais cités | 79 | 22 (54 archivés, le reste utile) |
| poids du dépôt | — | −9,3 Mo |

## Ce qui a été corrigé

### 1. 1 901 sélecteurs CSS rétablis (`ca5f584c`)

Le **2026-05-15**, le commit `3e50ad42` (« Auto-push », sans message) a minifié les styles inline de
plus de 40 pages **en perdant les espaces des sélecteurs descendants** : `.a .b` est devenu `.a.b`,
donc plus aucune de ces règles ne s'appliquait. Effet visible quatre mois durant : boutons rendus en
texte brut, cartes sans style, accroches plates — sur les pages locales, métier, processus,
sinistres, zones d'intervention et recrutement.

Correcteur : `scripts/seo/fix-compound-selectors.mjs`. Il ne touche un sélecteur que si
**(1)** aucun élément de la page ne porte les deux classes **et (2)** aucune des deux n'est posée par
du JS (`classList`, `className`, gabarits `innerHTML`) ni ne ressemble à un état (`is-*`, `active`…).
Il traite aussi `a:hover.ic` et les chaînes `.a.b.c`. Mode `--check` pour la QA.

**Preuve d'absence de régression** : balayage des 210 pages × 4 largeurs (1440, 1024, 768, 390),
840 mesures, **0 débordement**.

La version actuelle de `minify-inline-styles.py` **ne reproduit pas** le défaut (vérifié) : l'outil
exact reste inconnu, d'où le garde-fou permanent dans la QA.

### 2. Trois fonctions edge sans source, récupérées (`279f8cf7`)

`realisations-json` (29 appels : vitrine d'accueil et page Réalisations), `communes-list`
(composant « Zone d'intervention »), `gh-push-inline` (édition WYSIWYG) tournaient en production
**sans aucune source dans le dépôt** : en cas de perte, rien à redéployer. Sources récupérées en
lecture depuis la production et versionnées telles quelles, avec un en-tête qui le dit.
Aucun déploiement : c'est une décision humaine.

### 3. 53 images orphelines supprimées (`1710e936`, −9,3 Mo)

Preuve en trois temps : aucune citation dans le dépôt, **et** les logos affichés viennent d'URL
externes (`suppliers.logo_url`, `partners.logo_url`), **et** les visuels de prestations viennent du
stockage Supabase (`services.image_url`) — vérifié en base, précisément parce que c'est le piège
classique. Liste conservée : `docs/audit/orphelins-supprimes-20260920.txt`.
Conservés : `admin-pro/comm-packs/` (matériel de Florian) et `og/` (images Open Graph).

### 4. 54 scripts « one-shot » archivés (`a8c27203`)

Déplacés (jamais supprimés) dans `scripts/legacy/`, avec un README qui explique comment les lire et
pourquoi ne pas les relancer. Restent à la racine les outils encore utiles.

### 5. Documentation mainteneur (`43663ee4`)

`docs/maintainer/` existait : la doc a été **étendue là**, pas dupliquée ailleurs (même règle que
pour les pages). Onze documents, dont un guide **« Où modifier quoi »** et un
**TROUBLESHOOTING** des pièges qui ont déjà coûté du temps. `CLAUDE.md` y renvoie.

## Ce qui reste — et pourquoi je n'y ai pas touché

| Sujet | Constat | Pourquoi c'est en attente |
|---|---|---|
| `stripe-create-payment-link` | fonction **publique**, montant fourni par l'appelant, clé Stripe de **production** | durcir = modifier et **déployer** une fonction edge : décision humaine ([PAYMENTS.md](../maintainer/PAYMENTS.md)) |
| `gh-push-inline` / `gh-edit-file` | relais d'écriture GitHub **publics** (jeton fourni par l'appelant) | idem ; leur appelant `hc-edit-mode.js` n'est plus chargé par aucune page |
| policy `leads_public_insert` | insertion anonyme directe dans `leads` (contourne la validation) | migration de durcissement proposée, **non appliquée** (écriture en base = décision humaine) |
| `/actualites/<date>-<slug>` ↔ `/realisations/<slug>` | mêmes publications rendues **deux fois**, chacune avec son canonical | décision éditoriale + correction de deux générateurs ; documenté dans `docs/seo/pages-canoniques.json` |
| `/fournisseur.html`, `/partenaire.html` | gabarits de fiche détail listés tels quels au sitemap (H1 = variable non remplie) | à retirer du sitemap = déploiement de la fonction `sitemap` |
| `plan-du-site.html` | aucune page n'y renvoie | décision : le relier depuis le pied de page, ou le retirer |
| Branche `staging` | 62 commits WYSIWYG jamais fusionnés | tri à faire avec Florian, avec tag de sauvegarde |
| `assets/hc-demande-launch.js` | capacité existante **non câblée** : les liens `/catalogue…` ouvriraient la fenêtre premium au lieu de quitter la page | c'est un changement de comportement visible : à décider, pas à glisser dans un nettoyage |
| `partner-logo` | 4ᵉ fonction edge sans source dans le dépôt | à récupérer comme les trois autres |

## Contrôles passés après chaque étape

`canonical-pages` 20/20 · `recrutement` 41/41 · `ads-landing` 31/31 · `contrats` 31/31 ·
`consent` 8/8 · `home-promo` 8/8 · `back-nav` 12/12 · `realisations` 15/15 · `demande-v2` 165/165 ·
`lead-cycle` 67/67 · `price-gate` 29/29 · `hc-cart` 12/12 · `header` 15/15 · `autopush` 14/14 ·
SEO `ERRORS=0` · sélecteurs cassés `0` · balayage 210 pages × 4 largeurs : **0 débordement**.
