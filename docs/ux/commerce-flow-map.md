# FLOW MAP — 5 parcours de commande unifiés (UX-COMMERCE-2)

> Source : issue #9 commentaire 5450207118. Livrable **avant recodage**.
> Objectif : `/catalogue` = **hub/tunnel maître**. Devis + Entretien peuvent avoir des écrans
> dédiés MAIS doivent appartenir au **même moteur** (header tunnel, Retour/Accueil, progression,
> conservation d'état, récap persistant, CTA suivant explicite, sortie sûre, **aucun cul-de-sac**).
> Ne pas casser la logique de `c82a784c`. Recette only.

## État ACTUEL — parcours + ruptures

Légende : ✅ in-tunnel cohérent · 🔴 rupture (sort du tunnel / cul-de-sac / perte d'état)

### 1. « Je sais ce qu'il me faut » ✅
`/catalogue#step=launcher` → clic *Je sais* → `#step=catalogue` (familles) → carte prestation
→ `#step=sheet` → *Ajouter au panier* → `#step=cart` → *Continuer ma demande* → `#step=urgence`
(Oui/Non+desc) → `#step=address` (autocomplete+manuel, contrôle zone) → `#step=coords`
(validation inline) → `#step=confirm` (récap + créneau=rappel) → *Envoyer* → confirmation (réf HC-…).
Retour : bouton *Retour* à chaque écran + *Quitter* → `/`. Progression : barre 5%→100%. **Cohérent.**

### 2. « Aidez-moi à identifier mon problème » ✅
`launcher` → clic *Aidez-moi* → `#step=diagnosis` (métier → problème/mot-clé) → recommandation
→ `#step=sheet` → *Ajouter* → **même panier/checkout que (1)** → confirmation. **Cohérent.**

### 3. « Projet sur mesure — devis » 🔴 RUPTURE
`launcher` → barre assistance *Projet sur mesure — devis* → **`href="/devis-express.html"`**
= navigation pleine page HORS tunnel. La page `devis-express.html` a son PROPRE header site,
son propre design (« Votre devis express en 60s », form 3 étapes + carousel estimateur),
**aucun** header tunnel, **aucun** Retour vers le hub, **aucune** progression tunnel, **aucun**
état conservé. → impression d'impasse (constat Florian).
Aussi depuis la home : carte *Demander un devis* → même page isolée.

### 4. « Entretien & contrats » 🔴 RUPTURE
`launcher` → barre assistance *Entretien & contrats* → **`href="/contrats-entretien.html"`**
= page pleine isolée (design/entête différents, pas de tunnel, pas de retour hub). Même rupture que (3).

### 5. « Urgence » 🟠 partiel
`launcher` → *Urgence — 03 66 10 01 34* → `tel:` (appel). Home : bandeau urgence → `tel:`.
Pas de cul-de-sac (c'est un appel) MAIS **pas d'alternative** « demande de rappel/intervention »
si le client ne peut pas appeler tout de suite (ChatGPT §5).

### Code/routes legacy responsables des ruptures
| Rupture | Fichier / route | Ligne(s) |
|---|---|---|
| Devis hors tunnel | `catalogue.html` barre assistance `href="/devis-express.html"` ; `index.html` carte `hrr-card--devis` | assist-item / hrr |
| Entretien hors tunnel | `catalogue.html` `href="/contrats-entretien.html"` ; `index.html` carte `hrr-card--entretien` | assist-item / hrr |
| Pages isolées | `devis-express.html`, `contrats-entretien.html` = pages autonomes (header site, pas de chrome tunnel) | — |
| Urgence sans repli | `catalogue.html` assist-urg = `tel:` seul | — |

## État CIBLE — 5 parcours dans UN moteur

Principe : les 5 parcours vivent dans `/catalogue` (moteur `hc` steps). Chrome tunnel commun
(header : Quitter/titre/panier + **progression**), Retour à chaque écran, état en localStorage,
récap persistant quand pertinent, CTA suivant explicite, sortie sûre. Les pages
`devis-express.html`/`contrats-entretien.html` restent accessibles (nav/SEO) mais **ne sont plus
le chemin du tunnel**.

### Nouveaux steps à ajouter au moteur (STEPS)
`launcher, catalogue, diagnosis, sheet, cart, urgence, address, coords, confirm` **+**
`devis` (qualification devis), `entretien` (qualification entretien), `rappel` (repli urgence).

### 3-cible. Devis — in-tunnel
`launcher` → *Projet sur mesure — devis* → **`#step=devis`** (dans le tunnel) :
étape A qualification (métier + nature travaux + description + photos si supportées)
→ `#step=address` (réutilisé) → `#step=coords` (réutilisé) → `#step=confirm` (variante devis :
récap sans prix, mention « chiffrage sous 24-48h ») → *Envoyer* → confirmation devis.
Retour : *Retour* → étape précédente ; *Accueil commande* → launcher (état conservé). CTA suivant explicite.
Soumission : `submit-lead-v6` `form_type=devis_express` (déjà supporté ; cp exigé → collecté à l'étape address).

### 4-cible. Entretien & contrats — in-tunnel
`launcher` → *Entretien & contrats* → **`#step=entretien`** :
étape A (type équipement/énergie gaz/fioul + marque/modèle/âge si pertinent + type contrat/besoin)
→ `#step=address` → `#step=coords` → `#step=confirm` (variante entretien) → *Envoyer* → confirmation.
Soumission : `submit-lead-v6` `form_type` adapté (contrat ; cp/ville collectés).

### 5-cible. Urgence — appel + repli
`launcher`/bandeau → *Urgence* : action primaire `tel:` (appel prioritaire) **+** lien secondaire
« Être rappelé » → **`#step=rappel`** (mini-form nom+tel, `form_type=rappel`) → confirmation.
Aucun cul-de-sac.

### Règles UX communes (chaque écran)
(a) où je suis (titre + progression) · (b) quoi faire (CTA suivant explicite) ·
(c) comment revenir/modifier (Retour + Accueil commande, état conservé) · (d) ce qui se passe ensuite.
Refresh/back navigateur : reprise via hash `#step=` + localStorage (déjà en place pour 1/2).

## Plan d'implémentation séquentiel (commits atomiques)
1. `feat(commerce): route quote and maintenance into the tunnel hub` — barre assistance +
   cartes home → `#step=devis`/`#step=entretien` (au lieu des pages isolées) ; steps vides + chrome.
2. `feat(commerce): quote qualification step in tunnel` — écran `devis` (form + submit devis_express).
3. `feat(commerce): maintenance qualification step in tunnel` — écran `entretien`.
4. `feat(commerce): emergency callback fallback` — `#step=rappel` + lien depuis urgence.
5. `test(commerce): e2e the five unified journeys` — E2E 1440+390 des 5 parcours (pas d'impasse).
Commit cible global : `feat(commerce): unify quote maintenance emergency and booking journeys`.

## QA obligatoire (avant DONE) — 5 parcours, navigateur, 1440 + 390
- [ ] 1 Je sais → 2 prestations 2 familles → panier → coords → confirmation
- [ ] 2 J'hésite → diagnostic → reco → même panier → confirmation
- [ ] 3 Devis in-tunnel → qualification → adresse → coords → récap → envoi → confirmation + retour hub sans perte
- [ ] 4 Entretien in-tunnel → équipement/énergie → adresse → coords → récap → envoi → confirmation
- [ ] 5 Urgence → appel + repli « Être rappelé » → confirmation
- [ ] Chaque écran : Retour/Modifier/Accueil visibles, progression, état conservé, aucun cul-de-sac
- [ ] refresh/back navigateur + conservation données ; 0 overflow ; console 0 blocage
