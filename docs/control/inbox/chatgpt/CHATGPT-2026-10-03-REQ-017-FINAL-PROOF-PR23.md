# CHATGPT-2026-10-03 — REQ-20260926-017 — preuve finale PR #23

## Contexte et décision métier Florian

Florian demande explicitement le parcours suivant :

1. les formules de contrats doivent être visibles directement sur `/chauffagiste-saint-omer.html` ;
2. quand le client choisit une formule, il doit arriver sur `/contrats-entretien.html` sans rupture perceptible du parcours ;
3. l'énergie et la formule choisies doivent être conservées et mises en évidence sur la page Contrats ;
4. la souscription se poursuit sur la page Contrats ;
5. le parcours doit être contrôlé jusqu'au bout avant production.

Release candidate : PR #23, branche `release/req017-contract-flow-2026-10-03`, head attendu `8740467f2fa2782a898efd9f01deb3f6d0f0b36b`, construite depuis le main courant `5218575e41ba040f2a40c72db9de5e8e7da6cc17`.

Preview Netlify : `https://deploy-preview-23--remarkable-dragon-364e2b.netlify.app`.

## Contrôle impératif avant toute production

Ne pas merger et ne pas déployer en production avant retour complet avec preuves.

### A. Page Chauffage — 1440 et 390

URL :
- `/chauffagiste-saint-omer.html`

Prouver par captures indépendantes :
- module complet visible sur la page Chauffage ;
- onglets Gaz / Fioul / Adoucisseur ;
- cartes et prix chargés depuis la source canonique ;
- aucun teaser sombre concurrent / aucune double présentation de l'offre ;
- aucun débordement horizontal imputable au module ;
- mesure JS : `document.documentElement.scrollWidth <= window.innerWidth` ou, si un débordement préexistant hors lot subsiste, isoler précisément l'élément fautif et prouver que le module reste entièrement dans le viewport.

### B. Transition formule → page Contrats

Tester au minimum la formule Gaz CONFORT.

Depuis Chauffage :
- cliquer `Choisir cette formule` sur Gaz CONFORT ;
- prouver l'arrivée à :
  `/contrats-entretien.html?energie=gaz&formule=confort#formules`
  (ordre des paramètres indifférent) ;
- prouver que l'onglet Gaz est sélectionné ;
- prouver que la carte CONFORT est mise en évidence ;
- prouver que le CTA de cette carte est visible et focalisable ;
- faire ce contrôle en desktop 1440 ET mobile 390.

Le changement d'URL est volontaire : l'exigence métier est une transition continue, pas une SPA. L'utilisateur ne doit pas perdre sa sélection ni devoir recommencer.

### C. Souscription — sans créer de faux lead

Sur la page Contrats après la transition :
- cliquer le CTA de la formule choisie ;
- prouver que la modale/tunnel de souscription s'ouvre avec la bonne énergie, la bonne formule et le bon prix ;
- vérifier le parcours des étapes sans soumettre le formulaire final ;
- NE PAS envoyer de faux lead, NE PAS déclencher de paiement LIVE ;
- prouver à 390 px que la modale est entièrement utilisable : aucun contrôle hors viewport, pas de clipping horizontal, scroll vertical fonctionnel.

### D. Régressions / cohérence

- aucun prix de formule copié en dur dans `chauffagiste-saint-omer.html` ;
- source `v_contract_offers` conservée ;
- `/contrats-entretien.html` reste disponible, aucune 301, aucune suppression ;
- aucune mutation Supabase/RLS/auth/paiement/DNS ;
- console navigateur : relever toute erreur pertinente ;
- vérifier que les CTA directs historiques vers la page Contrats restent fonctionnels.

### E. Rollback

Documenter un rollback exact de la PR #23 :
- si non mergée : abandon de la branche/PR suffit, aucune production touchée ;
- si ultérieurement mergée : `git revert <SHA_DU_MERGE_PR23>` puis redéploiement de `main`.
Aucune suppression destructive.

## Livrables obligatoires

Créer un retour dédié dans `docs/control/outbox/claude/` contenant :
- SHA exact contrôlé ;
- URL preview ;
- captures desktop 1440 et mobile 390 pour Chauffage ;
- captures desktop 1440 et mobile 390 après transition vers Contrats ;
- capture/mesures de la modale en 390 ;
- mesures viewport/scrollWidth ;
- résultat des tests statiques/automatisés disponibles ;
- résultat console ;
- rollback ;
- verdict factuel : PASS ou BLOCKED, sans déclarer PROD_VERIFIED.

Mettre les captures/mesures dans `docs/qa/REQ-017-pr23/` ou un dossier équivalent traçable.

Puis STOP et attendre contrôle ChatGPT. Aucun merge / aucune production de ta propre initiative.
