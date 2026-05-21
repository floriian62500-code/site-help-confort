/* ═══════════════════════════════════════════════════════════════
   HC-FORM-AUTOCOMPLETE — autocomplete email + adresse postale
   ═══════════════════════════════════════════════════════════════
   S'auto-applique à :
   - tout input[type="email"]                     → suggestions domaines après @
   - tout input[name="adresse"], [data-autocomplete-address]
                                                  → autocomplete adresse complète
                                                    (API api-adresse.data.gouv.fr)
   - tout input[name="ville"] sans data-autocomplete-skip
                                                  → autocomplete ville uniquement
                                                    (API api-adresse.data.gouv.fr type=municipality)

   Données extra :
   - Lorsqu'un input adresse est rempli via clic, deux champs cachés
     "ville" et "code_postal" du même <form> se remplissent automatiquement
     s'ils existent.

   À inclure une seule fois par page : <script src="assets/hc-form-autocomplete.js" defer></script>
   ─────────────────────────────────────────────────────────────── */
(function() {
  'use strict';

  // ─── Domaines email courants (FR) ───
  var EMAIL_DOMAINS = [
    'gmail.com', 'hotmail.fr', 'hotmail.com', 'outlook.fr', 'outlook.com',
    'yahoo.fr', 'yahoo.com', 'free.fr', 'orange.fr', 'sfr.fr',
    'laposte.net', 'wanadoo.fr', 'live.fr', 'bbox.fr', 'numericable.fr',
    'aol.com', 'icloud.com', 'me.com'
  ];

  var GOUV_URL = 'https://api-adresse.data.gouv.fr/search/';
  var datalistCounter = 0;
  var suggestBoxCounter = 0;

  // ═══ EMAIL AUTOCOMPLETE ═══
  function attachEmailAutocomplete(input) {
    if (input.dataset.hcEmailAuto === '1') return;
    input.dataset.hcEmailAuto = '1';

    // Créer (ou réutiliser) le datalist
    var listId = 'hc-email-list-' + (++datalistCounter);
    var dl = document.createElement('datalist');
    dl.id = listId;
    input.parentNode.insertBefore(dl, input.nextSibling);
    input.setAttribute('list', listId);

    input.addEventListener('input', function() {
      var v = input.value;
      var at = v.indexOf('@');
      dl.innerHTML = '';
      if (at >= 0) {
        var prefix = v.slice(0, at + 1);
        var q = v.slice(at + 1).toLowerCase();
        EMAIL_DOMAINS
          .filter(function(d) { return d.startsWith(q); })
          .slice(0, 6)
          .forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = prefix + d;
            dl.appendChild(opt);
          });
      }
    });
  }

  // ═══ ADRESSE AUTOCOMPLETE ═══
  function attachAddressAutocomplete(input, opts) {
    if (input.dataset.hcAddrAuto === '1') return;
    input.dataset.hcAddrAuto = '1';

    opts = opts || {};
    var villeOnly = !!opts.villeOnly;

    // Wrapper en position relative si pas déjà fait
    var parent = input.parentNode;
    var prevPos = window.getComputedStyle(parent).position;
    if (prevPos === 'static') parent.style.position = 'relative';

    // Box de suggestions
    var boxId = 'hc-addr-box-' + (++suggestBoxCounter);
    var box = document.createElement('div');
    box.id = boxId;
    box.className = 'hc-addr-suggest';
    box.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #E5EDF3;border-radius:10px;margin-top:4px;box-shadow:0 12px 32px rgba(10,20,40,.12);max-height:240px;overflow-y:auto;z-index:50;display:none;font-size:.92rem';
    input.parentNode.insertBefore(box, input.nextSibling);

    var debounceTimer = null;

    input.addEventListener('input', function() {
      var q = input.value.trim();
      // Reset cachés
      var form = input.form;
      if (form && !villeOnly) {
        var vh = form.querySelector('input[name="ville"]');
        var ch = form.querySelector('input[name="code_postal"]');
        if (vh && vh !== input) vh.value = '';
        if (ch) ch.value = '';
      }
      clearTimeout(debounceTimer);
      if (q.length < (villeOnly ? 2 : 4)) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(function() {
        var url = GOUV_URL + '?q=' + encodeURIComponent(q) + '&limit=6&autocomplete=1';
        if (villeOnly) url += '&type=municipality';
        fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(j) {
            if (!j.features || !j.features.length) {
              box.style.display = 'none';
              return;
            }
            box.innerHTML = j.features.map(function(f) {
              var p = f.properties;
              var label = p.label || ((p.name || '') + ' ' + (p.postcode || '') + ' ' + (p.city || ''));
              return '<div class="hc-addr-sugg" data-label="' + label.replace(/"/g, '&quot;') +
                     '" data-ville="' + (p.city || '').replace(/"/g, '&quot;') +
                     '" data-cp="' + (p.postcode || '') +
                     '" data-name="' + (p.name || '').replace(/"/g, '&quot;') +
                     '" style="padding:10px 14px;cursor:pointer;border-bottom:1px solid #F0F4F7;line-height:1.4">' + label + '</div>';
            }).join('');
            box.style.display = 'block';
            box.querySelectorAll('.hc-addr-sugg').forEach(function(el) {
              el.addEventListener('mouseenter', function() { el.style.background = '#F7FBFD'; });
              el.addEventListener('mouseleave', function() { el.style.background = '#fff'; });
              el.addEventListener('click', function() {
                if (villeOnly) {
                  input.value = el.dataset.ville || el.dataset.label;
                } else {
                  input.value = el.dataset.label;
                  var form = input.form;
                  if (form) {
                    var vh = form.querySelector('input[name="ville"]');
                    var ch = form.querySelector('input[name="code_postal"]');
                    if (vh && vh !== input) vh.value = el.dataset.ville || '';
                    if (ch) ch.value = el.dataset.cp || '';
                  }
                }
                box.style.display = 'none';
                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
              });
            });
          })
          .catch(function() { box.style.display = 'none'; });
      }, 250);
    });

    // Fermer box au clic ailleurs
    document.addEventListener('click', function(e) {
      if (!box.contains(e.target) && e.target !== input) {
        box.style.display = 'none';
      }
    });

    // Fermer box sur Escape
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') box.style.display = 'none';
    });
  }

  // ═══ AUTO-DÉTECTION ═══
  function autoApply(root) {
    root = root || document;
    // Emails (sauf opt-out explicite)
    root.querySelectorAll('input[type="email"]:not([data-autocomplete-skip])').forEach(attachEmailAutocomplete);
    // Adresse complète
    root.querySelectorAll('input[name="adresse"]:not([data-autocomplete-skip]), input[data-autocomplete-address]:not([data-autocomplete-skip])').forEach(function(i) {
      attachAddressAutocomplete(i, { villeOnly: false });
    });
    // Ville seule (sauf si déjà géré comme champ caché ou opt-out)
    root.querySelectorAll('input[name="ville"]:not([type="hidden"]):not([data-autocomplete-skip])').forEach(function(i) {
      attachAddressAutocomplete(i, { villeOnly: true });
    });
    // Code postal — pas d'autocomplete spécifique (pattern HTML5 suffit)
  }

  // Lancer dès que DOM prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { autoApply(); });
  } else {
    autoApply();
  }

  // Réappliquer si formulaires injectés dynamiquement (observer mutations)
  var mo = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.nodeType === 1) autoApply(n);
      });
    });
  });
  try {
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) { /* body pas encore prêt, peu importe */ }

  // Exposer pour usage manuel
  window.hcFormAutocomplete = {
    attachEmail: attachEmailAutocomplete,
    attachAddress: attachAddressAutocomplete,
    refresh: autoApply
  };
})();
