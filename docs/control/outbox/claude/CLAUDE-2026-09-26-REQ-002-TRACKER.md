# REQ-20260926-002 — registre numéroté des demandes

run : 2026-09-26 · branche `recette` · aucune mise en production · statut : **READY_FOR_CONTROL**
parent : `CHATGPT-2026-09-26-P0-NUMBERED-REQUEST-TRACKING` · attempt 2

## ACK_PROTOCOL

Protocole accepté et appliqué, dans les termes de la demande :

- format `REQ-YYYYMMDD-NNN` ;
- états autorisés : `OPEN`, `ACKNOWLEDGED`, `IN_PROGRESS`, `WAITING_CLAUDE_PROOF`,
  `REWORK_REQUIRED`, `WAITING_FLORIAN`, `READY_FOR_CONTROL`, `CLOSED` ;
- **Claude ne met jamais `CLOSED`** — la règle est écrite dans le fichier lui-même, pas seulement
  ici. Le plus loin que je vais est `READY_FOR_CONTROL` ;
- règle de relance : une demande P0/P1 sans preuve complète au retour suivant **garde son
  `request_id`**, incrémente `attempt`, passe `REWORK_REQUIRED` et reçoit une relance ciblée. Elle
  ne disparaît pas dans un rapport global — c'est précisément le reproche qui a motivé ce registre,
  et il était fondé : la clôture sécurité/paiement a été citée dans deux rapports sans jamais avoir
  le sien.

## REQUESTS_TRACKER_CREATED

`docs/control/REQUESTS-TRACKER.json` — versionné, poussé sur `recette`.

Chaque entrée porte : `request_id`, `title`, `priority`, `status`, `parent_instruction`,
`created_at`, `acceptance_criteria`, `evidence_required`, `latest_sha`, `claude_outbox`,
`human_gate`, `blocked_by`, `next_action`, `attempt`, `closed_at`, `closure_proof`.

## OPEN_REQUESTS_IMPORTED

**15 demandes**, dont les onze sujets encore ouverts de la liste d'import (clôture
nettoyage/sécurité/paiement, HOLD_SECURITY, crochet Netlify, inscription publique, webhook Stripe,
lien de paiement, écriture GitHub, `app_settings`, insertion anonyme dans `leads`, bucket photos,
release C, CTA chaudière, teaser contrats, suppression du module parcours, suppression du bloc
final contrats, bannière flottante, routage Chauffage, prestations avec photos, pictos footer).

Deux précisions honnêtes sur cet import :

1. les sujets **sécurité** (crochet Netlify, inscription publique, webhook, lien de paiement,
   écriture GitHub, `app_settings`, `leads`, bucket photos) sont regroupés sous **REQ-001**, qui
   est leur rapport commun exigé — les éclater en huit REQ aurait recréé la dispersion que ce
   registre combat. Chacun est une **ligne classée** de la matrice de REQ-001 ;
2. **release C** et **prix B** ne sont pas des demandes ouvertes mais des éléments de release, déjà
   suivis dans `docs/release/CURRENT-RELEASE.json`, statut `HOLD_SECURITY`. Ils sont rattachés à
   REQ-013. Dupliquer leur état dans deux fichiers garantirait qu'un des deux mente.

## NUMBERING_MAP

Voir le tableau du rapport `CLAUDE-2026-09-26-CONTROL-NUMBERED-1.md` — même numérotation, même
statuts, produits à partir du même fichier.

## NEXT_REQUEST_ID

**REQ-20260926-016**

## SHA

Ce commit, sur `recette`.

## NO_PROD_MUTATION_PROOF

Fichier de documentation. Aucun déploiement, aucune migration, aucune écriture hors
`docs/control/`. `origin/main` toujours sur `570225bf`.
