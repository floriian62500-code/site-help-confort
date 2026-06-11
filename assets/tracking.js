/*!
 * HELP Confort — Tracking centralisé (GA4 + GTM + Clarity)
 * ─────────────────────────────────────────────────────────
 * Tant que les ID sont les placeholders ci-dessous, chaque snippet
 * détecte l'auto-référence et fait `return` immédiatement : aucune
 * requête réseau, aucun cookie, aucune analytics.
 *
 * Pour activer le tracking, remplacer dans CE SEUL fichier :
 *   - GTM-XXXXXXX        → ton ID GTM réel (ex: GTM-ABCDEF1)
 *   - G-XXXXXXXXXX       → ton ID GA4 réel (ex: G-ABC1234XYZ)
 *   - CLARITY_ID         → ton ID Microsoft Clarity réel
 * Puis vider les caches CDN (`assets/tracking.js?v=YYYYMMDD`).
 *
 * Doc : docs/ACTIVER-TRACKING.md
 */
(function () {
  'use strict';

  // ─── Garde de consentement RGPD (HC-CONSENT-V1, 15/05/2026) ────────
  // Aucune analytics ne tourne tant que l'utilisateur n'a pas explicitement
  // accepté via le banner (assets/hc-consent.js). Sans consent → return.
  try {
    var consent = (window.localStorage && localStorage.getItem('hc-consent')) || '';
    if (consent !== 'granted') {
      // Si l'utilisateur accepte plus tard, on relance ce script à chaud.
      window.addEventListener('hc-consent-granted', function () {
        var s = document.createElement('script');
        s.src = '/assets/tracking.js?reload=' + Date.now();
        s.async = true;
        document.head.appendChild(s);
      }, { once: true });
      return;
    }
  } catch (e) { return; }

  // ─── Google Tag Manager ────────────────────────────────────────────
  (function (w, d, s, l, i) {
    if (i === 'GTM-XXXXXXX') return; // placeholder → tracking inerte
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');

  // ─── Google Analytics 4 ────────────────────────────────────────────
  (function () {
    var id = 'G-YH9GXW6H70';
    if (id === 'G-XXXXXXXXXX') return; // placeholder → tracking inerte
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', id);
  })();

  // ─── Microsoft Clarity ─────────────────────────────────────────────
  (function (c, l, a, r, i, t, y) {
    if (i === 'CLARITY_ID') return; // placeholder → tracking inerte
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'CLARITY_ID');

  // ─── Capture des UTM source / referrer pour traçabilité leads ─────
  // Quand un visiteur arrive depuis Google Ads / FB Ads / email / etc.,
  // on stocke les UTM en sessionStorage. Lors de la soumission d'un formulaire,
  // on injecte automatiquement des hidden fields hc_utm_* qui sont récupérés
  // côté Supabase pour savoir d'où vient chaque lead.
  try {
    var params = new URLSearchParams(location.search);
    var utm = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(function(k){
      var v = params.get(k);
      if (v) utm[k] = v;
    });
    // Si on a au moins une UTM, on la stocke (priorité à la 1ère touche)
    if (Object.keys(utm).length && !sessionStorage.getItem('hc_utm')) {
      utm._first_landing = location.pathname;
      utm._captured_at = new Date().toISOString();
      sessionStorage.setItem('hc_utm', JSON.stringify(utm));
    }
    // Capture aussi referrer si externe
    if (document.referrer && !sessionStorage.getItem('hc_referrer')) {
      try {
        var refHost = new URL(document.referrer).hostname;
        if (refHost && refHost !== location.hostname) {
          sessionStorage.setItem('hc_referrer', document.referrer);
        }
      } catch(_){}
    }
  } catch(_){}
  // Hook tous les forms : avant submit, injecte les UTM en hidden fields
  document.addEventListener('submit', function(e){
    var f = e.target;
    if (!(f && f.tagName === 'FORM')) return;
    try {
      var stored = JSON.parse(sessionStorage.getItem('hc_utm') || '{}');
      var ref = sessionStorage.getItem('hc_referrer') || '';
      function setHidden(name, val) {
        if (!val) return;
        if (f.querySelector('[name="'+name+'"]')) return; // déjà présent
        var inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = name;
        inp.value = val;
        f.appendChild(inp);
      }
      Object.entries(stored).forEach(function(kv){ setHidden('hc_' + kv[0], kv[1]); });
      setHidden('hc_referrer', ref);
      setHidden('hc_page_path', location.pathname);
      setHidden('hc_landing_ts', new Date().toISOString());
    } catch(_){}
  }, true); // capture phase pour passer AVANT les handlers du form

  // ─── Tracking automatique des clics téléphone + email ──────────────
  // Envoie un event GA4 personnalisé à chaque clic sur tel: ou mailto:
  // Permet de mesurer les conversions hors-formulaire (très important
  // pour un business téléphonique comme HC).
  function trackClicks(){
    if (!window.gtag && !window.dataLayer) return; // GA4 pas chargé
    function send(eventName, props){
      try {
        if (window.gtag) window.gtag('event', eventName, props);
        else if (window.dataLayer) window.dataLayer.push(Object.assign({ event: eventName }, props));
      } catch(_){}
      // 2026-06-10 — Log aussi dans Supabase click_events pour funnel admin
      try {
        var typeMap = { click_phone: 'phone', click_email: 'email', click_whatsapp: 'whatsapp' };
        var t = typeMap[eventName];
        if (!t) return;
        var sid = sessionStorage.getItem('hc_sid') || (function(){ var s = 'sid-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10); sessionStorage.setItem('hc_sid', s); return s; })();
        fetch('https://btcbjwqiivhpwoszomhg.supabase.co/rest/v1/click_events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2', 'Authorization': 'Bearer sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2', 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            event_type: t,
            page_path: location.pathname,
            page_url: location.href.slice(0, 500),
            link_text: (props.link_text || '').slice(0, 200),
            link_href: (props.phone || props.email || props.url || '').slice(0, 500),
            user_agent: navigator.userAgent.slice(0, 300),
            referer: (document.referrer || '').slice(0, 500),
            session_id: sid
          })
        }).catch(function(){});
      } catch(_){}
    }
    document.addEventListener('click', function(e){
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var page = location.pathname;
      if (href.startsWith('tel:')) {
        send('click_phone', { phone: href.replace('tel:',''), page_path: page, link_text: (a.textContent||'').trim().slice(0,60) });
      } else if (href.startsWith('mailto:')) {
        send('click_email', { email: href.replace('mailto:',''), page_path: page, link_text: (a.textContent||'').trim().slice(0,60) });
      } else if (/wa\.me|whatsapp/.test(href)) {
        send('click_whatsapp', { url: href, page_path: page });
      } else if (/^https?:/.test(href) && !href.includes(location.host)) {
        // Lien externe (réseaux sociaux, partenaires)
        try {
          var u = new URL(href);
          send('click_external', { domain: u.hostname, page_path: page });
        } catch(_){}
      }
    }, { passive: true });

    // Tracking de la soumission des formulaires (form_submit)
    document.addEventListener('submit', function(e){
      var f = e.target;
      if (!(f && f.tagName === 'FORM')) return;
      var formId = f.id || f.getAttribute('data-form') || 'unknown';
      send('form_submit', { form_id: formId, page_path: location.pathname });
    }, { passive: true });

    // Tracking du scroll profondeur (25/50/75/100%)
    var scrolled = { 25:false, 50:false, 75:false, 100:false };
    window.addEventListener('scroll', function(){
      var pct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      [25,50,75,100].forEach(function(t){
        if (!scrolled[t] && pct >= t) {
          scrolled[t] = true;
          send('scroll_depth', { depth: t, page_path: location.pathname });
        }
      });
    }, { passive: true });
  }
  // Attendre que gtag soit dispo (timer de 2 sec max)
  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    if (window.gtag || tries > 10) {
      clearInterval(iv);
      try { trackClicks(); } catch(_){}
    }
  }, 200);
})();
