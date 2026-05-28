/* ============================================================
   HC-BEFORE-AFTER — Slider drag horizontal avant/après
   Composant léger pur JS (pas de dépendance)
   Utilisation : <div class="hc-ba" data-before="url1.jpg" data-after="url2.jpg"></div>
   ============================================================ */
(function () {
  'use strict';

  var CSS = '\
.hc-ba{position:relative;display:block;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:16px;background:#0A1428;cursor:ew-resize;user-select:none;touch-action:none;box-shadow:0 12px 28px rgba(10,20,40,.18)}\
.hc-ba-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}\
.hc-ba-img-after{clip-path:inset(0 0 0 50%);transition:clip-path .05s linear}\
.hc-ba-handle{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;transform:translateX(-50%);pointer-events:none;box-shadow:0 0 16px rgba(0,0,0,.40)}\
.hc-ba-handle::before{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.30)}\
.hc-ba-handle::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:24px;height:24px;background-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%230A1428\' stroke-width=\'2.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'9 18 3 12 9 6\'/><polyline points=\'15 6 21 12 15 18\'/></svg>");background-repeat:no-repeat;background-size:contain;pointer-events:none}\
.hc-ba-label{position:absolute;top:14px;padding:6px 12px;background:rgba(10,20,40,.85);color:#fff;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:6px;pointer-events:none;backdrop-filter:blur(8px)}\
.hc-ba-label.before{left:14px}\
.hc-ba-label.after{right:14px;background:rgba(255,107,26,.92)}\
.hc-ba-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.6);font-size:.86rem}\
.hc-ba.is-init{cursor:ew-resize}';

  function injectCSS() {
    if (document.getElementById('hc-ba-style')) return;
    var st = document.createElement('style');
    st.id = 'hc-ba-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function initOne(el) {
    if (el.dataset.hcBaInit) return;
    var before = el.dataset.before;
    var after = el.dataset.after;
    if (!before || !after) {
      el.style.display = 'none';
      return;
    }
    el.dataset.hcBaInit = '1';
    el.innerHTML = '\
      <img class="hc-ba-img hc-ba-img-before" src="' + before + '" alt="Avant" loading="lazy" decoding="async">\
      <img class="hc-ba-img hc-ba-img-after" src="' + after + '" alt="Après" loading="lazy" decoding="async">\
      <span class="hc-ba-label before">Avant</span>\
      <span class="hc-ba-label after">Après</span>\
      <div class="hc-ba-handle"></div>';
    el.classList.add('is-init');

    var imgAfter = el.querySelector('.hc-ba-img-after');
    var handle = el.querySelector('.hc-ba-handle');

    function setPosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      imgAfter.style.clipPath = 'inset(0 0 0 ' + percent + '%)';
      handle.style.left = percent + '%';
    }

    function pointerMove(e) {
      var rect = el.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      var pct = (x / rect.width) * 100;
      setPosition(pct);
    }

    var dragging = false;
    function startDrag(e) {
      dragging = true;
      pointerMove(e);
      e.preventDefault();
    }
    function endDrag() { dragging = false; }
    function moveDrag(e) {
      if (!dragging) return;
      pointerMove(e);
      e.preventDefault();
    }

    // Mouse
    el.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);
    // Touch
    el.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
    // Hover preview
    el.addEventListener('mousemove', function (e) {
      if (!dragging) pointerMove(e);
    });
    // Animation initiale : slide from 50 → 60 → 50 pour montrer que ça bouge
    setTimeout(function () {
      var p = 50;
      var dir = 1;
      var steps = 0;
      var iv = setInterval(function () {
        p += dir * 2;
        if (p > 65) dir = -1;
        if (p < 35) dir = 1;
        steps++;
        setPosition(p);
        if (steps >= 30) {
          clearInterval(iv);
          setPosition(50);
        }
      }, 40);
    }, 500);
  }

  function initAll() {
    injectCSS();
    document.querySelectorAll('.hc-ba').forEach(initOne);
  }

  if (document.readyState !== 'loading') initAll();
  else document.addEventListener('DOMContentLoaded', initAll);

  // Re-init pour contenus injectés dynamiquement
  window.HC_BA = { init: initAll, initOne: initOne };
})();
