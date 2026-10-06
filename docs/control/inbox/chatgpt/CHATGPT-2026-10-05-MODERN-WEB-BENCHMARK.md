# BENCHMARK MODERN WEB 2026 — sortir du site générique IA

Décision Florian : le site actuel paraît trop généré par IA, trop générique et pas assez humain. Il faut arrêter de tout inventer à la main et s'appuyer intelligemment sur des bibliothèques, thèmes et patterns open source actuels, puis les personnaliser profondément à HELP CONFORT Saint-Omer.

## Objectif

Proposer un site "dernier cri" mais crédible pour une entreprise locale du bâtiment :
- humain ;
- visuel ;
- interactif ;
- rassurant ;
- rapide ;
- mobile-first ;
- clair ;
- avec vraie identité HELP CONFORT ;
- sans tomber dans l'effet Awwwards inutilisable.

## Benchmark technique obligatoire

Étudier au minimum :

### Fondations / composants
- HyperUI — composants Tailwind open source MIT, markup copiable.
- Flowbite — composants Tailwind open source, menus, modales, carrousels, galeries, formulaires, mega-menu.
- daisyUI — composants CSS/Tailwind, thèmes personnalisables, sans dépendance JS.
- AstroWind / thèmes Astro modernes — uniquement comme source d'architecture/patterns et option de migration progressive, pas de migration globale sans validation.

### Interactivité
- Alpine.js — interactions simples et légères directement dans le HTML.
- Motion for JavaScript — animations MIT, scroll reveal, hover, transitions, gestures.
- Lenis — smooth scroll uniquement si accessibilité/perf restent bonnes ; jamais obligatoire.
- Swiper ou Splide — galeries/carrousels tactiles.
- PhotoSwipe / lightbox équivalent — galerie interventions / avant-après.
- Lucide — système d'icônes cohérent, en complément des pictos métier HELP.

### Références design
Étudier Lapa Ninja, Land-book et Awwwards pour les patterns, pas pour copier :
- heroes éditoriaux ;
- bento grids ;
- big typography ;
- sticky storytelling ;
- reveal on scroll ;
- before/after ;
- galleries masonry ;
- proof strips ;
- counters ;
- cards asymétriques ;
- split layouts ;
- navigation mobile premium ;
- footer riche.

## Inspirations GitHub à regarder

Chercher et comparer des starters/templates open source réellement maintenus :
- AstroWind (Astro + Tailwind, widgets marketing, image optimisation, SEO).
- Templates Astro/Tailwind orientés service/local business.
- Templates construction/home-services avec animations.
- Ne jamais copier les textes/images de démo.
- Vérifier licence avant toute reprise.
- Conserver un fichier DESIGN-SOURCES.md avec URL, licence et pattern repris.

## Architecture proposée : 2 voies à comparer

### VOIE A — modernisation progressive, faible risque
Conserver le site statique actuel.
Ajouter :
- design tokens CSS modernes ;
- composants sélectionnés HyperUI/Flowbite/daisyUI adaptés ;
- Alpine.js pour comportements ;
- Motion pour micro-animations ;
- Lucide ;
- Swiper/Splide ;
- vraie médiathèque.

Avantages :
- faible risque SEO ;
- URLs inchangées ;
- migration progressive ;
- compatible Netlify actuel.

### VOIE B — shell moderne Astro
Prototype isolé avec Astro + Tailwind v4, pages statiques et composants réutilisables.
Ne PAS migrer la production.
Utiliser uniquement pour comparer :
- qualité visuelle ;
- maintenabilité ;
- performance ;
- SEO ;
- facilité de déclinaison des 100+ pages.

AstroWind peut servir de base d'étude mais doit être totalement rebrandé HELP CONFORT.

## Trois directions créatives à produire

### Direction 1 — "HELP Confort Premium Local"
- fond clair chaud ;
- cyan HELP dominant ;
- orange accent urgence ;
- grandes photos réelles ;
- blocs asymétriques ;
- typographie forte ;
- cartes métiers colorées ;
- animations sobres ;
- sensation entreprise locale premium et rassurante.

### Direction 2 — "Intervention Immersive"
- hero photo/vidéo intervention plein écran ou quasi plein écran ;
- sticky story ;
- chiffres qui s'animent ;
- avant/après ;
- galerie interventions ;
- zone d'intervention interactive ;
- micro-interactions plus poussées ;
- mobile très tactile.

### Direction 3 — "Maison / Habitat Editorial"
- esthétique magazine / architecture ;
- grande typographie ;
- beaucoup d'espace ;
- mosaïque photos ;
- catégories métiers comme chapitres ;
- particuliers/professionnels en univers distincts ;
- moins "dépannage urgent", plus "expert habitat complet".

## Pages prototypes obligatoires

Créer trois variantes d'ACCUEIL seulement, depuis le main courant, sans toucher prod :
- /maquette-2026-a
- /maquette-2026-b
- /maquette-2026-c

Pour chaque direction :
- desktop 1440 ;
- mobile 390 ;
- hero ;
- métiers ;
- preuve/avis ;
- particuliers/pro ;
- zone ;
- galerie/interventions ;
- CTA ;
- footer.

Ensuite proposer UNE déclinaison "Nos métiers" de la direction la plus forte.

## Effets modernes à tester avec discernement

- reveal au scroll ;
- headline split / clip reveal ;
- hover magnétique léger sur CTA ;
- cartes avec profondeur/parallax très subtil ;
- chiffres animés ;
- slider avis tactile ;
- gallery masonry ;
- before/after drag ;
- sticky section "1 interlocuteur, plusieurs métiers" ;
- transitions de section ;
- progress indicator mobile si utile ;
- menu mobile plein écran élégant.

Interdit :
- animation permanente partout ;
- scroll hijacking agressif ;
- WebGL/3D lourd sans valeur métier ;
- effets qui retardent le CTA urgence ;
- carrousels automatiques illisibles ;
- vidéo lourde non optimisée.

## Identité humaine

Le site doit montrer :
- vraies interventions ;
- vrais techniciens si médias disponibles ;
- vrais locaux/zone ;
- vrais avis ;
- vrais métiers ;
- vrais détails de chantier ;
- avant/après ;
- équipements ;
- proximité Saint-Omer/littoral.

Éviter :
- visages IA ;
- photos stock trop américaines ;
- pictos génériques sur chaque carte ;
- texte marketing creux.

## Performance / accessibilité

Budget cible prototype :
- LCP < 2,5 s mobile réaliste ;
- CLS < 0,1 ;
- pas de layout shift sur images ;
- prefers-reduced-motion respecté ;
- navigation clavier ;
- contrastes AA ;
- animations GPU-friendly ;
- JS chargé uniquement si utile.

## Livrables

1. `docs/design/DESIGN-SOURCES.md`
   - bibliothèque/template ;
   - URL/repo ;
   - licence ;
   - pattern retenu ;
   - raison ;
   - fichiers où utilisé.

2. `docs/design/MEDIA-LIBRARY.md`

3. `docs/control/outbox/claude/CLAUDE-2026-10-05-MODERN-WEB-BENCHMARK.md`
   - benchmark ;
   - comparaison Voie A / Voie B ;
   - trois directions ;
   - dette/risque ;
   - perf estimée ;
   - recommendation.

4. Trois previews actuelles A/B/C + captures 1440/390.

## Important

Ne déployer aucune refonte globale sans validation Florian.
Ne pas casser les funnels déjà PROD_VERIFIED.
Ne pas perdre SEO, URLs, formulaires ou tracking.
Le but n'est pas "faire joli" : créer une identité web forte, moderne, humaine et crédible.
