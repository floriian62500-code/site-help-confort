/* HELP Confort — module « Ma demande » v2 : CŒUR PUR (aucun DOM).
 * Parcours, garde d'étapes, règle tarifs (P0), zone, contrats d'envoi submit-lead-v6.
 * UMD : navigateur (window.HcDemandeCore) + Node (tests scripts/tests/demande-v2.test.mjs). */
(function (root, factory) {
  var mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.HcDemandeCore = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var AGENCE = { nom: 'Saint-Omer', lat: 50.7508, lon: 2.2522, tel: '03 66 10 01 34', telHref: 'tel:+33366100134', horaires: 'lun–ven 9h–17h · sam 9h–16h' };
  var ZONE_IN_KM = 50, ZONE_EDGE_KM = 70;          // distance à vol d'oiseau depuis l'agence (Boulogne ≈ 45 km)
  var PG_TTL_MS = 2 * 60 * 60 * 1000;              // grâce tarifs 2 h (P0 5605156304)

  var FLOWS = {
    intervention: ['lieu', 'besoin', 'precision', 'demande', 'coordonnees', 'creneau'],
    devis: ['dv-metier', 'dv-projet', 'dv-photos', 'lieu', 'coordonnees', 'dv-recap']
  };
  var ALL_STEPS = ['choix', 'lieu', 'besoin', 'acces', 'precision', 'demande', 'coordonnees', 'creneau', 'dv-metier', 'dv-projet', 'dv-photos', 'dv-recap', 'envoye'];
  // Étapes qui affichent des montants (écran ou récapitulatif) : jamais sans identification.
  var PRICED_STEPS = ['precision', 'demande', 'coordonnees', 'creneau'];
  var LABELS = { lieu: 'Lieu', besoin: 'Besoin', acces: 'Tarifs', precision: 'Précision', demande: 'Ma demande', coordonnees: 'Coordonnées', creneau: 'Prise en charge', 'dv-metier': 'Travaux', 'dv-projet': 'Projet', 'dv-photos': 'Photos', 'dv-recap': 'Vérification' };

  function norm(v) { return String(v == null ? '' : v).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nameOk(v) { return String(v || '').trim().length >= 2; }
  // Même règle que submit-lead-v6 (normalizePhone + isValidFrenchPhone) : +33 / 0033 / 0, espaces, points, tirets, parenthèses tolérés.
  function normPhone(v) { return String(v || '').trim().replace(/^((?:\+|00)33)\s*\(0\)\s*/, '$1 '); }
  function phoneOk(v) { var n = normPhone(v).replace(/[\s\-\.\(\)]/g, ''); return /^(\+33|0033)[1-9][0-9]{8}$/.test(n) || /^0[1-9][0-9]{8}$/.test(n); }
  function phoneDisplay(v) { var n = normPhone(v).replace(/[\s\-\.\(\)]/g, '').replace(/^(\+33|0033)/, '0'); return /^0\d{9}$/.test(n) ? n.replace(/(\d{2})(?=\d)/g, '$1 ') : String(v || ''); }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }
  function cpOk(v) { return /^\d{5}$/.test(String(v || '').trim()); }
  function descOk(v) { return String(v || '').trim().length >= 10; }
  function dateOk(v, now) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(v || ''))) return false;
    var d = new Date(v + 'T12:00:00'), t = new Date(now || Date.now()); t.setHours(0, 0, 0, 0);
    return !isNaN(d) && d >= t;
  }
  function lieuValid(l) { return !!l && nameOk(l.adresse) && cpOk(l.cp) && nameOk(l.ville); }
  function contactValid(c) { return !!c && nameOk(c.prenom) && nameOk(c.nom) && phoneOk(c.tel) && (!String(c.email || '').trim() || emailOk(c.email)); }

  function emptyState() {
    return { v: 2, mode: null, step: 'choix', fam: null, precMode: 'liste', prob: null,
      lieu: { adresse: '', cp: '', ville: '', lat: null, lon: null, zone: null },
      contact: { prenom: '', nom: '', tel: '', email: '' },
      prise: { quand: null, date: '', rappel: 'asap', precisions: '' },
      devis: { metiers: [], nature: null, desc: '' },
      focus: null,   // intention précise venue d'un lien d'entrée (ex. « entretien » depuis le bandeau d'accueil)
      sent: null, _pgPending: null, updatedAt: Date.now() };
  }

  // ---- Intention précise d'un lien d'entrée -------------------------------------------------
  // Le bandeau saisonnier de l'accueil envoie le client vers une INTENTION (« entretien »), pas
  // vers une famille entière : il a déjà dit ce qu'il voulait, on ne le fait pas rechercher.
  // FOCUS décrit, pour chaque intention, ce qu'on garde dans la liste des prestations.
  var FOCUS = {
    entretien: { libelle: 'Entretien de chaudière', mots: ['entretien chaudiere'] }
  };
  function focusConnu(f) { return !!(f && FOCUS[f]); }
  function focusLibelle(f) { return focusConnu(f) ? FOCUS[f].libelle : null; }
  // Filtre : on ne garde que les prestations qui correspondent à l'intention. Si rien ne correspond
  // (catalogue modifié, par exemple), on rend la liste entière plutôt qu'un écran vide.
  function focusFiltre(liste, f) {
    if (!focusConnu(f) || !Array.isArray(liste)) return liste || [];
    var mots = FOCUS[f].mots;
    var gardees = liste.filter(function (s) {
      var n = norm((s && s.name) || '') + ' ' + norm((s && s.slug) || '').replace(/-/g, ' ');
      return mots.some(function (m) { return n.indexOf(m) >= 0; });
    });
    return gardees.length ? gardees : liste;
  }

  // ---- Règle tarifs (P0) : session courante OU identification horodatée < 2 h. Jamais l'identité seule.
  function priceGatePassed(state, sessionOk, now) {
    if (sessionOk === true) return true;
    var t = state && state._priceGateAt;
    return !!state && state._priceGateOk === true && typeof t === 'number' && (now - t) < PG_TTL_MS;
  }
  function isPricedStep(step) { return PRICED_STEPS.indexOf(step) >= 0; }

  function modeForStep(step) {
    if (/^dv-/.test(step)) return 'devis';
    if (['besoin', 'acces', 'precision', 'demande', 'creneau'].indexOf(step) >= 0) return 'intervention';
    return null;
  }

  // ---- Garde d'étapes : renvoie l'étape réellement affichable (prérequis + règle tarifs).
  // c = { mode, gateOk, lieuOk, fam, lines, contactOk, dv:{metiers,desc}, sent }
  function guardStep(step, c) {
    c = c || {};
    if (ALL_STEPS.indexOf(step) < 0) return 'choix';
    if (step === 'choix') return 'choix';
    if (step === 'envoye') return c.sent ? 'envoye' : 'choix';
    if (!c.mode) return 'choix';
    if (c.mode === 'intervention') {
      if (/^dv-/.test(step)) return 'lieu';
      if (step === 'lieu' || !c.lieuOk) return 'lieu';
      if (step === 'besoin') return 'besoin';
      if (step === 'acces') return c.gateOk ? (c.fam ? 'precision' : 'besoin') : (c.fam ? 'acces' : 'besoin');
      if (isPricedStep(step) && !c.gateOk) return c.fam ? 'acces' : 'besoin';
      if (step === 'precision') return c.fam ? 'precision' : 'besoin';
      if (!(c.lines > 0)) return c.fam ? 'precision' : 'besoin';
      if (step === 'demande' || step === 'coordonnees') return step;
      if (step === 'creneau') return c.contactOk ? 'creneau' : 'coordonnees';
      return 'lieu';
    }
    // devis
    if (['besoin', 'acces', 'precision', 'demande', 'creneau'].indexOf(step) >= 0) return 'dv-metier';
    var dv = c.dv || {};
    if (step === 'dv-metier') return step;
    if (!(dv.metiers && dv.metiers.length)) return 'dv-metier';
    if (step === 'dv-projet') return step;
    if (!descOk(dv.desc)) return 'dv-projet';
    if (step === 'dv-photos' || step === 'lieu') return step;
    if (!c.lieuOk) return 'lieu';
    if (step === 'coordonnees') return step;
    if (!c.contactOk) return 'coordonnees';
    return 'dv-recap';
  }

  function nextStep(mode, step, ctx) {
    ctx = ctx || {};
    if (step === 'choix') return mode === 'devis' ? 'dv-metier' : 'lieu';
    if (mode === 'intervention') {
      return ({ lieu: ctx.fam ? 'precision' : 'besoin', besoin: 'precision', acces: 'precision', precision: 'demande', demande: 'coordonnees', coordonnees: 'creneau', creneau: 'envoye' })[step] || 'lieu';
    }
    var f = FLOWS.devis, i = f.indexOf(step);
    if (step === 'dv-recap') return 'envoye';
    return i >= 0 ? f[i + 1] : 'dv-metier';
  }
  function prevStep(mode, step) {
    if (!mode || step === 'choix' || step === 'envoye') return null;
    if (mode === 'intervention') {
      return ({ lieu: 'choix', besoin: 'lieu', acces: 'besoin', precision: 'besoin', demande: 'precision', coordonnees: 'demande', creneau: 'coordonnees' })[step] || 'choix';
    }
    var f = FLOWS.devis, i = f.indexOf(step);
    return i > 0 ? f[i - 1] : 'choix';
  }
  function flowIndex(mode, step) { var f = FLOWS[mode]; if (!f) return -1; return f.indexOf(step === 'acces' ? 'precision' : step); }
  function progress(mode, step) {
    var f = FLOWS[mode]; if (!f) return null;
    var s = step === 'acces' ? 'precision' : step, i = f.indexOf(s);
    if (i < 0) return null;
    return { index: i + 1, total: f.length, label: LABELS[step] || '' };
  }

  // Liens historiques (#step=… de l'ancien tunnel, pages métiers #cat=…) → nouvelles étapes.
  function legacyStep(step, sub) {
    if (!step) return null;
    if (ALL_STEPS.indexOf(step) >= 0) return step;
    var map = { launcher: 'choix', rappel: 'choix', catalogue: 'besoin', diagnosis: 'precision', sheet: 'precision', cart: 'demande', urgence: 'creneau', address: 'lieu', coords: 'coordonnees', confirm: 'creneau', entretien: 'dv-projet', intervention: 'lieu' };
    if (step === 'devis') return ({ 1: 'dv-metier', 2: 'dv-projet', 3: 'lieu', 4: 'coordonnees', 5: 'dv-recap' })[sub] || 'dv-metier';
    return map[step] || 'choix';
  }

  // ---- Zone d'intervention (agence unique : Saint-Omer)
  function haversineKm(a1, o1, a2, o2) {
    var r = Math.PI / 180, dA = (a2 - a1) * r, dO = (o2 - o1) * r;
    var h = Math.sin(dA / 2) * Math.sin(dA / 2) + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dO / 2) * Math.sin(dO / 2);
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }
  function zoneFor(lat, lon, cp) {
    if (typeof lat === 'number' && typeof lon === 'number' && isFinite(lat) && isFinite(lon)) {
      var km = Math.round(haversineKm(AGENCE.lat, AGENCE.lon, lat, lon));
      return { status: km <= ZONE_IN_KM ? 'in' : (km <= ZONE_EDGE_KM ? 'edge' : 'out'), km: km };
    }
    if (cpOk(cp) && !/^(59|62)/.test(String(cp))) return { status: 'out', km: null };
    return { status: 'unknown', km: null };
  }
  function zoneText(z, ville) {
    var v = nameOk(ville) ? ville : 'Votre adresse';
    if (!z) return null;
    if (z.status === 'in') return { title: "Dans notre zone d'intervention", text: z.km < 5 ? "Vous êtes à moins de 5 km de l'agence de Saint-Omer." : v + ' est à environ ' + z.km + " km de l'agence de Saint-Omer." };
    if (z.status === 'edge') return { title: 'En limite de zone', text: v + ' est à environ ' + z.km + " km de l'agence : le déplacement vous est confirmé au rappel." };
    if (z.status === 'out') return { title: 'Hors de notre zone habituelle', text: "Vous pouvez envoyer votre demande : l'agence vous dira si un technicien peut se déplacer." };
    return { title: 'Adresse à confirmer', text: "La distance n'a pas pu être vérifiée : l'agence la confirmera lors du rappel." };
  }

  // ---- Catalogue : typologie de prix (prix ferme / à confirmer / sur devis)
  function priced(s) { return !!s && !s.requires_quote && Number(s.price_ttc) > 0 && s.active !== false; }
  function perUnit(s) { var m = String((s && s.name) || '').match(/\((?:au|par)\s+(m²|m2|ml|mètre linéaire|unité)\)/i); return m ? m[1].replace('m2', 'm²') : null; }
  function priceKind(s) { if (!priced(s)) return 'devis'; return perUnit(s) ? 'confirmer' : 'ferme'; }
  function eur(n) {
    var v = Math.round((Number(n) || 0) * 100) / 100;
    return v.toLocaleString('fr-FR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
  }
  function firmTotal(lines, byId) {
    return (lines || []).reduce(function (t, l) { var s = byId && byId[l.id]; var k = s ? priceKind(s) : (l.requires_quote ? 'devis' : 'ferme'); return k === 'ferme' ? t + (Number(l.ttc) || 0) * (l.qty || 1) : t; }, 0);
  }
  var FAM_HINTS = { plomberie: 'Fuite, chauffe-eau, robinetterie, WC', chauffage: 'Panne, entretien chaudière, radiateurs', electricite: 'Panne, disjoncteur, VMC', serrurerie: 'Porte claquée ou bloquée, serrure', vitrerie: 'Vitre cassée, mise en sécurité', renovation: 'Peinture, isolation, enduits · sur devis' };
  var PROBLEMS = [
    { id: 'panne', label: 'Une panne ou une fuite', re: /urgente|fuite|panne|depannage|desengorgement/ },
    { id: 'porte', label: 'Une porte bloquée', re: /ouverture|porte|serrur/ },
    { id: 'remplacer', label: 'Remplacer un équipement', re: /remplacement|chauffe.eau|mitigeur|mecanisme|vmc/ },
    { id: 'entretien', label: 'Un entretien', re: /entretien|detartrage|desembouage|contrat/ },
    { id: 'vitre', label: 'Une vitre cassée', re: /vitre|insert|vitrage/ },
    { id: 'travaux', label: 'Des travaux de finition', re: /enduit|isolation|peinture|revetement/ }
  ];
  // Aide au choix PAR MÉTIER : situations concrètes → une offre conseillée (nom) + alternatives.
  var DIAG = {
    plomberie: [
      { id: 'fuite', label: 'Une fuite d\u2019eau', best: /recherche de fuite/, re: /fuite/ },
      { id: 'bouche', label: 'Évier, douche ou WC bouché', best: /desengorgement/, re: /desengorgement/ },
      { id: 'eauchaude', label: 'Plus d\u2019eau chaude', best: /intervention urgente/, re: /chauffe.eau|intervention urgente/, ex: /contrat/ },
      { id: 'robinet', label: 'Robinet qui fuit ou à changer', best: /intervention urgente/, re: /mitigeur|intervention urgente/ },
      { id: 'chasse', label: 'Chasse d\u2019eau qui coule', best: /mecanisme/, re: /mecanisme/ },
      { id: 'entretien', label: 'Entretien ou calcaire', best: /contrat entretien/, re: /entretien|detartrage/ }
    ],
    chauffage: [
      { id: 'panne', label: 'Plus de chauffage', best: /depannage/, re: /depannage|panne/ },
      { id: 'entretien', label: 'Entretien de la chaudière', best: /entretien chaudiere gaz/, re: /entretien/ },
      { id: 'radiateurs', label: 'Radiateurs froids ou bruyants', best: /desembouage/, re: /desembouage|detartrage circuit/ }
    ],
    electricite: [
      { id: 'panne', label: 'Panne ou disjoncteur qui saute', best: /intervention urgente/, re: /intervention urgente/ },
      { id: 'vmc', label: 'Ventilation (VMC)', best: /vmc/, re: /vmc/ }
    ],
    serrurerie: [
      { id: 'claquee', label: 'Porte claquée (porte simple)', best: /porte simple/, re: /porte simple/ },
      { id: 'cle', label: 'Porte fermée à clé', best: /fermee a cle/, re: /fermee a cle/ },
      { id: 'blindee', label: 'Porte claquée blindée ou multipoints', best: /securite/, re: /securite/ },
      { id: 'serrure', label: 'Serrure bloquée ou clé cassée', best: /intervention urgente/, re: /intervention urgente/ }
    ],
    vitrerie: [
      { id: 'cassee', label: 'Vitre cassée', best: /mise en securite/, re: /mise en securite/ },
      { id: 'insert', label: 'Vitre d\u2019insert ou de poêle', best: /insert/, re: /insert/ }
    ]
  };
  function diagFor(slug, list) {
    var d = DIAG[slug] || PROBLEMS;
    return d.filter(function (p) { return (list || []).some(function (s) { return p.re.test(searchText(s)); }); });
  }
  function suggest(slug, list, pid) {
    list = list || [];
    if (pid === 'inconnu') return { best: diagnosticOffer(list), others: [] };
    var p = (DIAG[slug] || PROBLEMS).filter(function (x) { return x.id === pid; })[0];
    if (!p) return { best: null, others: [] };
    var matches = list.filter(function (s) { return p.re.test(searchText(s)) && !(p.ex && p.ex.test(searchText(s))); });
    var best = p.best ? (list.filter(function (s) { return p.best.test(norm(s.name)); })[0] || null) : null;
    if (!best) best = matches[0] || null;
    return { best: best, others: matches.filter(function (s) { return !best || s.id !== best.id; }) };
  }
  function famHasPrices(list) { return (list || []).some(priced); }
  // Horaires d'ouverture de l'agence (heure de Paris) : lun–ven 9h–17h, sam 9h–16h, dim fermé.
  var HOURS = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 16] };
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function agencyStatus(date) {
    var p = {};
    try { new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date || new Date()).forEach(function (x) { p[x.type] = x.value; }); }
    catch (e) { return { open: true, next: null }; }
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), t = (parseInt(p.hour, 10) % 24) + parseInt(p.minute, 10) / 60;
    var today = HOURS[wd];
    if (today && t >= today[0] && t < today[1]) return { open: true, next: null };
    for (var i = 0; i < 8; i++) {
      var d = (wd + i) % 7, h = HOURS[d]; if (!h) continue;
      if (i === 0 && t >= h[0]) continue;
      return { open: false, next: (i === 0 ? 'aujourd\u2019hui' : (i === 1 ? 'demain' : JOURS[d])) + ' à ' + h[0] + ' h' };
    }
    return { open: false, next: null };
  }
  // Recherche tolérante à la saisie mobile : apostrophes typographiques, œ, tirets, mots dans le désordre.
  function searchNorm(v) { return norm(v).replace(/\u0153/g, 'oe').replace(/\u00e6/g, 'ae').replace(/[\u2019'`\u00b4\-_\/.,;:()]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function searchText(s) { return searchNorm([s.name, s.short_desc, s.category_name].join(' ')); }
  var STOP = ['de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'au', 'aux', 'en', 'pour', 'qui', 'que', 'mon', 'ma', 'mes', 'sur', 'par', 'ne', 'pas', 'plus', 'est', 'il', 'elle', 'ca', 'cela', 'chez', 'moi'];
  var SYN = { debouchage: 'desengorgement', deboucher: 'desengorgement', debouche: 'desengorgement', bouche: 'desengorgement', bouchee: 'desengorgement', bouches: 'desengorgement', bouchon: 'desengorgement', toilettes: 'chasse', toilette: 'chasse', wc: 'chasse', robinet: 'mitigeur', robinets: 'mitigeur', ballon: 'chauffe', cumulus: 'chauffe', verrou: 'serrure', cle: 'porte', carreau: 'vitre', fenetre: 'vitre' };
  function wordHit(words, tok) { var alts = SYN[tok] ? [tok, SYN[tok]] : [tok]; return alts.some(function (a) { return words.some(function (w) { return w.indexOf(a) === 0; }); }); }
  function searchOffers(all, q) {
    var toks = searchNorm(q).split(' ').filter(function (t) { return t.length >= 2 && STOP.indexOf(t) < 0; });
    if (!toks.length) return { items: [], approx: false };
    var and = (all || []).filter(function (s) { var w = searchText(s).split(' '); return toks.every(function (k) { return wordHit(w, k); }); });
    if (and.length) return { items: and, approx: false };
    var or = (all || []).map(function (s) { var w = searchText(s).split(' '); return { s: s, n: toks.reduce(function (n, k) { return n + (wordHit(w, k) ? (SYN[k] ? 2 : 1) : 0); }, 0) }; })
      .filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.n - a.n; }).map(function (x) { return x.s; });
    return { items: or, approx: or.length > 0 };
  }
  function problemsFor(list) { return PROBLEMS.filter(function (p) { return (list || []).some(function (s) { return p.re.test(searchText(s)); }); }); }
  function matchProblem(list, pid) { var p = PROBLEMS.filter(function (x) { return x.id === pid; })[0]; return p ? (list || []).filter(function (s) { return p.re.test(searchText(s)); }) : []; }
  function diagnosticOffer(list) { return (list || []).filter(function (s) { return priced(s) && /intervention urgente|recherche de panne/.test(norm(s.name)); })[0] || null; }

  // ---- Contrats d'envoi (submit-lead-v6 : demande_metier / devis_express / rappel)
  var QUAND = { asap: 'Dès que possible (urgent)', semaine: 'Dans la semaine', date: 'À partir d’une date' };
  var RAPPEL = { asap: 'Au plus tôt', matin: 'Le matin', aprem: 'L’après-midi' };
  function frDate(v) { var m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }
  function priseText(p) {
    if (!p || !p.quand) return '';
    return (p.quand === 'date' && p.date ? 'À partir du ' + frDate(p.date) : QUAND[p.quand]) + ' · rappel ' + String(RAPPEL[p.rappel] || RAPPEL.asap).toLowerCase();
  }
  function lineLabel(l, s) {
    var k = s ? priceKind(s) : (l.requires_quote ? 'devis' : 'ferme');
    var q = (l.qty || 1) > 1 ? ' ×' + l.qty : '';
    if (k === 'devis') return l.name + q + ' — sur devis (chiffré après diagnostic)';
    if (k === 'confirmer') return l.name + q + ' — ' + eur(l.ttc) + ' TTC / ' + perUnit(s) + ' (montant à confirmer)';
    return l.name + q + ' — ' + eur((Number(l.ttc) || 0) * (l.qty || 1)) + ' TTC (prix ferme)';
  }
  function zoneLine(l) { var z = l && l.zone; if (!z) return 'non vérifiée'; return ({ in: 'dans la zone', edge: 'limite de zone', out: 'hors zone habituelle', unknown: 'à confirmer' })[z.status] + (z.km != null ? ' (≈' + z.km + ' km de Saint-Omer)' : ''); }

  function interventionPayload(d) {
    var lines = d.lines || [], byId = d.byId || {}, c = d.contact || {}, l = d.lieu || {}, p = d.prise || {};
    var tot = firmTotal(lines, byId);
    var fams = []; lines.forEach(function (x) { var s = byId[x.id]; var n = s && s.category_name; if (n && fams.indexOf(n) < 0) fams.push(n); });
    var msg = ["DEMANDE D'INTERVENTION — module Ma demande v2", '', 'Interventions :']
      .concat(lines.map(function (x) { return '• ' + lineLabel(x, byId[x.id]); }))
      .concat(tot > 0 ? ['Total prix fermes : ' + eur(tot) + ' TTC'] : [])
      .concat(tot > 0 ? ['Réserve tarifaire : les montants correspondent aux forfaits sélectionnés par le client, sous réserve de vérification sur place. Si la situation constatée ne correspond pas au forfait, un ajustement ou un devis complémentaire doit être proposé au client AVANT toute intervention.'] : [])
      .concat(['', 'Délai souhaité : ' + (p.quand === 'date' && p.date ? 'à partir du ' + frDate(p.date) : (QUAND[p.quand] || '—')), 'Rappel souhaité : ' + (RAPPEL[p.rappel] || RAPPEL.asap), 'Zone : ' + zoneLine(l)])
      .concat(p.precisions ? ['', 'Précisions client : ' + p.precisions] : [])
      .join('\n');
    return {
      prenom: c.prenom || null, nom: c.nom || null, telephone: c.tel ? normPhone(c.tel) : null, email: c.email || null,
      adresse: l.adresse || null, code_postal: l.cp || null, ville: l.ville || null,
      metier: fams.join(', ') || null,
      type_demande: d.cartMode === 'paiement' ? 'reservation' : (d.cartMode === 'mixte' ? 'mixte' : 'devis'),
      form_type: 'demande_metier', message: msg, source: 'commerce_engine', source_page: d.page || null, source_referer: referrerOf(d),
      correlation_id: d.cid || null,
      utm: { module: 'demande_v2', cart: lines.map(function (x) { return { id: x.id, slug: x.slug, qty: x.qty || 1 }; }), cart_mode: d.cartMode || null,
        urgence: p.quand === 'asap' ? 'oui' : 'non', quand: p.quand || null, date_souhaitee: p.date || null, rappel: p.rappel || 'asap',
        zone: l.zone || null, attribution: d.attribution || null, wizard_tags: ['commerce-engine', 'demande-v2', 'intervention'] }
    };
  }
  function devisPayload(d) {
    var c = d.contact || {}, l = d.lieu || {}, dv = d.devis || {}, svc = (dv.metiers || []).slice(0, 3), lines = d.lines || [], byId = d.byId || {};
    var msg = ['DEMANDE DE DEVIS — module Ma demande v2', '- Travaux : ' + (svc.join(', ') || '—')]
      .concat(dv.nature ? ['- Nature du projet : ' + dv.nature] : [])
      .concat(['- Projet : ' + (dv.desc || ''), '- Photos : ' + (d.photos || 0) + (d.photos ? ' (transmises après création du dossier)' : ''), '- Zone : ' + zoneLine(l)])
      .concat(lines.length ? ['', 'Interventions également demandées :'].concat(lines.map(function (x) { return '• ' + lineLabel(x, byId[x.id]); })) : [])
      .join('\n');
    return {
      prenom: c.prenom || null, nom: c.nom || null, telephone: c.tel ? normPhone(c.tel) : null, email: c.email || null,
      adresse: l.adresse || null, code_postal: l.cp || null, ville: l.ville || null,
      metier: svc[0] || null, services: svc, type_demande: 'devis', form_type: 'devis_express',
      message: msg, source: 'commerce_engine_devis', source_page: d.page || null, source_referer: referrerOf(d),
      correlation_id: d.cid || null,
      utm: { module: 'demande_v2', mode: 'devis', attribution: d.attribution || null, services: svc, nature: dv.nature || null, photos: d.photos || 0, zone: l.zone || null, cart: lines.map(function (x) { return { id: x.id, slug: x.slug, qty: x.qty || 1 }; }), wizard_tags: ['commerce-engine', 'demande-v2', 'devis'] }
    };
  }
  function gatePayload(d) {
    var c = d.contact || {}, l = d.lieu || {};
    return {
      // Nom réel du client : jamais reconstruit à partir du prénom (incident « Florian Florian »).
      prenom: c.prenom || null, nom: c.nom || null, telephone: c.tel ? normPhone(c.tel) : null, email: c.email || null,
      intent: true, correlation_id: d.cid || null, last_step: d.step || 'acces',
      adresse: l.adresse || null, code_postal: cpOk(l.cp) ? l.cp : null, ville: l.ville || null,
      type_demande: 'consultation_tarifs', form_type: 'rappel', source: 'price_gate', source_page: d.page || null, source_referer: referrerOf(d),
      message: 'Consultation des tarifs' + (d.famLabel ? ' — ' + d.famLabel : '') + (l.ville ? ' — ' + l.ville : ''),
      utm: { mode: 'price_gate', module: 'demande_v2', cat: d.fam || null, attribution: d.attribution || null, correlation_id: d.cid || null }
    };
  }
  // Référence affichée = dérivée de l'identifiant RÉEL du dossier (jamais inventée côté client).
  function refFromId(id) { var h = String(id || '').replace(/[^0-9a-f]/gi, ''); return h.length >= 8 ? 'HC-' + h.slice(0, 8).toUpperCase() : null; }
  // ---- Confidentialité (appareil partagé) : aucune donnée personnelle en stockage durable.
  // Brouillon NON personnel (localStorage, 7 j) ≠ données personnelles (sessionStorage : onglet courant uniquement).
  // Données personnelles = identité, adresse, textes libres (description du projet, précisions).
  function splitState(st) {
    var draft = JSON.parse(JSON.stringify(st || emptyState())), e = emptyState();
    var pii = { contact: draft.contact || e.contact, lieu: draft.lieu || e.lieu, desc: (draft.devis && draft.devis.desc) || '', precisions: (draft.prise && draft.prise.precisions) || '', sent: draft.sent || null };
    draft.contact = e.contact; draft.lieu = e.lieu; draft.sent = null;
    if (draft.devis) draft.devis.desc = ''; if (draft.prise) draft.prise.precisions = '';
    return { draft: draft, pii: pii };
  }
  function mergeState(draft, pii) {
    var e = emptyState(), st = draft && draft.v === 2 ? draft : emptyState();
    Object.keys(e).forEach(function (k) { if (st[k] === undefined) st[k] = e[k]; });
    ['lieu', 'contact', 'prise', 'devis'].forEach(function (k) { if (!st[k] || typeof st[k] !== 'object') st[k] = e[k]; });
    // Jamais de donnée personnelle reprise du stockage durable (y compris anciens brouillons d'avant ce correctif)
    st.contact = e.contact; st.lieu = e.lieu; st.sent = null; st.devis.desc = ''; st.prise.precisions = '';
    if (pii && typeof pii === 'object') {
      if (pii.contact && typeof pii.contact === 'object') Object.keys(e.contact).forEach(function (k) { if (typeof pii.contact[k] === 'string') st.contact[k] = pii.contact[k]; });
      if (pii.lieu && typeof pii.lieu === 'object') st.lieu = { adresse: String(pii.lieu.adresse || ''), cp: String(pii.lieu.cp || ''), ville: String(pii.lieu.ville || ''), lat: typeof pii.lieu.lat === 'number' ? pii.lieu.lat : null, lon: typeof pii.lieu.lon === 'number' ? pii.lieu.lon : null, zone: pii.lieu.zone || null };
      if (typeof pii.desc === 'string') st.devis.desc = pii.desc;
      if (typeof pii.precisions === 'string') st.prise.precisions = pii.precisions;
      if (pii.sent && typeof pii.sent === 'object') st.sent = pii.sent; // récapitulatif du dossier : onglet courant seulement
    }
    return st;
  }
  function hasPii(st) {
    var c = (st && st.contact) || {}, l = (st && st.lieu) || {};
    return !!(c.prenom || c.nom || c.tel || c.email || l.adresse || l.cp || l.ville || (st && st.devis && st.devis.desc) || (st && st.prise && st.prise.precisions));
  }
  // Demande en cours non envoyée (prestations, métiers de devis ou saisie personnelle) → reprise EXPLICITE uniquement
  function hasDraft(st, cartCount) { return !!st && !st.sent && ((cartCount || 0) > 0 || ((st.devis && st.devis.metiers) || []).length > 0 || hasPii(st)); }
  // ── Que faire quand un lien d'entrée arrive alors qu'une demande est déjà commencée ?
  //
  // Régression constatée par Florian le 2026-09-26 : depuis l'accueil, « Demander une intervention »
  // (#intervention) rouvrait l'écran générique « Reprendre votre demande ? » dès qu'un vieux
  // brouillon Plomberie traînait sur l'appareil. Un bouton qui DIT ce qu'il démarre n'a pas à
  // demander la permission de le démarrer.
  //
  // La règle distingue deux natures de liens :
  //   · l'entrée NOMME son intention (#cat=, presta=, sujet=, entretien) → l'écran de reprise garde
  //     son sens : le client voit ce qu'il vient de demander ET ce qu'il avait commencé ;
  //   · l'entrée EST un démarrage explicite (#intervention, #devis) → on démarre. L'ancien
  //     brouillon n'est pas perdu pour autant : l'appelant le met de côté (voir hc-demande.js).
  function startExplicite(h) {
    if (!h || !h.entry) return false;
    if (h.cat || h.presta || h.sujet || h.entretien) return false;
    return h.mode === 'intervention' || h.mode === 'devis';
  }
  // 'apply'     : appliquer l'entrée telle quelle (rien en cours, ou navigation interne)
  // 'start-new' : démarrer la demande annoncée, après avoir mis l'ancienne de côté
  // 'gate'      : écran de reprise — réservé aux entrées qui ne disent pas ce qu'elles démarrent
  function entryDecision(h, brouillonEnCours) {
    if (!h || !h.entry || !brouillonEnCours) return 'apply';
    return startExplicite(h) ? 'start-new' : 'gate';
  }

  // Durée de vie des données personnelles sur l'appareil : 2 h sans activité, même onglet ouvert
  // (un navigateur peut restaurer la session d'un onglet après redémarrage). Au-delà : effacées, seul le brouillon non personnel reste.
  var PII_TTL_MS = 2 * 60 * 60 * 1000;
  function piiExpired(st, now) {
    if (!st || !(hasPii(st) || st.sent)) return false;
    return typeof st.updatedAt === 'number' && (now - st.updatedAt) > PII_TTL_MS;
  }
  function stripPii(st) {
    var e = emptyState();
    st.contact = e.contact; st.lieu = e.lieu; st.sent = null;
    if (st.devis) st.devis.desc = ''; if (st.prise) st.prise.precisions = '';
    return st;
  }
  // « Effacer mes informations de cet appareil » : toutes les clés du site pouvant contenir une donnée personnelle ou une demande
  // (module actuel + anciens formulaires + historique de l'assistant). Le choix cookies (hc-consent) est conservé.
  var DEVICE_KEYS = {
    local: ['hc_demande_v2', 'hc_demande_v2_reprise', 'hc_cart_v1', 'hc_lead_v1', 'hc_chat_history', 'hc_chat_session_id'],
    localPrefixes: ['hc_tarif_lead_'],
    session: ['hc_demande_v2_pii', 'hc_pg', 'hc_fs_intervention', 'hc_fs_devis', 'hc_utm', 'hc_referrer', 'hc_sid', 'hc_lead_v1', 'hc_wizard_prefill']
  };
  // Coordonnées DURABLES laissées par les anciens formulaires (localStorage, sans expiration) : purgées au chargement du module.
  var LEGACY_DURABLE = { local: ['hc_lead_v1'], localPrefixes: ['hc_tarif_lead_'] };
  function purgeKeys(ls, ss, spec) {
    var n = 0;
    function rm(s, k) { try { if (s && s.getItem(k) !== null) { s.removeItem(k); n++; } } catch (e) {} }
    function keysOf(s) { var out = []; try { for (var i = 0; s && i < s.length; i++) out.push(s.key(i)); } catch (e) {} return out; }
    (spec.local || []).forEach(function (k) { rm(ls, k); });
    (spec.localPrefixes || []).forEach(function (p) { keysOf(ls).forEach(function (k) { if (k && k.indexOf(p) === 0) rm(ls, k); }); });
    (spec.session || []).forEach(function (k) { rm(ss, k); });
    return n;
  }
  function purgeDevice(ls, ss) { return purgeKeys(ls, ss, DEVICE_KEYS); }
  function purgeLegacy(ls) { return purgeKeys(ls, null, LEGACY_DURABLE); }
  // Campagnes d'acquisition « entretien » : provenance d'une page d'atterrissage (liste blanche) et famille de la demande.
  // Familles : chaudiere (entretien ponctuel gaz/fioul ou contrat), poele (entretien poêle / insert, barème agence
  // EPB / EPG confirmé le 18/09 — prestations prêtes au catalogue, cf. supabase/_pending_migrations/), ramonage.
  var MAINT_SRC = { 'entretien-chaudiere': 'chaudiere', 'ramonage': 'ramonage' };
  function maintenanceSrc(v) { v = String(v || '').toLowerCase(); return Object.prototype.hasOwnProperty.call(MAINT_SRC, v) ? v : null; }
  function serviceFamily(o) {
    o = o || {};
    var slugs = (o.slugs || []).join(' ');
    if (/(^|\s)entretien-chaudiere/.test(slugs) || (o.metiers || []).indexOf('Contrat entretien') >= 0) return 'chaudiere';
    if (/(^|\s)entretien-poele-insert/.test(slugs)) return 'poele';
    var src = maintenanceSrc(o.src);
    return src ? MAINT_SRC[src] : null;
  }
  // Mesure du tunnel (P0.4) : envoi GA4 UNIQUEMENT sur le domaine de production, avec consentement, hors simulation.
  var PROD_HOST_RE = /^(www\.)?depan59-62\.fr$/;
  function trackDecision(o) {
    o = o || {};
    if (o.sim || !PROD_HOST_RE.test(String(o.host || '')) || o.consent !== 'granted') return 'skip';
    return o.gtagReady ? 'send' : 'queue';
  }
  // Paramètres d'événement : liste blanche, valeurs courtes, jamais de donnée personnelle (ni email, ni numéro).
  var TRACK_KEYS = ['module', 'mode', 'step', 'step_index', 'entry', 'cat', 'item', 'price_kind', 'lines', 'quote_lines', 'photos', 'zone', 'lead_type', 'lead', 'from', 'simulated', 'service_family', 'src'];
  function trackParams(p) {
    var out = {};
    Object.keys(p || {}).forEach(function (k) {
      var v = p[k]; if (TRACK_KEYS.indexOf(k) < 0 || v == null || v === '') return;
      if (typeof v === 'number') { if (isFinite(v)) out[k] = v; return; }
      if (typeof v === 'boolean') { out[k] = v; return; }
      v = String(v); if (/@/.test(v) || /\d{8,}/.test(v.replace(/[\s.\-()+]/g, ''))) return;
      out[k] = v.slice(0, 100);
    });
    return out;
  }
  // Attribution d'un dossier : uniquement ce que le site a mémorisé AVEC consentement (assets/tracking.js).
  function attributionFrom(utmJson, referrer) {
    var u = {}, out = {}; try { u = JSON.parse(utmJson || '{}') || {}; } catch (e) { u = {}; }
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', '_first_landing'].forEach(function (k) { if (u[k]) out[k.replace(/^_/, '')] = String(u[k]).slice(0, 200); });
    if (referrer) out.referrer = String(referrer).slice(0, 300);
    return Object.keys(out).length ? out : null;
  }
  function referrerOf(d) { return (d && d.attribution && d.attribution.referrer) || null; }
  // Mode simulation (recette) : uniquement Deploy Preview Netlify ou poste local, jamais le domaine de production.
  function simulationAllowed(host) { return /^deploy-preview-\d+--remarkable-dragon-364e2b\.netlify\.app$/.test(String(host || '')) || host === 'localhost' || host === '127.0.0.1'; }

  return { AGENCE: AGENCE, PG_TTL_MS: PG_TTL_MS, FLOWS: FLOWS, ALL_STEPS: ALL_STEPS, PRICED_STEPS: PRICED_STEPS, LABELS: LABELS, FAM_HINTS: FAM_HINTS, QUAND: QUAND, RAPPEL: RAPPEL,
    norm: norm, esc: esc, nameOk: nameOk, normPhone: normPhone, phoneOk: phoneOk, phoneDisplay: phoneDisplay, flowIndex: flowIndex, emailOk: emailOk, cpOk: cpOk, descOk: descOk, dateOk: dateOk, lieuValid: lieuValid, contactValid: contactValid,
    emptyState: emptyState, priceGatePassed: priceGatePassed, focusConnu: focusConnu, focusLibelle: focusLibelle, focusFiltre: focusFiltre, isPricedStep: isPricedStep, modeForStep: modeForStep, guardStep: guardStep, nextStep: nextStep, prevStep: prevStep,
    progress: progress, legacyStep: legacyStep, haversineKm: haversineKm, zoneFor: zoneFor, zoneText: zoneText, priced: priced, perUnit: perUnit, priceKind: priceKind, eur: eur,
    firmTotal: firmTotal, searchText: searchText, problemsFor: problemsFor, matchProblem: matchProblem, diagFor: diagFor, suggest: suggest, searchNorm: searchNorm, searchOffers: searchOffers, famHasPrices: famHasPrices, agencyStatus: agencyStatus, diagnosticOffer: diagnosticOffer, frDate: frDate, priseText: priseText,
    lineLabel: lineLabel, interventionPayload: interventionPayload, devisPayload: devisPayload, gatePayload: gatePayload, refFromId: refFromId, simulationAllowed: simulationAllowed,
    trackDecision: trackDecision, trackParams: trackParams, attributionFrom: attributionFrom,
    splitState: splitState, mergeState: mergeState, hasPii: hasPii, hasDraft: hasDraft,
    startExplicite: startExplicite, entryDecision: entryDecision,
    PII_TTL_MS: PII_TTL_MS, piiExpired: piiExpired, stripPii: stripPii, DEVICE_KEYS: DEVICE_KEYS, purgeDevice: purgeDevice, purgeLegacy: purgeLegacy,
    maintenanceSrc: maintenanceSrc, serviceFamily: serviceFamily };
});
