# GEO/AEO BENCHMARK — panel de requêtes + feuille de score

> Chantier #9 / 5450879322. **Baseline datée : 2026-08-28.** Protocole **reproductible manuel**
> (aucun scraping interdit ; interroger chaque moteur via son UI/API autorisée, à la main, en
> navigation neutre/incognito, localisation 62/59 si possible). Re-mesurer périodiquement (mensuel).
> `[HYP]` : la corrélation correctifs → citation est une hypothèse à valider par la mesure.

## Protocole
1. Pour chaque requête × moteur (ChatGPT Search, Google (AI Overview + SERP), Gemini, Copilot/Bing, Perplexity),
   noter les KPI ci-dessous. Session neutre (déconnecté/incognito), même jour, horodater.
2. Ne PAS automatiser l'interrogation d'un moteur sans mécanisme autorisé.
3. Séparer **observation** (ce qui est affiché) de **causalité supposée** (pourquoi).

## KPI (par requête × moteur)
`marque_présente(O/N)` · `recommandation_explicite(O/N)` · `citation/source HELP CONFORT(URL)` ·
`position/listing si observable` · `concurrents cités` · `source ayant déclenché la mention` · `date`.

## Feuille de score (à remplir — 1 ligne par requête × moteur)
| # | Requête | Segment | Zone | Moteur | Marque? | Reco? | Source HELP | Position | Concurrents cités | Source déclencheuse | Date |
|---|---|---|---|---|---|---|---|---|---|---|---|
| exemple | plombier urgence Saint-Omer | TRANSAC | 62 | ChatGPT | | | | | | | 2026-08-28 |

## Panel de requêtes (≥60) — segmenté

### A. BRAND (marque) — 8
1. Help Confort Saint-Omer
2. Help Confort Dunkerque
3. avis Help Confort Saint-Omer
4. Dépan'Audo Saint-Omer
5. Dépan'DK Dunkerque
6. Help Confort dépannage Audomarois
7. Help Confort horaires téléphone
8. Help Confort réalisations chantiers

### B. NON-BRAND local — métier × ville — 24
9. plombier Saint-Omer · 10. plombier Dunkerque
11. chauffagiste Saint-Omer · 12. chauffagiste Dunkerque
13. électricien Saint-Omer · 14. électricien Dunkerque
15. serrurier Saint-Omer · 16. serrurier Dunkerque
17. vitrier Saint-Omer · 18. vitrier Dunkerque
19. menuisier Saint-Omer · 20. menuisier Dunkerque
21. entreprise rénovation Saint-Omer · 22. entreprise rénovation Dunkerque
23. dépannage plomberie Audomarois · 24. dépannage plomberie Dunkerquois
25. artisan chauffagiste 62500 · 26. artisan chauffagiste 59140
27. electricien Aire-sur-la-Lys · 28. serrurier Longuenesse
29. plombier Arques · 30. vitrier Saint-Martin-lez-Tatinghem
31. chauffagiste Grande-Synthe · 32. plombier Coudekerque-Branche

### C. TRANSACTIONNEL / URGENCE — 16
33. plombier urgence Saint-Omer · 34. serrurier urgence Dunkerque nuit
35. dégât des eaux Saint-Omer intervention · 36. fuite d'eau urgence Audomarois
37. porte claquée serrurier Saint-Omer · 38. bris de glace vitrier Dunkerque
39. chaudière en panne Saint-Omer · 40. plus de chauffage urgence 62
41. chauffagiste chaudière fioul Saint-Omer · 42. chauffagiste chaudière gaz Dunkerque
43. remplacement chauffe-eau Saint-Omer · 44. débouchage WC Saint-Omer
45. remplacement serrure Dunkerque prix · 46. dépannage électrique tableau Saint-Omer
47. entretien chaudière gaz Saint-Omer · 48. contrat entretien chaudière 62500

### D. CONSEIL / QUESTION (AEO) — 8
49. entretien chaudière gaz obligatoire fréquence
50. que faire en cas de fuite d'eau au plafond
51. prix remplacement d'une serrure 3 points
52. démarches assurance dégât des eaux
53. attestation d'entretien chaudière c'est quoi
54. dépannage plomberie samedi Saint-Omer
55. combien coûte un chauffagiste à l'heure
56. délai intervention serrurier urgence

### E. RECOMMANDATION / INTENTION DE CHOIX — 8
57. meilleur plombier Saint-Omer
58. entreprise dépannage recommandée Audomarois
59. à qui faire appel dégât des eaux Saint-Omer
60. chauffagiste sérieux Dunkerque avis
61. artisan de confiance rénovation Saint-Omer
62. entreprise plomberie techniciens salariés Saint-Omer
63. dépannage 24/7 vs agence locale Saint-Omer
64. qui contacter pour entretien chaudière Dunkerque

**Total : 64 requêtes** × 5 moteurs = 320 observations par vague de mesure.

## Vague 0 (baseline 2026-08-28) — À REMPLIR par observation manuelle
> Feuille vierge ci-dessus. Objectif : établir la présence/citation actuelle AVANT correctifs,
> puis re-mesurer après chaque lot P1 pour observer l'évolution (sans prétendre à la causalité directe).
