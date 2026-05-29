/* ============================================================
   HC-PRESTA-LUDIQUE — Override visuel des cards prestations
   Cards plus grandes, couleurs métier, badges, animations
   ============================================================ */
(function () {
  'use strict';

  var METIER_THEMES = {
    'plomberie':   { c1:'#0DA0CF', c2:'#1FC4F0', soft:'rgba(13,160,207,.08)',  emoji:'💧' },
    'chauffage':   { c1:'#FF6B1A', c2:'#FFB400', soft:'rgba(255,107,26,.08)',  emoji:'🔥' },
    'électricité': { c1:'#FFB400', c2:'#F59E0B', soft:'rgba(255,180,0,.10)',   emoji:'⚡' },
    'electricite': { c1:'#FFB400', c2:'#F59E0B', soft:'rgba(255,180,0,.10)',   emoji:'⚡' },
    'serrurerie':  { c1:'#EC4899', c2:'#F472B6', soft:'rgba(236,72,153,.08)',  emoji:'🔒' },
    'vitrerie':    { c1:'#16A34A', c2:'#22C55E', soft:'rgba(34,197,94,.08)',   emoji:'🪟' },
    'menuiserie':  { c1:'#A855F7', c2:'#C084FC', soft:'rgba(168,85,247,.08)',  emoji:'🚪' },
    'travaux':     { c1:'#A28C7A', c2:'#B89F8A', soft:'rgba(162,140,122,.10)', emoji:'🛠️' },
    'rénovation':  { c1:'#A28C7A', c2:'#B89F8A', soft:'rgba(162,140,122,.10)', emoji:'🏠' },
    'pmr':         { c1:'#0EA5E9', c2:'#38BDF8', soft:'rgba(14,165,233,.08)',  emoji:'♿' }
  };

  var BADGES = {
    'recherche-fuite-visuelle':   { label:'⭐ Le plus demandé', cls:'pop' },
    'desengorgement':             { label:'⚡ Express',          cls:'express' },
    'recherche-fuite-technique':  { label:'🔬 Sans casse',       cls:'tech' },
    'ouverture-porte-claquee':    { label:'🚨 24/7',             cls:'urg' },
    'entretien-chaudiere-gaz':    { label:'✓ Obligatoire',       cls:'oblig' }
  };

  var CSS = '\
/* === HC PRESTA LUDIQUE === */\
#presta-proposals{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr)) !important;gap:14px !important;margin-bottom:18px !important}\
.pp-card{position:relative;display:flex !important;flex-direction:column;align-items:flex-start;text-align:left;padding:18px 16px 16px !important;background:#fff;border:2px solid #E5EDF3 !important;border-radius:16px !important;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;overflow:hidden;min-height:140px;gap:6px !important;font-family:inherit}\
.pp-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--pp-c1,#0DA0CF),var(--pp-c2,#1FC4F0));transform:scaleX(0);transform-origin:left;transition:transform .35s ease}\
.pp-card:hover{transform:translateY(-4px) !important;box-shadow:0 18px 36px rgba(10,20,40,.08) !important;border-color:var(--pp-c1,#0DA0CF) !important}\
.pp-card:hover::before{transform:scaleX(1)}\
.pp-card.pp-selected{border-color:var(--pp-c1,#0DA0CF) !important;background:var(--pp-soft,rgba(13,160,207,.06)) !important;box-shadow:0 12px 30px rgba(13,160,207,.15) !important}\
.pp-card.pp-selected::before{transform:scaleX(1)}\
.pp-card.pp-selected::after{content:"✓";position:absolute !important;top:10px !important;right:10px !important;width:24px !important;height:24px !important;background:var(--pp-c1,#0DA0CF) !important;color:#fff !important;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.84rem;font-weight:800;box-shadow:0 4px 10px var(--pp-soft);animation:hcPpCheck .35s cubic-bezier(.16,1,.3,1)}\
@keyframes hcPpCheck{from{transform:scale(0) rotate(-180deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}\
.pp-icon{font-size:2rem !important;line-height:1 !important;width:54px;height:54px;background:var(--pp-soft,rgba(13,160,207,.10));border-radius:14px;display:inline-flex !important;align-items:center;justify-content:center;margin-bottom:4px;transition:transform .25s ease}\
.pp-card:hover .pp-icon{transform:scale(1.1) rotate(-5deg)}\
.pp-card.pp-selected .pp-icon{background:var(--pp-c1,#0DA0CF);color:#fff;animation:hcPpBounce .5s ease}\
@keyframes hcPpBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.15) rotate(8deg)}}\
.pp-label{font-size:.96rem !important;font-weight:800 !important;color:#0A1428 !important;line-height:1.3;letter-spacing:-.01em}\
.pp-metier{font-size:.74rem !important;font-weight:700 !important;color:var(--pp-c1,#0DA0CF) !important;text-transform:uppercase !important;letter-spacing:.06em !important;background:var(--pp-soft);padding:3px 10px;border-radius:999px;margin-top:auto;display:inline-block;width:fit-content}\
.pp-badge{position:absolute;top:10px;left:10px;font-size:.66rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;line-height:1;z-index:2;box-shadow:0 4px 10px rgba(0,0,0,.08)}\
.pp-badge.pop{background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff}\
.pp-badge.express{background:linear-gradient(135deg,#EC4899,#F472B6);color:#fff}\
.pp-badge.tech{background:linear-gradient(135deg,#7C3AED,#A855F7);color:#fff}\
.pp-badge.urg{background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff;animation:hcPpPulse 2s ease-in-out infinite}\
@keyframes hcPpPulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.5)}50%{box-shadow:0 0 0 6px rgba(220,38,38,0)}}\
.pp-badge.oblig{background:linear-gradient(135deg,#16A34A,#22C55E);color:#fff}\
.pp-card.pp-other{background:linear-gradient(135deg,#F7FBFD,#fff) !important;border-style:dashed !important;border-color:#CBD5E1 !important}\
.pp-card.pp-other:hover{background:linear-gradient(135deg,#E6F8FE,#fff) !important;border-color:#0DA0CF !important;border-style:solid !important}\
.pp-card.pp-other .pp-icon{background:transparent;font-size:1.8rem !important}\
\
/* Bandeau motivant en haut */\
.hc-presta-helper{display:flex;align-items:center;gap:12px;padding:14px 18px;background:linear-gradient(135deg,rgba(13,160,207,.06),rgba(255,107,26,.04));border:1px solid rgba(13,160,207,.18);border-radius:14px;margin-bottom:18px;font-size:.88rem;color:#475569;line-height:1.45}\
.hc-presta-helper-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0;position:relative}\
.hc-presta-helper-avatar::after{content:"";position:absolute;bottom:0;right:0;width:10px;height:10px;background:#22C55E;border-radius:50%;border:2px solid #fff}\
.hc-presta-helper strong{color:#0A1428;font-weight:800}';

  function applyTheme(card, metierLower) {
    var t = METIER_THEMES[metierLower] || METIER_THEMES.plomberie;
    card.style.setProperty('--pp-c1', t.c1);
    card.style.setProperty('--pp-c2', t.c2);
    card.style.setProperty('--pp-soft', t.soft);
  }

  function addBadgeIfMatch(card, prestaId) {
    if (!prestaId) return;
    // Vérifie le slug ou id contient un mot-clé connu
    var lid = prestaId.toLowerCase();
    var key = Object.keys(BADGES).find(function (k) { return lid.indexOf(k) >= 0; });
    if (!key) return;
    if (card.querySelector('.pp-badge')) return;
    var b = document.createElement('span');
    b.className = 'pp-badge ' + BADGES[key].cls;
    b.textContent = BADGES[key].label;
    card.appendChild(b);
  }

  function decorateAll() {
    var container = document.getElementById('presta-proposals');
    if (!container) return;
    container.querySelectorAll('.pp-card').forEach(function (card) {
      var metierEl = card.querySelector('.pp-metier');
      if (metierEl) {
        var metierText = metierEl.textContent.trim().toLowerCase().split('·')[0].trim();
        applyTheme(card, metierText);
      }
      var pid = card.dataset.prestaId || '';
      addBadgeIfMatch(card, pid);
    });

    // Ajouter helper banner si absent
    if (!document.querySelector('.hc-presta-helper')) {
      var head = document.querySelector('h3.resa-step-title, .hc-resa-step[data-step="1"] h3');
      if (head) {
        var helper = document.createElement('div');
        helper.className = 'hc-presta-helper';
        helper.innerHTML = '\
          <div class="hc-presta-helper-avatar">👷</div>\
          <div>Un doute sur le besoin ? Choisissez ce qui s\'en rapproche le plus — <strong>on confirme après diagnostic sur place</strong>. Vous ne payez que ce qui correspond vraiment.</div>';
        head.parentNode.insertBefore(helper, head.nextSibling);
      }
    }
  }

  function init() {
    if (!document.getElementById('hc-presta-ludique-style')) {
      var st = document.createElement('style');
      st.id = 'hc-presta-ludique-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    // Initial
    decorateAll();
    // Observer pour re-decorate quand le wizard rafraîchit le DOM
    var container = document.getElementById('presta-proposals');
    if (container) {
      var mo = new MutationObserver(function () { setTimeout(decorateAll, 30); });
      mo.observe(container, { childList: true, subtree: false });
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
