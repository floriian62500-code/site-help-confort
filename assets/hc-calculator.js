/* ============================================================
   HC-CALCULATOR — Estimateur prix interactif 3 questions
   Métier → Type intervention → Urgence → Fourchette €
   Utilisation : <div data-hc-calculator></div>
   ============================================================ */
(function () {
  'use strict';

  // Grille tarifaire HC (fourchettes basse-haute en €)
  var GRID = {
    plomberie: {
      label: 'Plomberie',
      icon: '💧',
      types: {
        'fuite': { label: 'Fuite (robinet, joint, raccord)', base: [80, 180] },
        'debouchage': { label: 'Débouchage canalisation', base: [120, 280] },
        'wc': { label: 'WC bouché / réparation', base: [90, 220] },
        'chauffe-eau': { label: 'Remplacement chauffe-eau', base: [450, 1200] },
        'sanitaires': { label: 'Pose lavabo / mitigeur / WC', base: [180, 480] },
        'recherche-fuite': { label: 'Recherche de fuite encastrée', base: [180, 450] }
      }
    },
    chauffage: {
      label: 'Chauffage',
      icon: '🔥',
      types: {
        'entretien': { label: 'Entretien chaudière annuel', base: [120, 180] },
        'panne': { label: 'Dépannage chaudière', base: [140, 380] },
        'remplacement-chaudiere': { label: 'Remplacement chaudière gaz', base: [2400, 5500] },
        'pompe-chaleur': { label: 'Installation pompe à chaleur', base: [8500, 18000] },
        'radiateur': { label: 'Pose / remplacement radiateur', base: [180, 650] }
      }
    },
    electricite: {
      label: 'Électricité',
      icon: '⚡',
      types: {
        'panne': { label: 'Dépannage panne électrique', base: [80, 280] },
        'tableau': { label: 'Mise aux normes tableau', base: [650, 2400] },
        'prise': { label: 'Pose prises / interrupteurs', base: [60, 180] },
        'rénovation': { label: 'Rénovation installation', base: [1800, 6500] },
        'diagnostic': { label: 'Diagnostic électrique', base: [120, 250] }
      }
    },
    serrurerie: {
      label: 'Serrurerie',
      icon: '🔒',
      types: {
        'ouverture': { label: 'Ouverture porte claquée', base: [80, 180] },
        'remplacement-serrure': { label: 'Changement serrure', base: [180, 480] },
        'effraction': { label: 'Réparation après effraction', base: [240, 850] },
        'blindage': { label: 'Pose porte / blindage', base: [800, 3200] }
      }
    },
    vitrerie: {
      label: 'Vitrerie',
      icon: '🪟',
      types: {
        'bris-glace': { label: 'Remplacement vitre cassée', base: [120, 380] },
        'double-vitrage': { label: 'Pose double vitrage', base: [380, 950] },
        'fenetre-complete': { label: 'Fenêtre complète PVC/Alu', base: [580, 2400] },
        'velux': { label: 'Pose / remplacement Velux', base: [780, 2200] }
      }
    },
    renovation: {
      label: 'Rénovation',
      icon: '🏠',
      types: {
        'salle-bain': { label: 'Rénovation salle de bain', base: [4500, 14000] },
        'cuisine': { label: 'Rénovation cuisine', base: [5500, 22000] },
        'peinture': { label: 'Peinture intérieure / pièce', base: [380, 1800] },
        'enduit': { label: 'Enduit / lissage murs', base: [22, 45] }, // au m²
        'isolation': { label: 'Isolation thermique', base: [80, 220] }, // au m²
        'plafond': { label: 'Rénovation plafond', base: [40, 95] } // au m²
      }
    },
    serrurier: 'serrurerie', // alias
    electricien: 'electricite' // alias
  };

  var URGENCE_MULT = {
    'planifie': { mult: 1.0, label: 'Standard (sous 48h)', desc: 'Tarif de base · planification normale' },
    'rapide': { mult: 1.15, label: 'Rapide (sous 24h)', desc: '+15 % de majoration' },
    'urgence': { mult: 1.35, label: 'Urgence (sous 2h)', desc: '+35 % de majoration · soir/week-end' }
  };

  var CSS = '\
.hc-calc{background:#fff;border:1px solid #E5EDF3;border-radius:24px;padding:36px 32px;max-width:780px;margin:40px auto;box-shadow:0 18px 50px rgba(10,20,40,.08);position:relative;overflow:hidden}\
.hc-calc::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#0DA0CF,#1FC4F0,#FF6B1A)}\
.hc-calc-head{text-align:center;margin-bottom:30px}\
.hc-calc-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(13,160,207,.10);color:#0DA0CF;border-radius:999px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}\
.hc-calc-eyebrow::before{content:"🧮";font-size:.9rem}\
.hc-calc h2{font-family:"Inter",sans-serif;font-size:clamp(1.5rem,3vw,2rem);font-weight:800;margin:0 0 8px;color:#0A1428;letter-spacing:-.022em;line-height:1.2}\
.hc-calc h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#0DA0CF;font-weight:600}\
.hc-calc-sub{color:#475569;font-size:.96rem;margin:0;line-height:1.55}\
.hc-calc-steps{display:flex;justify-content:center;gap:8px;margin-bottom:28px}\
.hc-calc-step-dot{width:28px;height:6px;border-radius:6px;background:#E5EDF3;transition:.25s ease}\
.hc-calc-step-dot.is-active{background:#0DA0CF;width:38px}\
.hc-calc-step-dot.is-done{background:#22C55E}\
.hc-calc-step{display:none;animation:hcCalcSlide .3s ease}\
.hc-calc-step.is-active{display:block}\
@keyframes hcCalcSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
.hc-calc-step-num{font-size:.74rem;font-weight:800;color:#0DA0CF;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px}\
.hc-calc-step-q{font-size:1.2rem;font-weight:800;color:#0A1428;margin:0 0 18px;line-height:1.3}\
.hc-calc-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}\
@media (max-width:640px){.hc-calc-opts{grid-template-columns:repeat(2,1fr)}}\
@media (max-width:380px){.hc-calc-opts{grid-template-columns:1fr}}\
.hc-calc-opt{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 12px;background:#F7FBFD;border:1.5px solid #E5EDF3;border-radius:14px;cursor:pointer;font-family:inherit;text-align:center;font-size:.86rem;font-weight:600;color:#0A1428;transition:all .2s ease;line-height:1.3}\
.hc-calc-opt:hover{border-color:#0DA0CF;background:#fff;transform:translateY(-2px);box-shadow:0 6px 14px rgba(13,160,207,.08)}\
.hc-calc-opt.is-selected{background:linear-gradient(135deg,#0DA0CF,#1FC4F0);border-color:#0DA0CF;color:#fff;box-shadow:0 10px 22px rgba(13,160,207,.30)}\
.hc-calc-opt-ico{font-size:1.8rem;line-height:1}\
.hc-calc-opt small{font-weight:500;opacity:.75;font-size:.74rem;display:block;margin-top:2px}\
.hc-calc-types{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:22px}\
.hc-calc-type{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F7FBFD;border:1.5px solid #E5EDF3;border-radius:12px;cursor:pointer;font-family:inherit;text-align:left;font-size:.92rem;font-weight:600;color:#0A1428;transition:all .15s ease;width:100%}\
.hc-calc-type:hover{border-color:#0DA0CF;background:#fff}\
.hc-calc-type.is-selected{border-color:#0DA0CF;background:rgba(13,160,207,.06);color:#0DA0CF}\
.hc-calc-type::after{content:"→";margin-left:auto;color:#94a3b8;transition:transform .2s ease}\
.hc-calc-type:hover::after,.hc-calc-type.is-selected::after{color:#0DA0CF;transform:translateX(3px)}\
.hc-calc-urgence{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:22px}\
.hc-calc-urg{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px;background:#F7FBFD;border:1.5px solid #E5EDF3;border-radius:12px;cursor:pointer;font-family:inherit;text-align:left;transition:all .15s ease}\
.hc-calc-urg:hover{border-color:#0DA0CF;background:#fff}\
.hc-calc-urg.is-selected{border-color:#0DA0CF;background:rgba(13,160,207,.06)}\
.hc-calc-urg-info{display:flex;flex-direction:column;gap:2px}\
.hc-calc-urg-info strong{font-size:.96rem;color:#0A1428;font-weight:700}\
.hc-calc-urg-info small{font-size:.78rem;color:#64748b}\
.hc-calc-urg-badge{font-size:.72rem;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(13,160,207,.10);color:#0DA0CF;white-space:nowrap}\
.hc-calc-urg-badge.warn{background:rgba(255,107,26,.10);color:#FF6B1A}\
.hc-calc-urg-badge.crit{background:rgba(225,29,72,.10);color:#E11D48}\
.hc-calc-result{background:linear-gradient(135deg,#0A1428,#172240);color:#fff;border-radius:18px;padding:32px 28px;text-align:center;position:relative;overflow:hidden}\
.hc-calc-result::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 50% 50% at 30% 0%,rgba(31,196,240,.20),transparent 60%);pointer-events:none}\
.hc-calc-result-label{font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:8px;position:relative}\
.hc-calc-result-amount{font-size:clamp(2.4rem,6vw,3.4rem);font-weight:900;color:#fff;line-height:1;margin-bottom:6px;position:relative;letter-spacing:-.025em;font-variant-numeric:tabular-nums}\
.hc-calc-result-amount em{font-style:normal;color:#1FC4F0}\
.hc-calc-result-info{font-size:.86rem;color:rgba(255,255,255,.7);margin:0 0 20px;line-height:1.5;position:relative}\
.hc-calc-result-detail{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-bottom:24px;position:relative}\
.hc-calc-result-tag{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:8px;font-size:.78rem;font-weight:600;color:rgba(255,255,255,.85)}\
.hc-calc-result-cta{display:flex;flex-direction:column;gap:10px;position:relative}\
@media (min-width:560px){.hc-calc-result-cta{flex-direction:row;justify-content:center}}\
.hc-calc-result-cta a{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 24px;border-radius:11px;text-decoration:none;font-size:.92rem;font-weight:700;transition:all .2s ease}\
.hc-calc-result-cta a.prim{background:#FF6B1A;color:#fff;box-shadow:0 8px 20px rgba(255,107,26,.40)}\
.hc-calc-result-cta a.prim:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(255,107,26,.50)}\
.hc-calc-result-cta a.sec{background:rgba(255,255,255,.10);color:#fff;border:1.5px solid rgba(255,255,255,.20)}\
.hc-calc-result-cta a.sec:hover{background:rgba(255,255,255,.18)}\
.hc-calc-back{display:inline-flex;align-items:center;gap:5px;color:#0DA0CF;font-size:.86rem;font-weight:700;background:none;border:0;cursor:pointer;padding:8px 0;font-family:inherit;margin-bottom:14px}\
.hc-calc-back:hover{color:#FF6B1A}\
.hc-calc-disclaimer{font-size:.72rem;color:rgba(255,255,255,.50);margin-top:18px;line-height:1.5;position:relative}';

  var state = { metier: null, type: null, urgence: null };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function setStep(root, n) {
    root.querySelectorAll('.hc-calc-step').forEach(function (s) { s.classList.remove('is-active'); });
    root.querySelectorAll('.hc-calc-step[data-step="' + n + '"]').forEach(function (s) { s.classList.add('is-active'); });
    var dots = root.querySelectorAll('.hc-calc-step-dot');
    dots.forEach(function (d, i) {
      d.classList.remove('is-active', 'is-done');
      if (i + 1 < n) d.classList.add('is-done');
      else if (i + 1 === n) d.classList.add('is-active');
    });
  }

  function buildStep1(root) {
    var html = '<div class="hc-calc-step is-active" data-step="1">\
      <div class="hc-calc-step-num">Étape 1 / 3</div>\
      <h3 class="hc-calc-step-q">Quel est votre métier&nbsp;?</h3>\
      <div class="hc-calc-opts">';
    var ordered = ['plomberie', 'chauffage', 'electricite', 'serrurerie', 'vitrerie', 'renovation'];
    ordered.forEach(function (key) {
      var g = GRID[key];
      html += '<button type="button" class="hc-calc-opt" data-metier="' + key + '">\
        <span class="hc-calc-opt-ico">' + g.icon + '</span>\
        <span>' + g.label + '</span>\
      </button>';
    });
    html += '</div></div>';
    return html;
  }

  function buildStep2(root, metierKey) {
    var g = GRID[metierKey];
    var html = '<div class="hc-calc-step" data-step="2">\
      <button type="button" class="hc-calc-back" data-back="1">← Changer de métier</button>\
      <div class="hc-calc-step-num">Étape 2 / 3</div>\
      <h3 class="hc-calc-step-q">' + g.icon + ' Quel type d\'intervention&nbsp;?</h3>\
      <div class="hc-calc-types">';
    Object.keys(g.types).forEach(function (tk) {
      var t = g.types[tk];
      html += '<button type="button" class="hc-calc-type" data-type="' + tk + '">' + t.label + '</button>';
    });
    html += '</div></div>';
    return html;
  }

  function buildStep3() {
    return '<div class="hc-calc-step" data-step="3">\
      <button type="button" class="hc-calc-back" data-back="2">← Changer d\'intervention</button>\
      <div class="hc-calc-step-num">Étape 3 / 3</div>\
      <h3 class="hc-calc-step-q">Quel délai souhaitez-vous&nbsp;?</h3>\
      <div class="hc-calc-urgence">\
        <button type="button" class="hc-calc-urg" data-urgence="planifie">\
          <span class="hc-calc-urg-info"><strong>📅 Standard (sous 48h)</strong><small>Tarif de base · planification normale</small></span>\
          <span class="hc-calc-urg-badge">Tarif normal</span>\
        </button>\
        <button type="button" class="hc-calc-urg" data-urgence="rapide">\
          <span class="hc-calc-urg-info"><strong>⚡ Rapide (sous 24h)</strong><small>Intervention prioritaire</small></span>\
          <span class="hc-calc-urg-badge warn">+15 %</span>\
        </button>\
        <button type="button" class="hc-calc-urg" data-urgence="urgence">\
          <span class="hc-calc-urg-info"><strong>🚨 Urgence (sous 2h)</strong><small>Soir, week-end, jour férié inclus</small></span>\
          <span class="hc-calc-urg-badge crit">+35 %</span>\
        </button>\
      </div>\
    </div>';
  }

  function buildResult() {
    var g = GRID[state.metier];
    var t = g.types[state.type];
    var u = URGENCE_MULT[state.urgence];
    var low = Math.round(t.base[0] * u.mult);
    var high = Math.round(t.base[1] * u.mult);
    // Format prix
    function fmt(n) {
      return n.toLocaleString('fr-FR') + ' €';
    }

    var params = '?presta=' + encodeURIComponent(g.label) +
                 '&objet=' + encodeURIComponent(t.label) +
                 '&urgence=' + encodeURIComponent(u.label);

    return '<div class="hc-calc-step is-active" data-step="4">\
      <button type="button" class="hc-calc-back" data-back="3">← Modifier le délai</button>\
      <div class="hc-calc-result">\
        <div class="hc-calc-result-label">Estimation indicative</div>\
        <div class="hc-calc-result-amount">' + fmt(low) + ' <em>–</em> ' + fmt(high) + '</div>\
        <p class="hc-calc-result-info">Fourchette TTC · main d\'œuvre + petites fournitures incluses</p>\
        <div class="hc-calc-result-detail">\
          <span class="hc-calc-result-tag">' + g.icon + ' ' + g.label + '</span>\
          <span class="hc-calc-result-tag">📋 ' + t.label + '</span>\
          <span class="hc-calc-result-tag">⏱️ ' + u.label + '</span>\
        </div>\
        <div class="hc-calc-result-cta">\
          <a href="contact.html' + params + '#form" class="prim">\
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\
            Demander un devis ferme\
          </a>\
          <a href="tel:+33366100134" class="sec">\
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>\
            Appeler 03 66 10 01 34\
          </a>\
        </div>\
        <p class="hc-calc-disclaimer">Estimation basée sur nos tarifs moyens. Le devis ferme est établi après visite gratuite (ou photos) pour une précision totale. Aucune intervention n\'est facturée sans accord préalable.</p>\
      </div>\
    </div>';
  }

  function buildCalc(root) {
    return '<div class="hc-calc">\
      <div class="hc-calc-head">\
        <span class="hc-calc-eyebrow">Estimateur de prix instantané</span>\
        <h2>Combien ça <em>coûte vraiment&nbsp;?</em></h2>\
        <p class="hc-calc-sub">3 questions, une fourchette de prix en 30 secondes. Pas d\'inscription, pas de spam.</p>\
      </div>\
      <div class="hc-calc-steps" aria-hidden="true">\
        <div class="hc-calc-step-dot is-active"></div>\
        <div class="hc-calc-step-dot"></div>\
        <div class="hc-calc-step-dot"></div>\
      </div>\
      <div class="hc-calc-body">' + buildStep1(root) + '</div>\
    </div>';
  }

  function bindEvents(root) {
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;

      if (t.dataset.metier) {
        state.metier = t.dataset.metier;
        state.type = null;
        state.urgence = null;
        $('.hc-calc-body', root).innerHTML = buildStep2(root, state.metier);
        setStep(root, 2);
      } else if (t.dataset.type) {
        state.type = t.dataset.type;
        $('.hc-calc-body', root).innerHTML = buildStep3();
        setStep(root, 3);
      } else if (t.dataset.urgence) {
        state.urgence = t.dataset.urgence;
        $('.hc-calc-body', root).innerHTML = buildResult();
        setStep(root, 3);
        // Marquer tous les dots comme done
        root.querySelectorAll('.hc-calc-step-dot').forEach(function (d) {
          d.classList.remove('is-active');
          d.classList.add('is-done');
        });
      } else if (t.dataset.back) {
        var back = parseInt(t.dataset.back);
        if (back === 1) {
          state.metier = null; state.type = null; state.urgence = null;
          $('.hc-calc-body', root).innerHTML = buildStep1(root);
          setStep(root, 1);
        } else if (back === 2) {
          state.type = null; state.urgence = null;
          $('.hc-calc-body', root).innerHTML = buildStep2(root, state.metier);
          setStep(root, 2);
        } else if (back === 3) {
          state.urgence = null;
          $('.hc-calc-body', root).innerHTML = buildStep3();
          setStep(root, 3);
        }
      }
    });
  }

  function init() {
    if (!document.getElementById('hc-calc-style')) {
      var st = document.createElement('style');
      st.id = 'hc-calc-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-calculator]').forEach(function (el) {
      if (el.dataset.hcCalcDone) return;
      el.dataset.hcCalcDone = '1';
      el.innerHTML = buildCalc(el);
      bindEvents(el);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
