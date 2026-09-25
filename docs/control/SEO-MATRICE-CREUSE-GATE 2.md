# Matrice creuse ville×métier — décision de création (GATE Florian)

> Réponse au lot ChatGPT (5512242080). **Objectif : NON pas "toutes les combinaisons"**, mais
> uniquement les pages locales à **vraie valeur** et **suffisamment différenciables** (éviter
> thin/duplicate content = risque Google). Aucune page générée sans GO Florian.

## État actuel (56 pages)
Métiers = depannage, plombier, chauffagiste, serrurier, electricien, vitrier, menuisier, pmr, travaux, volets.
- **Complets (10/10)** : Saint-Omer, Dunkerque.
- **5/10** : Boulogne-sur-Mer, Calais (dep+plomb+chauf+serr+elec ; manquent vitrier/menuisier/pmr/travaux/volets).
- **3/10** : Coudekerque-Branche, Marck, Outreau, Wimereux (plomb+chauf+serr).
- **1/10 (plombier seul)** : Coulogne, Grande-Synthe, Guînes, Le Portel, Saint-Martin-Boulogne, Téteghem.
- **depannage seul** : Arques, Bergues, Coquelles, Gravelines, Longuenesse, Sangatte, Saint-Pol-sur-Mer, Saint-Martin-lez-Tatinghem.

## Matrice de décision (zones prioritaires uniquement)

| ZONE | MÉTIER | PAGE_EXISTE | INTENTION/DEMANDE | RISQUE_THIN | PRIORITÉ | RECOMMANDATION |
|---|---|---|---|---|---|---|
| Boulogne-sur-Mer | vitrier | NON | moyenne-forte (ville 40k) | moyen | **P1** | Créer si contenu différencié (bris de glace littoral, double-vitrage) |
| Boulogne-sur-Mer | menuisier | NON | moyenne | moyen | P2 | Créer après vitrier, sinon areaServed |
| Boulogne-sur-Mer | pmr/travaux/volets | NON | faible-moyenne | élevé | P3 | **Ne pas créer** — couvrir via areaServed |
| Calais | vitrier | NON | moyenne-forte (ville 70k) | moyen | **P1** | Créer si différencié |
| Calais | menuisier | NON | moyenne | moyen | P2 | Créer après vitrier |
| Calais | pmr/travaux/volets | NON | faible-moyenne | élevé | P3 | **Ne pas créer** — areaServed |
| Coudekerque-Branche | electricien | NON | moyenne (banlieue Dunkerque) | moyen | P2 | Optionnel, différenciation faible vs Dunkerque |
| Grande-Synthe | electricien/chauffagiste | NON | moyenne | moyen-élevé | P3 | areaServed via Dunkerque |
| Saint-Pol-sur-Mer | plombier/chauffagiste | NON | moyenne | élevé | P3 | areaServed via Dunkerque |
| Marck/Outreau/Wimereux | electricien/depannage | NON | faible | élevé | P3 | **Ne pas créer** — areaServed |
| Petites communes (Arques, Bergues, Coquelles, Guînes, Téteghem, Coulogne, Le Portel…) | tous métiers manquants | NON | faible | **très élevé** | P4 | **Ne pas créer** — rester en areaServed des pages depannage/ville proche |

## Synthèse recommandation
- **Créer (GO conseillé)** : **4 pages P1** — vitrier + menuisier pour **Boulogne** et **Calais** (2 villes majeures, demande réelle, contenu différenciable : littoral/bris de glace, menuiseries alu marine). Éventuellement 2 P2 (menuisier) selon capacité de rédaction UNIQUE.
- **Ne PAS créer** : tout le reste (P3/P4) → **couverture via `areaServed`** des pages existantes (déjà en place). Générer ces ~30+ pages = thin/dup content, dilution, risque Google. **Anti-recommandé.**
- **Condition technique si GO** : contenu 100% unique par page (pas de template dupliqué), + régénérer/redéployer l'Edge Function sitemap (`scripts/gen-sitemap-fn.mjs`) pour éviter la dérive repo↔prod, + vérifier canonicals/no-cannibalisation.

## Statut
`MATRICE_CREUSE=WAITING_GO` — aucune page générée. Décision création = Florian (P1 = 4 pages max recommandées ; défaut = ne rien générer, areaServed suffit).
