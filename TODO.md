# TODO Help Confort

# Format : une ligne par tâche, format Markdown.
#  - [ ] tâche en attente
#  - [x] tâche terminée (à laisser pour l'historique)
# Préfixe "URGENT" pour priorisation.

- [x] BUG: Drapeau Ukraine toujours visible sur carte zones-intervention malgré tile Wikimedia | source: chat 2026-05-19 17:15 | sévérité: normale (fait le 2026-05-19, fix V2 : tile Esri ArcGIS + CSS masque agressif)
- [x] URGENT BUG: Photos toujours absentes sur /realisations (3 cartes sur 4 sans image ni fallback) malgré fix CSS sélecteurs descendant | source: chat 2026-05-19 17:20 | sévérité: critique (fait le 2026-05-19, cause = URLs Facebook CDN qui bloquent le hot-linking → détection isFbCdn() qui force le fallback gradient)
- [x] URGENT BUG: Page /partenaires cassée (CSS ne charge pas, pictos 437×437px, layout détruit) | source: chat 2026-05-19 18h | sévérité: critique (fait le 2026-05-19, cause = CSS footer-v3 inline manquant sur 11 pages : partenaires, reseau-help-confort, agence-*, nos-villes, nos-metiers, etc. Fix : injection du bloc CSS depuis index.html sur les 11 pages)
- [ ] Optimisation meta SEO : 37 pages avec desc/title trop longs (> 160/70 chars Google tronque) | source: audit autonome 2026-05-19 18h30 | sévérité: normale | détail: ex plombier-boulogne (172), vitrier-saint-omer title 78, serrurier-saint-omer desc 196
- [ ] Rapatrier 19 images Facebook CDN sur Supabase Storage (toutes réalisations actuellement en fallback gradient) | source: audit BDD 2026-05-19 | sévérité: normale | nécessite : Supabase Storage bucket + Edge Function de migration
- [ ] Refactor : CSS footer-v3 commun à externaliser dans styles.css (actuellement inline sur 68+ pages, drift régulier) | source: audit 2026-05-19 | sévérité: normale | bénéfice : -5 KB par page, fin des drifts
