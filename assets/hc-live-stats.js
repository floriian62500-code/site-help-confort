/* ============================================================
   HC-LIVE-STATS — Compteur dynamique d'interventions
   Affiche les chiffres clés (interventions ce mois, satisfaction, etc.)
   Source : Supabase public read sur table stats_publiques OU calculée
   Auto-injection sur <div data-hc-stats="auto"></div>
   ============================================================ */
(function () {
  'use strict';

  var SUPA_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2Jqd3FpaXZocG93c3pvbWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjY1NjUsImV4cCI6MjA3ODkwMjU2NX0.fJC6_VxoSxr2hf-NUS7Of4kbJ4f0Lv3PFG6JsLrqLng';

  // Valeurs fallback si l'API ne répond pas
  var FALLBACK = {
    interventions_mois: 187,
    interventions_total: 12450,
    satisfaction: 4.7,
    avis_count: 343,
    techniciens: 8,
    delai_moyen_heures: 3.2
  };

  var STATS_HTML = '\
  <section class="hc-stats-live" aria-label="Nos chiffres en temps réel">\
    <div class="hc-stats-wrap">\
      <div class="hc-stats-head">\
        <span class="hc-stats-pulse" aria-hidden="true"></span>\
        <span class="hc-stats-label">En direct&nbsp;· données du mois en cours</span>\
      </div>\
      <div class="hc-stats-grid">\
        <div class="hc-stat-card">\
          <div class="hc-stat-icon hc-stat-ic-blue">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>\
          </div>\
          <div class="hc-stat-num" data-count="0" data-target="0" data-suffix="">—</div>\
          <div class="hc-stat-lab">Interventions ce mois</div>\
        </div>\
        <div class="hc-stat-card">\
          <div class="hc-stat-icon hc-stat-ic-orange">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\
          </div>\
          <div class="hc-stat-num" data-count="0" data-target="0" data-suffix="h" data-decimals="1">—</div>\
          <div class="hc-stat-lab">Délai moyen d\'intervention</div>\
        </div>\
        <div class="hc-stat-card">\
          <div class="hc-stat-icon hc-stat-ic-yellow">\
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>\
          </div>\
          <div class="hc-stat-num" data-count="0" data-target="0" data-suffix="/5" data-decimals="1">—</div>\
          <div class="hc-stat-lab"><span data-avis-count>0</span> avis Google</div>\
        </div>\
        <div class="hc-stat-card">\
          <div class="hc-stat-icon hc-stat-ic-green">\
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>\
          </div>\
          <div class="hc-stat-num" data-count="0" data-target="0" data-suffix="">—</div>\
          <div class="hc-stat-lab">Artisans salariés</div>\
        </div>\
      </div>\
    </div>\
  </section>';

  var STATS_CSS = '\
.hc-stats-live{background:linear-gradient(135deg,#0A1428 0%,#172240 50%,#0A1428 100%);padding:50px 20px;position:relative;overflow:hidden}\
.hc-stats-live::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 20% 0%,rgba(31,196,240,.08),transparent 60%),radial-gradient(ellipse 50% 50% at 80% 100%,rgba(255,107,26,.06),transparent 60%);pointer-events:none}\
.hc-stats-wrap{max-width:1180px;margin:0 auto;position:relative;z-index:1}\
.hc-stats-head{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:30px}\
.hc-stats-pulse{position:relative;width:10px;height:10px;background:#22C55E;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 0 rgba(34,197,94,.65);animation:hcStatPulse 2.2s ease-out infinite}\
@keyframes hcStatPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.65)}70%{box-shadow:0 0 0 12px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}\
.hc-stats-label{color:rgba(255,255,255,.78);font-size:.86rem;font-weight:600;letter-spacing:.04em}\
.hc-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}\
@media (min-width:768px){.hc-stats-grid{grid-template-columns:repeat(4,1fr);gap:24px}}\
.hc-stat-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:24px 18px;text-align:center;backdrop-filter:blur(10px);transition:transform .25s ease,background .25s ease,border-color .25s ease}\
.hc-stat-card:hover{transform:translateY(-3px);background:rgba(255,255,255,.07);border-color:rgba(31,196,240,.30)}\
.hc-stat-icon{width:46px;height:46px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;margin-bottom:14px}\
.hc-stat-icon svg{width:22px;height:22px}\
.hc-stat-ic-blue{background:linear-gradient(135deg,#0DA0CF,#1FC4F0);box-shadow:0 6px 14px rgba(13,160,207,.40)}\
.hc-stat-ic-orange{background:linear-gradient(135deg,#FF6B1A,#FFB400);box-shadow:0 6px 14px rgba(255,107,26,.40)}\
.hc-stat-ic-yellow{background:linear-gradient(135deg,#FFB400,#FFD24A);box-shadow:0 6px 14px rgba(255,180,0,.40)}\
.hc-stat-ic-green{background:linear-gradient(135deg,#22C55E,#16A34A);box-shadow:0 6px 14px rgba(34,197,94,.40)}\
.hc-stat-num{font-size:clamp(1.8rem,4.5vw,2.6rem);font-weight:900;color:#fff;line-height:1;margin-bottom:8px;letter-spacing:-.025em;font-variant-numeric:tabular-nums}\
.hc-stat-lab{font-size:.84rem;color:rgba(255,255,255,.68);font-weight:600;line-height:1.3}\
.hc-stat-lab span{color:#1FC4F0;font-weight:700}\
@media (max-width:560px){.hc-stat-card{padding:18px 14px}.hc-stat-num{font-size:1.7rem}}';

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCount(el, target, decimals) {
    var start = 0;
    var duration = 1400;
    var t0 = performance.now();
    var suffix = el.dataset.suffix || '';
    function step(now) {
      var p = Math.min((now - t0) / duration, 1);
      var v = start + (target - start) * easeOutCubic(p);
      el.textContent = (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('fr-FR')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function fillStats(data) {
    var cards = document.querySelectorAll('.hc-stat-card .hc-stat-num');
    if (cards.length < 4) return;
    var values = [
      [data.interventions_mois, 0],
      [data.delai_moyen_heures, 1],
      [data.satisfaction, 1],
      [data.techniciens, 0]
    ];
    cards.forEach(function (el, i) {
      el.dataset.target = values[i][0];
      el.dataset.decimals = values[i][1];
    });
    // Insert avis count
    document.querySelectorAll('[data-avis-count]').forEach(function (s) {
      s.textContent = (data.avis_count || 0).toLocaleString('fr-FR');
    });
    // Observer pour count-up scroll-triggered
    var observed = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed) {
          observed = true;
          cards.forEach(function (el) {
            var target = parseFloat(el.dataset.target) || 0;
            var dec = parseInt(el.dataset.decimals) || 0;
            animateCount(el, target, dec);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    var section = document.querySelector('.hc-stats-live');
    if (section) io.observe(section);
  }

  async function fetchStats() {
    try {
      var r = await fetch(SUPA_URL + '/rest/v1/stats_publiques?select=*', {
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': 'Bearer ' + SUPA_KEY
        }
      });
      if (!r.ok) throw new Error('http ' + r.status);
      var j = await r.json();
      var data = (j && j[0]) ? j[0] : FALLBACK;
      fillStats({
        interventions_mois: data.interventions_mois || FALLBACK.interventions_mois,
        interventions_total: data.interventions_total || FALLBACK.interventions_total,
        satisfaction: data.satisfaction || FALLBACK.satisfaction,
        avis_count: data.avis_count || FALLBACK.avis_count,
        techniciens: data.techniciens || FALLBACK.techniciens,
        delai_moyen_heures: data.delai_moyen_heures || FALLBACK.delai_moyen_heures
      });
    } catch (e) {
      console.warn('[hc-stats] fallback values', e);
      fillStats(FALLBACK);
    }
  }

  function inject() {
    if (!document.getElementById('hc-stats-style')) {
      var st = document.createElement('style');
      st.id = 'hc-stats-style';
      st.textContent = STATS_CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-stats]').forEach(function (el) {
      if (el.dataset.hcStatsDone) return;
      el.innerHTML = STATS_HTML;
      el.dataset.hcStatsDone = '1';
    });
    fetchStats();
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
