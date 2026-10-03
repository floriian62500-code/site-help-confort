# Mesure d'audience

> Mise à jour : 2026-09-20. Principe : **rien ne sort du navigateur avant le consentement, et jamais
> de donnée personnelle.**

## Les trois couches

| Fichier | Rôle |
|---|---|
| `assets/hc-consent.js` | bandeau de consentement ; publie sa hauteur (`--hc-consent-h`) ; émet `hc-consent-granted` |
| `assets/tracking.js` | charge GA4 **seulement** en production **et** après consentement ; expose alors `window.hcGtag` |
| `assets/hc-landing.js`, `assets/hc-recrutement.js` | mesurent les parcours (entretien, recrutement) |

Corollaire : `window.hcGtag` **n'existe pas** en recette. Les événements y sont consignés dans
`window.__hcFunnel` — c'est ce qu'on inspecte pour vérifier une mesure.

```js
window.__hcFunnel.map(e => e.ev)   // dans la console, sur la preview
```

## Événements

**Parcours entretien** (`<body data-hc-landing="chaudiere|ramonage|contrat|poele">`)
`view_maintenance_landing` · `click_maintenance_cta` · `click_to_call` · `start_maintenance_funnel`
(événement `hc:funnel-start`) · `maintenance_submit` + `generate_lead` (événement `hc:lead-sent`,
émis **après** confirmation du serveur).

**Recrutement** (`<body data-hc-recrutement="hub|offre">`)
`view_recruitment` · `view_job_offer` (avec `job_slug`) · `click_apply` · `start_application` ·
`submit_application` · `generate_recruitment_lead`.

**Relance d'accueil** : `view_home_maintenance_promo` (module à moitié visible, une seule fois) ·
`click_home_maintenance_promo` (avec la famille).

## Garde-fous (respectés par les trois scripts)

1. **Production seulement** : `if (!PROD) return;` avant tout envoi.
2. **Consentement** : passage obligatoire par `window.hcGtag`, qui n'existe qu'après acceptation.
3. **Aucune donnée personnelle** : tout paramètre contenant un `@` ou une suite de 8 chiffres et plus
   est écarté avant l'envoi ; les valeurs sont tronquées à 80 caractères.
4. **Traçabilité en recette** : tout est consigné dans `window.__hcFunnel` (200 entrées max).

Ces garde-fous sont vérifiés par `scripts/tests/ads-landing.test.mjs` et
`scripts/tests/recrutement.test.mjs`, y compris en **exécutant** le script dans un bac à sable.

## Attribution des campagnes

`hc-leads-capture.js` conserve `utm_*`, `gclid`, `fbclid` et les joint au lead (`utm`), avec la
`correlation_id` qui relie l'intention à la demande finale. Rien de tout cela n'est envoyé à GA4.

## Ce qui reste à faire

- Accès GA4 et Search Console : non fournis à ce jour — impossible de vérifier la réception réelle
  des événements côté Google.
- Le tunnel (`catalogue.html`) n'affiche **pas** de bandeau de consentement : décision documentée du
  17/09 (`docs/release/TRACKING-FUNNEL-2026-09-17.md` §4) — les campagnes atterrissent sur des pages
  qui, elles, recueillent le consentement avant d'ouvrir le tunnel.
