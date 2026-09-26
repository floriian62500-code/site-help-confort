# Quatre décisions d'affichage — avant / après, et le risque

> Demandé par 5795806773 §6 : « Ne prends pas de décision produit à la place de Florian. Prépare
> seulement, pour chacune, un avant/après très court et le risque. Pas de changement tant que
> Florian n'a pas tranché. »
>
> **Aucune de ces quatre modifications n'a été faite.** Le site est aujourd'hui dans la colonne
> « Aujourd'hui ». Chaque ligne se décide en répondant oui ou non.

---

## 1. Bandeau de confiance sur les pages métier et locales

**Aujourd'hui — 26 pages** (`plombier-*`, `chauffagiste-*`, `electricien-*`, `serrurier-*`,
`menuisier-*`, `vitrier-*`, `volets-*`, `pmr-*`, `travaux-*`), une bande sous l'en-tête :

> 🏆 Certifié · Entreprise qualifiée — 📄 Devis simple sous 24 h ouvrées · Gratuit, sans engagement —
> 👨‍🔧 Techniciens salariés · Diplômés et formés HC — 📞 Standard ouvert · Lun-Ven 9 h-17 h · Sam 9 h-16 h

**Si on masque** (c'est ce que faisait la branche `staging`, via une classe sur `<body>`) : la page
démarre directement sur le contenu métier, sans cette bande.

**Le risque, des deux côtés.** La garder : elle répète des informations déjà présentes plus bas et
allonge le chemin jusqu'au contenu ; elle porte aussi deux engagements datés (devis sous 24 h
ouvrées, horaires du standard) qu'il faut tenir. La retirer : on perd quatre arguments de confiance
au-dessus de la ligne de flottaison, là où ils travaillent le plus.

**Coût technique** : nul dans les deux sens, une classe sur 26 pages, réversible en un commit.

**Question** : on la garde, ou on la masque sur ces 26 pages ?

---

## 2. Newsletter et section « Nos outils » sur À propos

**Aujourd'hui** : la page `/a-propos.html` contient un bloc d'inscription à la newsletter et une
section « Nos outils » qui met en avant les six outils interactifs.

**Si on retire** : la page se termine sur l'équipe et l'histoire de l'agence.

**Le risque.** Les garder : le commit d'origine sur `staging` portait le motif « jamais demandé par
Florian » — donc deux blocs que personne n'a commandés occupent le bas d'une page de présentation.
Les retirer : plus aucune entrée vers la newsletter sur cette page (elle reste ailleurs si elle
existe ailleurs — à vérifier avant, je le ferai si tu dis oui), et les six outils perdent une vitrine.

**Coût technique** : nul, une page, réversible.

**Question** : on retire les deux, un seul, ou aucun ?

---

## 3. Délais annoncés sur les pages prestations

**Aujourd'hui**, 34 pages affichent une valeur sous « Délai d'intervention ». La majorité ne promet
rien de chiffré, une minorité engage :

| Ce qui est affiché | Pages | Nature |
|---|---|---|
| « Intervention rapide », « Délai rapide » | 21 | aucune promesse chiffrée |
| « En journée selon disponibilité », « Dans la journée », « 1 journée » | 4 | engagement souple |
| « Sous 48 h » | 4 | **engagement chiffré** |
| « Sous 24 h ouvrées », « Rappel sous 24 h ouvrées » | 2 | **engagement chiffré** |
| « Sous 2 h en journée ouvrée selon disponibilité » | 1 | **engagement chiffré, le plus serré** |
| « 2 à 4 semaines », « 1 à 3 semaines » | 2 | délai de chantier, plutôt rassurant |

**Le risque.** Les garder : ce sont des engagements publics ; s'ils ne sont pas tenus, c'est un motif
de réclamation, et c'est exactement ce que la branche `staging` cherchait à supprimer en juin (la
page portait alors « Intervention en 1 h », formulation qui n'existe plus nulle part aujourd'hui).
Les adoucir : on perd un argument de réactivité, et « Intervention rapide » ne dit plus rien de
concret au client.

**`NEEDS_FLORIAN_CONFIRMATION` — la mention « Sous 2 h en journée ouvrée ».**
C'est l'engagement le plus fort du site, et il est public. Tant qu'il n'est pas **explicitement
confirmé** par Florian, il reste signalé comme tel : ni supprimé de ma part, ni considéré comme
validé. Les autres engagements chiffrés (« Sous 48 h », « sous 24 h ouvrées ») appellent la même
confirmation, avec moins d'urgence.

**Ce que je ne peux pas décider** : si ces délais sont tenus. Toi seul le sais.

**Coût technique** : faible, une reformulation ciblée sur 7 pages au plus.

**Question** : ces engagements sont-ils tenus ? Si non, dis-moi lesquels reformuler.

---

## 4. Le CMS « éditer mon site » (WYSIWYG)

**Aujourd'hui** : le fichier `assets/hc-edit-mode.js` est dans le dépôt, identique à la version de
`staging` — mais **aucune page ne le charge**. La fonctionnalité est posée à moitié : le moteur
existe, la porte n'est pas branchée. L'écran `admin-pro/valider-staging.html` est là également,
sans lien entrant.

**Deux issues possibles.**

**a) Le câbler proprement.** Il faut alors l'encadrer, car éditer le site en ligne veut dire écrire
dans le dépôt depuis un navigateur : authentification du personnel, jeton côté serveur, liste
blanche de dépôt et de branche, journal. C'est précisément ce que fait le patch préparé pour
`gh-push-inline` et `gh-edit-file` (`docs/security/DECISION-FONCTIONS-GITHUB-2026-09-23.md`). Sans
ce patch, brancher le CMS reviendrait à ouvrir une écriture GitHub depuis le navigateur.

**b) Le retirer.** Le fichier part, et les deux fonctions d'écriture GitHub encore utilisées perdent
leur principal appelant : elles deviennent à leur tour candidates à la suppression. Le sujet se
referme complètement.

**Le risque.** Le laisser dormant est la seule option à écarter : un moteur d'édition non branché
mais présent finit par être rebranché sans les garde-fous, ou par être supprimé sans qu'on sache
ce qu'il servait.

**Question** : on le câble (avec le durcissement), ou on le retire ?

---

## Récapitulatif

| # | Sujet | Aujourd'hui | Ce que je ferais sur ton « oui » | Réversible |
|---|---|---|---|---|
| 1 | Bandeau de confiance | visible sur 26 pages | le masquer par une classe | oui |
| 2 | Newsletter + « Nos outils » | sur À propos | retirer les blocs | oui |
| 3 | Délais annoncés | 7 pages avec engagement chiffré, dont « Sous 2 h en journée ouvrée » → `NEEDS_FLORIAN_CONFIRMATION` | reformuler celles que tu désignes | oui |
| 4 | CMS WYSIWYG | présent, non branché | le câbler avec le patch, **ou** le retirer | oui |

Rien ne bouge avant ta réponse.
