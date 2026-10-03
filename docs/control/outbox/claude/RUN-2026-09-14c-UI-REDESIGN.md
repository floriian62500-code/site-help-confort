# RUN 2026-09-14c — Recomposition UI tunnel premium (directive 5665428561 / relance 5667335051)

- run_id: RUN-2026-09-14c-ui-redesign
- preview branch: recette — **nouveau front RC = 701f64d3** (redesign tunnel, sur refus visuel Florian)
- acks: [{action_id: 5665428561, handshake_status: CLAUDE_ANSWERED}, {action_id: 5667335051, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
DIRECTIVE=5665428561 | PREVIEW_BEFORE_OPENED=YES | UI_RECOMPOSED=YES | PRICE_GATE_VISUAL=PASS | SERVICE_TUNNEL_VISUAL=PASS | SHOP_DASHBOARD_FEEL_REMOVED=YES | PRICE_GATE_FUNCTIONAL=PASS | MULTI_SERVICE=PASS | DESKTOP_1440=PASS | MOBILE_390=PASS | PREVIEW_AFTER_OPENED=YES | CONSOLE_APP=CLEAN | NETWORK_APP=CLEAN | SHA=701f64d3 | PREVIEW_URL=https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app/catalogue.html | READY_FOR_FLORIAN_RETEST=YES
```
Complément format 5665428561 : `VISUAL_REDESIGN=PASS | FULLPAGE_DARK_SHELL_REMOVED=PASS | TRUE_OVERLAY_DESKTOP=PASS | PREMIUM_GATE=PASS | SAAS_DASHBOARD_FEEL=REMOVED | ECOMMERCE_FEEL=REMOVED | VISUAL_ISSUES_FOUND=1 | VISUAL_FIXES_DONE=1 | FUNCTIONAL_REGRESSION=0`

## Ce qui a été recomposé (source, pas patch cosmétique empilé)
1. **Fin du shell sombre "dashboard"** : suppression du grand fond marine plein écran (`body::before`) → **backdrop clair léger** (le site est suggéré derrière). `html`/`body` clairs.
2. **Surface unique premium** : carte **ivoire ~880px**, arrondie, ombre douce, peu de bordures (fini "carte dans carte" lourde).
3. **En-tête modale simple** : petit logo + repère besoin + Fermer ; plus de bandeau institutionnel. Progression discrète (barre fine bi-ton, pas de stepper SaaS).
4. **Gate premium** : titre `Consultez nos tarifs`, **3 champs** (Prénom/Téléphone/Email) avec **vrais labels**, marque « ▪ SAINT-OMER », bandeau confiance à pictos (`Réponse locale · Données confidentielles · Sans engagement`), zéro espace mort. Adresse/CP/ville collectés à l'étape Lieu (front `form_type=rappel`, **edge inchangé**).
5. **Prestations = services** : vignettes marchandes retirées (`.prod-img` masqué), cartes sobres, CTA `Ajouter à ma demande` / `Voir la prestation` ; wording service-first.
6. **Mobile 390** : sheet premium plein écran ; **barre panier mobile masquée pendant le gate** (défaut trouvé et corrigé dans ma propre QA) ; 0 overflow.

## QA visuelle réelle (Deploy Preview, 1440 + 390, session fraîche)
- Gate (1440 + 390) : premium, clair, 3 champs, pas de boîte beige générique. `PRICE_GATE_VISUAL=PASS`.
- Tunnel post-gate (1440) : surface ivoire claire, cartes service sobres, **plus de fond marine dashboard**. `SERVICE_TUNNEL_VISUAL=PASS`, `SHOP_DASHBOARD_FEEL_REMOVED=YES`.
- Multi-prestations : « Ma demande (2) ». Deep-link `#cat=plomberie` rend les prestations. Diagnostic → écran diagnostic.
- **Price gate strict conservé** : incognito frais → gate/0 prix ; direct `#step=cart` non identifié → gate/0 prix. `PRICE_GATE_FUNCTIONAL=PASS`, `FUNCTIONAL_REGRESSION=0`.
- Console : uniquement bruit externe drawer Netlify (absent prod). Réseau : lectures Supabase OK, **aucun submit PROD**.

## Discipline
RECETTE uniquement. Moteur métier inchangé. **Aucun backend/Stripe/Edge touché** (form_type gate changé côté FRONT seulement). Nouveau front RC `701f64d3` (remplace `e0ccd63e`) — changement visible **demandé par Florian**. Aucun tag RC, aucun main/PROD.

## needs_florian
- true : **retest visuel Florian** du nouveau tunnel (`701f64d3`). Florian = juge final.
