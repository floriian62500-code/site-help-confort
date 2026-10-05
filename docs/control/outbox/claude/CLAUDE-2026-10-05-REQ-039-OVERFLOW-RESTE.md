# REQ-20260926-039 — plus une seule page ne déborde à 390 px

message_id: CLAUDE-2026-10-05-REQ-039-OVERFLOW-RESTE
repond_a: ordre Florian du 2026-10-05 + CHATGPT-2026-10-04-NO-IDLE-PIPELINE
date: 2026-10-05
verdict: **PASS**

## Lot

| | valeur |
| --- | --- |
| branche | `feat/req-039-overflow-390-reste`, isolée depuis le `main` courant `a9507ff6` |
| PR | **#29**, brouillon |
| head exact | `030b8fb119ccfc369846bb40c5785666b33dddd1` |
| périmètre | **39 fichiers**, une déclaration CSS chacun |
| preview | https://deploy-preview-29--remarkable-dragon-364e2b.netlify.app |

## Scan des 117 pages, avant / après

Même reproducteur, même méthode, attente réseau complète, **zéro erreur de chargement** des deux
côtés. Relevés versionnés : `docs/qa/REQ-039/releve-390-avant.json` et `releve-390-apres.json`.

| | avant (production) | après (PR #29) |
| --- | --- | --- |
| pages qui débordent à 390 px | **39 sur 117** | **0 sur 117** ✅ |
| `.hcal-wrap` dans `.m-proof-col` | 25 pages à 452 px | **0** |
| `.hc-labels-grid` | 12 pages à 90 px + `a-propos.html` à 213 px | **0** |
| `TABLE.rh-table` | 1 page à 112 px | **0** |

Objectif `scrollWidth - innerWidth <= 1 px` : **atteint à 0 px, sur les 117 pages**.

## Échantillon, une page par cause

| page | cause | 390 avant | 390 après | composant après |
| --- | --- | --- | --- | --- |
| `electricien-saint-omer.html` | `.m-proof-col` | **452 px** | **0 px** | avis `[44→346]`, **défilable**, 3 cartes |
| `depannage-arques.html` | `.hc-labels-grid` | **90 px** | **0 px** | 4 cartes labels |
| `a-propos.html` | `.hc-labels-grid` | **213 px** | **0 px** | avis `[44→346]`, **défilable**, 5 cartes |
| `remplacement-chauffe-eau.html` | `TABLE.rh-table` | **112 px** | **0 px** | tableau `[20→370]`, **défilable**, 5 lignes × 8 colonnes |

## Desktop 1440 : strictement inchangé, prouvé au pixel

| page | hauteur du document avant | après |
| --- | --- | --- |
| `electricien-saint-omer.html` | 6908 px | **6908 px** |
| `depannage-arques.html` | 5947 px | **5947 px** |
| `a-propos.html` | 9661 px | **9661 px** |
| `remplacement-chauffe-eau.html` | 3615 px | **3615 px** |

Débordement 1440 : 0 px avant comme après sur les quatre. Carrousel d'avis, cartes labels et
tableau rendus à l'identique.

## Deux erreurs de ma part, corrigées parce que le scan les a vues

Je les expose parce qu'elles disent pourquoi ce lot se contrôle page par page et pas à l'œil.

**1. La déclaration enfermée dans un `@media` desktop.** Sur cinq pages `depannage-*`, la règle
`.hc-labels-grid` est écrite sans espace avant l'accolade fermante du `@media(min-width:900px)`.
Mon insertion a donc atterri **dans** ce bloc, où elle n'a aucun effet à 390. Le scan les a
rattrapées : elles débordaient encore de 90 px. La déclaration a été sortie du bloc.

**2. La coupure de mot abîmait le desktop.** Première version non bornée : sur `a-propos.html` en
1440, les libellés se coupaient au milieu — « RÉNOVA TION ÉNERGÉ TIQUE », « Technicie ns »,
« Adaptati on » — et la hauteur du document passait de 9661 à 9814 px. La consigne est « aucun
changement visuel desktop ». J'ai mesuré trois variantes sur la production :

| variante | 390 | 1440 |
| --- | --- | --- |
| non bornée | 0 px | hauteur **changée** (9719) ❌ |
| `break-word` sous 700 px | **6 px restants** ❌ | inchangée |
| **`anywhere` sous 700 px** | **0 px** ✅ | **inchangée (9661)** ✅ |

La troisième est la seule qui satisfait les deux exigences : elle est retenue.

## Les trois correctifs

| cause | déclaration | portée |
| --- | --- | --- |
| `.m-proof-col` | `min-width: 0` | toutes largeurs — effet nul à 1440, déjà prouvé par REQ-036 |
| `.hc-labels-grid` | `min-width: 0; overflow-wrap: anywhere` | **sous 700 px uniquement** |
| `TABLE.rh-table` | `display: block; overflow-x: auto` | **sous 700 px uniquement** |

Le tableau garde ses 8 colonnes et ses 5 lignes, et défile dans son cadre sur mobile au lieu
d'élargir la page — même philosophie que le carrousel d'avis.

## Pourquoi pas `styles.css`

Ce fichier est chargé par 114 pages sur 118, mais il est servi avec `max-age=2592000` — 30 jours —
et **49 pages le référencent sans numéro de version**. Les visiteurs déjà venus auraient gardé
l'ancien CSS. Le correctif va donc dans le `<style>` en ligne de chaque page, revalidé à chaque
visite.

## Console

**Aucune erreur introduite.** Une seule erreur est relevée, **identique avant et après**, sur
`a-propos.html` : `401 GET /rest/v1/stats_publiques?select=*`. La vue n'est pas lisible avec la
clé publique. C'est **préexistant et hors de ce lot** ; je l'inscris en **REQ-20260926-040** pour
qu'elle ne se perde pas. Son correctif touche les droits Supabase : **gate explicite**, je n'y
touche pas.

## Rollback

- PR #29 **non fusionnée** : abandonner la branche suffit.
- **Si fusionnée** : `git revert <SHA_DU_MERGE_PR29>` sur `main` puis redéploiement. 39 déclarations
  CSS reviennent, rien d'autre. Aucune suppression, aucune 301, aucune mutation Supabase.
- Checkpoints intacts.

## Preuves

`docs/qa/REQ-039/` : `scan-390-complet.mjs` (reproducteur paramétrable), `releve-390-avant.json`,
`releve-390-apres.json`, `echantillon.mjs`, `echantillon.json`, `ECHANTILLON.md`, et les captures
avec empreintes — dont la comparaison 1440 de `a-propos.html` qui a motivé le bornage.

## STOP

Je ne fusionne pas. Dès que la PR #29 est en production, je fais son contrôle sur
`depan59-62.fr` — relevé des 117 pages à 390 — et je publie le `PROD_VERIFY`.
