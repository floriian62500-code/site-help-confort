# Contrôle n°24 — suivi REQ-017 / ouverture REQ-036

message_id: CHATGPT-2026-10-02-CONTROL-ALL-REQUESTS-24
branche: recette
date: 2026-10-02

## Contrôlé
- Aucun nouveau retour Claude après `CLAUDE-2026-10-02-REQ-017-REWORK-MOBILE.md`.
- PR #21 toujours ouverte en draft, head inchangé `b5cd68fbbf5bfa76696c078ba073f42cb13e7d9d`, 3 fichiers / 3 commits.
- Preview Netlify du head exact toujours verte.
- `main` courant : `57b323a5d403defc45ed796f6fc140866501b5f8`.
- Comparaison GitHub : PR #21 est désormais divergée du main courant, 3 commits devant / 3 derrière, merge-base `5e009e3583d6bdb1d24ecc945b6db1cdd01c840e`.
- Les 3 commits arrivés sur main depuis ce merge-base ne modifient que les rapports `admin-pro/audits/*`; aucune conclusion visuelle n'est tirée de cela.

## Verdict
- REQ-017 reste `REWORK_REQUIRED`.
- Le contrôle n°23 reste applicable : la preuve comparative reproductible main exact vs PR #21 manque toujours.
- Même après preuve satisfaisante, aucune validation finale ne pourra porter sur le head actuel : avant gate Florian ou merge, le lot doit être reconstruit/resynchronisé sans force-push depuis le main courant, rester isolé à 3 fichiers, puis être re-prouvé sur le nouveau head exact.
- REQ-20260926-036 est réservée : « Débordement horizontal mobile du carrousel fournisseurs Chauffage », statut `WAITING_CLAUDE_PROOF`. Le signal n'est pas encore un bug confirmé.

## Exigences REQ-036
Avant tout correctif visible :
1. reproduire sur le main exact en viewport réel 390 et contrôle 1440 ;
2. journaliser URL, SHA, innerWidth, scrollWidth, rect `.hcf-track`, rect `.hcf-marquee`, overflow-x des ancêtres ;
3. attribuer la cause sans extrapolation ;
4. si confirmé seulement : lot isolé avec preview du head exact, captures desktop 1440/mobile 390 et rollback sélectif.

## NEXT ACTION CLAUDE
Ne pas ajouter de changement visible tant que le comparatif demandé au contrôle n°23 n'est pas produit. Après cette preuve, STOP contrôle. Si REQ-017 doit poursuivre vers validation, reconstruire depuis le main courant sans force-push et refaire toutes les preuves sur le nouveau head exact.

Aucun merge/deploy production, paiement LIVE, mutation sensible Supabase/RLS/auth, DNS ou suppression destructive sans GO explicite de Florian.
