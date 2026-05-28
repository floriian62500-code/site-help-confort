#!/usr/bin/env python3
"""Génère 12 articles blog SEO long-form"""
import os

ARTICLES = [
    {
        'slug': 'comment-detecter-fuite-eau-cachee',
        'title': 'Comment détecter une fuite d\'eau cachée chez soi',
        'metier': 'Plomberie',
        'categorie': 'Conseils',
        'date': '2026-05-28',
        'icon': '💧',
        'description': 'Indices qui ne trompent pas : signes visibles, factures qui grimpent, méthodes pro pour localiser une fuite encastrée sans casser.',
        'h1_em': 'fuite d\'eau cachée',
        'lead': 'Tache au plafond, facture qui s\'envole, compteur qui tourne la nuit — votre logement vous parle. Voici comment décoder les signes et localiser une fuite encastrée sans casser les murs.',
        'sections': [
            ('Les 7 signes qui doivent vous alerter', [
                'Augmentation inexpliquée de la facture d\'eau (>20%)',
                'Compteur d\'eau qui tourne alors que tout est fermé',
                'Tache d\'humidité, peinture qui cloque, papier peint qui décolle',
                'Odeur de moisi persistante dans une pièce',
                'Plinthe ou parquet qui gondole sans cause apparente',
                'Bruit d\'écoulement quand tous les robinets sont fermés',
                'Baisse de pression sur un point d\'eau spécifique'
            ]),
            ('Le test du compteur : 3 minutes pour confirmer', None,
             'Coupez tous les points d\'eau dans votre logement (robinets, lave-linge, lave-vaisselle, chauffage). Relevez le chiffre du compteur d\'eau (3 décimales si possible). Patientez 30 minutes en évitant tout usage. Si la valeur a changé, il y a fuite. Si elle bouge même très lentement, ne minimisez pas : une fuite de 1L/heure = 8 760 L/an, soit ~30 € à 40 € de surconsommation chez Veolia ou Eau et Force.'),
            ('Où regarder en premier', [
                'Sous les éviers et lavabos : raccords, siphons, joint',
                'Derrière les WC : chasse d\'eau, joint flexible',
                'Sous le ballon d\'eau chaude : groupe de sécurité',
                'Compteur d\'eau lui-même : joint amont/aval',
                'Sous la baignoire ou douche (regard d\'accès si possible)',
                'Dans la cave ou vide sanitaire : nourrices, conduites'
            ]),
            ('Quand appeler un plombier', None,
             'Si vous n\'identifiez pas la source visible, il faut passer aux méthodes pro. Une fuite encastrée dans un mur ou sous une chape nécessite un équipement spécialisé : caméra thermique pour détecter les zones froides (eau froide) ou chaudes (chauffage), gaz traceur injecté dans le circuit, ou détection acoustique par sonde amplifiée. Chez HELP Confort, l\'intervention de recherche de fuite démarre à 180 € TTC, garantie sans casse en cas de localisation positive.'),
            ('Que faire en attendant l\'intervention', [
                'Coupez l\'arrivée d\'eau générale (compteur principal)',
                'Si fuite chauffage : coupez la chaudière + le circulateur',
                'Photographiez les zones humides avec horodatage (pour assurance)',
                'Aérez sans surchauffer pour éviter la moisissure',
                'Vérifiez votre contrat assurance habitation : la garantie "dégât des eaux" inclut souvent la recherche de fuite avec franchise réduite'
            ])
        ],
        'cta_title': 'Une fuite suspectée chez vous ?',
        'cta_desc': 'Recherche de fuite par caméra thermique + traceur. Devis annoncé avant intervention, garantie sans casse.',
        'cta_action': 'Demander une recherche de fuite'
    },
    {
        'slug': 'remplacement-chaudiere-gaz-aides-2026',
        'title': 'Remplacement chaudière gaz : aides 2026 et démarches',
        'metier': 'Chauffage',
        'categorie': 'Aides',
        'date': '2026-05-25',
        'icon': '🔥',
        'description': 'MaPrimeRenov + CEE + chèque énergie : tout sur les aides 2026 pour remplacer votre chaudière gaz par une PAC ou condensation.',
        'h1_em': 'chaudière gaz',
        'lead': 'Votre chaudière gaz a 15 ans ? Il est probablement temps de la remplacer — et les aides 2026 (MaPrimeRenov, CEE, chèque énergie) peuvent couvrir jusqu\'à 70% de l\'investissement. Mode d\'emploi.',
        'sections': [
            ('Les solutions de remplacement en 2026', [
                'Chaudière gaz à condensation : 3 200 € - 4 800 € posés, rendement 109%',
                'Pompe à chaleur air/eau : 12 000 € - 18 000 € posés, rendement 380%',
                'Chaudière biomasse (granulés) : 14 000 € - 22 000 € posés, énergie renouvelable',
                'Pompe à chaleur géothermique : 22 000 € - 32 000 € posés, performance record'
            ]),
            ('MaPrimeRenov 2026 : barèmes', None,
             'Pour les tranches "Très modestes" et "Modestes" (RFR <31 889 € pour 2 personnes), les montants sont substantiels : 5 000 € pour une PAC air/eau, 11 000 € pour une PAC géothermique. Les revenus "Intermédiaires" touchent 3 000 € et 6 000 € respectivement. Les "Supérieurs" (>44 907 € RFR pour 2 personnes) ne sont plus éligibles depuis janvier 2026 pour le remplacement de chaudière. Notre simulateur en ligne calcule votre éligibilité précise.'),
            ('Certificats d\'économies d\'énergie (CEE)', [
                'PAC air/eau : 4 500 € en moyenne',
                'PAC géothermique : 5 000 €',
                'Chaudière granulés : 3 500 €',
                'Chaudière gaz THPE : 1 200 € (uniquement remplacement chaudière fioul ou >25 ans)'
            ]),
            ('Chèque énergie 2026', None,
             'Versement automatique entre 48 € et 277 € selon votre RFR. À conserver pour payer une facture ou un acompte de travaux énergétiques. Cumulable avec MPR + CEE. Si vous n\'êtes pas éligible automatiquement, vous pouvez en faire la demande sur chequeenergie.gouv.fr.'),
            ('Comment optimiser le dossier', [
                'Faire réaliser le devis par un artisan RGE (obligatoire pour MPR)',
                'Demander le devis et l\'attestation RGE à l\'artisan',
                'Constituer le dossier MPR avant signature du devis',
                'Obtenir l\'accord MPR avant démarrage des travaux',
                'Réaliser les travaux dans les 3 mois après accord',
                'Envoyer la facture finale pour déclenchement versement'
            ]),
            ('Démarches simplifiées HELP Confort', None,
             'Nous gérons l\'intégralité du dossier MPR + CEE pour vous : étude éligibilité, constitution du dossier, demande en ligne, suivi jusqu\'au versement. Frais inclus dans le devis, vous n\'avez qu\'à signer. Notre certification RGE Qualibat 5311 (chauffage) garantit l\'éligibilité aux aides. Devis gratuit en 48h.')
        ],
        'cta_title': 'Calculez vos aides en 1 minute',
        'cta_desc': 'Simulateur MaPrimeRenov + CEE + chèque énergie. Estimation précise selon vos revenus et travaux.',
        'cta_action': 'Lancer la simulation'
    },
    {
        'slug': 'pmr-adapter-salle-de-bain-senior',
        'title': 'Adapter sa salle de bain pour senior ou PMR : guide complet',
        'metier': 'PMR',
        'categorie': 'Rénovation',
        'date': '2026-05-20',
        'icon': '♿',
        'description': 'Douche italienne, barres d\'appui, WC surélevés : les aménagements essentiels et les aides pour adapter une salle de bain au handicap ou au vieillissement.',
        'h1_em': 'salle de bain PMR',
        'lead': 'Que ce soit pour rester chez soi en vieillissant ou accueillir un proche en mobilité réduite, adapter sa salle de bain est un investissement essentiel. Voici les aménagements indispensables et les aides 2026.',
        'sections': [
            ('Les aménagements essentiels', [
                'Douche italienne plain-pied (pas de marche) avec siège escamotable',
                'Sol antidérapant classement PN18 minimum',
                'Barres d\'appui en inox brossé (charge 200 kg)',
                'WC surélevé (47 cm sol) avec barres latérales',
                'Lavabo accessible en fauteuil (sans pied, vide sous-vasque)',
                'Mitigeur thermostatique anti-brûlure',
                'Éclairage zonal + détecteur de mouvement'
            ]),
            ('Largeurs et passages', None,
             'Une circulation fauteuil exige un passage de 90 cm minimum (porte 83 cm largeur passage libre). Devant le WC : 80 cm × 130 cm de zone libre. Devant le lavabo : 80 cm × 110 cm. Dans la douche : surface min 90 × 120 cm avec accès 80 cm. Si votre salle de bain existante fait moins de 4 m², il faudra souvent décloisonner avec la chambre attenante.'),
            ('Aides financières 2026', [
                'MaPrimeAdapt\' : jusqu\'à 22 000 € selon revenus (nouveau dispositif 2025)',
                'Crédit d\'impôt accessibilité : 25% des dépenses, plafonné',
                'CARSAT / caisses de retraite : aide travaux jusqu\'à 3 500 €',
                'PCH (Prestation Compensation du Handicap) selon MDPH',
                'TVA réduite à 5,5% sur les travaux d\'adaptation'
            ]),
            ('Le diagnostic gratuit HELP Confort', None,
             'Notre ergothérapeute partenaire visite votre logement, évalue votre mobilité (actuelle et future), et propose un plan d\'adaptation chiffré. Visite + devis = 0 €. Délai d\'intervention 3-5 semaines après accord MaPrimeAdapt\'. Garantie décennale obligatoire incluse.'),
            ('Erreurs à éviter', [
                'Ne pas faire un devis chez un artisan non labellisé Handibat',
                'Choisir des barres en plastique (charge insuffisante)',
                'Oublier l\'éclairage de nuit (LED basse intensité au sol)',
                'Sous-dimensionner la douche : 90 cm c\'est le minimum strict',
                'Garder le bac de douche standard (chute = principale cause d\'hospitalisation senior)'
            ])
        ],
        'cta_title': 'Adaptation salle de bain : diagnostic gratuit',
        'cta_desc': 'Visite ergothérapeute + chiffrage MaPrimeAdapt\'. Aucun engagement, aucune avance.',
        'cta_action': 'Demander un diagnostic'
    },
    {
        'slug': 'porte-claquee-cle-perdue-que-faire',
        'title': 'Porte claquée ou clé perdue : 5 réflexes avant d\'appeler',
        'metier': 'Serrurerie',
        'categorie': 'Urgence',
        'date': '2026-05-15',
        'icon': '🔑',
        'description': 'Avant d\'appeler un serrurier et payer 200€, vérifiez ces 5 points : voisin double, conjoint, fenêtre, propriétaire, assurance.',
        'h1_em': 'porte claquée',
        'lead': 'Vous êtes coincé devant votre porte ? Avant de céder à la panique (et de payer 200 € à un serrurier) prenez 10 minutes pour vérifier ces 5 réflexes. Vous pourriez économiser plusieurs centaines d\'euros.',
        'sections': [
            ('Réflexe 1 : Le double de clé', None,
             'Un proche a-t-il un double ? Conjoint au travail, parents, voisin de confiance, gardien d\'immeuble ? Un trajet en taxi (10 €) est toujours moins cher qu\'un serrurier (150-300 €). Si vous habitez un appartement, vérifiez auprès du gardien — beaucoup gardent un trousseau d\'urgence à clé.'),
            ('Réflexe 2 : Une fenêtre ou porte secondaire', None,
             'Avez-vous laissé une fenêtre entrebâillée ? Une porte-fenêtre côté jardin ? Si oui (et seulement si vous habitez en rez-de-chaussée ou avec accès sécurisé), entrer par là évite la facture serrurier. Attention : ne tentez JAMAIS d\'escalader un balcon ou un étage — chutes mortelles fréquentes.'),
            ('Réflexe 3 : Le propriétaire ou syndic', None,
             'Si vous êtes locataire ou copropriétaire, votre propriétaire/syndic peut avoir un double conservé par l\'agence. Appel et 30 min de patience = économies substantielles. La plupart des agences immobilières conservent les doubles en coffre sécurisé.'),
            ('Réflexe 4 : Votre assurance habitation', None,
             'Beaucoup de contrats habitation MAIF, MACIF, Matmut, GMF incluent une "assistance serrurerie" couvrant jusqu\'à 300 € de frais. Avant d\'appeler n\'importe quel serrurier (souvent surfacturé en urgence), appelez votre assurance : ils dépêchent un artisan partenaire à prix négocié, parfois sans franchise. Numéro d\'assistance souvent au dos de votre carte verte ou sur l\'app.'),
            ('Réflexe 5 : Choisir un vrai serrurier', None,
             'Si tous les recours précédents ont échoué, méfiez-vous des fausses urgences ! Évitez les pubs Google Ads en haut de page (souvent des arnaques à 800 € pour une porte claquée). Appelez un artisan local connu : nos clients à Saint-Omer, Dunkerque, Calais, Boulogne nous joignent au 03 66 10 01 34. Tarif annoncé avant intervention : ouverture porte claquée entre 80 € et 180 € selon technique nécessaire (sans casse de cylindre).'),
            ('Comment éviter ça à l\'avenir', [
                'Confier un double à un voisin ou parent proche',
                'Boîtier à code sécurisé fixé à proximité (avec code régulièrement changé)',
                'Serrure électronique connectée (badge, code, app) — Bricard Smart, Yale Linus',
                'Toujours avoir son téléphone + sa CB sur soi quand on sort fumer ou jeter les poubelles',
                'Désactiver le verrouillage automatique (option présente sur la plupart des serrures multipoint)'
            ])
        ],
        'cta_title': 'Porte claquée à Saint-Omer, Dunkerque, Calais ou Boulogne ?',
        'cta_desc': 'Ouverture sans casse en 30-60 min · Tarif annoncé avant intervention · Garantie 1 an',
        'cta_action': 'Appeler 03 66 10 01 34'
    },
    {
        'slug': 'entretien-chaudiere-annuel-obligatoire',
        'title': 'Entretien chaudière : pourquoi c\'est obligatoire et quand le faire',
        'metier': 'Chauffage',
        'categorie': 'Réglementation',
        'date': '2026-05-10',
        'icon': '🔧',
        'description': 'L\'entretien annuel chaudière est obligatoire : décret 2009-649. Conséquences en cas de non-respect, montant amende, attestation à conserver.',
        'h1_em': 'entretien chaudière',
        'lead': 'Vous savez que l\'entretien annuel de votre chaudière est obligatoire, mais savez-vous ce qui se passe si vous l\'oubliez ? Spoiler : amende ET refus d\'indemnisation assurance en cas de sinistre.',
        'sections': [
            ('Le cadre légal', None,
             'Le décret n°2009-649 du 9 juin 2009 impose l\'entretien annuel obligatoire de toute chaudière dont la puissance est comprise entre 4 kW et 400 kW (donc 99% des chaudières domestiques). L\'entretien doit être réalisé par un professionnel qualifié, qui remet une attestation à conserver 2 ans minimum. En cas de location, le bailleur doit fournir l\'attestation au locataire à la signature du bail.'),
            ('Que comprend un entretien', [
                'Nettoyage complet du corps de chauffe et du brûleur',
                'Contrôle de la combustion (analyse fumées)',
                'Vérification étanchéité du circuit',
                'Contrôle de la pression et purge si nécessaire',
                'Vérification des organes de sécurité (soupape, thermocouple)',
                'Mesure du taux de CO (monoxyde de carbone)',
                'Remise de l\'attestation légale et conseils d\'utilisation'
            ]),
            ('Sanctions en cas de non-respect', None,
             'L\'amende est de 450 € en cas de contrôle (rare en pratique, surtout pour les particuliers). Mais surtout : votre assurance habitation peut refuser de vous indemniser en cas de sinistre lié à la chaudière (incendie, intoxication CO, dégât des eaux) si l\'entretien n\'a pas été fait à jour. Les dégâts peuvent atteindre des dizaines de milliers d\'euros, voire mettre en jeu votre vie ou celle de votre famille.'),
            ('Quand faire l\'entretien', None,
             'Idéalement entre **septembre et novembre**, avant la mise en route du chauffage. Ainsi votre chaudière démarre l\'hiver à pleine capacité. Les artisans sont moins sollicités et peuvent intervenir plus rapidement. À éviter en pleine vague de froid (janvier-février) — délais à rallonge et tarifs parfois majorés.'),
            ('Combien ça coûte', [
                'Entretien chaudière gaz : 120 € à 180 € TTC',
                'Entretien chaudière fioul : 150 € à 220 € TTC',
                'Entretien chaudière à condensation : 130 € à 200 €',
                'Contrat d\'entretien annuel (Essentiel HC) : 12,90 € / mois = 154,80 € / an + dépannage prioritaire'
            ]),
            ('Notre conseil', None,
             'Souscrivez un contrat d\'entretien plutôt que de payer à l\'intervention. Avantages : entretien automatique programmé, dépannage prioritaire (sous 24h en formule Confort), pas de majoration soir/week-end, petites pièces incluses, conseils continus. Notre formule Confort à 19,90 €/mois est plébiscitée par nos clients (78% des contrats souscrits).')
        ],
        'cta_title': 'Souscrire un contrat d\'entretien chaudière',
        'cta_desc': '3 formules de 12,90 €/mois à 29,90 €/mois. Sans engagement, résiliation libre.',
        'cta_action': 'Voir les formules'
    },
    {
        'slug': 'isolation-combles-aides-2026',
        'title': 'Isolation des combles : la meilleure rentabilité énergétique 2026',
        'metier': 'Rénovation',
        'categorie': 'Aides',
        'date': '2026-05-05',
        'icon': '🏠',
        'description': 'L\'isolation des combles perdus reste l\'investissement énergétique le plus rentable. Aides 2026, technique, durée, ROI.',
        'h1_em': 'isolation des combles',
        'lead': '30% des déperditions thermiques d\'une maison s\'échappent par le toit. Isoler les combles, c\'est le geste énergétique le plus rentable : amortissement en 3-5 ans, aides cumulables. Mode d\'emploi.',
        'sections': [
            ('Pourquoi isoler en priorité', None,
             'Selon l\'ADEME, une maison non isolée perd 30% de sa chaleur par le toit (contre 25% par les murs et 15% par les fenêtres). C\'est physique : l\'air chaud monte. Isoler les combles avant les murs ou les fenêtres, c\'est mathématiquement plus rentable. Le ROI moyen est de 4 ans, contre 12+ pour les fenêtres et 8 pour les murs.'),
            ('Combles perdus vs combles aménageables', None,
             'Si vos combles ne sont pas habitables (charpente fermette, hauteur insuffisante), on les appelle "perdus". Isolation par soufflage de laine minérale ou cellulose entre les solives — 18 €/m² en moyenne. Si vos combles sont aménageables (charpente traditionnelle, hauteur >1,80 m sous panne), isolation par l\'intérieur des rampants avec doublage placo — 60 à 95 €/m². Si vous prévoyez de les aménager dans les 5 ans, il vaut mieux faire l\'isolation rampants directement.'),
            ('Aides 2026 cumulables', [
                'MaPrimeRenov 2026 : 7-25 €/m² selon tranche (Très modestes à Intermédiaires)',
                'CEE primes énergie : 12 €/m² en moyenne (cumulable MPR)',
                'TVA 5,5% sur travaux et matériaux',
                'Éco-PTZ jusqu\'à 50 000 € sur 20 ans sans intérêts',
                'Coup de pouce isolation (pour les revenus modestes) : 20 € de + par m²'
            ]),
            ('Coût final après aides', None,
             '100 m² de combles perdus isolés en laine minérale : 1 800 € TTC avant aides. Pour un foyer modeste (RFR <31 889 € à 2 personnes), MPR rapporte 2 000 €, CEE 1 200 €, soit 3 200 € d\'aides. Vous gagnez de l\'argent (1 400 € de + que le coût des travaux) et économisez ~600 €/an sur votre facture énergie. ROI immédiat. Pour un foyer intermédiaire, même calcul aboutit à 200 € de reste à charge max.'),
            ('Qualités à exiger de l\'artisan', [
                'Certification RGE Qualibat 7141 ou 7142 (obligatoire pour aides)',
                'Devis détaillé : surface, épaisseur, matériau, marque',
                'Résistance thermique R minimum 7,0 m².K/W pour aides MPR 2026',
                'Assurance décennale en cours de validité',
                'Référence chantiers similaires dans votre zone'
            ])
        ],
        'cta_title': 'Calculez vos aides isolation combles',
        'cta_desc': 'Simulateur MaPrimeRenov + CEE personnalisé. Estimation précise en 1 minute.',
        'cta_action': 'Simulateur d\'aides'
    },
    {
        'slug': 'panne-electrique-disjoncteur-saute',
        'title': 'Panne électrique : décoder un disjoncteur qui saute',
        'metier': 'Électricité',
        'categorie': 'Conseils',
        'date': '2026-04-28',
        'icon': '⚡',
        'description': 'Différentiel, divisionnaire, fusible : comprendre quel disjoncteur saute et pourquoi. Diagnostic en 5 étapes avant d\'appeler.',
        'h1_em': 'panne électrique',
        'lead': 'Plus de courant chez vous ? Avant d\'appeler un électricien à 200 €, 90% des pannes se résolvent en 5 minutes avec les bons réflexes. Voici comment décoder votre tableau électrique.',
        'sections': [
            ('Identifier quel disjoncteur a sauté', [
                'Le disjoncteur général (interrupteur en haut du tableau) : panne globale du logement',
                'Un différentiel 30 mA : protège un groupe de circuits, indique souvent un défaut d\'isolation',
                'Un divisionnaire (10A, 16A, 20A, 32A) : protège un circuit unique (prises, lumière, lave-linge, etc.)',
                'Un fusible (logements anciens) : à remplacer obligatoirement'
            ]),
            ('Méthode de diagnostic en 5 étapes', None,
             'Étape 1 : débranchez TOUS les appareils du circuit concerné. Étape 2 : remontez le disjoncteur (si ça tient, c\'est un appareil défectueux). Étape 3 : rebranchez les appareils UN PAR UN, en attendant 30 secondes entre chaque. Étape 4 : l\'appareil qui fait sauter est le coupable. Étape 5 : ne le rebranchez plus tant qu\'il n\'est pas réparé ou jeté.'),
            ('Causes courantes d\'un disjoncteur qui saute', [
                'Surcharge : trop d\'appareils sur la même prise/circuit',
                'Court-circuit : appareil défectueux (souvent visible)',
                'Défaut d\'isolation : fil dénudé, humidité dans prise',
                'Appareil de gros électroménager en fin de vie (lave-linge, sèche-linge)',
                'Foudre : si saute pendant orage = surtension'
            ]),
            ('Quand appeler en urgence', None,
             'Si vous sentez une odeur de plastique brûlé, voyez de la fumée, ou si plusieurs disjoncteurs sautent simultanément : COUPEZ LE DISJONCTEUR GÉNÉRAL et appelez. Il y a un risque réel d\'incendie électrique. Ne tentez surtout pas de remonter les disjoncteurs. Notre équipe intervient à Saint-Omer, Dunkerque, Calais, Boulogne sous 2h en urgence électrique.'),
            ('Quand penser au tableau électrique', None,
             'Si votre tableau a plus de 25 ans, ne respecte plus les normes NF C 15-100 (différentiels 30 mA, par exemple), ou si vous avez des fusibles à plomb : pensez à le rénover. Coût : 650 € à 2 400 € selon nombre de circuits. Aides MPR 2026 possibles pour mise aux normes (jusqu\'à 650 € en tranche Très modestes).')
        ],
        'cta_title': 'Diagnostic électrique professionnel',
        'cta_desc': 'Mise aux normes tableau électrique NF C 15-100. Devis gratuit, aides MPR éligibles.',
        'cta_action': 'Demander un diagnostic'
    },
    {
        'slug': 'pompe-a-chaleur-air-eau-tout-savoir',
        'title': 'Pompe à chaleur air/eau : tout ce qu\'il faut savoir avant de l\'installer',
        'metier': 'Chauffage',
        'categorie': 'Équipement',
        'date': '2026-04-22',
        'icon': '🌬️',
        'description': 'COP, dimensionnement, raccordement, aides, contraintes acoustiques : le guide complet PAC air/eau 2026.',
        'h1_em': 'pompe à chaleur air/eau',
        'lead': 'La PAC air/eau remplace votre chaudière gaz ou fioul tout en divisant votre facture par 3. Mais ce n\'est pas la solution miracle pour tous les logements. Voici ce qu\'il faut savoir avant de signer un devis.',
        'sections': [
            ('Comment ça marche', None,
             'Une PAC air/eau capte les calories de l\'air extérieur (oui, même à -5°C !) via un fluide réfrigérant, et les transfère à votre circuit d\'eau (radiateurs, plancher chauffant, ECS). Le rapport entre l\'énergie produite et l\'énergie consommée (le COP) est de 3 à 4,5 sur les bons modèles : 1 kWh d\'électricité = 3 à 4,5 kWh de chaleur. C\'est 3 à 4 fois plus efficient qu\'un radiateur électrique.'),
            ('Les vrais critères de choix', [
                'COP nominal à 7°C extérieur : viser >4,0',
                'SCOP saisonnier (mesure réelle hiver) : viser >3,8',
                'Niveau sonore unité ext : <60 dB(A) à 1 m (sinon problèmes voisinage)',
                'Plage de fonctionnement : viser -15°C à +35°C',
                'Production ECS intégrée vs ballon séparé',
                'Compatibilité radiateurs existants (basse température obligatoire)'
            ]),
            ('Dimensionnement : le critère N°1', None,
             'Une PAC mal dimensionnée = catastrophe énergétique. Sous-dimensionnée : appoint électrique permanent (perte rentabilité). Sur-dimensionnée : marche/arrêt fréquents (usure prématurée). Le bon dimensionnement passe par un bilan thermique complet (logiciel agréé) qui calcule la puissance nécessaire selon : surface, isolation, exposition, hauteur sous plafond, fenêtres. Méfiez-vous des devis "au pifomètre" — exigez le bilan thermique chiffré.'),
            ('Contraintes acoustiques', None,
             'L\'unité extérieure ressemble à un bloc clim et émet 45 à 60 dB(A) à 1 m. C\'est peu, mais en pleine nuit dans une zone calme, ça s\'entend. Implantation à respecter : éloignée des chambres à coucher (votre voisin et le vôtre), pas sous une fenêtre ouvrable, sur un plot anti-vibration. La réglementation impose <35 dB(A) à la limite de propriété de jour, <30 dB(A) la nuit. Un constat d\'huissier peut être demandé en cas de plainte.'),
            ('Aides 2026 : massives', [
                'MPR Très modestes : 5 000 €',
                'MPR Modestes : 4 000 €',
                'MPR Intermédiaires : 3 000 €',
                'CEE moyenne : 4 500 € quel que soit le revenu',
                'Total aides maximum : 10 500 € en tranche Très modestes',
                'TVA 5,5% appliquée'
            ]),
            ('Notre recommandation', None,
             'La PAC air/eau est rentable dans 80% des logements bien isolés (DPE C ou mieux) et chauffés actuellement au gaz, fioul ou électrique. Elle est moins pertinente si DPE D ou pire (refaire l\'isolation d\'abord), ou si vos radiateurs sont haute température non remplaçables. Notre bureau d\'études thermiques effectue un bilan gratuit avant chaque devis PAC.')
        ],
        'cta_title': 'Étude pompe à chaleur gratuite',
        'cta_desc': 'Bilan thermique chiffré + simulation aides + comparatif modèles. 0 € sans engagement.',
        'cta_action': 'Demander un bilan'
    },
    {
        'slug': 'fenetres-double-vitrage-pvc-alu-bois',
        'title': 'Fenêtres double vitrage : PVC, alu ou bois ?',
        'metier': 'Vitrerie',
        'categorie': 'Équipement',
        'date': '2026-04-18',
        'icon': '🪟',
        'description': 'Comparatif des 3 matériaux de fenêtres : isolation, durée de vie, prix, esthétique. Comment choisir en 2026.',
        'h1_em': 'fenêtres double vitrage',
        'lead': 'Remplacer vos fenêtres simple vitrage par du double vitrage moderne, c\'est 10% à 15% d\'économies de chauffage. Mais PVC, alu ou bois ? Voici le comparatif sans complaisance.',
        'sections': [
            ('Le PVC : le meilleur rapport qualité/prix', None,
             'Le PVC représente 65% du marché en France. Et pour cause : isolation thermique et phonique excellente, durée de vie 30-40 ans, entretien quasi nul, prix 380-650 €/fenêtre posée. Inconvénient : esthétique moins haut de gamme, palette de couleurs limitée (blanc, gris, beige, chêne foncé en imitation). À éviter sur les bâtiments anciens classés ou en zone protégée.'),
            ('L\'aluminium : esthétique moderne', None,
             'L\'alu offre des profils fins (jusqu\'à 30% de surface vitrée en plus), des couleurs illimitées (toute la gamme RAL), et une grande durabilité (50 ans+). Mais : isolation thermique inférieure au PVC (sauf modèles à rupture de pont thermique), prix +50% (550-950 €/fenêtre), et conduction thermique du métal. À privilégier pour grandes baies vitrées contemporaines.'),
            ('Le bois : le retour à la mode', None,
             'Le bois est noble, isolant naturel, écologique (renouvelable), et permet la rénovation patrimoniale. Mais : entretien obligatoire (lasure tous les 5 ans), durée de vie variable (20 à 60 ans selon essence et exposition), prix élevé (700-1 200 €/fenêtre). À privilégier pour bâtiments anciens, secteurs sauvegardés, ou pour son cachet.'),
            ('Le critère décisif : la résistance thermique Uw', [
                'PVC : Uw 1,1 à 1,3 W/m².K (excellent)',
                'Bois : Uw 1,3 à 1,6 W/m².K (très bon)',
                'Alu sans rupture pont thermique : Uw 2,0 à 2,4 W/m².K (médiocre)',
                'Alu avec rupture pont thermique : Uw 1,3 à 1,5 W/m².K (très bon)',
                'Triple vitrage : ajoute 0,2-0,4 W/m².K de gain (rentable uniquement Nord-Est ou montagne)'
            ]),
            ('Aides 2026 pour fenêtres', None,
             'MaPrimeRenov accorde 40 à 100 €/fenêtre selon tranche revenus (Intermédiaires et Modestes). CEE prime 100 €/fenêtre cumulable. TVA 5,5%. Conditions : Uw <1,3 W/m².K (donc PVC ou alu RPT), artisan RGE, remplacement complet (pas seulement vitrage). Pour 8 fenêtres remplacées chez un foyer modeste : 1 600 € d\'aides en moyenne sur 6 400 € TTC de devis.'),
            ('Notre conseil', None,
             '80% de nos clients optent pour le PVC qualité K-Line, Profils Systèmes ou Internorm : meilleur Uw, prix maîtrisé, garantie 10 ans. L\'alu si grandes baies. Le bois si patrimoine. Évitez les pubs Castorama / Leroy Merlin qui vendent souvent du PVC bas de gamme (Uw >1,5).')
        ],
        'cta_title': 'Devis fenêtres double vitrage',
        'cta_desc': 'Visite gratuite + prise de mesures + devis détaillé. Aides MPR + CEE comprises.',
        'cta_action': 'Demander un devis'
    },
    {
        'slug': 'debouchage-canalisation-furet-hydrocurage',
        'title': 'Canalisation bouchée : furet, hydrocurage ou produit ?',
        'metier': 'Plomberie',
        'categorie': 'Conseils',
        'date': '2026-04-12',
        'icon': '🌊',
        'description': 'WC, évier, douche bouchés : quelle méthode utiliser selon le type de bouchon et la canalisation.',
        'h1_em': 'canalisation bouchée',
        'lead': 'Évier qui se vide en 10 minutes, douche qui déborde, WC qui ne tire plus : votre canalisation est bouchée. Mais quelle méthode utiliser sans dégrader la tuyauterie ? Voici le guide pratique.',
        'sections': [
            ('Les méthodes à éviter', [
                'Produits chimiques type Destop : agressent le PVC et le caoutchouc (joints) à long terme',
                'Cintre déplié : raye l\'émail et casse les joints',
                'Eau bouillante : déconseillé sur PVC (fissures à terme)',
                'Aspirateur eau : fonctionne mais aggrave si bouchon profond'
            ]),
            ('Le furet manuel : 80% des cas', None,
             'Le furet plomberie est un câble flexible avec une mèche/spirale au bout. À 15-30 € en magasin de bricolage, c\'est l\'outil de base. Insérez dans la canalisation, tournez en avançant, vous accrochez le bouchon. Pour un WC : utilisez un furet spécifique (tête souple). Pour un évier : démontez d\'abord le siphon (un bouchon de cheveux y est souvent coincé). Pour une douche : enlevez la grille et furettez 1m max.'),
            ('Le déboucheur à pompe (ventouse)', None,
             'À utiliser AVANT le furet pour les bouchons légers (papier, mousse). Posez sur le trou d\'évacuation, ajoutez un peu d\'eau pour étanchéité, et pompez 10-20 coups rapides. Ça créé une dépression qui aspire le bouchon. Très efficace sur WC et évier — moins sur douche/baignoire (siphon plat).'),
            ('L\'hydrocurage : pour les gros bouchons', None,
             'Si furet et ventouse échouent, c\'est probablement un bouchon en profondeur (canalisation principale, regard EU). L\'hydrocurage utilise un jet d\'eau haute pression (jusqu\'à 250 bars) qui pulvérise le bouchon. C\'est ce que font les pompiers et les plombiers pro. Tarif : 280-400 € selon difficulté. Garantit un nettoyage complet de la canalisation.'),
            ('Prévention : éviter les bouchons', [
                'Mettre un filtre à cheveux dans la douche/baignoire (1€ en magasin)',
                'Ne jamais verser huiles ou graisses dans l\'évier (figent en bouchons solides)',
                'Pour WC : pas de lingettes, serviettes hygiéniques, cotons-tiges (créent bouchons immédiats)',
                'Tous les 2-3 mois : verser 1 verre de bicarbonate + 1 verre de vinaigre blanc + eau chaude',
                'Tirer la chasse d\'eau régulièrement même sur WC peu utilisés (évite les dépôts)'
            ]),
            ('Si vous ne trouvez pas le bouchon', None,
             'Le bouchon peut être dans la colonne principale (immeuble) ou le branchement vers le tout-à-l\'égout (maison). Dans ce cas : appel plombier obligatoire. Pour maison individuelle, le diagnostic se fait au regard EU (regard d\'eaux usées). Tarif intervention : 90-180 € pour furet, 280-400 € pour hydrocurage. Garantie sans casse chez HELP Confort.')
        ],
        'cta_title': 'Canalisation bouchée à Saint-Omer / Dunkerque / Calais ?',
        'cta_desc': 'Furet, hydrocurage ou caméra : on diagnostique et on débouche sous 2h.',
        'cta_action': 'Appeler 03 66 10 01 34'
    },
    {
        'slug': 'preparer-sa-maison-hiver-checklist',
        'title': 'Préparer sa maison pour l\'hiver : la checklist du pro',
        'metier': 'Saisonnier',
        'categorie': 'Conseils',
        'date': '2026-04-05',
        'icon': '❄️',
        'description': 'Avant l\'hiver, vérifiez : chaudière, isolation, fenêtres, gouttières, joints, VMC. Notre checklist 12 points.',
        'h1_em': 'préparer sa maison pour l\'hiver',
        'lead': 'Septembre-octobre, c\'est la meilleure période pour préparer sa maison à l\'hiver. Voici les 12 vérifications essentielles que font les pros — et que vous pouvez faire vous-même (ou nous confier).',
        'sections': [
            ('Le système de chauffage', [
                'Entretien chaudière annuel obligatoire (130-200 €)',
                'Désembouage du circuit si chaudière >5 ans (boue = perte de rendement 25%)',
                'Purge des radiateurs (en haut, avec clé)',
                'Vérification pression du circuit (1-1,5 bar à froid)',
                'Test du thermostat et des programmateurs'
            ]),
            ('L\'isolation', [
                'Vérifier la laine des combles (tassement après 10 ans = -50% performances)',
                'Boucher les passages d\'air (prises, plinthes, encadrement portes)',
                'Joints de fenêtres et portes : remplacer si écrasés',
                'Calfeutrer la porte d\'entrée (bourrelet en bas)',
                'Sas d\'entrée si possible (couloir, rideau épais)'
            ]),
            ('Les fenêtres', [
                'Test de l\'étanchéité (bougie allumée près du cadre fermé)',
                'Joints néoprène à remplacer si déchirés',
                'Volets : vérifier fonctionnement et joints',
                'Si simple vitrage : envisager remplacement (aides 2026)'
            ]),
            ('La toiture et la couverture', None,
             'Inspection visuelle (jumelles ou drone) : tuiles cassées, faîtage abîmé, gouttières débordantes. Nettoyage gouttières (feuilles mortes empêchent l\'écoulement et causent gel + infiltrations). Vérification souche cheminée si vous avez un poêle (peinture, joints). Coût inspection couvreur : 80-150 €. Coût intervention de réparation moyenne : 250-800 €.'),
            ('La ventilation', None,
             'La VMC doit fonctionner toute l\'année. En hiver elle évacue l\'humidité de cuisine, salle de bain, buanderie — sans elle, condensation et moisissures garanties. Vérifications : nettoyer les bouches d\'extraction (au moins 2x/an), tester le débit (kleenex aspiré). Si bruit anormal ou débit faible : changer la VMC (200-450 €) ou nettoyer les conduits (180 €).'),
            ('La plomberie extérieure', [
                'Vidanger les robinets extérieurs (gel = robinet éclaté)',
                'Protéger les compteurs d\'eau exposés (gaine isolante)',
                'Vérifier l\'eau du chauffage central (manomètre 1-1,5 bar)',
                'Si maison secondaire fermée l\'hiver : vidanger TOUT le circuit ou maintenir chauffage hors-gel à 8°C'
            ]),
            ('L\'électricité et la sécurité', [
                'Tester les détecteurs de fumée (1 fois/mois)',
                'Détecteur CO obligatoire si chaudière gaz ou poêle',
                'Vérifier les rallonges et multiprises (surcharges = incendie)',
                'Lampes extérieures fonctionnelles (nuits longues)',
                'Stock pile/lampe torche en cas de coupure'
            ]),
            ('Notre intervention préventive', None,
             'Pour 89 € TTC, nous réalisons un check-up complet pré-hiver : 1 technicien, 2h sur place, checklist 30 points, rapport écrit avec photos. Identification des points d\'amélioration prioritaires + chiffrage. C\'est l\'investissement le plus rentable de l\'hiver — il évite les pannes coûteuses en plein froid.')
        ],
        'cta_title': 'Check-up pré-hiver complet',
        'cta_desc': '89 € TTC · 30 points contrôlés · Rapport écrit · Conseils pro',
        'cta_action': 'Réserver mon check-up'
    },
    {
        'slug': 'cout-renovation-salle-de-bain',
        'title': 'Combien coûte vraiment une rénovation de salle de bain en 2026',
        'metier': 'Rénovation',
        'categorie': 'Budget',
        'date': '2026-03-28',
        'icon': '🛁',
        'description': 'Rénovation salle de bain : 5 000 € à 25 000 €. Décomposition détaillée des coûts par poste et conseils pour optimiser.',
        'h1_em': 'rénovation salle de bain',
        'lead': 'Vous rêvez d\'une nouvelle salle de bain mais ne savez pas combien prévoir ? Voici la décomposition détaillée des coûts en 2026, du basique au premium. Et surtout, comment éviter les pièges.',
        'sections': [
            ('Les 3 niveaux de rénovation', [
                '<strong>Rafraîchissement (5 000-8 000 €)</strong> : peinture, joints, robinetterie. Sans toucher au plomberie ni carrelage',
                '<strong>Rénovation complète (10 000-16 000 €)</strong> : nouveau carrelage + sanitaires + meubles. Plomberie/électricité légère',
                '<strong>Rénovation premium (18 000-28 000 €)</strong> : douche italienne, double vasque, chauffage sol, équipements haut de gamme'
            ]),
            ('Décomposition d\'un budget moyen 14 000 € TTC', [
                'Démolition + évacuation : 1 200 €',
                'Plomberie (déplacements + neuf) : 1 800 €',
                'Électricité (mise aux normes + spots) : 1 200 €',
                'Carrelage sol + mur (40 m² posé) : 3 500 €',
                'Faïence murs douche/baignoire : 800 €',
                'Sanitaires (WC, lavabo, mitigeurs) : 1 200 €',
                'Douche italienne + receveur : 1 100 €',
                'Meuble vasque + miroir : 1 000 €',
                'Peinture + finitions : 600 €',
                'Main d\'œuvre coordination : 1 600 €'
            ]),
            ('Les pièges qui font exploser le budget', [
                'Découverte humidité au mur (chape à reprendre : +2 000 €)',
                'Plomberie en cuivre ancienne à remplacer (+1 500 €)',
                'Tableau électrique pas aux normes (+800-1 200 €)',
                'Sol pas plan (chape de ragréage : +600 €)',
                'Cumulus à déplacer (+400 €)',
                'Demande de PMR en cours de chantier (+3 500 €)'
            ]),
            ('Les économies intelligentes', None,
             'Carrelage : grand format (60×60 cm) demande moins de main d\'œuvre — économie 25% vs format mosaïque. Sanitaires : marques milieu de gamme (Jacob Delafon, Roca) sont 30% moins chères qu\'Hansgrohe ou Geberit pour qualité équivalente. Receveur extra-plat polyester = 40% moins cher que receveur acier ou pierre. Meubles : Ikea Hemnes ou Godmorgon = 60% moins cher que sur-mesure pour fini similaire 10 ans.'),
            ('Le délai standard', None,
             'Une rénovation moyenne (14 000 €) demande 4 à 6 semaines de chantier, dont vous êtes privé de salle de bain. Si vous n\'avez qu\'une seule SdB : prévoyez douche dans une autre pièce (kit douche modulaire), ou logez à proximité 2-3 semaines (gros œuvre). En appartement, prévenez voisinage + syndic. La pose carrelage seul prend 5-7 jours.'),
            ('Aides 2026 pour salles de bain', None,
             'Hors PMR/seniors (MaPrimeAdapt jusqu\'à 22 000 €), il n\'y a pas d\'aides directes pour la salle de bain. Mais : si vous remplacez un cumulus par un chauffe-eau thermodynamique = 1 200 € MPR + 350 € CEE. Si vous remplacez un cumulus par un solaire = 4 000 € MPR + 600 € CEE. C\'est l\'occasion de moderniser le système ECS en même temps.')
        ],
        'cta_title': 'Devis salle de bain personnalisé',
        'cta_desc': 'Visite gratuite + plans 3D + devis détaillé. Aucun engagement.',
        'cta_action': 'Demander un devis'
    }
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | Blog HELP Confort</title>
<meta name="description" content="{description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.depan59-62.fr/blog-{slug}.html">

<meta property="og:type" content="article">
<meta property="og:title" content="{title} | HELP Confort">
<meta property="og:description" content="{description}">
<meta property="og:image" content="https://www.depan59-62.fr/og/index.png">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" type="image/svg+xml" href="logo.svg">
<link rel="apple-touch-icon" sizes="180x180" href="logo-officiel.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">

<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"Article","headline":"{title}","description":"{description}","datePublished":"{date}","dateModified":"{date}","author":{{"@type":"Organization","name":"HELP Confort","url":"https://www.depan59-62.fr"}},"publisher":{{"@type":"Organization","name":"HELP Confort","logo":{{"@type":"ImageObject","url":"https://www.depan59-62.fr/logo-officiel.jpg"}}}},"mainEntityOfPage":{{"@type":"WebPage","@id":"https://www.depan59-62.fr/blog-{slug}.html"}}}}
</script>

<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {{"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.depan59-62.fr/"}},
 {{"@type":"ListItem","position":2,"name":"Blog","item":"https://www.depan59-62.fr/blog.html"}},
 {{"@type":"ListItem","position":3,"name":"{title_short}"}}
]}}
</script>

<style>
.blog-hero{{position:relative;background:linear-gradient(135deg,#0A1428,#172240 50%,#0A1428);padding:80px 20px 60px;color:#fff;overflow:hidden}}
.blog-hero::before{{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 30% 0%,rgba(31,196,240,.10),transparent 70%);pointer-events:none}}
.blog-hero-inner{{position:relative;max-width:780px;margin:0 auto}}
.blog-cat{{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;background:rgba(31,196,240,.15);border:1px solid rgba(31,196,240,.30);color:#1FC4F0;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:18px}}
.blog-hero h1{{font-family:'Inter',sans-serif;font-size:clamp(1.9rem,4vw,2.8rem);margin:0 0 16px;line-height:1.15;font-weight:800;letter-spacing:-.025em}}
.blog-hero h1 em{{font-family:'Playfair Display',Georgia,serif;color:#1FC4F0;font-style:italic;font-weight:600}}
.blog-hero p.lead{{font-size:1.1rem;color:#cbd5e1;line-height:1.55;margin:0 0 20px}}
.blog-hero p.lead strong{{color:#fff;font-weight:700}}
.blog-meta{{display:flex;align-items:center;gap:14px;flex-wrap:wrap;color:rgba(255,255,255,.65);font-size:.86rem}}
.blog-meta strong{{color:#fff;font-weight:600}}

main.blog-main{{max-width:760px;margin:0 auto;padding:50px 20px 40px}}
.blog-section{{margin-bottom:46px}}
.blog-section h2{{font-family:'Inter',sans-serif;font-size:clamp(1.4rem,2.8vw,1.8rem);font-weight:800;color:#0A1428;margin:0 0 18px;letter-spacing:-.02em;line-height:1.3}}
.blog-section p{{font-size:1.04rem;color:#334155;line-height:1.7;margin:0 0 16px}}
.blog-section p strong{{color:#0A1428;font-weight:700}}
.blog-section ul{{padding-left:0;list-style:none;margin:0 0 18px}}
.blog-section ul li{{position:relative;padding:8px 0 8px 30px;color:#334155;font-size:1rem;line-height:1.65;border-bottom:1px dashed #F1F5F9}}
.blog-section ul li:last-child{{border-bottom:0}}
.blog-section ul li::before{{content:"✓";position:absolute;left:0;top:8px;width:22px;height:22px;background:rgba(34,197,94,.12);color:#15803D;border-radius:50%;font-weight:800;font-size:.86rem;display:inline-flex;align-items:center;justify-content:center}}
.blog-section ul li strong{{color:#0A1428;font-weight:700}}

.blog-cta-block{{background:linear-gradient(135deg,#0A1428,#172240);color:#fff;border-radius:20px;padding:38px 32px;text-align:center;margin:40px 0;position:relative;overflow:hidden}}
.blog-cta-block::before{{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 30% 0%,rgba(255,107,26,.15),transparent 60%);pointer-events:none}}
.blog-cta-block h2{{color:#fff;font-size:1.4rem;font-weight:800;margin:0 0 10px;position:relative}}
.blog-cta-block p{{color:rgba(255,255,255,.78);margin:0 0 22px;position:relative;font-size:1rem}}
.blog-cta-block a{{display:inline-flex;align-items:center;gap:9px;padding:14px 28px;background:#FF6B1A;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem;box-shadow:0 10px 24px rgba(255,107,26,.35);position:relative;transition:transform .2s ease,box-shadow .2s ease}}
.blog-cta-block a:hover{{transform:translateY(-2px);box-shadow:0 14px 32px rgba(255,107,26,.45)}}

.blog-other{{margin-top:50px;padding-top:30px;border-top:1px solid #E5EDF3}}
.blog-other h3{{font-size:.84rem;font-weight:800;color:#94a3b8;letter-spacing:.1em;text-transform:uppercase;margin:0 0 16px}}
.blog-other ul{{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0}}
.blog-other ul li{{padding:0;border:0}}
.blog-other ul li::before{{display:none}}
.blog-other ul li a{{display:inline-block;padding:8px 14px;background:#F7FBFD;border:1px solid #E5EDF3;border-radius:8px;font-size:.84rem;color:#475569;text-decoration:none;transition:all .15s ease}}
.blog-other ul li a:hover{{background:#E6F8FE;border-color:#0DA0CF;color:#0DA0CF}}
</style>

</head>
<body>

<div class="hc-topbar" role="complementary">
 <div class="hc-topbar-inner">
 <span class="hctb-zones">
 <a href="a-propos.html#depan-audo" class="hctb-zone"><span class="hctb-pulse" aria-hidden="true"></span><strong>Saint-Omer</strong><em class="hctb-agence">Dépan'Audo</em></a>
 <span class="hctb-plus">+</span>
 <a href="a-propos.html#depan-dk" class="hctb-zone"><strong>Dunkerque</strong><em class="hctb-agence">Dépan'DK</em></a>
 <span class="hctb-bullet">·</span>
 <span class="hctb-hours"><strong>Lun-Ven 9h-17h · Sam 9h-16h</strong></span>
 </span>
 </div>
</div>

<header class="hc-header" id="hcHeader">
 <div class="hc-header-row">
 <a href="index.html" class="hc-logo"><img loading="eager" fetchpriority="high" decoding="async" src="logo-officiel.jpg" alt="HELP Confort" width="200" height="60"></a>
 <nav class="hc-nav" aria-label="Navigation principale">
 <a href="index.html" class="hc-nav-link">Accueil</a>
 <button type="button" class="hc-nav-link hc-nav-trigger" data-has-menu="metiers" aria-haspopup="true" aria-expanded="false">Métiers <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>
 <a href="zones-intervention.html" class="hc-nav-link">Zones d'intervention</a>
 <a href="nos-prestations.html" class="hc-nav-link">Nos prestations</a>
 <a href="blog.html" class="hc-nav-link is-active">Blog</a>
 <a href="a-propos.html" class="hc-nav-link">À propos</a>
 <a href="contact.html" class="hc-nav-link">Contact</a>
 <div class="hc-megamenu" data-menu="metiers" role="menu">
 <a href="plombier-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-plomberie.png" alt="" loading="lazy">Plomberie</a>
 <a href="chauffagiste-saint-omer.html"><img decoding="async" height="437" width="437" src="images/picto-chauffage.svg" alt="" loading="lazy">Chauffage</a>
 <a href="electricien-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-electricite.png" alt="" loading="lazy">Électricité</a>
 <a href="serrurier-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-serrurerie.png" alt="" loading="lazy">Serrurerie</a>
 <a href="vitrier-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-vitrerie.png" alt="" loading="lazy">Vitrerie</a>
 <a href="menuisier-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-menuiserie.png" alt="" loading="lazy">Menuiserie</a>
 <a href="travaux-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-renovation.png" alt="" loading="lazy">Rénovation</a>
 <a href="volets-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-volets.png" alt="" loading="lazy">Volets</a>
 <a href="pmr-saint-omer.html"><img decoding="async" width="256" height="256" src="images/picto-pmr.png" alt="" loading="lazy">Adaptation PMR</a>
 <a href="contrats-entretien.html" class="hc-mm-foot">Contrats d'entretien →</a>
 </div>
 </nav>
 <div class="hc-header-actions">
 <a href="tel:+33366100134" class="hc-btn-tel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="hc-btn-tel-num">03 66 10 01 34</span></a>
 <button type="button" class="hc-burger" aria-label="Menu"><span></span><span></span><span></span></button>
 </div>
 </div>
</header>

<section class="blog-hero" id="main-content">
  <div class="blog-hero-inner">
    <span class="blog-cat">{icon} {categorie} · {metier}</span>
    <h1>{title_h1}</h1>
    <p class="lead">{lead}</p>
    <div class="blog-meta">
      <strong>HELP Confort</strong>
      <span>·</span>
      <span>📅 {date_fr}</span>
      <span>·</span>
      <span>⏱️ Lecture {reading_time} min</span>
    </div>
  </div>
</section>

<main class="blog-main">

{sections_html}

<section class="blog-cta-block">
  <h2>{cta_title}</h2>
  <p>{cta_desc}</p>
  <a href="tel:+33366100134">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    {cta_action}
  </a>
</section>

<section class="blog-other">
  <h3>Autres articles qui pourraient vous intéresser</h3>
  <ul>
{other_articles_html}
    <li><a href="blog.html">→ Tous les articles</a></li>
  </ul>
</section>

</main>

<!-- Bandeau engagements -->
<div data-hc-engagements></div>

<footer class="footer footer-v3">
 <div class="footer-v3-wrap">
 <div class="fv3-grid">
 <div class="fv3-brand">
 <a href="index.html" class="fv3-logo"><img decoding="async" src="logo-officiel.jpg" alt="HELP Confort" width="200" height="60" loading="lazy"></a>
 <div class="fv3-zones"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>Agence <strong>Saint-Omer</strong> &amp; <strong>Dunkerque</strong></span></div>
 <ul class="fv3-contact"><li><a href="tel:+33366100134"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span><strong>03 66 10 01 34</strong><em>Lun–Sam · sur rendez-vous</em></span></a></li></ul>
 </div>
 <div class="fv3-col"><h3>Métiers</h3><ul><li><a href="plombier-saint-omer.html">Plomberie</a></li><li><a href="chauffagiste-saint-omer.html">Chauffage</a></li><li><a href="electricien-saint-omer.html">Électricité</a></li><li><a href="serrurier-saint-omer.html">Serrurerie</a></li></ul></div>
 <div class="fv3-col"><h3>Zones</h3><ul><li><a href="depannage-saint-omer.html">Saint-Omer</a></li><li><a href="depannage-dunkerque.html">Dunkerque</a></li><li><a href="depannage-calais.html">Calais</a></li><li><a href="depannage-boulogne-sur-mer.html">Boulogne-sur-Mer</a></li></ul></div>
 <div class="fv3-col"><h3>Entreprise</h3><ul><li><a href="a-propos.html">À propos</a></li><li><a href="garanties.html">Nos garanties</a></li><li><a href="contact.html">Contact</a></li><li><a href="blog.html">Blog</a></li></ul></div>
 </div>
 </div>
</footer>

<script defer src="assets/hc-megamenu-fix.js"></script>
<script defer src="assets/hc-engagements.js"></script>
<script defer src="assets/hc-sticky-cta.js"></script>
<script defer src="assets/hc-tracking.js"></script>
<script defer src="assets/hc-chat-widget.js"></script>
<script defer src="assets/hc-a11y-fixes.js"></script>
</body>
</html>
'''


def format_date_fr(date_str):
    months = {'01':'janvier','02':'février','03':'mars','04':'avril','05':'mai','06':'juin','07':'juillet','08':'août','09':'septembre','10':'octobre','11':'novembre','12':'décembre'}
    y, m, d = date_str.split('-')
    return f"{int(d)} {months[m]} {y}"


def build_sections_html(sections):
    html = []
    for sec in sections:
        title = sec[0]
        items = sec[1] if len(sec) > 1 else None
        text = sec[2] if len(sec) > 2 else None
        html.append(f'<section class="blog-section">')
        html.append(f'  <h2>{title}</h2>')
        if items:
            html.append('  <ul>')
            for it in items:
                html.append(f'    <li>{it}</li>')
            html.append('  </ul>')
        if text:
            for para in text.split('\n\n'):
                html.append(f'  <p>{para}</p>')
        html.append('</section>')
    return '\n'.join(html)


def estimate_reading_time(sections):
    total = 0
    for s in sections:
        if len(s) > 1 and s[1]:
            total += sum(len(str(it)) for it in s[1])
        if len(s) > 2 and s[2]:
            total += len(s[2])
    minutes = max(2, total // 1000)
    return minutes


generated = 0
for idx, a in enumerate(ARTICLES):
    filename = f"blog-{a['slug']}.html"
    if os.path.exists(filename):
        continue

    # H1 avec em sur mot-clé
    title_h1 = a['title'].replace(a['h1_em'], f"<em>{a['h1_em']}</em>")

    # Autres articles (4 max, hors celui-ci)
    others = [b for j, b in enumerate(ARTICLES) if j != idx][:4]
    other_html = '\n'.join([f'    <li><a href="blog-{o["slug"]}.html">{o["icon"]} {o["title"]}</a></li>' for o in others])

    html = TEMPLATE.format(
        title=a['title'],
        title_h1=title_h1,
        title_short=a['title'][:60],
        description=a['description'],
        slug=a['slug'],
        date=a['date'],
        date_fr=format_date_fr(a['date']),
        icon=a['icon'],
        categorie=a['categorie'],
        metier=a['metier'],
        lead=a['lead'],
        reading_time=estimate_reading_time(a['sections']),
        sections_html=build_sections_html(a['sections']),
        cta_title=a['cta_title'],
        cta_desc=a['cta_desc'],
        cta_action=a['cta_action'],
        other_articles_html=other_html
    )

    with open(filename, 'w', encoding='utf-8') as fp:
        fp.write(html)
    generated += 1
    print(f"OK: {filename}")

print(f"\nTotal généré : {generated} articles")
