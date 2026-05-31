/* ============================================================
   HC-MEGAMENU-FIX — corrige le centrage du méga-menu Métiers/Zones
   Le CSS inline calcule left:50% par rapport à .hc-nav entière
   → ce script repositionne sous le bouton ET clampe au viewport
   ============================================================ */
(function () {
  'use strict';
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var navLinks = document.querySelectorAll('.hc-nav-link[data-has-menu]');
    if (!navLinks.length) return;

    function position() {
      navLinks.forEach(function (link) {
        var menuId = link.getAttribute('data-has-menu');
        var menu = document.querySelector('.hc-megamenu[data-menu="' + menuId + '"]');
        if (!menu) return;
        var nav = link.closest('.hc-nav');
        if (!nav) return;

        // Reset pour mesurer la largeur naturelle
        menu.style.left = '';
        menu.style.right = '';

        var linkRect = link.getBoundingClientRect();
        var navRect = nav.getBoundingClientRect();
        var menuWidth = menu.offsetWidth || 380;
        var viewportW = window.innerWidth;
        var safeMargin = 16;

        // Centre du lien dans le repère de la nav
        var linkCenterInNav = (linkRect.left + linkRect.width / 2) - navRect.left;

        // Position absolue souhaitée du bord gauche du menu (centré sur le lien)
        var menuLeftAbs = (linkRect.left + linkRect.width / 2) - (menuWidth / 2);

        // Clamp : ne pas déborder à gauche/droite du viewport
        var minLeftAbs = safeMargin;
        var maxLeftAbs = viewportW - menuWidth - safeMargin;
        if (menuLeftAbs < minLeftAbs) menuLeftAbs = minLeftAbs;
        if (menuLeftAbs > maxLeftAbs) menuLeftAbs = maxLeftAbs;

        // Reconvertir en offset relatif à la nav
        var leftInNav = menuLeftAbs - navRect.left;

        // Appliquer SANS transform translateX (on positionne par left directement)
        // Important : on force avec setProperty + 'important' pour overrider le CSS :hover
        // qui réinjecte translateX(-50%) (bug décalage signalé par Florian 2026-05-31)
        menu.style.setProperty('left', leftInNav + 'px', 'important');
        menu.style.setProperty('right', 'auto', 'important');
        menu.style.setProperty('--mm-tx', '0', 'important');
        // Force la nav à être position:relative pour que le menu absolute s'y rattache
        if (getComputedStyle(nav).position === 'static') {
          nav.style.setProperty('position', 'relative', 'important');
        }
      });
    }

    // Forcer le mode "left direct" (pas de translateX(-50%))
    var style = document.createElement('style');
    style.textContent =
      '.hc-megamenu{transform:translateY(-6px)!important;}' +
      '.hc-megamenu.is-open,.hc-megamenu.is-hovered{transform:translateY(0)!important;}' +
      '.hc-megamenu.mm-force-closed{transform:translateY(-6px)!important;}';
    document.head.appendChild(style);

    position();
    window.addEventListener('resize', position);
    window.addEventListener('load', position);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(position);
    // Re-position au survol (au cas où le lien a bougé via animations)
    navLinks.forEach(function (link) {
      link.addEventListener('mouseenter', position);
      link.addEventListener('focus', position);
    });
  });
})();
