# RUN 2026-09-18 — Préparation Google Ads + Meta Ads « entretien » (directive 5728009113)

- run_id: RUN-2026-09-18-ads-prep-entretien
- branch: recette (+ integration/lot1-lot2-vs-prod) : code `f5090c4b`, docs à suivre
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/ (sert `f5090c4b`)
- ack : 5728009113 → CLAUDE_ANSWERED
- **Préparation uniquement** : aucune campagne créée, aucun budget, aucune balise publicitaire, aucune publication externe, rien sur main ni en PROD.

## Livraison
| Élément | Commits | Preuve |
|---|---|---|
| Pages d'atterrissage chaudière et ramonage (bouton unique, vrais prix, promesses exactes, mesure) | `08cebf89` | tests `ads-landing` |
| Dossier d'acquisition `docs/marketing/PAID-ACQUISITION-ENTRETIEN-2026-09.md` ; page chaudière sans promesse hors catalogue (priorité, SÉCURITÉ < 5 ans, rappel 1 mois, granulés, aides, qualifications, FAQ = données structurées) | `2cee3a80` | 4 nouveaux tests, en échec sur `08cebf89` |
| Page chaudière lisible en 390 (tableau des formules en cartes) | `7b1a1bfe` | preview 390 : 0 débordement (avant : page à 502 px) |
| Build Netlify annulé à tort (« no content change » : sans cache, CACHED_COMMIT_REF = COMMIT_REF) | `28677e61` | simulation 4 cas ; build suivant déployé |
| Prix jamais coupés en fin de ligne (390) | `8ccccd6d` | capture 390 |
| Prix et téléphone de l'accroche centrés en 1440 ; contrôle smoke « Home » aligné sur le libellé du 18/09 | `f5090c4b` | preview 1440 : centres 713 = 713 ; smoke 18/18 |

## Vérifications sur la Deploy Preview (18/09, `f5090c4b`)
- Page chaudière : 1440 bouton 503–557 px / 900, accroche centrée, tableau 4 colonnes ; 390 bouton 597–650 px / 844, formules en cartes (350 px), 0 débordement. Événements : vue, bouton, appel page + en-tête, lien contrats.
- Page ramonage : 1440 bouton bas à 721 px ; 390 bouton 570–627 px, 0 débordement. Événements : vue, bouton, appel page + en-tête ; envoi confirmé via l'événement de succès déclenché à la main (**formulaire jamais soumis**).
- Tunnel entretien (lien de la page chaudière, envoi simulé) : gaz en 1440, fioul en 390. `start_maintenance_funnel` → `maintenance_contact_entered` → `maintenance_submit` + `generate_lead` (`service_family=chaudiere`, `simulated=true`). Coordonnées non redemandées, prix identiques à la page (121 € / 178,20 € TTC), 0 débordement sur les 7 étapes.
- Aucune requête vers GA4, Google Ads, Meta ou le serveur de dossiers ; aucune donnée personnelle dans les événements.

## Tests
ads-landing 23/23 · demande-v2 165/165 · lead-cycle 67/67 · price-gate 29/29 · panier 12/12 · en-tête 15/15 · SEO ERRORS=0 · smoke (preview) 18/18.

## Statut
ADS_PREP=PASS · BOILER_CAMPAIGN=READY · STOVE_INSERT_CAMPAIGN=BLOCKED · CHIMNEY_SWEEP_CAMPAIGN=READY · LANDINGS=PASS · TRACKING=PARTIAL · GOOGLE_ADS_PACKAGE=PASS · META_ADS_PACKAGE=PASS · CAMPAIGN_GO_LIVE=NO_GO

## Limites (vérité)
- GA4, Google Ads et Meta ne sont pas connectés : la mesure n'est prouvée qu'en recette (`window.__hcFunnel`), d'où TRACKING=PARTIAL.
- Pas de Consent Mode v2 dans la bannière : aucune balise publicitaire ne peut être posée avant.
- La PROD sert encore les anciennes pages (bouton cassé, faux prix) : aucune annonce avant la mise en production.
- Famille poêles / inserts : aucune prestation au catalogue → BLOCKED.

## needs_florian
Oui, pour les décisions et accès du §9 du dossier (gates 1 à 10).
