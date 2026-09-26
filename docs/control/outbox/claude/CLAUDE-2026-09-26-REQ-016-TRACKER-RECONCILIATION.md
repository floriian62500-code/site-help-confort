# REQ-20260926-016 — réconciliation du registre et gel renforcé

run : 2026-09-26 · branche `recette` · **aucun changement public dans ce lot** · statut : **READY_FOR_CONTROL**

## REQUESTS_TRACKER_FIXED

`docs/control/REQUESTS-TRACKER.json` — **22 demandes**, `prochain_id` = `REQ-20260926-023`.

La règle de numérotation est maintenant **écrite dans le fichier** : un `request_id` n'est jamais
réutilisé ; 001 à 015 sont l'historique ; les instructions arrivées ensuite sous les mêmes numéros
sont remappées vers 016 à 022, chacune conservant son nom de fichier d'origine dans
`legacy_instruction_id`.

## COLLISIONS_RESOLVED

La collision est réelle et je l'avais provoquée : j'ai numéroté 001 à 015 de mon côté pendant que
ChatGPT numérotait ses instructions à partir de 010. Trois numéros désignaient deux choses.

| numéro | ce que j'avais mis | ce que l'instruction désignait | résolu en |
|---|---|---|---|
| 010 | teaser contrats haut de page | contrats sur une seule page | instruction → **017** |
| 011 | routage des boutons « avec prix » | chauffe-eau / ECS | instruction → **018** |
| 012 | gel UX | bug catalogue `_default` | instruction → **019** |
| 013 | HOLD production | cartes à deux actions | instruction → **020** |
| 014 | repli visuel électricien/serrurier/vitrier | audit fonctionnel complet | instruction → **021** |
| 015 | trois photos manquantes | montrer avant de modifier | instruction → **022** |

Aucun contenu métier n'a été modifié : seuls les identifiants des **nouvelles** demandes changent,
comme le demande la règle.

Une note d'honnêteté : `REQ-20260926-020` (cartes à deux actions, ex-013) est enregistrée, mais
**son fichier d'instruction n'existe pas dans l'inbox** — je ne l'ai jamais reçu. Je l'inscris avec
cette mention plutôt que de faire comme si je l'avais lu.

## CANONICAL_NUMBERING_MAP

| REQ | sujet | statut | origine |
|---|---|---|---|
| 001 | clôture paiement / sécurité / nettoyage | READY_FOR_CONTROL *(audit/préparation seulement)* | — |
| 002 | registre numéroté | READY_FOR_CONTROL | — |
| 003 | grille prestations Chauffage | READY_FOR_CONTROL + **WAITING_FLORIAN_VISUAL** | — |
| 004 | pictos / libellés footer | **REWORK_REQUIRED** · attempt 2 · WAITING_FLORIAN_DIRECTION | — |
| 005 | section contrats Chauffage | **REWORK_REQUIRED** · attempt 2 | `REQ-20260926-005-REWORK-2.md` |
| 006 | bannière accueil flottante | READY_FOR_CONTROL | — |
| 007 | suppression module parcours | READY_FOR_CONTROL | — |
| 008 | suppression bloc final contrats | READY_FOR_CONTROL | — |
| 009 | régression `#intervention` | READY_FOR_CONTROL | — |
| 010 | teaser contrats haut de page | READY_FOR_CONTROL (remplacé par 005) | — |
| 011 | routage boutons « avec prix » | READY_FOR_CONTROL | — |
| 012 | gel UX | IN_PROGRESS | — |
| 013 | HOLD production / sécurité | WAITING_FLORIAN | — |
| 014 | repli visuel électricien / serrurier / vitrier | OPEN (gelé) | — |
| 015 | trois photos manquantes | WAITING_FLORIAN | — |
| **016** | réconciliation du registre | READY_FOR_CONTROL | présente instruction |
| **017** | contrats sur une seule page | OPEN (gelé) | ex-010 |
| **018** | chauffe-eau / ECS | IN_PROGRESS | ex-011 |
| **019** | bug catalogue `_default` | READY_FOR_CONTROL | ex-012 |
| **020** | cartes à deux actions | OPEN | ex-013 *(instruction non reçue)* |
| **021** | audit fonctionnel complet | OPEN | ex-014 |
| **022** | montrer avant de modifier | OPEN | ex-015 |

## REQ005_STATUS_FIXED

`REQ-20260926-005` passe de `READY_FOR_CONTROL` à **`REWORK_REQUIRED`, attempt 2**, rattachée à
`REQ-20260926-005-REWORK-2.md`. Je l'avais marquée prête sur la foi de mes mesures ; le refus
visuel de Florian prime. Le motif est enregistré dans le champ `human_gate`.

## REQ004_STATUS_FIXED

`REQ-20260926-004` reste **`REWORK_REQUIRED`**, attempt 2, `human_gate = WAITING_FLORIAN_DIRECTION`.

Le registre porte maintenant la consigne explicite : **ne pas clôturer sur la conclusion « le
libellé était faux »**. Mon audit reste ce qu'il est — 0 picto non conforme à la référence du
catalogue — mais ce n'est pas la question posée : Florian juge le **rendu**, pas le mapping. Le
prochain traitement partira de ce qu'il attend à l'écran.

## SECURITY_STATUS_NOT_CLOSED

`REQ-20260926-001` porte désormais le champ `scope` :
**« AUDIT/PREPARATION uniquement — la sécurité production n'est PAS clôturée »**.

Rien n'a changé sur la production : `stripe-webhook` ne vérifie toujours pas la signature,
`stripe-create-payment-link` est toujours publique avec un montant venu du client, les fonctions
d'écriture GitHub sont toujours joignables sans authentification, `app_settings` est toujours
lisible par tout compte authentifié. **Cinq actions attendent un GO de Florian.** Le rapport est un
état des lieux, pas une clôture.

## NEXT_REQUEST_ID

**REQ-20260926-023**

## Gel renforcé — inscrit dans le registre

aucune nouvelle refonte · aucune suppression de page · aucune 301 · aucune fusion de parcours ·
aucune nouvelle architecture · aucune modification Stripe LIVE · aucune mise en production.

Seule exception prévue par l'instruction : les corrections purement régressives déjà demandées.
**REQ-019 (`_default`) a été livrée dans ce cadre** — correction minimale, isolée, une seule
fonction de construction de libellé, contrôle permanent ajouté (`catalogue-public`, 6 contrôles,
rejoué contre la version d'avant). Elle ne détourne pas l'audit.

## SHA

Ce commit, sur `recette`. La correction `_default` est `15c46539`.

## NO_PROD_MUTATION_PROOF

- ce lot ne touche que `docs/control/` ;
- aucun déploiement, aucune migration, aucune variable d'environnement ;
- les seules lectures Supabase du jour (fonctions déployées, vues publiques, buckets) sont des
  lectures ;
- `origin/main` toujours sur `570225bf` (2026-09-25).

## STOP

Conformément à l'instruction, je m'arrête ici. La suite est **REQ-021** (audit fonctionnel
complet), puis **REQ-022** (montrer avant de modifier) — et je ne toucherai pas à l'architecture
avant validation de ce que j'aurai montré.
