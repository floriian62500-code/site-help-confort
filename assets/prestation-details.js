// ═══════════════════════════════════════════════════════════
// Détails enrichis des prestations — affichés dans le modal
// de réservation (colonne gauche) quand l'utilisateur clique
// sur une card métier. Keys = data-presta exact (sensibilité
// majuscules / accents).
// ═══════════════════════════════════════════════════════════
window.PRESTATION_DETAILS = {

  // ─── MENUISERIE ───
  "Porte d'entrée": {
    icon: "🚪",
    description: "Pose ou remplacement complet de porte d'entrée bois, aluminium ou PVC. Sécurité A2P, motorisation possible, finitions sur mesure adaptées à votre façade.",
    brands: ["Groupe Millet","Brémaud","Kostum","Jeld-Wen","Rozière"],
    included: ["Dépose porte existante","Pose porte neuve","Reprise étanchéité","Réglage et test sécurité","Évacuation des gravats"],
    delay: "2 à 4 jours après acceptation du devis",
    warranty: "Décennale MAAF + garantie constructeur (5 à 10 ans)",
    eligibilite: "Éligible CEE et MaPrimeRénov' selon performance thermique"
  },
  "Porte de garage": {
    icon: "🏠",
    description: "Sectionnelle, basculante ou enroulable, avec motorisation Somfy, télécommande et isolation thermique renforcée. Adaptée aux dimensions de votre ouverture.",
    brands: ["Soprofen","SPPF","Hörmann","Novoferm","Somfy"],
    included: ["Prise de cotes","Dépose ancienne porte","Pose porte neuve","Motorisation + télécommande","Mise en service"],
    delay: "3 à 6 jours après acceptation du devis",
    warranty: "Décennale MAAF + garantie constructeur + moteur 5 ans",
    eligibilite: "Devis personnalisé"
  },
  "Portail & clôture": {
    icon: "🚧",
    description: "Portail battant ou coulissant en alu, fer forgé, PVC ou bois. Motorisation et automatismes Somfy, interphone, contrôle d'accès.",
    brands: ["Soprofen","SPPF","GEF Production","Somfy"],
    included: ["Dépose ancien portail","Pose portail neuf","Motorisation","Interphone si demandé","Mise en service"],
    delay: "5 à 10 jours après acceptation",
    warranty: "Décennale MAAF + 5 ans motorisation",
    eligibilite: "Devis personnalisé"
  },
  "Fenêtres bois / alu / PVC": {
    icon: "🪟",
    description: "Pose neuve ou rénovation de fenêtres bois, aluminium ou PVC. Double ou triple vitrage isolant. Conforme NF EN 14351-1.",
    brands: ["Groupe Millet","Brémaud","Jeld-Wen","Velux","Schüco"],
    included: ["Prise de cotes","Dépose ancienne fenêtre","Pose neuve","Finitions et raccords","Évacuation gravats"],
    delay: "3 à 7 jours après acceptation",
    warranty: "Décennale MAAF + garantie constructeur 10 ans",
    eligibilite: "Éligible CEE et MaPrimeRénov' (gain Uw ≤ 1,3 W/m².K)"
  },
  "Coulissant & baie vitrée": {
    icon: "↔️",
    description: "Galandage, levant-coulissant intérieur ou extérieur. Grandes ouvertures, isolation thermique premium, double ou triple vitrage.",
    brands: ["Groupe Millet","Schüco","Brémaud","Kostum"],
    included: ["Étude technique","Dépose","Pose coulissant","Habillage et finitions","Réglage"],
    delay: "5 à 10 jours après acceptation",
    warranty: "Décennale MAAF + garantie constructeur",
    eligibilite: "Devis personnalisé · CEE possible selon performance"
  },
  "Garde-corps & rampes": {
    icon: "🛡️",
    description: "Bois, métal ou verre. Pose neuve ou rénovation pour balcons, terrasses, escaliers intérieurs et extérieurs. Conforme norme NF P01-012.",
    brands: ["Rozière","Brémaud","Groupe Millet"],
    included: ["Prise de cotes","Fabrication sur mesure","Pose et fixations","Vérification conformité"],
    delay: "5 à 12 jours selon dimensions",
    warranty: "Décennale MAAF",
    eligibilite: "Devis personnalisé"
  },
  "Remplacement panneau de porte": {
    icon: "🔧",
    description: "Panneau PVC ou alu de porte d'entrée abîmé, fissuré ou terni : dépose et pose d'un panneau neuf adapté à votre menuiserie existante. Évite le remplacement complet de la porte.",
    brands: ["Groupe Millet","Brémaud","Jeld-Wen"],
    included: ["Dépose ancien panneau","Pose panneau neuf","Reprise joints","Réglage"],
    delay: "1 à 3 jours après acceptation",
    warranty: "Décennale MAAF + garantie panneau",
    eligibilite: "Devis personnalisé"
  },
  "Parquet": {
    icon: "🪵",
    description: "Pose ou rénovation de parquet massif, contrecollé ou stratifié. Sols vinyle premium type Coretec. Ponçage et vitrification, plinthes assorties.",
    brands: ["Parador","COREtec","Meister"],
    included: ["Préparation du sol","Pose flottante ou collée","Plinthes","Évacuation gravats"],
    delay: "2 à 5 jours selon surface",
    warranty: "Décennale MAAF + garantie constructeur (15 à 30 ans selon produit)",
    eligibilite: "Devis personnalisé"
  },

  // ─── PLOMBERIE ───
  "Désembouage radiateur": {
    icon: "🌡️",
    description: "Élimination des boues et tartres dans le circuit chauffage par traitement chimique pro. Rétablit le rendement du chauffage et prolonge la durée de vie de la chaudière.",
    brands: ["Sentinel","Fernox"],
    included: ["Diagnostic boucle","Injection produit désembouant","Rinçage complet","Test et mise en route"],
    delay: "1 journée d'intervention",
    warranty: "Garantie résultat + décennale MAAF",
    eligibilite: "Devis selon nombre de radiateurs"
  },
  "Salle de bain": {
    icon: "🛁",
    description: "Rénovation complète clés en main : douche italienne, baignoire, lavabo, WC, faïence, plomberie, électricité. Conception sur mesure adaptée à votre espace.",
    brands: ["Hansgrohe","Geberit","Kinedo","HSK","Quare Design","AKW"],
    included: ["Étude 3D","Dépose existant","Travaux gros œuvre","Pose sanitaires","Finitions"],
    delay: "1 à 3 semaines selon ampleur",
    warranty: "Décennale MAAF + garantie constructeur",
    eligibilite: "Éligible MaPrimeAdapt' pour PMR/seniors"
  },

  // ─── CHAUFFAGE ───
  "Remplacement chaudière": {
    icon: "🔥",
    description: "Dépose ancienne chaudière + pose neuve gaz condensation, fioul ou électrique. Mise en service, raccordement, certificat de conformité.",
    brands: ["Atlantic","Frisquet","Chappée","De Dietrich","Saunier Duval"],
    included: ["Dépose ancienne chaudière","Pose chaudière neuve","Raccordements","Mise en service","Certificat Qualigaz si gaz"],
    delay: "1 à 2 jours d'intervention",
    warranty: "Décennale MAAF + garantie constructeur 2 à 5 ans + pièces 10 ans",
    eligibilite: "Aides CEE + MaPrimeRénov' (jusqu'à 4 000 € selon revenus)"
  },
  "Ramonage cheminée & chaudière": {
    icon: "🔥",
    description: "Ramonage obligatoire 1 à 2× par an selon votre assureur : cheminée, conduit chaudière, insert, poêle à bois. Certificat fourni.",
    brands: [],
    included: ["Ramonage mécanique","Vérification tirage","Contrôle conduit","Certificat de ramonage"],
    delay: "Intervention en 1h",
    warranty: "Certificat ramonage exigible par assureur",
    eligibilite: "Obligation légale annuelle"
  },

  // ─── ÉLECTRICITÉ ───
  "Recherche de panne": {
    icon: "🔍",
    description: "Diagnostic électrique complet avec testeurs pro pour identifier l'origine d'une panne (court-circuit, surtension, défaut isolement, etc.).",
    brands: ["Legrand","ABB"],
    included: ["Diagnostic complet","Localisation panne","Devis réparation détaillé","Conseil sécurité"],
    delay: "Intervention sous 48h ouvrées",
    warranty: "Diagnostic garanti",
    eligibilite: "Forfait transparent"
  },
  "Tableau électrique": {
    icon: "⚡",
    description: "Dépose/pose tableau électrique conforme NF C 15-100. Ajout de disjoncteurs, mise en sécurité, attestation Consuel pour vente ou location.",
    brands: ["Legrand","ABB","Hager","Schneider"],
    included: ["Dépose ancien tableau","Pose nouveau tableau","Câblage","Test conformité","Attestation Consuel"],
    delay: "1 à 2 jours selon ampleur",
    warranty: "Décennale MAAF + garantie matériel 2 ans",
    eligibilite: "Devis personnalisé"
  },
  "VMC — pose & entretien": {
    icon: "💨",
    description: "Installation VMC simple flux, hygro ou double flux. Nettoyage, changement de moteur, mise en conformité réglementation habitat.",
    brands: ["Aldes","Atlantic"],
    included: ["Étude besoin","Pose VMC","Raccordements","Mise en service","Certificat"],
    delay: "1 à 3 jours selon configuration",
    warranty: "Décennale MAAF + garantie constructeur 2 ans",
    eligibilite: "Éligible CEE selon performance"
  },

  // ─── SERRURERIE ───
  "Ouverture porte simple": {
    icon: "🔓",
    description: "Ouverture sans dégradation par crochetage technique d'une porte non claquée ou avec serrure standard. Sans casse dans 95 % des cas.",
    brands: [],
    included: ["Diagnostic sur place","Ouverture par crochetage","Conseils sécurité"],
    delay: "Intervention sous 1h en journée",
    warranty: "Sans casse garantie 95 % des cas",
    eligibilite: "Forfait transparent — devis annoncé avant intervention"
  },
  "Changement de cylindre": {
    icon: "🔑",
    description: "Remplacement de cylindre de serrure : standard, anti-effraction ou A2P. Solution rapide après perte de clés, déménagement ou amélioration sécurité.",
    brands: ["Vachette","Bricard","Iseo","Winkhaus"],
    included: ["Dépose ancien cylindre","Pose cylindre neuf","Nouvelles clés","Test sécurité"],
    delay: "Intervention dans la journée",
    warranty: "Garantie cylindre 5 ans (10 ans A2P)",
    eligibilite: "Devis selon modèle souhaité"
  },

  // ─── VITRERIE ───
  "Mise en sécurité 24h": {
    icon: "🛡️",
    description: "Bris de glace, vitre cassée, tentative d'effraction : sécurisation immédiate avec film ou panneau provisoire, et nettoyage sur place.",
    brands: ["Riouglass"],
    included: ["Sécurisation immédiate","Nettoyage débris","Devis remplacement","Conseil assurance"],
    delay: "Intervention sous 2h en journée",
    warranty: "Décennale MAAF",
    eligibilite: "Pris en charge assurance habitation dans la plupart des cas"
  },
  "Vitrage simple, double ou triple": {
    icon: "🪟",
    description: "Remplacement sur menuiserie existante : simple 4/6 mm, double 4/16/4 argon ou triple vitrage haute performance. Bois, PVC, alu.",
    brands: ["Riouglass"],
    included: ["Prise de cotes","Fabrication sur mesure","Dépose ancien vitrage","Pose nouveau vitrage","Reprise joints"],
    delay: "5 à 10 jours (fabrication sur mesure)",
    warranty: "Décennale MAAF + garantie vitrage 10 ans",
    eligibilite: "Éligible CEE pour double/triple vitrage"
  },
  "Vitrage insert & poêle": {
    icon: "🔥",
    description: "Remplacement vitre vitrocéramique pour insert, poêle à bois ou foyer fermé. Résistance jusqu'à 760°C. Découpe sur mesure.",
    brands: ["Schott Robax"],
    included: ["Prise de cotes","Découpe sur mesure","Pose vitre vitrocéramique","Joint haute température"],
    delay: "5 à 10 jours",
    warranty: "Garantie résistance thermique",
    eligibilite: "Devis personnalisé"
  },

  // ─── VOLETS ───
  "Volet roulant": {
    icon: "🪟",
    description: "Pose ou remplacement volet roulant manuel ou motorisé. Solutions intégrées, semi-coffre ou rénovation. Aluminium ou PVC.",
    brands: ["Somfy Pro","Bubendorff","Soprofen","SPPF","GEF Production"],
    included: ["Prise de cotes","Dépose ancien volet","Pose volet neuf","Motorisation Somfy si choisie","Réglage"],
    delay: "3 à 7 jours",
    warranty: "Décennale MAAF + garantie constructeur 5 ans + moteur 5 ans",
    eligibilite: "Éligible CEE pour volets isolants"
  },
};

// Helper pour récupérer les détails d'une prestation (gère accents, casse)
window.getPrestationDetails = function(name) {
  if (!name) return null;
  var n = name.trim();
  return window.PRESTATION_DETAILS[n] || null;
};
