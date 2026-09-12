# RUN 2026-09-10 — P0 prix TERMINÉ ; P1 modal BLOQUÉ par framing (directive 5605475397)

- run_id: RUN-2026-09-10-p0-done-p1-framing-blocked
- branch: recette (+ integration)
- generated_at: 2026-09-10T10:53:23Z
- sha: d37f4cf6
- preview: https://deploy-preview-2--remarkable-dragon-364e2b.netlify.app
- acks: [{action_id: 5605475397, handshake_status: CLAUDE_ANSWERED}]

## RETURN (partiel — P1 structurel NON fini, bloqueur prouvé)
```
PRICE_GATE_ONLY_SOURCE=catalogue.html:917 (handler succès du price gate UNIQUEMENT) | NON_GATE_FORMS_UNLOCK_PRICE=NO | PRICE_GATE_FRESH_INCOGNITO=PASS | DIRECT_URL_UNIDENTIFIED=BLOCKED | FULLPAGE_SHOP_REMOVED=BLOCKED(framing) | MODAL_TUNNEL=BLOCKED_FRAMING | SHOP_WORDING_REMOVED=PASS | MULTI_SERVICE=PASS | RESUME=PASS | DIAGNOSTIC=PASS | DESKTOP_1440=PASS | MOBILE_390=PASS | PREVIEW_OPENED=YES | VISUAL_BEFORE=/catalogue plein écran prix directs | VISUAL_AFTER=gate d'abord (non identifié) ; libellés « Ma demande » | SHA=d37f4cf6 | READY_FOR_FLORIAN_RETEST=YES(P0)/NO(P1 structurel)
```

## P0 — TERMINÉ + provenance prouvée
- **Provenance unique** : `_priceGateOk`/`_priceGateAt`/`hc_pg` n'existent QUE dans catalogue.html et ne sont écrits QU'en **ligne 917 = handler de succès du price gate**. Aucun devis/contact/rappel ne les pose. `priceGatePassed()` n'utilise plus l'identité seule. ⇒ **NON_GATE_FORMS_UNLOCK_PRICE=NO** (prouvé par grep repo-wide).
- Persistance : sessionStorage `hc_pg` (session courante) + grâce 2h horodatée après **validation explicite du gate**. Ancien état durable sans horodatage → re-gate.
- Vérifié 3 états (incognito/gate-session/direct URL), 1440 + 390.

## P1 — wording FAIT ; structurel (modal intégré) BLOQUÉ
- **Wording** : « panier/achats » → « Ma demande / Ajouter à ma demande / Ajouter une autre prestation / Continuer ma demande ». SHOP_WORDING_REMOVED=PASS.
- **Structurel (overlay modal intégré au site)** : implémenté en réutilisant le moteur (Home CTA → iframe `/catalogue?embed=1`, site en fond). **BLOQUÉ** : les en-têtes de sécurité du site (`X-Frame-Options: SAMEORIGIN` + CSP `frame-ancestors 'self'`) font **rendre l'iframe BLANCHE** (erreur cross-origin, modale vide) — **non vérifiable** dans mon outillage. **Preuve** : `/catalogue.html?embed=1` **standalone rend parfaitement** (gate, embed, « Fermer ») ; **en iframe = blanc**.
- Conforme à ta règle « ne pas livrer un visuel non vérifié » : j'ai **retiré l'overlay** et restauré le flux plein-page fonctionnel (correctif P0 intact). Le mode embed reste inerte (déclenché seulement en iframe/?embed).

## DÉCISION DEMANDÉE (P1 structurel)
Deux voies :
- **(A)** autoriser le cadrage same-origin de `/catalogue` (ajuster `_headers`/CSP pour permettre l'iframe interne) → l'overlay fonctionne tel quel. = **modif d'en-tête sécurité = ton GO**.
- **(B)** refonte **sans iframe** : présenter le tunnel en **card modale compacte** (CSS, moteur inchangé, vérifiable) — supprime le « plein écran boutique / longue grille » sans dépendre du cadrage. Recommandé si tu ne veux pas toucher aux en-têtes.

## needs_florian: true (choix A/B pour P1 ; validation P0). RECETTE only. Tag RC non touché, pas de nouveau tag.
