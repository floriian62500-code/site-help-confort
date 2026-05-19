# BUGS HISTORY — Help Confort

> Capitalisation des bugs résolus sur le site, le dashboard, Netlify et Supabase.
> Lu par l'agent de maintenance avant chaque scan pour reconnaître les patterns récurrents et appliquer les fixes connus directement.

---

## Format d'entrée

```markdown
## AAAA-MM-JJ — <titre court>
- **Symptôme** : <ce que l'utilisateur ou le monitoring a vu>
- **Cause** : <cause racine identifiée>
- **Fix** : <action prise — commit <hash>, migration, rollback, etc.>
- **Durée** : <X min entre détection et résolution>
- **Pattern** : <type de bug, signal à surveiller pour la prochaine fois>
- **Volet** : site live | netlify | dashboard | supabase | autre
```

---

## Bugs résolus

## 2026-05-18 — Chemins absolus `/assets/` qui cassent en sous-dossier
- **Symptôme** : pages dans `prestations/` affichent skip-link visible, logo cassé, CSS non chargé, SVG géants (404, hero, pictos)
- **Cause** : conversion globale `/styles.css` → `styles.css` (vague chemins relatifs) sans tenir compte de la profondeur du sous-dossier `prestations/`
- **Fix** : script Python qui préfixe `../` sur 2 881 chemins dans 33 pages prestations + chemins absolus restaurés sur `404.html` (puisqu'elle peut être servie depuis n'importe quelle URL)
- **Durée** : 15 min
- **Pattern** : toujours vérifier la profondeur de chaque page avant de normaliser des chemins. Pour les pages racine + sous-dossiers, faire 2 passes distinctes ou utiliser des chemins absolus uniquement pour la 404
- **Volet** : site live

## 2026-05-18 — CSS hero `/assets/index-hero.css` chargé en bas de page
- **Symptôme** : SVG bouton Urgence en 300×150 px, pictos `.hco-dot img` en 437×437 px, mascotte 240×720 px → home déformée sur capture utilisateur
- **Cause** : `<link rel="stylesheet" href="/assets/index-hero.css">` placé ligne 528 (après les éléments concernés) + chemin absolu fragile (cache navigateur, file://, sous-chemin)
- **Fix** : déplacé dans le `<head>` ligne 38, chemin relatif `assets/index-hero.css` + ajout `width`/`height` HTML sur SVG et `<img>` pour fallback fail-safe
- **Durée** : 5 min
- **Pattern** : tout CSS critique = dans le `<head>` + chemin relatif + dimensions HTML sur SVG/IMG en backup
- **Volet** : site live

## 2026-05-18 — Double footer sur 9 pages
- **Symptôme** : 2 `<footer>` empilés (legacy inline + footer-v3) visible en bas de plusieurs pages
- **Cause** : migration vers footer-v3 incomplète, ancien footer inline non supprimé
- **Fix** : regex Python supprimant le `<footer style="background:#0A1428...">...</footer>` legacy sur les 9 pages identifiées
- **Durée** : 5 min
- **Pattern** : auditer régulièrement `grep -c '<footer'` sur toutes les pages — toujours doit retourner 1
- **Volet** : site live

## 2026-05-18 — `<div class="container">` non fermé section m-suppliers (26 pages)
- **Symptôme** : footer mal placé, décalages visuels imprévisibles sur pages métier-ville
- **Cause** : template métier dupliqué avec erreur de structure
- **Fix** : ajout de `</div>` manquant avant `</section>` sur 26 fichiers
- **Durée** : 10 min
- **Pattern** : audit balise `<div>` vs `</div>` sur templates dupliqués (diff doit être 0)
- **Volet** : site live

## 2026-05-19 — Marques inventées par template (Geberit, Grohe, etc.)
- **Symptôme** : Florian voit des fournisseurs cités sur des pages prestations sans qu'il ait validé
- **Cause** : template initial contenait des cartes fournisseurs préremplies sans vérification métier
- **Fix** : suppression section "marques que nous installons" sur 32 pages (11 dépannage + 21 installation non validées) + remplacement par Atlantic sur chauffe-eau et Delpha sur salle-de-bain (validés par Florian)
- **Durée** : 15 min
- **Pattern** : ne jamais préremplir des marques sans validation. Sur futures pages, structure vide à remplir par admin
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — Mention "Astreinte 7j/7" trompeuse
- **Symptôme** : Florian voit "Astreinte 7j/7 — 03 66 10 01 34" alors qu'HC ne fait pas d'astreinte 7j/7
- **Cause** : wording template par défaut
- **Fix** : remplacé par "Standard ouvert Lun-Ven 9h-17h · Sam 9h-16h"
- **Durée** : 2 min
- **Pattern** : audit régulier des promesses de disponibilité (cf. audit-promesses-marketing.md)
- **Volet** : site live + conformité DGCCRF

## 2026-05-19 — 91 promesses marketing à risque DGCCRF
- **Symptôme** : audit révèle "1er réseau national" (non sourcé), "sans sous-traitance" (à confirmer), délais "sous 24h" sans "ouvrées", "Qualifelec" (non possédé), etc.
- **Cause** : template initial + ajouts successifs sans audit conformité
- **Fix** : nettoyage défensif 519 remplacements sur 100 pages (« 1er réseau » → « Réseau national », « sans sous-traitance » → « techniciens internes », ajout « ouvrées » partout, retrait Qualifelec, etc.) — voir `audit-promesses-marketing.md` pour détail
- **Durée** : 30 min
- **Pattern** : audit promesses tous les 3 mois minimum. Toute nouvelle promesse doit passer par POUR-FLORIAN.md avant mise en ligne
- **Volet** : site live + conformité DGCCRF
