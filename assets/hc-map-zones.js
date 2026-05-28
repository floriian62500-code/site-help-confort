/* ============================================================
   HC-MAP-ZONES — Carte interactive Leaflet zones d'intervention
   Marqueurs 4 grandes villes + sous-communes
   Utilisation : <div data-hc-map-zones></div>
   ============================================================ */
(function () {
  'use strict';

  var ZONES = [
    {
      name: 'Saint-Omer', cp: '62500', zone: 'Audomarois',
      lat: 50.7508, lng: 2.2522, color: '#FF6B1A',
      url: 'depannage-saint-omer.html',
      desc: 'Agence Dépan\'Audo · siège historique',
      subs: [
        { name: 'Longuenesse', cp: '62219', lat: 50.7392, lng: 2.2331 },
        { name: 'Arques', cp: '62510', lat: 50.7397, lng: 2.3056 },
        { name: 'Saint-Martin-lez-Tatinghem', cp: '62500', lat: 50.7497, lng: 2.2256 },
        { name: 'Wizernes', cp: '62570', lat: 50.7236, lng: 2.2106 },
        { name: 'Blendecques', cp: '62575', lat: 50.7253, lng: 2.2417 },
        { name: 'Aire-sur-la-Lys', cp: '62120', lat: 50.6356, lng: 2.3956 },
        { name: 'Lumbres', cp: '62380', lat: 50.7081, lng: 2.1267 }
      ]
    },
    {
      name: 'Dunkerque', cp: '59140', zone: 'Dunkerquois',
      lat: 51.0344, lng: 2.3768, color: '#0DA0CF',
      url: 'depannage-dunkerque.html',
      desc: 'Agence Dépan\'DK · littoral',
      subs: [
        { name: 'Saint-Pol-sur-Mer', cp: '59430', lat: 51.0258, lng: 2.3386 },
        { name: 'Coudekerque-Branche', cp: '59210', lat: 51.0292, lng: 2.4011 },
        { name: 'Bergues', cp: '59380', lat: 50.9683, lng: 2.4308 },
        { name: 'Gravelines', cp: '59820', lat: 50.9847, lng: 2.1267 },
        { name: 'Grande-Synthe', cp: '59760', lat: 51.0153, lng: 2.2972 },
        { name: 'Téteghem', cp: '59229', lat: 51.0181, lng: 2.4486 },
        { name: 'Bray-Dunes', cp: '59123', lat: 51.0719, lng: 2.5181 }
      ]
    },
    {
      name: 'Calais', cp: '62100', zone: 'Calaisis',
      lat: 50.9513, lng: 1.8587, color: '#FFB400',
      url: 'depannage-calais.html',
      desc: 'Zone Cité de l\'Europe',
      subs: [
        { name: 'Coquelles', cp: '62231', lat: 50.9311, lng: 1.8131 },
        { name: 'Sangatte', cp: '62231', lat: 50.9417, lng: 1.7456 },
        { name: 'Marck', cp: '62730', lat: 50.9603, lng: 1.9550 },
        { name: 'Coulogne', cp: '62137', lat: 50.9244, lng: 1.8786 },
        { name: 'Guînes', cp: '62340', lat: 50.8650, lng: 1.8697 }
      ]
    },
    {
      name: 'Boulogne-sur-Mer', cp: '62200', zone: 'Boulonnais',
      lat: 50.7264, lng: 1.6147, color: '#22C55E',
      url: 'depannage-boulogne-sur-mer.html',
      desc: 'Port + agglo CAB',
      subs: [
        { name: 'Saint-Martin-Boulogne', cp: '62280', lat: 50.7242, lng: 1.6308 },
        { name: 'Outreau', cp: '62230', lat: 50.7044, lng: 1.5828 },
        { name: 'Le Portel', cp: '62480', lat: 50.7081, lng: 1.5697 },
        { name: 'Wimereux', cp: '62930', lat: 50.7706, lng: 1.6094 },
        { name: 'Saint-Léonard', cp: '62360', lat: 50.6961, lng: 1.6336 },
        { name: 'Équihen-Plage', cp: '62224', lat: 50.6803, lng: 1.5739 }
      ]
    }
  ];

  var CSS = '\
.hc-map-section{padding:60px 20px 80px;background:#F7FBFD}\
.hc-map-wrap{max-width:1180px;margin:0 auto}\
.hc-map-head{text-align:center;margin-bottom:32px;max-width:760px;margin-left:auto;margin-right:auto}\
.hc-map-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(13,160,207,.10);color:#0DA0CF;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}\
.hc-map-eyebrow::before{content:"🗺️"}\
.hc-map-head h2{font-family:"Inter",sans-serif;font-size:clamp(1.7rem,3.5vw,2.4rem);font-weight:800;color:#0A1428;margin:0 0 12px;letter-spacing:-.022em;line-height:1.2}\
.hc-map-head h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}\
.hc-map-head p{color:#475569;margin:0;font-size:1rem;line-height:1.55}\
.hc-map-container{position:relative;border-radius:20px;overflow:hidden;border:1px solid #E5EDF3;box-shadow:0 14px 40px rgba(10,20,40,.10);background:#fff}\
#hcMapEl{height:520px;background:#E5EDF3}\
.hc-map-legend{position:absolute;top:14px;left:14px;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-radius:12px;padding:12px 14px;box-shadow:0 6px 18px rgba(10,20,40,.10);z-index:400;font-size:.78rem;color:#475569;line-height:1.5;max-width:200px}\
.hc-map-legend strong{display:block;color:#0A1428;font-weight:800;margin-bottom:6px;font-size:.82rem}\
.hc-map-legend-row{display:flex;align-items:center;gap:7px;margin-bottom:3px}\
.hc-map-legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px rgba(255,255,255,.9)}\
.hc-map-info{padding:20px 24px;background:linear-gradient(135deg,#0A1428,#172240);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}\
.hc-map-info-stats{display:flex;gap:20px;flex-wrap:wrap}\
.hc-map-info-stat{display:flex;flex-direction:column;line-height:1.2}\
.hc-map-info-stat strong{color:#1FC4F0;font-size:1.4rem;font-weight:800;letter-spacing:-.02em}\
.hc-map-info-stat span{color:rgba(255,255,255,.65);font-size:.74rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em}\
.hc-map-info a{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:#FF6B1A;color:#fff;border-radius:10px;text-decoration:none;font-size:.92rem;font-weight:700;transition:transform .2s ease,box-shadow .2s ease}\
.hc-map-info a:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(255,107,26,.40)}\
.hc-marker-main{background:transparent;border:none}\
.hc-marker-pin{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;color:#fff;font-weight:900;font-size:1rem;box-shadow:0 6px 16px rgba(0,0,0,.30);border:3px solid #fff;transition:transform .2s ease}\
.hc-marker-pin:hover{transform:scale(1.1);cursor:pointer}\
.hc-marker-sub{background:transparent;border:none}\
.hc-marker-sub-dot{width:14px;height:14px;border-radius:50%;background:#475569;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.25);cursor:pointer;transition:transform .2s ease}\
.hc-marker-sub-dot:hover{transform:scale(1.4);background:#0DA0CF}\
.leaflet-popup-content-wrapper{border-radius:14px !important;box-shadow:0 18px 40px rgba(10,20,40,.20) !important}\
.leaflet-popup-content{margin:14px 18px !important;font-family:"Inter",sans-serif !important;font-size:.88rem !important;line-height:1.5 !important}\
.leaflet-popup-content strong{color:#0A1428;font-weight:800;font-size:1.02rem;display:block;margin-bottom:4px}\
.leaflet-popup-content small{color:#94a3b8;font-size:.74rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase}\
.leaflet-popup-content a{display:inline-flex;align-items:center;gap:5px;color:#0DA0CF;font-weight:700;font-size:.86rem;text-decoration:none;margin-top:6px}\
.leaflet-popup-content a:hover{color:#FF6B1A}';

  function injectCSS() {
    if (document.getElementById('hc-map-style')) return;
    var st = document.createElement('style');
    st.id = 'hc-map-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    // CSS Leaflet
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
    // JS Leaflet
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = cb;
    document.head.appendChild(script);
  }

  function buildSection() {
    return '\
    <section class="hc-map-section" aria-label="Carte des zones d\'intervention">\
      <div class="hc-map-wrap">\
        <div class="hc-map-head">\
          <span class="hc-map-eyebrow">Zones d\'intervention</span>\
          <h2>Notre <em>zone d\'intervention</em> sur la carte</h2>\
          <p>Cliquez sur un marqueur pour voir les détails de chaque ville et accéder à sa page dédiée.</p>\
        </div>\
        <div class="hc-map-container">\
          <div class="hc-map-legend">\
            <strong>Légende</strong>\
            <div class="hc-map-legend-row"><span class="hc-map-legend-dot" style="background:#FF6B1A"></span>Saint-Omer</div>\
            <div class="hc-map-legend-row"><span class="hc-map-legend-dot" style="background:#0DA0CF"></span>Dunkerque</div>\
            <div class="hc-map-legend-row"><span class="hc-map-legend-dot" style="background:#FFB400"></span>Calais</div>\
            <div class="hc-map-legend-row"><span class="hc-map-legend-dot" style="background:#22C55E"></span>Boulogne</div>\
          </div>\
          <div id="hcMapEl" role="application" aria-label="Carte interactive Leaflet"></div>\
          <div class="hc-map-info">\
            <div class="hc-map-info-stats">\
              <div class="hc-map-info-stat"><strong>4</strong><span>zones principales</span></div>\
              <div class="hc-map-info-stat"><strong>80+</strong><span>communes</span></div>\
              <div class="hc-map-info-stat"><strong>2</strong><span>agences locales</span></div>\
            </div>\
            <a href="nos-villes.html">Voir toutes nos villes →</a>\
          </div>\
        </div>\
      </div>\
    </section>';
  }

  function buildMap() {
    var L = window.L;
    var map = L.map('hcMapEl', {
      center: [50.92, 2.05],
      zoom: 9,
      scrollWheelZoom: false,
      zoomControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    // Activer scroll wheel quand cliqué dedans
    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });

    ZONES.forEach(function (z) {
      // Marqueur principal (grosse pastille)
      var mainIcon = L.divIcon({
        className: 'hc-marker-main',
        html: '<div class="hc-marker-pin" style="background:' + z.color + '">' + z.name.substring(0, 1) + '</div>',
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });
      var mainMarker = L.marker([z.lat, z.lng], { icon: mainIcon }).addTo(map);
      mainMarker.bindPopup(
        '<small style="color:' + z.color + '">' + z.zone + ' · ' + z.cp + '</small>' +
        '<strong>' + z.name + '</strong>' +
        z.desc + '<br>' +
        '<a href="' + z.url + '">Voir la page ' + z.name + ' →</a>'
      );

      // Sous-communes (petites pastilles)
      z.subs.forEach(function (s) {
        var subIcon = L.divIcon({
          className: 'hc-marker-sub',
          html: '<div class="hc-marker-sub-dot" style="background:' + z.color + ';opacity:.7"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        var subMarker = L.marker([s.lat, s.lng], { icon: subIcon }).addTo(map);
        subMarker.bindPopup(
          '<small>' + z.zone + ' · ' + s.cp + '</small>' +
          '<strong>' + s.name + '</strong>' +
          'Rattaché à ' + z.name + '<br>' +
          '<a href="' + z.url + '">Voir ' + z.name + ' →</a>'
        );
      });
    });

    // Fit bounds aux 4 grandes villes
    var bounds = L.latLngBounds(ZONES.map(function (z) { return [z.lat, z.lng]; }));
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  function inject() {
    injectCSS();
    document.querySelectorAll('[data-hc-map-zones]').forEach(function (el) {
      if (el.dataset.hcMapDone) return;
      el.dataset.hcMapDone = '1';
      el.innerHTML = buildSection();
      // Observer pour init seulement quand visible (lazy)
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.disconnect();
            loadLeaflet(buildMap);
          }
        });
      }, { rootMargin: '100px' });
      io.observe(el);
    });
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
