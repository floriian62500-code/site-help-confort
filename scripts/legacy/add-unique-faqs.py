#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Replace FAQ sections with 3 unique pertinent FAQs per prestation and update form wording."""

import os
import re
import json
import sys
from pathlib import Path

FAQS = {
    # MENUISERIE
    "porte-entree": [
        ("Bois, alu ou PVC : quel matériau choisir ?", "Le bois est chaleureux, isolant mais demande entretien. L'aluminium est moderne, durable, sans entretien — plus cher. Le PVC est économique, performant en isolation, sans entretien — idéal en rénovation. On vous conseille selon votre maison et votre budget."),
        ("Quels sont vos délais pour remplacer une porte ?", "Comptez 2 à 4 semaines entre la commande et la pose : prise de cotes à domicile, validation du devis, fabrication sur mesure (1-2 semaines), pose en 1 journée. Pour une dépose-pose simple sans sur-mesure, c'est plus rapide."),
        ("Êtes-vous certifiés pour les portes A2P (anti-effraction) ?", "Oui, on installe des portes blindées avec serrures certifiées A2P (BP1, BP2 ou BP3 selon votre niveau de risque). Étude sécurité gratuite à domicile avant devis."),
    ],
    "porte-garage": [
        ("Sectionnelle ou basculante : laquelle choisir ?", "Sectionnelle = ouverture verticale, idéale si peu d'espace devant le garage. Basculante = débord extérieur, plus économique mais nécessite de la place. La sectionnelle est aussi plus isolante."),
        ("La motorisation est-elle indispensable ?", "Non, mais c'est un confort énorme — plus besoin de sortir du véhicule sous la pluie. La motorisation Somfy/Hörmann/Novoferm est compatible avec toutes nos portes. Télécommande + photocellules de sécurité inclus."),
        ("Quel est le délai pour faire poser une porte de garage ?", "3 à 6 jours selon le modèle : prise de cotes, fabrication (sur mesure ou standard), pose en 1 journée. Si urgence, on peut accélérer en choisissant un modèle stock."),
    ],
    "portail-cloture": [
        ("Battant ou coulissant : quel choix selon mon terrain ?", "Battant = classique, économique, mais nécessite de l'espace pour ouvrir. Coulissant = pratique en pente ou si peu de recul, mais plus cher. On vous conseille selon la configuration de votre entrée."),
        ("Combien coûte la motorisation d'un portail existant ?", "La pose d'un kit motorisation Somfy sur un portail existant représente une intervention d'une demi-journée. Le tarif dépend du type (battant/coulissant), du poids et de la longueur. Devis sur étude à domicile."),
        ("Garantie sur le portail et la motorisation ?", "Garantie décennale MAAF sur la pose. Garantie constructeur sur le portail (5 ans en général) et la motorisation Somfy (5 ans). On enregistre les garanties pour vous."),
    ],
    "fenetres-bois-alu-pvc": [
        ("Quelle différence d'isolation entre PVC, alu et bois ?", "Le PVC est très isolant et performant en rapport qualité-prix. L'alu nécessite un rupteur thermique pour bien isoler mais offre des finitions modernes. Le bois est l'isolant naturel champion mais demande entretien."),
        ("Le remplacement de fenêtres ouvre-t-il droit à des aides ?", "Oui : MaPrimeRénov', CEE, TVA 5,5% et éco-PTZ peuvent s'appliquer si vos nouvelles fenêtres respectent les critères thermiques (Uw ≤ 1,3 W/m²K). On vous accompagne pour les démarches."),
        ("Combien de temps pour remplacer toutes mes fenêtres ?", "Comptez 1 à 2 jours par fenêtre pour la pose. La fabrication sur mesure prend 3 à 5 semaines selon le fabricant. On planifie pour minimiser l'inconfort (pas plus de 2 fenêtres ouvertes par jour)."),
    ],
    "coulissant-baie-vitree": [
        ("Quelle taille maximum pour une baie vitrée coulissante ?", "Standard : jusqu'à 4 m de large × 2,2 m de haut sur 2 vantaux. Au-delà, on passe sur du sur-mesure avec 3-4 vantaux (jusqu'à 6 m). Schüco propose même des baies XXL coulissantes à galandage."),
        ("Comment isoler thermiquement une grande baie vitrée ?", "Double vitrage faible émissivité (Uw ≤ 1,4) avec intercalaire warm-edge, ou triple vitrage si exposition nord. Profilés alu à rupture de pont thermique. Joint d'étanchéité de la baie aussi crucial que le vitrage."),
        ("Peut-on motoriser une baie vitrée coulissante ?", "Oui, sur les modèles haut de gamme (Schüco, Kostum). Idéal pour les grandes baies lourdes ou les besoins d'accessibilité PMR. Coût supplémentaire variable selon le type."),
    ],
    "garde-corps-rampes": [
        ("Quelle hauteur réglementaire pour un garde-corps ?", "Norme NF P01-012 : 1 m minimum à partir d'un mètre de hauteur de chute, 1,10 m si chute > 1 m. Les barreaux verticaux doivent être espacés de 11 cm max pour la sécurité enfants."),
        ("Quels matériaux pour un garde-corps de balcon ?", "Inox 316 marin (parfait Côte d'Opale), alu thermolaqué (entretien minimal), verre feuilleté (esthétique moderne) ou fer forgé classique. Tous compatibles avec une fixation sur dalle existante."),
        ("Combien de temps pour poser un garde-corps ?", "1 à 2 jours selon la longueur et la fixation (sur dalle béton, scellement chimique, ou fixation latérale). Études préalables pour vérifier la portance et la conformité."),
    ],
    "remplacement-panneau-porte": [
        ("Mon panneau de porte est abîmé, faut-il changer toute la porte ?", "Pas forcément. Si le cadre dormant est en bon état, on peut remplacer uniquement le panneau (PVC, alu, vitrage). Économique et rapide. On évalue ça lors du devis."),
        ("Quel délai pour un panneau sur mesure ?", "Comptez 2 à 4 semaines : prise de cotes précise, commande chez le fabricant, pose en 2-3 heures. Pour les modèles standard, c'est plus rapide."),
        ("Peut-on changer le style de panneau ?", "Oui — c'est l'occasion de moderniser. On peut passer d'un panneau plein à un vitrage décoratif, d'un bois à un alu, ou changer la couleur. Sur mesure selon votre porte existante."),
    ],
    "parquet": [
        ("Massif, contrecollé ou stratifié : quelles différences ?", "Massif = bois plein, le plus noble, ponçable plusieurs fois, durée de vie 50+ ans. Contrecollé = couche d'usure noble sur support multiplis, plus stable, ponçable 2-3 fois. Stratifié = imitation, plus économique, non ponçable."),
        ("Peut-on poser du parquet sur du carrelage existant ?", "Oui — pose flottante avec sous-couche acoustique sur carrelage propre et plan. Pas de démolition nécessaire. On vérifie d'abord la planéité (max 5 mm sur 2 m) et l'humidité."),
        ("Combien de temps pour poser 30 m² de parquet ?", "Comptez 2 à 3 jours pour 30 m² : préparation du sol, pose, plinthes. Le parquet doit s'acclimater 48h dans la pièce avant pose (température et hygrométrie)."),
    ],
    "fenetres-completes": [
        ("Dépose totale ou rénovation : laquelle choisir ?", "Dépose totale = on retire l'ancien cadre, meilleur surface vitrée et étanchéité optimale. Rénovation = on garde le cadre dormant, pose plus rapide (1 jour), moins chère, mais surface vitrée légèrement réduite."),
        ("Quel coefficient Uw choisir pour mes fenêtres ?", "Uw ≤ 1,3 W/m²K pour bénéficier des aides MaPrimeRénov'. Pour le confort optimal en Côte d'Opale (climat océanique), visez 1,0 à 1,2. Triple vitrage uniquement si fenêtre exposée plein nord ou très grande surface."),
        ("Le délai entre la commande et la pose ?", "3 à 5 semaines selon le fabricant et la complexité (couleur sur mesure, motorisation, dimensions hors-standard). Pose en 1 à 2 jours pour un logement standard 4-6 fenêtres."),
    ],

    # CHAUFFAGE
    "remplacement-chaudiere": [
        ("Quel modèle de chaudière choisir ?", "Pour la plupart des foyers, gaz condensation = meilleur compromis (rendement >100%, aides cumulables). Fioul reste viable hors zone gaz mais coûte cher. Pompe à chaleur = top éco mais investissement initial élevé. On compare selon votre situation."),
        ("Quelles aides pour remplacer ma chaudière ?", "MaPrimeRénov' (500-4000€ selon revenus), CEE Coup de pouce (~500€), TVA 5,5% et éco-PTZ. Cumulables. Dossiers déclarés par nos soins, vous voyez les aides déduites directement sur le devis."),
        ("Combien de temps sans chauffage pendant l'installation ?", "1 journée en moyenne pour remplacer une chaudière gaz/condensation. On dépose, installe et met en service le même jour. Si fioul → gaz, prévoir 2-3 jours (raccordement gaz)."),
    ],
    "depannage-chaudiere": [
        ("Vous intervenez sur quelles marques de chaudières ?", "Toutes les grandes marques : Viessmann, De Dietrich, Frisquet, Atlantic, Saunier Duval, Vaillant, Chaffoteaux, Chappée. Nos techniciens sont formés multimarques."),
        ("Vous intervenez le soir et le week-end ?", "Nos horaires : lun-ven 9h-17h, sam 9h-16h. Hors de ces créneaux pour les urgences, nous relayons vers nos partenaires d'astreinte du réseau HELP Confort."),
        ("Combien coûte un dépannage chaudière ?", "Devis détaillé après diagnostic. Le déplacement et le diagnostic sont déduits si la réparation est acceptée. Pas de réparation surprise, vous décidez après notre diagnostic."),
    ],
    "ramonage": [
        ("Le ramonage est-il vraiment obligatoire ?", "Oui : 1 à 2 fois par an selon votre commune et votre type de combustible. C'est une obligation légale (Règlement Sanitaire Départemental) et la condition pour que votre assurance couvre un sinistre."),
        ("Vous délivrez un certificat de ramonage ?", "Oui — certificat officiel à conserver précieusement. C'est ce document que votre assurance vous demandera en cas de sinistre incendie ou intoxication CO. On le délivre systématiquement."),
        ("Combien coûte un ramonage ?", "Tarif unique de l'ordre de 60-90€ TTC selon le type de conduit (cheminée bois, insert, conduit chaudière). On nettoie le conduit, on vérifie l'étanchéité et on délivre le certificat le jour même."),
    ],
    "desembouage": [
        ("Comment savoir si mon circuit doit être désembouié ?", "Signes : radiateurs froids en bas, chauds en haut. Bruits de glouglou. Chaudière qui surchauffe. Factures qui grimpent. Eau noire à la purge. Un désembouage tous les 5 à 10 ans est recommandé."),
        ("Combien de temps prend un désembouage ?", "Une journée pour un logement standard 8-10 radiateurs : nettoyage chimique du circuit, rinçage haute pression, ajout d'inhibiteur (Sentinel/Fernox) pour protéger durablement, contrôle complet."),
        ("Quel est le gain de performance après désembouage ?", "Rendement chauffage restauré : économies de 10 à 25% sur la facture, radiateurs qui chauffent à 100%, fin des bruits. Surtout, prolonge la durée de vie de la chaudière (corrosion ralentie)."),
    ],

    # PLOMBERIE
    "chauffe-eau": [
        ("Quelle capacité de chauffe-eau pour ma famille ?", "Repère : 50L par personne. Couple sans enfants = 100L. Famille 4 personnes = 200L. Famille 5+ = 250 à 300L. Chauffe-eau thermodynamique recommandé à partir de 200L pour les économies."),
        ("Électrique, gaz ou thermodynamique ?", "Électrique = simple, fiable, moins cher à l'achat. Gaz = économique à l'usage si vous avez déjà le gaz. Thermodynamique = -70% d'électricité mais investissement + besoin d'un local non chauffé."),
        ("Combien de temps pour remplacer un chauffe-eau ?", "Demi-journée pour un remplacement à l'identique. Une journée si changement de technologie (électrique → thermodynamique) avec adaptation des raccordements. On évacue l'ancien."),
    ],
    "salle-de-bain": [
        ("Combien de temps pour rénover une salle de bain complète ?", "3 à 5 semaines selon la taille et les travaux : 1 semaine dépose et plomberie, 1 semaine carrelage, 1 semaine pose sanitaires + finitions. On vous donne un planning précis dans le devis."),
        ("Quelles aides pour une salle de bain PMR ?", "MaPrimeAdapt' : 50 à 70% du montant des travaux (plafond 22 000€ HT), pour seniors ≥70 ans, GIR 1-6 ou handicap ≥50%. Cumulable avec aides locales (caisse retraite, département)."),
        ("Vous fournissez le matériel ou je le choisis ?", "Les deux possibilités. On vous accompagne dans les showrooms partenaires (Geberit, Grohe, Jacob Delafon, Roca) avec nos tarifs négociés. Ou vous nous fournissez le matériel acheté ailleurs."),
    ],
    "recherche-fuite": [
        ("Combien de temps pour localiser une fuite ?", "30 min à 2h selon la complexité. On utilise caméra thermique, gaz traceur ou écoute acoustique selon la situation. Pas de casse inutile : on localise précisément avant d'ouvrir."),
        ("L'assurance prend-elle en charge la recherche ?", "Oui, généralement : votre assurance habitation couvre la recherche de fuite si le sinistre est avéré (trace d'humidité, dégât). On vous fournit un rapport détaillé pour la déclaration."),
        ("Que faire en attendant l'intervention ?", "Coupez l'arrivée d'eau générale (vanne sous évier ou compteur). Photographiez les dégâts. Déclarez à votre assurance dans les 5 jours. On vous accompagne dans les démarches si besoin."),
    ],
    "debouchage": [
        ("Furet ou hydrocurage : lequel choisir ?", "Furet électrique = mécanique, casse les bouchons solides (cheveux, calcaire, débris). Hydrocurage = jet haute pression, nettoie le diamètre complet, idéal pour les canalisations vieilles ou très encrassées."),
        ("Combien coûte un débouchage ?", "Forfait standard pour évier, lavabo ou WC. Hydrocurage haute pression pour les cas plus complexes (canalisations enterrées, descentes). Devis selon difficulté, sans surprise."),
        ("Garantie sans casse ?", "Oui : on garantit le débouchage sans casse de tuyauterie. Si un débouchage nécessite démontage du sanitaire, on prévient et on demande votre accord avant d'agir."),
    ],
    "sanitaire": [
        ("Vous installez tous types de WC (suspendu, broyeur, japonais) ?", "Oui : WC classique posé, WC suspendu avec bâti-support Geberit, WC broyeur (Sanibroyeur), WC japonais lavant. Devis selon contraintes (réseau d'évacuation, alimentation électrique)."),
        ("Quelles marques de robinetterie installez-vous ?", "Marques de référence : Grohe, Hansgrohe, Jacob Delafon. On fournit aux tarifs négociés HELP Confort, ou on pose vos achats personnels (modèles équivalents)."),
        ("Combien de temps pour remplacer un WC ?", "2 à 3 heures pour un remplacement à l'identique. Demi-journée pour passage classique → suspendu (création d'un mur technique avec bâti-support). Évacuation de l'ancien sanitaire incluse."),
    ],
    "reseaux-plomberie": [
        ("Cuivre, PER ou multicouche : quelle différence ?", "Cuivre = classique, durable 50+ ans, recyclable, mais cher. PER = plastique, économique, rapide à poser, durée 30+ ans. Multicouche = top compromis (PER avec âme alu), résistant à la pression et à la chaleur."),
        ("Faut-il refaire tous les tuyaux en cas de fuite ?", "Pas systématiquement. On évalue : si le réseau a moins de 20 ans et que la fuite est ponctuelle, on répare. Si le réseau est vieillissant (plomb, vieux cuivre), on conseille un renouvellement progressif."),
        ("Combien coûte un renouvellement complet du réseau ?", "Très variable selon la longueur, le matériau choisi et l'accessibilité. On fait un devis détaillé pièce par pièce. Possibilité d'échelonner sur plusieurs interventions."),
    ],

    # ÉLECTRICITÉ
    "tableau-electrique": [
        ("Mon tableau date des années 80, faut-il le changer ?", "Probablement oui. Avant 1991, pas de différentiel 30 mA obligatoire. Avant 2000, normes différentes. Si vous avez encore des fusibles à porcelaine, du chevauchement de circuits ou pas de prise de terre : remplacement recommandé."),
        ("Combien coûte un tableau aux normes NF C 15-100 ?", "Variable selon le nombre de circuits, la marque (Legrand, Schneider, Hager) et l'installation existante. Comptez généralement entre 800 et 2500€ TTC tout compris (matériel + main d'œuvre + Consuel)."),
        ("Avez-vous besoin d'une attestation Consuel ?", "Si vente ou location, oui. Sinon recommandé pour la sécurité. On gère la démarche Consuel : visite de l'organisme, attestation délivrée, fourniture à l'acheteur/locataire."),
    ],
    "depannage-electrique": [
        ("Mon disjoncteur saute en permanence, c'est grave ?", "Pas forcément grave, mais à diagnostiquer rapidement. Causes fréquentes : surcharge, court-circuit, défaut d'isolement. Le disjoncteur fait son travail (protection). Diagnostic en 30 min à 1h."),
        ("Je n'ai plus de courant dans toute la maison ?", "Vérifier d'abord : disjoncteur général enclenché, pas de coupure ENEDIS dans le quartier (https://enedis.fr). Si tout est OK et coupure persistante, c'est un défaut sur le réseau intérieur : on intervient."),
        ("Quel délai pour une intervention électrique urgente ?", "Dans nos horaires d'ouverture (lun-ven 9h-17h, sam 9h-16h), intervention sous 30 min à 2h selon la distance. Pour les urgences hors horaires, nous relayons vers nos partenaires d'astreinte."),
    ],
    "recherche-panne-elec": [
        ("Combien de temps pour identifier une panne ?", "30 min à 2h selon la complexité. On utilise multimètre, testeur d'isolement, caméra thermique pour les surchauffes. Diagnostic structuré : on remonte du symptôme à la cause."),
        ("Si la panne vient du compteur ENEDIS, qui paye ?", "Si le défaut est en amont de votre compteur (réseau ENEDIS), c'est ENEDIS qui intervient gratuitement. On vous le dit honnêtement après diagnostic. Si en aval (votre installation), c'est de notre ressort."),
        ("Que faire en attendant ?", "Couper le disjoncteur de la zone concernée si vous identifiez quelle pièce est en cause. Ne pas tenter de toucher aux fils. Photographier les éventuelles traces de surchauffe (marrons, brûlures)."),
    ],
    "vmc": [
        ("Simple flux ou double flux : quelle différence ?", "Simple flux = extrait l'air vicié, l'air neuf entre par les fenêtres. Économique, mais peu performant en isolation. Double flux = récupère 70-90% de la chaleur de l'air extrait pour réchauffer l'air entrant. Top en maison BBC/RT2012."),
        ("La VMC est-elle obligatoire dans une maison ?", "Oui depuis 1969 dans tous les logements neufs. Recommandée fortement en rénovation (humidité, qualité de l'air). Sans VMC, risques d'humidité, moisissures, mauvaise qualité d'air."),
        ("Bruyante, ma VMC ? Vous proposez du silencieux ?", "Les VMC modernes (Atlantic, Aldes) sont quasi-silencieuses (<25 dB). Si la vôtre fait du bruit, c'est qu'elle est ancienne ou mal installée (vibrations, conduits flexibles trop longs). On peut traiter le bruit."),
    ],
    "luminaire": [
        ("Vous installez tous les types de luminaires ?", "Oui : suspensions, plafonniers, appliques, spots encastrés, rampes LED, bandeaux LED, projecteurs extérieurs. On vérifie l'alimentation existante et on adapte si besoin (boîte de dérivation, ajout de point électrique)."),
        ("Combien coûte la pose d'un lustre ?", "1 à 2 heures pour une pose simple (luminaire fourni par vous, point électrique existant). Tarif selon difficulté (hauteur sous plafond, type de fixation). Si création d'un point lumineux, plus long."),
        ("LED ou halogène : quel choix ?", "LED systématiquement. Consommation -85%, durée de vie 25 000h vs 2000h pour halogène. Coût d'achat à peine plus élevé, économies durables. Vous gardez le même style esthétique."),
    ],

    # SERRURERIE
    "ouverture-porte": [
        ("Vous ouvrez sans casser la porte ?", "Dans 95% des cas, oui : avec nos outils de crochetage, l'ouverture est non destructive (la serrure et la porte restent intactes). En cas de serrure très haute sécurité ou bloquée mécaniquement, on en discute avant d'agir."),
        ("Combien coûte une ouverture de porte ?", "Forfait standard pour une porte simple. Plus élevé si serrure multipoints, blindage A2P, ou intervention en urgence hors horaires. Devis annoncé AVANT intervention, pas après."),
        ("Que faire en attendant le serrurier ?", "Restez calme. Vérifiez chez les voisins, la concierge ou un proche s'ils ont un double. Évitez de tenter d'ouvrir vous-même au tournevis (vous risquez de casser le mécanisme et la facture explose)."),
    ],
    "changement-cylindre": [
        ("Pourquoi changer mon cylindre ?", "Raisons principales : clé perdue/volée, déménagement, séparation, location terminée, sécurité (cylindre A2P pour contre l'effraction par crochetage ou perçage). On installe Vachette, Mottura, Bricard certifiés."),
        ("Combien coûte un cylindre haute sécurité ?", "Selon le niveau A2P : * = 30 min de résistance, ** = 10 min, *** = 15 min crochetage. Plus le niveau est élevé, plus c'est cher. On vous conseille selon votre niveau de risque (rez-de-chaussée, étage)."),
        ("Combien de clés sont fournies ?", "5 clés en standard + 1 carte de propriété (sans elle, impossible de refaire des copies). Cartes brevetées pour les modèles haute sécurité : copies uniquement chez le fabricant agréé."),
    ],
    "porte-claquee": [
        ("La porte s'est claquée derrière moi, vous intervenez vite ?", "Oui — dans nos horaires d'ouverture (lun-ven 9h-17h, sam 9h-16h), intervention sous 30 min à 1h. Pour les urgences hors horaires, nous relayons vers nos partenaires d'astreinte du réseau HELP Confort."),
        ("Tarif pour une porte simplement claquée ?", "Forfait standard (déplacement + ouverture). Plus économique qu'une porte fermée à clé car pas besoin de crochetage en profondeur. Devis annoncé avant intervention."),
        ("Vous ouvrez sans abîmer la porte ?", "Oui — porte claquée = mécanisme pas verrouillé, juste la têtière qui tient. Ouverture avec une carte ou un outil fin (radio plastique). Aucune casse dans 99% des cas."),
    ],
    "porte-fermee-cle": [
        ("Je n'ai plus mes clés, vous intervenez ?", "Oui. Si vous êtes locataire, on demande un justificatif (CNI + justificatif de domicile au nom de l'adresse). Pour les propriétaires, c'est simple : on intervient sur présentation de justificatif d'identité."),
        ("Vous ouvrez par crochetage ou perçage ?", "On essaie toujours d'abord le crochetage (non destructif). Si la serrure est verrouillée à double tour ou blindée A2P, le perçage peut être nécessaire — on prévient avant et on remplace le cylindre."),
        ("Combien de temps pour ouvrir ?", "10 à 45 min selon la serrure : porte standard = rapide, multipoints = plus long, blindée A2P = peut nécessiter perçage. On vous tient informé pendant l'intervention."),
    ],

    # VITRERIE
    "mise-securite-vitrerie": [
        ("Vitre brisée la nuit, vous intervenez ?", "Pour les urgences vitrerie hors horaires d'ouverture, nous relayons vers nos partenaires d'astreinte. En journée (lun-ven 9h-17h, sam 9h-16h), nous intervenons rapidement avec pose de panneau de sécurité dans l'attente du vitrage définitif."),
        ("Quelle est la procédure pour l'assurance ?", "Photographiez les dégâts. Déclarez votre sinistre dans les 5 jours (effraction → 24-48h). On fournit un devis détaillé et une facture conforme pour le remboursement de votre assurance habitation."),
        ("Pose de panneau provisoire le temps du vitrage neuf ?", "Oui — panneau OSB ou polycarbonate posé en sécurisation immédiate. Une fois le vitrage commandé (3-7 jours selon dimensions), on remplace par le vitrage définitif."),
    ],
    "vitrage-simple-double-triple": [
        ("Triple vitrage : ça vaut le coup en Côte d'Opale ?", "Pas systématiquement. Le triple vitrage est intéressant en climat très froid (montagne, nord-est de la France). En Côte d'Opale (climat océanique tempéré), le double vitrage 4/16/4 argon faible émissivité est généralement suffisant."),
        ("Quels coefficients viser pour mes vitrages ?", "Ug (vitrage) ≤ 1,1 W/m²K. Uw (fenêtre complète) ≤ 1,3 pour les aides MaPrimeRénov'. ITR (Indice de Transmission de Réduction sonore) à privilégier si vous êtes près d'une route passante."),
        ("Peut-on remplacer juste le vitrage sans changer la fenêtre ?", "Oui, si le cadre est en bon état. On dépose les pare-closes, on retire l'ancien vitrage, on pose le neuf. Économique. Devis selon nombre de vantaux et type de vitrage."),
    ],
    "vitrage-insert-poele": [
        ("Quel type de vitre pour un insert cheminée ?", "Vitrocéramique réfractaire (Schott Robax, Saint-Gobain) résistante jusqu'à 760°C. On ne pose JAMAIS de verre standard sur un insert : risque d'éclatement immédiat à la première flambée."),
        ("Ma vitre est noircie, vous nettoyez ou remplacez ?", "Si la vitre est encrassée par le bistre, un nettoyage spécifique suffit (produit décrassant vitrocéramique). Si la vitre est fissurée, ébréchée ou trouble, on remplace — c'est non-négociable pour la sécurité."),
        ("Délai pour remplacer la vitre de l'insert ?", "1 à 3 semaines selon le modèle d'insert (sur mesure pour les vitrocéramiques anciennes). On prend les dimensions exactes, on commande la pièce, on pose en 30 min."),
    ],
    "vitrerie-panneau-porte": [
        ("Mon vitrage de porte est cassé, par quoi le remplacer ?", "Vitrage feuilleté de sécurité (CE 44.2 ou 44.6) — résistant aux impacts, ne forme pas d'éclats coupants en cas de bris. C'est l'obligation pour les vitrages de porte en hauteur d'enfant."),
        ("Vitrage clair ou décoratif/dépoli ?", "À votre choix. Clair pour la luminosité maximale, dépoli pour l'intimité tout en gardant la lumière, vitrage à motifs décoratifs pour le style. Tous compatibles en vitrage feuilleté sécurité."),
        ("Combien coûte le remplacement ?", "Variable selon dimensions et type. Vitrage feuilleté clair = base. Dépoli, motifs ou couleur = supplément. Devis précis après prise de cotes (gratuit)."),
    ],

    # VOLETS
    "volet-roulant": [
        ("Manuel ou motorisé ?", "Motorisé pour le confort (Somfy télécommande, programmation horaire, vent solaire). Manuel = économique mais astreignant à long terme. Sur un volet existant manuel, on peut motoriser sans tout changer."),
        ("Vous installez quelles marques ?", "Marques de référence : Somfy (motorisation), Bubendorff (volets intégrés), Soprofen (volets et coffres), Profalux (haut de gamme français). On installe et SAV agréé."),
        ("Quelle garantie sur la motorisation Somfy ?", "5 ans constructeur sur le moteur Somfy + notre garantie main d'œuvre 2 ans. Pièces détachées disponibles 10 ans après commercialisation. SAV multimarques."),
    ],
}


def build_faq_html(faqs):
    """Build the HTML for the FAQ section."""
    items = []
    for q, a in faqs:
        items.append(f'<details class="seo-faq-item"><summary>{q}</summary><div>{a}</div></details>')
    return (
        '<section class="seo-section" id="faq"><h2>Questions fréquentes</h2><div class="seo-faq">\n'
        + "\n".join(items)
        + "\n</div></section>"
    )


def build_faq_jsonld(faqs):
    """Build the JSON-LD FAQPage schema."""
    main_entity = []
    for q, a in faqs:
        main_entity.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        })
    data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main_entity,
    }
    json_text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return f'<script type="application/ld+json">{json_text}</script>'


# Regex patterns
# FAQ section: <section class="seo-section" id="faq">...</section>
# Note: section may appear within content with no leading whitespace
FAQ_SECTION_RE = re.compile(
    r'<section class="seo-section" id="faq">.*?</section>',
    re.DOTALL,
)
# Alternative variant (no id attribute - shouldn't exist now but safety)
FAQ_SECTION_NOID_RE = re.compile(
    r'<section class="seo-section"><h2>Questions fréquentes</h2>.*?</section>',
    re.DOTALL,
)
# JSON-LD FAQPage
FAQ_JSONLD_RE = re.compile(
    r'<script type="application/ld\+json">\{"@context":"https://schema\.org","@type":"FAQPage".*?</script>',
    re.DOTALL,
)


def process_file(path, slug):
    """Process a single prestation file."""
    if slug not in FAQS:
        return {"slug": slug, "error": "No FAQ mapping", "faq_count": 0}

    faqs = FAQS[slug]
    text = path.read_text(encoding="utf-8")
    original = text

    # 1. Replace or inject FAQ section
    new_faq_html = build_faq_html(faqs)
    faq_section_replaced = False
    if FAQ_SECTION_RE.search(text):
        text = FAQ_SECTION_RE.sub(lambda m: new_faq_html, text, count=1)
        faq_section_replaced = True
    elif FAQ_SECTION_NOID_RE.search(text):
        text = FAQ_SECTION_NOID_RE.sub(lambda m: new_faq_html, text, count=1)
        faq_section_replaced = True
    else:
        # Inject before the closing </div> of seo-content, which sits right before <aside class="seo-form-side"
        aside_marker = '</div><aside class="seo-form-side"'
        if aside_marker in text:
            text = text.replace(aside_marker, new_faq_html + aside_marker, 1)
            faq_section_replaced = True
        else:
            # Try with newline variant
            aside_marker_nl = '</div>\n<aside class="seo-form-side"'
            if aside_marker_nl in text:
                text = text.replace(aside_marker_nl, new_faq_html + '</div>\n<aside class="seo-form-side"', 1)
                faq_section_replaced = True

    # 2. Replace JSON-LD FAQPage schema
    new_jsonld = build_faq_jsonld(faqs)
    jsonld_replaced = False
    if FAQ_JSONLD_RE.search(text):
        text = FAQ_JSONLD_RE.sub(lambda m: new_jsonld, text, count=1)
        jsonld_replaced = True
    else:
        # If no FAQPage JSON-LD, inject after the first script LocalBusiness/Service ld+json
        # Find </head> and insert before it
        head_close_idx = text.find("</head>")
        if head_close_idx != -1:
            text = text[:head_close_idx] + new_jsonld + text[head_close_idx:]
            jsonld_replaced = True

    # 3. Update form wording
    form_count = 0
    old_form_box = '<div class="seo-form-box"><h3>Devis gratuit &amp; rapide</h3><p class="sub">Renseignez vos coordonnées, on vous rappelle <strong>sous 1h ouvrée</strong>.</p>'
    new_form_box = '<div class="seo-form-box"><h3>Demande de rappel pour devis</h3><p class="sub">Renseignez vos coordonnées et votre besoin. On vous rappelle <strong>sous 1h ouvrée</strong> pour un devis détaillé adapté à votre situation.</p>'
    if old_form_box in text:
        text = text.replace(old_form_box, new_form_box)
        form_count += 1

    old_btn = '<button type="submit" class="seo-form-submit">Recevoir mon devis →</button>'
    new_btn = '<button type="submit" class="seo-form-submit">Demander un rappel →</button>'
    if old_btn in text:
        text = text.replace(old_btn, new_btn)
        form_count += 1

    if text != original:
        path.write_text(text, encoding="utf-8")

    # Count number of FAQ items in resulting file
    faq_count = text.count('<details class="seo-faq-item">')

    return {
        "slug": slug,
        "faq_section_replaced": faq_section_replaced,
        "jsonld_replaced": jsonld_replaced,
        "form_updated": form_count,
        "faq_count": faq_count,
    }


def main():
    base = Path("/sessions/youthful-charming-goldberg/mnt/SITE INTERNET/prestations")
    if not base.is_dir():
        # Try local Mac path
        base = Path("/Users/HP/Documents/Claude/Projects/SITE INTERNET/prestations")
    files = sorted(base.glob("*.html"))
    print(f"Found {len(files)} prestation files in {base}")

    missing_slugs = []
    results = []
    for path in files:
        slug = path.stem
        if slug not in FAQS:
            missing_slugs.append(slug)
            continue
        res = process_file(path, slug)
        results.append(res)

    print("\n--- RESULTS ---")
    print(f"{'slug':<35} {'faq_count':>10} {'section':>8} {'jsonld':>8} {'form':>5}")
    total_form = 0
    total_section = 0
    total_jsonld = 0
    for r in results:
        section_ok = "OK" if r.get("faq_section_replaced") else "MISS"
        jsonld_ok = "OK" if r.get("jsonld_replaced") else "MISS"
        print(f"{r['slug']:<35} {r['faq_count']:>10} {section_ok:>8} {jsonld_ok:>8} {r['form_updated']:>5}")
        if r.get("faq_section_replaced"):
            total_section += 1
        if r.get("jsonld_replaced"):
            total_jsonld += 1
        total_form += r.get("form_updated", 0)

    print(f"\nProcessed: {len(results)} files")
    print(f"FAQ sections replaced: {total_section}/{len(results)}")
    print(f"JSON-LD updated: {total_jsonld}/{len(results)}")
    print(f"Form updates total (2 per file = {len(results) * 2} expected): {total_form}")

    if missing_slugs:
        print(f"\nMISSING SLUGS (no FAQ mapping): {missing_slugs}")

    # Quality check: confirm 3 FAQ items per file
    bad = [r for r in results if r["faq_count"] != 3]
    if bad:
        print(f"\nQUALITY CHECK FAIL — files with != 3 FAQ items:")
        for r in bad:
            print(f"  {r['slug']}: {r['faq_count']} items")
        return 1
    else:
        print(f"\nQUALITY CHECK OK — all {len(results)} files have exactly 3 FAQ items.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
