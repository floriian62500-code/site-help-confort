# UNIFIED-REQUEST-FUNNEL — tunnel de demande unique (issue #9 / 5438265921)

> `recette`. Objectif : une seule source de saisie, pleine page, réutilisée par Contact/Home/métier/prestation/catalogue. Aucune donnée métier supprimée. 2026-08-27.

## 1. INVENTAIRE des formulaires/moteurs (réel)
| Moteur / form | Emplacement | Complétude | Endpoint | Décision |
|---|---|---|---|---|
| **Wizard Home** | `index.html` `#hc-reservation` (4 étapes) | ★★★ routing urgence/devis/rappel/callback, validateurs hoistés, BAN, catalogue, cart-ready | `submit-lead-v6` | **SOURCE UNIQUE retenue** |
| Form Contact | `contact.html` (1 `<form>`) | ★★ form classique embarqué + navigation complète | `submit-lead-v6` | à alléger → CTA ouvre le tunnel |
| Modale réservation | `hc-reserve-modal.js` (26 pages) | ★★ modale ; paiement gelé | lead | à converger vers le tunnel |
| Forms métier×ville | plombier/chauffagiste/electricien/menuisier/pmr… | ★ formes variables | submit-lead | CTA → tunnel préremplit métier |
| Forms prestations/ | ~35 pages | ★ | submit-lead / contact | CTA → tunnel/catalogue famille |
| devis-express, contrats-entretien, carrieres | pages dédiées | ★ | submit-lead (form_type) | conserver form_type, converger UI |

Composants réutilisables existants : `hc-form-validation` (47), `hc-form-autocomplete` (73), `hc-address-autocomplete` (4), `hc-leads-capture` (79), `hc-modal-prefill` (57), `hc-cart` (nouveau).
Endpoints : **`submit-lead-v6`** (canonique, validation+rate-limit+honeypot) ; ⚠️ 2 appels directs `/rest/v1/leads` (P1 anon insert, à supprimer côté front — voir SECURITY-AUDIT).

## 2. SOURCE UNIQUE = le wizard Home (`#hc-reservation`)
C'est déjà le plus complet et le mieux testé (validateurs hoistés T2, BAN, anti-double-clic `dataset.sending`, resaMsg erreurs, catalogue). On l'**extrait** en moteur réutilisable plutôt que d'en réécrire un nouveau.

## 3. Architecture cible
- **Route dédiée plein écran** : `/demande` (nouvelle page légère qui monte le moteur wizard), + ancre `#hc-reservation` conservée pour compat. `noindex` (le tunnel ne concurrence pas le SEO ; `/contact` reste la landing indexable, canonical propre).
- **Shell tunnel** : logo discret + progression (étapes) + aide/téléphone + **sortie explicite « Quitter »**. **Pas** de menu principal ni liens de distraction pendant la saisie.
- **Type de parcours** (frontière claire, §24) : `demande/devis/diagnostic` (lead, sans paiement) vs `achat/réservation prix ferme` (catalogue/panier → pricing serveur = gate). Même shell, étapes/confirmation adaptées.
- **Prefill contexte (§21-22)** : query `?source=&metier=&famille=&prestation=&zone=` → préremplit ; **validation serveur des IDs/valeurs autorisées** (jamais le client comme source de vérité). Compatible panier `hc_cart_v1` (ne le perd pas).

## 4. Brouillon / reprise (§7-10, §28 vie privée)
- Autosave brouillon client (`hc_request_draft_v1`) **minimal** : type de besoin, métier/famille, description, étape courante. **Pas** de PII sensible (tel/email/adresse) en localStorage sans besoin réel de restauration → à confirmer ; par défaut restaurer seulement le contexte non-sensible + re-saisie coordonnées.
- Restauration après refresh/nav accidentelle : message « Votre demande en cours a été restaurée ». TTL raisonnable (ex. 24 h). **Nettoyage après envoi réussi**.
- Photos : ne jamais prétendre restaurer un `File` (interdit navigateur) → afficher « pièce à resélectionner ».
- `beforeunload` **uniquement** si brouillon non sauvegardé le justifie (pas de blocage artificiel §6).

## 5. Validation / robustesse (§11-16)
- Erreur inline sous champ + `aria-invalid`/`aria-describedby` + focus/scroll 1re erreur + disparition à correction (déjà : validateurs hoistés).
- Bouton Continuer jamais désactivé sans explication (déjà : `tryNext`).
- **Anti-double-submit/idempotence** (déjà `dataset.sending` ; renforcer côté serveur = edge).
- Erreur réseau/API : conserver les données + erreur actionnable + réessai sans doublon (déjà `resaMsg`/`resaErrorText`).

## 6. Sécurité / vie privée / tracking / SEO / perf
- Sécurité : sanitation, validation serveur (edge), pas de PII en URL/log analytics (déjà : PII en localStorage, pas URL), rate-limit/honeypot serveur (edge).
- Tracking (§29) : ouverture tunnel, étape atteinte, erreur agrégée, abandon, succès — **sans valeurs personnelles**.
- SEO (§30) : tunnel `noindex` ; `/contact` reste indexable.
- Perf (§31) : tunnel léger, pas de sections marketing chargées pendant la saisie.

## 7. Tests (§32-33) & rollback
- E2E : Contact→tunnel→succès ; Home→tunnel ; métier→tunnel prérempli ; panier→tunnel ; refresh étape 2/3 ; back/forward ; quitter avec/sans brouillon ; erreurs email/tél/adresse ; API 500/offline ; double clic ; mobile 375 ; clavier ; reprise après refresh.
- Rollback : la route `/demande` est additive ; `#hc-reservation` reste. Retrait du form Contact **seulement après** preuve E2E du tunnel. Tags savepoint avant retrait de code.

## 8. Sous-lots (implémentation séquencée)
- **S1 (ce cycle)** : inventaire + source unique + architecture (ce doc). ✅
- S2 : route `/demande` plein écran montant le moteur wizard (shell sans nav + sortie).
- S3 : autosave/restore brouillon (contexte non-sensible) + tests.
- S4 : prefill contexte via query + compat panier + deep-links CTA.
- S5 : alléger `/contact` (CTA « Démarrer ma demande » → tunnel) ; retrait form embarqué après preuve.
- S6 : mutualiser progression/validation/coordonnées/confirmation/tracking.
- S7 : nettoyage formulaires orphelins après migration + smoke/E2E.
> Chaque S = correction → tests → commit atomique → SHA. Paiement (prix ferme) = **gate** (pricing serveur + Stripe TEST).

## Retour type
`INVENTAIRE ✓ | SOURCE UNIQUE = wizard Home #hc-reservation | ROUTE cible /demande | FAIT S1 (doc+inventaire) | TESTS smoke 13/13 | SHA <à venir> | FORMULAIRES SUPPRIMÉS: aucun (après preuve tunnel) | RISQUES: refonte UI multi-pages = QA visuelle | BLOQUÉ: paiement (gate) | RESTE: S2-S7`
