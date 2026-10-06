# REQ-20260926-041 — le site ne se contredit plus : une agence, des pôles

message_id: CLAUDE-2026-10-06-REQ-041-UNE-AGENCE
repond_a: ordre Florian du 2026-10-06 (doctrine déjà validée, corriger puis prouver)
date: 2026-10-06
verdict: **PASS** — et un constat de fond qui dépasse la demande

## 1. REQ-040 vérifiée en production

Fusion `5d475d3813b3efe60117eacdb2c64c8663ed05c7`. Mesuré sur `depan59-62.fr/a-propos.html`,
en 1440 et en 390 : l'appel `stats_publiques` passe de **401** à **200**, et la console ne porte
plus aucune erreur imputable au site — seul subsiste un avertissement de préchargement de police,
préexistant et sans effet. `PROD_VERIFIED` à poser.

## 2. REQ-041 — le lot

| | valeur |
| --- | --- |
| branche | `feat/req-041-une-seule-agence`, depuis le `main` courant |
| PR | **#31**, brouillon |
| head | `a1ab8ff9f4323b54d05affb164e11afa3175164e` |
| périmètre | **29 fichiers**, 37 lignes |

### Le relevé, avant et après, sur les 117 pages servies

| | avant (production) | après (PR #31) |
| --- | --- | --- |
| pages portant une affirmation incohérente | **27** | **0** ✅ |
| exclusions assumées | 4 | 3 |

Reproducteur versionné : `docs/qa/REQ-041/releve.mjs`, relevés `req041-avant.json` et
`req041-apres.json`. Le relevé ignore le contenu des `<script>` : il ne regarde que ce que le
visiteur lit.

### Ce qui a été corrigé

| avant | après | pages |
| --- | --- | --- |
| « Deux agences locales, techniciens du secteur. » | « Une agence à Saint-Omer, des techniciens du secteur. » | 7 |
| « Deux agences locales couvrent plus de 220 communes » | « Notre agence de Saint-Omer couvre plus de 220 communes » | 7 |
| « Depuis nos agences Dépan'Audo (Saint-Omer) et Dépan'DK (Dunkerque) » | « Depuis notre agence Dépan'Audo (Saint-Omer) et nos pôles d'intervention » | 18 |
| « **2** agences locales » (statistique) | « **4** pôles d'intervention » | 1 |
| « 2 agences locales (Dépan'Audo & Dépan'DK) couvrent » | « une agence à Saint-Omer (Dépan'Audo) et nos pôles d'intervention couvrent » | 1 |
| « Deux agences : Saint-Omer et Dunkerque. » | « Une agence à Saint-Omer, un pôle d'intervention à Dunkerque. » | 1 |

Équilibre des balises vérifié fichier par fichier, avant et après : **aucun fichier dont
l'équilibre change**.

### Les trois exclusions, assumées

- **`a-propos.html`** — 7 occurrences, dont **une citation entre guillemets** et le récit
  d'entreprise qui l'entoure. On ne réécrit pas une citation, et la narration de la société est
  éditoriale : elle vous revient.
- **`reseau-help-confort.html`** — « 100+ agences locales **en France** » parle du réseau
  national. C'est vrai, ça reste.
- **`plan-du-site.html`** — un libellé de navigation « 🏢 Nos agences » qui liste
  `agence-saint-omer.html` **et `agence-dunkerque.html`**. Ce qui m'amène au point suivant.

## 3. Le constat de fond : ce n'est pas qu'une affaire de formulation

En corrigeant, j'ai vérifié les mentions légales. Elles déclarent **une seule entité** :

> SARL **Dépan'Audo**, nom commercial HELP Confort Saint-Omer, siège 242 route de Boulogne,
> 62500 Saint-Martin-lez-Tatinghem, SIRET 89819615900013, SIREN 898 196 159.

Aucune seconde entité, aucune adresse à Dunkerque, aucun second SIRET.

Or le site publie une page **`agence-dunkerque.html`**, servie en **200**, intitulée « Agence HELP
Confort Dunkerque — Dépan'DK (59140) », avec ses **horaires d'ouverture**, une fiche
**schema.org `Plumber`** — donc lue par Google comme un établissement — et la mention
« Informations légales : Forme : Dépan'DK, **SIREN : 898 196 159** ».

**C'est le même SIREN que Dépan'Audo.** « Dépan'DK » n'est donc pas une société distincte : c'est
la même entité, présentée comme une agence séparée, avec sa propre page, ses horaires et sa fiche
d'établissement local. Le nom apparaît sur **152 pages**.

Les 29 fichiers de ce lot corrigent **les phrases**. Ils ne corrigent ni cette page, ni sa fiche
structurée, ni les 152 mentions de la marque. **Je ne le fais pas de ma propre initiative** : c'est
une décision d'architecture de marque, avec une dimension légale et SEO — on publie une fiche
d'établissement pour une implantation que les mentions légales ne déclarent pas.

**Trois issues possibles, à votre choix :**
1. **Dunkerque est un vrai établissement** → il manque son adresse et sa déclaration dans les
   mentions légales ; c'est là qu'il faut corriger, pas dans les phrases.
2. **Dunkerque est un pôle d'intervention** → la page `agence-dunkerque.html` doit cesser de se
   présenter comme une agence, sa fiche schema.org doit tomber, et « Dépan'DK » devient un nom
   d'équipe, pas d'agence.
3. **Statu quo assumé** → alors ce lot suffit, et le reste reste en l'état en connaissance de cause.

Je n'avance pas plus loin sans votre réponse.

## STOP

Je ne fusionne pas la PR #31.
