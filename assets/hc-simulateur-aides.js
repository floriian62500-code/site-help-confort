/* ============================================================
   HC-SIMULATEUR-AIDES — MaPrimeRenov + CEE 2026
   Wizard : revenus + projet → estimation aides en €
   Source : barèmes MaPrimeRenov 2026 + fiches CEE
   Utilisation : <div data-hc-simulateur-aides></div>
   ============================================================ */
(function () {
  'use strict';

  // Barèmes MaPrimeRenov 2026 (zones B/C : Pas-de-Calais hors littoral immédiat)
  // Plafonds revenus fiscaux N-2 par tranche couleur
  var TRANCHES = {
    bleu:   { label: 'Très modestes', max1: 17009, max2: 24875, max3: 29917, max4: 34948, color: '#1E40AF' },
    jaune:  { label: 'Modestes',      max1: 21805, max2: 31889, max3: 38349, max4: 44802, color: '#D97706' },
    violet: { label: 'Intermédiaires', max1: 30549, max2: 44907, max3: 54071, max4: 63235, color: '#7C3AED' },
    rose:   { label: 'Supérieurs',    max1: Infinity, max2: Infinity, max3: Infinity, max4: Infinity, color: '#DB2777' }
  };

  // Aides par travaux × tranche (€ moyen, plafonné)
  var BAREME_MPR = {
    'pompe-chaleur-air-eau': { bleu: 5000, jaune: 4000, violet: 3000, rose: 0, max_eligible: 12000 },
    'pompe-chaleur-geo':     { bleu: 11000, jaune: 9000, violet: 6000, rose: 0, max_eligible: 18000 },
    'chaudiere-biomasse':    { bleu: 5000, jaune: 4000, violet: 2500, rose: 0, max_eligible: 14000 },
    'chauffe-eau-thermo':    { bleu: 1200, jaune: 800, violet: 400, rose: 0, max_eligible: 3500 },
    'chauffe-eau-solaire':   { bleu: 4000, jaune: 3000, violet: 2000, rose: 0, max_eligible: 9000 },
    'isolation-combles':     { bleu: 25, jaune: 20, violet: 15, rose: 7, per_m2: true, max_eligible: 60 }, // €/m²
    'isolation-murs':        { bleu: 75, jaune: 60, violet: 40, rose: 15, per_m2: true, max_eligible: 150 },
    'fenetres':              { bleu: 100, jaune: 80, violet: 40, rose: 0, per_unit: true, max_eligible: 1500 },
    'ventilation-vmc':       { bleu: 2500, jaune: 2000, violet: 1500, rose: 0, max_eligible: 5000 }
  };

  // CEE moyens (fixes en plus de MPR)
  var CEE = {
    'pompe-chaleur-air-eau': 4500,
    'pompe-chaleur-geo': 5000,
    'chaudiere-biomasse': 3500,
    'chauffe-eau-thermo': 350,
    'chauffe-eau-solaire': 600,
    'isolation-combles': 12, // €/m²
    'isolation-murs': 25, // €/m²
    'fenetres': 100, // par unité
    'ventilation-vmc': 1000
  };

  var TRAVAUX_LABELS = {
    'pompe-chaleur-air-eau': '🌬️ Pompe à chaleur air/eau',
    'pompe-chaleur-geo':     '🌍 Pompe à chaleur géothermie',
    'chaudiere-biomasse':    '🌳 Chaudière biomasse (bois/granulés)',
    'chauffe-eau-thermo':    '♨️ Chauffe-eau thermodynamique',
    'chauffe-eau-solaire':   '☀️ Chauffe-eau solaire',
    'isolation-combles':     '🏠 Isolation combles',
    'isolation-murs':        '🧱 Isolation murs',
    'fenetres':              '🪟 Fenêtres double vitrage',
    'ventilation-vmc':       'VMC double flux'
  };

  function deduceTranche(rfr, foyer) {
    var f = Math.min(Math.max(foyer || 1, 1), 4);
    var key = 'max' + f;
    if (rfr <= TRANCHES.bleu[key]) return 'bleu';
    if (rfr <= TRANCHES.jaune[key]) return 'jaune';
    if (rfr <= TRANCHES.violet[key]) return 'violet';
    return 'rose';
  }

  function calc(state) {
    var t = state.tranche;
    var travaux = state.travaux || [];
    var totalMPR = 0, totalCEE = 0;
    var details = [];

    travaux.forEach(function (key) {
      var bar = BAREME_MPR[key];
      var ceeBar = CEE[key];
      if (!bar) return;
      var mpr = bar[t] || 0;
      var cee = ceeBar || 0;
      var detail = { key: key, label: TRAVAUX_LABELS[key], mpr: 0, cee: 0 };
      if (bar.per_m2) {
        var surface = state.surface || 50;
        detail.mpr = mpr * surface;
        detail.cee = cee * surface;
      } else if (bar.per_unit) {
        var unit = state.fenetres || 5;
        detail.mpr = mpr * unit;
        detail.cee = cee * unit;
      } else {
        detail.mpr = mpr;
        detail.cee = cee;
      }
      totalMPR += detail.mpr;
      totalCEE += detail.cee;
      details.push(detail);
    });

    // Chèque énergie estimé : si tranche bleu/jaune
    var chequeEnergie = (t === 'bleu') ? 277 : (t === 'jaune' ? 194 : 0);

    return { totalMPR: totalMPR, totalCEE: totalCEE, chequeEnergie: chequeEnergie, total: totalMPR + totalCEE + chequeEnergie, details: details, tranche: t };
  }

  var CSS = '\
.hc-sim{background:#fff;border:1px solid #E5EDF3;border-radius:24px;padding:36px 32px;max-width:880px;margin:40px auto;box-shadow:0 18px 50px rgba(10,20,40,.08);position:relative;overflow:hidden}\
.hc-sim::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#22C55E,#16A34A,#FF6B1A)}\
.hc-sim-head{text-align:center;margin-bottom:30px}\
.hc-sim-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(34,197,94,.10);color:#15803D;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}\
.hc-sim-eyebrow::before{content:"💰"}\
.hc-sim h2{font-family:"Inter",sans-serif;font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;margin:0 0 8px;color:#0A1428;letter-spacing:-.022em;line-height:1.2}\
.hc-sim h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#22C55E;font-weight:600}\
.hc-sim-sub{color:#475569;font-size:.96rem;margin:0;line-height:1.55}\
.hc-sim-step{margin-bottom:24px}\
.hc-sim-step h3{font-size:1rem;font-weight:800;color:#0A1428;margin:0 0 12px;letter-spacing:-.01em}\
.hc-sim-row{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:16px}\
@media(min-width:640px){.hc-sim-row{grid-template-columns:1fr 1fr}}\
.hc-sim-fld label{display:block;font-size:.82rem;font-weight:700;color:#475569;margin-bottom:6px}\
.hc-sim-fld input,.hc-sim-fld select{width:100%;padding:12px 14px;font-size:.96rem;font-family:inherit;border:1.5px solid #E5EDF3;border-radius:10px;outline:none;background:#fff;transition:border-color .15s ease,box-shadow .15s ease;-webkit-appearance:none;appearance:none}\
.hc-sim-fld input:focus,.hc-sim-fld select:focus{border-color:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.10)}\
.hc-sim-travaux{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}\
@media(max-width:560px){.hc-sim-travaux{grid-template-columns:1fr}}\
.hc-sim-trav{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#F7FBFD;border:1.5px solid #E5EDF3;border-radius:11px;cursor:pointer;font-size:.86rem;font-weight:600;color:#0A1428;transition:all .15s ease;font-family:inherit}\
.hc-sim-trav input{margin:0;flex-shrink:0;cursor:pointer}\
.hc-sim-trav:hover{border-color:#22C55E;background:rgba(34,197,94,.04)}\
.hc-sim-trav.is-checked{border-color:#22C55E;background:rgba(34,197,94,.08);color:#15803D}\
.hc-sim-extra{display:none;margin-top:12px;padding:14px 16px;background:#F7FBFD;border:1px dashed #E5EDF3;border-radius:10px}\
.hc-sim-extra.is-active{display:block}\
.hc-sim-extra-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}\
.hc-sim-btn{display:block;width:100%;padding:15px 24px;background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;border:0;border-radius:12px;font-family:inherit;font-size:1rem;font-weight:800;cursor:pointer;box-shadow:0 8px 22px rgba(34,197,94,.30);transition:transform .2s ease,box-shadow .2s ease;margin-top:8px}\
.hc-sim-btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(34,197,94,.40)}\
.hc-sim-result{background:linear-gradient(135deg,#0A1428,#172240);color:#fff;border-radius:18px;padding:32px 28px;text-align:center;position:relative;overflow:hidden;margin-top:24px;display:none}\
.hc-sim-result.is-shown{display:block;animation:hcSimIn .35s ease}\
@keyframes hcSimIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}\
.hc-sim-result::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 30% 0%,rgba(34,197,94,.18),transparent 60%);pointer-events:none}\
.hc-sim-result-label{font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:8px;position:relative}\
.hc-sim-result-amount{font-size:clamp(2.4rem,6vw,3.6rem);font-weight:900;color:#22C55E;line-height:1;margin-bottom:8px;position:relative;letter-spacing:-.025em;font-variant-numeric:tabular-nums}\
.hc-sim-result-info{font-size:.86rem;color:rgba(255,255,255,.7);margin:0 0 22px;line-height:1.5;position:relative}\
.hc-sim-result-detail{background:rgba(255,255,255,.05);border-radius:12px;padding:18px;margin-bottom:20px;position:relative;text-align:left;border:1px solid rgba(255,255,255,.10)}\
.hc-sim-result-detail h4{font-size:.74rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55);margin:0 0 12px}\
.hc-sim-result-line{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:.88rem}\
.hc-sim-result-line:last-child{border-bottom:0;font-weight:700;padding-top:10px;margin-top:4px;border-top:1px solid rgba(255,255,255,.20)}\
.hc-sim-result-line span:first-child{color:rgba(255,255,255,.78)}\
.hc-sim-result-line span:last-child{color:#1FC4F0;font-weight:700;font-variant-numeric:tabular-nums}\
.hc-sim-result-ctas{display:flex;flex-direction:column;gap:10px;position:relative}\
@media(min-width:560px){.hc-sim-result-ctas{flex-direction:row;justify-content:center}}\
.hc-sim-result-ctas a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:11px;text-decoration:none;font-size:.92rem;font-weight:700}\
.hc-sim-result-ctas a.prim{background:#FF6B1A;color:#fff;box-shadow:0 8px 20px rgba(255,107,26,.40)}\
.hc-sim-result-ctas a.sec{background:rgba(255,255,255,.10);color:#fff;border:1.5px solid rgba(255,255,255,.20)}\
.hc-sim-disclaimer{font-size:.72rem;color:rgba(255,255,255,.5);margin-top:16px;line-height:1.5;position:relative}';

  function build(el) {
    el.innerHTML = '\
    <div class="hc-sim">\
      <div class="hc-sim-head">\
        <span class="hc-sim-eyebrow">Simulateur aides 2026</span>\
        <h2>Calculez vos <em>aides MaPrimeRenov + CEE</em></h2>\
        <p class="hc-sim-sub">Estimez en 1 minute le montant des aides publiques pour vos travaux. Données 2026 mises à jour.</p>\
      </div>\
      <form id="hcSimForm" action="javascript:void(0)">\
\
        <div class="hc-sim-step">\
          <h3>1. Votre foyer</h3>\
          <div class="hc-sim-row">\
            <div class="hc-sim-fld">\
              <label>Revenu fiscal de référence (RFR N-2, €)</label>\
              <input type="number" id="hcSimRfr" min="0" max="200000" step="1000" placeholder="ex: 32000" required>\
            </div>\
            <div class="hc-sim-fld">\
              <label>Nombre de personnes au foyer</label>\
              <select id="hcSimFoyer" required>\
                <option value="1">1 personne</option>\
                <option value="2" selected>2 personnes</option>\
                <option value="3">3 personnes</option>\
                <option value="4">4 personnes ou +</option>\
              </select>\
            </div>\
          </div>\
        </div>\
\
        <div class="hc-sim-step">\
          <h3>2. Vos travaux (cochez tout ce qui s\'applique)</h3>\
          <div class="hc-sim-travaux">' +
            Object.keys(TRAVAUX_LABELS).map(function (k) {
              return '<label class="hc-sim-trav"><input type="checkbox" name="travaux" value="' + k + '">' + TRAVAUX_LABELS[k] + '</label>';
            }).join('') + '\
          </div>\
          <div class="hc-sim-extra" id="hcSimExtra">\
            <div class="hc-sim-extra-row">\
              <div class="hc-sim-fld">\
                <label>Surface à isoler (m²)</label>\
                <input type="number" id="hcSimSurface" min="10" max="500" step="5" value="50">\
              </div>\
              <div class="hc-sim-fld">\
                <label>Nombre de fenêtres</label>\
                <input type="number" id="hcSimFenetres" min="1" max="20" step="1" value="5">\
              </div>\
            </div>\
          </div>\
        </div>\
\
        <button type="submit" class="hc-sim-btn">\
          💰 Calculer mes aides\
        </button>\
      </form>\
      <div class="hc-sim-result" id="hcSimResult"></div>\
    </div>';

    // Bind
    var form = el.querySelector('#hcSimForm');
    var checkboxes = form.querySelectorAll('input[name="travaux"]');
    var extra = el.querySelector('#hcSimExtra');
    var resultEl = el.querySelector('#hcSimResult');

    function checkExtra() {
      var any = false;
      checkboxes.forEach(function (cb) {
        if (cb.checked) {
          cb.parentElement.classList.add('is-checked');
          if (['isolation-combles', 'isolation-murs', 'fenetres'].indexOf(cb.value) >= 0) any = true;
        } else {
          cb.parentElement.classList.remove('is-checked');
        }
      });
      extra.classList.toggle('is-active', any);
    }
    checkboxes.forEach(function (cb) { cb.addEventListener('change', checkExtra); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var rfr = parseFloat(document.getElementById('hcSimRfr').value) || 0;
      var foyer = parseInt(document.getElementById('hcSimFoyer').value) || 1;
      var surface = parseInt(document.getElementById('hcSimSurface').value) || 50;
      var fenetres = parseInt(document.getElementById('hcSimFenetres').value) || 5;
      var travaux = Array.from(checkboxes).filter(function (c) { return c.checked; }).map(function (c) { return c.value; });

      if (!rfr || travaux.length === 0) {
        alert('Renseignez vos revenus et cochez au moins un type de travaux.');
        return;
      }

      var tranche = deduceTranche(rfr, foyer);
      var result = calc({ tranche: tranche, travaux: travaux, surface: surface, fenetres: fenetres });

      function fmt(n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; }
      var trancheLabel = TRANCHES[tranche].label;

      var detailLines = result.details.map(function (d) {
        return '<div class="hc-sim-result-line"><span>' + d.label + '</span><span>' + fmt(d.mpr + d.cee) + '</span></div>';
      }).join('');

      resultEl.innerHTML = '\
        <div class="hc-sim-result-label">Estimation aides totales</div>\
        <div class="hc-sim-result-amount">jusqu\'à ' + fmt(result.total) + '</div>\
        <p class="hc-sim-result-info">Tranche fiscale : <strong>' + trancheLabel + '</strong></p>\
        <div class="hc-sim-result-detail">\
          <h4>Détail par travaux</h4>\
          ' + detailLines + '\
          <div class="hc-sim-result-line"><span>MaPrimeRenov</span><span>' + fmt(result.totalMPR) + '</span></div>\
          <div class="hc-sim-result-line"><span>Certificats d\'économies d\'énergie (CEE)</span><span>' + fmt(result.totalCEE) + '</span></div>\
          ' + (result.chequeEnergie ? '<div class="hc-sim-result-line"><span>Chèque énergie estimé</span><span>' + fmt(result.chequeEnergie) + '</span></div>' : '') + '\
          <div class="hc-sim-result-line"><span>TOTAL aides estimées</span><span>' + fmt(result.total) + '</span></div>\
        </div>\
        <div class="hc-sim-result-ctas">\
          <a href="contact.html?presta=R%C3%A9novation&objet=Aides+MaPrimeRenov+%2B+CEE+(estim%C3%A9es+' + Math.round(result.total) + '+%E2%82%AC)#form" class="prim">\
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\
            Demander un devis avec les aides\
          </a>\
          <a href="tel:+33366100134" class="sec">📞 03 66 10 01 34</a>\
        </div>\
        <p class="hc-sim-disclaimer">Estimation basée sur les barèmes 2026. Le montant définitif dépend de la nature précise des travaux, de l\'éligibilité de votre logement (>15 ans) et des critères constructeur. Notre équipe vous établit un devis exact gratuit.</p>';
      resultEl.classList.add('is-shown');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function init() {
    if (!document.getElementById('hc-sim-style')) {
      var st = document.createElement('style');
      st.id = 'hc-sim-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-simulateur-aides]').forEach(function (el) {
      if (el.dataset.hcSimDone) return;
      el.dataset.hcSimDone = '1';
      build(el);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
