/* ============================================================
   HC-COMPARATEUR — Tableau comparatif chaudières / chauffe-eau / PAC
   Filtres dynamiques : type énergie, surface, budget
   Utilisation : <div data-hc-comparateur></div>
   ============================================================ */
(function () {
  'use strict';

  var PRODUITS = [
    {
      type: 'chaudiere-gaz',
      energie: 'gaz',
      label: 'Chaudière gaz à condensation',
      marque: 'Saunier Duval Themis',
      rendement: 109,
      puissance: '25 kW',
      surface_max: 150,
      prix_pose_min: 3200,
      prix_pose_max: 4800,
      aides_max: 4200,
      garantie: '2 ans',
      avantages: ['Investissement modéré', 'Compatible chauffage existant', 'Production ECS intégrée'],
      inconvenients: ['Énergie fossile', 'Maintenance annuelle obligatoire']
    },
    {
      type: 'pac-air-eau',
      energie: 'electrique',
      label: 'Pompe à chaleur air/eau',
      marque: 'Daikin Altherma 3',
      rendement: 380,
      puissance: '8 kW',
      surface_max: 150,
      prix_pose_min: 12000,
      prix_pose_max: 18000,
      aides_max: 10500,
      garantie: '3 ans',
      avantages: ['Très économique à l\'usage', 'Réversible (clim)', 'Compatible aides MPR'],
      inconvenients: ['Investissement élevé', 'Performance baisse < 5°C', 'Unité ext. encombrante']
    },
    {
      type: 'pac-air-air',
      energie: 'electrique',
      label: 'Pompe à chaleur air/air (climatisation)',
      marque: 'Mitsubishi Zen',
      rendement: 350,
      puissance: '5 kW',
      surface_max: 100,
      prix_pose_min: 4500,
      prix_pose_max: 8500,
      aides_max: 0,
      garantie: '5 ans',
      avantages: ['Chauffe + refroidit', 'Installation rapide', 'Pilotage Wi-Fi'],
      inconvenients: ['Pas éligible MPR', 'Pas de production ECS', 'Air pulsé peu confortable']
    },
    {
      type: 'pac-geo',
      energie: 'electrique',
      label: 'Pompe à chaleur géothermique',
      marque: 'Vaillant flexoCOMPACT',
      rendement: 470,
      puissance: '10 kW',
      surface_max: 200,
      prix_pose_min: 22000,
      prix_pose_max: 32000,
      aides_max: 16000,
      garantie: '5 ans',
      avantages: ['Rendement record', 'Très silencieux', 'Aides max'],
      inconvenients: ['Investissement très élevé', 'Forage nécessaire', 'Étude sol obligatoire']
    },
    {
      type: 'chauffe-eau-thermo',
      energie: 'electrique',
      label: 'Chauffe-eau thermodynamique',
      marque: 'Atlantic Egeo',
      rendement: 350,
      puissance: '270 L',
      surface_max: 0,
      prix_pose_min: 2800,
      prix_pose_max: 3800,
      aides_max: 1550,
      garantie: '5 ans',
      avantages: ['Économies 60% vs élec', 'Aides MPR + CEE', 'Compatible solaire'],
      inconvenients: ['Bruit ventilateur', 'Encombrant', 'Local non chauffé requis']
    },
    {
      type: 'chauffe-eau-elec',
      energie: 'electrique',
      label: 'Chauffe-eau électrique standard',
      marque: 'Atlantic Vizengo',
      rendement: 99,
      puissance: '200 L',
      surface_max: 0,
      prix_pose_min: 900,
      prix_pose_max: 1400,
      aides_max: 0,
      garantie: '5 ans',
      avantages: ['Investissement faible', 'Installation rapide', 'Sans maintenance'],
      inconvenients: ['Coût d\'usage élevé', 'Pas d\'aides', 'Empreinte carbone']
    },
    {
      type: 'chaudiere-biomasse',
      energie: 'biomasse',
      label: 'Chaudière granulés',
      marque: 'Hargassner Nano-PK',
      rendement: 95,
      puissance: '15 kW',
      surface_max: 180,
      prix_pose_min: 14000,
      prix_pose_max: 22000,
      aides_max: 11000,
      garantie: '5 ans',
      avantages: ['Énergie renouvelable', 'Aides max', 'Combustible local'],
      inconvenients: ['Silo de stockage', 'Maintenance fréquente', 'Combustible à approvisionner']
    },
    {
      type: 'chauffe-eau-solaire',
      energie: 'solaire',
      label: 'Chauffe-eau solaire',
      marque: 'Viessmann Vitosol',
      rendement: 75,
      puissance: '300 L',
      surface_max: 0,
      prix_pose_min: 4800,
      prix_pose_max: 7500,
      aides_max: 4500,
      garantie: '10 ans',
      avantages: ['70% gratuit (soleil)', 'Excellent ROI', 'Longue durée de vie'],
      inconvenients: ['Appoint nécessaire hiver', 'Toiture exposée sud', 'Inertie']
    }
  ];

  var CSS = '\
.hc-cmp{background:#fff;border:1px solid #E5EDF3;border-radius:24px;padding:36px 32px;max-width:1180px;margin:40px auto;box-shadow:0 18px 50px rgba(10,20,40,.08);position:relative;overflow:hidden}\
.hc-cmp::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#FF6B1A,#FFB400,#0DA0CF)}\
.hc-cmp-head{text-align:center;margin-bottom:30px}\
.hc-cmp-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(255,107,26,.10);color:#FF6B1A;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}\
.hc-cmp-eyebrow::before{content:"⚖️"}\
.hc-cmp h2{font-family:"Inter",sans-serif;font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;margin:0 0 8px;color:#0A1428;letter-spacing:-.022em;line-height:1.2}\
.hc-cmp h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#FF6B1A;font-weight:600}\
.hc-cmp-sub{color:#475569;font-size:.96rem;margin:0;line-height:1.55}\
.hc-cmp-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:24px 0 30px;padding:14px;background:#F7FBFD;border-radius:14px;border:1px solid #E5EDF3}\
.hc-cmp-fbtn{padding:9px 14px;background:#fff;border:1px solid #E5EDF3;border-radius:999px;font-family:inherit;font-size:.84rem;font-weight:700;color:#0A1428;cursor:pointer;transition:all .15s ease}\
.hc-cmp-fbtn:hover{border-color:#FF6B1A;color:#FF6B1A}\
.hc-cmp-fbtn.is-active{background:linear-gradient(135deg,#FF6B1A,#FFB400);color:#fff;border-color:#FF6B1A;box-shadow:0 4px 12px rgba(255,107,26,.25)}\
.hc-cmp-grid{display:grid;grid-template-columns:1fr;gap:18px}\
@media(min-width:768px){.hc-cmp-grid{grid-template-columns:1fr 1fr}}\
@media(min-width:1080px){.hc-cmp-grid{grid-template-columns:repeat(3,1fr)}}\
.hc-cmp-card{background:#fff;border:1px solid #E5EDF3;border-radius:16px;padding:24px 22px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;display:flex;flex-direction:column;gap:12px}\
.hc-cmp-card:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(10,20,40,.08);border-color:rgba(255,107,26,.30)}\
.hc-cmp-badge{display:inline-block;font-size:.7rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:999px;align-self:flex-start;background:rgba(13,160,207,.10);color:#0DA0CF}\
.hc-cmp-badge.gaz{background:rgba(255,180,0,.12);color:#B68A00}\
.hc-cmp-badge.electrique{background:rgba(13,160,207,.10);color:#0884AE}\
.hc-cmp-badge.biomasse{background:rgba(34,197,94,.10);color:#15803D}\
.hc-cmp-badge.solaire{background:rgba(255,107,26,.12);color:#C2510A}\
.hc-cmp-card h3{font-size:1.1rem;font-weight:800;color:#0A1428;margin:0;line-height:1.25;letter-spacing:-.01em}\
.hc-cmp-marque{font-size:.86rem;color:#64748b;margin:-6px 0 0;font-weight:600}\
.hc-cmp-specs{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px 0;border-top:1px solid #F1F5F9;border-bottom:1px solid #F1F5F9}\
.hc-cmp-spec{font-size:.78rem;color:#64748b;line-height:1.4}\
.hc-cmp-spec strong{display:block;color:#0A1428;font-weight:800;font-size:.94rem;margin-bottom:1px}\
.hc-cmp-prix{display:flex;align-items:baseline;gap:6px;padding:14px;background:linear-gradient(135deg,#F7FBFD,#fff);border-radius:10px;border:1px solid #E5EDF3}\
.hc-cmp-prix-label{font-size:.72rem;color:#94a3b8;font-weight:800;letter-spacing:.04em;text-transform:uppercase;flex:1}\
.hc-cmp-prix-amount{font-size:1.1rem;color:#0A1428;font-weight:800;font-variant-numeric:tabular-nums}\
.hc-cmp-aides{padding:10px 12px;background:rgba(34,197,94,.08);border-radius:8px;font-size:.82rem;color:#15803D;display:flex;align-items:center;gap:6px}\
.hc-cmp-aides strong{font-weight:800;font-variant-numeric:tabular-nums}\
.hc-cmp-list{margin:0;padding:0;list-style:none;font-size:.84rem;line-height:1.5}\
.hc-cmp-list li{display:flex;align-items:flex-start;gap:6px;padding:3px 0;color:#475569}\
.hc-cmp-list li::before{flex-shrink:0;font-size:.88rem;line-height:1.4}\
.hc-cmp-list.plus li::before{content:"✓";color:#22C55E;font-weight:800}\
.hc-cmp-list.moins li::before{content:"−";color:#94a3b8;font-weight:800}\
.hc-cmp-cta{margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 20px;background:#0A1428;color:#fff;border-radius:10px;text-decoration:none;font-size:.86rem;font-weight:700;transition:background .2s ease,transform .2s ease}\
.hc-cmp-cta:hover{background:#FF6B1A;transform:translateY(-1px)}';

  var FILTERS = [
    { key: 'all', label: 'Tous les équipements' },
    { key: 'gaz', label: '🔥 Gaz' },
    { key: 'electrique', label: '⚡ Électrique / PAC' },
    { key: 'biomasse', label: '🌳 Biomasse' },
    { key: 'solaire', label: '☀️ Solaire' }
  ];

  var currentFilter = 'all';

  function fmt(n) { return n.toLocaleString('fr-FR') + ' €'; }

  function buildCard(p) {
    var prix = fmt(p.prix_pose_min) + ' – ' + fmt(p.prix_pose_max);
    var aides = p.aides_max > 0 ? '<div class="hc-cmp-aides">💰 Aides jusqu\'à <strong>' + fmt(p.aides_max) + '</strong></div>' : '<div class="hc-cmp-aides" style="background:rgba(148,163,184,.10);color:#64748b">⊘ Non éligible MPR</div>';
    var plus = p.avantages.map(function (a) { return '<li>' + a + '</li>'; }).join('');
    var moins = p.inconvenients.map(function (a) { return '<li>' + a + '</li>'; }).join('');
    return '\
    <article class="hc-cmp-card" data-energie="' + p.energie + '">\
      <span class="hc-cmp-badge ' + p.energie + '">' + p.energie + '</span>\
      <h3>' + p.label + '</h3>\
      <p class="hc-cmp-marque">' + p.marque + '</p>\
      <div class="hc-cmp-specs">\
        <div class="hc-cmp-spec"><strong>' + p.rendement + '%</strong>Rendement</div>\
        <div class="hc-cmp-spec"><strong>' + p.puissance + '</strong>Capacité</div>\
        ' + (p.surface_max ? '<div class="hc-cmp-spec"><strong>' + p.surface_max + ' m²</strong>Surface max</div>' : '') + '\
        <div class="hc-cmp-spec"><strong>' + p.garantie + '</strong>Garantie</div>\
      </div>\
      <div class="hc-cmp-prix">\
        <span class="hc-cmp-prix-label">Pose</span>\
        <span class="hc-cmp-prix-amount">' + prix + '</span>\
      </div>\
      ' + aides + '\
      <ul class="hc-cmp-list plus">' + plus + '</ul>\
      <ul class="hc-cmp-list moins">' + moins + '</ul>\
      <a href="contact.html?presta=Chauffage&objet=Devis+' + encodeURIComponent(p.label) + '#form" class="hc-cmp-cta">Devis ' + p.label.split(' ')[0] + ' →</a>\
    </article>';
  }

  function render(el) {
    var grid = el.querySelector('.hc-cmp-grid');
    var filtered = PRODUITS.filter(function (p) {
      return currentFilter === 'all' || p.energie === currentFilter;
    });
    grid.innerHTML = filtered.map(buildCard).join('');
  }

  function build(el) {
    el.innerHTML = '\
    <div class="hc-cmp">\
      <div class="hc-cmp-head">\
        <span class="hc-cmp-eyebrow">Comparateur 2026</span>\
        <h2>Chaudière, PAC ou <em>chauffe-eau</em>&nbsp;?</h2>\
        <p class="hc-cmp-sub">Comparez les principaux équipements de chauffage et de production d\'eau chaude. Prix posés, aides 2026, avantages et inconvénients en un coup d\'œil.</p>\
      </div>\
      <div class="hc-cmp-filters">' +
        FILTERS.map(function (f) {
          return '<button class="hc-cmp-fbtn ' + (f.key === currentFilter ? 'is-active' : '') + '" data-filter="' + f.key + '">' + f.label + '</button>';
        }).join('') + '\
      </div>\
      <div class="hc-cmp-grid"></div>\
    </div>';

    render(el);

    el.querySelectorAll('.hc-cmp-fbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentFilter = btn.dataset.filter;
        el.querySelectorAll('.hc-cmp-fbtn').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        render(el);
      });
    });
  }

  function init() {
    if (!document.getElementById('hc-cmp-style')) {
      var st = document.createElement('style');
      st.id = 'hc-cmp-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-comparateur]').forEach(function (el) {
      if (el.dataset.hcCmpDone) return;
      el.dataset.hcCmpDone = '1';
      build(el);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
