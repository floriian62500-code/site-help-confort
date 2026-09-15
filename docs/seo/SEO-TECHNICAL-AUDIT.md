# SEO-TECHNICAL-AUDIT (LOT 1) — mesures réelles, issue #9 / 5438239688

> 2026-08-27. `recette`. Aucune donnée inventée (pas de volume/position/CPC). Périmètre : 120 pages HTML racine + prestations/(35) + realisations/(25).

## #1 Cartographie URLs (métier × ville, réel)
plombier 14 · chauffagiste 8 · electricien 4 · serrurier 8 · vitrier 2 · menuisier 2 · volets 2 · depannage 12 · travaux 2 · pmr 2 · prestations/ 35 · realisations/ 25 · + home/contact/zones/nos-prestations/urgence…

## #2-3 Indexabilité & on-page (60 pages métier+ville+clés analysées)
| Contrôle | Résultat |
|---|---|
| robots.txt | ✅ présent |
| sitemap | ✅ servi par edge function (`_redirects` → `/functions/v1/sitemap`) |
| canonical manquant | **0** |
| meta description manquante | **0** |
| H1 absent / multiple | **0 / 0** |
| **titres dupliqués (cannibalisation)** | **0** |

## #4 Duplication de contenu (texte visible, villes d'un même métier)
| Groupe | Similarité vs réf | Pages ≥85% (doorway/duplication nuisible) |
|---|---|---|
| plombier (14) | 55–74 % | **0** |
| serrurier (8) | 52–76 % | **0** |
| depannage (12) | 59–60 % | **0** |
→ Les pages villes sont **différenciées** (vocabulaire métier partagé, pas des clones). **Pas de doorway pages.**

## #8 Données structurées (JSON-LD, types réellement présents)
LocalBusiness (96) · Service (193) · Offer (158) · FAQPage (Question/Answer 200/200) · City · PostalAddress (124) · BreadcrumbList/ListItem. **Pas d'AggregateRating/Review fabriqué détecté** (à re-confirmer sur échantillon avant tout ajout).

## #9 NAP — cohérence téléphone
- Numéro principal **`03 66 10 01 34`** : **757 occurrences cohérentes** ✅.
- `06 12 34 56 78` (6×) = **placeholders de formulaire** (bénin, non-NAP).
- 🟡 2 numéros orphelins dans `nos-prestations.html` (0626011761, 0475474262) — probables exemples schema, **à vérifier** ; 1 dans `mentions-legales.html` (hébergeur, légitime).

## Findings classés
| Sévérité | Anomalie | Correction |
|---|---|---|
| — | Baseline technique | ✅ SAINE (canonical/meta/H1/schema/0 duplication nuisible) — pas de chantier de réparation critique |
| MOYEN | 2 numéros orphelins nos-prestations.html | vérifier s'ils sont réels ou exemples schema à retirer |
| FAIBLE | placeholders `06 12 34 56 78` | bénin (input placeholder) |
| OPPORTUNITÉ | architecture locale (LOT 2) + contenu (LOT 3) | non-défauts : leviers de croissance, pas des bugs |

**Conclusion** : le SEO **technique** n'est pas cassé. Les gains sont dans l'**architecture d'intention locale** (LOT 2), le **contenu qui convertit** (LOT 3), le **GBP/tracking/Ads** (LOTs 4-7, gate comptes Google). Aucune correction critique urgente ; pas de doorway pages à défaire.
