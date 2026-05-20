/* ═══════════════════════════════════════════════════════════════
   HELP Confort — Module "Avis Live"
   Affiche les derniers avis clients depuis Supabase
   Cherche un placeholder <div id="hc-avis-live"></div> dans la page
   et y injecte un carrousel d'avis récents (note >= 4, avec commentaire).
═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';

  var host = document.getElementById('hc-avis-live');
  if (!host) return;

  function star(filled) {
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="' + (filled ? '#FFB400' : '#cbd5e1') + '" style="vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }

  function stars(rating) {
    var html = '';
    for (var i = 0; i < 5; i++) html += star(i < Math.round(rating));
    return html;
  }

  function srcBadge(source) {
    if (source === 'google') return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;color:#4285F4"><svg width="11" height="11" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>Google</span>';
    if (source === 'facebook') return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;color:#1877F2"><svg width="11" height="11" viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>Facebook</span>';
    if (source === 'trustville') return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-weight:700;color:#FF6B1A">★ Trustville</span>';
    return '<span style="font-size:.72rem;font-weight:700;color:#64748b">Avis client</span>';
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function(c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function timeAgo(d) {
    var ms = Date.now() - new Date(d).getTime();
    var days = Math.floor(ms / 86400000);
    if (days < 1) return 'aujourd\'hui';
    if (days < 7) return 'il y a ' + days + ' jour' + (days > 1 ? 's' : '');
    if (days < 30) return 'il y a ' + Math.floor(days / 7) + ' sem.';
    if (days < 365) return 'il y a ' + Math.floor(days / 30) + ' mois';
    return 'il y a ' + Math.floor(days / 365) + ' an' + (days >= 730 ? 's' : '');
  }

  function render(reviews) {
    if (!reviews || !reviews.length) {
      host.style.display = 'none';
      return;
    }

    var avg = reviews.reduce(function(s, r) { return s + parseFloat(r.rating); }, 0) / reviews.length;

    host.innerHTML = '\
      <style>\
        #hc-avis-live{padding:56px 24px;background:linear-gradient(180deg, rgba(13,160,207,.03) 0%, transparent 100%)}\
        .hcal-wrap{max-width:1180px;margin:0 auto}\
        .hcal-head{text-align:center;margin-bottom:32px}\
        .hcal-head h2{font-size:clamp(1.6rem,3vw,2.1rem);font-weight:800;color:#0A1428;margin:0 0 8px;letter-spacing:-.02em}\
        .hcal-head p{font-size:1rem;color:#64748b;margin:0;line-height:1.5}\
        .hcal-head strong{color:#FFB400}\
        .hcal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}\
        .hcal-card{background:#fff;border:1px solid #E5EDF3;border-radius:14px;padding:20px;box-shadow:0 1px 2px rgba(11,18,32,.04);transition:.2s;display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}\
        .hcal-card::before{content:"\\201C";position:absolute;top:-10px;right:14px;font-size:4rem;color:rgba(13,160,207,.10);font-family:Georgia,serif;line-height:1}\
        .hcal-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(11,18,32,.08);border-color:rgba(13,160,207,.30)}\
        .hcal-author-row{display:flex;align-items:center;gap:10px}\
        .hcal-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#5fc7e5);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.92rem;flex-shrink:0}\
        .hcal-author-info{flex:1;min-width:0}\
        .hcal-author{display:block;font-weight:700;color:#0A1428;font-size:.92rem;line-height:1.2}\
        .hcal-meta{font-size:.72rem;color:#64748b;display:flex;align-items:center;gap:8px;margin-top:2px}\
        .hcal-rating{display:flex;gap:1px;align-items:center}\
        .hcal-comment{font-size:.92rem;color:#1A2A44;line-height:1.55;flex:1;margin:4px 0 0}\
        .hcal-reply{margin-top:10px;padding:10px 12px;background:#F4F7FB;border-left:3px solid #0DA0CF;border-radius:0 8px 8px 0}\
        .hcal-reply-label{font-size:.7rem;font-weight:800;color:#0DA0CF;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}\
        .hcal-reply-text{font-size:.82rem;color:#1A2A44;line-height:1.5}\
        .hcal-cta{text-align:center;margin-top:24px}\
        .hcal-cta a{display:inline-flex;align-items:center;gap:6px;padding:11px 22px;background:#fff;border:1px solid #E5EDF3;border-radius:10px;color:#0A1428;font-weight:700;font-size:.88rem;text-decoration:none;transition:.18s;box-shadow:0 1px 2px rgba(11,18,32,.04)}\
        .hcal-cta a:hover{transform:translateY(-1px);border-color:#0DA0CF;color:#0DA0CF;box-shadow:0 4px 12px rgba(13,160,207,.15)}\
      </style>\
      <div class="hcal-wrap">\
        <div class="hcal-head">\
          <h2>Ce que disent nos clients</h2>\
          <p><strong>' + avg.toFixed(1).replace('.', ',') + '/5</strong> sur les ' + reviews.length + ' derniers avis vérifiés Google, Facebook et Trustville</p>\
        </div>\
        <div class="hcal-grid">' +
          reviews.map(function(r) {
            var initial = (r.author_name || 'A').charAt(0).toUpperCase();
            var hasReply = r.reply_text && r.reply_text.trim().length > 0;
            return '\
              <div class="hcal-card">\
                <div class="hcal-author-row">\
                  <div class="hcal-avatar">' + initial + '</div>\
                  <div class="hcal-author-info">\
                    <span class="hcal-author">' + escapeHtml(r.author_name || 'Client anonyme') + '</span>\
                    <div class="hcal-meta">' +
                      srcBadge(r.source) +
                      '<span>·</span>' +
                      '<span>' + timeAgo(r.posted_at) + '</span>' +
                    '</div>\
                  </div>\
                  <div class="hcal-rating">' + stars(r.rating) + '</div>\
                </div>\
                <p class="hcal-comment">' + escapeHtml(r.comment || '') + '</p>' +
                (hasReply ? '<div class="hcal-reply"><div class="hcal-reply-label">Réponse Help Confort</div><div class="hcal-reply-text">' + escapeHtml(r.reply_text) + '</div></div>' : '') +
              '</div>';
          }).join('') +
        '</div>\
        <div class="hcal-cta">\
          <a href="https://maps.app.goo.gl/B4BPVTiRp5rDp26fA" target="_blank" rel="noopener">\
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>\
            Voir tous nos avis Google\
          </a>\
        </div>\
      </div>';
  }

  function load() {
    // Fetch reviews depuis Supabase (anon = lecture des avis non flag/archive)
    // HC-FIX 2026-05-20 : on récupère AUSSI review_url pour pouvoir rendre la carte cliquable
    fetch(SUPABASE_URL + '/rest/v1/reviews?status=neq.flagged&status=neq.archive&rating=gte.4&comment=not.is.null&order=posted_at.desc&limit=6&select=*,review_url', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      render(data || []);
    })
    .catch(function(e) {
      console.warn('[hc-avis-live] Erreur chargement :', e.message);
      host.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
