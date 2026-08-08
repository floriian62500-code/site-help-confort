/* HELP Confort — Middleware authentification dashboard admin-pro
 * 2026-06-03 : protège l'accès au BO derrière un code PIN (4-8 chiffres).
 * Le PIN est stocké en clair côté JS (pas de Supabase Auth full) :
 *   - filet de sécurité contre l'accès accidentel par URL directe
 *   - PAS un système de sécurité crypto-fort
 * Le PIN attendu est lu depuis localStorage('hc_admin_pin') côté Florian
 * la première fois (setup), puis hashé en SHA-256 stocké dans le code.
 *
 * Pour vraie sécurité prod : passer à Supabase Auth (auth.users + RLS auth.uid()).
 */
(function () {
  'use strict';

  // Hash SHA-256 du PIN attendu (par défaut : 264662 — "HC1234" → à changer en prod)
  // Calculé via : crypto.subtle.digest('SHA-256', new TextEncoder().encode('PIN')) → hex
  // PIN par défaut "264662" → hash :
  var EXPECTED_HASH = '49f703e82092d543408d0e67e5bfd98244fce3f5a7ada02b7621b3cfe7e0f2b3';
  // PIN par défaut : 264662 — à changer en éditant ce fichier + le hash ci-dessus
  var SESSION_KEY = 'hc_admin_session';
  var SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

  async function sha256(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.ok || !s.expires) return null;
      if (Date.now() > s.expires) { localStorage.removeItem(SESSION_KEY); return null; }
      return s;
    } catch (_) { return null; }
  }

  function setSession() {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, expires: Date.now() + SESSION_TTL_MS }));
    } catch (_) {}
  }

  function showGate() {
    // Masquer tout le contenu pendant la saisie PIN
    document.documentElement.style.overflow = 'hidden';
    var overlay = document.createElement('div');
    overlay.id = 'hc-admin-gate';
    overlay.innerHTML =
      '<style>' +
      '#hc-admin-gate{position:fixed;inset:0;z-index:99999;background:linear-gradient(135deg,#0A1428,#172240);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;color:#fff}' +
      '#hc-admin-gate .gate-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(20px);padding:48px 38px;border-radius:24px;text-align:center;max-width:380px;width:90%;box-shadow:0 24px 60px rgba(0,0,0,.40)}' +
      '#hc-admin-gate h1{font-size:1.4rem;font-weight:800;margin:0 0 8px;letter-spacing:-.02em}' +
      '#hc-admin-gate p{font-size:.88rem;color:rgba(255,255,255,.65);margin:0 0 24px;line-height:1.5}' +
      '#hc-admin-gate input{width:100%;padding:14px 18px;font-size:1.4rem;text-align:center;letter-spacing:.3em;border:1.5px solid rgba(255,255,255,.20);border-radius:12px;background:rgba(0,0,0,.30);color:#fff;font-family:inherit;outline:none;box-sizing:border-box}' +
      '#hc-admin-gate input:focus{border-color:#1FC4F0;box-shadow:0 0 0 4px rgba(31,196,240,.18)}' +
      '#hc-admin-gate button{margin-top:14px;width:100%;padding:14px 18px;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;border:0;border-radius:12px;font:700 .98rem inherit;cursor:pointer;font-family:inherit}' +
      '#hc-admin-gate button:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(13,160,207,.30)}' +
      '#hc-admin-gate .err{margin-top:12px;color:#FCA5A5;font-size:.84rem;min-height:18px}' +
      '#hc-admin-gate .logo{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:linear-gradient(135deg,#0DA0CF,#0A4F6E);border-radius:14px;margin-bottom:18px;font-size:1.4rem;font-weight:800;color:#fff}' +
      '</style>' +
      '<div class="gate-box">' +
        '<div class="logo">🔐</div>' +
        '<h1>Espace Admin HELP Confort</h1>' +
        '<p>Saisis ton code PIN pour accéder au dashboard.</p>' +
        '<input type="password" id="hc-admin-pin" inputmode="numeric" autocomplete="off" pattern="[0-9]*" placeholder="••••••" autofocus>' +
        '<button type="button" id="hc-admin-submit">Déverrouiller →</button>' +
        '<div class="err" id="hc-admin-err"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = document.getElementById('hc-admin-pin');
    var btn = document.getElementById('hc-admin-submit');
    var err = document.getElementById('hc-admin-err');

    async function tryUnlock() {
      var pin = (input.value || '').trim();
      if (!pin) { err.textContent = 'PIN requis'; return; }
      var h = await sha256(pin);
      if (h === EXPECTED_HASH) {
        setSession();
        overlay.remove();
        document.documentElement.style.overflow = '';
      } else {
        err.textContent = '❌ PIN incorrect';
        input.value = '';
        input.focus();
      }
    }
    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
  }

  // Init : si pas de session valide, afficher le gate
  if (!getSession()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showGate);
    } else {
      showGate();
    }
  }
})();
