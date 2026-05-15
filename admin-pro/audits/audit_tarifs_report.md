# Audit Tarifs — Sonde IA #28

_Généré le 2026-05-15 11:30 — `admin-pro/audits/audit_tarifs.py`_

- Pages publiques scannées : **38**
- Montants validés (TARIFS_REFERENCE.md) : **45**
- Alertes : **25**
- Erreurs lecture : **0**

## Règle
Tout montant `\d+\s*€` visible doit :
1. Apparaître dans `TARIFS_REFERENCE.md` (BAREME AGENCE), OU
2. Être marqué « estimation marché » / « exemple non engageant », OU
3. Avoir un attribut HTML `data-source="..."`.

## 🚨 Alertes

| Page | Ligne | Montant | Contexte |
|------|------:|--------:|----------|
| `depannage-dunkerque.html` | 696 | **60 €** | HT/h). En revanche, le <strong>déplacement</strong> sur Dunkerque est facturé à 60 € HT (au lieu de gratuit sur l'audomarois) en raison de l |
| `electricien-saint-omer.html` | 12 | **1080 €** | Saint-Omer & Dunkerque : dépannage 75 € TTC, recherche panne 107 € TTC, tableau 1 080 € TTC. Techniciens qualifiés NF C 15-100. ☎ 03 66 10 0 |
| `electricien-saint-omer.html` | 18 | **1080 €** | Saint-Omer & Dunkerque : dépannage 75 € TTC, recherche panne 107 € TTC, tableau 1 080 € TTC. Techniciens qualifiés NF C 15-100. ☎ 03 66 10 0 |
| `electricien-saint-omer.html` | 243 | **1080 €** | Saint-Omer & Dunkerque : dépannage 75 € TTC, recherche panne 107 € TTC, tableau 1 080 € TTC. Techniciens qualifiés NF C 15-100. ☎ 03 66 10 0 |
| `electricien-saint-omer.html` | 1356 | **1080 €** | dard avec disjoncteurs et différentiels.</p> ⏎         <div class="m-tarif-price">1 080 € TTC <small>· forfait standard</small></div> ⏎      |
| `guide-adaptation-pmr.html` | 445 | **22000 €** | rir jusqu'à <strong>50 % à 70 % du coût des travaux</strong>, dans la limite de 22 000 € HT. Le bénéficiaire doit être propriétaire occupant |
| `guide-adaptation-pmr.html` | 458 | **5500 €** | complète adaptée</strong> (douche italienne + WC rehaussés + barres d'appui) : 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎  |
| `guide-adaptation-pmr.html` | 458 | **1800 €** | (douche italienne + WC rehaussés + barres d'appui) : 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎   <li><strong>Monte-escali |
| `guide-adaptation-pmr.html` | 459 | **3800 €** | </li> ⏎   <li><strong>Monte-escaliers droit</strong> + main courante secondaire : 3 800 € → reste à charge ~1 200 €</li> ⏎   <li><strong>Éla |
| `guide-adaptation-pmr.html` | 459 | **1200 €** | escaliers droit</strong> + main courante secondaire : 3 800 € → reste à charge ~1 200 €</li> ⏎   <li><strong>Élargissement de 3 portes intér |
| `guide-adaptation-pmr.html` | 460 | **2200 €** | strong>Élargissement de 3 portes intérieures</strong> + suppression de seuils : 2 200 € → reste à charge ~700 €</li> ⏎   <li><strong>Pack gl |
| `guide-adaptation-pmr.html` | 460 | **700 €** | portes intérieures</strong> + suppression de seuils : 2 200 € → reste à charge ~700 €</li> ⏎   <li><strong>Pack global maintien à domicile</ |
| `guide-adaptation-pmr.html` | 461 | **9800 €** | global maintien à domicile</strong> (douche + WC + barres + monte-escaliers) : 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comme |
| `guide-adaptation-pmr.html` | 461 | **3200 €** | e</strong> (douche + WC + barres + monte-escaliers) : 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comment démarrer ?</h2> ⏎ <p>L |
| `guide-entretien-chaudiere.html` | 430 | **100 €** | e ?</h2> ⏎ <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la rég |
| `guide-entretien-chaudiere.html` | 430 | **180 €** | <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la région. Chez < |
| `guide-mise-aux-normes-electriques.html` | 437 | **800 €** | <strong>Petite mise en conformité</strong> (quelques anomalies ciblées) : 300 à 800 €</li> ⏎   <li><strong>Mise aux normes du tableau électr |
| `guide-mise-aux-normes-electriques.html` | 438 | **1500 €** | </li> ⏎   <li><strong>Mise aux normes du tableau électrique</strong> seul : 600 à 1 500 €</li> ⏎   <li><strong>Rénovation électrique complèt |
| `guide-mise-aux-normes-electriques.html` | 439 | **9000 €** | €</li> ⏎   <li><strong>Rénovation électrique complète</strong> d'un T3 : 4 000 à 9 000 €</li> ⏎   <li><strong>Maison entière (100 m²)</stron |
| `guide-mise-aux-normes-electriques.html` | 440 | **15000 €** | : 4 000 à 9 000 €</li> ⏎   <li><strong>Maison entière (100 m²)</strong> : 8 000 à 15 000 €</li> ⏎ </ul> ⏎ <p>Les <strong>aides MaPrimeRénov' |
| `guide-mise-aux-normes-electriques.html` | 467 | **1080 €** | -right:auto">Diagnostic gratuit · Tableau standard à <strong style="color:#fff">1 080 € TTC</strong> · Aides CEE & MaPrimeRénov' éligibles.  |
| `serrurier-saint-omer.html` | 1380 | **55 €** | perte de clé ou tentative d'effraction.</p> ⏎         <div class="m-tarif-price">55 € TTC <small>· pièce</small></div> ⏎         <a href="co |
| `travaux-saint-omer.html` | 1343 | **19 €** | es peinture acrylique déco. Tarif au m².</p> ⏎         <div class="m-tarif-price">19 € TTC <small>· par m²</small></div> ⏎         <a href=" |
| `travaux-saint-omer.html` | 1359 | **34 €** | de carrelage scellé. Évacuation incluse.</p> ⏎         <div class="m-tarif-price">34 € TTC <small>· par m²</small></div> ⏎         <a href=" |
| `travaux-saint-omer.html` | 1367 | **275 €** | cement à l'identique d'un meuble vasque.</p> ⏎         <div class="m-tarif-price">275 € TTC <small>· forfait</small></div> ⏎         <a href |

## Détail par page

| Page | OK | data-source | exempt | in-script | ALERT |
|------|---:|------------:|------:|----------:|------:|
| `404.html` | 0 | 0 | 0 | 0 | **0** |
| `a-propos.html` | 0 | 0 | 0 | 0 | **0** |
| `actualites.html` | 0 | 0 | 0 | 0 | **0** |
| `aides.html` | 0 | 0 | 0 | 1 | **0** |
| `avant-apres.html` | 0 | 0 | 0 | 0 | **0** |
| `carrieres.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-saint-omer.html` | 30 | 0 | 0 | 10 | **0** |
| `contact.html` | 0 | 0 | 0 | 36 | **0** |
| `contrats-entretien.html` | 3 | 0 | 0 | 2 | **0** |
| `depannage-arques.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-bergues.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-dunkerque.html` | 4 | 0 | 0 | 2 | **1** |
| `depannage-gravelines.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-longuenesse.html` | 2 | 0 | 0 | 0 | **0** |
| `depannage-saint-martin-lez-tatinghem.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-saint-omer.html` | 2 | 0 | 0 | 0 | **0** |
| `devis-express.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-saint-omer.html` | 17 | 0 | 0 | 3 | **4** |
| `espace-client.html` | 0 | 0 | 0 | 0 | **0** |
| `faq.html` | 24 | 0 | 0 | 24 | **0** |
| `guide-adaptation-pmr.html` | 0 | 0 | 0 | 0 | **9** |
| `guide-entretien-chaudiere.html` | 4 | 0 | 0 | 0 | **2** |
| `guide-fuite-eau.html` | 0 | 0 | 0 | 0 | **0** |
| `guide-mise-aux-normes-electriques.html` | 0 | 0 | 0 | 0 | **5** |
| `guides.html` | 0 | 0 | 0 | 0 | **0** |
| `index.html` | 1 | 0 | 0 | 0 | **0** |
| `mentions-legales.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-prestations.html` | 0 | 0 | 0 | 6 | **0** |
| `plombier-saint-omer.html` | 13 | 0 | 0 | 3 | **0** |
| `pro.html` | 0 | 0 | 0 | 0 | **0** |
| `processus.html` | 0 | 0 | 0 | 0 | **0** |
| `realisation.html` | 0 | 0 | 0 | 0 | **0** |
| `realisations.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-saint-omer.html` | 20 | 0 | 0 | 5 | **1** |
| `sinistres.html` | 0 | 0 | 0 | 0 | **0** |
| `temoignages.html` | 0 | 0 | 0 | 0 | **0** |
| `travaux-saint-omer.html` | 6 | 0 | 0 | 1 | **3** |
| `zones-intervention.html` | 0 | 0 | 0 | 0 | **0** |

## Montants valides reconnus depuis TARIFS_REFERENCE.md

5 €, 9 €, 12 €, 13 €, 16 €, 23 €, 27 €, 45 €, 50 €, 53 €, 58 €, 63 €, 69 €, 75 €, 80 €, 88 €, 104 €, 105 €, 107 €, 108 €, 115 €, 120 €, 121 €, 140 €, 148 €, 156 €, 165 €, 176 €, 184 €, 187 €, 190 €, 203 €, 220 €, 228 €, 237 €, 276 €, 314 €, 320 €, 383 €, 817 €, 884 €, 887 €, 961 €, 1332 €, 1456 €
