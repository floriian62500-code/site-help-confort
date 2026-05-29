# TODO Help Confort

# Format : une ligne par tâche, format Markdown.
#  - [ ] tâche en attente
#  - [x] tâche terminée (à laisser pour l'historique)
# Préfixe "URGENT" pour priorisation.

- [x] BUG: Drapeau Ukraine toujours visible sur carte zones-intervention malgré tile Wikimedia | source: chat 2026-05-19 17:15 | sévérité: normale (fait le 2026-05-19, fix V2 : tile Esri ArcGIS + CSS masque agressif)
- [x] URGENT BUG: Photos toujours absentes sur /realisations (3 cartes sur 4 sans image ni fallback) malgré fix CSS sélecteurs descendant | source: chat 2026-05-19 17:20 | sévérité: critique (fait le 2026-05-19, cause = URLs Facebook CDN qui bloquent le hot-linking → détection isFbCdn() qui force le fallback gradient)
- [x] URGENT BUG: Page /partenaires cassée (CSS ne charge pas, pictos 437×437px, layout détruit) | source: chat 2026-05-19 18h | sévérité: critique (fait le 2026-05-19, cause = CSS footer-v3 inline manquant sur 11 pages : partenaires, reseau-help-confort, agence-*, nos-villes, nos-metiers, etc. Fix : injection du bloc CSS depuis index.html sur les 11 pages)
- [x] Optimisation meta SEO : 37 pages avec desc/title trop longs (> 160/70 chars Google tronque) | source: audit autonome 2026-05-19 18h30 | sévérité: normale | détail: ex plombier-boulogne (172), vitrier-saint-omer title 78, serrurier-saint-omer desc 196 (fait le 2026-05-19, 29 pages corrigées : 17 descriptions raccourcies sous 160 chars + 14 titres raccourcis sous 70 chars, og:* synchronisés ; audit final 82/82 OK)
- [ ] Rapatrier 19 images Facebook CDN sur Supabase Storage (toutes réalisations actuellement en fallback gradient) | source: audit BDD 2026-05-19 | sévérité: normale | nécessite : Supabase Storage bucket + Edge Function de migration
- [x] Refactor : CSS footer-v3 commun à externaliser dans styles.css (fait le 2026-05-20, ajouté ligne 2042+ ; inline conservé comme failsafe → modifs futures uniquement dans styles.css)
- [x] Supabase performance : 6 indexes FK manquants ajoutés (fait le 2026-05-20 via migration hc_perf_add_missing_fk_indexes)
- [x] Fix CSS footer-v3 manquant sur 12 pages (partenaires, reseau-help-confort, agence-*, nos-villes, nos-metiers, notre-equipe…) | source: audit autonome 2026-05-19 | sévérité: critique | (fait le 2026-05-19, injection CSS depuis index.html)

# Ajout 2026-05-19 11:30 (session Cowork autonome)
- [x] BUG: drapeau Ukraine carte zones-intervention persiste malgré fix V1 (Wikimedia) et V2 (Esri ArcGIS) | source: chat 2026-05-19 | sévérité: normale (fait le 2026-05-29, RÉSOLU au niveau code : V3 a désactivé Leaflet — `if (true) return;` ligne 807 + tags <link>/<script> Leaflet commentés — et V4 du 2026-05-22 a remplacé la carte par 2 cartes agence + CTA. Plus aucune tuile ni asset tiers chargé sur la page → aucun drapeau possible côté site. Grep repo : zéro asset « ukrain » hors sélecteurs CSS du bloc Leaflet désactivé. Si un drapeau subsiste dans le navigateur de Florian = extension Chrome → cf. tâche « Test fenêtre privée »)
- [ ] Test fenêtre privée drapeau Ukraine (validation extension Chrome vs vrai bug) — Florian
- [x] Confirmer publication chasse d'eau 18:00 (Edge Function V5 + cron actif) (fait le 2026-05-19)
- [x] Si drapeau persiste en privé : remplacer Leaflet par carte SVG statique (fallback existant ligne 909+) (fait le 2026-05-29, rendue caduque : V3 a basculé sur le SVG statique puis V4 du 2026-05-22 l'a remplacé par 2 cartes agence + CTA. Leaflet n'est plus chargé du tout. Rien à faire de plus côté code.)
