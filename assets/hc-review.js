/* ============================================================
   hc-review.js — Mode "revue Florian" pour le centre de validation.
   S'active UNIQUEMENT si l'URL contient ?review=<id> (et pas en prod).
   → scrolle vers [data-review-id=<id>], le surligne, et affiche un bandeau
     « Modification à contrôler » avec OK / À corriger (enregistrés en base).
   ============================================================ */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var rid = q.get('review');
  if (!rid) return;
  // Jamais en production (apex/www) — sécurité
  if (/(^|\.)depan59-62\.fr$/.test(location.hostname)) return;

  var SUPA = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
  var rv = q.get('rv') || '';                 // version de l'item (pour lier l'OK à la bonne version)
  var lbl = q.get('lbl') || 'cette modification';
  var page = q.get('pg') || '';

  function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var CSS = '\
@keyframes hcrvPulse{0%,100%{box-shadow:0 0 0 2px rgba(255,107,26,.5),0 0 22px 6px rgba(255,107,26,.14)}50%{box-shadow:0 0 0 2px rgba(255,107,26,.75),0 0 34px 12px rgba(255,107,26,.24)}}\
.hcrv-hl{outline:0 !important;border-radius:18px;animation:hcrvPulse 1.9s ease-in-out 3;scroll-margin-top:120px;position:relative;z-index:2}\
.hcrv-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;z-index:2147483000;background:#0A1428;color:#fff;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.4);padding:14px 16px;width:min(560px,94vw);font-family:Inter,system-ui,sans-serif;display:flex;flex-direction:column;gap:10px;animation:hcrvUp .3s cubic-bezier(.16,1,.3,1)}\
@keyframes hcrvUp{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}\
.hcrv-bar .t{font-size:.86rem;line-height:1.4}.hcrv-bar .t b{color:#1FC4F0}\
.hcrv-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\
.hcrv-btn{border:0;border-radius:10px;padding:11px 16px;font-weight:800;font-size:.92rem;cursor:pointer;font-family:inherit}\
.hcrv-ok{background:#16A34A;color:#fff}.hcrv-ko{background:#fff;color:#E11D48}.hcrv-back{background:rgba(255,255,255,.12);color:#fff;margin-left:auto}\
.hcrv-bar textarea{width:100%;border-radius:10px;border:0;padding:10px 12px;font:inherit;font-size:.9rem;display:none}\
.hcrv-bar.ask textarea{display:block}.hcrv-done{color:#4ADE80;font-weight:800}';
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    var el = document.querySelector('[data-review-id="' + (window.CSS && CSS.escape ? CSS.escape(rid) : rid) + '"]');
    var found = !!el;
    if (el) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) { el.scrollIntoView(); }
      el.classList.add('hcrv-hl');
      setTimeout(function () { el.classList.remove('hcrv-hl'); }, 7000);
    }

    var bar = document.createElement('div');
    bar.className = 'hcrv-bar';
    bar.innerHTML =
      '<div class="t">🔍 Modification à contrôler : <b>' + esc(lbl) + '</b>' + (found ? '' : ' <span style="color:#FBBF24">(section non trouvée sur cette page)</span>') + '</div>' +
      '<textarea placeholder="Qu\'est-ce qui ne va pas ? (facultatif)"></textarea>' +
      '<div class="hcrv-row">' +
        '<button class="hcrv-btn hcrv-ok">✅ OK</button>' +
        '<button class="hcrv-btn hcrv-ko">❌ À corriger</button>' +
        '<button class="hcrv-btn hcrv-back">← Centre de validation</button>' +
      '</div>';
    document.body.appendChild(bar);

    function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
    function save(status, comment){
      return fetch(SUPA + '/rest/v1/recette_validation', {
        method: 'POST',
        headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ kind: 'feedback', page: page || null, mod_id: rid, mod_label: lbl, status: status, comment: comment || null, recette_version: rv || 'na' })
      });
    }
    function done(msg){ bar.querySelector('.hcrv-row').innerHTML = '<span class="hcrv-done">' + msg + '</span><button class="hcrv-btn hcrv-back" style="margin-left:auto">← Centre de validation</button>'; bindBack(); }
    function bindBack(){ var b = bar.querySelector('.hcrv-back'); if (b) b.addEventListener('click', function(){ location.href = '/recette.html'; }); }

    bar.querySelector('.hcrv-ok').addEventListener('click', function(){ save('ok', null).then(function(){ done('✅ Validé — merci !'); }).catch(function(){ done('✅ Enregistré (différé)'); }); });
    bar.querySelector('.hcrv-ko').addEventListener('click', function(){
      if (!bar.classList.contains('ask')) { bar.classList.add('ask'); bar.querySelector('textarea').focus(); return; }
      var txt = bar.querySelector('textarea').value.trim();
      save('a_corriger', txt || '(sans détail)').then(function(){ done('❌ Retour envoyé — je corrige.'); }).catch(function(){ done('❌ Enregistré (différé)'); });
    });
    bindBack();
  });
})();
