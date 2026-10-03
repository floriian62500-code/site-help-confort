/*! HELP Confort — comportements de l'en-tête : SOURCE UNIQUE (chargé en « defer » par toutes les pages).
 *  Réduction au défilement, menu mobile, méga-menu Métiers. Remplace les anciens scripts copiés dans chaque page. */
(function () {
  'use strict';
  if (window.__hcHeaderInit) return;
  var header = document.getElementById('hcHeader');
  if (!header) return;
  window.__hcHeaderInit = true;
  var row = header.querySelector('.hc-header-row');
  var burger = header.querySelector('.hc-burger');
  var panel = header.querySelector('.hc-nav-mobile');
  var DESKTOP = 1280;

  // ---------- Panneau mobile : toujours collé sous la barre, quelle que soit sa hauteur ----------
  function placePanel() {
    if (!panel || !row) return;
    panel.style.setProperty('--hch-panel-top', Math.max(0, Math.round(row.getBoundingClientRect().bottom)) + 'px');
  }

  // ---------- Réduction au défilement (la boîte garde sa hauteur : le contenu ne bouge pas) ----------
  var ticking = false;
  function syncScrolled() { header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 8); }
  syncScrolled();
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    (window.requestAnimationFrame || setTimeout)(function () { ticking = false; syncScrolled(); placePanel(); });
  }, { passive: true });
  if (row) row.addEventListener('transitionend', placePanel);

  // ---------- Menu mobile ----------
  function isMenuOpen() { return !!panel && panel.classList.contains('is-open'); }
  function setMenu(open) {
    if (!burger || !panel) return;
    placePanel();
    burger.classList.toggle('is-open', open);
    panel.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.documentElement.classList.toggle('hc-menu-open', open);
  }
  if (burger && panel) {
    burger.addEventListener('click', function () { setMenu(!isMenuOpen()); });
    panel.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { placePanel(); if (window.innerWidth >= DESKTOP && isMenuOpen()) setMenu(false); });
  }

  // ---------- Méga-menu : survol, focus, clic (tablette), Échap, clic extérieur ----------
  var triggers = Array.prototype.slice.call(header.querySelectorAll('.hc-nav-link[data-has-menu]'));
  var menus = Array.prototype.slice.call(header.querySelectorAll('.hc-megamenu'));
  var closeTimer = null;
  function menuFor(t) { return header.querySelector('.hc-megamenu[data-menu="' + t.getAttribute('data-has-menu') + '"]'); }
  function clearTimer() { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } }
  function closeMenus() {
    menus.forEach(function (m) { m.classList.remove('is-open', 'is-hovered'); m.classList.add('mm-force-closed'); });
    triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    clearTimer();
  }
  function openMenu(t) {
    var m = menuFor(t);
    menus.forEach(function (x) { x.classList.remove('is-open', 'is-hovered', 'mm-force-closed'); });
    triggers.forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    clearTimer();
    if (!m) return;
    m.classList.add('is-hovered');
    t.setAttribute('aria-expanded', 'true');
  }
  function scheduleClose() { clearTimer(); closeTimer = setTimeout(closeMenus, 250); }
  // Chaque méga-menu s'aligne sous SON déclencheur (et non au centre de la navigation)
  function positionMenus() {
    triggers.forEach(function (t) {
      var m = menuFor(t), nav = t.closest('.hc-nav');
      if (!m || !nav || !nav.offsetParent) return;
      var tr = t.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      m.style.left = Math.round(tr.left + tr.width / 2 - nr.left) + 'px';
    });
  }
  positionMenus();
  window.addEventListener('resize', positionMenus);
  window.addEventListener('load', positionMenus);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(positionMenus);
  triggers.forEach(function (t) {
    t.addEventListener('mouseenter', function () { openMenu(t); });
    t.addEventListener('mouseleave', scheduleClose);
    t.addEventListener('focus', function () { openMenu(t); });
    t.addEventListener('click', function (e) {
      e.preventDefault();
      var m = menuFor(t);
      if (m && (m.classList.contains('is-hovered') || m.classList.contains('is-open'))) closeMenus(); else openMenu(t);
    });
  });
  menus.forEach(function (m) {
    m.addEventListener('mouseenter', function () { clearTimer(); m.classList.remove('mm-force-closed'); m.classList.add('is-hovered'); });
    m.addEventListener('mouseleave', scheduleClose);
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || (!e.target.closest('.hc-megamenu') && !e.target.closest('.hc-nav-link[data-has-menu]'))) closeMenus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus();
    if (isMenuOpen()) { setMenu(false); if (burger) burger.focus(); }
  });
  window.addEventListener('scroll', function () {
    if (menus.length && !header.querySelector('.hc-megamenu:hover')) closeMenus();
  }, { passive: true });
})();
