# Inventaire des tests rouges — `main` c4f009a3 — 2026-10-09

> Réponse au P0 process de `CHATGPT-2026-10-09-APRES-PR60-61-BACKLOG-AUTONOME.md`.
> Mesuré dans un **worktree jetable** (la suite écrit dans l'arbre), suite par suite, sur la
> production actuelle. Rien n'est corrigé dans ce document : il sert à découper les lots.

## Correction du chiffre : ce n'est pas 45, c'est 51 — et 5 suites ne tournent pas du tout

J'avais annoncé « 9 suites / 45 contrôles ». **Ce comptage était faux**, et je le corrige : je comptais
les lignes de verdict `N PASS / N FAIL`, or **5 suites n'en produisent aucune parce qu'elles plantent**.
Le comptage par assertion donne :

```
suites exécutées                 31
assertions en échec              51      (sur 10 suites)
suites qui plantent (ENOENT)      5      dont 3 sans produire la moindre assertion
```

`ads-landing` à elle seule porte **10 échecs** qui n'apparaissaient pas dans mon chiffre.

## La cause : un portage incomplet, pas une dégradation

Les dix gardes sont arrivées **le même jour**, le 2026-10-06, par un seul commit : `1c54c89d`
« Merge PR #37: port control and QA tooling ». Mesuré à ce commit : **24 échecs**, et deux suites qui
plantaient déjà. Elles ont donc été **portées rouges**, avec les fichiers dont elles dépendent restés
derrière. Ce n'est pas un outillage qui s'est dégradé : c'est un outillage livré sans son contenu.

Les 5 plantages le disent sans ambiguïté — chacun est un `ENOENT` sur un fichier absent :

| suite | fichier attendu, absent du dépôt |
|---|---|
| `derive-release` | `.github/workflows/tests.yml` — **le workflow qui ferait tourner la suite n'existe pas** |
| `deploy-allowlist` | `supabase/functions/DEPLOIEMENT.json` |
| `lead-cycle` | `supabase/functions/lead-auto-reply/index.ts` |
| `recrutement` | `data/offres-emploi.json` |
| `ads-landing` | `supabase/_pending_migrations/20260919100000_catalogue_entretien_poele_insert.sql` |

La garde qui vérifie que la suite tourne en CI **plante parce qu'il n'y a pas de CI**. C'est le nœud :
tant qu'aucun workflow ne lance ces tests, leurs constats restent des défauts en production que tout
le monde croit couverts. C'est exactement ce qui est arrivé à la page menuiserie (PR #61).

## Inventaire par lot cible

Sévérité : **P1** = visible par un visiteur ou un moteur · **P2** = dette interne · **P3** = garde à réparer.

### Lot A — dépôt servi au public (2 échecs) · **P1** · faisable seul

| assertion | fichiers | constat vérifié en production |
|---|---|---|
| les notes de travail de la racine ne sont pas servies | `/CLAUDE.md` `/POUR-FLORIAN.md` `/BUGS-HISTORY.md` `/TODO.md` `/ALERTES.md` | **les 5 répondent 200 sur `depan59-62.fr`**, ~72 ko de notes internes |
| aucun dossier suivi n'échappe aux règles de blocage | `.helpconfort`, `admin`, `automatisation conversation` | `/admin/` répond 200 (back-office Decap, attendu) ; `.helpconfort` 404 |

Vérifié : **aucune clé ni jeton complet** dans ces fichiers — les correspondances sont des noms de
variables (`SERVICE_ROLE`, `password`) et une mention explicite d'un jeton **révoqué**. Ce n'est donc
pas une fuite de secret, mais de l'historique d'incidents et des consignes internes servis sur le
domaine commercial. `robots.txt` bloque `/*.md$` : les moteurs ne devraient pas les indexer, mais
cela ne protège rien de quelqu'un qui a l'URL.

### Lot B — données structurées et sitemap (7 échecs) · **P1 / P2** · faisable seul

| assertion | fichier | sévérité |
|---|---|---|
| 554 blocs JSON-LD, aucun invalide | `prestations/debouchage.html` — **bloc 3 malformé** (`"nEntity":[},{`) | P1 |
| aucun nœud « établissement » hors de l'identité de la page | 5 pages `chauffagiste-*` | P1 |
| la description d'entité suit la page, jamais celle d'un autre métier | 45 pages gouvernées, dont `chauffagiste-*`, `depannage-*` | P1 |
| les pages de la campagne entretien figurent dans le sitemap | `/prestations/ramonage.html` absente | P1 |
| la source de la fonction sitemap vise l'hôte canonique | fonction edge `sitemap` | **P2 — déploiement, GATE** |
| aucune source de sitemap ne contient l'hôte qui redirige (www) | idem | **P2 — GATE** |
| l'écart source/déployé est signalé dans le fichier | idem | P2 |

Même famille que le défaut n° 2 de la PR #61 : le texte visible est juste, les données structurées non.

### Lot C — Réalisations (9 échecs) · **P1** · = tâche 7

Classement partagé non chargé avant la vitrine, annonce de recrutement présentée comme un chantier,
carte dont l'image annule le clic, cartes sans lien, styles et focus perdus, galerie avant/après.
Fichiers : `realisations.html`, `index.html`, `avant-apres.html`, `actualites.html`, + 29 pages.

### Lot D — campagne entretien / ramonage (25 échecs) · **P1** · **contient des gates**

`canonical-pages` (15) et `ads-landing` (10) décrivent **un plan jamais exécuté** : élargir l'intention
de `/prestations/ramonage.html` au poêle / insert, supprimer la landing autonome, poser les 301.

**Trois de ces attentes heurtent les consignes permanentes** — « aucune 301, aucune suppression de
page » :

- `landing autonome supprimée du dépôt` → `entretien-chaudiere.html` existe encore (il répond déjà
  **301** en production, donc la redirection est posée mais le fichier reste) ;
- `redirection permanente prête, avec et sans .html` ;
- `redirections permanentes vers la section canonique`.

Je ne les touche pas sans GO. Le reste du lot (contenu de la page ramonage, barème lisible en 390,
données structurées, maillage) est faisable seul — **sous réserve de la tâche 19** : `ads-landing`
attend des prix (115 €, TVA 10/20 %) que je dois d'abord adosser à la source canonique.

### Lot E — actualités (5 échecs) · **P2 / P3** · faisable seul

| assertion | nature |
|---|---|
| `corpus : 21 actualités, dont 0 chantiers` | le corpus attendu ne correspond plus au contenu réel |
| `liste : une publication = une seule carte` | doublon d'URL |
| `sitemap : plus de branche qui publierait /actualites/<slug>.html` | source du doublon |
| `des couples sont déclarés (0)` ×2 (`actualites-couples`, `actualites-generateur`) | **la garde exige que son propre jeu d'entrée ne soit pas vide** : avec 0 couple légitime, c'est la garde qu'il faut corriger, pas le site |

### Lot F — fonctions edge (2 échecs) · **P1** · **GATE Supabase**

**36 fonctions déployées n'ont aucune source dans le dépôt** : ni relecture, ni revue, ni retour
arrière — la même famille que les deux fonctions Stripe rapatriées en PR #60. Parmi elles
`lead-auto-reply` (qui fait planter `lead-cycle`), `send-email-notification`, `promote-to-prod`,
`gh-push-*`, `sync-google-ads`. Rapatrier leurs sources demande un accès lecture Supabase : **je le
prépare, je ne déploie rien**.

### Lot G — maillage (1 échec) · **P2** · faisable seul

`prestations/ramonage.html`, `guide-entretien-chaudiere.html`, `blog-entretien-chaudiere-annuel-obligatoire.html`
(cette dernière : **aucun** lien vers le groupe). Dépend du lot D pour la page ramonage.

### Lot H — gardes à réparer (5 plantages) · **P3** · faisable seul, sauf un

Les 5 `ENOENT` ci-dessus. Quatre se réparent en rendant la garde tolérante à l'absence du fichier
(et en le disant), ou en fournissant le fichier. Le cinquième, `recrutement` → `data/offres-emploi.json`,
touche les **offres CDI, en HOLD** : la garde doit ignorer proprement l'absence du fichier, pas le créer.

## Ordre proposé

1. **Lot A** — c'est servi au public, et c'est deux lignes de `_redirects`.
2. **Lot H** — une suite qui plante ne garde rien ; les réparer rend l'inventaire fiable.
3. **CI** — poser `.github/workflows/tests.yml` pour que la suite tourne à chaque PR. Sans ça, tout
   le reste se re-dégradera. C'est la seule mesure qui empêche la répétition.
4. **Lot B**, puis **E**, puis **G**, puis **C** (= tâche 7).
5. **Lot D** après la tâche 19 (prix), et sans les trois points sous gate.
6. **Lot F** en préparation seulement.

## Règle tenue

Aucune assertion ne sera supprimée ni affaiblie pour passer au vert. Quand une garde se trompe (lot E,
lot H), je corrige **la garde**, en écrivant pourquoi dans le test.
