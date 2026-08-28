# MASTER-TASK-LEDGER — registre maître UNIQUE (issue #9)

> Source de vérité de toutes les demandes. Mise à jour à CHAQUE commit/outbox. 2026-08-27.
> Statuts : BACKLOG | IN_PROGRESS | BLOCKED_HUMAN | READY_FOR_QA | QA_REJECTED | QA_APPROVED | READY_FOR_PROD | PROD_DEPLOYED | PROD_VERIFIED | CLOSED.
> **Aucune tâche prod n'est PROD_DEPLOYED** : tout est sur `recette` (aucune promotion sans GO Florian). Rien n'est QA_APPROVED tant que Florian n'a pas validé via `/recette.html` ou commentaire.
> Preuve = SHA `recette` réel + outbox. « FAIT » interne = READY_FOR_QA (prouvé recette), pas CLOSED.

## Zone COMMANDE / CATALOGUE (P0)
| ID | source | prio | demande | statut | SHA recette | tests | preview | validation Florian | reste |
|---|---|---|---|---|---|---|---|---|---|
| CMD-1 | 5439085965/5439129350/5443945285 | P0 | Bug modale tarifs /nos-prestations : **CTA de validation invisible** (+ autocomplete CP/ville) | **READY_FOR_QA** (cause racine corrigée) | `fa662525`,`a29e290f` | E2E navigateur 390x600 + 1440x900 : CTA visible, validation OK | CAUSE : sweep HC-PRICE-HIDER (hc-widgets.js) masquait tout `Voir les tarifs` dont le submit ; fix = exclusion modale/submit + modale scrollable/sticky + cache-bust 65 pages | validation visuelle Florian |
| CMD-2 | 5439214830 | P0 | Entrée transactionnelle = catalogue + deep-links métiers→famille | **READY_FOR_QA** | `f61f35e7`,`3d11b469` | smoke 16/16 | /catalogue 6 familles + 26 pages métiers → /catalogue#cat=famille (prouvé, 15 produits Plomberie) | validation Florian |
| CMD-3 | 5438316639/5438366099 | P0 | Catalogue familles + multi-panier | **READY_FOR_QA** (moteur unifié) | `859aea37` | E2E multi-cart PASS | moteur `catalogue.html` : 6 familles/34 items, panier multi (prouvé) | validation Florian |
| CMD-4 | 5439065455 | P0 | Checkout panier→coordonnées→confirmation récap | **READY_FOR_QA** (moteur unifié) | `859aea37` | E2E 2 familles→confirmation PASS | étapes dédiées urgence/adresse/coords/créneau/confirmation (prouvé) | validation Florian |
| CMD-5 | 5438316639 | P1 | Retrait complet ancien sélecteur unique + 3-voies | **READY_FOR_QA** (fait) | `95b50cf3` | smoke: 0 marqueur legacy | ancien wizard `#hc-reservation` retiré (~1770 l.) → bloc redirect moteur ; index.html charge sans erreur console | validation Florian |
| CMD-6 | 5438316639 | P1 | Pricing serveur panier + Stripe TEST (paiement réel) | **BLOCKED_HUMAN** | proposition PROPOSED_index.ts | — | — | **clé sk_test_ + GO deploy edge** |
| CMD-7 | 5444100035 | P0 | Restaurer 4 intentions home (ne pas sur-simplifier) : Commander/Devis/Entretien + Urgence distincte, « Être rappelé » secondaire | **READY_FOR_QA** | `c82a784c` | 3 cartes + destinations 200 + formulaires existants ré-utilisés ; 0 erreur console | `/` : cartes → /catalogue, /devis-express.html, /contrats-entretien.html ; urgence tel ; callback secondaire | QA visuelle 1440+390 Florian |
| CMD-8 | 5444294942/5444326310/5449114555 | P0 | Refonte visuelle 2026 (rendu refusé : daté/vide/emoji) — cartes d'intention modernes SVG, réassurance, urgence intégrée, callback expandable, vides réduits | **READY_FOR_FLORIAN_VISUAL_QA** | `24425d85`,`209fcafb`,`8417774f`(launcher split-layout) | **QA preview PUBLIQUE** : smoke 16/16 ; SHA servi (redesign live, ancien absent) ; responsive home 1440/1024/768/390/375 (section 0 overflow) ; launcher 1024/375 (0 overflow) ; 4 intents→routes OK ; panier + back-nav OK ; console 0 blocage app | preview `deploy-preview-2` sert le redesign (captures Florian = cache navigateur) ; +indicateur de progression discret + icône panier SVG (0 emoji) + wording client (209fcafb) | **GO visuel Florian** (pas DONE) |
| UX-COMMERCE-1 | 5441880835 / 5443822193 | P0/P1 | Moteur unifié plein écran (catalogue + diagnostic guidé → même panier → checkout) — **COMMERCE_FLOW=READY_FOR_QA** | **READY_FOR_QA** | `859aea37`(A-D),`95b50cf3`(E),`e5f919bb`(F) | smoke 15/16 (FAIL=admin-404 artefact local) + 12 scénarios E2E navigateur | `catalogue.html` moteur ; docs `benchmark-booking-commerce.md`+`help-confort-commerce-flow.md`+`E2E-COMMERCE.md` ; legacy supprimé ; 2 E2E principaux PASS | validation Florian ; gate paiement = CMD-6 |

| HOME-1 | 5450178886 | P0 | Régression : blocs Réalisations + Actualités disparus de la home (étaient sidebars du wizard retiré commit E) | **READY_FOR_QA** | `09428cb3` | navigateur : 6 chantiers + 3 actus, 0 emoji/markdown, 0 overflow 375, 0 erreur console | section moderne restaurée (edge realisations-json + content/actualites) ; routes realisations/actualites intactes | validation visuelle Florian |

| CBK-1 | 5450259719 / 5450890741 | P0 | Rappel : classer comme DEMANDE DE RAPPEL + capturer prénom/nom + adresse | **READY_FOR_QA** (front+backend) ; **email = GATE deploy edge** | `d099417b`,`a9a73c53` | payload home+tunnel = prénom/nom distincts + adresse/cp/ville ; insert colonnes standards ; deno check PASS | 2 formulaires rappel + notify-lead-v6 conditionnel rappel (badge/objet/adresse/actions) | GO Florian : **déployer notify-lead-v6** + QA email |

| UX-COMMERCE-2 | 5450207118 | P0 | Unifier 5 parcours (Devis/Entretien = impasses hors tunnel) dans le hub /catalogue | **READY_FOR_QA** | `14fd9bf4` | navigateur 1440+390 : devis/entretien/rappel in-tunnel atteignent confirmation ; cart flow intact ; 0 overflow ; 0 erreur console | flow map `docs/ux/commerce-flow-map.md` (`b62f58b5`) ; steps devis/entretien/rappel + chrome tunnel + state._mode | QA visuelle Florian (5 parcours) |

| E2E-1 | 5450550987 | P0 | Matrice E2E des 6 parcours sur deploy-preview (entrée→endpoint→backend→confirmation→retour) | **READY_FOR_QA** | `dd6bac25` | 6/6 PASS navigateur 1440+390 + backend HTTP 200 (leads archivés NE PAS TRAITER) ; bug reset confirmation corrigé | 6 parcours sans impasse, confirmation réelle | validation Florian |

| UX-COMMERCE-3 | 5451402354 | P0 | Coquille de marque unifiée sur tout le tunnel (rupture header public→barre sombre = effet web-app séparée) | **READY_FOR_QA** | `09c91aa8` | navigateur 1440 : header tunnel premium blanc (logo HELP CONFORT + contexte + tél/urgence + panier + Quitter) sur les 12 étapes ; panneau latéral desktop `Pourquoi HELP Confort` (grille 788/340, plus de formulaire perdu) ; mobile 375 header compact icônes + panneau masqué ; 0 overflow (1440/375) ; console 0 | coquille structurelle unique launcher→confirmation ; routes/logique inchangées (data-step-go/STEPS/submit/form_type) | `BRAND_CONTINUITY/TUNNEL_HEADER/LOGO_VISIBLE/PHONE_OR_URGENCY/BACK_EXIT/CART/DESKTOP_SPACE_USAGE/MOBILE_HEADER=PASS · ALL_STEPS=CONSISTENT · ROUTES_LOGIC=NO_REGRESSION` | validation visuelle Florian |

| HOME-2 | screenshot | P1 | Entité HTML double-échappée dans titres réalisations/actus (l&#x27;italienne) | **READY_FOR_QA** | `0992a99b` | decode entités avant esc | clean() décode &#x27;/&amp;/… | validation Florian |
| OVL-1 | 5450999128 | P0 | Overlay gris global sur preview | **DOC (pas notre code)** | — | DOM : iframe app.netlify.com/cdp (toolbar Netlify) ; absent prod | ROOT_CAUSE=Netlify Deploy Preview drawer ; #hc-sv-cta gated non-prod | action Netlify (désactiver drawer) = humaine |
| HOME-4 | 5451508586 / 5451521443 | P0 | Carte HOME `Entretien & contrats` doit atterrir DIRECTEMENT sur `/contrats-entretien` (pas le tunnel générique) | **READY_FOR_QA** | `c1eb3639` | navigateur : href=`/contrats-entretien.html` ; **clic réel** → page contrats (titre + Gaz/Fioul/Adoucisseur + BASIC/CONFORT/SÉCURITÉ) ; back-nav → home OK ; anchor plein lien (0 handler JS concurrent) ; autres CTA « Contrats » déjà OK | `HOME_ENTRETIEN=/contrats-entretien · CARD_CLICK=PASS · CONTRACT_PAGE=PASS · BACK_NAV=PASS` ; tunnel entretien conservé pour conversion | validation Florian |
| HOME-3 | 5451021404 | P1 | Remonter le module commerce `#hc-reservation` AVANT le bloc partenaires `hc-partners-v3` (Ils nous confient...) | **READY_FOR_QA** | `0895b2a3` | ordre géométrique home 1440+375 : hero→trust-strip→**#hc-reservation**→partenaires→showcase ; commerce 2ᵉ viewport (top 1105 desktop) ; 0 overflow (docScrollW=iw) ; console 0 erreur ; 3 CTA intacts (/catalogue.html, #step=devis, #step=entretien, tel) + form #hrrForm | bloc déplacé tel quel (splice) ; aucune suppression (partenaires/avis/réalisations conservés plus bas) ; captures avant/après 1440+375 | validation visuelle Florian |

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
| TRD-1 | 5451558329 | P1 | Bloc « 6 engagements » pages métiers (2×3) trop haut → bande compacte | **READY_FOR_QA** | `62f9920b` | navigateur : 1440 = **6 items une ligne** (grille 260px vs ~480px), 1024 = **3+3**, 390 = stack ; **CSS only** (HTML inchangé → contenu/SEO/a11y conservés) ; 7 pages métiers | `DESKTOP_6_ITEMS_ONE_ROW=PASS · TABLET_ADAPTIVE=PASS(3+3) · MOBILE=PASS(stack) · SHARED=7pages · CONTENT_PRESERVED=PASS · A11Y=PASS` | validation Florian |
| TRD-2 | QA-observée (5451558329) | P1 | RSP-1 résiduel : header ancien pages métiers masque n° tél seulement ≤979px → overflow 980-1100 | **READY_FOR_QA** | `11431255` | navigateur 1024 : overflow 1098→0, n° tél masqué ≤1100 (bouton icône conservé) ; 7 pages | anomalie observée pendant QA du bloc engagements, corrigée atomiquement | validation Florian ; **reste = sweep large** (≈134 autres pages à header ancien) |
| QUA-1 | #9 T12 | P1 | Qualité front (console/liens/alt/H1) | **READY_FOR_QA** | `dbe68255` | — |
| RSP-1 | 5438239688 T8 / 5450159091 | P1 | Responsive 320→1920 + a11y ; overflow horizontal ≤1100 (header actions) | **READY_FOR_QA** | `8c3a65ae` | PAGE_HORIZONTAL_OVERFLOW=0 à 1440/1024/768/390/375 (home+catalogue) | fix : masque n° tél header ≤1100 (icône seule) + marquee-wrap overflow-x:clip ; animation desktop intacte | QA visuelle Florian |
| SEO-1 | 5438239688 L1 | P1 | Audit SEO technique (baseline saine) | **READY_FOR_QA** | `711a3204` | — |
| SEO-2 | 5438239688 L2/3/9 | P1 | Architecture locale + contenu + tests garde-fous SEO | **BACKLOG** | — | séquencer |
| SEO-3 | 5438239688 L4-8 | P2 | GBP/backlinks/tracking/Ads | **BLOCKED_HUMAN** | plans | accès comptes Google |

| SEO-4 | 5450850610 / 5450879322 | P1 | Audit + BASELINE factuelle visibilité IA (GEO/AEO) + SEO local | **BASELINE LIVRÉE** (implémentation P1 après GO) | `9bcf3569`,`aab39c08` | inventaire URL réel + crawlers datés + panel 64 requêtes | `AI-VISIBILITY-GEO-AEO-AUDIT.md` + `GEO-BENCHMARK.md` | GO Florian P1 (hôte canonique, validation schema, doorway) + actions humaines |

## Zone GATES DB / RELEASE
| ID | source | prio | demande | statut | reste |
|---|---|---|---|---|---|
| REL-1 | #9 T11 | P1 | Release flow /recette.html 4 états | **BLOCKED_HUMAN** | migration 4 tables (GO DB) |
| MIG-1 | #9 | P1 | Migrations durcissement (leads/storage/app_settings) | **BLOCKED_HUMAN** | GO apply |
| RC-1 | 5451349606 | P0 | Doc unique Release Candidate `docs/release/GO-LIVE-CHECKLIST.md` (A validations humaines / B auto-cert Claude / C bloquants prod / D RC / E post-GO) — GO/NO-GO en 10-15 min | **READY_FOR_QA** (RC_STATUS=NOT_READY) | tenu à jour ; `RC_STATUS=NOT_READY PROD_BLOCKERS=2 HUMAN_CHECKS=5 TECH_CHECKS_PASS=11/18 GATED_ACTIONS=6 RC_SHA=none` ; figer RC1 après SEC-3+SEC-2 |

## Synthèse
- **OPEN_P0** : CMD-1..4 (READY_FOR_QA), SEC-1/3, MET-1, RUN-3(en cours), CMD-6/SEC-3 (BLOCKED gate Stripe).
- **BLOCKED_HUMAN** (gates) : Stripe (sk_test_ + edge), migrations DB, runner (secret+merge+branch protection), release UI, GBP/Ads.
- **BACKLOG safe** : CMD-5 (retrait ancien code), TUN-2, SEC-5 (C→J), SEO-2, CLN-3.
- **CLOSED** : RUN-2 (persistance, non-prod prouvé).
> Aucune tâche PROD_DEPLOYED (aucune promotion prod effectuée). Aucune QA_APPROVED (attente validation Florian).
