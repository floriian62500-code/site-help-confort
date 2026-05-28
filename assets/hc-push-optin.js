/* ============================================================
   HC-PUSH-OPTIN — Bandeau opt-in notifications push
   Apparait après 30 s, propose d'activer les rappels entretien
   Si accepté : register SW, subscribe, save subscription in DB
   Requires : VAPID_PUBLIC_KEY (à set côté Supabase et frontend)
   ============================================================ */
(function () {
  'use strict';

  // ⚠️ À RENSEIGNER après génération des VAPID keys (web-push generate-vapid-keys)
  // Tant que c'est null, le bandeau ne s'affiche pas
  var VAPID_PUBLIC_KEY = null;

  var SUPA_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2Jqd3FpaXZocG93c3pvbWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjY1NjUsImV4cCI6MjA3ODkwMjU2NX0.fJC6_VxoSxr2hf-NUS7Of4kbJ4f0Lv3PFG6JsLrqLng';
  var DELAY_MS = 30000;
  var STORAGE_KEY = 'hc_push_optin_v1';

  var CSS = '\
#hcPushOptin{position:fixed;bottom:-200px;right:18px;z-index:97;width:340px;max-width:calc(100vw - 36px);background:#fff;border:1px solid #E5EDF3;border-radius:18px;padding:18px;box-shadow:0 20px 50px rgba(10,20,40,.18);display:flex;flex-direction:column;gap:12px;transition:bottom .4s cubic-bezier(.16,1,.3,1)}\
#hcPushOptin.is-shown{bottom:18px}\
@media (max-width:880px){#hcPushOptin.is-shown{bottom:152px;right:14px}}\
.hc-push-head{display:flex;align-items:center;gap:10px}\
.hc-push-head .hc-push-ic{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#FF6B1A,#FFB400);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}\
.hc-push-head strong{flex:1;font-size:.94rem;font-weight:800;color:#0A1428;line-height:1.3}\
.hc-push-head button.hc-push-close{background:transparent;border:0;color:#94a3b8;cursor:pointer;padding:4px}\
.hc-push-body{font-size:.86rem;color:#475569;line-height:1.55;margin:0}\
.hc-push-cta{display:flex;gap:8px}\
.hc-push-cta button{flex:1;padding:11px 14px;border-radius:10px;font-family:inherit;font-size:.86rem;font-weight:700;cursor:pointer;border:0;transition:transform .15s ease,box-shadow .15s ease}\
.hc-push-cta .ok{background:linear-gradient(135deg,#FF6B1A,#FFB400);color:#fff;box-shadow:0 6px 16px rgba(255,107,26,.30)}\
.hc-push-cta .ok:hover{transform:translateY(-1px)}\
.hc-push-cta .ko{background:#F4F7FB;color:#475569;border:1px solid #E5EDF3}\
.hc-push-cta .ko:hover{background:#E5EDF3}';

  function urlBase64ToUint8Array(b) {
    var pad = '='.repeat((4 - b.length % 4) % 4);
    var base64 = (b + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    var arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  async function saveSubscription(sub) {
    var p = sub.toJSON();
    var r = await fetch(SUPA_URL + '/rest/v1/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        endpoint: p.endpoint,
        p256dh: p.keys.p256dh,
        auth: p.keys.auth,
        user_agent: navigator.userAgent,
        consent_type: 'maintenance'
      })
    });
    return r.ok || r.status === 409;
  }

  async function subscribeUser() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Notifications non supportées par votre navigateur.');
      return false;
    }
    try {
      var reg = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      var sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await saveSubscription(sub);
      return true;
    } catch (e) {
      console.error('[hc-push] subscribe failed', e);
      return false;
    }
  }

  function shouldShow() {
    if (!VAPID_PUBLIC_KEY) return false;
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return false;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dismissed' || saved === 'accepted') return false;
    } catch (_) {}
    return true;
  }

  function buildBanner() {
    var div = document.createElement('div');
    div.id = 'hcPushOptin';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Activer les notifications HELP Confort');
    div.innerHTML = '\
      <div class="hc-push-head">\
        <div class="hc-push-ic">🔔</div>\
        <strong>Rappel entretien chaudière ?</strong>\
        <button class="hc-push-close" aria-label="Fermer">\
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\
        </button>\
      </div>\
      <p class="hc-push-body">Activez les notifications pour recevoir <strong>1 rappel par an</strong> avant l\'entretien obligatoire de votre chaudière. Pas de spam, jamais.</p>\
      <div class="hc-push-cta">\
        <button class="ok">✓ Activer</button>\
        <button class="ko">Plus tard</button>\
      </div>';
    return div;
  }

  function show() {
    if (!shouldShow()) return;
    if (!document.getElementById('hc-push-style')) {
      var st = document.createElement('style');
      st.id = 'hc-push-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var banner = buildBanner();
    document.body.appendChild(banner);
    setTimeout(function () { banner.classList.add('is-shown'); }, 50);

    function dismiss(persist) {
      banner.classList.remove('is-shown');
      setTimeout(function () { banner.remove(); }, 400);
      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, 'dismissed'); } catch (_) {}
      }
    }

    banner.querySelector('.ok').addEventListener('click', async function () {
      var ok = await subscribeUser();
      try { localStorage.setItem(STORAGE_KEY, ok ? 'accepted' : 'failed'); } catch (_) {}
      dismiss(false);
    });
    banner.querySelector('.ko').addEventListener('click', function () { dismiss(true); });
    banner.querySelector('.hc-push-close').addEventListener('click', function () { dismiss(true); });
  }

  function init() {
    if (!shouldShow()) return;
    setTimeout(show, DELAY_MS);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
