# Audit Tarifs — Sonde IA #28

_Généré le 2026-05-17 06:24 — `admin-pro/audits/audit_tarifs.py`_

- Pages publiques scannées : **45**
- Montants validés (TARIFS_REFERENCE.md) : **53**
- Alertes : **23**
- Erreurs lecture : **0**

## Règle
Tout montant `\d+\s*€` visible doit :
1. Apparaître dans `TARIFS_REFERENCE.md` (BAREME AGENCE), OU
2. Être marqué « estimation marché » / « exemple non engageant », OU
3. Avoir un attribut HTML `data-source="..."`.

## 🚨 Alertes

| Page | Ligne | Montant | Contexte |
|------|------:|--------:|----------|
| `aides.html` | 612 | **50000 €** | iv> ⏎  <h3>Éco-PTZ</h3> ⏎  </div> ⏎  <div class="body"> ⏎  <div class="montant">Jusqu'à 50 000 € (selon barème en vigueur)</div> ⏎  <p class |
| `chauffagiste-saint-omer.html` | 1272 | **144 €** | ="ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'es |
| `chauffagiste-saint-omer.html` | 1290 | **192 €** | ="ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'en |
| `chauffagiste-saint-omer.html` | 1307 | **324 €** | ="ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">Tout |
| `guide-adaptation-pmr.html` | 399 | **22000 €** | rir jusqu'à <strong>50 % à 70 % du coût des travaux</strong>, dans la limite de 22 000 € HT. Le bénéficiaire doit être propriétaire occupant |
| `guide-adaptation-pmr.html` | 412 | **5500 €** | lète adaptée</strong> (douche italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎ |
| `guide-adaptation-pmr.html` | 412 | **1800 €** | che italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎  <li><strong>Monte-escali |
| `guide-adaptation-pmr.html` | 413 | **3800 €** | > ⏎  <li><strong>Monte-escaliers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élar |
| `guide-adaptation-pmr.html` | 413 | **1200 €** | iers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élargissement de 3 portes intéri |
| `guide-adaptation-pmr.html` | 414 | **2200 €** | g>Élargissement de 3 portes intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack glo |
| `guide-adaptation-pmr.html` | 414 | **700 €** | s intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack global maintien à domicile</s |
| `guide-adaptation-pmr.html` | 415 | **9800 €** | al maintien à domicile</strong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comm |
| `guide-adaptation-pmr.html` | 415 | **3200 €** | rong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comment démarrer&nbsp;?</h2> ⏎ |
| `guide-entretien-chaudiere.html` | 384 | **100 €** | p;?</h2> ⏎ <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la rég |
| `guide-entretien-chaudiere.html` | 384 | **180 €** | <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la région. Chez < |
| `guide-mise-aux-normes-electriques.html` | 391 | **800 €** | ng>Petite mise en conformité</strong> (quelques anomalies ciblées)&nbsp;: 300 à 800 €</li> ⏎  <li><strong>Mise aux normes du tableau électri |
| `guide-mise-aux-normes-electriques.html` | 392 | **1500 €** | > ⏎  <li><strong>Mise aux normes du tableau électrique</strong> seul&nbsp;: 600 à 1 500 €</li> ⏎  <li><strong>Rénovation électrique complète |
| `guide-mise-aux-normes-electriques.html` | 393 | **9000 €** | li> ⏎  <li><strong>Rénovation électrique complète</strong> d'un T3&nbsp;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</stron |
| `guide-mise-aux-normes-electriques.html` | 394 | **15000 €** | ;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</strong> : 8 000 à 15 000 €</li> ⏎ </ul> ⏎ <p>Les <strong>aides MaPrimeRénov' |
| `guide-mise-aux-normes-electriques.html` | 421 | **1080 €** | -right:auto">Diagnostic gratuit · Tableau standard à <strong style="color:#fff">1 080 € TTC</strong> · Aides CEE & MaPrimeRénov' éligibles.  |
| `nos-prestations.html` | 410 | **144 €** | ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">L' |
| `nos-prestations.html` | 428 | **192 €** | ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">L' |
| `nos-prestations.html` | 445 | **324 €** | ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">To |

## Détail par page

| Page | OK | data-source | exempt | in-script | ALERT |
|------|---:|------------:|------:|----------:|------:|
| `404.html` | 0 | 0 | 0 | 0 | **0** |
| `a-propos.html` | 0 | 0 | 0 | 0 | **0** |
| `actualites.html` | 0 | 0 | 0 | 0 | **0** |
| `aides.html` | 0 | 0 | 0 | 1 | **1** |
| `avant-apres.html` | 0 | 0 | 0 | 0 | **0** |
| `blog.html` | 0 | 0 | 0 | 0 | **0** |
| `carrieres.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-saint-omer.html` | 9 | 0 | 0 | 0 | **3** |
| `contact.html` | 0 | 0 | 0 | 0 | **0** |
| `contrats-entretien.html` | 3 | 0 | 0 | 2 | **0** |
| `depannage-arques.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-bergues.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-dunkerque.html` | 2 | 0 | 0 | 3 | **0** |
| `depannage-gravelines.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-longuenesse.html` | 2 | 0 | 0 | 0 | **0** |
| `depannage-saint-martin-lez-tatinghem.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `devis-express.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `espace-client.html` | 0 | 0 | 0 | 0 | **0** |
| `faq.html` | 24 | 0 | 0 | 24 | **0** |
| `guide-adaptation-pmr.html` | 0 | 0 | 0 | 0 | **9** |
| `guide-entretien-chaudiere.html` | 4 | 0 | 0 | 0 | **2** |
| `guide-fuite-eau.html` | 0 | 0 | 0 | 0 | **0** |
| `guide-mise-aux-normes-electriques.html` | 0 | 0 | 0 | 0 | **5** |
| `guides.html` | 0 | 0 | 0 | 0 | **0** |
| `index.html` | 1 | 0 | 0 | 0 | **0** |
| `mentions-legales.html` | 0 | 0 | 0 | 0 | **0** |
| `menuisier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-prestations.html` | 9 | 0 | 0 | 15 | **3** |
| `partenaires.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `pmr-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `pro.html` | 0 | 0 | 0 | 0 | **0** |
| `processus.html` | 0 | 0 | 0 | 0 | **0** |
| `realisation.html` | 0 | 0 | 0 | 0 | **0** |
| `realisations.html` | 0 | 0 | 0 | 0 | **0** |
| `reset.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `sinistres.html` | 0 | 0 | 0 | 0 | **0** |
| `temoignages.html` | 0 | 0 | 0 | 0 | **0** |
| `travaux-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `vitrier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `volets-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `zones-intervention.html` | 0 | 0 | 0 | 0 | **0** |

## Montants valides reconnus depuis TARIFS_REFERENCE.md

5 €, 9 €, 10 €, 12 €, 13 €, 16 €, 23 €, 27 €, 45 €, 48 €, 50 €, 52 €, 53 €, 55 €, 58 €, 60 €, 63 €, 69 €, 75 €, 80 €, 88 €, 103 €, 104 €, 105 €, 107 €, 108 €, 114 €, 120 €, 121 €, 140 €, 148 €, 156 €, 165 €, 170 €, 176 €, 184 €, 187 €, 190 €, 203 €, 220 €, 228 €, 237 €, 276 €, 314 €, 320 €, 383 €, 817 €, 884 €, 887 €, 961 €, 1000 €, 1332 €, 1456 €
