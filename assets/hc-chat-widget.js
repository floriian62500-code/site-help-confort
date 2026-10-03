/* ============================================================
   HC-CHAT-WIDGET — Assistant chat HELP Confort
   Bouton flottant bas-droit + fenêtre conversationnelle
   Backend : EF chat-assistant (FAQ + capture leads urgents)
   ============================================================ */
(function () {
  'use strict';

  var SUPA_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SUPA_KEY = 'sb_publishable_Zyd4jmm3_qOcTjFdN8pnBw_sOybyyB2';
  var SESSION = 'hc_' + Math.random().toString(36).slice(2, 12);

  var CSS = '\
#hcChatFab{position:fixed;bottom:88px;right:18px;z-index:95;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);border:0;box-shadow:0 12px 32px rgba(13,160,207,.45),0 4px 10px rgba(13,160,207,.30);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:transform .2s ease,box-shadow .2s ease}\
#hcChatFab:hover{transform:scale(1.08);box-shadow:0 16px 40px rgba(13,160,207,.55)}\
#hcChatFab svg{width:26px;height:26px;transition:transform .25s ease}\
#hcChatFab.is-open{opacity:0;pointer-events:none;visibility:hidden;transform:scale(.8)}\
#hcChatFab.is-open svg{transform:rotate(135deg)}\
#hcChatFab::after{content:"";position:absolute;top:-3px;right:-3px;width:14px;height:14px;background:#FF6B1A;border-radius:50%;border:2px solid #fff;animation:hcChatPulse 2s ease-in-out infinite}\
@keyframes hcChatPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,26,.6)}50%{box-shadow:0 0 0 8px rgba(255,107,26,0)}}\
#hcChatFab.is-open::after{display:none}\
@media (max-width:880px){#hcChatFab{bottom:84px;right:14px;width:54px;height:54px}#hcChatFab svg{width:22px;height:22px}}\
#hcChatWin{position:fixed;bottom:160px;right:18px;z-index:96;width:360px;max-width:calc(100vw - 36px);height:520px;max-height:calc(100vh - 200px);background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(10,20,40,.28);display:none;flex-direction:column;overflow:hidden;border:1px solid #E5EDF3;transform:translateY(20px) scale(.96);opacity:0;transition:transform .25s cubic-bezier(.16,1,.3,1),opacity .25s ease}\
#hcChatWin.is-open{display:flex;transform:translateY(0) scale(1);opacity:1}\
@media (max-width:480px){#hcChatWin{bottom:152px;right:8px;left:8px;width:auto;max-width:none}}\
.hc-chat-head{background:linear-gradient(135deg,#0A1428,#172240);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;border-radius:18px 18px 0 0}\
.hc-chat-head-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#FF6B1A,#FFB400);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;position:relative}\
.hc-chat-head-avatar::after{content:"";position:absolute;bottom:0;right:0;width:11px;height:11px;background:#22C55E;border-radius:50%;border:2px solid #0A1428}\
.hc-chat-head-info{flex:1;min-width:0}\
.hc-chat-head-info strong{display:block;font-size:.94rem;font-weight:800;line-height:1.2}\
.hc-chat-head-info small{display:block;font-size:.74rem;color:rgba(255,255,255,.65);margin-top:2px}\
.hc-chat-head-close{background:transparent;border:0;color:#fff;cursor:pointer;padding:6px;opacity:.7;transition:opacity .2s ease}\
.hc-chat-head-close:hover{opacity:1}\
.hc-chat-body{flex:1;overflow-y:auto;padding:16px;background:#F7FBFD;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}\
.hc-chat-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:.9rem;line-height:1.5;animation:hcChatIn .25s ease;word-wrap:break-word}\
@keyframes hcChatIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}\
.hc-chat-msg.bot{background:#fff;border:1px solid #E5EDF3;color:#0A1428;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 2px 6px rgba(10,20,40,.04)}\
.hc-chat-msg.user{background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;box-shadow:0 4px 10px rgba(13,160,207,.20)}\
.hc-chat-msg a{color:inherit;text-decoration:underline;font-weight:600}\
.hc-chat-msg.bot a{color:#0DA0CF}\
.hc-chat-quick{display:flex;flex-wrap:wrap;gap:6px;padding:8px 16px;border-top:1px solid #E5EDF3;background:#fff}\
.hc-chat-quick button{padding:7px 11px;background:#F7FBFD;border:1px solid #E5EDF3;border-radius:999px;font-family:inherit;font-size:.78rem;font-weight:600;color:#475569;cursor:pointer;transition:all .15s ease;white-space:nowrap}\
.hc-chat-quick button:hover{background:#E6F8FE;border-color:#0DA0CF;color:#0DA0CF}\
.hc-chat-form{display:flex;gap:8px;padding:12px;background:#fff;border-top:1px solid #E5EDF3}\
.hc-chat-form input{flex:1;padding:10px 14px;border:1px solid #E5EDF3;border-radius:999px;font-family:inherit;font-size:.92rem;outline:none;background:#F7FBFD;transition:border-color .15s ease,background .15s ease}\
.hc-chat-form input:focus{border-color:#0DA0CF;background:#fff;box-shadow:0 0 0 3px rgba(13,160,207,.12)}\
.hc-chat-form button{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);border:0;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s ease,box-shadow .2s ease}\
.hc-chat-form button:hover{transform:scale(1.05);box-shadow:0 6px 14px rgba(13,160,207,.30)}\
.hc-chat-form button:disabled{opacity:.4;cursor:not-allowed;transform:none}\
.hc-chat-typing{display:inline-flex;gap:4px;padding:10px 14px;background:#fff;border:1px solid #E5EDF3;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start}\
.hc-chat-typing span{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:hcChatDot 1.2s ease-in-out infinite}\
.hc-chat-typing span:nth-child(2){animation-delay:.15s}\
.hc-chat-typing span:nth-child(3){animation-delay:.3s}\
@keyframes hcChatDot{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}';

  var QUICK_OPTIONS = [
    'Demander un devis',
    'Plomberie',
    'Chauffage',
    'Serrurerie',
    'Horaires',
    'Vos zones d\'intervention'
  ];

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function linkify(s) {
    return escapeHtml(s)
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/(0[1-9](?:[\s.-]?\d{2}){4})/g, '<a href="tel:+33$1">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(body, role, text) {
    // Remove typing indicator if present
    var typing = body.querySelector('.hc-chat-typing');
    if (typing) typing.remove();
    var m = document.createElement('div');
    m.className = 'hc-chat-msg ' + role;
    m.innerHTML = linkify(text);
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

  function addTyping(body) {
    var t = document.createElement('div');
    t.className = 'hc-chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
  }

  async function sendMessage(body, message) {
    addMessage(body, 'user', message);
    addTyping(body);
    try {
      var r = await fetch(SUPA_URL + '/functions/v1/chat-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + SUPA_KEY,
          'apikey': SUPA_KEY
        },
        body: JSON.stringify({
          message: message,
          session_id: SESSION,
          page_url: location.href
        })
      });
      var j = await r.json();
      var reply = j.reply || 'Désolé, je n\'ai pas pu répondre. Appelez le 03 66 10 01 34.';
      setTimeout(function () { addMessage(body, 'bot', reply); }, 400);
    } catch (e) {
      console.error('[hc-chat]', e);
      setTimeout(function () {
        addMessage(body, 'bot', 'Désolé, problème technique. Appelez le 03 66 10 01 34 ou écrivez à saint-omer@helpconfort.com');
      }, 400);
    }
  }

  function buildWidget() {
    // Bouton flottant
    var fab = document.createElement('button');
    fab.id = 'hcChatFab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Ouvrir le chat HELP Confort');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(fab);

    // Fenêtre
    var win = document.createElement('div');
    win.id = 'hcChatWin';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Chat HELP Confort');
    win.innerHTML = '\
      <div class="hc-chat-head">\
        <div class="hc-chat-head-avatar">👷</div>\
        <div class="hc-chat-head-info">\
          <strong>Assistant HELP Confort</strong>\
          <small>En ligne · réponse immédiate</small>\
        </div>\
        <button class="hc-chat-head-close" type="button" aria-label="Fermer le chat">\
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\
        </button>\
      </div>\
      <div class="hc-chat-body" id="hcChatBody"></div>\
      <div class="hc-chat-quick" id="hcChatQuick"></div>\
      <form class="hc-chat-form" id="hcChatForm" action="javascript:void(0)">\
        <input type="text" id="hcChatInput" placeholder="Tapez votre message…" autocomplete="off">\
        <button type="submit" aria-label="Envoyer">\
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>\
        </button>\
      </form>';
    document.body.appendChild(win);

    var body = win.querySelector('#hcChatBody');
    var quick = win.querySelector('#hcChatQuick');
    var form = win.querySelector('#hcChatForm');
    var input = win.querySelector('#hcChatInput');

    // Message d'accueil
    addMessage(body, 'bot', 'Bonjour 👋 Je suis l\'assistant HELP Confort. Comment puis-je vous aider ?');

    // Quick replies
    QUICK_OPTIONS.forEach(function (q) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = q;
      btn.addEventListener('click', function () {
        sendMessage(body, q);
        quick.style.display = 'none'; // Hide après 1er clic
      });
      quick.appendChild(btn);
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      sendMessage(body, msg);
      quick.style.display = 'none';
    });

    // Toggle open
    fab.addEventListener('click', function () {
      var isOpen = win.classList.contains('is-open');
      if (isOpen) {
        win.classList.remove('is-open');
        fab.classList.remove('is-open');
      } else {
        win.classList.add('is-open');
        fab.classList.add('is-open');
        setTimeout(function () { input.focus(); }, 300);
      }
    });

    // Close button
    win.querySelector('.hc-chat-head-close').addEventListener('click', function () {
      win.classList.remove('is-open');
      fab.classList.remove('is-open');
    });

    // Close sur Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && win.classList.contains('is-open')) {
        win.classList.remove('is-open');
        fab.classList.remove('is-open');
      }
    });
  }

  function init() {
    if (!document.getElementById('hc-chat-style')) {
      var st = document.createElement('style');
      st.id = 'hc-chat-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    buildWidget();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
