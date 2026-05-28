/* ============================================================
   HC-A11Y-FIXES — Améliorations accessibilité runtime
   - Skip link visible au focus
   - Focus visible amélioré sur tous interactifs
   - Ajout aria-current sur liens nav actifs
   - Régions landmarks manquantes
   - Reduce motion respect
   ============================================================ */
(function () {
  'use strict';

  var CSS = '\
/* Focus visible amélioré */\
*:focus-visible{outline:3px solid #FF6B1A !important;outline-offset:2px !important;border-radius:4px}\
a:focus-visible,button:focus-visible{outline-offset:3px !important}\
.hc-nav-link:focus-visible,.hc-btn-tel:focus-visible{outline-color:#FF6B1A !important;background:rgba(255,107,26,.08) !important}\
\
/* Reduce motion */\
@media (prefers-reduced-motion: reduce){\
  *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}\
  .hc-marquee-track,.hctb-pulse,.hzb-pulse,.hc-stats-pulse{animation:none !important}\
}\
\
/* Skip link visible au focus */\
.hc-skip-link:focus,.hc-skip-link:focus-visible{position:fixed !important;top:0 !important;left:0 !important;background:#0A1428 !important;color:#fff !important;padding:14px 22px !important;text-decoration:none !important;font-weight:700 !important;border-radius:0 0 10px 0 !important;z-index:99999 !important;box-shadow:0 4px 14px rgba(0,0,0,.30) !important}\
\
/* Selection accessible */\
::selection{background:rgba(13,160,207,.20);color:#0A1428}\
\
/* Min target size mobile (48x48 WCAG AAA) */\
@media (max-width:768px){\
  a,button,input[type=submit]{min-height:44px}\
}';

  function init() {
    // Inject CSS
    if (!document.getElementById('hc-a11y-style')) {
      var st = document.createElement('style');
      st.id = 'hc-a11y-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    // Ensure skip link exists
    if (!document.querySelector('.hc-skip-link')) {
      var skip = document.createElement('a');
      skip.href = '#main-content';
      skip.className = 'hc-skip-link';
      skip.textContent = 'Aller au contenu principal';
      document.body.insertBefore(skip, document.body.firstChild);
    }

    // aria-current pour le lien actif
    try {
      var current = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.hc-nav-link, .fv3-col a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').split('#')[0];
        if (href && (href === current || href === './' + current || (current === 'index.html' && (href === '' || href === '/' || href === 'index.html')))) {
          a.setAttribute('aria-current', 'page');
        }
      });
    } catch (_) {}

    // Tous les iframes sans title (carte Google ?)
    document.querySelectorAll('iframe:not([title])').forEach(function (i) {
      i.setAttribute('title', 'Contenu intégré');
    });

    // Tous les boutons sans label ni text → label depuis aria-label éventuel
    document.querySelectorAll('button:not([aria-label])').forEach(function (b) {
      if (!b.textContent.trim() && !b.querySelector('span,strong,em')) {
        // Détecter SVG seul + récupérer un sens via class ou contenu
        var svg = b.querySelector('svg');
        if (svg) {
          var hint = b.title || b.dataset.label || 'Action';
          b.setAttribute('aria-label', hint);
        }
      }
    });

    // Augmenter contraste sur les placeholders trop clairs
    var styleContrast = document.createElement('style');
    styleContrast.textContent = '::placeholder{color:#64748b !important;opacity:.8}';
    document.head.appendChild(styleContrast);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
