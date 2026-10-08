# Audit Tarifs — Sonde IA #28

_Généré le 2026-10-08 10:09 — `admin-pro/audits/audit_tarifs.py`_

- Pages publiques scannées : **119**
- Montants validés (TARIFS_REFERENCE.md) : **53**
- Alertes : **182**
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
| `blog-comment-detecter-fuite-eau-cachee.html` | 197 | **30 €** | me très lentement, ne minimisez pas : une fuite de 1L/heure = 8 760 L/an, soit ~30 € à 40 € de surconsommation chez Veolia ou Eau et Force.< |
| `blog-comment-detecter-fuite-eau-cachee.html` | 197 | **40 €** | lentement, ne minimisez pas : une fuite de 1L/heure = 8 760 L/an, soit ~30 € à 40 € de surconsommation chez Veolia ou Eau et Force.</p> ⏎ </ |
| `blog-comment-detecter-fuite-eau-cachee.html` | 212 | **180 €** | de amplifiée. Chez HELP Confort, l'intervention de recherche de fuite démarre à 180 € TTC, garantie sans casse en cas de localisation positi |
| `blog-cout-renovation-salle-de-bain.html` | 7 | **5000 €** | LP Confort</title> ⏎ <meta name="description" content="Rénovation salle de bain : 5 000 € à 25 000 €. Décomposition détaillée des coûts par  |
| `blog-cout-renovation-salle-de-bain.html` | 7 | **25000 €** | </title> ⏎ <meta name="description" content="Rénovation salle de bain : 5 000 € à 25 000 €. Décomposition détaillée des coûts par poste et c |
| `blog-cout-renovation-salle-de-bain.html` | 13 | **5000 €** | P Confort"> ⏎ <meta property="og:description" content="Rénovation salle de bain : 5 000 € à 25 000 €. Décomposition détaillée des coûts par  |
| `blog-cout-renovation-salle-de-bain.html` | 13 | **25000 €** | > ⏎ <meta property="og:description" content="Rénovation salle de bain : 5 000 € à 25 000 €. Décomposition détaillée des coûts par poste et c |
| `blog-cout-renovation-salle-de-bain.html` | 192 | **14000 €** | </section> ⏎ <section class="blog-section"> ⏎   <h2>Décomposition d'un budget moyen 14 000 € TTC</h2> ⏎   <ul> ⏎     <li>Démolition + évacua |
| `blog-cout-renovation-salle-de-bain.html` | 194 | **1200 €** | on d'un budget moyen 14 000 € TTC</h2> ⏎   <ul> ⏎     <li>Démolition + évacuation : 1 200 €</li> ⏎     <li>Plomberie (déplacements + neuf) : |
| `blog-cout-renovation-salle-de-bain.html` | 195 | **1800 €** | émolition + évacuation : 1 200 €</li> ⏎     <li>Plomberie (déplacements + neuf) : 1 800 €</li> ⏎     <li>Électricité (mise aux normes + spot |
| `blog-cout-renovation-salle-de-bain.html` | 196 | **1200 €** | acements + neuf) : 1 800 €</li> ⏎     <li>Électricité (mise aux normes + spots) : 1 200 €</li> ⏎     <li>Carrelage sol + mur (40 m² posé) :  |
| `blog-cout-renovation-salle-de-bain.html` | 197 | **3500 €** | e aux normes + spots) : 1 200 €</li> ⏎     <li>Carrelage sol + mur (40 m² posé) : 3 500 €</li> ⏎     <li>Faïence murs douche/baignoire : 800 |
| `blog-cout-renovation-salle-de-bain.html` | 198 | **800 €** | e sol + mur (40 m² posé) : 3 500 €</li> ⏎     <li>Faïence murs douche/baignoire : 800 €</li> ⏎     <li>Sanitaires (WC, lavabo, mitigeurs) :  |
| `blog-cout-renovation-salle-de-bain.html` | 199 | **1200 €** | murs douche/baignoire : 800 €</li> ⏎     <li>Sanitaires (WC, lavabo, mitigeurs) : 1 200 €</li> ⏎     <li>Douche italienne + receveur : 1 100 |
| `blog-cout-renovation-salle-de-bain.html` | 200 | **1100 €** | es (WC, lavabo, mitigeurs) : 1 200 €</li> ⏎     <li>Douche italienne + receveur : 1 100 €</li> ⏎     <li>Meuble vasque + miroir : 1 000 €</l |
| `blog-cout-renovation-salle-de-bain.html` | 202 | **600 €** | i> ⏎     <li>Meuble vasque + miroir : 1 000 €</li> ⏎     <li>Peinture + finitions : 600 €</li> ⏎     <li>Main d'œuvre coordination : 1 600 € |
| `blog-cout-renovation-salle-de-bain.html` | 203 | **1600 €** | > ⏎     <li>Peinture + finitions : 600 €</li> ⏎     <li>Main d'œuvre coordination : 1 600 €</li> ⏎   </ul> ⏎ </section> ⏎ <section class="bl |
| `blog-cout-renovation-salle-de-bain.html` | 209 | **2000 €** | le budget</h2> ⏎   <ul> ⏎     <li>Découverte humidité au mur (chape à reprendre : +2 000 €)</li> ⏎     <li>Plomberie en cuivre ancienne à re |
| `blog-cout-renovation-salle-de-bain.html` | 210 | **1500 €** | à reprendre : +2 000 €)</li> ⏎     <li>Plomberie en cuivre ancienne à remplacer (+1 500 €)</li> ⏎     <li>Tableau électrique pas aux normes  |
| `blog-cout-renovation-salle-de-bain.html` | 211 | **200 €** | e à remplacer (+1 500 €)</li> ⏎     <li>Tableau électrique pas aux normes (+800-1 200 €)</li> ⏎     <li>Sol pas plan (chape de ragréage : +6 |
| `blog-cout-renovation-salle-de-bain.html` | 212 | **600 €** | e pas aux normes (+800-1 200 €)</li> ⏎     <li>Sol pas plan (chape de ragréage : +600 €)</li> ⏎     <li>Cumulus à déplacer (+400 €)</li> ⏎   |
| `blog-cout-renovation-salle-de-bain.html` | 213 | **400 €** | <li>Sol pas plan (chape de ragréage : +600 €)</li> ⏎     <li>Cumulus à déplacer (+400 €)</li> ⏎     <li>Demande de PMR en cours de chantier  |
| `blog-cout-renovation-salle-de-bain.html` | 214 | **3500 €** | >Cumulus à déplacer (+400 €)</li> ⏎     <li>Demande de PMR en cours de chantier (+3 500 €)</li> ⏎   </ul> ⏎ </section> ⏎ <section class="blo |
| `blog-cout-renovation-salle-de-bain.html` | 223 | **14000 €** | class="blog-section"> ⏎   <h2>Le délai standard</h2> ⏎   <p>Une rénovation moyenne (14 000 €) demande 4 à 6 semaines de chantier, dont vous  |
| `blog-cout-renovation-salle-de-bain.html` | 227 | **22000 €** | Aides 2026 pour salles de bain</h2> ⏎   <p>Hors PMR/seniors (MaPrimeAdapt jusqu'à 22 000 €), il n'y a pas d'aides directes pour la salle de  |
| `blog-cout-renovation-salle-de-bain.html` | 227 | **1200 €** | bain. Mais : si vous remplacez un cumulus par un chauffe-eau thermodynamique = 1 200 € MPR + 350 € CEE. Si vous remplacez un cumulus par un  |
| `blog-cout-renovation-salle-de-bain.html` | 227 | **350 €** | si vous remplacez un cumulus par un chauffe-eau thermodynamique = 1 200 € MPR + 350 € CEE. Si vous remplacez un cumulus par un solaire = 4 0 |
| `blog-cout-renovation-salle-de-bain.html` | 227 | **4000 €** | amique = 1 200 € MPR + 350 € CEE. Si vous remplacez un cumulus par un solaire = 4 000 € MPR + 600 € CEE. C'est l'occasion de moderniser le s |
| `blog-cout-renovation-salle-de-bain.html` | 227 | **600 €** | € MPR + 350 € CEE. Si vous remplacez un cumulus par un solaire = 4 000 € MPR + 600 € CEE. C'est l'occasion de moderniser le système ECS en m |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 211 | **178 €** | li>Entretien chaudière gaz : 121 € TTC</li> ⏎     <li>Entretien chaudière fioul : 178,20 € TTC (218,90 € TTC pour un gros volume)</li> ⏎     |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 211 | **218 €** | haudière gaz : 121 € TTC</li> ⏎     <li>Entretien chaudière fioul : 178,20 € TTC (218,90 € TTC pour un gros volume)</li> ⏎     <li>Entretien |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 213 | **118 €** | e</li> ⏎     <li>Contrat d'entretien annuel (formule BASIC) : 9,90 € TTC / mois = 118,80 € TTC / an + dépannage prioritaire</li> ⏎   </ul> ⏎ |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 218 | **14 €** | r/week-end, petites pièces incluses, conseils continus. Notre formule CONFORT à 14,30 € TTC/mois est plébiscitée par nos clients (78% des co |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 223 | **29 €** | <h2>Souscrire un contrat d'entretien chaudière</h2> ⏎   <p>3 formules de 9,90 € à 29,70 € TTC/mois. Sans engagement, résiliation libre.</p>  |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 193 | **200 €** | ée de vie variable (20 à 60 ans selon essence et exposition), prix élevé (700-1 200 €/fenêtre). À privilégier pour bâtiments anciens, secteu |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 207 | **100 €** | og-section"> ⏎   <h2>Aides 2026 pour fenêtres</h2> ⏎   <p>MaPrimeRenov accorde 40 à 100 €/fenêtre selon tranche revenus (Intermédiaires et M |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 207 | **100 €** | 0 à 100 €/fenêtre selon tranche revenus (Intermédiaires et Modestes). CEE prime 100 €/fenêtre cumulable. TVA 5,5%. Conditions : Uw <1,3 W/m² |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 207 | **1600 €** | let (pas seulement vitrage). Pour 8 fenêtres remplacées chez un foyer modeste : 1 600 € d'aides en moyenne sur 6 400 € TTC de devis.</p> ⏎ < |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 207 | **6400 €** | ur 8 fenêtres remplacées chez un foyer modeste : 1 600 € d'aides en moyenne sur 6 400 € TTC de devis.</p> ⏎ </section> ⏎ <section class="blo |
| `blog-isolation-combles-aides-2026.html` | 189 | **18 €** | us". Isolation par soufflage de laine minérale ou cellulose entre les solives — 18 €/m² en moyenne. Si vos combles sont aménageables (charpe |
| `blog-isolation-combles-aides-2026.html` | 189 | **95 €** | sous panne), isolation par l'intérieur des rampants avec doublage placo — 60 à 95 €/m². Si vous prévoyez de les aménager dans les 5 ans, il  |
| `blog-isolation-combles-aides-2026.html` | 197 | **50000 €** | PR)</li> ⏎     <li>TVA 5,5% sur travaux et matériaux</li> ⏎     <li>Éco-PTZ jusqu'à 50 000 € sur 20 ans sans intérêts</li> ⏎     <li>Coup de |
| `blog-isolation-combles-aides-2026.html` | 198 | **20 €** | ans intérêts</li> ⏎     <li>Coup de pouce isolation (pour les revenus modestes) : 20 € de + par m²</li> ⏎   </ul> ⏎ </section> ⏎ <section cl |
| `blog-isolation-combles-aides-2026.html` | 203 | **1800 €** | final après aides</h2> ⏎   <p>100 m² de combles perdus isolés en laine minérale : 1 800 € TTC avant aides. Pour un foyer modeste (RFR <31 88 |
| `blog-isolation-combles-aides-2026.html` | 203 | **31889 €** | isolés en laine minérale : 1 800 € TTC avant aides. Pour un foyer modeste (RFR <31 889 € à 2 personnes), MPR rapporte 2 000 €, CEE 1 200 €,  |
| `blog-isolation-combles-aides-2026.html` | 203 | **2000 €** | avant aides. Pour un foyer modeste (RFR <31 889 € à 2 personnes), MPR rapporte 2 000 €, CEE 1 200 €, soit 3 200 € d'aides. Vous gagnez de l' |
| `blog-isolation-combles-aides-2026.html` | 203 | **1200 €** | Pour un foyer modeste (RFR <31 889 € à 2 personnes), MPR rapporte 2 000 €, CEE 1 200 €, soit 3 200 € d'aides. Vous gagnez de l'argent (1 400 |
| `blog-isolation-combles-aides-2026.html` | 203 | **3200 €** | modeste (RFR <31 889 € à 2 personnes), MPR rapporte 2 000 €, CEE 1 200 €, soit 3 200 € d'aides. Vous gagnez de l'argent (1 400 € de + que le |
| `blog-isolation-combles-aides-2026.html` | 203 | **1400 €** | R rapporte 2 000 €, CEE 1 200 €, soit 3 200 € d'aides. Vous gagnez de l'argent (1 400 € de + que le coût des travaux) et économisez ~600 €/a |
| `blog-isolation-combles-aides-2026.html` | 203 | **600 €** | . Vous gagnez de l'argent (1 400 € de + que le coût des travaux) et économisez ~600 €/an sur votre facture énergie. ROI immédiat. Pour un fo |
| `blog-isolation-combles-aides-2026.html` | 203 | **200 €** | cture énergie. ROI immédiat. Pour un foyer intermédiaire, même calcul aboutit à 200 € de reste à charge max.</p> ⏎ </section> ⏎ <section cla |
| `blog-panne-electrique-disjoncteur-saute.html` | 170 | **200 €** | <p class="lead">Plus de courant chez vous ? Avant d'appeler un électricien à 200 €, 90% des pannes se résolvent en 5 minutes avec les bons r |
| `blog-panne-electrique-disjoncteur-saute.html` | 212 | **650 €** | ar exemple), ou si vous avez des fusibles à plomb : pensez à le rénover. Coût : 650 € à 2 400 € selon nombre de circuits. Aides MPR 2026 pos |
| `blog-panne-electrique-disjoncteur-saute.html` | 212 | **2400 €** | le), ou si vous avez des fusibles à plomb : pensez à le rénover. Coût : 650 € à 2 400 € selon nombre de circuits. Aides MPR 2026 possibles p |
| `blog-panne-electrique-disjoncteur-saute.html` | 212 | **650 €** | elon nombre de circuits. Aides MPR 2026 possibles pour mise aux normes (jusqu'à 650 € en tranche Très modestes).</p> ⏎ </section> ⏎  ⏎ <sect |
| `blog-pmr-adapter-salle-de-bain-senior.html` | 202 | **22000 €** | tion"> ⏎   <h2>Aides financières 2026</h2> ⏎   <ul> ⏎     <li>MaPrimeAdapt' : jusqu'à 22 000 € selon revenus (nouveau dispositif 2025)</li>  |
| `blog-pmr-adapter-salle-de-bain-senior.html` | 204 | **3500 €** | nses, plafonné</li> ⏎     <li>CARSAT / caisses de retraite : aide travaux jusqu'à 3 500 €</li> ⏎     <li>PCH (Prestation Compensation du Han |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 209 | **5000 €** | g-section"> ⏎   <h2>Aides 2026 : massives</h2> ⏎   <ul> ⏎     <li>MPR Très modestes : 5 000 €</li> ⏎     <li>MPR Modestes : 4 000 €</li> ⏎   |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 210 | **4000 €** | ves</h2> ⏎   <ul> ⏎     <li>MPR Très modestes : 5 000 €</li> ⏎     <li>MPR Modestes : 4 000 €</li> ⏎     <li>MPR Intermédiaires : 3 000 €</l |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 211 | **3000 €** | : 5 000 €</li> ⏎     <li>MPR Modestes : 4 000 €</li> ⏎     <li>MPR Intermédiaires : 3 000 €</li> ⏎     <li>CEE moyenne : 4 500 € quel que so |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 212 | **4500 €** | : 4 000 €</li> ⏎     <li>MPR Intermédiaires : 3 000 €</li> ⏎     <li>CEE moyenne : 4 500 € quel que soit le revenu</li> ⏎     <li>Total aide |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 213 | **10500 €** | EE moyenne : 4 500 € quel que soit le revenu</li> ⏎     <li>Total aides maximum : 10 500 € en tranche Très modestes</li> ⏎     <li>TVA 5,5%  |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 7 | **200 €** | /title> ⏎ <meta name="description" content="Avant d'appeler un serrurier et payer 200€, vérifiez ces 5 points : voisin double, conjoint, fen |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 13 | **200 €** | ⏎ <meta property="og:description" content="Avant d'appeler un serrurier et payer 200€, vérifiez ces 5 points : voisin double, conjoint, fenê |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 170 | **200 €** | >Vous êtes coincé devant votre porte ? Avant de céder à la panique (et de payer 200 € à un serrurier) prenez 10 minutes pour vérifier ces 5  |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 197 | **300 €** | MAIF, MACIF, Matmut, GMF incluent une "assistance serrurerie" couvrant jusqu'à 300 € de frais. Avant d'appeler n'importe quel serrurier (sou |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 201 | **800 €** | s urgences ! Évitez les pubs Google Ads en haut de page (souvent des arnaques à 800 € pour une porte claquée). Appelez un artisan local conn |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 201 | **180 €** | 01 34. Tarif annoncé avant intervention : ouverture porte claquée entre 80 € et 180 € selon technique nécessaire (sans casse de cylindre).</ |
| `blog-preparer-sa-maison-hiver-checklist.html` | 218 | **180 €** | anormal ou débit faible : changer la VMC (200-450 €) ou nettoyer les conduits (180 €).</p> ⏎ </section> ⏎ <section class="blog-section"> ⏎   |
| `blog-preparer-sa-maison-hiver-checklist.html` | 241 | **89 €** | ection class="blog-section"> ⏎   <h2>Notre intervention préventive</h2> ⏎   <p>Pour 89 € TTC, nous réalisons un check-up complet pré-hiver : |
| `blog-preparer-sa-maison-hiver-checklist.html` | 246 | **89 €** | n> ⏎  ⏎ <section class="blog-cta-block"> ⏎   <h2>Check-up pré-hiver complet</h2> ⏎   <p>89 € TTC · 30 points contrôlés · Rapport écrit · Con |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 186 | **3200 €** | ions de remplacement en 2026</h2> ⏎   <ul> ⏎     <li>Chaudière gaz à condensation : 3 200 € - 4 800 € posés, rendement 109%</li> ⏎     <li>P |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 186 | **4800 €** | mplacement en 2026</h2> ⏎   <ul> ⏎     <li>Chaudière gaz à condensation : 3 200 € - 4 800 € posés, rendement 109%</li> ⏎     <li>Pompe à cha |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 187 | **12000 €** | 3 200 € - 4 800 € posés, rendement 109%</li> ⏎     <li>Pompe à chaleur air/eau : 12 000 € - 18 000 € posés, rendement 380%</li> ⏎     <li>Ch |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 187 | **18000 €** | 4 800 € posés, rendement 109%</li> ⏎     <li>Pompe à chaleur air/eau : 12 000 € - 18 000 € posés, rendement 380%</li> ⏎     <li>Chaudière bi |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 188 | **14000 €** | € - 18 000 € posés, rendement 380%</li> ⏎     <li>Chaudière biomasse (granulés) : 14 000 € - 22 000 € posés, énergie renouvelable</li> ⏎     |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 188 | **22000 €** | € posés, rendement 380%</li> ⏎     <li>Chaudière biomasse (granulés) : 14 000 € - 22 000 € posés, énergie renouvelable</li> ⏎     <li>Pompe  |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 189 | **22000 €** | 2 000 € posés, énergie renouvelable</li> ⏎     <li>Pompe à chaleur géothermique : 22 000 € - 32 000 € posés, performance record</li> ⏎   </u |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 189 | **32000 €** | és, énergie renouvelable</li> ⏎     <li>Pompe à chaleur géothermique : 22 000 € - 32 000 € posés, performance record</li> ⏎   </ul> ⏎ </sect |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **31889 €** | 2026 : barèmes</h2> ⏎   <p>Pour les tranches "Très modestes" et "Modestes" (RFR <31 889 € pour 2 personnes), les montants sont substantiels  |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **5000 €** | t "Modestes" (RFR <31 889 € pour 2 personnes), les montants sont substantiels : 5 000 € pour une PAC air/eau, 11 000 € pour une PAC géotherm |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **11000 €** | ur 2 personnes), les montants sont substantiels : 5 000 € pour une PAC air/eau, 11 000 € pour une PAC géothermique. Les revenus "Intermédiai |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **3000 €** | /eau, 11 000 € pour une PAC géothermique. Les revenus "Intermédiaires" touchent 3 000 € et 6 000 € respectivement. Les "Supérieurs" (>44 907 |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **6000 €** | 0 € pour une PAC géothermique. Les revenus "Intermédiaires" touchent 3 000 € et 6 000 € respectivement. Les "Supérieurs" (>44 907 € RFR pour |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 194 | **44907 €** | "Intermédiaires" touchent 3 000 € et 6 000 € respectivement. Les "Supérieurs" (>44 907 € RFR pour 2 personnes) ne sont plus éligibles depuis |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 199 | **4500 €** | <h2>Certificats d'économies d'énergie (CEE)</h2> ⏎   <ul> ⏎     <li>PAC air/eau : 4 500 € en moyenne</li> ⏎     <li>PAC géothermique : 5 000 |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 200 | **5000 €** | <ul> ⏎     <li>PAC air/eau : 4 500 € en moyenne</li> ⏎     <li>PAC géothermique : 5 000 €</li> ⏎     <li>Chaudière granulés : 3 500 €</li> ⏎ |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 201 | **3500 €** | yenne</li> ⏎     <li>PAC géothermique : 5 000 €</li> ⏎     <li>Chaudière granulés : 3 500 €</li> ⏎     <li>Chaudière gaz THPE : 1 200 € (uni |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 202 | **1200 €** | 0 €</li> ⏎     <li>Chaudière granulés : 3 500 €</li> ⏎     <li>Chaudière gaz THPE : 1 200 € (uniquement remplacement chaudière fioul ou >25  |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 207 | **277 €** | ction"> ⏎   <h2>Chèque énergie 2026</h2> ⏎   <p>Versement automatique entre 48 € et 277 € selon votre RFR. À conserver pour payer une factur |
| `chauffagiste-calais.html` | 1031 | **800 €** | uit ou un changement de circulateur peut prolonger sa vie 3-5 ans pour moins de 800€.</p></div></div> ⏎  ⏎ <section class="m-section m-contr |
| `debouchage-canalisation.html` | 311 | **180 €** | papier accumulé, cheveux). Intervention courte (30 min à 1h) — tarif moyen 90 à 180€ TTC sur Saint-Omer / Dunkerque.</p> ⏎  ⏎ <h3>2. Hydrocu |
| `debouchage-canalisation.html` | 314 | **400 €** | utile aussi en préventif après plusieurs bouchons rapprochés. Tarif moyen 180 à 400€ TTC selon l'accessibilité.</p> ⏎  ⏎ <h3>3. Inspection c |
| `debouchage-canalisation.html` | 325 | **180 €** | c55e"> ⏎     <h3 style="color:#22c55e">Débouchage simple</h3> ⏎     <p><strong>90 à 180€ TTC</strong><br>Furet WC, évier, lavabo. Interventi |
| `debouchage-canalisation.html` | 329 | **400 €** | r:#FF6B1A"> ⏎     <h3 style="color:#FF6B1A">Hydrocurage</h3> ⏎     <p><strong>180 à 400€ TTC</strong><br>Canalisation principale, collecteur |
| `debouchage-canalisation.html` | 343 | **180 €** | débouchage de canalisation ?</h3> ⏎   <p>Sur Saint-Omer / Dunkerque, comptez 90 à 180€ TTC pour un débouchage simple au furet (WC, évier), e |
| `debouchage-canalisation.html` | 343 | **400 €** | comptez 90 à 180€ TTC pour un débouchage simple au furet (WC, évier), et 180 à 400€ TTC pour un hydrocurage. Tarif annoncé avant interventio |
| `diagnostic-electrique.html` | 247 | **180 €** | :14px">T2 - T3</td><td style="padding:14px;font-weight:700;color:#5B21B6">120 - 180€</td><td style="padding:14px">1h - 1h15</td></tr> ⏎      |
| `diagnostic-electrique.html` | 248 | **250 €** | 14px">T4 - T5+</td><td style="padding:14px;font-weight:700;color:#5B21B6">180 - 250€</td><td style="padding:14px">1h30</td></tr> ⏎     <tr>< |
| `entretien-chaudiere.html` | 251 | **130 €** | annuel + attestation</td><td style="padding:14px;font-weight:700;color:#FF6B1A">130€</td></tr> ⏎     <tr style="background:#FAFCFD"><td styl |
| `entretien-chaudiere.html` | 252 | **175 €** | dépannage gratuit/an</td><td style="padding:14px;font-weight:700;color:#FF6B1A">175€</td></tr> ⏎     <tr><td style="padding:14px;font-weight |
| `entretien-chaudiere.html` | 253 | **210 €** | s + pièces (limites)</td><td style="padding:14px;font-weight:700;color:#FF6B1A">210€</td></tr> ⏎   </tbody> ⏎ </table> ⏎  ⏎ <p style="margin |
| `faq.html` | 225 | **14 €** | ong>3 formules gaz</strong> : BASIC 9,90 € TTC/mois (entretien annuel), CONFORT 14,30 € TTC/mois (+ dépannage prioritaire), SÉCURITÉ 25,30 € |
| `faq.html` | 225 | **25 €** | entretien annuel), CONFORT 14,30 € TTC/mois (+ dépannage prioritaire), SÉCURITÉ 25,30 € TTC/mois (tout inclus pièces + main d'œuvre).<br> ⏎  |
| `faq.html` | 226 | **17 €** | main d'œuvre).<br> ⏎  <strong>3 formules fioul</strong> : BASIC 13,20 €, CONFORT 17,60 €, SÉCURITÉ 29,70 € TTC/mois. <a href="contrats-entre |
| `faq.html` | 226 | **29 €** | > ⏎  <strong>3 formules fioul</strong> : BASIC 13,20 €, CONFORT 17,60 €, SÉCURITÉ 29,70 € TTC/mois. <a href="contrats-entretien.html">Souscr |
| `guide-adaptation-pmr.html` | 335 | **22000 €** | rir jusqu'à <strong>50 % à 70 % du coût des travaux</strong>, dans la limite de 22 000 € HT. Le bénéficiaire doit être propriétaire occupant |
| `guide-adaptation-pmr.html` | 348 | **5500 €** | lète adaptée</strong> (douche italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎ |
| `guide-adaptation-pmr.html` | 348 | **1800 €** | che italienne + WC rehaussés + barres d'appui)&nbsp;: 5 500 € → reste à charge ~1 800 € après MaPrimeAdapt'</li> ⏎  <li><strong>Monte-escali |
| `guide-adaptation-pmr.html` | 349 | **3800 €** | > ⏎  <li><strong>Monte-escaliers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élar |
| `guide-adaptation-pmr.html` | 349 | **1200 €** | iers droit</strong> + main courante secondaire&nbsp;: 3 800 € → reste à charge ~1 200 €</li> ⏎  <li><strong>Élargissement de 3 portes intéri |
| `guide-adaptation-pmr.html` | 350 | **2200 €** | g>Élargissement de 3 portes intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack glo |
| `guide-adaptation-pmr.html` | 350 | **700 €** | s intérieures</strong> + suppression de seuils&nbsp;: 2 200 € → reste à charge ~700 €</li> ⏎  <li><strong>Pack global maintien à domicile</s |
| `guide-adaptation-pmr.html` | 351 | **9800 €** | al maintien à domicile</strong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comm |
| `guide-adaptation-pmr.html` | 351 | **3200 €** | rong> (douche + WC + barres + monte-escaliers)&nbsp;: 9 800 € → reste à charge ~3 200 €</li> ⏎ </ul> ⏎ <h2>6. Comment démarrer&nbsp;?</h2> ⏎ |
| `guide-entretien-chaudiere.html` | 320 | **100 €** | p;?</h2> ⏎ <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la rég |
| `guide-entretien-chaudiere.html` | 320 | **180 €** | <p>Le prix moyen d'un entretien chaudière gaz en France se situe entre 100 € et 180 € TTC selon la marque, la puissance et la région. Chez < |
| `guide-mise-aux-normes-electriques.html` | 327 | **800 €** | ng>Petite mise en conformité</strong> (quelques anomalies ciblées)&nbsp;: 300 à 800 €</li> ⏎  <li><strong>Mise aux normes du tableau électri |
| `guide-mise-aux-normes-electriques.html` | 328 | **1500 €** | > ⏎  <li><strong>Mise aux normes du tableau électrique</strong> seul&nbsp;: 600 à 1 500 €</li> ⏎  <li><strong>Rénovation électrique complète |
| `guide-mise-aux-normes-electriques.html` | 329 | **9000 €** | li> ⏎  <li><strong>Rénovation électrique complète</strong> d'un T3&nbsp;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</stron |
| `guide-mise-aux-normes-electriques.html` | 330 | **15000 €** | ;: 4 000 à 9 000 €</li> ⏎  <li><strong>Maison entière (100 m²)</strong> : 8 000 à 15 000 €</li> ⏎ </ul> ⏎ <p>Les <strong>aides MaPrimeRénov' |
| `guide-mise-aux-normes-electriques.html` | 357 | **1080 €** | -right:auto">Diagnostic gratuit · Tableau standard à <strong style="color:#fff">1 080 € TTC</strong> · Aides CEE & MaPrimeRénov' éligibles.  |
| `maprimeadapt.html` | 128 | **22000 €** | <strong>70%</strong><span>d'aide max</span></div> ⏎ <div class="mpa-knum"><strong>22 000€</strong><span>plafond HT</span></div> ⏎ <div class |
| `maprimeadapt.html` | 140 | **22000 €** | du montant des travaux</strong> d'adaptation du logement. Plafond de travaux à 22 000 € HT. Jusqu'à 15 400 € d'aide pour une douche italienn |
| `maprimeadapt.html` | 140 | **15400 €** | ux</strong> d'adaptation du logement. Plafond de travaux à 22 000 € HT. Jusqu'à 15 400 € d'aide pour une douche italienne, monte-escalier ou |
| `maprimeadapt.html` | 144 | **34884 €** | ) ressources modestes (revenu fiscal référence). Couple à Saint-Omer avec RFR ≤ 34 884 € = aide au taux max (70%).</p> ⏎ </section> ⏎ <secti |
| `menuisier-dunkerque.html` | 967 | **100 €** | ement de fenêtres / portes d'entrée donne droit à des aides cumulables (jusqu'à 100€/m² selon revenus). Nous vous accompagnons sur le dossie |
| `ouverture-porte-claquee.html` | 285 | **29 €** | gin:0">Sur Internet, beaucoup d'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Av |
| `ouverture-porte-claquee.html` | 285 | **39 €** | ">Sur Internet, beaucoup d'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Avant d |
| `ouverture-porte-claquee.html` | 285 | **1500 €** | 'annonces affichent des tarifs d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Avant d'appeler n'importe qui dan |
| `ouverture-porte-claquee.html` | 304 | **180 €** | tyle="color:#16a34a">Ouverture simple (heures ouvrées)</h3> ⏎     <p><strong>90 à 180€ TTC</strong><br>Sans casse, intervention sous 1-2h.</ |
| `ouverture-porte-claquee.html` | 308 | **450 €** | <h3 style="color:#FF6B1A">Avec changement de cylindre</h3> ⏎     <p><strong>250 à 450€ TTC</strong><br>Cylindre standard, 3 clés fournies.</ |
| `ouverture-porte-claquee.html` | 312 | **750 €** | > ⏎     <h3 style="color:#7C3AED">Serrure A2P 3 étoiles</h3> ⏎     <p><strong>450 à 750€ TTC</strong><br>Haute sécurité, anti-bumping, anti- |
| `ouverture-porte-claquee.html` | 331 | **180 €** | s="op-faq"> ⏎   <h3>Combien coûte une ouverture de porte claquée ?</h3> ⏎   <p>90 à 180€ TTC pour une ouverture non destructive en heures ou |
| `panne-chaudiere.html` | 245 | **180 €** | etit dépannage</td><td style="padding:14px;font-weight:700;color:#B91C1C">110 - 180€</td></tr> ⏎     <tr><td style="padding:14px">Remplaceme |
| `panne-chaudiere.html` | 246 | **650 €** | sonde, vanne)</td><td style="padding:14px;font-weight:700;color:#B91C1C">250 - 650€</td></tr> ⏎     <tr><td style="padding:14px">Désembouage |
| `panne-chaudiere.html` | 247 | **750 €** | ircuit complet</td><td style="padding:14px;font-weight:700;color:#B91C1C">450 - 750€</td></tr> ⏎     <tr><td style="padding:14px">Remplaceme |
| `panne-chaudiere.html` | 248 | **6500 €** | condensation</td><td style="padding:14px;font-weight:700;color:#B91C1C">3 800 - 6 500€</td></tr> ⏎   </tbody> ⏎ </table> ⏎  ⏎ <p style="font |
| `pmr-dunkerque.html` | 946 | **8000 €** | , siège mural, barres de maintien, robinetterie thermostatique. Compter 3 500 à 8 000€ TTC selon ampleur, souvent largement aidé.</p><p styl |
| `remplacement-chauffe-eau.html` | 323 | **1100 €** | </thead> ⏎   <tbody> ⏎     <tr><td><strong>Électrique 200L</strong></td><td>750 - 1 100€</td><td>~2 500 kWh</td><td>—</td></tr> ⏎     <tr><t |
| `remplacement-chauffe-eau.html` | 324 | **1300 €** | td><td>—</td></tr> ⏎     <tr><td><strong>Électrique blindé</strong></td><td>900 - 1 300€</td><td>~2 400 kWh</td><td>—</td></tr> ⏎     <tr><t |
| `remplacement-chauffe-eau.html` | 325 | **4500 €** | d>—</td></tr> ⏎     <tr><td><strong>Thermodynamique 200L</strong></td><td>2 800 - 4 500€</td><td>~700 kWh</td><td>MaPrimeRénov + CEE</td></t |
| `remplacement-chauffe-eau.html` | 326 | **3200 €** | + CEE</td></tr> ⏎     <tr><td><strong>Gaz à condensation</strong></td><td>1 800 - 3 200€</td><td>variable</td><td>CEE possible</td></tr> ⏎   |
| `remplacement-chauffe-eau.html` | 331 | **1500 €** | u Dunkerque, MaPrimeRénov + CEE rendent le projet souvent finançable à moins de 1 500€ de reste à charge.</p> ⏎  ⏎ <h2>Comment se passe l'in |
| `remplacement-chauffe-eau.html` | 348 | **1400 €** | faq"> ⏎   <h3>Quel est le prix d'un remplacement de chauffe-eau ?</h3> ⏎   <p>750 à 1 400€ TTC pour un électrique 150-200 L posé, 2 800 à 4  |
| `remplacement-chauffe-eau.html` | 348 | **4500 €** | ffe-eau ?</h3> ⏎   <p>750 à 1 400€ TTC pour un électrique 150-200 L posé, 2 800 à 4 500€ TTC pour un thermodynamique (avec aides possibles). |
| `tarifs.html` | 223 | **150 €** | -info">(joint, robinet, chasse d'eau)</span></td><td class="tf-prix range">80 - 150€</td><td>30 min - 1h</td></tr> ⏎       <tr><td>Débouchag |
| `tarifs.html` | 224 | **180 €** | ge-canalisation.html">page dédiée</a></span></td><td class="tf-prix range">90 - 180€</td><td>1h</td></tr> ⏎       <tr><td>Hydrocurage canali |
| `tarifs.html` | 225 | **400 €** | <tr><td>Hydrocurage canalisation principale</td><td class="tf-prix range">180 - 400€</td><td>1h30 - 3h</td></tr> ⏎       <tr><td>Recherche d |
| `tarifs.html` | 226 | **450 €** | r><td>Recherche de fuite (sans destruction)</td><td class="tf-prix range">220 - 450€</td><td>2-4h</td></tr> ⏎       <tr><td>Remplacement mit |
| `tarifs.html` | 228 | **1400 €** | nt-chauffe-eau.html">page dédiée</a></span></td><td class="tf-prix range">750 - 1 400€</td><td>2 - 3h</td></tr> ⏎       <tr><td>Pose chauffe |
| `tarifs.html` | 229 | **4500 €** | aides MaPrimeRénov / CEE possibles</span></td><td class="tf-prix range">2 800 - 4 500€</td><td>4 - 6h</td></tr> ⏎     </tbody> ⏎   </table>  |
| `tarifs.html` | 242 | **180 €** | f-info">(obligation décret 2009-649)</span></td><td class="tf-prix range">110 - 180€</td><td>1h</td></tr> ⏎       <tr><td>Contrat d'entretie |
| `tarifs.html` | 243 | **210 €** | ts-entretien.html">voir formules</a></span></td><td class="tf-prix range">130 - 210€/an</td><td>—</td></tr> ⏎       <tr><td>Désembouage circ |
| `tarifs.html` | 244 | **750 €** | <tr><td>Désembouage circuit chauffage</td><td class="tf-prix range">450 - 750€</td><td>3 - 5h</td></tr> ⏎       <tr><td>Remplacement circula |
| `tarifs.html` | 245 | **450 €** | /tr> ⏎       <tr><td>Remplacement circulateur</td><td class="tf-prix range">280 - 450€</td><td>1h30 - 2h</td></tr> ⏎       <tr><td>Remplacem |
| `tarifs.html` | 246 | **6500 €** | aides MaPrimeRénov / CEE possibles</span></td><td class="tf-prix range">3 800 - 6 500€</td><td>1 - 2 jours</td></tr> ⏎     </tbody> ⏎   </ta |
| `tarifs.html` | 259 | **180 €** | tf-info">(vente, location, > 15 ans)</span></td><td class="tf-prix range">120 - 180€</td><td>1h - 1h30</td></tr> ⏎       <tr><td>Remplacemen |
| `tarifs.html` | 260 | **250 €** | <td>Remplacement disjoncteur / différentiel</td><td class="tf-prix range">130 - 250€</td><td>1h</td></tr> ⏎       <tr><td>Mise en sécurité t |
| `tarifs.html` | 261 | **700 €** | <tr><td>Mise en sécurité tableau électrique</td><td class="tf-prix range">350 - 700€</td><td>3 - 5h</td></tr> ⏎       <tr><td>Mise aux norme |
| `tarifs.html` | 262 | **2500 €** | -electriques.html">guide complet</a></span></td><td class="tf-prix range">800 - 2 500€</td><td>1 - 3 jours</td></tr> ⏎       <tr><td>Pose bo |
| `tarifs.html` | 263 | **1600 €** | r><td>Pose borne véhicule électrique 7.4 kW</td><td class="tf-prix range">850 - 1 600€</td><td>3 - 6h</td></tr> ⏎     </tbody> ⏎   </table>  |
| `tarifs.html` | 276 | **180 €** | e-porte-claquee.html">page dédiée</a></span></td><td class="tf-prix range">90 - 180€</td><td>30 min - 1h</td></tr> ⏎       <tr><td>Changemen |
| `tarifs.html` | 278 | **450 €** | >Changement serrure 3 points + cylindre A2P</td><td class="tf-prix range">280 - 450€</td><td>1h - 1h30</td></tr> ⏎       <tr><td>Pose cylind |
| `tarifs.html` | 279 | **600 €** | ylindre A2P 3 étoiles (très haute sécurité)</td><td class="tf-prix range">350 - 600€</td><td>1h</td></tr> ⏎       <tr><td>Blindage porte com |
| `tarifs.html` | 280 | **1200 €** | ></tr> ⏎       <tr><td>Blindage porte complet</td><td class="tf-prix range">600 - 1 200€</td><td>3 - 4h</td></tr> ⏎     </tbody> ⏎   </table |
| `tarifs.html` | 294 | **300 €** | tr> ⏎       <tr><td>Remplacement vitre simple</td><td class="tf-prix range">150 - 300€</td><td>1h</td></tr> ⏎       <tr><td>Remplacement dou |
| `tarifs.html` | 295 | **550 €** | >Remplacement double vitrage standard (1m²)</td><td class="tf-prix range">280 - 550€</td><td>1h - 2h</td></tr> ⏎       <tr><td>Double vitrag |
| `tarifs.html` | 296 | **850 €** | Double vitrage isolant phonique / thermique</td><td class="tf-prix range">450 - 850€</td><td>1h30 - 3h</td></tr> ⏎     </tbody> ⏎   </table> |
| `tarifs.html` | 309 | **8000 €** | ansformation baignoire → douche italienne</td><td class="tf-prix range">3 500 - 8 000€</td><td>3 - 7 jours</td></tr> ⏎       <tr><td>Rénovat |
| `tarifs.html` | 310 | **18000 €** | <tr><td>Rénovation salle de bain complète</td><td class="tf-prix range">7 000 - 18 000€</td><td>1 - 3 semaines</td></tr> ⏎       <tr><td>Ada |
| `tarifs.html` | 311 | **8000 €** | meAdapt' jusqu'à 70% selon revenus</span></td><td class="tf-prix range">3 500 - 8 000€</td><td>3 - 7 jours</td></tr> ⏎       <tr><td>Réparat |
| `tarifs.html` | 312 | **850 €** | Réparation plafond + peinture (pièce 12 m²)</td><td class="tf-prix range">450 - 850€</td><td>1 - 2 jours</td></tr> ⏎     </tbody> ⏎   </tabl |
| `tarifs.html` | 319 | **29 €** | <p style="margin:0">Beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Véri |
| `tarifs.html` | 319 | **39 €** | style="margin:0">Beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Vérifie |
| `tarifs.html` | 319 | **1500 €** | de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention. Vérifiez : SIRET visible, adresse |
| `tarifs.html` | 336 | **1500 €** | <h3>Acceptez-vous le paiement échelonné ?</h3> ⏎   <p>Oui, pour les chantiers > 1 500€ TTC : 3-4 fois sans frais. Pour rénovations lourdes : |
| `travaux-dunkerque.html` | 957 | **12000 €** | (sol antidérapant, paroi vitrée, robinetterie thermostatique). Compter 3 500 à 12 000€ TTC selon ampleur.</p><p style="margin:0 0 10px"><str |
| `urgence.html` | 274 | **29 €** | 2> ⏎   <p>Sur Internet, beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention e |
| `urgence.html` | 274 | **39 €** | <p>Sur Internet, beaucoup de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention en préte |
| `urgence.html` | 274 | **1500 €** | de sociétés affichent un tarif d'appel très bas (29€, 39€) puis facturent 800 à 1 500€ après intervention en prétextant la nuit, le week-end |

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
| `blog-comment-detecter-fuite-eau-cachee.html` | 0 | 0 | 0 | 0 | **3** |
| `blog-cout-renovation-salle-de-bain.html` | 1 | 0 | 0 | 2 | **26** |
| `blog-debouchage-canalisation-furet-hydrocurage.html` | 0 | 0 | 0 | 0 | **0** |
| `blog-entretien-chaudiere-annuel-obligatoire.html` | 3 | 0 | 0 | 0 | **5** |
| `blog-fenetres-double-vitrage-pvc-alu-bois.html` | 0 | 0 | 0 | 0 | **5** |
| `blog-isolation-combles-aides-2026.html` | 1 | 0 | 0 | 0 | **12** |
| `blog-panne-electrique-disjoncteur-saute.html` | 0 | 0 | 0 | 0 | **4** |
| `blog-pmr-adapter-salle-de-bain-senior.html` | 0 | 0 | 0 | 0 | **2** |
| `blog-pompe-a-chaleur-air-eau-tout-savoir.html` | 0 | 0 | 0 | 0 | **5** |
| `blog-porte-claquee-cle-perdue-que-faire.html` | 2 | 0 | 0 | 1 | **6** |
| `blog-preparer-sa-maison-hiver-checklist.html` | 0 | 0 | 0 | 0 | **3** |
| `blog-remplacement-chaudiere-gaz-aides-2026.html` | 1 | 0 | 0 | 0 | **19** |
| `blog.html` | 0 | 0 | 0 | 0 | **0** |
| `carrieres.html` | 0 | 0 | 0 | 0 | **0** |
| `catalogue.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-calais.html` | 0 | 0 | 0 | 0 | **1** |
| `chauffagiste-coudekerque-branche.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-marck.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-outreau.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `chauffagiste-wimereux.html` | 0 | 0 | 0 | 0 | **0** |
| `contact.html` | 0 | 0 | 0 | 0 | **0** |
| `contrats-entretien.html` | 2 | 0 | 0 | 2 | **0** |
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
| `diagnostic-electrique.html` | 2 | 0 | 0 | 0 | **2** |
| `electricien-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-calais.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `electricien-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `entretien-chaudiere.html` | 0 | 0 | 0 | 1 | **3** |
| `espace-client-dashboard.html` | 0 | 0 | 0 | 0 | **0** |
| `espace-client.html` | 0 | 0 | 0 | 0 | **0** |
| `faq.html` | 20 | 0 | 0 | 26 | **4** |
| `fournisseur.html` | 0 | 0 | 0 | 0 | **0** |
| `garanties.html` | 0 | 0 | 0 | 0 | **0** |
| `googlef09a1887914c5a23.html` | 0 | 0 | 0 | 0 | **0** |
| `guide-adaptation-pmr.html` | 0 | 0 | 0 | 0 | **9** |
| `guide-entretien-chaudiere.html` | 4 | 0 | 0 | 1 | **2** |
| `guide-fuite-eau.html` | 0 | 0 | 0 | 0 | **0** |
| `guide-mise-aux-normes-electriques.html` | 0 | 0 | 0 | 1 | **5** |
| `guides.html` | 0 | 0 | 0 | 0 | **0** |
| `index.html` | 1 | 0 | 0 | 0 | **0** |
| `maprimeadapt.html` | 0 | 0 | 0 | 0 | **4** |
| `mentions-legales.html` | 0 | 0 | 0 | 0 | **0** |
| `menuisier-dunkerque.html` | 0 | 0 | 0 | 0 | **1** |
| `menuisier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-metiers.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-prestations.html` | 0 | 0 | 0 | 0 | **0** |
| `nos-villes.html` | 0 | 0 | 0 | 0 | **0** |
| `notre-equipe.html` | 0 | 0 | 0 | 0 | **0** |
| `ouverture-porte-claquee.html` | 2 | 0 | 0 | 6 | **7** |
| `panne-chaudiere.html` | 0 | 0 | 0 | 0 | **4** |
| `partenaire.html` | 0 | 0 | 0 | 0 | **0** |
| `partenaires.html` | 0 | 0 | 0 | 0 | **0** |
| `plan-du-site.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-calais.html` | 1 | 0 | 0 | 0 | **0** |
| `plombier-coudekerque-branche.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-coulogne.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-grande-synthe.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-guines.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-le-portel.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-marck.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-outreau.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-saint-martin-boulogne.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-teteghem.html` | 0 | 0 | 0 | 0 | **0** |
| `plombier-wimereux.html` | 0 | 0 | 0 | 0 | **0** |
| `pmr-dunkerque.html` | 0 | 0 | 0 | 0 | **1** |
| `pmr-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `pro.html` | 0 | 0 | 0 | 0 | **0** |
| `processus.html` | 0 | 0 | 0 | 0 | **0** |
| `realisation.html` | 0 | 0 | 0 | 0 | **0** |
| `realisations.html` | 0 | 0 | 0 | 0 | **0** |
| `remplacement-chauffe-eau.html` | 0 | 0 | 0 | 3 | **7** |
| `reseau-help-confort.html` | 0 | 0 | 0 | 0 | **0** |
| `reset.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-boulogne-sur-mer.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-calais.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-coudekerque-branche.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-dunkerque.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-marck.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-outreau.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-saint-omer.html` | 0 | 0 | 0 | 0 | **0** |
| `serrurier-wimereux.html` | 0 | 0 | 0 | 0 | **0** |
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
