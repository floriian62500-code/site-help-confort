# Changelog HELP Confort — Site vitrine

Format : entrée par session de travail, classé par impact (critique, fonctionnel, esthétique).

---

## 2026-05-14 — Session refonte chantier 12

### 🚨 Critique (impact production)

- **RLS Supabase** : policy `contracts_anon_insert_publicform` créée — débloque les soumissions du formulaire contrat d'entretien (100% des leads passaient à la trappe).
- **Tarifs inventés retirés** : 6 pages contenaient des tarifs créés par IA sans source. Tous remplacés par les vrais tarifs issus de `Base_produits_2026-05-14_11-11.xlsx` ou passés en "sur devis".
- **Catalogue plomberie 100% plomberie** : retrait des prestations chauffage (entretien chaudière, désembouage radiateur) qui polluaient la page plomberie.
- **Bouton tel mobile qui débordait** : `.sticky-call` neutralisé partout (`display:none !important`).
- **Mégamenu sticky bloquant les clics** : `mouseleave + scheduleClose` rétabli sur 29 fichiers HTML.
- **Payload Supabase aligné au schéma** : champ `nom` (NOT NULL) avec fallback, `meta` → `tags`/`utm`.

### 🆕 Nouveau

- **Chatbot IA conversationnel** avec mémoire Supabase + admin de modération + boucle d'amélioration auto (3 edge functions : `chat-assistant`, `generate-service-content`, `suggest-prompt-improvement`).
- **Wizard home refondu** : 4 étapes, autocomplete BAN, persistance Supabase, prestations suggérées par IA selon description.
- **5 pages métier au design unifié** (plomberie, chauffage, électricité, serrurerie, travaux) : hero mascotte + chips orbitants + catalogue tarifs réels + couleur palette par métier.
- **4 guides SEO refondus** (fuite, entretien chaudière, mise aux normes, PMR) : picto métier + CTA gradient premium.
- **Modale "Réserver" 2 voies** : devis personnalisé OU réservation+paiement, branchée sur les 5 pages métier.
- **Page admin chat-conversations** : liste filtrable, modale détail, notation 1-5★, bouton ✨ analyse IA suggestions prompt.
- **Logos partenaires** : Atlantic, Hansgrohe, RS Ramon Soler (SVG officiels), Kinedo + Quare Design (SVG reconstitués).
- **Pictos métier intégrés** sur les 5 pages métier + 4 guides : picto-plomberie.png, picto-chauffage.svg, picto-electricite.png, picto-serrurerie.png, picto-renovation.png, picto-pmr.png.

### 📊 Documentation

- `admin-pro/TARIFS_REFERENCE.md` — source de vérité tarifs validés (30+ prestations)
- `admin-pro/MEMOIRE_IA_MAINTENANCE.md` — 40 bugs documentés + 26 sondes de scan
- `admin-pro/DEPLOY.md` — guide complet déploiement
- `admin-pro/QUICK_START.md` — démarrage rapide en 3 actions
- `admin-pro/URGENT.md` — checklist post-prod

### 🐛 Bugs résolus (sélection)

- Bouton "Continuer" step 2 wizard désactivé sans message d'aide (seuil 5→3 chars + hint visible)
- Chips multi-choix non capturées dans `state.metiers`
- Photo upload bloqué par `display:none` sur input + label imbriqué
- Anciennes clés Supabase révoquées hardcodées
- Tables manquantes (`chat_conversations`, `actualites`) avec SQL associés
- Cron `sync-facebook-posts` non configuré
- Images vides dans `content/actualites/index.json` → placeholder métier amélioré
- Slogan footer "Pourquoi faire appel à plusieurs entreprises" supprimé sur 30 fichiers
- Bandeau "Besoin d'une intervention ?" supprimé sur 5 pages métier
- Sticky-call mobile qui débordait du viewport (z-index/position fixed)
- Mégamenu Métiers qui restait ouvert et bloquait les clics

### 🎨 Esthétique

- Icônes des cards tarifs : carré plein gradient couleur métier au lieu de pastille grise
- Hover des cards adouci (plus de cadre violet épais)
- Footer slogan retiré
- Tarifs affichés en gros gras dans la couleur métier
- 6 chips orbitants animés autour de la mascotte 3D (5 pages métier)

---

## Sources de vérité

- **Tarifs** : `admin-pro/TARIFS_REFERENCE.md` ← `Base_produits_2026-05-14_11-11.xlsx`
- **Code** : repo GitHub `floriian62500-code/site-help-confort` branche `main` (auto-push activé)
- **Déploiement front** : Netlify (auto-deploy sur push main)
- **Déploiement back** : Supabase (manuel, voir `QUICK_START.md`)

---

*Document mis à jour automatiquement par l'agent Claude le 14/05/2026.*
