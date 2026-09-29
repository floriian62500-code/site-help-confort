/* Module « Contrats d'entretien » — montable sur n'importe quelle page.
   ------------------------------------------------------------------------------------------
   REQ-20260926-017. Pose, là où la page contient <div data-hc-contrats>, l'offre complète :
   onglets Gaz / Fioul / Adoucisseur, cartes BASIC / CONFORT / SÉCURITÉ, entretien annuel du
   chauffe-eau, et la modale de souscription — celle de la page Contrats, reprise telle quelle.

   Deux choses comptent ici :
   · les prix ne sont écrits nulle part. Ils viennent de `v_contract_offers`, la source que le
     back-office alimente. Le module ne crée donc aucune copie de l'offre ;
   · le balisage et la logique sont extraits de contrats-entretien.html sans retouche, pour que
     les deux pages rendent exactement pareil. La page Contrats basculera sur ce fichier lors de
     la migration : c'est l'étape que le contrôle veut valider avant toute suppression. */
(function () {
  'use strict';
  if (window.__hcContrats) return;
  window.__hcContrats = true;

  var SECTION = "<section class=\"ct-offers\" id=\"formules\" aria-labelledby=\"formulesTitle\">\n <div class=\"container\">\n <h2 class=\"ct-h2\" id=\"formulesTitle\">Nos formules</h2>\n\n <input type=\"radio\" name=\"energy\" id=\"en-gaz\" class=\"tab-radio\" checked>\n <input type=\"radio\" name=\"energy\" id=\"en-fioul\" class=\"tab-radio\">\n <input type=\"radio\" name=\"energy\" id=\"en-eau\" class=\"tab-radio\">\n\n <div class=\"energy-switch\" role=\"tablist\" aria-label=\"Type d'équipement\">\n <label for=\"en-gaz\" role=\"tab\">Gaz</label>\n <label for=\"en-fioul\" role=\"tab\">Fioul</label>\n <label for=\"en-eau\" role=\"tab\">Adoucisseur</label>\n </div>\n\n <div class=\"energy-content\" id=\"contractOffersRoot\">\n <div class=\"energy-pane\" id=\"pane-gaz\">\n <div class=\"formula-grid\"><div style=\"grid-column:1/-1;text-align:center;padding:48px 20px;color:#94a3b8;font-size:.92rem\">Chargement des formules…</div></div>\n </div>\n <div class=\"energy-pane\" id=\"pane-fioul\"><div class=\"formula-grid\"></div></div>\n <div class=\"energy-pane\" id=\"pane-eau\"><div class=\"formula-grid\"></div></div>\n </div>\n\n <div class=\"ecs-annuel\" data-hc-ecs hidden><div class=\"ecs-corps\"><span class=\"ecs-eyebrow\">Chauffe-eau &amp; cumulus</span><h3 class=\"ecs-titre\"></h3><p class=\"ecs-sub\"></p></div><div class=\"ecs-prix\"><div class=\"ecs-montant\"></div><div class=\"ecs-unite\">par an, et non par mois</div><button type=\"button\" class=\"formula-cta ecs-cta\">Souscrire</button></div></div>\n <p class=\"legal-strip\"><strong>Prix et conditions :</strong> prix TTC pour un particulier (TVA 10 %, logement de plus de 2 ans) ; pour un professionnel, TVA 20 % sur le montant HT indiqué sous chaque prix. Prélèvement mensuel en 12 fois. Contrat d'un an renouvelable tacitement (loi Chatel), résiliable à chaque échéance par lettre recommandée avec un préavis d'un mois. Signature après une visite technique. Révision tarifaire annuelle indexée sur l'indice BT01 (INSEE). Conformité : décret n° 2009-649 du 9 juin 2009 et arrêté du 15 septembre 2009.</p>\n </div>\n</section>";
  var MODALE = "<div id=\"souscriptionModal\" class=\"sous-modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"sousTitle\" style=\"position:fixed;inset:0;z-index:9999;display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto\">\n <div class=\"sous-backdrop\" onclick=\"closeSouscriptionModal()\" style=\"position:fixed;inset:0;background:rgba(10,20,40,.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)\"></div>\n\n <div class=\"sous-card\" style=\"position:relative;z-index:2;background:#fff;border-radius:20px;max-width:680px;width:100%;margin:20px auto;box-shadow:0 40px 90px rgba(10,20,40,.40);border:1px solid rgba(31,196,240,.20);overflow:hidden\">\n\n <!-- Header dégradé cyan -->\n <div style=\"position:relative;background:linear-gradient(135deg,#0DA0CF 0%,#1FC4F0 100%);color:#fff;padding:24px 28px\">\n <button type=\"button\" onclick=\"closeSouscriptionModal()\" aria-label=\"Fermer\" style=\"position:absolute;top:14px;right:14px;background:rgba(255,255,255,.18);border:0;width:34px;height:34px;border-radius:50%;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center\">\n <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>\n </button>\n <div style=\"display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.18);padding:5px 12px;border-radius:999px;font-size:.7rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase;margin-bottom:10px\">\n <svg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 11l3 3 8-8\"/><path d=\"M22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"/></svg>\n Souscription en ligne\n </div>\n <h3 id=\"sousTitle\" style=\"margin:0;font-size:1.4rem;font-weight:800;line-height:1.2\">Contrat <span id=\"sousType\">Gaz</span> — <span id=\"sousFormule\">CONFORT</span></h3>\n <p style=\"margin:6px 0 0;font-size:.92rem;color:rgba(255,255,255,.92);font-weight:500\">Tarif&nbsp;: <strong id=\"sousPrix\" style=\"color:#fff\">13 € HT/mois</strong> · Renseignez le formulaire et nous validons votre dossier sous 24h ouvrées.</p>\n </div>\n\n <!-- Form -->\n <form id=\"sousForm\" onsubmit=\"return submitSouscription(event)\" style=\"padding:24px 28px 28px\" novalidate>\n<input type=\"hidden\" name=\"form_type\" value=\"demande_metier\">\n <!-- Anti-bot honeypot — laisser vide -->\n <input type=\"text\" name=\"website\" tabindex=\"-1\" autocomplete=\"off\" aria-hidden=\"true\" style=\"position:absolute;left:-9999px;width:1px;height:1px;opacity:0\" value=\"\">\n <input type=\"hidden\" name=\"energie\" id=\"f-energie\">\n <input type=\"hidden\" name=\"formule\" id=\"f-formule\">\n <input type=\"hidden\" name=\"prix\" id=\"f-prix\">\n\n <!-- Champ caché agence -->\n <input type=\"hidden\" name=\"agence\" id=\"f-agence\" value=\"Saint-Omer\">\n\n <!-- ═══ BARRE DE PROGRESSION ═══ -->\n <div class=\"sw-progress\" aria-hidden=\"true\">\n <div class=\"sw-progress-track\">\n <div class=\"sw-progress-fill\" id=\"swProgressFill\" style=\"width:20%\"></div>\n </div>\n <div class=\"sw-progress-steps\">\n <div class=\"sw-pstep is-active\" data-pstep=\"1\"><span class=\"sw-pstep-circle\">1</span><span class=\"sw-pstep-lbl\">Coords</span></div>\n <div class=\"sw-pstep\" data-pstep=\"2\"><span class=\"sw-pstep-circle\">2</span><span class=\"sw-pstep-lbl\">Adresse</span></div>\n <div class=\"sw-pstep\" data-pstep=\"3\"><span class=\"sw-pstep-circle\">3</span><span class=\"sw-pstep-lbl\">Logement</span></div>\n <div class=\"sw-pstep\" data-pstep=\"4\"><span class=\"sw-pstep-circle\">4</span><span class=\"sw-pstep-lbl\">Équipement</span></div>\n <div class=\"sw-pstep\" data-pstep=\"5\"><span class=\"sw-pstep-circle\">5</span><span class=\"sw-pstep-lbl\">Prélèvement</span></div>\n <div class=\"sw-pstep\" data-pstep=\"6\"><span class=\"sw-pstep-circle\">6</span><span class=\"sw-pstep-lbl\">Envoyer</span></div>\n </div>\n </div>\n\n <!-- ═══════════ ÉTAPE 1 — Coordonnées ═══════════ -->\n <div class=\"sous-step is-active\" data-step=\"1\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Vos coordonnées</h4>\n <p class=\"sw-step-hint\">Pour vous rappeler sous 24h ouvrées et envoyer votre contrat.</p>\n </div>\n <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px\">\n <input aria-label=\"Prénom\" type=\"text\" name=\"prenom\" placeholder=\"Prénom *\" required class=\"sous-inp\" data-validate=\"required\">\n <input aria-label=\"Nom\" type=\"text\" name=\"nom\" placeholder=\"Nom *\" required class=\"sous-inp\" data-validate=\"required\">\n </div>\n <input aria-label=\"Email\" type=\"email\" name=\"email\" placeholder=\"Email *\" required class=\"sous-inp\" style=\"margin-bottom:10px\" data-validate=\"email\">\n <input aria-label=\"Téléphone\" type=\"tel\" name=\"telephone\" placeholder=\"Téléphone *\" required class=\"sous-inp\" data-validate=\"tel\" pattern=\"[0-9 +.\\-]{10,}\" autocomplete=\"tel\">\n </div>\n\n <!-- ═══════════ ÉTAPE 2 — Adresse ═══════════ -->\n <div class=\"sous-step\" data-step=\"2\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Adresse de l'installation</h4>\n <p class=\"sw-step-hint\">Commencez à taper votre adresse, on vous propose la liste.</p>\n </div>\n\n <div id=\"agency-detected\" style=\"display:none;margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,rgba(31,196,240,.10),rgba(31,196,240,.04));border:1px solid rgba(31,196,240,.30);border-radius:12px;align-items:center;gap:10px;font-size:.88rem\">\n <div style=\"width:36px;height:36px;border-radius:10px;background:#1FC4F0;display:flex;align-items:center;justify-content:center;flex-shrink:0\">\n <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>\n </div>\n <div style=\"flex:1;line-height:1.3\">\n <div style=\"font-size:.7rem;color:#0DA0CF;font-weight:800;letter-spacing:1px;text-transform:uppercase\">Agence rattachée à votre adresse</div>\n <div style=\"color:#0A1428;font-weight:700;font-size:.98rem;margin-top:2px\"><span id=\"agency-name\">Saint-Omer</span> · <span id=\"agency-zone\" style=\"color:#64748b;font-weight:500\">Pas-de-Calais 62</span></div>\n </div>\n </div>\n\n <div class=\"sous-addr-wrap\" style=\"position:relative;margin-bottom:10px\">\n <input type=\"text\" id=\"sousAdresse\" name=\"adresse\" placeholder=\"N°, rue *\" required class=\"sous-inp\" autocomplete=\"off\" data-validate=\"required\" aria-label=\"Adresse\">\n <div id=\"sousAdresseList\" class=\"sous-addr-list\" role=\"listbox\" hidden></div>\n </div>\n <div style=\"display:grid;grid-template-columns:120px 1fr;gap:10px\">\n <input type=\"text\" id=\"sousCp\" name=\"cp\" placeholder=\"Code postal *\" required class=\"sous-inp\" pattern=\"[0-9]{5}\" maxlength=\"5\" data-validate=\"cp\" aria-label=\"Code postal\">\n <input type=\"text\" id=\"sousVille\" name=\"ville\" placeholder=\"Ville *\" required class=\"sous-inp\" data-validate=\"required\" aria-label=\"Ville\">\n </div>\n </div>\n\n <!-- ═══════════ ÉTAPE 3 — Logement ═══════════ -->\n <div class=\"sous-step\" data-step=\"3\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Votre logement</h4>\n <p class=\"sw-step-hint\">Quelques informations sur le bien à entretenir.</p>\n </div>\n <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px\">\n <select aria-label=\"type_logement\" name=\"type_logement\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">Type de logement *</option>\n <option>Maison individuelle</option>\n <option>Appartement</option>\n <option>Local commercial / pro</option>\n </select>\n <select aria-label=\"statut\" name=\"statut\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">Statut *</option>\n <option>Propriétaire occupant</option>\n <option>Propriétaire bailleur</option>\n <option>Locataire (autorisé par le propriétaire)</option>\n <option>Syndic / copropriété</option>\n </select>\n </div>\n </div>\n\n <!-- ═══════════ ÉTAPE 4 — Équipement (sélecteurs intelligents + photo) ═══════════ -->\n <div class=\"sous-step\" data-step=\"4\" id=\"f-equipement-block\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Votre équipement</h4>\n <p class=\"sw-step-hint\">Ces infos nous aident à préparer votre intervention. Les champs marqués <strong>*</strong> sont obligatoires. <strong>Les photos sont facultatives</strong> — elles nous font gagner du temps si vous les avez.</p>\n </div>\n\n <!-- Aide visuelle : où trouver les infos -->\n <details class=\"sw-help\">\n <summary>\n <span class=\"sw-help-icon\">\n <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/></svg>\n </span>\n <span class=\"sw-help-text\">Où trouver ces informations&nbsp;?</span>\n <span class=\"sw-help-chevron\">▾</span>\n </summary>\n <div class=\"sw-help-body\">\n <div class=\"sw-help-illust\" aria-hidden=\"true\">\n <svg viewBox=\"0 0 240 160\" width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\">\n <rect x=\"50\" y=\"20\" width=\"140\" height=\"120\" rx=\"8\" fill=\"#F1F5F9\" stroke=\"#94A3B8\" stroke-width=\"2\"/>\n <rect x=\"62\" y=\"32\" width=\"116\" height=\"14\" rx=\"3\" fill=\"#0DA0CF\" opacity=\".15\"/>\n <text x=\"120\" y=\"42\" text-anchor=\"middle\" font-family=\"Inter, Arial\" font-size=\"9\" font-weight=\"700\" fill=\"#0DA0CF\">SAUNIER DUVAL</text>\n <rect x=\"62\" y=\"52\" width=\"116\" height=\"78\" rx=\"3\" fill=\"#fff\" stroke=\"#CBD5E1\"/>\n <line x1=\"68\" y1=\"64\" x2=\"172\" y2=\"64\" stroke=\"#E5E7EB\"/>\n <text x=\"72\" y=\"62\" font-family=\"Inter, Arial\" font-size=\"6.5\" fill=\"#64748B\">Modèle&nbsp;:</text>\n <text x=\"170\" y=\"62\" text-anchor=\"end\" font-family=\"Inter, Arial\" font-size=\"7\" font-weight=\"700\" fill=\"#0A1428\">THEMA C 25</text>\n <line x1=\"68\" y1=\"76\" x2=\"172\" y2=\"76\" stroke=\"#E5E7EB\"/>\n <text x=\"72\" y=\"74\" font-family=\"Inter, Arial\" font-size=\"6.5\" fill=\"#64748B\">N° série&nbsp;:</text>\n <text x=\"170\" y=\"74\" text-anchor=\"end\" font-family=\"Inter, Arial\" font-size=\"7\" fill=\"#0A1428\">7821-XX</text>\n <line x1=\"68\" y1=\"88\" x2=\"172\" y2=\"88\" stroke=\"#E5E7EB\"/>\n <text x=\"72\" y=\"86\" font-family=\"Inter, Arial\" font-size=\"6.5\" fill=\"#64748B\">Année&nbsp;:</text>\n <text x=\"170\" y=\"86\" text-anchor=\"end\" font-family=\"Inter, Arial\" font-size=\"7\" font-weight=\"700\" fill=\"#FF6B1A\">2019</text>\n <line x1=\"68\" y1=\"100\" x2=\"172\" y2=\"100\" stroke=\"#E5E7EB\"/>\n <text x=\"72\" y=\"98\" font-family=\"Inter, Arial\" font-size=\"6.5\" fill=\"#64748B\">Puissance&nbsp;:</text>\n <text x=\"170\" y=\"98\" text-anchor=\"end\" font-family=\"Inter, Arial\" font-size=\"7\" fill=\"#0A1428\">24 kW</text>\n <circle cx=\"195\" cy=\"55\" r=\"14\" fill=\"#FF6B1A\" opacity=\".18\"/>\n <circle cx=\"195\" cy=\"55\" r=\"9\" fill=\"#FF6B1A\"/>\n <text x=\"195\" y=\"58\" text-anchor=\"middle\" font-family=\"Inter, Arial\" font-size=\"9\" font-weight=\"900\" fill=\"#fff\">!</text>\n <path d=\"M180 55 Q195 75 215 70\" stroke=\"#FF6B1A\" stroke-width=\"1.8\" fill=\"none\" stroke-dasharray=\"3 3\"/>\n </svg>\n </div>\n <ul class=\"sw-help-list\">\n <li><strong>Étiquette signalétique</strong> — généralement collée sur le côté ou sous la chaudière / le ballon. Vous y trouverez la marque, le modèle, le numéro de série et l'année de fabrication.</li>\n <li><strong>Carnet d'entretien</strong> — votre dernier rapport d'intervention indique aussi toutes ces informations.</li>\n <li><strong>Facture d'achat ou d'installation</strong> — la facture du constructeur ou de l'installateur d'origine.</li>\n <li>👉 Si vous ne trouvez pas, <strong>passez à l'étape suivante</strong> : notre technicien relèvera tout lors de la 1ʳᵉ visite.</li>\n </ul>\n </div>\n </details>\n\n <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px\">\n <select name=\"marque\" id=\"eqMarque\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">Marque de votre chaudière *</option>\n <option>Acleis</option>\n <option>Atlantic</option>\n <option>Auer</option>\n <option>Bosch / Junkers</option>\n <option>Brötje</option>\n <option>Buderus</option>\n <option>Chaffoteaux</option>\n <option>Chappée</option>\n <option>Cuenod</option>\n <option>De Dietrich</option>\n <option>Elco</option>\n <option>ELM Leblanc</option>\n <option>Ferroli</option>\n <option>Franco Belge</option>\n <option>Frisquet</option>\n <option>Geminox</option>\n <option>Idéal Standard</option>\n <option>Immergas</option>\n <option>Oertli</option>\n <option>Radiant</option>\n <option>Riello</option>\n <option>Saunier Duval</option>\n <option>Sime</option>\n <option>Tifell</option>\n <option>Unical</option>\n <option>Vaillant</option>\n <option>Viessmann</option>\n <option>Weishaupt</option>\n <option>Wolf</option>\n <option>Zaegel-Held</option>\n <option disabled>──────────</option>\n <option>Autre / Je ne sais pas</option>\n </select>\n <select name=\"modele\" id=\"eqModele\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">Modèle * (sélectionnez d'abord la marque)</option>\n </select>\n </div>\n <!-- Année d'installation : SELECT + zone texte libre -->\n <div class=\"sw-date-block\">\n <label class=\"sw-date-label\">Année d'installation *</label>\n <div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px\">\n <select name=\"annee\" id=\"eqAnnee\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">— Choisir l'année —</option>\n <option>2026</option><option>2025</option><option>2024</option><option>2023</option>\n <option>2022</option><option>2021</option><option>2020</option><option>2019</option>\n <option>2018</option><option>2017</option><option>2016</option><option>2015</option>\n <option>2014</option><option>2013</option><option>2012</option><option>2011</option>\n <option>2010</option><option>2005-2009</option><option>2000-2004</option>\n <option>1995-1999</option><option>1990-1994</option><option>Avant 1990</option>\n <option disabled>──────────</option>\n <option>Je ne sais pas</option>\n </select>\n <input aria-label=\"Préciser (facultatif)\" type=\"text\" name=\"annee_precision\" placeholder=\"Préciser (facultatif)\" class=\"sous-inp\">\n </div>\n </div>\n\n <!-- Dernier entretien : SELECT mois + SELECT année + zone texte -->\n <div class=\"sw-date-block\" style=\"margin-top:14px\">\n <label class=\"sw-date-label\">Dernier entretien *</label>\n <div style=\"display:grid;grid-template-columns:1.2fr 1fr 1.4fr;gap:10px\">\n <select name=\"dernier_entretien_mois\" id=\"eqEntretienMois\" class=\"sous-inp\">\n <option value=\"\">— Mois —</option>\n <option value=\"01\">Janvier</option><option value=\"02\">Février</option>\n <option value=\"03\">Mars</option><option value=\"04\">Avril</option>\n <option value=\"05\">Mai</option><option value=\"06\">Juin</option>\n <option value=\"07\">Juillet</option><option value=\"08\">Août</option>\n <option value=\"09\">Septembre</option><option value=\"10\">Octobre</option>\n <option value=\"11\">Novembre</option><option value=\"12\">Décembre</option>\n </select>\n <select name=\"dernier_entretien_annee\" id=\"eqEntretienAnnee\" required class=\"sous-inp\" data-validate=\"required\">\n <option value=\"\">— Année —</option>\n <option>2026</option><option>2025</option><option>2024</option><option>2023</option>\n <option>2022</option><option>2021</option><option>Avant 2021</option>\n <option disabled>──────────</option>\n <option>Jamais entretenu</option>\n <option>Je ne sais pas</option>\n </select>\n <input type=\"text\" name=\"dernier_entretien\" id=\"eqEntretienTexte\" placeholder=\"Précisions (facultatif)\" class=\"sous-inp\" aria-label=\"Précisions (facultatif)\">\n </div>\n </div>\n\n  </div>\n\n <!-- ═══════════ ÉTAPE 5 — Prélèvement (principe SEPA) et visite technique ═══════════ -->\n <div class=\"sous-step\" data-step=\"5\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Prélèvement et visite technique</h4>\n <p class=\"sw-step-hint\">Rien à téléverser : le prélèvement se met en place après la visite technique.</p>\n </div>\n\n <!-- Bandeau visite obligatoire -->\n <div class=\"sw-info-box\">\n <div class=\"sw-info-icon\">\n <svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/></svg>\n </div>\n <div class=\"sw-info-text\">\n <strong>Important — Visite technique obligatoire</strong>\n <span>Avant la <strong>signature définitive</strong> du contrat, un technicien HELP Confort se déplace gratuitement chez vous pour valider l'état de votre installation. Cette visite ne vous engage à rien — vous pouvez encore renoncer après.</span>\n </div>\n </div>\n\n  <!-- RIB : demandé avec le mandat SEPA après la visite technique (rien à téléverser ici) -->\n <div class=\"sw-doc-row\">\n <div class=\"sw-doc-head\">\n <span class=\"sw-doc-num\">1</span>\n <div>\n <strong class=\"sw-doc-title\">Votre RIB : rien à envoyer maintenant</strong>\n <span class=\"sw-doc-hint\">Vos coordonnées bancaires vous seront demandées avec le mandat SEPA, après la visite technique, pour la signature du contrat.</span>\n </div>\n </div>\n </div>\n\n <!-- Mandat SEPA - signature en ligne ou téléchargement -->\n <div class=\"sw-doc-row\">\n <div class=\"sw-doc-head\">\n <span class=\"sw-doc-num\">2</span>\n <div>\n <strong class=\"sw-doc-title\">Mandat SEPA <span class=\"sw-doc-opt\">(signé après visite technique)</span></strong>\n <span class=\"sw-doc-hint\">Vous acceptez le principe du prélèvement automatique. Le mandat SEPA officiel vous sera transmis par email <strong>après la visite technique</strong>, à signer électroniquement (DocuSign / Yousign).</span>\n </div>\n </div>\n <label class=\"sw-doc-checkbox\">\n <input type=\"checkbox\" name=\"sepa_principe\" required data-validate=\"checked\">\n <span>J'accepte le principe du prélèvement SEPA (signature ferme après visite technique uniquement).</span>\n </label>\n </div>\n\n </div>\n\n <!-- ═══════════ ÉTAPE 6 — Récapitulatif + acceptation finale ═══════════ -->\n <div class=\"sous-step\" data-step=\"6\">\n <div class=\"sw-intro\">\n <h4 class=\"sw-step-title\">Récapitulatif &amp; envoi</h4>\n <p class=\"sw-step-hint\">Vérifiez les informations puis envoyez votre demande. Un conseiller vous rappelle sous 24h ouvrées pour planifier la visite technique.</p>\n </div>\n\n <!-- Récap rapide -->\n <div class=\"sw-recap\" id=\"swRecap\" aria-live=\"polite\"></div>\n\n <!-- Champ \"Quand commencer ?\" optionnel + commentaire libre -->\n <details class=\"sw-optional-block\" style=\"margin-top:16px;background:#F7FBFD;border:1px dashed #CBD5E1;border-radius:12px\">\n <summary style=\"padding:12px 16px;cursor:pointer;font-size:.88rem;font-weight:700;color:#0DA0CF;list-style:none;display:flex;align-items:center;gap:8px\">\n <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"9 18 15 12 9 6\"/></svg>\n Ajouter des précisions <span style=\"color:#94A3B8;font-weight:500;font-style:italic\">(facultatif)</span>\n </summary>\n <div style=\"padding:0 16px 14px\">\n <input aria-label=\"Date de début souhaitée (ex : 1er du mois prochain)\" type=\"text\" name=\"date_debut\" placeholder=\"Date de début souhaitée (ex : 1er du mois prochain)\" class=\"sous-inp\" style=\"margin-bottom:10px\">\n <textarea aria-label=\"Accessibilité, horaires, contraintes spécifiques…\" name=\"commentaire\" placeholder=\"Accessibilité, horaires, contraintes spécifiques…\" rows=\"2\" class=\"sous-inp\" style=\"resize:vertical;min-height:60px\"></textarea>\n </div>\n </details>\n\n <!-- CGV : encadré attractif avec animation pulse pour montrer où cliquer -->\n <label class=\"sw-cgv-box\" style=\"display:flex;align-items:flex-start;gap:12px;margin:18px 0 6px;padding:14px 16px;background:linear-gradient(135deg,rgba(13,160,207,.06),rgba(255,107,26,.04));border:2px solid rgba(13,160,207,.30);border-radius:12px;font-size:.88rem;color:#0A1428;line-height:1.5;cursor:pointer;transition:all .25s ease;position:relative;animation:swCgvPulse 2.4s ease-in-out infinite\">\n <input type=\"checkbox\" name=\"cgv\" required style=\"margin-top:3px;flex-shrink:0;width:20px;height:20px;accent-color:#1FC4F0;cursor:pointer\" data-validate=\"checked\">\n <span>J'accepte d'être contacté(e) sous 24h ouvrées pour finaliser mon contrat. Je reconnais que ce formulaire constitue une <strong>demande de souscription</strong>, non un engagement définitif. La signature ferme du contrat aura lieu <strong>après la visite technique gratuite</strong>. <strong style=\"color:#E11D48\">*</strong></span>\n <span class=\"sw-cgv-hint\" aria-hidden=\"true\" style=\"position:absolute;top:-12px;right:14px;background:#0DA0CF;color:#fff;padding:3px 10px;border-radius:999px;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 4px 10px rgba(13,160,207,.32);white-space:nowrap;animation:swCgvArrow 1.8s ease-in-out infinite\">👇 Cliquez ici pour valider</span>\n </label>\n <style>\n @keyframes swCgvPulse {\n 0%, 100% { box-shadow: 0 0 0 0 rgba(13,160,207,.20); }\n 50% { box-shadow: 0 0 0 6px rgba(13,160,207,0); }\n }\n @keyframes swCgvArrow {\n 0%, 100% { transform: translateY(0); }\n 50% { transform: translateY(-3px); }\n }\n /* Une fois cochée, on enlève l'animation et la flèche disparaît */.sw-cgv-box:has(input:checked) { animation: none; border-color: #16A34A; background: linear-gradient(135deg, rgba(34,197,94,.08), rgba(34,197,94,.02)); }.sw-cgv-box:has(input:checked) .sw-cgv-hint { display: none; }\n </style>\n </div>\n\n <!-- ═══ ZONE NAVIGATION + ERREURS ═══ -->\n <div id=\"swError\" class=\"sw-error\" hidden></div>\n\n <div class=\"sw-nav\">\n <button type=\"button\" class=\"sw-btn sw-btn-prev\" id=\"swPrev\" hidden>\n <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"15 18 9 12 15 6\"/></svg>\n Précédent\n </button>\n <div class=\"sw-step-counter\" id=\"swCounter\">Étape 1 sur 5</div>\n <button type=\"button\" class=\"sw-btn sw-btn-next\" id=\"swNext\">\n Suivant\n <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"9 18 15 12 9 6\"/></svg>\n </button>\n <button type=\"submit\" class=\"sw-btn sw-btn-submit\" id=\"swSubmit\" hidden>\n <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"9 11 12 14 22 4\"/><path d=\"M22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"/></svg>\n Envoyer ma demande\n </button>\n </div>\n\n <p style=\"margin:14px 0 0;font-size:.78rem;color:#64748b;text-align:center;line-height:1.5\">\n 🛡️ Vos données restent confidentielles. Aucun engagement ni paiement à ce stade — un conseiller vous rappelle pour finaliser.\n </p>\n </form>\n </div>\n</div>";

  function monter() {
    var hote = document.querySelector('[data-hc-contrats]');
    if (!hote || hote.dataset.hcContratsMonte) return;
    hote.dataset.hcContratsMonte = '1';
    hote.innerHTML = SECTION;
    if (!document.getElementById('souscriptionModal')) {
      var h = document.createElement('div');
      h.innerHTML = MODALE;
      while (h.firstChild) document.body.appendChild(h.firstChild);
    }
    avecSupabase(demarrer);
  }

  /* La page Contrats charge le client Supabase par une balise à elle. Une page métier n'a pas de
     raison de le faire : le module s'en occupe, et ne le charge qu'une fois, seulement s'il manque. */
  function avecSupabase(suite) {
    if (window.supabase) return suite();
    var s = document.querySelector('script[data-hc-supabase]');
    if (!s) {
      s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.defer = true;
      s.setAttribute('data-hc-supabase', '1');
      document.head.appendChild(s);
    }
    s.addEventListener('load', suite);
    s.addEventListener('error', function () {
      var g = document.querySelector('[data-hc-contrats] .formula-grid');
      if (g) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#64748b">Les formules n\'ont pas pu être chargées. <a href="/contrats-entretien.html">Voir la page Contrats</a>.</div>';
    });
  }

  function demarrer() {
    var _exposer = exposer;
    (async function loadContractOffers() {
     const SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
     const SUPABASE_ANON = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
     if (!window.supabase) return;
     const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    
     const { data: offers, error } = await sb.from('v_contract_offers').select('*');
     if (error || !offers) {
     console.error('[contract_offers] load error:', error);
     return; // garde le fallback "Chargement…" si pas accessible
     }
    
     // Pas d'offres en DB : laisse les panes vides
     if (offers.length === 0) {
     document.querySelectorAll('.energy-pane.formula-grid').forEach(g => {
     g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#94a3b8">Offres en cours de configuration.</div>';
     });
     return;
     }
    
     const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
     // On autorise <strong> dans les features (déjà encodé en jsonb) → on encode tout sauf <strong>...</strong>
     function safeFeature(text) {
     return String(text || '').replace(/<(?!\/?strong>)/g, '&lt;');
     }
    
     // Group by energy
     const byEnergy = { gaz: [], fioul: [], adoucisseur: [] };
     offers.forEach(o => {
     if (byEnergy[o.energy]) byEnergy[o.energy].push(o);
     });
    
     // Map energy → pane DOM id
     const PANE_ID = { gaz: 'pane-gaz', fioul: 'pane-fioul', adoucisseur: 'pane-eau' };
    
     Object.keys(byEnergy).forEach(energyKey => {
     const list = byEnergy[energyKey];
     const pane = document.getElementById(PANE_ID[energyKey]);
     if (!pane) return;
     const grid = pane.querySelector('.formula-grid');
     if (!grid) return;
    
     // Adoucisseur : 1 seule colonne large
     if (energyKey === 'adoucisseur') {
     grid.style.gridTemplateColumns = '1fr';
     grid.style.maxWidth = '680px';
     }
    
     grid.innerHTML = list.map(o => {
     const featuresArr = Array.isArray(o.features) ? o.features : [];
     const featuresHtml = featuresArr.map(f =>
     `<li class="${f.included === false ? 'no' : 'yes'}"><span>${safeFeature(f.text)}</span></li>`
     ).join('');
     const fmt = n => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 });
     const fromPrice = !!o.price_label && /partir/i.test(o.price_label);
     // Montant insécable en grand, « TTC / mois » en petit (peut passer à la ligne sur carte étroite)
     const priceStr = (o.price_label && !fromPrice) ? escapeHtml(o.price_label) : `${fromPrice ? '<small>à partir de </small>' : ''}<span class="formula-amount">${fmt(o.price_ttc_month)}&nbsp;€</span>`;
     const yearStr = `<div class="formula-price-ht">soit ${fmt(o.price_ht_month)} € HT par mois${o.price_label ? ' · tarif selon modèle et volume' : ''}</div>`;
     // Tier → classe CSS pour styler la card
     const tierClass = { basic:'basic', confort:'confort', securite:'securite', custom:'confort' }[o.tier] || 'basic';
     const dataPrix = `${fromPrice ? 'à partir de ' : ''}${fmt(o.price_ttc_month)} € TTC/mois (${fmt(o.price_ht_month)} € HT)`;
    
     return `
     <div class="formula-card ${tierClass}"${o.is_recommended && energyKey==='adoucisseur' ? ' style="border-color:#1FC4F0"' : ''}>
     ${o.badge ? `<span class="formula-badge">${escapeHtml(o.badge)}</span>` : ''}
     <div class="formula-eyebrow">Formule ${escapeHtml(o.energy_label)}</div>
     <h2 class="formula-name">${escapeHtml(o.tier_label)}</h2>
     <div class="formula-price-block">
     <div class="formula-price">${priceStr}<small> TTC / mois</small></div>
     ${yearStr}
     </div>
     <p class="formula-baseline">${escapeHtml(o.baseline || '')}</p>
     <ul class="formula-list">${featuresHtml}</ul>
     ${o.legal_note ? `<small class="formula-note">${escapeHtml(o.legal_note)}</small>` : ''}
     <button type="button" class="formula-cta" data-hc-cta="contrats_souscrire_${escapeHtml(o.slug || '')}"
     data-energie="${escapeHtml(o.energy_label)}"
     data-formule="${escapeHtml(o.tier_label)}"
     data-prix="${escapeHtml(dataPrix)}"
     onclick="openSouscriptionModal(this)">${escapeHtml(o.cta_label || 'Souscrire')}</button>
     </div>`;
     }).join('');
     });
    })();
    // ===== Modal souscription contrat =====
     function openSouscriptionModal(btn){
     var modal = document.getElementById('souscriptionModal');
     var energie = btn.getAttribute('data-energie') || 'Gaz';
     var formule = btn.getAttribute('data-formule') || 'CONFORT';
     var prix = btn.getAttribute('data-prix') || '';
    
     document.getElementById('sousType').textContent = energie;
     document.getElementById('sousFormule').textContent = formule;
     document.getElementById('sousPrix').textContent = prix;
    
     document.getElementById('f-energie').value = energie;
     document.getElementById('f-formule').value = formule;
     document.getElementById('f-prix').value = prix;
    
     // Pour l'adoucisseur on cache le bloc "Marque/modèle chaudière" et on le renomme
     var equipBlock = document.getElementById('f-equipement-block');
     var heading = equipBlock.querySelector('h4');
     if (energie.toLowerCase().includes('adoucisseur')){
     heading.lastChild && (heading.lastChild.textContent = ' Votre adoucisseur');
     } else {
     heading.lastChild && (heading.lastChild.textContent = ' Votre équipement');
     }
    
     modal.classList.add('open');
     document.body.style.overflow = 'hidden';
     try { document.dispatchEvent(new CustomEvent('hc:funnel-start', { detail: { entry: 'contrat', energie: energie, formule: formule } })); } catch (_) {}
     }
    
     function closeSouscriptionModal(){
     document.getElementById('souscriptionModal').classList.remove('open');
     document.body.style.overflow = '';
     }
    
     // ===== Agence du dossier =====
     // Une seule agence : HELP Confort Saint-Omer (intervient aussi dans le Nord, dont Dunkerque).
     function detectAgency(cp){
     return {name:'Saint-Omer', zone:'Saint-Omer et Côte d’Opale', email:'saint-omer@helpconfort.com'};
     }
    
     // Bind le listener sur l'input CP au chargement
     document.addEventListener('DOMContentLoaded', function(){
     var cpInput = document.querySelector('input[name="cp"]');
     if (!cpInput) return;
     cpInput.addEventListener('input', function(){
     var agency = detectAgency(this.value);
     document.getElementById('f-agence').value = agency.name;
     document.getElementById('agency-name').textContent = agency.name;
     document.getElementById('agency-zone').textContent = agency.zone;
     // Affiche la pastille uniquement si CP a au moins 2 chiffres
     var pill = document.getElementById('agency-detected');
     if (this.value.length >= 2){
     pill.style.display = 'flex';
     } else {
     pill.style.display = 'none';
     }
     });
     });
    
     // ESC ferme
     document.addEventListener('keydown', function(e){
     if (e.key === 'Escape'){
     var m = document.getElementById('souscriptionModal');
     if (m && m.classList.contains('open')) closeSouscriptionModal();
     }
     });
    
     async function submitSouscription(e){
     e.preventDefault();
     var form = e.target;
     var data = new FormData(form);
    
     // ⚠️ Détection automatique de l'agence basée sur le CP saisi
     var cp = data.get('cp') || '';
     var agency = detectAgency(cp);
     var agence = agency.name;
     data.set('agence', agence);
    
     var energie = data.get('energie') || 'gaz';
     var formule = data.get('formule') || 'CONFORT';
     var prix = data.get('prix') || '';
    
     // Désactive le bouton submit
     var btn = form.querySelector('button[type="submit"]');
     var btnOriginalHTML = btn ? btn.innerHTML : '';
     if (btn) { btn.disabled = true; btn.innerHTML = 'Envoi en cours…'; btn.style.opacity = '.7'; }
    
     // ── 1. Soumission de la demande de contrat (voie serveur sûre submit-lead-v6) ───
     try {
    
     // Mapping formule → tier DB
     var tier = formule.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
     if (!['basic','confort','securite','custom'].includes(tier)) tier = 'custom';
    
     // Voie serveur sûre : soumission via l'edge submit-lead-v6 (service_role côté serveur,
     // anon-callable). AUCUN INSERT anon direct sur `contracts` (bloqué par RLS, à juste titre).
     // La création de la row dédiée `contracts` = GATE serveur documentée (docs/control : CONTRACT_RLS_FIX).
     var leadPayload = {
       prenom: data.get('prenom') || null, nom: data.get('nom') || 'Sans nom',
       telephone: data.get('telephone') || '', email: data.get('email') || null,
       adresse: data.get('adresse') || null, code_postal: cp || null, ville: data.get('ville') || null,
       metier: 'chauffage', type_demande: 'contrat_entretien', form_type: 'demande_metier',
       message: [ 'DEMANDE DE CONTRAT ENTRETIEN',
         '- Énergie : ' + energie, '- Formule : ' + formule + (prix ? (' (' + prix + ')') : ''),
         '- Agence : ' + agence, '- Logement : ' + (data.get('type_logement')||'—') + ' / ' + (data.get('statut')||'—'),
         '- Équipement : ' + (data.get('marque')||'—') + ' ' + (data.get('modele')||'') + ' (' + (data.get('annee')||'—') + ')',
         '- Dernier entretien : ' + (data.get('dernier_entretien_annee')||data.get('dernier_entretien')||'—'),
         '- Début souhaité : ' + (data.get('date_debut')||'—'),
         '- RIB : à fournir avec le mandat SEPA, après la visite technique',
         '- Accord principe SEPA : ' + (data.get('sepa_principe') ? 'oui' : 'non') ]
         .concat(data.get('commentaire') ? ['- Commentaire : ' + data.get('commentaire')] : []).join('\n'),
       source: 'contrat_souscription', source_page: location.href,
       utm: { energie: energie, formule: formule, prix: prix, tier: tier, wizard_tags: ['contrat-entretien', energie, tier], attribution: (function () {
         // Provenance des campagnes (UTM, gclid, fbclid : mémorisés seulement après consentement) + page d'atterrissage. Aucune donnée personnelle.
         var u = {}, out = { landing: 'contrats-entretien' };
         try { u = JSON.parse(sessionStorage.getItem('hc_utm') || '{}') || {}; } catch (_) { u = {}; }
         ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', '_first_landing'].forEach(function (k) { if (u[k]) out[k.replace(/^_/, '')] = String(u[k]).slice(0, 200); });
         try { var r = sessionStorage.getItem('hc_referrer'); if (r) out.referrer = String(r).slice(0, 300); } catch (_) {}
         return out;
       })() }
     };
     var resp = await fetch('https://btcbjwqiivhpwoszomhg.supabase.co/functions/v1/submit-lead-v6', { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true, body: JSON.stringify(leadPayload) });
     if (!resp.ok) { throw new Error('Envoi impossible' + (resp.status ? (' (code ' + resp.status + ')') : '')); }
     var respData = await resp.json().catch(function(){ return {}; });
    
     // ── 2. Notification : submit-lead-v6 déclenche déjà notify-lead-v6 côté serveur. ──
     try { document.dispatchEvent(new CustomEvent('hc:lead-sent', { detail: { type: 'contrat_entretien', form_type: 'demande_metier', energie: energie, formule: formule } })); } catch (_) {}
    
     // ── 3. Confirmation visuelle ───────────────────────────────────────
     var card = document.querySelector('.sous-card');
     card.innerHTML = '<div style="padding:60px 32px;text-align:center"><div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#22A06B,#16a34a);margin:0 auto 22px;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 32px rgba(34,160,107,.30)"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h3 style="margin:0 0 12px;color:#0A1428;font-size:1.4rem;font-weight:800">✅ Demande enregistrée !</h3><p style="margin:0 0 20px;color:#475569;line-height:1.55">Votre demande de souscription <strong>' + energie + ' ' + formule + '</strong> est bien arrivée à l\'agence <strong>' + agence + '</strong>.<br><br>Un conseiller vous rappelle au <strong>' + (data.get('telephone') || '') + '</strong> sous <strong>24h ouvrées</strong> pour finaliser votre contrat.</p><button type="button" onclick="closeSouscriptionModal();location.reload()" style="background:#0A1428;color:#fff;border:0;padding:11px 24px;border-radius:10px;font-weight:700;cursor:pointer;font-size:.92rem;font-family:inherit">Fermer</button></div>';
    
     } catch (err) {
     console.error('[souscription] error:', err);
     if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalHTML; btn.style.opacity = ''; }
     var errBox = form.querySelector('[data-form-error]');
     if (!errBox) {
     errBox = document.createElement('div');
     errBox.dataset.formError = '1';
     errBox.style.cssText = 'margin-top:14px;padding:11px 14px;background:rgba(217,45,32,.08);border-left:3px solid #d92d20;border-radius:8px;color:#9F0E2B;font-size:.86rem';
     form.appendChild(errBox);
     }
     errBox.innerHTML = '❌ Une erreur est survenue : ' + (err.message || 'inconnue') + '<br>Vous pouvez réessayer ou nous appeler au <a href="tel:+33366100134" style="color:#0DA0CF;font-weight:700">03 66 10 01 34</a>.';
     }
    
     return false;
     }
    chauffeEau();
    _exposer('openSouscriptionModal', openSouscriptionModal);
    _exposer('closeSouscriptionModal', closeSouscriptionModal);
  }

  /* L'entretien du chauffe-eau n'est pas un contrat mensuel : c'est une visite annuelle, facturée
     à l'année. Le confondre avec les mensualités serait une promesse fausse. Il est donc affiché
     à part, avec son unité écrite en toutes lettres, et son prix vient de la même source publique
     que le catalogue — pas d'un chiffre recopié ici. */
  function chauffeEau() {
    var hote = document.querySelector('[data-hc-ecs]');
    if (!hote) return;
    var URL = 'https://btcbjwqiivhpwoszomhg.supabase.co/rest/v1/v_services_public'
      + '?select=name,short_desc,price_ttc,requires_quote&slug=eq.contrat-entretien-chauffe-eau';
    var cle = (document.querySelector('[data-hc-sb-key]') || {}).dataset;
    fetch(URL, { headers: { apikey: 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2' } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (l) {
        var s = l && l[0];
        if (!s || s.requires_quote || !s.price_ttc) return;
        hote.querySelector('.ecs-titre').textContent = s.name;
        hote.querySelector('.ecs-sub').textContent = s.short_desc || '';
        var prix = Number(s.price_ttc).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' € TTC';
        hote.querySelector('.ecs-montant').textContent = prix;
        var b = hote.querySelector('.ecs-cta');
        b.setAttribute('data-energie', 'Chauffe-eau');
        b.setAttribute('data-formule', s.name);
        b.setAttribute('data-prix', prix + ' par an');
        b.setAttribute('data-hc-cta', 'contrats_souscrire_chauffe_eau');
        b.addEventListener('click', function () { if (window.openSouscriptionModal) window.openSouscriptionModal(b); });
        hote.hidden = false;
      })
      .catch(function () {});
  }

  /* Le balisage extrait appelle ces deux fonctions par un attribut onclick : elles doivent donc
     rester joignables depuis la portée globale. On les y expose une fois montées, sans écraser
     celles de la page Contrats si elle en a déjà. */
  function exposer(nom, fn) { if (typeof window[nom] !== 'function') window[nom] = fn; }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monter);
  else monter();
})();
