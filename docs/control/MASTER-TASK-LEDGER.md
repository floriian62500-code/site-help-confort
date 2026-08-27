# MASTER-TASK-LEDGER — registre maître UNIQUE (issue #9)

> Source de vérité de toutes les demandes. Mise à jour à CHAQUE commit/outbox. 2026-08-27.
> Statuts : BACKLOG | IN_PROGRESS | BLOCKED_HUMAN | READY_FOR_QA | QA_REJECTED | QA_APPROVED | READY_FOR_PROD | PROD_DEPLOYED | PROD_VERIFIED | CLOSED.
> **Aucune tâche prod n'est PROD_DEPLOYED** : tout est sur `recette` (aucune promotion sans GO Florian). Rien n'est QA_APPROVED tant que Florian n'a pas validé via `/recette.html` ou commentaire.
> Preuve = SHA `recette` réel + outbox. « FAIT » interne = READY_FOR_QA (prouvé recette), pas CLOSED.

## Zone COMMANDE / CATALOGUE (P0)
| ID | source | prio | demande | statut | SHA recette | tests | preview | validation Florian | reste |
|---|---|---|---|---|---|---|---|---|---|
| CMD-1 | 5439085965/5439129350 | P0 | Bug modale tarifs /nos-prestations : autocomplete vide CP/ville → CTA bloqué | **READY_FOR_QA** | `fa662525` | smoke 15/15 + E2E live | CP/ville persist, CTA actif prouvés | validation visuelle Florian |
| CMD-2 | 5439214830 | P0 | Entrée transactionnelle = catalogue + deep-links métiers→famille | **READY_FOR_QA** | `f61f35e7`,`3d11b469` | smoke 16/16 | /catalogue 6 familles + 26 pages métiers → /catalogue#cat=famille (prouvé, 15 produits Plomberie) | validation Florian |
| CMD-3 | 5438316639/5438366099 | P0 | Catalogue familles + multi-panier | **READY_FOR_QA** (moteur unifié) | `859aea37` | E2E multi-cart PASS | moteur `catalogue.html` : 6 familles/34 items, panier multi (prouvé) | validation Florian |
| CMD-4 | 5439065455 | P0 | Checkout panier→coordonnées→confirmation récap | **READY_FOR_QA** (moteur unifié) | `859aea37` | E2E 2 familles→confirmation PASS | étapes dédiées urgence/adresse/coords/créneau/confirmation (prouvé) | validation Florian |
| CMD-5 | 5438316639 | P1 | Retrait complet ancien sélecteur unique + 3-voies | **READY_FOR_QA** (fait) | `95b50cf3` | smoke: 0 marqueur legacy | ancien wizard `#hc-reservation` retiré (~1770 l.) → bloc redirect moteur ; index.html charge sans erreur console | validation Florian |
| CMD-6 | 5438316639 | P1 | Pricing serveur panier + Stripe TEST (paiement réel) | **BLOCKED_HUMAN** | proposition PROPOSED_index.ts | — | — | **clé sk_test_ + GO deploy edge** |
| CMD-7 | 5444100035 | P0 | Restaurer 4 intentions home (ne pas sur-simplifier) : Commander/Devis/Entretien + Urgence distincte, « Être rappelé » secondaire | **READY_FOR_QA** | `c82a784c` | 3 cartes + destinations 200 + formulaires existants ré-utilisés ; 0 erreur console | `/` : cartes → /catalogue, /devis-express.html, /contrats-entretien.html ; urgence tel ; callback secondaire | QA visuelle 1440+390 Florian |
| UX-COMMERCE-1 | 5441880835 / 5443822193 | P0/P1 | Moteur unifié plein écran (catalogue + diagnostic guidé → même panier → checkout) — **COMMERCE_FLOW=READY_FOR_QA** | **READY_FOR_QA** | `859aea37`(A-D),`95b50cf3`(E),`e5f919bb`(F) | smoke 15/16 (FAIL=admin-404 artefact local) + 12 scénarios E2E navigateur | `catalogue.html` moteur ; docs `benchmark-booking-commerce.md`+`help-confort-commerce-flow.md`+`E2E-COMMERCE.md` ; legacy supprimé ; 2 E2E principaux PASS | validation Florian ; gate paiement = CMD-6 |

## Zone TUNNEL / FORMULAIRES (P0/P1)
| ID | source | prio | demande | statut | SHA | reste |
|---|---|---|---|---|---|---|
| TUN-1 | 5438265921 | P1 | Tunnel unique — S1 inventaire+architecture+source unique | **READY_FOR_QA** | `450d3344` | — |
| TUN-2 | 5438265921 | P1 | Tunnel S2-S7 (route plein écran, brouillon/reprise, prefill, allègement Contact) | **BACKLOG** | — | QA visuelle |
| FRM-1 | #9 T2 | P0 | Wizard erreurs inline (bug scope corrigé) | **READY_FOR_QA** | `c6f2d349` | validation Florian |

## Zone RUNNER / CONTROL-PLANE (non-prod, critère = READY_FOR_HUMAN_ACTIVATION)
| ID | source | prio | demande | statut | SHA/PR | reste |
|---|---|---|---|---|---|---|
| RUN-1 | 5394672383+ / 5441844560 | P1 | Runner autonome OAuth durci (PR #10) — **PREP_COMPLETE=YES** | **BLOCKED_HUMAN** (prep complète, 5 gestes humains) | PR #10 tip réel `cdcafcac` (MERGEABLE, diff = 3 fichiers workflow/preflight/postflight, 0 dérive app) | 20/20 gardes PASS ; workflow durci (cron+dispatch, contents:write, concurrency, timeout 45, checkout+push recette only, SHAs pinnés) ; checklist `RUNNER-ACTIVATION-CHECKLIST.md` + plan `RUNNER-E2E-WITNESS.md`. Reste = gestes Florian : secret OAuth + protection main + merge + E2E témoin. Ne passe `CLOSED` qu'après E2E réel PASS. |
| RUN-2 | 5398603764 | P0 | Persistance run_id (anti-perte) | **CLOSED** (non-prod, prouvé remote) | `23f6109f` | — |
| RUN-3 | 5439235448 | P0 | MASTER-TASK-LEDGER + DELIVERY-WORKFLOW + sync status | **IN_PROGRESS** | ce commit | contrôle auto ledger |

## Zone SÉCURITÉ / NETTOYAGE (#9 + second pass)
| ID | source | prio | demande | statut | SHA | reste |
|---|---|---|---|---|---|---|
| SEC-1 | #9 T8 | P0 | Pages admin PAT/promote bloquées 404 | **READY_FOR_QA** | `2ab95305` | — |
| SEC-2 | #9 T9 | P0 | P1 leads_public_insert + storage site-photos | **BLOCKED_HUMAN** | migrations PROPOSED | GO apply DB |
| SEC-3 | #9 T10 | P0 | **P1 CRITIQUE edge Stripe LIVE public** | **BLOCKED_HUMAN** | PROPOSED_index.ts | GO durcir/couper edge |
| SEC-4 | 5398476753 | P1 | Second pass B (293 fichiers, 71 target=_blank) | **READY_FOR_QA** | `c4ecba71`,`ee445b54` | — |
| SEC-5 | 5398476753 | P1 | Second pass C→J (graphe refs, branches, RLS profond, Stripe flux, headers, tests, ownership-map) | **BACKLOG** | — | séquencer |
| SEC-6 | 5439235448 | P2 | app_settings/staging_validations RLS P2 | **BLOCKED_HUMAN** | matrice RLS | GO migration |
| CLN-1 | #9 T6 | P1 | Code mort (hc-mini-zone, _backup_png, .m-suppliers, metiers, pictos) | **READY_FOR_QA** | `2e14e04f`,`791416fd`,`95fea5d1`,`62d83216`,`70c5ae7c` | — |
| CLN-2 | #9 T13 | P2 | WebP images live + 18 img prestations | **BACKLOG/BLOCKED_HUMAN** | reco | QA + GO média |
| CLN-3 | #9 T7 | P2 | Mutualisation CSS/JS inline | **BACKLOG** | — | QA visuelle |

## Zone MÉTIERS / QUALITÉ / SEO
| ID | source | prio | demande | statut | SHA | reste |
|---|---|---|---|---|---|---|
| MET-1 | #9 T3 | P0 | Pages métiers : carte zone/fournisseurs/6 engagements | **READY_FOR_QA** | `38e6077d` | validation Florian |
| QUA-1 | #9 T12 | P1 | Qualité front (console/liens/alt/H1) | **READY_FOR_QA** | `dbe68255` | — |
| RSP-1 | 5438239688 T8 | P1 | Responsive 320→1920 + a11y | **READY_FOR_QA** (QA visuelle Florian requise) | — | QA visuelle (pane non fiable) |
| SEO-1 | 5438239688 L1 | P1 | Audit SEO technique (baseline saine) | **READY_FOR_QA** | `711a3204` | — |
| SEO-2 | 5438239688 L2/3/9 | P1 | Architecture locale + contenu + tests garde-fous SEO | **BACKLOG** | — | séquencer |
| SEO-3 | 5438239688 L4-8 | P2 | GBP/backlinks/tracking/Ads | **BLOCKED_HUMAN** | plans | accès comptes Google |

## Zone GATES DB / RELEASE
| ID | source | prio | demande | statut | reste |
|---|---|---|---|---|---|
| REL-1 | #9 T11 | P1 | Release flow /recette.html 4 états | **BLOCKED_HUMAN** | migration 4 tables (GO DB) |
| MIG-1 | #9 | P1 | Migrations durcissement (leads/storage/app_settings) | **BLOCKED_HUMAN** | GO apply |

## Synthèse
- **OPEN_P0** : CMD-1..4 (READY_FOR_QA), SEC-1/3, MET-1, RUN-3(en cours), CMD-6/SEC-3 (BLOCKED gate Stripe).
- **BLOCKED_HUMAN** (gates) : Stripe (sk_test_ + edge), migrations DB, runner (secret+merge+branch protection), release UI, GBP/Ads.
- **BACKLOG safe** : CMD-5 (retrait ancien code), TUN-2, SEC-5 (C→J), SEO-2, CLN-3.
- **CLOSED** : RUN-2 (persistance, non-prod prouvé).
> Aucune tâche PROD_DEPLOYED (aucune promotion prod effectuée). Aucune QA_APPROVED (attente validation Florian).
