# Plan des items JAUNES (non clos, préparés au maximum sans QA visuelle ni gate)

## 1. Mutualisation CSS/JS inline (T7) — plan strangler bloc par bloc
Blocs identifiés (T7) : 4 blocs `<style>` (>2Ko) + 2-3 blocs `<script>` inline, dupliqués **identiquement** sur 22-25 pages métier×ville (~65Ko CSS/page).
Procédure (1 bloc à la fois) :
1. Extraire le bloc dans `assets/hc-metier-shared.css` (ou `.js`) — **contenu identique**, versionné.
2. Remplacer le bloc inline par `<link rel="stylesheet" href="/assets/hc-metier-shared.css">` sur **1 page pilote**.
3. QA visuelle desktop+mobile de la page pilote (diff avant/après).
4. Si OK → généraliser aux 24 autres par script (remplacement du bloc exact par le link).
5. Contrôle **non visuel automatisable** (fait maintenant) : hash du bloc identique sur toutes les pages avant extraction (garantit qu'un seul asset couvre tout le monde).
**Bloqué par** : QA visuelle (impossible dans le pane) → nécessite une session avec rendu fiable.

## 2. Responsive / QA visuelle — liste exacte restant à contrôler
Breakpoints : **320 / 375 / 390 / 768 / 1024 / 1440 / 1920**. Pages :
- `index.html` (home + wizard 4 étapes)
- 7 familles métier `-saint-omer` (plombier/chauffagiste/electricien/serrurier/vitrier/menuisier/travaux)
- variantes ville lourdes : `plombier-dunkerque`, `plombier-calais`, `depannage-saint-omer`, `pmr-saint-omer`
- `nos-prestations.html`, `contact.html`, `zones-intervention.html`, `recette.html`
- 2-3 pages `prestations/*.html`, 2-3 `realisations/*.html`
Contrôles : overflow horizontal, lisibilité, chevauchement, CTA cliquables, menu mobile, carrousels clippés.
**Bloqué par** : le Browser pane rapporte width 0 (mesure non fiable). Overflow spot-vérifié OK sur depannage mobile.

## 3. WebP / images — candidates live référencées
| Image | Taille | Gain WebP ~q80 | Pages réf | Décision |
|---|---|---|---|---|
| `images/mascotte.png` | 602Ko | ~210Ko (-392Ko) | 26 (hero, eager) | **RECOMMANDÉ** : `<picture>` webp+png, gain LCP notable. QA visuelle requise (mascotte détourée). |
| `images/florian-dhaillecourt.jpg` | 172Ko | ~60Ko | 1 (a-propos) | Optionnel (1 page). |
| 18 `images/prestations/*.jpg` | ~4Mo cumulés | — | **0** (ni code ni Supabase) | Média métier inutilisé → **décision Florian** (garder pour usage futur ou supprimer). NON supprimées. |
Autres images déjà retirées (orphelines) : `_backup_png` 4.6M, `images/metiers` 2.6M, `_backup_pictos` 480K.
**Bloqué par** : conversion mascotte = maj `<img>`→`<picture>` sur 26 pages + QA visuelle qualité.

## 4. Accessibilité — saut Hn zones-intervention
Le « saut h1→h4 » = 2 `<h4>` dans des **popups Leaflet** (`bindPopup('...<h4>...')`), pas le flux principal.
Changer le niveau risquerait le style `.z-popup h4`. **Exception justifiée** : titres de popups transitoires, impact a11y marginal. Non modifié (règle « corriger seulement les anomalies sûres »).

## 5. Staging — tri finalisé (voir STAGING-TRIAGE.md)
NE PAS MERGER : promote-to-prod (`317919e3`), WYSIWYG/hc-widgets.js (divergé), flux paiement (Stripe gelé).
CANDIDATS REVUE : no-trust-band métiers (5 commits), map polygone (`3e55d6fc`), polish contact (10). Branche conservée + tag.
