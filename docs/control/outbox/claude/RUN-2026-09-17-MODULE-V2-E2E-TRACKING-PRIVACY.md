# RUN 2026-09-17 — Module « Ma demande » v2 : E2E backend, mesure du tunnel, confidentialité

- run_id: RUN-2026-09-17-module-v2-e2e-tracking-privacy
- branch: recette (+ integration/lot1-lot2-vs-prod) — tip `fb1d302f`
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue.html
- acks:
  - 5699304300 (module v2), 5699674592 (admin), 5712974654 (pilotage global) → CLAUDE_ANSWERED
  - 5717182264 (données d'une ancienne demande préremplies) → CLAUDE_ANSWERED : défaut du module confirmé dans le code et corrigé
  - 5713247831, 5717005198, 5717112366, 5717153299, 5717166232 (récapitulatif final + paiement Stripe TEST, notifications agence/client) → CLAUDE_RECEIVED, **non exécutés** : ces directives n'ont pas été transmises dans la session ; la confirmation de Florian est demandée avant tout travail (paiement, edge functions, emails)
  - **Mise à jour 18/09 : exécutés sur recette le 18/09** (retours #9 5727845691, 5728080972, 5728348793) — voir `RUN-2026-09-18-EXECUTION-LOTS-1-7.md`.

## RETURN
```
ADMIN_ACCESS=BLOCKED (correctif recette c59b70bf prêt ; PROD = GO Florian) | MODULE_V2=IMPLEMENTED recette fb1d302f | AGENTS=R1 0/5 · R2 1/5 · R3 4/5 · R4 UX PASS | INTERVENTION_BACKEND_E2E=PASS (Supabase local isolé) | QUOTE_BACKEND_E2E=PASS (local isolé) | MAINTENANCE_BACKEND_E2E=PASS (local isolé : devis « Contrat entretien » + souscription page) — PROD souscription = KO connu | LEADS_DIAG=PARTIEL (chaîne OK, volume faible, trafic non mesurable sans GA4/Search Console) | TRACKING=READY_RECETTE | CAMPAIGN_MAINTENANCE=NO_GO | DOCKER=UP (Colima) | NEXT_ACTION=décisions Florian (ci-dessous)
```
```
MODULE_V2=IMPLEMENTED | INTERVENTION_FLOW=PASS | QUOTE_FLOW=PASS | MULTI_SERVICE=PASS | MOBILE_390=PASS | DESKTOP_1440=PASS | AGENT_ROUND_1=FAIL | FIXES_AFTER_AGENTS=5 lots | AGENT_ROUND_2=FAIL (design PASS) → R3 4/5 → R4 UX PASS | REAL_BACKEND=PASS (stack local isolé) | SHA=fb1d302f | PREVIEW=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue.html | READY_FOR_FLORIAN=YES
```
```
NEW_REQUEST_CLEAN_STATE=PASS | EXPLICIT_RESUME_ONLY=PASS | PII_LOCAL_PURGE=PASS | CLEAR_DEVICE_DATA=PASS | REFRESH_CURRENT_DRAFT=PASS | SHARED_DEVICE_PRIVACY=PASS | PII_NOT_IN_URL=PASS | STORAGE_ROOT_CAUSE=état complet (identité, adresse, description) en localStorage 7 j glissants, conservé après envoi et recopié par « Faire une autre demande » | SHA=fb1d302f | PREVIEW=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue.html
```

## Livré (recette)
| Commit | Contenu |
|---|---|
| `1626b7bd`, `c7d32750` | E2E backend local isolé : parcours v2 construits par le cœur réel du front + souscription entretien ; notification (0 email), photo + rejeu du jeton refusé, relecture des lignes en base, limiteur anti-spam respecté → **25/25 PASS** |
| `f884d9ce`, `af95f2d9`, `d03cee5b`, `700111d5` | Mesure du tunnel (production + consentement uniquement, 0 donnée personnelle), attribution des dossiers, `tracking.js` inerte hors production, CTA accueil, lien `#entretien`, correctif suggestions d'adresse |
| `0b01b834`, `fb1d302f` | Confidentialité : aucune donnée personnelle en stockage durable, reprise explicite, purge après envoi ; P2 revue UX round 4 |

Documents : `docs/release/AGENT-QA-MODULE-V2-2026-09-17.md` (rounds 1–4, QA manuelle, confidentialité), `docs/release/TRACKING-FUNNEL-2026-09-17.md` (leads, GA4, plan d'événements).

## Tests
demande-v2 102/102 · price-gate 29/29 · smoke 16/16 · hc-cart 12/12 · SEO ERRORS=0 · E2E local 25/25 · QA preview 390/1440 (envoi simulé, 0 requête d'envoi) · revue UX round 4 PASS.

## Constats hors code livré
- **Mesure** : `window.gtag` n'a jamais été global. Les événements historiques (clic téléphone, formulaires, CTA, scroll) ne partent probablement pas dans GA4. Non corrigé globalement (décision).
- **Entretien PROD** : la souscription sur `contrats-entretien` affiche toujours succès + erreur (insertion directe `contracts` refusée par la RLS). Correctif en recette, gate documenté dans `docs/control/CONTRACT-RLS-GATE.md`.
- **Entretien recette** : le RIB est « obligatoire » mais n'est transmis nulle part (seul son nom part) ; le message agence indique « RIB fourni : oui ». Décision à prendre : le recueillir lors de la visite technique ou prévoir un envoi serveur sécurisé.
- **Données** : lead réel créé depuis la preview le 17/09 à 12 h 43, à archiver.
- P2 ouvert : bouton retour du navigateur après plusieurs allers-retours « Modifier » (sans perte de données).

## Gates / needs_florian
needs_florian: true
1. GO PROD accès admin (`c59b70bf`, 2 fichiers `admin-pro`), puis connexion sur `/admin-pro/login.html`.
2. Retest visuel du module v2 sur la preview.
3. Confirmer dans la session le traitement des 5 directives récapitulatif/paiement/notifications.
4. Accès GA4 (lecture) + Search Console ; choix bannière de consentement dans le tunnel ; correction des événements historiques.
5. Entretien : décision RIB + GO du lot recette (souscription) avant tout budget Ads.
6. Archiver le lead du 17/09 12 h 43.

Discipline : RECETTE uniquement. Aucun main/PROD, aucun Stripe, aucune migration, aucun email réel. Pile E2E locale arrêtée (`supabase stop`) ; relance : `cd ~/.cache/hc-e2e-ws && bash scripts/test/start-e2e-local.sh`.
