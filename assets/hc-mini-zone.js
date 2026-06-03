/* HELP Confort — Mini carte zone de chalandise par ville
 * 2026-06-03 : pour chaque page ville (page satellite), affiche une mini-carte
 *              avec un cercle de chalandise autour de la commune.
 * Usage : <div data-hc-mini-zone="ville-slug"></div>
 *         (le slug est lookupé dans VILLES_FR ci-dessous)
 */
(function () {
  'use strict';

  // Lookup table villes (lat, lng, rayon km, secteur)
  var VILLES_FR = {
    'saint-omer':              { lat: 50.7508, lng: 2.2522, r: 25, secteur: 'Audomarois',     agence: 'Saint-Omer' },
    'longuenesse':             { lat: 50.7400, lng: 2.2300, r: 20, secteur: 'Audomarois',     agence: 'Saint-Omer' },
    'arques':                  { lat: 50.7400, lng: 2.3050, r: 20, secteur: 'Audomarois',     agence: 'Saint-Omer' },
    'saint-martin-lez-tatinghem':{lat: 50.7454, lng: 2.2356, r: 20, secteur: 'Audomarois',    agence: 'Saint-Omer' },
    'dunkerque':               { lat: 51.0344, lng: 2.3768, r: 25, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'coudekerque-branche':     { lat: 51.0322, lng: 2.3522, r: 15, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'saint-pol-sur-mer':       { lat: 51.0344, lng: 2.3358, r: 15, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'gravelines':              { lat: 50.9869, lng: 2.1267, r: 15, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'bergues':                 { lat: 50.9694, lng: 2.4317, r: 12, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'bray-dunes':              { lat: 51.0775, lng: 2.5247, r: 12, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'sangatte':                { lat: 50.9483, lng: 1.7544, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'calais':                  { lat: 50.9513, lng: 1.8587, r: 20, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'coquelles':               { lat: 50.9319, lng: 1.7958, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'coulogne':                { lat: 50.9269, lng: 1.8753, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'marck':                   { lat: 50.9444, lng: 1.9436, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'guines':                  { lat: 50.8689, lng: 1.8714, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'ardres':                  { lat: 50.8553, lng: 1.9794, r: 12, secteur: 'Calaisis',       agence: 'Dunkerque' },
    'boulogne-sur-mer':        { lat: 50.7264, lng: 1.6147, r: 20, secteur: 'Boulonnais',     agence: 'Saint-Omer' },
    'saint-martin-boulogne':   { lat: 50.7300, lng: 1.6500, r: 12, secteur: 'Boulonnais',     agence: 'Saint-Omer' },
    'outreau':                 { lat: 50.7044, lng: 1.5917, r: 12, secteur: 'Boulonnais',     agence: 'Saint-Omer' },
    'le-portel':               { lat: 50.7058, lng: 1.5689, r: 12, secteur: 'Boulonnais',     agence: 'Saint-Omer' },
    'wimereux':                { lat: 50.7656, lng: 1.6072, r: 12, secteur: 'Boulonnais',     agence: 'Saint-Omer' },
    'teteghem':                { lat: 51.0233, lng: 2.4361, r: 12, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'grande-synthe':           { lat: 51.0167, lng: 2.2997, r: 15, secteur: 'Dunkerquois',    agence: 'Dunkerque' },
    'longuenesse-saint-omer':  { lat: 50.7400, lng: 2.2300, r: 18, secteur: 'Audomarois',     agence: 'Saint-Omer' }
  };

  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function inject(root) {
    if (root.dataset.hcMzDone) return;
    root.dataset.hcMzDone = '1';
    var slug = (root.getAttribute('data-hc-mini-zone') || '').toLowerCase().trim();
    var v = VILLES_FR[slug];
    if (!v) { root.innerHTML = ''; return; }

    var color = v.agence === 'Dunkerque' ? '#0DA0CF' : '#FF6B1A';
    var name = slug.split('-').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join('-');

    root.innerHTML =
      '<section style="padding:50px 20px;background:#F7FBFD;border-top:1px solid #E5EDF3;border-bottom:1px solid #E5EDF3">' +
        '<div style="max-width:1080px;margin:0 auto">' +
          '<div style="text-align:center;margin-bottom:24px">' +
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(13,160,207,.10);color:#0DA0CF;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">🗺️ Zone de chalandise</span>' +
            '<h2 style="font-family:Inter,sans-serif;font-size:clamp(1.4rem,2.6vw,2rem);font-weight:800;color:#0A1428;margin:8px 0 6px;letter-spacing:-.02em">Notre rayon d\'intervention autour de <em style="font-family:Playfair Display,Georgia,serif;font-style:italic;color:' + color + ';font-weight:600">' + name + '</em></h2>' +
            '<p style="color:#475569;margin:0;font-size:.94rem">Secteur <strong>' + v.secteur + '</strong> · Agence <strong>HELP Confort ' + v.agence + '</strong> · Rayon ~' + v.r + ' km · Devis sous 24h ouvré</p>' +
          '</div>' +
          '<div id="hcMz-' + slug + '" style="height:340px;border-radius:14px;overflow:hidden;border:1px solid #E5EDF3;box-shadow:0 8px 22px rgba(10,20,40,.06);background:#E5EDF3"></div>' +
        '</div>' +
      '</section>';

    loadLeaflet(function () {
      var L = window.L;
      var map = L.map('hcMz-' + slug, {
        center: [v.lat, v.lng],
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: 'Tuiles © CARTO',
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(map);

      var circle = L.circle([v.lat, v.lng], {
        radius: v.r * 1000,
        color: color, weight: 3, opacity: 1,
        fillColor: color, fillOpacity: 0.18
      }).addTo(map);

      var icon = L.divIcon({
        className: '',
        html: '<div style="width:36px;height:36px;border-radius:50%;background:' + color + ';border:3px solid #fff;box-shadow:0 6px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem">★</div>',
        iconSize: [36, 36], iconAnchor: [18, 18]
      });
      L.marker([v.lat, v.lng], { icon: icon }).addTo(map).bindPopup('<strong>' + name + '</strong><br>Rayon d\'intervention HC : ' + v.r + ' km');

      map.fitBounds(circle.getBounds(), { padding: [20, 20] });
    });
  }

  function init() {
    document.querySelectorAll('[data-hc-mini-zone]').forEach(inject);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
