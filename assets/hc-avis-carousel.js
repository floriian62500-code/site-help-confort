/* ============================================================
   HC-AVIS-CAROUSEL — Carousel avis Google 5★ auto-scroll
   Source : avis_publics (Supabase) ou fallback hardcodé
   Utilisation : <div data-hc-avis-carousel></div>
   ============================================================ */
(function () {
  'use strict';

  // Avis fallback (réels, format "Auteur + note + texte + date + ville")
  var FALLBACK_AVIS = []; // Vidé 2026-07-25 : risque juridique faux avis. Vrais avis via Supabase reviews.

  var CSS = '\
.hc-avis-section{background:#fff;padding:60px 20px 70px;position:relative;overflow:hidden}\
.hc-avis-section::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#E5EDF3,transparent)}\
.hc-avis-wrap{max-width:1240px;margin:0 auto}\
.hc-avis-head{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;margin-bottom:40px;text-align:center}\
.hc-avis-google-badge{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;box-shadow:0 4px 12px rgba(10,20,40,.04)}\
.hc-avis-google-badge svg{flex-shrink:0}\
.hc-avis-google-badge-stars{display:flex;gap:1px;color:#FFB400;font-size:1rem;letter-spacing:1px}\
.hc-avis-google-badge-meta{display:flex;flex-direction:column;line-height:1.2;font-size:.78rem;color:#64748b}\
.hc-avis-google-badge-meta strong{font-size:1rem;color:#0A1428;font-weight:800}\
.hc-avis-head-text h2{font-family:"Inter",sans-serif;font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800;color:#0A1428;margin:0;letter-spacing:-.02em;line-height:1.2}\
.hc-avis-head-text h2 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#FFB400;font-weight:600}\
.hc-avis-head-text p{color:#475569;margin:6px 0 0;font-size:.94rem}\
.hc-avis-track-wrap{position:relative;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 40px),transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 40px,#000 calc(100% - 40px),transparent)}\
.hc-avis-track{display:flex;gap:20px;animation:hcAvisScroll 60s linear infinite;width:max-content}\
.hc-avis-track:hover{animation-play-state:paused}\
@keyframes hcAvisScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}\
.hc-avis-card{flex-shrink:0;width:320px;background:#F7FBFD;border:1px solid #E5EDF3;border-radius:16px;padding:22px 22px 20px;display:flex;flex-direction:column;gap:12px;transition:transform .2s ease,border-color .2s ease}\
.hc-avis-card:hover{transform:translateY(-3px);border-color:rgba(13,160,207,.30)}\
.hc-avis-card-head{display:flex;align-items:center;gap:12px}\
.hc-avis-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px}\
.hc-avis-author{display:flex;flex-direction:column;line-height:1.25;flex:1;min-width:0}\
.hc-avis-author-name{font-weight:700;color:#0A1428;font-size:.94rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.hc-avis-author-meta{font-size:.74rem;color:#94a3b8;display:flex;align-items:center;gap:5px}\
.hc-avis-author-meta::before{content:"📍";font-size:.7rem}\
.hc-avis-stars{color:#FFB400;font-size:.94rem;letter-spacing:1.5px;line-height:1}\
.hc-avis-text{font-size:.88rem;color:#334155;line-height:1.55;flex:1;margin:0;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}\
.hc-avis-date{font-size:.72rem;color:#94a3b8;border-top:1px solid #E5EDF3;padding-top:10px;margin-top:auto;display:flex;align-items:center;justify-content:space-between}\
.hc-avis-google-tag{display:inline-flex;align-items:center;gap:4px;font-weight:700;color:#1FC4F0}\
.hc-avis-google-tag svg{flex-shrink:0}\
.hc-avis-cta{text-align:center;margin-top:34px}\
.hc-avis-cta a{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;background:#fff;border:1.5px solid #E5EDF3;border-radius:10px;text-decoration:none;color:#0A1428;font-size:.92rem;font-weight:700;transition:all .2s ease}\
.hc-avis-cta a:hover{border-color:#0DA0CF;color:#0DA0CF;transform:translateY(-2px);box-shadow:0 8px 20px rgba(13,160,207,.10)}';

  function avatarColor(name) {
    var palette = ['#0DA0CF', '#FF6B1A', '#22C55E', '#FFB400', '#7C3AED', '#EC4899', '#06B6D4', '#F59E0B'];
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  function avatarInitials(name) {
    var parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } catch (_) { return dateStr; }
  }

  function buildCard(a) {
    var initials = avatarInitials(a.author);
    var color = avatarColor(a.author);
    var stars = '★'.repeat(Math.round(a.rating || 5));
    return '\
      <div class="hc-avis-card">\
        <div class="hc-avis-card-head">\
          <div class="hc-avis-avatar" style="background:' + color + '">' + initials + '</div>\
          <div class="hc-avis-author">\
            <span class="hc-avis-author-name">' + a.author + '</span>\
            <span class="hc-avis-author-meta">' + (a.ville || '') + '</span>\
          </div>\
        </div>\
        <div class="hc-avis-stars">' + stars + '</div>\
        <p class="hc-avis-text">' + a.text + '</p>\
        <div class="hc-avis-date">\
          <span>' + formatDate(a.date) + '</span>\
          <span class="hc-avis-google-tag">\
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.93c-.26 1.4-1.04 2.58-2.21 3.37v2.8h3.57c2.08-1.92 3.28-4.74 3.28-8.2z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>\
            Google\
          </span>\
        </div>\
      </div>';
  }

  function buildHTML(avis) {
    // Duplicate pour scroll infini fluide
    var doubled = avis.concat(avis);
    return '\
    <section class="hc-avis-section" aria-label="Avis clients Google">\
      <div class="hc-avis-wrap">\
        <div class="hc-avis-head">\
          <div class="hc-avis-google-badge">\
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.93c-.26 1.4-1.04 2.58-2.21 3.37v2.8h3.57c2.08-1.92 3.28-4.74 3.28-8.2z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>\
            <div class="hc-avis-google-badge-stars">★★★★★</div>\
            <div class="hc-avis-google-badge-meta"><strong>4,7/5</strong>343 avis</div>\
          </div>\
          <div class="hc-avis-head-text">\
            <h2>Nos clients <em>parlent pour nous</em></h2>\
            <p>Sélection d\'avis vérifiés Google · Mis à jour en continu</p>\
          </div>\
        </div>\
        <div class="hc-avis-track-wrap">\
          <div class="hc-avis-track">' + doubled.map(buildCard).join('') + '</div>\
        </div>\
        <div class="hc-avis-cta">\
          <a href="https://maps.app.goo.gl/B4BPVTiRp5rDp26fA" target="_blank" rel="noopener noreferrer">\
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.93c-.26 1.4-1.04 2.58-2.21 3.37v2.8h3.57c2.08-1.92 3.28-4.74 3.28-8.2z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>\
            Voir tous les 343 avis sur Google\
          </a>\
        </div>\
      </div>\
    </section>';
  }

  function inject() {
    if (!document.getElementById('hc-avis-carousel-style')) {
      var st = document.createElement('style');
      st.id = 'hc-avis-carousel-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-avis-carousel]').forEach(function (el) {
      if (el.dataset.hcAvisDone) return;
      el.dataset.hcAvisDone = '1';
      el.innerHTML = buildHTML(FALLBACK_AVIS);
    });
  }

  if (document.readyState !== 'loading') inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
