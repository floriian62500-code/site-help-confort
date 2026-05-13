/*!
 * HELP! Confort — Autocomplete adresse (BAN api-adresse.data.gouv.fr)
 *
 * Auto-attache à TOUT champ <input name="adresse"> du site.
 * - Si CP + ville voisins (name="cp" et name="ville") → remplit aussi.
 * - Sinon, remplit l'adresse seule au format "rue, cp ville".
 * - Restreint à la France (api BAN).
 * - 0 dépendance, 0 clé, 100% gratuit.
 */
(function () {
  'use strict';

  if (window.__HC_ADDR_AC_INIT__) return;
  window.__HC_ADDR_AC_INIT__ = true;

  var STYLE = '\
.hc-ac-list{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1px solid #E5EDF3;border-radius:10px;box-shadow:0 12px 32px rgba(10,20,40,.12);max-height:280px;overflow-y:auto;z-index:9999;font-family:inherit;font-size:14px;color:#0A1428}\
.hc-ac-list[hidden]{display:none}\
.hc-ac-item{display:block;padding:10px 14px;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:background .12s ease}\
.hc-ac-item:last-child{border-bottom:0}\
.hc-ac-item:hover,.hc-ac-item.is-active{background:rgba(31,196,240,.10)}\
.hc-ac-item-label{display:block;color:#0A1428;font-weight:600;line-height:1.25;font-size:14px}\
.hc-ac-item-ctx{display:block;color:#64748b;font-size:12px;margin-top:2px}\
.hc-ac-empty{padding:12px 14px;color:#64748b;font-size:13px;font-style:italic}\
';

  // Inject styles once
  function injectStyles() {
    if (document.getElementById('hc-ac-styles')) return;
    var s = document.createElement('style');
    s.id = 'hc-ac-styles';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function attachOne(input) {
    if (input.__hcAcAttached) return;
    input.__hcAcAttached = true;
    input.setAttribute('autocomplete', 'off');

    // Trouver CP/Ville voisins (dans le même <form>)
    var form = input.form || input.closest('form') || document;
    var cpInput    = form.querySelector('input[name="cp"], input[name="postal_code"], input[name="zip"], input[name="codepostal"]');
    var villeInput = form.querySelector('input[name="ville"], input[name="city"], input[name="commune"]');
    var hasSeparateFields = !!(cpInput && villeInput);

    // Wrapper relative pour la liste
    var wrap;
    if (getComputedStyle(input.parentElement).position !== 'absolute' && getComputedStyle(input.parentElement).position !== 'relative') {
      wrap = document.createElement('div');
      wrap.style.position = 'relative';
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
    } else {
      wrap = input.parentElement;
      // Si parent absolute, c'est probablement déjà bien
      if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    }

    var list = document.createElement('div');
    list.className = 'hc-ac-list';
    list.hidden = true;
    list.setAttribute('role', 'listbox');
    wrap.appendChild(list);

    var items = [];
    var activeIdx = -1;
    var timer = null;
    var lastQuery = '';

    function close() {
      list.hidden = true;
      list.innerHTML = '';
      activeIdx = -1;
      items = [];
    }

    function render(features) {
      items = features || [];
      if (!items.length) {
        list.innerHTML = '<div class="hc-ac-empty">Aucune adresse trouvée</div>';
        list.hidden = false;
        return;
      }
      list.innerHTML = items.map(function (f, i) {
        var p = f.properties || {};
        var label = (p.name || '').replace(/</g, '&lt;');
        var ctx = ((p.postcode || '') + ' ' + (p.city || '') + (p.context ? ' · ' + p.context : '')).replace(/</g, '&lt;');
        return '<div class="hc-ac-item" role="option" data-i="' + i + '"><span class="hc-ac-item-label">' + label + '</span><span class="hc-ac-item-ctx">' + ctx + '</span></div>';
      }).join('');
      list.hidden = false;
      activeIdx = -1;
    }

    function fill(feature) {
      var p = feature.properties || {};
      if (hasSeparateFields) {
        input.value = p.name || '';
        if (cpInput)    cpInput.value    = p.postcode || '';
        if (villeInput) villeInput.value = p.city || '';
        // Trigger events pour scripts éventuels (détection agence, validation, etc.)
        [input, cpInput, villeInput].forEach(function (i) {
          if (i) i.dispatchEvent(new Event('input', { bubbles: true }));
          if (i) i.dispatchEvent(new Event('change', { bubbles: true }));
        });
      } else {
        // Format unique : "12 rue X, 62500 Saint-Omer"
        var parts = [p.name, (p.postcode || '') + ' ' + (p.city || '')].filter(Boolean);
        input.value = parts.join(', ');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      close();
    }

    function search(q) {
      if (q.length < 3) { close(); return; }
      if (q === lastQuery) return;
      lastQuery = q;
      var url = 'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(q) + '&limit=6&autocomplete=1';
      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          // Vérifier que l'utilisateur n'a pas effacé ou changé son input entre temps
          if (input.value.trim() === q) render(data.features || []);
        })
        .catch(function () { /* silencieux */ });
    }

    function updateActive() {
      list.querySelectorAll('.hc-ac-item').forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeIdx);
      });
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { search(q); }, 220);
    });

    input.addEventListener('focus', function () {
      if (items.length) list.hidden = false;
    });

    input.addEventListener('blur', function () {
      setTimeout(close, 180);
    });

    input.addEventListener('keydown', function (e) {
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
        updateActive();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        updateActive();
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0 && items[activeIdx]) {
          e.preventDefault();
          fill(items[activeIdx]);
        }
      } else if (e.key === 'Escape') {
        close();
      }
    });

    list.addEventListener('mousedown', function (e) {
      var t = e.target.closest('.hc-ac-item');
      if (!t) return;
      e.preventDefault(); // empêche le blur de fermer avant
      var i = parseInt(t.dataset.i, 10);
      if (!isNaN(i) && items[i]) fill(items[i]);
    });
  }

  function init() {
    injectStyles();
    // Sélectionne tous les champs adresse
    var inputs = document.querySelectorAll(
      'input[name="adresse"], input[name="address"], input[data-hc-address]'
    );
    inputs.forEach(attachOne);

    // MutationObserver pour formulaires injectés dynamiquement
    var obs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches('input[name="adresse"], input[name="address"], input[data-hc-address]')) {
            attachOne(n);
          }
          if (n.querySelectorAll) {
            n.querySelectorAll('input[name="adresse"], input[name="address"], input[data-hc-address]')
              .forEach(attachOne);
          }
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
