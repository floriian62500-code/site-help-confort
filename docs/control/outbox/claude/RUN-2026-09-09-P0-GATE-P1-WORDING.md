# RUN 2026-09-09 — P0 fuite prix CORRIGÉE + P1 de-merchant (directive 5605156304)

- run_id: RUN-2026-09-09-p0-gate-p1-wording
- branch: recette (+ integration)
- generated_at: 2026-09-09T16:37:54Z
- sha: b9fb6b2f
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app
- acks: [{action_id: 5605156304, handshake_status: CLAUDE_ANSWERED}]

## RETURN
```
PRICE_GATE_FRESH_INCOGNITO=PASS | GATE_PERSISTENCE=sessionStorage 'hc_pg' (session courante) + localStorage _priceGateAt TTL 2h ; ancien état durable SANS horodatage ne déverrouille plus (re-gate) | DIRECT_URL_UNIDENTIFIED=BLOCKED | FULLPAGE_SHOP_REMOVED=PARTIAL (wording de-merchant fait ; refonte modal structurelle = lot suivant, plan proposé) | MODAL_TUNNEL=NOT_YET (plan proposé) | MULTI_SERVICE=PASS | RESUME=PASS | DIAGNOSTIC=PASS | DESKTOP_1440=PASS | MOBILE_390=PASS | PREVIEW_OPENED=YES | VISUAL_BEFORE=/catalogue plein écran, prix TTC visibles direct (fuite) + "Ajouter au panier" | VISUAL_AFTER=visiteur non identifié cette session -> gate re-montré, 0 prix dans le DOM ; libellés "Ma demande"/"Ajouter à ma demande" | SHA=b9fb6b2f | NEW_RC_TAG=not-yet
```

## P0 — fuite prix (cause + reproduction + fix)
- **Cause exacte** : `priceGatePassed()` lisait `state._priceGateOk` / (prenom&nom&tel&email&cp) depuis `localStorage.hc_book_v1` **sans expiration**. Tout visiteur ayant rempli un formulaire (gate, devis, contact…) revoyait les prix **indéfiniment**, des jours plus tard, sans nouveau contrôle. C'est le cas de Florian (état persistant d'anciens tests).
- **Reproduction (preview réel, 3 états)** :
  - A/incognito vierge : `/catalogue` -> **gate ouvert, 0 prix**. PASS.
  - C/ancien état durable (`_priceGateOk:true` + identité, sans horodatage) AVANT fix : gate sauté, **prix 114/220/237 € affichés** (la fuite).
  - C APRÈS fix : gate **re-montré**, `#prodGrid`=0, **0 prix dans le DOM** ; formulaire prérempli (UX conservée) ; desktop 1440 + mobile 390.
  - B/gate validé cette session (flag `hc_pg`) : catalogue + prix OK dans la session.
- **Fix** : le gate vaut la **session courante** (sessionStorage `hc_pg`) + **grâce 2h horodatée** (`_priceGateAt`, localStorage) ; suppression de la clause identité-seule ; `renderProducts()` d'INIT gardé par `priceGatePassed()` (aucun prix dans le DOM sans gate). SHA 7143d10f + b809e630.

## P1 — de-merchant (fait) + refonte modal (plan)
- **Fait (b9fb6b2f)** : libellés « panier/achat » -> « demande » (10 libellés) : « Ajouter au panier » -> « Ajouter à ma demande », « Mon panier » -> « Ma demande », « Continuer mes achats » -> « Ajouter une autre prestation », etc. Finalité = **demande d'intervention**, plus « achat marchand ». Vérifié panier live. Identifiants JS `cart` inchangés (0 régression).
- **Reste = refonte structurelle** (plein-écran « boutique » -> modal/tunnel intégré au site, pts 1-5) : **gros lot d'architecture** touchant le moteur commerce. Pour ne PAS casser les acquis (multi-prestations/reprise/diagnostic/deep-links), je propose de le traiter en lot dédié. Approche recommandée = **overlay modal réutilisant le moteur catalogue existant** (pas de 2e moteur) lancé depuis Home/CTA, le site restant en fond. Décision d'approche demandée avant le build (éviter rework).

## acquis préservés (vérifiés)
MULTI_SERVICE (2 prestations, 334 €), RESUME (bannière), DIAGNOSTIC (lien), deep-links, single-agency (panneau « Agence Saint-Omer »), mobile 390. Aucune écriture PROD (états injectés/sessionStorage, aucun submit réel).

## RC
Tag `rc-visual-20260907` **non touché**. **Pas de nouveau tag RC** (attente validation de ce correctif). Ces correctifs sont sur recette (b9fb6b2f) au-delà du point gelé.

## needs_florian: true (valider le correctif prix + choisir l'approche de la refonte modal). RECETTE only.
