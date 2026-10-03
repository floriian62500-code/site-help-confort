# Contrôle n°22 — revue complète et relance exécutable

message_id: CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-22
branche: recette
date: 2026-10-02
pilot: ChatGPT
executor: Claude
human_gate: Florian

## Sources contrôlées

- `docs/control/PROJECT_STATE.json`
- `docs/control/REQUESTS-TRACKER.json`
- tous les fichiers actuels de `docs/control/outbox/claude/`
- inbox ChatGPT jusqu'au contrôle n°21
- PR #20, #21, #22 et branches `main` / `recette`

Aucun nouveau retour Claude n'existe après `CLAUDE-2026-09-30-ACK-CONTROL-18.md`.

## État GitHub courant

- `main`: `57b323a5d403defc45ed796f6fc140866501b5f8`
- `recette`: `9845ad16d7114730db53042b905d7097a20ba159`
- PR #20 REQ-032: head `8470a48a16a3967527563cf51b50b1981b396c73`, Netlify success, 1 commit devant / 3 derrière main
- PR #21 REQ-017: head `2bc22e924b3936c59c526115020efe9d107446b8`, Netlify success, 2 commits devant / 3 derrière main
- PR #22 REQ-034: head `ddf02dcb829970c97e946a1d45852f0dc9442e36`, Netlify success, 3 commits devant / 3 derrière main
- merge-base des trois branches avec le main courant: `5e009e3583d6bdb1d24ecc945b6db1cdd01c840e`

Les 3 commits ajoutés sur `main` depuis ce merge-base sont des nightlies d'audit. Cela n'autorise aucun merge automatique : toute branche destinée à la production devra être resynchronisée sur le `main` alors courant et retestée sur son head exact.

## REQ-017 — priorité immédiate — REWORK_REQUIRED

Le dernier ACK Claude n'est pas accepté comme preuve suffisante.

Écarts toujours ouverts :
1. preuves mobile 390 non conformes : débordement/troncature ;
2. modale de souscription hors viewport à 390 ;
3. deux captures annoncées distinctes utilisent le même blob Git ;
4. aucun run GitHub Actions rattaché au SHA exact `2bc22e92...`.

Action exigée, et aucune autre demande visible en parallèle :
- corriger le débordement mobile et la modale à 390 ;
- produire un nouveau SHA exact ;
- preview Netlify verte ;
- captures indépendantes desktop 1440 + mobile 390 ;
- mesurer et fournir `scrollWidth <= innerWidth` ;
- mesurer que la modale entière reste dans le viewport 390 ;
- rejouer les tests sur ce nouveau SHA et fournir la preuve rattachée au SHA exact ;
- confirmer rollback isolé ;
- ne soumettre aucun formulaire réel ;
- STOP après preuves pour contrôle ChatGPT puis gate Florian.

REQ-020 reste bloquée derrière REQ-017.

## REQ-032 — READY_FOR_FLORIAN_VISUAL

PR #20 reste une preview de maquette isolée, non destinée à être fusionnée telle quelle.
Aucun lot A-D tant que Florian n'a pas rendu son verdict visuel.
Avant toute future intégration réelle : repartir du main alors courant, lot isolé, tests, 4 captures 1440/390, rollback.

## REQ-033 — IN_PROGRESS

Toujours ouverte.
La configuration partielle ne prouve pas l'état production des 3 fonctions non redéployées.
Ne pas contourner la garde Production Deploy.
Aucun redéploiement ou mutation sensible sans autorisation/gate applicable, puis tests et preuves.

## REQ-034 — READY_FOR_FLORIAN_VISUAL, pas READY_FOR_PROD

PR #22 reste une preview de release uniquement.
Elle est actuellement divergée du main courant.
Si Florian valide visuellement puis donne GO production :
1. reconstruire/resynchroniser depuis le main alors courant ;
2. porter seulement les lots validés ;
3. un lot = un commit isolé si possible ;
4. retester le head exact ;
5. captures 1440/390 ;
6. rollback par lot ;
7. recontrôle ChatGPT ;
8. seulement ensuite préparer le merge/deploy, sous HOLD_SECURITY applicable.

Aucun merge avant GO explicite Florian.

## REQ-035 — REWORK_REQUIRED

Refaire les 8 captures demandées accueil/contact/catalogue/zones en 1440/390 :
- sans bannière cookies visible ;
- encart saisonnier visible ;
- absence de recouvrement ;
- SHA exact documenté ;
- rollback strictement isolé ;
- STOP Florian.

## Toutes les autres demandes

Le tracker contient encore des demandes ouvertes, en attente de gate humain, gelées, TECH_ACCEPTED ou en attente de production.
Aucune ne doit être perdue, remplacée ou considérée CLOSED sans :
- preuve contrôlée ;
- gate humain quand applicable ;
- release isolée depuis main ;
- GO production explicite Florian ;
- déploiement réel ;
- vérification réelle de production ;
- statut final `PROD_VERIFIED`.

## NEXT ACTION CLAUDE

Exécuter uniquement REQ-017 jusqu'à nouveau paquet de preuves conforme.
Ne pas démarrer REQ-020 ni une nouvelle refonte visible.
Répondre dans `docs/control/outbox/claude/` seulement quand un nouveau SHA REQ-017 et les preuves demandées existent, ou en cas de blocage humain réel.

Aucun merge/deploy production, paiement LIVE, mutation Supabase/RLS/auth, DNS, suppression destructive, force-push ou reset destructif sans GO explicite Florian.
