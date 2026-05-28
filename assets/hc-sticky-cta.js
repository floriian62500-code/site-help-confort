/* ============================================================
   HC-STICKY-CTA — Barre flottante "Appel + Devis express" mobile
   Apparaît après scroll 400px, cachée si formulaire visible
   ============================================================ */
(function () {
  'use strict';

  var CSS = '\
#hcStickyCta{position:fixed;bottom:0;left:0;right:0;z-index:90;background:linear-gradient(180deg,rgba(255,255,255,.92),#fff);border-top:1px solid #E5EDF3;backdrop-filter:saturate(180%) blur(20px);-webkit-backdrop-filter:saturate(180%) blur(20px);padding:10px 14px env(safe-area-inset-bottom,12px) 14px;display:none;gap:8px;box-shadow:0 -8px 24px rgba(10,20,40,.10);transform:translateY(100%);transition:transform .35s cubic-bezier(.16,1,.3,1)}\
#hcStickyCta.is-visible{display:flex}\
#hcStickyCta.is-shown{transform:translateY(0)}\
#hcStickyCta a{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:13px 12px;border-radius:11px;text-decoration:none;font-size:.92rem;font-weight:800;letter-spacing:-.005em;transition:transform .15s ease,box-shadow .15s ease;white-space:nowrap}\
#hcStickyCta a svg{flex-shrink:0}\
#hcStickyCta a.sc-call{background:linear-gradient(135deg,#FF6B1A,#FF8F4D);color:#fff;box-shadow:0 6px 16px rgba(255,107,26,.30)}\
#hcStickyCta a.sc-call:active{transform:scale(.97)}\
#hcStickyCta a.sc-quote{background:#0A1428;color:#fff;box-shadow:0 6px 16px rgba(10,20,40,.20)}\
#hcStickyCta a.sc-quote:active{transform:scale(.97)}\
@media (min-width:880px){#hcStickyCta{display:none !important}}\
body.has-hc-sticky{padding-bottom:74px}\
@media (min-width:880px){body.has-hc-sticky{padding-bottom:0}}';

  function inject() {
    if (document.getElementById('hcStickyCta')) return;
    if (!document.getElementById('hc-sticky-style')) {
      var st = document.createElement('style');
      st.id = 'hc-sticky-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var bar = document.createElement('div');
    bar.id = 'hcStickyCta';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Actions rapides');
    bar.innerHTML = '\
      <a href="tel:+33366100134" class="sc-call" aria-label="Appeler immédiatement">\
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>\
        Appeler\
      </a>\
      <a href="contact.html#form" class="sc-quote" aria-label="Demander un devis express">\
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>\
        Devis express\
      </a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-hc-sticky');

    var revealed = false;
    function checkScroll() {
      // Cacher si formulaire visible dans le viewport
      var anyFormVisible = false;
      document.querySelectorAll('form[data-hc-lead]').forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2) {
          anyFormVisible = true;
        }
      });
      // Cacher si footer visible
      var footer = document.querySelector('footer.footer-v3, footer');
      var footerVisible = false;
      if (footer) {
        var fr = footer.getBoundingClientRect();
        footerVisible = fr.top < window.innerHeight;
      }

      var shouldShow = window.scrollY > 400 && !anyFormVisible && !footerVisible;
      if (shouldShow) {
        bar.classList.add('is-visible');
        // RAF pour la transition
        requestAnimationFrame(function () { bar.classList.add('is-shown'); });
      } else {
        bar.classList.remove('is-shown');
        setTimeout(function () {
          if (!bar.classList.contains('is-shown')) bar.classList.remove('is-visible');
        }, 350);
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    checkScroll();
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
