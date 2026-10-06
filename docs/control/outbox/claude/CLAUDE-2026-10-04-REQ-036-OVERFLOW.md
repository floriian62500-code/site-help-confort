# REQ-20260926-036 — la page tient dans l'écran à 390, et le coupable n'était pas celui annoncé

message_id: CLAUDE-2026-10-04-REQ-036-OVERFLOW
repond_a: ordre Florian du 2026-10-04 (priorité conversion Chauffage jusqu'à la production)
date: 2026-10-04
verdict: **PASS**

## 1. REQ-037 vérifiée en production

Fusion `a7b91f61995bb8cb4003bee43b21626259e23daf` (parents `96e75d88` + `176c28d1`, le head
exact que j'avais prouvé). Mesuré sur **`depan59-62.fr`**, artefacts dans `docs/qa/REQ-037-prod/` :

| surface | 1440 | 390 |
| --- | --- | --- |
| page Chauffage | **14,30 € TTC / mois** · _soit 13 € HT par mois_ | idem |
| page Contrats | **14,30 € TTC / mois** · _171,60 € TTC par an · soit 13 € HT par mois_ | idem |
| modale | **« 14,30 € TTC/mois (13 € HT) — 171,60 € TTC/an »** | idem |
| même TTC sur les 3 surfaces | **oui — 14,30 € partout** | **oui** |
| parcours | URL `?energie=gaz&formule=confort#formules`, radio `en-gaz`, CONFORT en avant | idem |

Aucune écriture réseau, aucun lead, console sans erreur imputable au site.
Je ne pose pas `PROD_VERIFIED` : les mesures sont là, le verdict appartient à ChatGPT.

## 2. REQ-036 — correction, et une correction de mon propre diagnostic

**Mes rapports précédents attribuaient les 452 px au carrousel de logos fournisseurs. C'est faux.**
`.hcf-track` fait bien 2304 px, mais il est découpé par `.hcf-marquee`, en `overflow-x: hidden` :
un élément découpé n'élargit pas la page. Je m'étais arrêté à l'élément le plus large sans vérifier
qu'il contribuait réellement.

La bissection du DOM — on masque un nœud, on remesure `scrollWidth` — donne les vraies causes :

| page | avant | cause réelle | correctif |
| --- | --- | --- | --- |
| Chauffage | **+452 px** | `.m-proof-col` est un élément de grille à taille minimale automatique ; le **carrousel d'avis Google** (`.hcal-grid`, 3 cartes de 250 px = 778 px) fixe donc sa largeur minimale à 778 px | `min-width: 0` |
| Contrats | **+90 px** | même mécanisme sur `.hc-labels-grid`, plus un mot insécable pour les 6 derniers pixels | `min-width: 0` + `overflow-wrap: anywhere` |

### Résultat, mesuré

| | avant (production) | après (PR #27) |
| --- | --- | --- |
| Chauffage **390** | **452 px** | **0 px** |
| Contrats **390** | **90 px** | **0 px** |
| Chauffage 1440 | 0 px | **0 px** |
| Contrats 1440 | 0 px | **0 px** |

Objectif `scrollWidth - innerWidth <= 1 px` : **atteint, à 0 px**, sur les deux pages.

### Rien n'est cassé

| | avant | après |
| --- | --- | --- |
| carrousel d'avis à 390 | 778 px de large, **non défilable** (il élargissait la page) | **302 px, défilable**, 3 cartes |
| carrousel fournisseurs | marquee 350 px, piste 2304 px, 36 logos | **identique** |
| formules | BASIC 9,90 / CONFORT 14,30 / SÉCURITÉ 25,30 € TTC | **identiques**, sur les deux pages |
| cartes labels | 4 | **4** |
| modale | ouverte, 14,30 € TTC | **ouverte, 14,30 € TTC**, carte `[20→370]` dans `0→390` |
| desktop 1440 | — | **aucune régression**, 0 px sur les deux pages |

Le carrousel d'avis **retrouve son rôle** : il défile dans son bloc au lieu d'élargir la page.
C'était le comportement voulu, empêché par la taille minimale automatique de la colonne.

### Périmètre, console, envois

- **2 fichiers, 2 déclarations CSS** : `chauffagiste-saint-omer.html`, `contrats-entretien.html` ;
- console : **aucune erreur imputable au site**, 4 passages ;
- **aucune écriture réseau**, aucun lead : la modale est ouverte, jamais soumise ;
- aucune mutation Supabase, RLS, auth, paiement, DNS.

### Ce que je n'ai pas élargi

Le même motif existe sur **25 autres pages métier** (`.m-proof-col`) et **13 autres pages ville**
(`.hc-labels-grid`). L'ordre portait sur Chauffage et Contrats : je m'y tiens et je le signale,
plutôt que d'ouvrir un diff de 38 fichiers sans mandat.

## Lot

| | valeur |
| --- | --- |
| branche | `feat/req-036-overflow-390`, isolée depuis `main` `a7b91f61` |
| PR | **#27**, brouillon |
| head exact | `29ab676f98e1a6bf7705771d9230c0c8b4f7a424` |
| preview | https://deploy-preview-27--remarkable-dragon-364e2b.netlify.app |
| preuves | `docs/qa/REQ-036/` — reproducteur, `mesures.json`, `MESURES-REQ-036.md`, 12 captures avec empreintes |

## Rollback

- PR #27 **non fusionnée** : abandonner la branche suffit.
- **Si fusionnée** : `git revert <SHA_DU_MERGE_PR27>` puis redéploiement. Deux déclarations CSS
  reviennent en arrière, rien d'autre. Aucune suppression, aucune 301.
- Checkpoints intacts.

## 3. STOP

Je m'arrête. Je ne fusionne pas.

## 4. REQ-038, prête à démarrer

Le diagnostic est déjà fait et chiffré : sur `/nos-prestations.html`, l'appel
`…/v_services_public?select=*&_ts=1791127911925` part en **400 PGRST100** parce que PostgREST lit
`_ts` comme un filtre sur une colonne inexistante ; un second appel sans `_ts` répond 200 avec 34
lignes, d'où un affichage correct et un aller-retour perdu par visite. Le correctif tient en une
ligne. **Je l'engage dès que la PR #27 est fusionnée**, pour ne pas laisser deux lots ouverts sur
le même `main`.
