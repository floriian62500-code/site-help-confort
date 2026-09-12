# MATRICE DE CONTRÔLE FINAL — dépôt site-help-confort

> Mise à jour 2026-08-24. `recette` uniquement. Une zone = VERTE seulement si aucune erreur connue ne reste
> (ou exception explicitement justifiée). Détail par SHA dans `ASSAINISSEMENT-15-TACHES-LOG.md` + outbox.

| ZONE | ERREURS TROUVÉES | CORRIGÉES | TESTS | SHA | RISQUE RÉSIDUEL |
|---|---|---|---|---|---|
| Funnel/réservation (T1) | Achat en ligne = lead only (gel A08 voulu) | Vérifié E2E (prix 771€, lead créé+nettoyé) | E2E live + smoke funnel | `a74c9ec3` | 🟡 achat en ligne = gate Stripe |
| Wizard (T2) | Erreurs inline jamais affichées (bug scope) | ✅ hoist validateurs | Live: bordure+msg ; smoke | `c6f2d349` | 🟢 aucun |
| Pages métiers UX (T3) | Carte zone sur 14 pages oubliées | ✅ retirée partout (0 mount) | grep 0 + overflow mobile | `38e6077d` | 🟢 aucun |
| Cartographie (T4) | Doc au mauvais chemin | ✅ → docs/maintainer/ | relecture | `32e50b15` | 🟢 aucun |
| Branches (T5) | staging non trié | ✅ triage MERGE SÉLECTIF | analyse 62 commits | `03041db6` | 🟡 cherry-picks candidats = revue |
| Code mort (T6+§4) | hc-mini-zone, .m-suppliers, _backup_png/metiers/pictos, scratch | ✅ tous retirés (tags savepoint) | smoke 12/12 + grep 0 | `2e14e04f`,`791416fd`,`95fea5d1`,`62d83216`,`70c5ae7c` | 🟢 aucun |
| Doublons (T7) | 4 CSS+2 JS inline dupliqués 22-25 pages | Documenté (extraction=reco) | — | `9b3a84e2` | 🟡 QA visuelle requise |
| Sécurité front (T8) | Pages admin PAT/promote publiques | ✅ 404 | smoke admin-404 | `2ab95305` | 🟢 aucun |
| Sécurité back (T9) | P1 leads_public_insert + storage site-photos anon | Migrations proposées | SQL RLS/storage | `e7834a21` | 🔴 gate DB (non appliqué) |
| Stripe (T10) | **P1 CRITIQUE edge LIVE public montant client** | Proposition durcie | audit edge+config | `52760811` | 🔴 gate (deploy edge = GO Florian) |
| Release flow (T11) | UI 4 états absente | Inventaire fait | générateur | `c99b9883` | 🔴 gate DB (4 tables) |
| Qualité front (T12) | console/liens/alt/H1 | ✅ 0 lien cassé, 0/1469 sans alt, 1 h1 | smoke + scan | `dbe68255` | 🟡 sweep responsive = limite pane |
| Accessibilité (#8) | inputs « sans label » = honeypots aria-hidden (faux positifs) | Rien à corriger | scan a11y | ce run | 🟢 aucun (1 saut Hn mineur zones) |
| Performance (T13) | ~7.2M+480K images orphelines | ✅ retirées | du -sh (11M→~8M) | `382ae8c1`,`62d83216`,`70c5ae7c` | 🟡 WebP live=reco ; 18 img=GO |
| Tests (T14) | couverture | ✅ smoke 12 checks | 12/12 PASS | `ce1c5ba7` | 🟡 E2E Stripe TEST=gate |
| Doc mainteneur (T15) | — | ✅ à jour | relecture | `76303934` | 🟢 aucun |
| Traçabilité control-plane | Retours non persistés dans GitHub | ✅ outbox+commentaire #9+status | cycle vérifié gh api | `4bce292b`,`9133091e` | 🟢 aucun |

## Zones VERTES (aucune erreur connue) : T2, T3, T4, T6, T8, T12(hors responsive), a11y, T15, traçabilité.
## Zones 🟡 (exception justifiée) : T5(cherry-picks=revue), T7(QA visuelle), T13(WebP/img=reco/GO), responsive(pane), E2E Stripe(gate).
## Zones 🔴 (gate humain, commandes documentées ci-dessous) : T9, T10, T11.
