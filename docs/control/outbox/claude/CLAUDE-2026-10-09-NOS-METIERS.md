# CLAUDE-2026-10-09 — Lot « Nos métiers » : PR #61

> Reconstruit depuis le `main` courant **919f828c**, pas depuis les anciennes PR.
> Branche `fix/nos-metiers-vitrine@f19f94a6`. Preview verte, vérifiée en **1440** et **390**.
> Quatre correctifs, **un commit chacun**. Aucun merge, aucune 301, aucune suppression, navigation inchangée.

## Ce que l'audit devait trouver, et ce qu'il a trouvé

Le lot visait la vitrine `/nos-metiers.html`. Elle avait bien les défauts attendus. Mais en ouvrant la
suite de tests du dépôt, **elle était déjà rouge sur `main`** — et l'un de ses constats décrivait,
depuis le **25 septembre**, un défaut jamais repris. C'est le vrai sujet de ce lot.

## 1. La vitrine annonçait 8 métiers et en présentait 9

Faux dans **quatre surfaces à la fois** : H1, `og:description`, `twitter:description`, description
JSON-LD — pendant que la liste structurée comptait bien ses 9 entrées. Le chapeau annonçait des
**peintres** (métier absent de la page) et oubliait travaux, volets et PMR.

Deux manques en plus, sur une page publique et indexée :
- **aucun chemin vers le tunnel canonique** (téléphone uniquement) → « Décrire ma demande en ligne » ;
- **la couche d'événements sans bandeau ni chargeur GA4** : rien n'était mesuré, et le visiteur
  n'avait aucun choix à faire. Paire des pages d'arrivée rétablie.

Données structurées : deux agences nommées. Corrigé ici ; **78 autres pages** relevées pour le lot doctrine.

## 2. Huit pages annonçaient à Google le métier d'une autre

`menuisier-saint-omer` portait l'accroche du vitrier — constat du 25/09, page jamais reprise. En la
regardant entièrement, **trois métiers y cohabitaient** :

| surface | ce qu'elle disait |
|---|---|
| texte visible | menuiserie ✅ |
| accroche + 3 descriptions de partage | bris de glace, double vitrage |
| catalogue d'offres JSON-LD | celui du vitrier, relabellisé `Menuiserie` |
| carte de partage | `og/vitrier-saint-omer.png` |
| `serviceType` | `GlassCompany` |
| **fiche business** | **« HELP Confort — Plombier Saint-Omer »** |

Cette fiche de plombier était posée sur **8 pages** : menuiseries ×2, vitreries ×2, volets ×2, PMR ×2.
Chacune porte maintenant son métier, avec des offres prises dans ce qu'elle présente vraiment.
Carte de partage des menuiseries → carte générique : `og/menuisier-saint-omer.png` n'existe pas, et
montrer la vitrerie était pire. **Une carte menuiserie reste à produire.**

## 3. La Plomberie avait disparu de 14 pieds de page

Sur chauffage, électricité, serrurerie et travaux, la première entrée pointait vers la plomberie mais
portait le nom du métier de la page. La Plomberie n'était plus listée, et un second lien « Chauffage »
ou « Serrurerie » menait à la plomberie. Les 131 autres pieds disent « Plomberie » : libellé rétabli.

## 4. L'encart saisonnier recouvrait la première carte

En 1440, « Avant l'hiver » masquait presque entièrement la carte Plomberie. La règle de cohabitation
de la PR #57 ne connaissait que `.ctp, .m-contrats-premium` ; elle connaît maintenant `.nm-grid`.
Empreinte du module changée → **205 pages repropagées** (`?v=a7b333fb47` → `?v=2efa133967`), une seule
ligne par page. Sans ce bump, le cache d'un an gardait l'ancien module : c'est le piège vu 4 fois.

## Le constat de fond : la suite est rouge sur la production

Mesuré sur `919f828c` puis sur la branche, **dans deux worktrees jetables** (la suite salit l'arbre) :

```
main 919f828c    9 suites rouges,  45 contrôles en échec
cette branche    8 suites rouges,  41 contrôles en échec    (pages-metier : 54/4 → 69/0)
```

Les 41 restants échouent **à l'identique** sur `main` : aucune régression de mon fait. Mais c'est la
cause du défaut n° 2 — le contrôle avait vu la menuiserie le 25 septembre, et la page est restée en
production quinze jours de plus. **Une garde que personne ne lance ne garde rien.** Je propose que la
suite tourne à chaque PR ; c'est une décision de process, pas une correction de code.

## Relevé, non corrigé (lots distincts, un REQ par commit)

| constat | mesure |
|---|---|
| pages chargeant `hc-tracking.js` sans bandeau **ni** chargeur GA4 | **47** — elles ne mesurent rien ; pas une fuite RGPD, sans `tracking.js` les événements n'atteignent aucun réseau |
| garde `consent.test.mjs` aveugle | elle teste `assets/tracking.js` et **ignore `assets/hc-tracking.js`** : verte sur 61 pages, n'en voit pas 113 |
| « HELP Confort Saint-Omer & Dunkerque » en données structurées | **78 pages** |
| `contrats-entretien.html` | `hc-consent.js?v=20260919a` quand les 65 autres sont en `?v=20261007` |
| `og/menuisier-saint-omer.png` | inexistant (seule famille métier sans carte propre) |

**Non retenu après vérification** — « 5 métiers, 1 seule équipe » sur 12 pages locales : la liste qui
suit en compte exactement cinq. Accroche locale délibérée, pas une incohérence.

## Preuves

| | |
|---|---|
| base | `main` 919f828c |
| tête | `fix/nos-metiers-vitrine` f19f94a6 — **PR #61** |
| preview | `deploy-preview-61--remarkable-dragon-364e2b.netlify.app` → Deploy Preview ready |
| 1440 | H1 « Nos 9 métiers », 9 cartes, 1 CTA tunnel, encart `opacity 0` / `pointer-events none`, carte atteignable |
| 390 | `scrollWidth == clientWidth == 390`, 0 élément débordant, 9 cartes |
| JSON-LD | 8 pages revalidées, 0 bloc invalide |
| en-tête partagé | 204 pages, 0 à mettre à jour |
| gardes | `pages-metier` **69 PASS / 0 FAIL** (+11 contrôles), vérifiées mordantes : 3 tombent d'un coup |

## Statut

- REQ-20260926-060 → **READY_FOR_CONTROL** (PR #61). Je ne mets jamais CLOSED moi-même.
- Navigation inchangée : `/nos-metiers.html` reste **orpheline du menu**. L'y ajouter est un changement
  de navigation → **décision Florian**. Elle est dans les deux sitemaps, donc indexable : c'est pour ça
  que le chiffre faux comptait.
- Je continue : cartes prestations, puis doctrine agence unique, Réalisations, routage email, Decap.
