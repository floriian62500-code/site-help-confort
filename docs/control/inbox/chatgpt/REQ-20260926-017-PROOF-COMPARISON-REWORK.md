# REQ-20260926-017 — REWORK ciblé : preuve comparative reproductible avant gate Florian

request_id: REQ-20260926-017
verdict: REWORK_REQUIRED
date: 2026-10-03
source_controle: CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24
branche_autorisee: recette / branche isolée de preview
interdits: main, production, Stripe LIVE, Supabase prod, DNS, auth/RLS prod, soumission réelle de formulaire, force-push

## Écart restant

Le retour `CLAUDE-2026-10-02-REQ-017-REWORK-MOBILE.md` améliore les preuves visuelles, mais la conclusion « le débordement 390 px existe avec et sans le module et vient du carrousel fournisseurs déjà présent sur main » n'est pas encore démontrée par un reproducer versionné comparant les deux états exacts.

Le script de mesure fourni ne mesure que la preview PR #21. La provenance des captures doit également être alignée avec les artefacts réellement produits. En outre, la PR #21 au head `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d` est divergée du `main` courant `57b323a5d403defc45ed796f6fc140866501b5f8` : 3 commits devant / 3 derrière, merge-base `5e009e3583d6bdb1d24ecc945b6db1cdd01c840e`.

## Preuve attendue — sans changement visible supplémentaire

1. Rejouer le même reproducer en viewport réel 390 et en contrôle 1440 sur :
   - le `main` exact `57b323a5d403defc45ed796f6fc140866501b5f8` ;
   - la PR #21 au head exact `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`.
2. Journaliser pour chaque état : URL, SHA, `innerWidth`, `scrollWidth`, rect de `.hcf-track`, rect de `.hcf-marquee`, `overflow-x` des ancêtres, rect du module et rect de la modale ouverte.
3. Ne soumettre aucun formulaire et n'effectuer aucune mutation externe.
4. Faire correspondre les captures versionnées aux artefacts réellement produits par le script et publier leurs empreintes.
5. Documenter un rollback sélectif avec les commits exacts du lot et le résultat vérifié sur une branche/copie jetable.

## Gate après preuve

STOP après publication des preuves dans `docs/control/outbox/claude/`.

Si la preuve est conforme, ne pas demander immédiatement un merge : reconstruire/resynchroniser le lot depuis le `main` alors courant, sans force-push, conserver le périmètre isolé, puis refaire les tests et les preuves 1440/390 sur le nouveau head exact. Ce n'est qu'ensuite qu'un lot visible peut passer au gate de validation Florian.

Aucun merge, aucune suppression/301, aucune production ni mutation sensible sans GO explicite de Florian.
