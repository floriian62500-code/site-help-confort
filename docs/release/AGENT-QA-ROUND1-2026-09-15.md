# Revue QA multi-agents — Round 1 (2026-09-15, directive 5667664476)

> 5 reviewers indépendants (profils distincts) ont navigué la **vraie Deploy Preview** (Home → gate → tunnel → prestations → panier → adresse), sans aucune soumission. Build revu : `701f64d3` (+ pictos footer `a66b95e7`).
> Verdicts round 1 : **UX=FAIL · DESIGN=FAIL · CLIENT=FAIL · MOBILE=FAIL · DESKTOP=FAIL** (attendu : le rôle des agents est de trouver ce qui ne va pas). Correctifs agrégés poussés en `52520124`, puis round 2.

## A. Corrigé (front, recette `52520124`)
| # | Constat (agents) | Gravité | Correctif |
|---|---|---|---|
| 1 | **Bottom-sheet mobile « Ma demande » sans bouton Continuer** = cul-de-sac (mobile) | **P0** | Panier unifié : les 2 entrées mobiles → `go('cart')` (écran avec « Continuer ma demande ») ; barre panier masquée sur cet écran |
| 2 | Aucun retour après « Ajouter » + compteur non sticky (desktop, UX, client, mobile) | **P1** | État « Ajouté ✓ » 1,6 s sur la carte ; barre haute **sticky** (compteur toujours visible) |
| 3 | Rupture typographique : tunnel en system-ui, boutons Arial (design, desktop) | **P1** | Inter chargé + `button,input{font:inherit}` |
| 4 | Pastille fixe « Découvrir » recouvre labels/avis (design, desktop, UX) | **P1** | Masquée dès `scrollY>200` |
| 5 | Gate : inputs 15,36 px → auto-zoom iOS ; ✕ 34 px ; dialog centré « dans le vide » (mobile) | **P1** | Inputs 16 px ; ✕ 44 px ; **sheet ancré en bas** sur mobile |
| 6 | Fermer le gate = **éjection vers l'accueil** (client P0, UX P1, mobile P1) | **P1** | Fermeture volontaire = on reste sur les **familles (0 prix)** ; famille/recherche/panier ré-ouvrent le gate → règle « aucun prix sans identification » intacte |
| 7 | Grille familles + prestations empilées (design, desktop, UX) — `display:grid` écrasait `hidden` | P2 | `[hidden]{display:none!important}` + scroll vers les prestations au clic |
| 8 | Panier « boutique » : steppers −/+, « Total (indicatif) » vs « prix ferme », rien sur la suite/paiement, aria « Voir mon panier » (client P1, UX P1, desktop) | P1/P2 | Steppers retirés (×N si &gt;1) ; « Total » ; « aucun paiement en ligne, règlement après intervention. Prochaine étape… » ; aria « Voir ma demande » |
| 9 | 2 boutons pleine largeur × 15 cartes = grille e-commerce (design, desktop) | P2 | 1 seul « Ajouter à ma demande » (navy) + lien texte « Détails » ; CTA clé « Continuer » en orange |
| 10 | Promesse « prix affichés » contredite par le gate ; gate « un conseiller communique » ≠ affichage (UX P1, client, design) | P1/P2 | Copy honnête : « Vos tarifs s'affichent juste après, en 30 s » ; Home « Tarifs clairs affichés en 30 s » ; marque « HELP Confort · Saint-Omer » |
| 11 | Stepper invisible / pas d'« étape x/y » (UX, mobile, Florian) | P2 | Indicateur discret 4 étapes (Prestation · Urgence & lieu · Coordonnées · Confirmation) |
| 12 | Formulaires courts alignés à gauche dans 880 px, moitié vide (desktop) | P2 | Panier max 700 px / étapes 620 px centrés |
| 13 | Gate « boîte posée sur le vide » (desktop) | P2 | Familles (0 prix) visibles floutées derrière le gate |
| 14 | « Être rappelé » : 6 champs obligatoires (UX) | P2 | Prénom + téléphone seuls requis (contrat edge `rappel`), reste « facultatif » |
| 15 | Cibles tactiles &lt;44 px (mobile) | P2 | `min-height:44px` boutons cartes, 40 px contrôles panier/barre |
| 16 | Chip filtre « _default 1 » (UX, nos-prestations) | P2 | Fallback « Autres prestations » |
| 17 | Cartes intentions Home creuses (design, desktop) | P2 | Padding/marges resserrés |
| 18 | Contrastes secondaires gate &lt; AA (desktop) | P3 | Couleurs/tailles relevées |
| 19 | CTA Home icône panier (client) | P2 | Icône service (clé) + sous-titre |
| 20 | Autocomplete adresse (mobile) | P2 | `postal-code` / `address-level2` (rue garde la liste BAN) |

## B. Escaladé — décisions Florian (pas de correctif unilatéral)
| Sujet | Constat | Pourquoi c'est à Florian |
|---|---|---|
| **Deux systèmes commerciaux parallèles** | `catalogue.html` = gate + prix ferme + 0 paiement ; **`/nos-prestations`** = prix **publics sans gate** (« à partir de 114,43 € »), **acompte 40 %**, « Réserver » (moteur `hc-reserve-modal` → `service_orders`). Home : 2 CTA → 2 catalogues. | Contredit la règle « aucun prix sans identification » ET la cohérence commerciale (acompte vs aucun paiement). Choix : (A) gater/aligner nos-prestations sur le tunnel, (B) assumer prix publics là-bas et unifier les conditions. **P1 décision.** |
| Données prestations | 300 L au sol 1 214 € &lt; 200 L au sol 1 333 € ; « Recherche de fuite 148 € » &gt; « Intervention urgente 114 € » qui l'inclut ; marques (Ramon Soler, Carlo Frattini) inconnues ; contrat entretien mêlé aux interventions Plomberie | Contenu Supabase (prix/libellés/taxonomie), pas front |
| Marque en en-tête | « Dépan'Audo » affiché avant HELP CONFORT (client, UX) | Identité/ordre de marque = choix Florian (conservé lors du retrait du bandeau) |
| Header site 161–165 px sticky | Trop haut, ne se réduit pas au scroll (mobile, design) | Header global du site, hors lot tunnel |
| Contenu Home | Labels « Réseau de confiance » génériques (« Compagnie d'assurance National » ×3, coquille « Réineur »), réalisations mal catégorisées, aucun engagement de délai, texte vidéo qui déborde, mascotte 3D | Éditorial / médias |

## C. Artefacts preview (non-bugs)
- Bouton « 🧭 Centre de validation » = widget recette, **gaté par hostname** (`netlify.app`/staging), absent en prod. Peut gêner sur mobile preview (chevauche « Appeler »).
- Iframe Netlify Drawer intercepte des taps en bas d'écran sur la preview (absent prod).
- « Reprendre ma demande » vu avec « Ma demande (0) » = **localStorage partagé entre agents concurrents** (un autre agent avait un panier) — vérifié : masqué en état vraiment frais.

## D. Non-régression après correctifs
`price-gate.test.mjs` 18/18 (assertion #9 réécrite : boutons panier → `go('cart')`, gate dans `go()`), `seo-guardrails ERRORS=0`, div équilibrés (catalogue/index/nos-prestations). Aucun edge/backend/Stripe touché.
