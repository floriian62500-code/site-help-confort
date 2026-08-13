# Outbox — Reprise & finalisation Help Confort (2026-08-13)

- **in_reply_to** : directive Florian « PRIORITÉ ABSOLUE — REPRISE ET FINALISATION » (chat)
- **handshake_status** : CLAUDE_ANSWERED
- **branch** : integration/lot1-lot2-vs-prod + recette
- **needs_florian** : false (sauf gate runner = repo PRIVATE, déjà documenté CP-0011)
- **règle appliquée** : réponse outbox **dédiée** (fin de l'empilement dans CP-0001.md).

## État initial (relu)
CP-0001→0011 + AUDIT-MASTER relus. Principe appliqué : rien n'est « fait » sans **preuve de test réelle** sur recette. Runner = gated (repo PUBLIC) → chantier site poursuivi en parallèle.

## Travaux exécutés + preuves

### 1. Re-contrôle réel des 7 corrections annoncées (item 6) — 8/8 PASS
Vérif live sur `deploy-preview-2` (curl, marqueurs positifs + négatifs) :
- `home-wizard-freeze v2` : bouton « Réserver ma prise en charge » présent, « Confirmer & payer en ligne » **absent** ✅
- `wizard-funnel v2` : « Réservable en ligne » **absent** ✅
- `zones-map v2` : `.hc-map-container{border:0;…box-shadow:none}` servi ✅
- `menuiserie-cards v2` : cartes → `prestations/porte-entree`, plus de `#sec-menuiserie` ✅
- `porte-entree v2` : « Questions fréquentes » propre, `frÃ©quentes` **absent** ✅ + promesse dé-dupliquée ✅
- `tarif-lead v2` (CP-0003) : `id="catalogRoot" data-review-id="tarif-lead"` (ancre statique) servie ✅
- `home-desktop-width` : ancre présente ✅
→ **Aucune régression. Les corrections fonctionnent réellement en recette.**

### 2. Test non-régression centre de validation (item 5) — 15/15 ancres
Chaque MOD à ancre visuelle : `data-review-id="<id>"` **servi** sur son URL cible (home ×3, zones-map, tarif-lead, real-routing, menuiserie/porte-entree/garage/fenetres/portail, chauffage/plomberie/electricite/vitrerie/volets-cards). Le 16e MOD `sitemap` = contrôle technique auto (`tech:true`, pas d'ancre) → conforme.
→ **Plus aucun « section non trouvée ». Le centre est fiable.** (Le fix CP-0003 : MutationObserver + bandeau safe-area/anti-coupure + z-index au-dessus des modales couvre aussi les ancres à rendu dynamique.)

### 3. Corrections audit P2/P3 (cycle précédent, live) — rappel
`A-2026-013` (title PMR dé-dupliqué), `A-2026-017` (titles Dunkerque au gabarit 59140), `A-2026-018` (double-espace urgence) : **corrigés + vérifiés live**. `A-2026-019` requalifié faux positif (Hansgrohe ≠ Grohe). `A-2026-001` (24 pages), `A-2026-002` (nos-prestations + résidus E2E), `A-2026-003` (espace-client) : corrigés + vérifiés.

## Tests / preuves
- Re-vérif corrections : **8/8 PASS** (curl recette).
- Non-régression centre : **15/15 ancres** servies.
- Titres corrigés : servis live (« Plombier Dunkerque (59140) — … », title PMR distinct, 0 double-espace).

## Anomalies détectées ce run
- `A-2026-019` = faux positif (Hansgrohe). Requalifié.
- (aucune régression sur les corrections annoncées.)

## Reste à faire (backlog exécutable, ordre)
1. **Item 4 — E2E funnels/formulaires réels** : happy path + invalides + réseau coupé + backend 400/500 + double-clic + back/refresh + routage SO/DK + **création lead réelle vérifiée en base** + anti-doublon + **nettoyage des leads de test**. (Écriture DB → à mener avec nettoyage.)
2. **Item 4 — responsive réel** 320→1920 px sur pages représentatives (captures).
3. **P1 restant** : `A-2026-002` garanties/contact (honnêteté paiement, distinguer lien Stripe staff post-intervention).
4. **P2** : SEO bi-ville (005/006), satellites minces (007/008/009 + formulaire lead), taxonomie (010/011), maprimeadapt (012), titles core longs (014).
5. **Item 7 — A22** : pages dédiées manquantes (serrurerie blindage/dépannage, installation & rénovation élec, dépannage/motorisation volets).

## Gates
Aucune PROD. Stripe LIVE gelé. Aucun secret. Tout sur integration/recette. Runner autonome désactivé tant que repo PUBLIC.

## next_action
Exécuter l'item 4 (E2E funnel wizard + formulaire lead réel avec nettoyage) puis responsive 320→1920, en corrigeant au fil de l'eau ; puis P1 garanties/contact.
