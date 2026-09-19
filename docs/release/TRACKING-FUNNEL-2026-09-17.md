# Leads, trafic et mesure du tunnel « Ma demande » — 17/09/2026 (directive 5712974654, P0.4)

Aucune métrique n'est inventée ici : ce qui n'est pas mesurable avec les accès disponibles est écrit comme tel.

## 1. Trafic ou conversion : ce qui est établi
| Constat | Source | Statut |
|---|---|---|
| Chaîne lead PROD fonctionnelle (submit-lead-v6 → table leads → notification) | journaux edge 04/09 et 17/09 : HTTP 200, aucune erreur | établi |
| Volume faible : 35 leads au total, dernier lead réel le 04/09 | table `leads` PROD (lecture) | établi |
| PROD inchangée depuis le 03/09, aucun CTA cassé relevé | historique `main` + contrôle des pages | établi |
| Lead réel créé par erreur depuis la preview le 17/09 à 12 h 43 | table `leads` PROD | à archiver par Florian |
| **Trafic** (sessions, sources, pages d'entrée, taux de clic CTA) | GA4 / Search Console : **aucun accès** | **non mesurable aujourd'hui** |

Conclusion honnête : on ne peut pas encore départager « peu de trafic » et « trafic qui ne convertit pas ». Il faut les données GA4 et Search Console (§ 5).

## 2. Constat technique : GA4 ne reçoit que les pages vues
- GA4 (`G-YH9GXW6H70`) est chargé par `assets/tracking.js` (60 pages), seulement après consentement (`hc-consent=granted`).
- `assets/tracking.js`, `assets/hc-tracking.js` (113 pages) et `nos-prestations.html` envoient leurs événements via `window.gtag`, qui **n'a jamais été défini globalement** (la fonction `gtag` reste locale à `tracking.js`). Ils se rabattent sur `dataLayer.push({ event: … })`, un format que gtag.js **sans GTM** (identifiant GTM resté factice) ne transmet pas.
- Conséquence probable : clic téléphone, `form_submit`, `cta_click`, profondeur de scroll et web vitals **absents de GA4**. Les clics téléphone/email sont en revanche enregistrés dans Supabase `click_events` (avec consentement).
- Vérification par Florian (2 min) : GA4 → Rapports → Engagement → Événements, 90 jours. Si `click_phone`, `form_submit` et `cta_click` n'y figurent pas, le constat est confirmé.
- Non corrigé globalement, par choix : rendre `window.gtag` global activerait d'un coup une dizaine d'événements sur 60 pages, dont deux `scroll_depth` en double. **Décision Florian.**

## 3. Livré en recette (`f884d9ce` + `af95f2d9`)
Règles d'envoi : domaine de production `depan59-62.fr` uniquement, consentement accordé, jamais en simulation. Émetteur unique `window.hcGtag`, créé par `tracking.js` après consentement. Paramètres en liste blanche : jamais de nom, téléphone, email, adresse ni identifiant de dossier. Les événements émis avant le chargement de GA4 attendent en file. En recette, tout est consigné en mémoire dans `window.__hcFunnel`, et rien ne sort du navigateur.

| Étape de l'entonnoir | Événement | Déclencheur | Paramètres |
|---|---|---|---|
| Visite | `page_view` (GA4 automatique) | chargement accueil / tunnel | — |
| CTA | `hc_cta_click` | clic accueil vers le tunnel | `cta` (hero_intervention, carte_intervention, carte_devis), `target` |
| Démarrage du tunnel | `hc_demande_start` | 1re étape d'un parcours (une fois par session et par parcours) | `mode`, `entry` |
| Progression | `hc_step_view` | chaque étape affichée | `mode`, `step`, `step_index` |
| Accès aux tarifs | `hc_tarifs_access` | formulaire d'accès envoyé | `cat`, `lead` (ok / echec) |
| Ajout d'une prestation | `hc_demande_add` | prestation ajoutée à « Ma demande » | `item` (slug), `cat`, `price_kind`, `lines` |
| Retrait | `hc_demande_remove` | retrait (offres, demande, récap devis) | `item`, `from` |
| Coordonnées | `hc_coordonnees_ok` | coordonnées validées | `mode` |
| Soumission | `hc_demande_submit` | clic d'envoi | `lines`, `quote_lines`, `photos`, `zone`, `lead_type` |
| Lead créé | `generate_lead` | réponse serveur positive | `lead_type` (intervention / devis / entretien), `lines`, `photos` |
| Échec d'envoi | `hc_demande_error` | envoi en échec | `mode` |
| Appel | `hc_call_click` | clic sur le téléphone dans le tunnel | `step` |

Également livré :
- **Attribution des dossiers** : utm, gclid, page d'entrée et site référent mémorisés avec consentement (`hc_utm` / `hc_referrer`), transmis dans `utm.attribution` et `source_referer` des 3 envois (accès tarifs, intervention, devis). Relu en base par l'E2E local.
- **`tracking.js` inerte hors production** : les Deploy Previews n'alimentent plus GA4 et n'écrivent plus dans `click_events` (PROD).
- Preuves : tests `demande-v2` 86/86 et E2E local isolé 21/21.

## 4. Limites et décisions Florian
1. **Pas de bannière de consentement dans le tunnel.** Un visiteur qui arrive directement sur le tunnel sans avoir consenti ailleurs n'est pas mesuré. Si une campagne doit atterrir directement sur le tunnel, il faut choisir : bannière dans le tunnel (avec QA visuelle 390) ou atterrissage sur l'accueil.
2. **Événements historiques** (§ 2) : les corriger ou non.
3. Après mise en PROD : marquer `generate_lead` comme événement clé (GA4 → Admin → Événements), puis contrôler l'envoi réel dans DebugView. Cet envoi ne peut pas être vérifié hors production, par construction.
4. **Aucun budget Ads** tant que la souscription entretien n'est pas fiable en PROD (voir le compte rendu P1).

## 5. Données manquantes à fournir
| Donnée | Pourquoi | Accès |
|---|---|---|
| GA4 sur 90 jours : sessions, sources, pages d'entrée, événements | départager trafic et conversion | accès Lecteur ou export CSV |
| Search Console : impressions, clics, requêtes, positions | visibilité SEO locale | accès utilisateur |
| Fiche Google Business Profile : appels, itinéraires | conversions hors site | export des statistiques |
| Nombre d'appels entrants de l'agence liés au site | principale conversion du métier | relevé agence ou suivi d'appels (non en place) |
