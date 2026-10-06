# GREEN SYNC 2026-10-03 — preuve exacte PR #24

Contexte : Florian a donné un GO batch pour pousser en production **uniquement ce qui est déjà vert** et rétablir une discipline stricte recette → production.

Source de process : `docs/control/RELEASE-PROCESS.md`.
Matrice : `docs/control/CURRENT-GREEN-RELEASE.json`.

## PR à contrôler

- PR : #24
- head exact : `f16d1749a76851af452f285c98f68afac9ab04e1`
- base attendue : `main` après PR #22
- preview : `https://deploy-preview-24--remarkable-dragon-364e2b.netlify.app`

## Contrôles obligatoires

### REQ-023 — Zones 4 pôles

Sur `/zones-intervention.html` :
- 1440 : capture complète de la section 4 pôles ;
- 390 : capture complète de la section 4 pôles ;
- présence visible des quatre cartes :
  - Saint-Omer & Audomarois — Agence Dépan'Audo ;
  - Dunkerque & Littoral — Pôle d'intervention ;
  - Calais & Calaisis — Pôle d'intervention ;
  - Boulogne-sur-Mer & Boulonnais — Pôle d'intervention ;
- aucun débordement horizontal ;
- aucune régression du header/footer.

### REQ-024 — carte zones

Sur `/zones-intervention.html`, sans défiler :
- Leaflet chargé ;
- tuiles peintes en moins de 3 s ;
- carte non grise ;
- capture 1440 + 390 ;
- vérifier aussi `contact.html` : la carte basse de page doit rester lazy tant qu'elle n'approche pas du viewport.

### Cache-bust

Prouver que les quatre pages servent :
`assets/hc-map-zones.js?v=20261003a`
- zones-intervention.html
- contact.html
- a-propos.html
- nos-villes.html

### Diff / sécurité

- diff limité aux 4 HTML de la PR #24 ;
- aucun Supabase/RLS/auth/paiement/DNS ;
- rollback exact : revert du merge PR #24 ;
- console navigateur : signaler toute erreur pertinente.

## Retour

Créer un rapport dédié dans `docs/control/outbox/claude/` avec :
- SHA exact contrôlé ;
- URL preview ;
- captures 1440/390 ;
- mesures scrollWidth/innerWidth ;
- délai/tuiles Leaflet ;
- vérification lazy contact ;
- rollback ;
- verdict factuel PASS ou BLOCKED.

Si PASS, ne pas déclarer PROD_VERIFIED : STOP et laisser ChatGPT fusionner conformément au GO Florian.
