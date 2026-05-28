/* ============================================================
   HC-NEWSLETTER — Inscription newsletter B2C
   Stocke dans table newsletter_subscribers (Supabase)
   À synchroniser ensuite vers Brevo via EF
   Utilisation : <div data-hc-newsletter></div>
   ============================================================ */
(function () {
  'use strict';

  var SUPA_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2Jqd3FpaXZocG93c3pvbWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjY1NjUsImV4cCI6MjA3ODkwMjU2NX0.fJC6_VxoSxr2hf-NUS7Of4kbJ4f0Lv3PFG6JsLrqLng';

  var CSS = '\
.hc-news{background:linear-gradient(135deg,#0A1428,#172240);color:#fff;border-radius:20px;padding:36px 32px;margin:40px auto;max-width:1080px;position:relative;overflow:hidden}\
.hc-news::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 20% 100%,rgba(255,107,26,.15),transparent 60%),radial-gradient(ellipse 50% 50% at 80% 0%,rgba(31,196,240,.12),transparent 60%);pointer-events:none}\
.hc-news-grid{display:grid;grid-template-columns:1fr;gap:24px;align-items:center;position:relative}\
@media(min-width:760px){.hc-news-grid{grid-template-columns:1.2fr 1fr;gap:32px}}\
.hc-news-text h3{font-family:"Inter",sans-serif;font-size:clamp(1.4rem,2.6vw,1.8rem);font-weight:800;margin:0 0 10px;color:#fff;letter-spacing:-.022em;line-height:1.2}\
.hc-news-text h3 em{font-family:"Playfair Display",Georgia,serif;font-style:italic;color:#1FC4F0;font-weight:600}\
.hc-news-text p{color:rgba(255,255,255,.78);margin:0 0 14px;font-size:.96rem;line-height:1.55}\
.hc-news-perks{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0}\
.hc-news-perks li{display:inline-flex;align-items:center;gap:5px;font-size:.84rem;color:rgba(255,255,255,.85);font-weight:600;padding:4px 10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:999px}\
.hc-news-perks li::before{content:"✓";color:#22C55E;font-weight:800;font-size:.92rem}\
.hc-news-form{display:flex;flex-direction:column;gap:10px}\
.hc-news-form input{padding:14px 16px;background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.20);border-radius:11px;color:#fff;font-family:inherit;font-size:.96rem;outline:none;transition:border-color .15s ease,background .15s ease}\
.hc-news-form input::placeholder{color:rgba(255,255,255,.45)}\
.hc-news-form input:focus{border-color:#1FC4F0;background:rgba(255,255,255,.14)}\
.hc-news-form button{padding:14px 22px;background:linear-gradient(135deg,#FF6B1A,#FFB400);color:#fff;border:0;border-radius:11px;font-family:inherit;font-size:.96rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 8px 22px rgba(255,107,26,.30);transition:transform .2s ease,box-shadow .2s ease}\
.hc-news-form button:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(255,107,26,.40)}\
.hc-news-form button:disabled{opacity:.5;cursor:not-allowed}\
.hc-news-msg{padding:11px 14px;border-radius:10px;font-size:.86rem;font-weight:600;display:none;line-height:1.5}\
.hc-news-msg.is-shown{display:block;animation:hcNewsIn .25s ease}\
@keyframes hcNewsIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
.hc-news-msg.success{background:rgba(34,197,94,.15);color:#86EFAC;border:1px solid rgba(34,197,94,.30)}\
.hc-news-msg.error{background:rgba(220,38,38,.15);color:#FCA5A5;border:1px solid rgba(220,38,38,.30)}\
.hc-news-rgpd{font-size:.72rem;color:rgba(255,255,255,.50);line-height:1.5;margin:6px 0 0}\
.hc-news-rgpd a{color:rgba(255,255,255,.78);text-decoration:underline}';

  function buildSection() {
    return '\
    <section class="hc-news" aria-label="Inscription newsletter">\
      <div class="hc-news-grid">\
        <div class="hc-news-text">\
          <h3>L\'actu de votre <em>maison</em>, chaque mois.</h3>\
          <p>Conseils saison, astuces entretien, aides 2026 et chantiers inspirants. <strong style="color:#fff">1 email par mois</strong>, jamais plus. Pas de spam, vous gardez le contrôle.</p>\
          <ul class="hc-news-perks">\
            <li>1 mail/mois</li>\
            <li>Conseils saison</li>\
            <li>Aides MaPrimeRenov</li>\
            <li>Désinscription 1 clic</li>\
          </ul>\
        </div>\
        <form class="hc-news-form" id="hcNewsForm" action="javascript:void(0)">\
          <input type="email" id="hcNewsEmail" name="email" required placeholder="votre.email@exemple.fr" autocomplete="email">\
          <button type="submit" id="hcNewsBtn">\
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>\
            Je m\'inscris\
          </button>\
          <div class="hc-news-msg" id="hcNewsMsg"></div>\
          <p class="hc-news-rgpd">En cliquant, vous acceptez de recevoir nos newsletters. Vous pourrez vous désinscrire à tout moment. <a href="mentions-legales.html#confidentialite">Conditions</a></p>\
        </form>\
      </div>\
    </section>';
  }

  async function subscribe(email) {
    var r = await fetch(SUPA_URL + '/rest/v1/newsletter_subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        email: email,
        source: 'site_footer',
        source_url: location.pathname,
        consent: true
      })
    });
    if (!r.ok && r.status !== 409) {
      var err = await r.text();
      throw new Error('http ' + r.status + ': ' + err);
    }
    return true;
  }

  function init() {
    if (!document.getElementById('hc-news-style')) {
      var st = document.createElement('style');
      st.id = 'hc-news-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    document.querySelectorAll('[data-hc-newsletter]').forEach(function (el) {
      if (el.dataset.hcNewsDone) return;
      el.dataset.hcNewsDone = '1';
      el.innerHTML = buildSection();

      var form = el.querySelector('#hcNewsForm');
      var input = el.querySelector('#hcNewsEmail');
      var btn = el.querySelector('#hcNewsBtn');
      var msg = el.querySelector('#hcNewsMsg');

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var email = (input.value || '').trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          msg.className = 'hc-news-msg error is-shown';
          msg.textContent = '⚠️ Email invalide. Vérifiez votre saisie.';
          return;
        }
        btn.disabled = true;
        msg.className = 'hc-news-msg is-shown';
        msg.style.background = 'rgba(13,160,207,.15)';
        msg.style.color = '#7DD3FC';
        msg.style.border = '1px solid rgba(13,160,207,.30)';
        msg.textContent = '⏳ Inscription en cours…';
        try {
          await subscribe(email);
          msg.className = 'hc-news-msg success is-shown';
          msg.textContent = '✓ Merci ! Vous êtes inscrit·e. Vérifiez vos spams si besoin.';
          input.value = '';
          btn.style.display = 'none';
        } catch (err) {
          console.error('[hc-newsletter]', err);
          btn.disabled = false;
          msg.className = 'hc-news-msg error is-shown';
          msg.textContent = '✗ Erreur, réessayez ou écrivez-nous à saint-omer@helpconfort.com';
        }
      });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
