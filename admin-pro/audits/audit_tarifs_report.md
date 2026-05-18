# Audit Tarifs — Sonde IA #28

_Généré le 2026-05-18 06:58 — `admin-pro/audits/audit_tarifs.py`_

- Pages publiques scannées : **78**
- Montants validés (TARIFS_REFERENCE.md) : **53**
- Alertes : **93**
- Erreurs lecture : **0**

## Règle
Tout montant `\d+\s*€` visible doit :
1. Apparaître dans `TARIFS_REFERENCE.md` (BAREME AGENCE), OU
2. Être marqué « estimation marché » / « exemple non engageant », OU
3. Avoir un attribut HTML `data-source="..."`.

## 🚨 Alertes

| Page | Ligne | Montant | Contexte |
|------|------:|--------:|----------|
| `aides.html` | 633 | **50000 €** | iv> ⏎  <h3>Éco-PTZ</h3> ⏎  </div> ⏎  <div class="body"> ⏎  <div class="montant">Jusqu'à 50 000 € (selon barème en vigueur)</div> ⏎  <p class |
| `chauffagiste-boulogne-sur-mer.html` | 1266 | **144 €** | ="ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'es |
| `chauffagiste-boulogne-sur-mer.html` | 1284 | **192 €** | ="ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'en |
| `chauffagiste-boulogne-sur-mer.html` | 1301 | **324 €** | ="ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">Tout |
| `chauffagiste-calais.html` | 1074 | **800 €** | uit ou un changement de circulateur peut prolonger sa vie 3-5 ans pour moins de 800€.</p></div></div> ⏎ <div style="max-width:980px;margin:1 |
| `chauffagiste-calais.html` | 1266 | **144 €** | ="ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'es |
| `chauffagiste-calais.html` | 1284 | **192 €** | ="ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'en |
| `chauffagiste-calais.html` | 1301 | **324 €** | ="ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">Tout |
| `chauffagiste-dunkerque.html` | 1266 | **144 €** | ="ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'es |
| `chauffagiste-dunkerque.html` | 1284 | **192 €** | ="ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'en |
| `chauffagiste-dunkerque.html` | 1301 | **324 €** | ="ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">Tout |
| `chauffagiste-saint-omer.html` | 1275 | **144 €** | ="ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'es |
| `chauffagiste-saint-omer.html` | 1293 | **192 €** | ="ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">L'en |
| `chauffagiste-saint-omer.html` | 1310 | **324 €** | ="ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="ce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="ce-baseline">Tout |
| `debouchage-canalisation.html` | 217 | **180 €** | papier accumulé, cheveux). Intervention courte (30 min à 1h) — tarif moyen 90 à 180€ TTC sur Saint-Omer / Dunkerque.</p> ⏎  ⏎ <h3>2. Hydrocu |
| `debouchage-canalisation.html` | 220 | **400 €** | utile aussi en préventif après plusieurs bouchons rapprochés. Tarif moyen 180 à 400€ TTC selon l'accessibilité.</p> ⏎  ⏎ <h3>3. Inspection c |
| `debouchage-canalisation.html` | 231 | **180 €** | c55e"> ⏎     <h3 style="color:#22c55e">Débouchage simple</h3> ⏎     <p><strong>90 à 180€ TTC</strong><br>Furet WC, évier, lavabo. Sous 1h.</ |
| `debouchage-canalisation.html` | 235 | **400 €** | r:#FF6B1A"> ⏎     <h3 style="color:#FF6B1A">Hydrocurage</h3> ⏎     <p><strong>180 à 400€ TTC</strong><br>Canalisation principale, collecteur |
| `debouchage-canalisation.html` | 249 | **180 €** | débouchage de canalisation ?</h3> ⏎   <p>Sur Saint-Omer / Dunkerque, comptez 90 à 180€ TTC pour un débouchage simple au furet (WC, évier), e |
| `debouchage-canalisation.html` | 249 | **400 €** | comptez 90 à 180€ TTC pour un débouchage simple au furet (WC, évier), et 180 à 400€ TTC pour un hydrocurage. Tarif annoncé avant interventio |
| `entretien-chaudiere.html` | 160 | **130 €** | annuel + attestation</td><td style="padding:14px;font-weight:700;color:#FF6B1A">130€</td></tr> ⏎     <tr style="background:#FAFCFD"><td styl |
| `entretien-chaudiere.html` | 161 | **175 €** | dépannage gratuit/an</td><td style="padding:14px;font-weight:700;color:#FF6B1A">175€</td></tr> ⏎     <tr><td style="padding:14px;font-weight |
| `entretien-chaudiere.html` | 162 | **210 €** | s + pièces (limites)</td><td style="padding:14px;font-weight:700;color:#FF6B1A">210€</td></tr> ⏎   </tbody> ⏎ </table> ⏎  ⏎ <p style="margin |
| `guide-adaptation-pmr.html` | 449 | **22000 €** | rir jusqu'à <strong>50 % à 70 % du coût des travaux</strong>, dans la limite de 22 000 € HT. Le bénéficiaire doit être propriétaire occupant |
| `guide-adaptation-pmr.html` | 462 | **5500 €** | lète adaptée</strong> (douche italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎ |
| `guide-adaptation-pmr.html` | 462 | **1800 €** | che italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎  <li><strong>Monte-escali |
| `guide-adaptation-pmr.html` | 463 | **3800 €** | > ⏎  <li><strong>Monte-escaliers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élar |
| `guide-adaptation-pmr.html` | 463 | **1200 €** | iers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élargissement de 3 portes intéri |
| `guide-adaptation-pmr.html` | 464 | **2200 €** | g>Élargissement de 3 portes intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack glo |
| `guide-adaptation-pmr.html` | 464 | **700 €** | s intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack global maintien à domicile</s |
| `guide-adaptation-pmr.html` | 465 | **9800 €** | al maintien à domicile</strong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comm |
| `guide-adaptation-pmr.html` | 465 | **3200 €** | rong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comment démarrer&nbsp;?</h2> ⏎ |
| `guide-entretien-chaudiere.html` | 434 | **100 €** | p;?</h2> ⏎ <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la rég |
| `guide-entretien-chaudiere.html` | 434 | **180 €** | <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la région. Chez < |
| `guide-mise-aux-normes-electriques.html` | 441 | **800 €** | ng>Petite mise en conformité</strong> (quelques anomalies ciblées)&nbsp;: 300 à 800 €</li> ⏎  <li><strong>Mise aux normes du tableau électri |
| `guide-mise-aux-normes-electriques.html` | 442 | **1500 €** | > ⏎  <li><strong>Mise aux normes du tableau électrique</strong> seul&nbsp;: 600 à 1 500 €</li> ⏎  <li><strong>Rénovation électrique complète |
| `guide-mise-aux-normes-electriques.html` | 443 | **9000 €** | li> ⏎  <li><strong>Rénovation électrique complète</strong> d'un T3&nbsp;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</stron |
| `guide-mise-aux-normes-electriques.html` | 444 | **15000 €** | ;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</strong> : 8 000 à 15 000 €</li> ⏎ </ul> ⏎ <p>Les <strong>aides MaPrimeRénov' |
| `guide-mise-aux-normes-electriques.html` | 471 | **1080 €** | -right:auto">Diagnostic gratuit · Tableau standard à <strong style="color:#fff">1 080 € TTC</strong> · Aides CEE & MaPrimeRénov' éligibles.  |
| `menuisier-dunkerque.html` | 1044 | **100 €** | ement de fenêtres / portes d'entrée donne droit à des aides cumulables (jusqu'à 100€/m² selon revenus). Nous vous accompagnons sur le dossie |
| `nos-prestations.html` | 410 | **144 €** | ce-price">12 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 144 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">L' |
| `nos-prestations.html` | 428 | **192 €** | ce-price">16 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 192 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">L' |
| `nos-prestations.html` | 445 | **324 €** | ce-price">27 € HT<small> /mois</small></div> ⏎  <div class="npce-price-year">soit 324 € HT/an</div> ⏎  </div> ⏎  <p class="npce-baseline">To |
| `ouverture-porte-claquee.html` | 194 | **29 €** | gin:0">Sur Internet, beaucoup d'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Av |
| `ouverture-porte-claquee.html` | 194 | **39 €** | ">Sur Internet, beaucoup d'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Avant d |
| `ouverture-porte-claquee.html` | 194 | **1500 €** | 'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Avant d'appeler n'importe qui dan |
| `ouverture-porte-claquee.html` | 213 | **180 €** | tyle="color:#16a34a">Ouverture simple (heures ouvrées)</h3> ⏎     <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</ |
| `ouverture-porte-claquee.html` | 217 | **450 €** | <h3 style="color:#FF6B1A">Avec changement de cylindre</h3> ⏎     <p><strong>250 à 450€ TTC</strong><br>Cylindre standard, 3 clés fournies.</ |
| `ouverture-porte-claquee.html` | 221 | **750 €** | > ⏎     <h3 style="color:#7C3AED">Serrure A2P 3 étoiles</h3> ⏎     <p><strong>450 à 750€ TTC</strong><br>Haute sécurité, anti-bumping, anti- |
| `ouverture-porte-claquee.html` | 240 | **180 €** | s="op-faq"> ⏎   <h3>Combien coûte une ouverture de porte claquée ?</h3> ⏎   <p>90 à 180€ TTC pour une ouverture non destructive en heures ou |
| `pmr-dunkerque.html` | 1020 | **8000 €** | , siège mural, barres de maintien, robinetterie thermostatique. Compter 3 500 à 8 000€ TTC selon ampleur, souvent largement aidé.</p><p styl |
| `remplacement-chauffe-eau.html` | 230 | **1100 €** | </thead> ⏎   <tbody> ⏎     <tr><td><strong>Électrique 200L</strong></td><td>750 - 1 100€</td><td>~2 500 kWh</td><td>—</td></tr> ⏎     <tr><t |
| `remplacement-chauffe-eau.html` | 231 | **1300 €** | td><td>—</td></tr> ⏎     <tr><td><strong>Électrique blindé</strong></td><td>900 - 1 300€</td><td>~2 400 kWh</td><td>—</td></tr> ⏎     <tr><t |
| `remplacement-chauffe-eau.html` | 232 | **4500 €** | d>—</td></tr> ⏎     <tr><td><strong>Thermodynamique 200L</strong></td><td>2 800 - 4 500€</td><td>~700 kWh</td><td>MaPrimeRénov + CEE</td></t |
| `remplacement-chauffe-eau.html` | 233 | **3200 €** | + CEE</td></tr> ⏎     <tr><td><strong>Gaz à condensation</strong></td><td>1 800 - 3 200€</td><td>variable</td><td>CEE possible</td></tr> ⏎   |
| `remplacement-chauffe-eau.html` | 238 | **1500 €** | u Dunkerque, MaPrimeRénov + CEE rendent le projet souvent finançable à moins de 1 500€ de reste à charge.</p> ⏎  ⏎ <h2>Comment se passe l'in |
| `remplacement-chauffe-eau.html` | 255 | **1400 €** | faq"> ⏎   <h3>Quel est le prix d'un remplacement de chauffe-eau ?</h3> ⏎   <p>750 à 1 400€ TTC pour un électrique 150-200 L posé, 2 800 à 4  |
| `remplacement-chauffe-eau.html` | 255 | **4500 €** | ffe-eau ?</h3> ⏎   <p>750 à 1 400€ TTC pour un électrique 150-200 L posé, 2 800 à 4 500€ TTC pour un thermodynamique (avec aides possibles). |
| `tarifs.html` | 131 | **150 €** | -info">(joint, robinet, chasse d'eau)</span></td><td class="tf-prix range">80 - 150€</td><td>30 min - 1h</td></tr> ⏎       <tr><td>Débouchag |
| `tarifs.html` | 132 | **180 €** | ge-canalisation.html">page dédiée</a></span></td><td class="tf-prix range">90 - 180€</td><td>1h</td></tr> ⏎       <tr><td>Hydrocurage canali |
| `tarifs.html` | 133 | **400 €** | <tr><td>Hydrocurage canalisation principale</td><td class="tf-prix range">180 - 400€</td><td>1h30 - 3h</td></tr> ⏎       <tr><td>Recherche d |
| `tarifs.html` | 134 | **450 €** | r><td>Recherche de fuite (sans destruction)</td><td class="tf-prix range">220 - 450€</td><td>2-4h</td></tr> ⏎       <tr><td>Remplacement mit |
| `tarifs.html` | 136 | **1400 €** | nt-chauffe-eau.html">page dédiée</a></span></td><td class="tf-prix range">750 - 1 400€</td><td>2 - 3h</td></tr> ⏎       <tr><td>Pose chauffe |
| `tarifs.html` | 137 | **4500 €** | aides MaPrimeRénov / CEE possibles</span></td><td class="tf-prix range">2 800 - 4 500€</td><td>4 - 6h</td></tr> ⏎     </tbody> ⏎   </table>  |
| `tarifs.html` | 150 | **180 €** | f-info">(obligation décret 2009-649)</span></td><td class="tf-prix range">110 - 180€</td><td>1h</td></tr> ⏎       <tr><td>Contrat d'entretie |
| `tarifs.html` | 151 | **210 €** | ts-entretien.html">voir formules</a></span></td><td class="tf-prix range">130 - 210€/an</td><td>—</td></tr> ⏎       <tr><td>Désembouage circ |
| `tarifs.html` | 152 | **750 €** | <tr><td>Désembouage circuit chauffage</td><td class="tf-prix range">450 - 750€</td><td>3 - 5h</td></tr> ⏎       <tr><td>Remplacement circula |
| `tarifs.html` | 153 | **450 €** | /tr> ⏎       <tr><td>Remplacement circulateur</td><td class="tf-prix range">280 - 450€</td><td>1h30 - 2h</td></tr> ⏎       <tr><td>Remplacem |
| `tarifs.html` | 154 | **6500 €** | aides MaPrimeRénov / CEE possibles</span></td><td class="tf-prix range">3 800 - 6 500€</td><td>1 - 2 jours</td></tr> ⏎     </tbody> ⏎   </ta |
| `tarifs.html` | 167 | **180 €** | tf-info">(vente, location, > 15 ans)</span></td><td class="tf-prix range">120 - 180€</td><td>1h - 1h30</td></tr> ⏎       <tr><td>Remplacemen |
| `tarifs.html` | 168 | **250 €** | <td>Remplacement disjoncteur / différentiel</td><td class="tf-prix range">130 - 250€</td><td>1h</td></tr> ⏎       <tr><td>Mise en sécurité t |
| `tarifs.html` | 169 | **700 €** | <tr><td>Mise en sécurité tableau électrique</td><td class="tf-prix range">350 - 700€</td><td>3 - 5h</td></tr> ⏎       <tr><td>Mise aux norme |
| `tarifs.html` | 170 | **2500 €** | -electriques.html">guide complet</a></span></td><td class="tf-prix range">800 - 2 500€</td><td>1 - 3 jours</td></tr> ⏎       <tr><td>Pose bo |
| `tarifs.html` | 171 | **1600 €** | r><td>Pose borne véhicule électrique 7.4 kW</td><td class="tf-prix range">850 - 1 600€</td><td>3 - 6h</td></tr> ⏎     </tbody> ⏎   </table>  |
| `tarifs.html` | 184 | **180 €** | e-porte-claquee.html">page dédiée</a></span></td><td class="tf-prix range">90 - 180€</td><td>30 min - 1h</td></tr> ⏎       <tr><td>Changemen |
| `tarifs.html` | 186 | **450 €** | >Changement serrure 3 points + cylindre A2P</td><td class="tf-prix range">280 - 450€</td><td>1h - 1h30</td></tr> ⏎       <tr><td>Pose cylind |
| `tarifs.html` | 187 | **600 €** | ylindre A2P 3 étoiles (très haute sécurité)</td><td class="tf-prix range">350 - 600€</td><td>1h</td></tr> ⏎       <tr><td>Blindage porte com |
| `tarifs.html` | 188 | **1200 €** | ></tr> ⏎       <tr><td>Blindage porte complet</td><td class="tf-prix range">600 - 1 200€</td><td>3 - 4h</td></tr> ⏎     </tbody> ⏎   </table |
| `tarifs.html` | 202 | **300 €** | tr> ⏎       <tr><td>Remplacement vitre simple</td><td class="tf-prix range">150 - 300€</td><td>1h</td></tr> ⏎       <tr><td>Remplacement dou |
| `tarifs.html` | 203 | **550 €** | >Remplacement double vitrage standard (1m²)</td><td class="tf-prix range">280 - 550€</td><td>1h - 2h</td></tr> ⏎       <tr><td>Double vitrag |
| `tarifs.html` | 204 | **850 €** | Double vitrage isolant phonique / thermique</td><td class="tf-prix range">450 - 850€</td><td>1h30 - 3h</td></tr> ⏎     </tbody> ⏎   </table> |
| `tarifs.html` | 217 | **8000 €** | ansformation baignoire → douche italienne</td><td class="tf-prix range">3 500 - 8 000€</td><td>3 - 7 jours</td></tr> ⏎       <tr><td>Rénovat |
| `tarifs.html` | 218 | **18000 €** | <tr><td>Rénovation salle de bain complète</td><td class="tf-prix range">7 000 - 18 000€</td><td>1 - 3 semaines</td></tr> ⏎       <tr><td>Ada |
| `tarifs.html` | 219 | **8000 €** | meAdapt' jusqu'à 70% selon revenus</span></td><td class="tf-prix range">3 500 - 8 000€</td><td>3 - 7 jours</td></tr> ⏎       <tr><td>Réparat |
| `tarifs.html` | 220 | **850 €** | Réparation plafond + peinture (pièce 12 m²)</td><td class="tf-prix range">450 - 850€</td><td>1 - 2 jours</td></tr> ⏎     </tbody> ⏎   </tabl |
| `tarifs.html` | 227 | **29 €** | <p style="margin:0">Beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Véri |
| `tarifs.html` | 227 | **39 €** | style="margin:0">Beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Vérifie |
| `tarifs.html` | 227 | **1500 €** | de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Vérifiez : SIRET visible, adresse |
| `tarifs.html` | 244 | **1500 €** | <h3>Acceptez-vous le paiement échelonné ?</h3> ⏎   <p>Oui, pour les chantiers > 1 500€ TTC : 3-4 fois sans frais. Pour rénovations lourdes : |
| `travaux-dunkerque.html` | 1035 | **12000 €** | (sol antidérapant, paroi vitrée, robinetterie thermostatique). Compter 3 500 à 12 000€ TTC selon ampleur.</p><p style="margin:0 0 10px"><str |
| `urgence.html` | 178 | **29 €** | 2> ⏎   <p>Sur Internet, beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention e |
| `urgence.html` | 178 | **39 €** | <p>Sur Internet, beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention en préte |
| `urgence.html` | 178 | **1500 €** | de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention en prétextant la nuit, le week-end |

## Détail par page

| Page | OK | data-source | exempt | in-script | ALERT |
|------|---:|------------:|------:|----------:|------:|
| `404.html` | 0 | 0 | 0 | 0 | **0** |
| `a-propos.html` | 0 | 0 | 0 | 0 | **0** |
| `actualites.html` | 0 | 0 | 0 | 0 | **0** |
| `agence-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `agence-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `aides.html` | 0 | 0 | 0 | 1 | **1** |
| `avant-apres.html` | 0 | 0 | 0 | 0 | **0** |
| `blog.html` | 0 | 0 | 0 | 0 | **0** |
| `carrieres.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-boulogne-sur-mer.html` | 9 | 0 | 0 | 0 | **3** |
| `chauffagiste-calais.html` | 9 | 0 | 0 | 0 | **4** |
| `chauffagiste-dunkerque.html` | 9 | 0 | 0 | 0 | **3** |
| `chauffagiste-saint-omer.html` | 9 | 0 | 0 | 0 | **3** |
| `contact.html` | 0 | 0 | 0 | 0 | **0** |
| `contrats-entretien.html` | 3 | 0 | 0 | 2 | **0** |
| `debouchage-canalisation.html` | 1 | 0 | 0 | 2 | **6** |
| `depannage-arques.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-bergues.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-calais.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-coquelles.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-dunkerque.html` | 2 | 0 | 0 | 3 | **0** |
| `depannage-gravelines.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-longuenesse.html` | 2 | 0 | 0 | 0 | **0** |
| `depannage-saint-martin-lez-tatinghem.html` | 3 | 0 | 0 | 0 | **0** |
| `depannage-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-saint-pol-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `depannage-sangatte.html` | 0 | 0 | 0 | 0 | **0** |
| `devis-express.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-calais.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `entretien-chaudiere.html` | 0 | 0 | 0 | 1 | **3** |
| `espace-client.html` | 0 | 0 | 0 | 0 | **0** |
| `faq.html` | 24 | 0 | 0 | 24 | **0** |
| `guide-adaptation-pmr.html` | 0 | 0 | 0 | 0 | **9** |
| `guide-entretien-chaudiere.html` | 4 | 0 | 0 | 1 | **2** |
| `guide-fuite-eau.html` | 0 | 0 | 0 | 0 | **0** |
| `guide-mise-aux-normes-electriques.html` | 0 | 0 | 0 | 1 | **5** |
| `guides.html` | 0 | 0 | 0 | 0 | **0** |
| `index.html` | 1 | 0 | 0 | 0 | **0** |
| `mentions-legales.html` | 0 | 0 | 0 | 0 | **0** |
| `menuisier-dunkerque.html` | 0 | 0 | 0 | 0 | **1** |
| `menuisier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-metiers.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-prestations.html` | 9 | 0 | 0 | 15 | **3** |
| `nos-villes.html` | 0 | 0 | 0 | 0 | **0** |
| `ouverture-porte-claquee.html` | 2 | 0 | 0 | 6 | **7** |
| `partenaires.html` | 0 | 0 | 0 | 0 | **0** |
| `plan-du-site.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-calais.html` | 1 | 0 | 0 | 0 | **0** |
| `plombier-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `pmr-dunkerque.html` | 0 | 0 | 0 | 0 | **1** |
| `pmr-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `pro.html` | 0 | 0 | 0 | 0 | **0** |
| `processus.html` | 0 | 0 | 0 | 0 | **0** |
| `realisation.html` | 0 | 0 | 0 | 0 | **0** |
| `realisations.html` | 0 | 0 | 0 | 0 | **0** |
| `remplacement-chauffe-eau.html` | 0 | 0 | 0 | 3 | **7** |
| `reset.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-calais.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `sinistres.html` | 0 | 0 | 0 | 0 | **0** |
| `tarifs.html` | 4 | 0 | 0 | 1 | **31** |
| `temoignages.html` | 0 | 0 | 0 | 0 | **0** |
| `travaux-dunkerque.html` | 0 | 0 | 0 | 0 | **1** |
| `travaux-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `urgence.html` | 1 | 0 | 0 | 4 | **3** |
| `vitrier-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `vitrier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `volets-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `volets-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `zones-intervention.html` | 0 | 0 | 0 | 0 | **0** |

## Montants valides reconnus depuis TARIFS_REFERENCE.md

5 €, 9 €, 10 €, 12 €, 13 €, 16 €, 23 €, 27 €, 45 €, 48 €, 50 €, 52 €, 53 €, 55 €, 58 €, 60 €, 63 €, 69 €, 75 €, 80 €, 88 €, 103 €, 104 €, 105 €, 107 €, 108 €, 114 €, 120 €, 121 €, 140 €, 148 €, 156 €, 165 €, 170 €, 176 €, 184 €, 187 €, 190 €, 203 €, 220 €, 228 €, 237 €, 276 €, 314 €, 320 €, 383 €, 817 €, 884 €, 887 €, 961 €, 1000 €, 1332 €, 1456 €
