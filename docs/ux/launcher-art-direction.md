# Launcher `/catalogue` — benchmark visuel + direction artistique

> Chantier #9 / 5450986191. Refonte de la **composition** du launcher (routes/logique inchangées).
> Objectif : expérience service-commerce habitat 2026, premium/chaleureuse/locale, pas un template SaaS.

## Benchmark visuel (patterns retenus)
Sources (patterns 2025-2026, non copiés) : landingi, orizon.co, unbounce, 99designs, trafft.
5 patterns retenus + pourquoi ils conviennent à HELP CONFORT :
1. **Split / hero asymétrique** — utiliser toute la largeur desktop, colonne primaire dominante + colonne secondaire. → règle le « vide » + hiérarchie des 2 intentions.
2. **Intent-driven, primaire dominant** — un choix visuellement principal, les autres subordonnés. → « Je sais » dominant, « Aidez-moi » distinct.
3. **Proof-of-work / bento** — aperçu concret (familles métiers, preuves). → aperçu des familles dans la carte primaire (au lieu d'une carte vide).
4. **Trust près du CTA** — réassurance concrète intégrée, pas une ligne perdue. → bande premium à icônes.
5. **Identité différenciée par parcours** — le diagnostic a un langage visuel « assistant » (étapes). → mini-stepper dans « Aidez-moi ».

## Direction artistique
- **Composition** : grille 2 colonnes desktop (≈1.25fr / 1fr), pleine largeur maîtrisée (max ~1180px), rythme vertical compact ; sur ≤900px : empilement intelligent (pas 6 écrans).
- **Colonne gauche (dominante)** : eyebrow + titre-promesse + contexte local/humain + **carte primaire « Je sais ce qu'il me faut »** (surface bleu HELP CONFORT en dégradé maîtrisé, icône container, **aperçu des familles métiers** en chips, bénéfice « Catalogue & prix affichés », flèche animée).
- **Colonne droite** : **carte « Aidez-moi à identifier »** avec identité diagnostic (mini-stepper 1 Métier → 2 Équipement → 3 Symptôme) ; puis **tuiles secondaires réelles** Devis + Entretien (titre + micro-copy + CTA, pas des chips) ; **bande urgence** maîtrisée (tel + disponibilité horaires réels).
- **Bande réassurance** (pleine largeur) : 4 preuves concrètes à **icône container SVG** — Techniciens salariés · Interlocuteur humain local · Saint-Omer & Dunkerque · Prix & devis clairs.
- **Style** : bleu HELP CONFORT (#0DA0CF) + nuit (#0A1428) + accents contrôlés (violet diagnostic, orange urgence/devis, vert entretien) ; surfaces avec profondeur (ombres douces, pas de bordures partout ni gros rayons identiques) ; **aucun emoji** (SVG only) ; pas de gradient gadget.
- **Photo** : aucun asset hero/technicien qualitatif dispo → **pas de stock médiocre ni faux technicien** ; on mise sur la composition + preuves réelles.
- **Vide** : la grille + la bande réassurance remplissent le viewport 1440 ; pas de 500px de néant.
- **Micro-interactions** : hover élévation + flèche qui glisse + accent top ; `:focus-visible` net ; `prefers-reduced-motion` respecté.
- **Mobile** : pile — carte primaire, carte diagnostic, tuiles Devis/Entretien, urgence, réassurance. Cibles ≥44px, pas de texte minuscule.

## Contraintes fonctionnelles (inchangées)
`data-step-go` : `catalogue` (Je sais), `diagnosis` (Aidez-moi), `devis`, `entretien` ; urgence `tel:`.
Header tunnel + progression conservés. CATALOGUE+DIAGNOSTIC+DEVIS+ENTRETIEN+URGENCE+PANIER+RETOUR = inchangés.
