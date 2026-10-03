# Réponse au contrôle consolidé — CHATGPT-2026-09-26-CONTROL-NUMBERED-1

run : 2026-09-26 · branche `recette` · **aucune mise en production, aucun merge vers main**

L'ordre d'exécution imposé a été suivi : REQ-001, puis REQ-002, puis REQ-003, puis REQ-004, puis
REQ-005. Les REQ déjà `READY_FOR_CONTROL` n'ont pas été touchées.

## REQ-20260926-001 — Clôture paiement / sécurité / nettoyage → **READY_FOR_CONTROL**

- **ACTION** : rapport consolidé publié, avec la matrice exigée. Les fonctions ont été **lues en
  production** (API Supabase, lecture seule), pas reconstituées de mémoire.
- Ce que dit la matrice, en une ligne : `stripe-webhook` **ne vérifie pas** la signature (la
  vérification est un `// TODO` commenté dans le code servi) et `stripe-create-payment-link` est
  **publique** avec un **montant venu du client**. Deux conséquences écrites noir sur blanc dans le
  rapport : un tiers peut marquer un paiement encaissé, et créer un lien de paiement au montant de
  son choix. `create-payment-session`, appelée par le tunnel, **n'existe pas** dans le projet.
- **FILES_CHANGED** : `docs/control/outbox/claude/CLAUDE-2026-09-26-REQ-001-CLOTURE-PAIEMENT-SECURITE.md`.
- **TESTS** : 64 tests Deno du paquet durci (0 échec, rejoués ce jour) ; suite du site 784/0.
- **SHA** : ce commit. **PREVIEW** : sans objet. **ROLLBACK** : document seul.
- **NEXT_ACTION** : `WAIT_FLORIAN_SECURITY_GO` sur cinq points, dans l'ordre du §4 du rapport.

## REQ-20260926-002 — Registre numéroté → **READY_FOR_CONTROL**

- **ACTION** : `docs/control/REQUESTS-TRACKER.json` créé, **15 demandes importées**, avec les
  champs exigés (`request_id`, `title`, `priority`, `status`, `parent_instruction`, `created_at`,
  `acceptance_criteria`, `evidence_required`, `latest_sha`, `claude_outbox`, `human_gate`,
  `blocked_by`, `next_action`, `attempt`, `closed_at`, `closure_proof`).
- La règle est inscrite **dans le fichier** : Claude ne met jamais `CLOSED`, il va jusqu'à
  `READY_FOR_CONTROL` ; la clôture est un geste humain ou un verdict de contrôle. La règle de
  relance y est écrite aussi (même `request_id`, `attempt` incrémenté, `REWORK_REQUIRED`).
- **NUMBERING_MAP** : voir le tableau de fin.
- **NEXT_REQUEST_ID** : `REQ-20260926-016`.
- **FILES_CHANGED** : `docs/control/REQUESTS-TRACKER.json`.

## REQ-20260926-003 — Grille prestations Chauffage → **READY_FOR_CONTROL**

- **ACTION** : rapport dédié publié ce jour. Deux défauts distincts dans le constat : les tuiles
  géantes venaient de **cartes dupliquées**, corrigées avant le constat (`91991d4a`) ; l'aplat
  orange des cartes sans photo était encore vrai, il est remplacé par un **médaillon sur fond
  clair texturé** avec le pictogramme de la prestation.
- Mesuré sur la preview : 6 cartes, **hauteurs strictement identiques** (344 px en 1440, 341 px en
  390), zones d'image de 220 px, 0 débordement. Une image absente **ne peut pas** changer la
  hauteur d'une carte ici : c'est le conteneur qui la fixe.
- **SHA** `0f09e466` · **TESTS** : garde anti-doublon rejouée contre l'état fautif (échoue et nomme
  les 4 pages) · **ROLLBACK** : `git revert 0f09e466`.
- **NEXT_ACTION** : contrôle visuel Florian.

## REQ-20260926-004 — Pictos footer Métiers → **IN_PROGRESS, avec un désaccord à lever**

J'ai fait l'audit demandé avant de toucher quoi que ce soit. Résultat, mesuré sur **tous** les
footers du site :

- **source de vérité identifiée** : les pictogrammes de familles du catalogue (`f-plomberie`,
  `f-chauffage`, `f-electricite`, `f-serrurerie`, `f-vitrerie`, `f-menuiserie`, `f-renovation`,
  `f-volets`, `f-pmr`, déclarés dans `assets/hc-demande.js`) ;
- **0 picto non conforme** : chaque entrée de footer porte exactement le glyphe de sa famille.

**Ce qui était faux, c'était un libellé, pas un picto.** Sur 14 pages métier, le premier lien
menait à la plomberie et portait le nom du métier de la page (« Chauffage » sur les pages
chauffagiste, « Électricité » sur les pages électricien). Le picto, lui, était la goutte — donc
correct. Un lecteur voyait « goutte + Chauffage » et concluait naturellement que le **picto** était
faux ; c'est le **texte** qui avait dérivé, par un remplacement automatique passé trop large.
Corrigé en `330210c9`, avec une garde sur les 148 footers.

REQ-004 demande explicitement de **ne pas changer les libellés**. Je l'ai fait avant de recevoir
cette consigne, et je le signale plutôt que de le laisser passer : **si le verdict est que les
libellés devaient rester, dites-le et je reviens dessus** — mais alors il faut trancher autrement,
car « Chauffage » pointant vers la plomberie ne peut pas rester.

**Un vrai défaut trouvé en chemin, que je n'ouvre pas** (gel) : le footer n'a pas de source unique.
Il existe **cinq versions** de la colonne Métiers sur le site — 9 entrées (79 pages), 6 (14),
8 (6), 4 (12), aucune (37). Sur les footers à 6 entrées, vitrerie et menuiserie n'apparaissent
qu'agrégées (« Serrurerie & vitrerie », « Rénovation & travaux »), donc sans leur propre picto.
C'est exactement le problème que l'en-tête a déjà résolu (partiel unique + `sync-header.mjs`).
**Proposition, sur GO** : une REQ dédiée pour unifier le footer à la même source. Je ne la commence
pas.

## REQ-20260926-005 — Section contrats Chauffage → **READY_FOR_CONTROL**

- **ACTION** : section premium livrée (`c805737d`), rapport publié. Hauteur ×2,5 (222 → 555 px),
  titre jusqu'à 2,35 rem, prix d'appel isolé jusqu'à 2,9 rem, trois pastilles BASIC / ★ CONFORT /
  SÉCURITÉ, action principale **+29 % de surface** contre la sortie secondaire, fond bleu nuit —
  seul bloc sombre du haut de page. Aucune carte détaillée recopiée.
- **TESTS** : `prix-contrats` 25 → 41 contrôles. **ROLLBACK** : `git revert c805737d`.
- **NEXT_ACTION** : contrôle visuel Florian.

## REQ déjà validées — non touchées

`REQ-006` (bannière flottante), `REQ-007` (module parcours), `REQ-008` (bloc final contrats),
`REQ-009` (régression `#intervention`) : aucun commit ne les concerne depuis leur validation. La
suite complète les couvre toujours (784 contrôles, 0 échec).

## NUMBERING_MAP

| REQ | sujet | statut | SHA |
|---|---|---|---|
| 001 | clôture paiement / sécurité / nettoyage | READY_FOR_CONTROL | — (document) |
| 002 | registre numéroté | READY_FOR_CONTROL | — (document) |
| 003 | grille prestations Chauffage | READY_FOR_CONTROL | `0f09e466` |
| 004 | pictos / libellés footer | IN_PROGRESS (désaccord à lever) | `330210c9` |
| 005 | section contrats Chauffage | READY_FOR_CONTROL | `c805737d` |
| 006 | bannière accueil flottante | READY_FOR_CONTROL | `91991d4a` |
| 007 | suppression module parcours | READY_FOR_CONTROL | `1fa6b647` |
| 008 | suppression bloc final contrats | READY_FOR_CONTROL | `6ae55ed8` |
| 009 | régression `#intervention` | READY_FOR_CONTROL | `020b2666` |
| 010 | teaser contrats haut de page | READY_FOR_CONTROL (remplacé par 005) | `d23c71ba` |
| 011 | routage boutons « avec prix » | READY_FOR_CONTROL | `0f09e466` |
| 012 | gel UX | IN_PROGRESS | — |
| 013 | HOLD production / sécurité | WAITING_FLORIAN | — |
| 014 | repli visuel électricien / serrurier / vitrier | OPEN (gelé) | — |
| 015 | trois photos manquantes | WAITING_FLORIAN | — |

`NEXT_REQUEST_ID` : **REQ-20260926-016**.

## TESTS

Suite complète : 28 suites, **784 contrôles, 0 échec**. SEO `ERRORS=0`. En-tête unique et
inventaire strict verts. 64 tests Deno du paquet paiement durci, 0 échec.

## NO_PROD_MUTATION_PROOF

- aucun déploiement, aucune migration, aucune variable d'environnement posée ;
- les seules interactions avec Supabase sont des **lectures** (liste et source des fonctions,
  listage de buckets publics) ;
- `origin/main` toujours sur `570225bf` (2026-09-25) ; tous les commits sur `recette` ;
- aucun formulaire soumis, aucune donnée client créée.

## NEXT_ACTION

1. **REQ-001** : contrôle du rapport, puis GO Florian sur les cinq points de sécurité.
2. **REQ-004** : trancher le désaccord libellé / picto.
3. **REQ-003 / 005 / 006** : contrôle visuel de Florian sur la preview.
4. Le gel reste en vigueur : aucun nouveau sujet tant que ces points ne sont pas soldés.
