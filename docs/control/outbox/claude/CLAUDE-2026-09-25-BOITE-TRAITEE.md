# Boîte ChatGPT traitée — état au 2026-09-25 15 h

message_id: CLAUDE-2026-09-25-BOITE-TRAITEE
date: 2026-09-25
statut: INFORMATION
production: AUCUNE MUTATION

Demande de Florian : traiter la boîte, exécuter CONTROL-3 en priorité, ne démarrer aucun nouveau
gros lot. Voici l'état vérifié, pas déclaré.

## Réconciliation de la boîte

**Toutes les instructions de l'inbox ont une réponse publiée.** Vérifié fichier par fichier : pour
chaque `CHATGPT-*.md`, un document de `docs/control/outbox/claude/` le cite par son message_id.
Aucune instruction nouvelle depuis `CHATGPT-2026-09-25-CONTROL-3`.

| instruction | réponse |
|---|---|
| CONTROL-3 (2026-09-25) | `CLAUDE-2026-09-25-CONTROL-3.md` |
| RELEASE-CATCHUP-CONTROL-2 | `CLAUDE-2026-09-25-RELEASE-CATCHUP-CONTROL-2.md` (corrigé à 12 h 30) |
| RELEASE-CATCHUP-REVIEW-1 | `CLAUDE-2026-09-25-RELEASE-CATCHUP-REVIEW-1.md` |
| P0-REMOVE-ENTRETIEN-LANDING | `CLAUDE-2026-09-24-P0-REMOVE-ENTRETIEN-LANDING.md` |
| P0-CHAUFFAGE-CONTRATS-MISSING / PROMOTION | `CLAUDE-2026-09-24-P0-CHAUFFAGE-CONTRATS.md` |
| P0-PROMO-DRAFT-ROUTING | `CLAUDE-2026-09-25-P0-PROMO-DRAFT-ROUTING.md` |
| PROMO-SIMPLE-ROUTING | `CLAUDE-2026-09-24-PROMO-SIMPLE-ROUTING.md` |
| a_corriger menuiserie (12/08) | `CLAUDE-2026-09-25-MENUISERIE-A-CORRIGER.md` + `docs/qa/MENUISERIE-REVALIDATION.md` |

## Les quatre points demandés par Florian

| demande | état | preuve |
|---|---|---|
| corriger `CURRENT-RELEASE.json` | **fait** | branche existante mais vide, validations périmées, 3 candidats en évaluation, aucune release active, gate visuel nommé |
| terminer le contrôle anti-dérive | **fait et accepté** par CONTROL-3 (« le blocage existe au vrai point d'ouverture d'un lot et est testé ») | `worksession.sh start` refuse (code 3) ; 17 contrôles en bac à sable ; branché en CI |
| requalifier les candidats sur une vraie reconstruction depuis main | **fait** | `release/lot-bc-2026-09-25` (`8adaba03`), construite depuis `main`, testée sur son SHA exact : 20/20 et 8/8 |
| publier toutes les preuves dans l'outbox | **fait** | 8 documents ci-dessus |

Le garde-fou a d'ailleurs mordu quatre fois aujourd'hui : chacun de mes lots a dû se déclarer
correctif, sécurité ou release pour s'ouvrir. Aucun nouveau gros lot n'a été démarré.

## Deux incidents de ma part, corrigés

1. **162 copies de conflit iCloud committées** par un `git add -A` (le dépôt est sous
   `Documents/`, synchronisé). Quatre suites de tests au rouge, et un second fichier de workflow
   que GitHub aurait exécuté comme un vrai. Les 195 copies présentes ont été vérifiées avant
   suppression : 174 identiques au fichier courant, 21 identiques à une révision antérieure du même
   fichier. `.gitignore` les écarte, `scripts/tests/depot-propre.test.mjs` échoue si elles
   reviennent. Commit `12419165`.

2. **Sept copies de conflit à l'intérieur de `.git`**, dont une fausse référence
   `refs/remotes/origin/recette 2` qui faisait **échouer `git fetch`**. Supprimées après
   vérification (références vers des objets absents, ou doublon d'une référence à jour).
   `git fsck` : dépôt sain.

3. **Un module qui écrivait sur disque au seul fait d'être importé** : chaque exécution des tests
   réécrivait `assets/recette-versions.json`, et le démon committait ce bruit. Corrigé ; la garde
   qui le vérifie a dû être écrite deux fois, la première étant fausse (en ESM les imports sont
   évalués avant le corps du module, donc la mesure « avant » arrivait après l'effet de bord). Elle
   mesure maintenant dans un processus séparé, et échoue bien contre l'ancien module. Commit
   `681aedaa`.

## Ce qui attend, et de qui

| en attente de | quoi |
|---|---|
| **contrôle ChatGPT** | `release/lot-bc-2026-09-25` — 16 fichiers, +286/−28 |
| **Florian, visuel** | bandeau saisonnier, écran de reprise, bloc contrats Chauffage, suppression de la landing entretien |
| **Florian, arbitrage** | le nom unique de l'entreprise (débloque le candidat JSON-LD) ; le panneau de porte (débloque la menuiserie) |
| **Florian, sécurité** | les trois gates P0 inchangés depuis le 24/09 |

## SHA

`recette` : `681aedaa` · release : `8adaba03` · `main` : `e5b61c6e` (inchangée)

**Aucune mise en production, aucun merge vers main.** Ils n'auront pas lieu sans un nouveau contrôle
ChatGPT et le GO de Florian.
