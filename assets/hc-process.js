/* ============================================================
   HC-PROCESS — Section "Comment ça marche en 4 étapes"
   Animation scroll-trigger : chaque étape s'allume au scroll
   Utilisation : <div data-hc-process></div>
   ============================================================ */
(function () {
  'use strict';

  var STEPS = [
    {
      num: '01',
      icon: '📞',
      color: '#FF6B1A',
      colorSoft: 'rgba(255,107,26,.12)',
      title: 'Vous nous appelez',
      desc: 'Téléphone, formulaire ou chat — on prend votre demande, on évalue l\'urgence, on planifie. Réponse sous 30 min ouvrées.',
      detail: 'Lundi-Samedi 9h-17h · Urgences 24/7 sur ligne dédiée'
    },
    {
      num: '02',
      icon: '📋',
      color: '#0DA0CF',
      colorSoft: 'rgba(13,160,207,.12)',
      title: 'On vient et on devise',
      desc: 'Un technicien salarié HC se déplace, diagnostique, et établit un <strong>devis ferme gratuit</strong>. Aucun engagement.',
      detail: 'Devis remis sur place ou par email · 0 € si refusé'
    },
    {
      num: '03',
      icon: '🔧',
      color: '#22C55E',
      colorSoft: 'rgba(34,197,94,.12)',
      title: 'On intervient',
      desc: 'Vous signez, on intervient au prix annoncé. Pas de surprise sur la facture. Travail propre, équipements de qualité.',
      detail: 'Pièces de marques reconnues · Local rangé en partant'
    },
    {
      num: '04',
      icon: '🛡️',
      color: '#7C3AED',
      colorSoft: 'rgba(124,58,237,.12)',
      title: 'On vous garantit',
      desc: 'Vérification du travail ensemble, paiement (CB, virement, Stripe), puis <strong>garantie 1 an mini</strong> pièces + main d\'œuvre.',
      detail: 'Satisfait ou intervention reprise · SAV joignable au 03 66 10 01 34'
    }
  ];

  var CSS = '\
.hc-proc{padding:70px 20px 80px;background:linear-gradient(180deg,#fff,#F7FBFD);position:relative;overflow:hidden}\
.hc-proc-wrap{max-width:1180px;margin:0 auto;position:relative}\
.hc-proc-head{text-align:center;margin-bottom:50px;max-width:760px;margin-left:auto;margin-right:auto}\
.hc-proc-eyebrow{display:inline-flex;align-items:center;gap:7px;padding:6px 14px;background:rgba(255,107,26,.10);color:#FF6B1A;border-radius:999px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}\
.hc-proc-eyebrow::before{content:"⚡"}\
.hc-proc h2{font-family:"Inter",sans-serif;font-size:clamp(1.9rem,4vw,2.7rem);font-weight:800;color:#0A1428;margin:0 0 12px;letter-spacing:-.022em;line-height:1.2}\
.hc-proc h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}\
.hc-proc-sub{color:#475569;margin:0;font-size:1.06rem;line-height:1.55}\
.hc-proc-steps{position:relative;display:grid;grid-template-columns:1fr;gap:20px}\
@media(min-width:768px){.hc-proc-steps{grid-template-columns:1fr 1fr;gap:30px}}\
@media(min-width:1100px){.hc-proc-steps{grid-template-columns:repeat(4,1fr);gap:24px}}\
.hc-proc-line{display:none}\
@media(min-width:1100px){\
  .hc-proc-line{display:block;position:absolute;top:62px;left:8%;right:8%;height:2px;background:linear-gradient(90deg,rgba(255,107,26,.30),rgba(13,160,207,.30),rgba(34,197,94,.30),rgba(124,58,237,.30));z-index:0;pointer-events:none}\
}\
.hc-proc-step{background:#fff;border:1px solid #E5EDF3;border-radius:18px;padding:24px;position:relative;z-index:1;transition:transform .5s ease,box-shadow .5s ease,opacity .5s ease;opacity:.6;transform:translateY(20px)}\
.hc-proc-step.is-visible{opacity:1;transform:translateY(0)}\
.hc-proc-step:hover{transform:translateY(-6px);box-shadow:0 18px 40px rgba(10,20,40,.08)}\
.hc-proc-num{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:11px;background:var(--p-soft,#F7FBFD);color:var(--p-c,#0DA0CF);font-weight:900;font-size:1rem;letter-spacing:-.02em;font-family:"Inter",sans-serif;margin-bottom:14px;transition:transform .3s ease}\
.hc-proc-step.is-visible .hc-proc-num{animation:hcProcPulse .8s ease}\
@keyframes hcProcPulse{0%{transform:scale(.7);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}\
.hc-proc-icon{font-size:2.2rem;line-height:1;display:block;margin:6px 0 14px}\
.hc-proc-step h3{font-size:1.14rem;font-weight:800;color:#0A1428;margin:0 0 10px;letter-spacing:-.015em;line-height:1.25}\
.hc-proc-step p{font-size:.94rem;color:#475569;line-height:1.6;margin:0 0 12px}\
.hc-proc-step p strong{color:#0A1428;font-weight:700}\
.hc-proc-detail{font-size:.78rem;color:#94a3b8;font-weight:600;padding-top:12px;border-top:1px dashed #E5EDF3;line-height:1.5}\
.hc-proc-cta{text-align:center;margin-top:50px}\
.hc-proc-cta a{display:inline-flex;align-items:center;gap:9px;padding:14px 28px;background:linear-gradient(135deg,#FF6B1A,#FFB400);color:#fff;border-radius:12px;text-decoration:none;font-weight:800;font-size:1rem;box-shadow:0 10px 24px rgba(255,107,26,.30);transition:transform .2s ease,box-shadow .2s ease}\
.hc-proc-cta a:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(255,107,26,.40)}';

  function build() {
    return '\
    <section class="hc-proc" aria-label="Comment ça marche">\
      <div class="hc-proc-wrap">\
        <div class="hc-proc-head">\
          <span class="hc-proc-eyebrow">Comment ça marche</span>\
          <h2>De l\'appel au <em>résultat garanti</em>, en 4 étapes</h2>\
          <p class="hc-proc-sub">Un process simple, transparent, sans mauvaise surprise. C\'est notre standard depuis le premier jour.</p>\
        </div>\
        <div class="hc-proc-steps">\
          <div class="hc-proc-line"></div>' +
          STEPS.map(function (s) {
            var styles = 'style="--p-c:' + s.color + ';--p-soft:' + s.colorSoft + '"';
            return '\
            <article class="hc-proc-step" ' + styles + '>\
              <span class="hc-proc-num">' + s.num + '</span>\
              <span class="hc-proc-icon">' + s.icon + '</span>\
              <h3>' + s.title + '</h3>\
              <p>' + s.desc + '</p>\
              <div class="hc-proc-detail">' + s.detail + '</div>\
            </article>';
          }).join('') + '\
        </div>\
        <div class="hc-proc-cta">\
          <a href="tel:+33366100134">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>\
            Démarrer maintenant — 03 66 10 01 34\
          </a>\
        </div>\
      </div>\
    </section>';
  }

  function observe(el) {
    var steps = el.querySelectorAll('.hc-proc-step');
    if (!('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = parseInt(entry.target.dataset.idx || '0');
          setTimeout(function () { entry.target.classList.add('is-visible'); }, idx * 150);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    steps.forEach(function (s, i) { s.dataset.idx = i; io.observe(s); });
  }

  function init() {
    if (!document.getElementById('hc-proc-style')) {
      var st = document.createElement('style');
      st.id = 'hc-proc-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-process]').forEach(function (el) {
      if (el.dataset.hcProcDone) return;
      el.dataset.hcProcDone = '1';
      el.innerHTML = build();
      observe(el);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
