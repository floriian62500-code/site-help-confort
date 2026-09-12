# Tracking & Acquisition — Readiness campagne Entretien 2026–2027 (LOT J)

> **Documentation seule.** Aucune dépense, aucun envoi, aucune clé, aucune modification de la RC visuelle.
> Directive 5645034544 (LOT J). Branche `recette`. À activer seulement après validation Florian.

## 0. Bloqueur d'activation (HUMAN_GATED)
- **GA/GTM non configuré** : l'ID de mesure est le **placeholder `G-XXXXXXXXXX`** dans les pages. Le pont d'événements existe (`track()` → `dataLayer.push({event:'hc_'+ev})`) mais **aucune donnée n'est collectée**.
  - Action exacte Florian : fournir l'**ID GA4 réel** (`G-…`) + décider GTM vs gtag direct + **Consent Mode v2** (bandeau consentement déjà présent — à câbler). Puis remplacer le placeholder (changement config, à faire hors gel visuel).

## 1. Taxonomie d'événements — EXISTANT (déjà émis par `track()`)
Pont : `catalogue.html:861` → `window.__hcFunnel` + `dataLayer.push({event:'hc_<ev>'})`.

| Événement interne | dataLayer | Étape funnel |
|---|---|---|
| `step_<launcher…confirm>` | `hc_step_*` | progression tunnel |
| `price_gate_open` | `hc_price_gate_open` | ouverture gate tarifs |
| `price_gate_lead` / `price_gate_lead_fail` | `hc_price_gate_lead*` | **lead consultation_tarifs** |
| `add_to_cart` | `hc_add_to_cart` | ajout prestation |
| `devis_submit` / `lead_submit_success` | `hc_*` | soumission devis / lead |
| `photo_upload_failed` | `hc_photo_upload_failed` | échec photo (non bloquant) |
| `confirmation` | `hc_confirmation` | **réservation/demande finalisée** |

## 2. Événements À AJOUTER pour le funnel Entretien (spéc, non implémentés)
> Implémentation = post-arbitrage (touche le JS des pages en QA). Spécification uniquement ici.

| Événement | Déclencheur | Params |
|---|---|---|
| `view_offer_entretien` | affichage bloc/offre entretien | `formule` (basic/confort/securite), `energie` (gaz/fioul/adoucisseur) |
| `click_entretien_ponctuel` | clic « entretien ponctuel » | `metier` |
| `click_contrat` | clic « souscrire contrat » | `formule` |
| `form_start` | 1er focus champ formulaire | `form_type` |
| `lead` | lead créé (déjà ≈ `lead_submit_success`) | `form_type`, `value_estimee` |
| `reservation` | réservation intervention | `montant_ttc` |
| `contrat` | contrat entretien signé/soumis | `formule`, `mrr` |
| `click_telephone` | clic `tel:` | `page`, `zone` |
| `rappel` | demande de rappel | `page` |

Règles : **déduplication** par `event_id` (uuid client) ; **attribution UTM** capturée au 1er hit (persistée en `sessionStorage`, jamais en URL de destination), rattachée à chaque lead/contrat.

## 3. Plan de nommage UTM (Meta / Google / SMS / email)
Format : `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term`.
- **source** : `google` | `meta` | `sms` | `email` | `gbp` (fiche Google) | `direct`.
- **medium** : `cpc` (Ads) | `paid_social` | `sms` | `email` | `organic` | `referral`.
- **campaign** : `entretien-2026-hiver`, `entretien-2027-printemps`, `depannage-urgence`, `contrat-annuel` (kebab, saison-année).
- **content** : variante créative `visuel-a` / `visuel-b` / `carrousel` / `sms-relance-1`.
- **term** : mot-clé (Search) ou segment (`gaz`, `fioul`, `adoucisseur`).
Exemple : `?utm_source=meta&utm_medium=paid_social&utm_campaign=entretien-2026-hiver&utm_content=visuel-a`.

## 4. Tableau de mesure (funnel acquisition)
| Étape | Événement | KPI |
|---|---|---|
| Impression / clic | (plateforme) | CTR, CPC |
| Visite qualifiée | `view_offer_entretien` | coût/visite |
| Lead | `lead` | **CPL** |
| Lead qualifié | `lead` + rappel/RDV | coût/lead qualifié |
| Réservation | `reservation` | coût/réservation |
| Contrat | `contrat` | **CAC**, MRR, LTV/CAC |
Objectif de pilotage : CPL → lead qualifié → réservation → **contrat** (chaîne complète attribuée UTM).

## 5. Structure campagnes (DOCUMENTATION — aucun lancement, aucun budget)
- **Google Ads** : 1 campagne Search « Entretien chaudière Saint-Omer / Audomarois » (groupes : gaz / fioul / adoucisseur) + 1 Performance Max secondaire (à valider). Zones = Saint-Omer + areaServed (Calais, Boulogne, Dunkerque, Côte d'Opale). **Aucune agence physique Dunkerque** dans les annonces.
- **Meta Ads** : 1 campagne notoriété locale (rayon agence) + 1 conversion « lead entretien » (formulaire natif OU redirection tunnel).
- **Budget / enchères / créa finale** = à décider avec Florian. Rien n'est activé ici.

## 6. SMS / email (plan, AUCUN envoi)
- **Base légale / consentement** : opt-in explicite requis (RGPD) ; segmenter uniquement les contacts avec base légale valide ; lien de désinscription obligatoire ; pas de prospection SMS sans consentement.
- **Segments** : clients entretien échu (relance annuelle), leads non convertis (< 90 j), clients dépannage sans contrat (cross-sell contrat).
- **Séquences** (spéc) : relance échéance J-30 / J-7, réactivation lead J+3, cross-sell contrat après intervention.
- **Retargeting** : audiences à partir des événements funnel (respect consentement) — configuration ultérieure.

## 7. Récap blockers (actions exactes Florian)
| Item | Action exacte | Gate |
|---|---|---|
| GA4 réel | fournir `G-…` + Consent Mode v2, remplacer placeholder | config (hors gel visuel) |
| Événements entretien | implémenter §2 dans le JS | post-arbitrage visuel |
| Comptes Ads | créer/associer, définir budget | humain + budget |
| Base SMS/email | valider base légale + outil d'envoi | humain + juridique |
| Offre/prix/créa | valider message final | humain |
