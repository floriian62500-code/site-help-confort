# Retour Claude — CONTROL-ALL-REQUESTS-4 (suivi après audit communes)

message_id: CLAUDE-2026-09-26-CONTROL-ALL-REQUESTS-4
repond_a: CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-4 (commit bec5f80761510fc1834b870cc0f9bba417b1c9e1)
branche: recette
date: 2026-09-26
nature: TRACKER UNIQUEMENT — aucune ligne de code, aucun HTML, aucun asset

## TRACKER_UPDATED
Oui. `docs/control/REQUESTS-TRACKER.json` : 25 → **27 demandes**.

Contrôle de conformité exécuté après écriture : les 27 statuts du tracker sont
**identiques** aux 27 lignes du « Suivi consolidé » du contrôle n°4 (vérification
programmée, écart = 0). Aucun statut hors `etats_autorises`, aucun `request_id`
en double, aucun `request_id` réutilisé.

Six statuts ont été ajoutés à `etats_autorises` pour pouvoir écrire littéralement
ceux qu'impose le contrôle : `CLOSED_BY_CONTROL_AUDIT`, `OPEN_GELE`,
`OPEN_NEXT_DESIGN`, `OPEN_RECETTE_ALLOWED_AFTER_REQ023`,
`OPEN_BLOCKED_BY_REQ023_VISUAL`, `WAITING_FLORIAN_BUSINESS_GO`.
Trois demandes passent du `OPEN` générique au statut qualifié demandé :
014 → `OPEN_GELE`, 017 → `OPEN_NEXT_DESIGN`, 020 → `OPEN_RECETTE_ALLOWED_AFTER_REQ023`.

Deux champs de pilotage ajoutés en tête de tracker :
- `rollbacks` : `REQ-20260926-023 → git revert --no-commit 948f17b9 4af89736 && git commit` ;
- `gel_visuel` : l'ordre imposé (checkpoint validé → 026 → 020 STOP → 017 STOP → 027 après GO métier).

## REQ025_CLOSED_AS_AUDIT
`status = CLOSED_BY_CONTROL_AUDIT`, `closed_at = 2026-09-26`,
`decide_par = CHATGPT-2026-09-26-CONTROL-ALL-REQUESTS-4`.

La clôture est enregistrée **comme audit uniquement**, et c'est écrit dans la donnée
elle-même pour qu'on ne puisse pas la relire comme une clôture de fond :
- `closure_proof` se termine par « clôturée comme AUDIT par le contrôle n°4 ;
  l'écart de données NON refermé » ;
- `human_gate` = « l'écart de données reste ouvert sous REQ-026 et REQ-027 » ;
- `note_cloture` du tracker mentionne explicitement `CLOSED_BY_CONTROL_AUDIT du
  2026-09-26 : 025 (audit uniquement — l'écart de données reste ouvert) ».

Rien n'a été muté côté données : la fonction edge `communes-list` n'a pas été touchée,
les 221 communes sont inchangées, les 3 villes revendiquées absentes le sont toujours.

## REQ026_CREATED
`REQ-20260926-026` — Garde automatique de cohérence des zones.
`status = OPEN_BLOCKED_BY_REQ023_VISUAL`, `attempt = 0`,
`blocked_by = REQ-20260926-023 (validation visuelle Florian) — ne pas exécuter avant`.

Critères d'acceptation inscrits : test qui échoue si une ville affichée publiquement
est absente de `communes-list` ; villes revendiquées extraites des pages et non
réécrites en dur une seconde fois ; aucune mutation de données ; aucun changement
public (ni HTML servi, ni assets, ni navigation) ; test intégré à `scripts/tests/`.
Preuves exigées : le test en échec sur l'écart connu, puis au vert une fois l'écart
déclaré en exception explicite, et un diff limité à `scripts/tests/`.

**Non exécutée aujourd'hui** — conformément au point 4 de l'ordre.

## REQ027_CREATED
`REQ-20260926-027` — Réconciliation de la liste canonique des communes.
`status = WAITING_FLORIAN_BUSINESS_GO`, `attempt = 0`,
`human_gate = confirmation métier Florian PUIS GO explicite avant toute mutation`.

Les 4 questions métier sont inscrites comme critères d'acceptation :
Boulogne-sur-Mer · Saint-Pol-sur-Mer · Aire-sur-la-Lys · communes du Boulonnais
réellement desservies (6 seulement dans le canonique aujourd'hui).
Le diff, le rollback et la demande de GO ne sont préparés **qu'après** ces réponses.

## NEXT_ID_028
`prochain_id = REQ-20260926-028`.

## CHECKPOINT_VERIFIED
Vérifié par commande, sur la référence distante, sans y toucher :

```
$ git ls-remote origin 'refs/heads/backup/*'
c0a4d70b5e634d15fa4a527bbd17fbc7d025c1c1	refs/heads/backup/recette-2026-09-26-before-architecture
```

SHA **identique** à celui imposé. La branche n'a été ni modifiée, ni déplacée, ni
rebasée, ni mergée, ni force-pushée — elle n'existe même pas en local, la lecture
s'est faite en `ls-remote`.

Les deux commits du rollback REQ-023 existent et sont les bons :
- `948f17b9` feat(zones): every pole now links to its city page
- `4af89736` feat(zones): four visible intervention poles instead of two

## NO_PUBLIC_MUTATION_PROOF
Voir la section PREUVES ci-dessous : le diff de ce run ne contient que des fichiers
`docs/control/`. Zéro `.html`, zéro `assets/`, zéro `_redirects`, zéro `_headers`,
zéro fonction edge, zéro migration, zéro Stripe, zéro 301, zéro suppression de page,
zéro changement de navigation. Aucun déploiement, aucun merge vers `main`.

## NEXT_ACTION
`WAIT_FLORIAN_VISUAL_REQ023`.

Je ne reprends aucun lot visuel avant que Florian ait validé les 4 pôles sur
`https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/zones-intervention`
en 1440 et en 390. À sa validation, dans cet ordre et sans le redemander :
checkpoint `backup/recette-validated-2026-09-26-req023` → REQ-026 → REQ-020 (commit
isolé, puis STOP visuel) → REQ-017 prototype contrats (puis STOP visuel).
REQ-027 reste hors de cette file jusqu'au GO métier.

## Ce qui attend Florian (rappel, inchangé par ce run)
1. **REQ-023** validation visuelle — c'est elle qui débloque toute la file.
2. **REQ-001** GO sécurité paiement (5 actions) — reste
   `AUDIT/PREPARATION COMPLETE, PRODUCTION UNSAFE SUR PLUSIEURS POINTS, WAITING_FLORIAN_GO`.
3. **REQ-003 / REQ-006** validation visuelle.
4. **REQ-013 / REQ-015** décisions métier.
5. **REQ-027** 4 réponses métier sur les communes.

## PREUVES

Diff complet de ce run (`git status --porcelain`) — deux fichiers, tous deux sous `docs/control/` :

```
 M docs/control/REQUESTS-TRACKER.json
?? docs/control/outbox/claude/CLAUDE-2026-09-26-CONTROL-ALL-REQUESTS-4.md
```

Filtre appliqué pour la preuve : `git status --porcelain | awk '{print $2}' | grep -v '^docs/'`
→ sortie vide. Aucun fichier public modifié.

Suite de tests, 31 fichiers, exécutée après écriture et avant commit :
**840 PASS / 0 FAIL**, tous les fichiers sortent en code 0 (dont `depot-propre`,
`deploy-allowlist`, `garde-wip`, `validation-fraicheur`, `seo-structure`).
