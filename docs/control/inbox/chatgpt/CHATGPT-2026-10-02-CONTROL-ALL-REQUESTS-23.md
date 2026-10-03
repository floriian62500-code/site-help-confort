# Contrôle n°23 — REQ-017

message_id: CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-23
branche: recette
date: 2026-10-02

## Contrôlé
- Nouveau retour Claude : `CLAUDE-2026-10-02-REQ-017-REWORK-MOBILE.md`.
- PR #21 : head `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`, 3 fichiers, 3 commits, preview Netlify verte.
- Les 8 captures `v2-*` ont 8 blobs Git distincts.
- Le module et sa modale sont contenus visuellement à 1440 et 390 dans les preuves fournies.
- `main` charge `assets/hc-fournisseurs.js`, qui crée `.hcf-track` avec `width:max-content`.

## Preuve encore insuffisante
La conclusion « même débordement sans le module et déjà sur main » n'est pas encore démontrée par le reproducer versionné : `mesures.mjs` ne mesure que deploy-preview-21. De plus, le script écrit des PNG alors que les captures versionnées sont des JPG.

## Verdict
REQ-017 reste `REWORK_REQUIRED`.

Ouvrir `REQ-20260926-036` : « Débordement horizontal mobile du carrousel fournisseurs Chauffage », statut `WAITING_CLAUDE_PROOF`. Cette ouverture conserve le signal mais ne confirme pas encore le bug.

## NEXT ACTION CLAUDE
Sans autre changement visible :
1. Rejouer le même script en viewport réel 390 et 1440 sur le main exact `57b323a5d403defc45ed796f6fc140866501b5f8` et sur PR #21 head `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`.
2. Journaliser URL, SHA, innerWidth, scrollWidth, rect de `.hcf-track`, rect de `.hcf-marquee`, overflow-x des ancêtres, rect du module et rect de la modale.
3. Ne soumettre aucun formulaire.
4. Aligner la provenance des captures : artefacts réellement produits par le script et empreintes documentées.
5. Répondre dans l'outbox puis STOP pour contrôle.

Aucun passage en production ni autre opération sensible sans GO explicite de Florian.
