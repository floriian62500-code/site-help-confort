# Revue QA multi-agents — Round 2 → 3 (2026-09-15/16, directives 5674962401 · 5699054136)

> Suite de `AGENT-QA-ROUND1-2026-09-15.md`. Second passage lancé sur `52520124` : **client lambda = FAIL** (rendu), mobile 390 et desktop 1440/design **tués par la limite de session**, UX non relancé. Conformément à 5674962401 : correctifs certains du verdict client appliqués sans attendre, QA navigateur manuelle 1440 + 390, puis relance des 5 profils sur le SHA corrigé (round 3).

## A. Verdict client R2 (sur `52520124`) → correctifs (`ac43a0aa`)
| # | Constat client R2 | Gravité | Correctif (BEFORE → AFTER) |
|---|---|---|---|
| 1 | Gate perçu comme formulaire de capture : on ne dit pas **pourquoi** on demande les coordonnées ; tout clic famille le rouvre « sans explication » | **P1** | Titre « Consultez nos tarifs » → **« Accédez aux tarifs de votre zone »** ; lead → « Nos prix fermes sont valables pour l'agence de Saint-Omer et la Côte d'Opale. Indiquez un prénom, un téléphone et un email : vos tarifs s'affichent juste après, en 30 secondes, sans engagement. Un conseiller local pourra vous rappeler pour préciser votre besoin. » ; écran familles : indice « Les tarifs s'affichent après quelques coordonnées — 30 s, sans engagement » (masqué une fois identifié). Règle métier « aucun prix sans identification » **inchangée** (18/18). |
| 2 | Signaux boutique : icône caddie, « Commander une intervention », « Panier mixte », « Reprendre mon panier » | P2 | Icône caddie → icône **demande** (topbar + bouton « Ma demande ») ; « Commander une intervention » → **« Demander une intervention »** (launcher + Home ×4) ; « Panier mixte » → « Demande mixte » ; « Reprendre mon panier » → « Reprendre ma demande » ; (`b922a6a9`) « Accueil commande » → « Accueil de la demande », « Commencer une commande » → « Choisir une prestation », meta description « Commandez… prix affichés » → « Demandez… prix ferme (tarifs affichés après identification) ». |
| 3 | « Ajouté ✓ » transitoire (1,6 s) → aucun état persistant | P3 | Carte : **« Dans ma demande ✓ · retirer »** persistant (vert), retrait depuis la carte, re-rendu après retrait depuis le récap ; fiche : « Dans ma demande ✓ — voir ma demande ». |
| 4 | « prix ferme, déplacement inclus » absent des cartes (seulement en fiche) | P3 | Cartes : pastille **« prix ferme »** + « Déplacement et main-d'œuvre inclus » (même règle que la fiche) ; « Sur devis » + « après diagnostic ». |
| 5 | Launcher promet « prix affichés » puis gate | P2 | « Prestations à prix ferme ou sur devis … Les tarifs s'affichent après quelques coordonnées, en 30 s, sans engagement. » |
| 6 | Rappel Home : « une agence locale » (vague) | P3 | « l'agence HELP Confort de Saint-Omer vous rappelle rapidement » (agence unique). Aucun délai chiffré inventé. |
| — | Grille « boutique » avec marques ; 114 € vs 148 € ; bloc partenaires générique ; « Centre de validation » | P2 | **Hors lot** : données Supabase / éditorial (escaladés Florian, cf. round 1 §B) ; « Centre de validation » = widget de recette (absent prod). |

## B. QA navigateur manuelle (Deploy Preview, build `ac43a0aa`, sans aucun envoi)
Parcours : Home → « Demander une intervention » → gate (lu, fermé ✕) → contournement de test `sessionStorage.hc_pg=1` → famille Plomberie → ajout « Intervention urgente plomberie 114 € » → retrait/ré-ajout depuis la carte → famille Chauffage → ajout « Dépannage & recherche de panne 148 € » → « Ma demande » → Continuer → Urgence → Adresse (fictive) → Coordonnées (non envoyé).

| Viewport | Résultat | Mesures |
|---|---|---|
| **1440 × 900** | **PASS** parcours complet | gate : titre/lead corrects, inputs 16 px, ✕ 44×44, 0 prix visible derrière, fermeture → familles (pas d'éjection) ; indice tarifs visible puis masqué après identification ; carte : « 114 € TTC · prix ferme · Déplacement et main-d'œuvre inclus » ; bouton → « Dans ma demande ✓ · retirer » (vert), compteur « Ma demande (1) », retrait → « Ajouter à ma demande » / (0) ; récap 700 px : 2 lignes, Total 262 € TTC, « Prix fermes — aucun paiement en ligne… Prochaine étape… », « Continuer ma demande → » ; urgence/adresse/coords 620 px ; étapes ✓✓●○ ; champs 16 px ; scrollWidth 1425 < 1440 |
| **390 × 844** | **PASS** parcours complet | gate en sheet ancré bas (top 182 → 844), ✕ 44×44, « Voir mes tarifs → » à 728 px (visible sans scroll), inputs 16 px, barre mobile masquée sous le gate ; carte pleine largeur, bouton 320×44, état persistant 44 px ; barre « 2 prestation(s) · 262 € TTC · Voir ma demande » → écran « Ma demande » (barre masquée dessus, pas de cul-de-sac) ; urgence boutons 171×87 ; CP `inputmode=numeric` 16 px ; aucun débordement (scrollWidth 390) |

Défauts trouvés par la QA manuelle → corrigés dans `b922a6a9` (finitions) : libellé « Dans ma demande ✓ · retirer » passait sur 2 lignes en grille 3 colonnes (carte 315 → 336 px) ; indicateur 4 étapes sur 2 lignes à 390 ; barre mobile « 0 prestation(s) · — € TTC » affichée à vide ; bouton barre mobile 38 px ; vocabulaire « commande » résiduel (3 libellés + meta) ; autocomplétion BAN sans biais géographique (« 12 rue de Dunkerque » → Toulouse/Reims en premier).

Artefacts preview (non-bugs) : bandeau cookies GA + bouton « Centre de validation » se chevauchent à 390 (widget recette absent en prod) ; drawer Netlify.

## C. Round 3 — 5 agents sur le SHA corrigé
_(complété après verdicts)_
