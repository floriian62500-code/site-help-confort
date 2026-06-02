/* HELP Confort — Rate-limit client (anti-spam formulaires)
 * 2026-06-02 : empêche spam : si même browser tente 3+ submissions en 60s, throttle.
 * Auto-attaché à tout form[data-hc-lead].
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'hc_submit_log';
  var WINDOW_MS = 60 * 1000;   // 1 minute
  var MAX_SUBMITS = 3;

  function readLog() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      var cutoff = Date.now() - WINDOW_MS;
      return arr.filter(function (t) { return t > cutoff; });
    } catch (_) { return []; }
  }

  function writeLog(log) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); } catch (_) {}
  }

  function checkAndRecord() {
    var log = readLog();
    if (log.length >= MAX_SUBMITS) {
      return false; // Bloqué
    }
    log.push(Date.now());
    writeLog(log);
    return true;
  }

  function showRateLimit(form) {
    var existing = form.querySelector('.hc-rate-limit-msg');
    if (existing) return;
    var box = document.createElement('div');
    box.className = 'hc-rate-limit-msg';
    box.style.cssText = 'margin:10px 0;padding:10px 14px;background:rgba(255,180,0,.12);color:#7C2D12;border-radius:10px;font-size:.86rem;border-left:3px solid #FFB400';
    box.innerHTML = '⏱ <strong>Trop de tentatives.</strong> Merci d\'attendre 1 minute avant de réessayer, ou de nous appeler au <a href="tel:+33366100134" style="color:#0DA0CF;font-weight:700">03 66 10 01 34</a>.';
    var submitBtn = form.querySelector('[type="submit"], button:not([type])');
    if (submitBtn && submitBtn.parentNode === form) form.insertBefore(box, submitBtn);
    else form.appendChild(box);
    setTimeout(function () { box.remove(); }, 10000);
  }

  function bind() {
    document.querySelectorAll('form[data-hc-lead]').forEach(function (form) {
      if (form.dataset.hcRateLimit) return;
      form.dataset.hcRateLimit = '1';
      form.addEventListener('submit', function (e) {
        if (!checkAndRecord()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showRateLimit(form);
        }
      }, { capture: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bind();
      new MutationObserver(bind).observe(document.body, { childList: true, subtree: true });
    });
  } else {
    bind();
    new MutationObserver(bind).observe(document.body, { childList: true, subtree: true });
  }
})();
