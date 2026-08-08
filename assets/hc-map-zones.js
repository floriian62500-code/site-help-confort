/* ============================================================
   HC-MAP-ZONES — Carte interactive Leaflet zones d'intervention
   V3 (2026-05-30) — 4 villes + polygone zone + tiles CartoDB neutres
   Utilisation : <div data-hc-map-zones></div>
   ============================================================ */
(function () {
  'use strict';

  // 4 villes principales — 2 agences + 2 zones intervention élargies
  var VILLES = [
    {
      name: 'Saint-Omer', cp: '62500', zone: 'Audomarois',
      lat: 50.7508, lng: 2.2522, color: '#FF6B1A',
      role: 'agence',
      url: 'depannage-saint-omer.html',
      desc: "Agence Dépan'Audo · siège historique"
    },
    {
      name: 'Dunkerque', cp: '59140', zone: 'Dunkerquois',
      lat: 51.0344, lng: 2.3768, color: '#0DA0CF',
      role: 'agence',
      url: 'depannage-dunkerque.html',
      desc: "Agence Dépan'DK · littoral"
    },
    {
      name: 'Calais', cp: '62100', zone: 'Calaisis',
      lat: 50.9513, lng: 1.8587, color: '#FFB400',
      role: 'zone',
      url: 'depannage-calais.html',
      desc: "Zone Cité de l'Europe · Côte d'Opale"
    },
    {
      name: 'Boulogne-sur-Mer', cp: '62200', zone: 'Boulonnais',
      lat: 50.7264, lng: 1.6147, color: '#22C55E',
      role: 'zone',
      url: 'depannage-boulogne-sur-mer.html',
      desc: "Port + agglomération CAB · sud Côte d'Opale"
    }
  ];

  // Polygone englobant la zone d'intervention complète (Côte d'Opale + arrière-pays + Audomarois + Dunkerquois)
  // Trace approximative basée sur les frontières naturelles des bassins
  var POLYGON_ZONE = [
    [51.090, 1.520],  // NW Cap Gris-Nez
    [51.090, 2.580],  // NE Bray-Dunes
    [50.960, 2.690],  // E Bergues
    [50.620, 2.520],  // SE Aire-sur-la-Lys / Hazebrouck
    [50.560, 2.280],  // S Lillers
    [50.520, 1.940],  // SW Desvres
    [50.580, 1.560],  // SSW arrière-pays boulonnais
    [50.700, 1.500],  // W Wimereux
    [50.860, 1.480]   // NW Cap Blanc-Nez
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
#hcMapEl{height:560px;background:#E5EDF3}\
.hc-map-legend{position:absolute;top:14px;left:14px;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-radius:14px;padding:14px 16px;box-shadow:0 8px 22px rgba(10,20,40,.12);z-index:400;font-size:.78rem;color:#475569;line-height:1.55;max-width:230px;border:1px solid rgba(13,160,207,.12)}\
.hc-map-legend strong{display:block;color:#0A1428;font-weight:800;margin-bottom:8px;font-size:.86rem}\
.hc-map-legend-row{display:flex;align-items:center;gap:8px;margin-bottom:5px}\
.hc-map-legend-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px rgba(255,255,255,.9)}\
.hc-map-legend-zone{display:inline-block;width:18px;height:11px;border:1.5px dashed #0DA0CF;background:rgba(13,160,207,.10);border-radius:2px;flex-shrink:0;margin-right:8px}\
.hc-map-info{padding:22px 26px;background:linear-gradient(135deg,#0A1428,#172240);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}\
.hc-map-info-stats{display:flex;gap:24px;flex-wrap:wrap}\
.hc-map-info-stat{display:flex;flex-direction:column;line-height:1.2}\
.hc-map-info-stat strong{color:#1FC4F0;font-size:1.5rem;font-weight:800;letter-spacing:-.02em}\
.hc-map-info-stat span{color:rgba(255,255,255,.65);font-size:.74rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em}\
.hc-map-info a{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:#FF6B1A;color:#fff;border-radius:10px;text-decoration:none;font-size:.94rem;font-weight:700;transition:transform .2s ease,box-shadow .2s ease}\
.hc-map-info a:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(255,107,26,.40)}\
.hc-city{background:transparent;border:0}\
.hc-city-dot{width:16px;height:16px;border-radius:50%;background:#1D6FE0;border:3px solid #fff;box-shadow:0 2px 6px rgba(10,30,80,.40);transition:transform .2s ease}\
.hc-city:hover .hc-city-dot{transform:scale(1.18);cursor:pointer}\
.hc-city.sec .hc-city-dot{width:11px;height:11px;background:#fff;border:2px solid #1D6FE0;box-shadow:0 1px 3px rgba(10,30,80,.30)}\
.leaflet-tooltip.hc-lbl{background:transparent;border:0;box-shadow:none;color:#12408A;font-weight:800;font-size:.92rem;padding:0;white-space:nowrap;text-shadow:0 0 3px #fff,0 0 6px #fff,0 1px 2px #fff}\
.leaflet-tooltip.hc-lbl.sec{color:#5b7a9c;font-weight:600;font-size:.76rem}\
.leaflet-tooltip.hc-lbl:before{display:none !important}\
.leaflet-popup-content-wrapper{border-radius:14px !important;box-shadow:0 18px 40px rgba(10,20,40,.20) !important;padding:0 !important}\
.leaflet-popup-content{margin:14px 18px !important;font-family:"Inter",sans-serif !important;font-size:.88rem !important;line-height:1.5 !important}\
.leaflet-popup-content strong{color:#0A1428;font-weight:800;font-size:1.04rem;display:block;margin-bottom:4px}\
.leaflet-popup-content small{color:#94a3b8;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}\
.leaflet-popup-content a{display:inline-flex;align-items:center;gap:5px;color:#0DA0CF;font-weight:700;font-size:.86rem;text-decoration:none;margin-top:8px}\
.leaflet-popup-content a:hover{color:#FF6B1A}\
.leaflet-control-attribution{font-size:.62rem !important;background:rgba(255,255,255,.85) !important}\
/* Anti-drapeau Ukraine : masquer tout overlay tiers depuis attribution, alt, src ou class */\
.leaflet-container a[href*="ukraine" i],\
.leaflet-container img[src*="ukraine" i],\
.leaflet-container img[alt*="ukraine" i],\
.leaflet-container [class*="ukraine" i],\
.leaflet-container [style*="ukraine" i],\
.leaflet-control-attribution a[href*="osm"],\
.leaflet-control-attribution a[href*="openstreetmap"]{display:none !important;visibility:hidden !important;width:0 !important;height:0 !important}';

  function injectCSS() {
    if (document.getElementById('hc-map-style')) return;
    var st = document.createElement('style');
    st.id = 'hc-map-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
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
          <h2>Toute la <em>Côte d\'Opale</em> &amp; l\'arrière-pays</h2>\
          <p>De Saint-Omer à Boulogne-sur-Mer en passant par Calais et Dunkerque — nos 2 agences locales couvrent la totalité du Pas-de-Calais nord et du Dunkerquois. Cliquez sur un marqueur pour voir les détails.</p>\
        </div>\
        <div class="hc-map-container">\
          <div id="hcMapEl" role="application" aria-label="Carte interactive des zones d\'intervention HELP Confort"></div>\
        </div>\
      </div>\
    </section>';
  }

  function killUkraineOverlay() {
    // Boucle pour zapper tout élément qui contient "ukrain" dans son contenu/attributs
    try {
      document.querySelectorAll('#hcMapEl *').forEach(function (el) {
        var blob = (el.outerHTML || '').toLowerCase();
        if (blob.indexOf('ukrain') !== -1 || blob.indexOf('🇺🇦') !== -1) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });
      // Attribution Leaflet : remplacer entièrement
      var attr = document.querySelector('#hcMapEl .leaflet-control-attribution');
      if (attr) attr.innerHTML = 'Tuiles © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>';
    } catch (e) {}
  }

  function buildMap() {
    var L = window.L;
    var map = L.map('hcMapEl', {
      center: [50.85, 1.95],
      zoom: 9,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true
    });

    // Tiles CartoDB Positron (light_all) — fond clair minimal, labels discrets
    // → nos labels de villes ressortent, plus de collision visuelle. Aspect premium/épuré.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: 'Tuiles © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Kill overlay drapeau Ukraine après chargement + tous les 2s pendant 10s (parano)
    setTimeout(killUkraineOverlay, 300);
    setTimeout(killUkraineOverlay, 1500);
    setTimeout(killUkraineOverlay, 3000);
    setTimeout(killUkraineOverlay, 6000);

    map.on('focus', function () { map.scrollWheelZoom.enable(); });
    map.on('blur', function () { map.scrollWheelZoom.disable(); });

    // ─── Halo de couverture unique, doux (style référence Florian) ───
    L.circle([50.86, 2.02], {
      radius: 34000,
      color: '#2563EB', weight: 1.5, opacity: 0.35,
      fillColor: '#3B82F6', fillOpacity: 0.16
    }).addTo(map);

    // ─── Villes principales : point bleu + label permanent (façon référence) ───
    VILLES.forEach(function (v) {
      var dir = (v.name === 'Dunkerque') ? 'left' : 'right';
      var icon = L.divIcon({ className: 'hc-city', html: '<div class="hc-city-dot"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
      var marker = L.marker([v.lat, v.lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
      marker.bindTooltip(v.name, { permanent: true, direction: dir, offset: dir === 'left' ? [-9, 0] : [9, 0], className: 'hc-lbl' });
      marker.bindPopup(
        '<small>' + (v.role === 'agence' ? 'Agence locale' : 'Zone d\'intervention') + ' · ' + v.zone + ' · ' + v.cp + '</small>' +
        '<strong>' + v.name + '</strong>' + v.desc + '<br>' +
        '<a href="' + v.url + '">Voir la page ' + v.name + ' →</a>'
      );
    });

    // ─── Communes secondaires : point creux + label discret (densité, comme la référence) ───
    [
      { name: 'Gravelines', lat: 50.987, lng: 2.128, dir: 'top' },
      { name: 'Bourbourg', lat: 50.948, lng: 2.194, dir: 'right' },
      { name: 'Watten', lat: 50.834, lng: 2.213, dir: 'right' },
      { name: 'Guînes', lat: 50.869, lng: 1.867, dir: 'left' }
    ].forEach(function (c) {
      var icon = L.divIcon({ className: 'hc-city sec', html: '<div class="hc-city-dot"></div>', iconSize: [11, 11], iconAnchor: [6, 6] });
      var off = c.dir === 'left' ? [-7, 0] : c.dir === 'top' ? [0, -7] : [7, 0];
      L.marker([c.lat, c.lng], { icon: icon, interactive: false, zIndexOffset: 300 }).addTo(map)
        .bindTooltip(c.name, { permanent: true, direction: c.dir, offset: off, className: 'hc-lbl sec' });
    });

    // Cadrage DÉTERMINISTE sur la couverture réelle (Boulogne SW → Bray-Dunes NE) :
    // couvre les 4 villes quel que soit le ratio du conteneur (hero portrait ou section large).
    // Le fitBounds sur les cercles dérivait vers l'est (mer + Belgique) dans le bloc hero.
    // Centre FIXE entre les 4 villes ; le zoom s'adapte à la largeur du conteneur
    // (hero étroit ≈ 530px → zoom 9 ; section pleine largeur → zoom 10).
    // fitBounds recalculait un centre/zoom erroné dans le bloc hero → on fige le centre.
    function refit(){
      try {
        map.invalidateSize(false);
        var el = document.getElementById('hcMapEl');
        var wide = el && el.offsetWidth > 760;
        map.setView([50.82, 2.02], wide ? 10 : 9, { animate: false });
      } catch (e) {}
    }
    refit();
    // HC-FIX 2026-08-08 : forcer invalidateSize après stabilisation du layout
    // (conteneur hero-droite redimensionné après init → Leaflet n'affichait que la mer).
    [60, 250, 700, 1500].forEach(function (ms) { setTimeout(refit, ms); });
    window.addEventListener('load', refit, { once: true });
    // Recalcule dès que le conteneur change de taille (responsive, fonts, hero)
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { refit(); });
      ro.observe(document.getElementById('hcMapEl'));
    }
  }

  function inject() {
    injectCSS();
    document.querySelectorAll('[data-hc-map-zones]').forEach(function (el) {
      if (el.dataset.hcMapDone) return;
      el.dataset.hcMapDone = '1';
      el.innerHTML = buildSection();
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
