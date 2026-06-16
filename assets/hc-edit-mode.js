/* HC-EDIT-MODE — Mode WYSIWYG complet (textes + images) sur staging
   Activation : ?edit=1 dans l'URL OU cookie hc_edit=1
   Hostname : staging-* uniquement (jamais sur depan59-62.fr)
   Auteur : agent IA HC, 2026-06-16
*/
(function(){
  'use strict';

  // ─── Garde-fous ─────────────────────────────────────────────────
  var host = location.hostname;
  if (!/staging|netlify\.app/.test(host)) return;
  if (/depan59-62\.fr$/.test(host)) return;
  if (/\/admin-pro\/|\/admin\//.test(location.pathname)) return;

  // Activation par ?edit=1 ou cookie hc_edit=1
  var qs = new URLSearchParams(location.search);
  if (qs.get('edit') === '1') document.cookie = 'hc_edit=1; path=/; max-age=86400';
  if (qs.get('edit') === '0') document.cookie = 'hc_edit=; path=/; max-age=0';
  var cookieOn = /(?:^|;\s*)hc_edit=1/.test(document.cookie);
  if (!cookieOn) return;
  if (window.__HC_EDIT_MODE__) return;
  window.__HC_EDIT_MODE__ = true;

  var SUPA_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';

  // ─── Page path detection ────────────────────────────────────────
  function getPagePath() {
    var p = location.pathname;
    if (p === '/' || p === '') return 'index.html';
    if (p.endsWith('/')) p += 'index.html';
    if (!/\.html?$/i.test(p)) p += '.html';
    return p.replace(/^\//, '');
  }
  var PAGE_PATH = getPagePath();

  // ─── Toolbar ────────────────────────────────────────────────────
  function buildToolbar() {
    var bar = document.createElement('div');
    bar.id = 'hc-edit-bar';
    bar.innerHTML =
      '<div class="hc-eb-left">'
      + '<span class="hc-eb-dot"></span>'
      + '<strong>Mode édition WYSIWYG</strong>'
      + '<span class="hc-eb-page">' + escapeHtml(PAGE_PATH) + '</span>'
      + '</div>'
      + '<div class="hc-eb-mid">'
      + '<span class="hc-eb-status" id="hc-eb-status">Prêt — clique sur n\'importe quel texte/image pour modifier</span>'
      + '</div>'
      + '<div class="hc-eb-right">'
      + '<button class="hc-eb-btn hc-eb-info" id="hc-eb-info">ℹ️</button>'
      + '<button class="hc-eb-btn hc-eb-quit" id="hc-eb-quit">✕ Quitter le mode édition</button>'
      + '</div>';
    document.body.appendChild(bar);
    document.body.classList.add('hc-edit-active');
    document.getElementById('hc-eb-quit').addEventListener('click', function(){
      document.cookie = 'hc_edit=; path=/; max-age=0';
      var newUrl = location.pathname + location.hash;
      location.href = newUrl + (newUrl.indexOf('?') > -1 ? '&' : '?') + 'edit=0';
    });
    document.getElementById('hc-eb-info').addEventListener('click', function(){
      alert('💡 Mode édition WYSIWYG\n\n• Click sur n\'importe quel texte = modifier en direct\n• Tab/Esc pour valider/annuler\n• Click sur une image = upload nouvelle image\n• Tes modifs partent sur STAGING (pas en prod tant que tu n\'as pas validé via le widget orange)\n\nPath : ' + PAGE_PATH);
    });
  }

  function setStatus(msg, type) {
    var el = document.getElementById('hc-eb-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'hc-eb-status' + (type ? ' is-' + type : '');
  }

  // ─── Styles ─────────────────────────────────────────────────────
  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'hc-edit-mode-styles';
    s.textContent = [
      '#hc-edit-bar{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:linear-gradient(90deg,#FF6B1A,#FF8A4A);color:#fff;padding:10px 18px;display:flex;align-items:center;gap:18px;font-family:Inter,system-ui,sans-serif;font-size:.86rem;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,.20);height:48px}',
      '#hc-edit-bar .hc-eb-left{display:flex;align-items:center;gap:10px;flex-shrink:0}',
      '#hc-edit-bar .hc-eb-dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:hcEbPulse 1.6s ease-in-out infinite}',
      '@keyframes hcEbPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.85)}}',
      '#hc-edit-bar .hc-eb-page{background:rgba(0,0,0,.20);padding:3px 10px;border-radius:6px;font-family:ui-monospace,monospace;font-weight:500;font-size:.78rem}',
      '#hc-edit-bar .hc-eb-mid{flex:1;text-align:center;font-weight:500;font-size:.82rem;color:rgba(255,255,255,.92)}',
      '#hc-edit-bar .hc-eb-status.is-saving{color:#FFE0B2}',
      '#hc-edit-bar .hc-eb-status.is-ok{color:#A7F3D0;font-weight:700}',
      '#hc-edit-bar .hc-eb-status.is-err{color:#FECACA;font-weight:700}',
      '#hc-edit-bar .hc-eb-right{display:flex;gap:8px}',
      '#hc-edit-bar .hc-eb-btn{background:rgba(0,0,0,.25);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:7px;padding:6px 13px;font:inherit;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .15s}',
      '#hc-edit-bar .hc-eb-btn:hover{background:rgba(0,0,0,.40)}',
      '#hc-edit-bar .hc-eb-quit{background:rgba(255,255,255,.18)}',
      'body.hc-edit-active{padding-top:48px}',
      '.hc-editable{outline:1px dashed rgba(13,160,207,.45);outline-offset:2px;border-radius:3px;cursor:text;transition:outline .12s,background .12s;position:relative}',
      '.hc-editable:hover{outline:2px solid #0DA0CF;background:rgba(13,160,207,.06)}',
      '.hc-editable.hc-editing{outline:2px solid #FF6B1A;background:rgba(255,107,26,.08);cursor:text}',
      '.hc-editable-img{cursor:pointer}',
      '.hc-editable-img:hover{outline:3px solid #0DA0CF;outline-offset:2px;box-shadow:0 0 0 8px rgba(13,160,207,.20)}',
      '.hc-edit-save-bar{position:absolute;top:-38px;left:0;background:#0A1428;color:#fff;border-radius:8px;padding:4px;display:flex;gap:4px;z-index:2147483646;box-shadow:0 8px 20px rgba(0,0,0,.30);font-family:Inter,system-ui,sans-serif;white-space:nowrap}',
      '.hc-edit-save-bar button{border:0;background:#22C55E;color:#fff;padding:6px 14px;border-radius:6px;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer}',
      '.hc-edit-save-bar button.cancel{background:#64748b}',
      '.hc-edit-save-bar button:hover{filter:brightness(1.10)}',
      '.hc-edit-img-modal{position:fixed;inset:0;background:rgba(0,0,0,.70);z-index:2147483646;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif}',
      '.hc-edit-img-modal .panel{background:#fff;border-radius:14px;padding:24px;max-width:560px;width:90%;box-shadow:0 24px 60px rgba(0,0,0,.40)}',
      '.hc-edit-img-modal h3{margin:0 0 6px;font-size:1.10rem;font-weight:800;color:#0A1428}',
      '.hc-edit-img-modal p{margin:0 0 16px;color:#64748b;font-size:.86rem;line-height:1.45}',
      '.hc-edit-img-modal .drop{border:2px dashed #CBD5E1;border-radius:10px;padding:32px;text-align:center;color:#64748b;cursor:pointer;transition:all .15s}',
      '.hc-edit-img-modal .drop:hover,.hc-edit-img-modal .drop.over{border-color:#0DA0CF;background:#EFF8FE;color:#0DA0CF}',
      '.hc-edit-img-modal .actions{display:flex;gap:8px;margin-top:18px;justify-content:flex-end}',
      '.hc-edit-img-modal .actions button{padding:9px 16px;border-radius:8px;border:0;font:inherit;font-weight:700;cursor:pointer;font-size:.86rem}',
      '.hc-edit-img-modal .cancel{background:#F1F5F9;color:#475569}',
      '.hc-edit-img-modal .primary{background:#0DA0CF;color:#fff}',
      '.hc-edit-toast{position:fixed;bottom:24px;right:24px;background:#0A1428;color:#fff;padding:12px 20px;border-radius:10px;z-index:2147483647;font-family:Inter,system-ui,sans-serif;font-weight:700;font-size:.88rem;box-shadow:0 8px 22px rgba(0,0,0,.30);transform:translateY(8px);opacity:0;transition:all .25s}',
      '.hc-edit-toast.show{opacity:1;transform:translateY(0)}',
      '.hc-edit-toast.ok{background:#22C55E}',
      '.hc-edit-toast.err{background:#EF4444}'
    ].join('');
    document.head.appendChild(s);
  }

  // ─── Helpers ────────────────────────────────────────────────────
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function toast(msg, type){
    var t = document.createElement('div');
    t.className = 'hc-edit-toast ' + (type || '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.classList.add('show'); }, 10);
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 3000);
  }
  function getToken(){ return localStorage.getItem('hc_gh_token') || ''; }

  // ─── Détection des éléments éditables ───────────────────────────
  function isEditableTextElement(el) {
    if (!el || el.nodeType !== 1) return false;
    var tag = el.tagName;
    if (!/^(H1|H2|H3|H4|H5|H6|P|SPAN|A|BUTTON|LI|STRONG|EM|LABEL|FIGCAPTION|BLOCKQUOTE|SUMMARY|TD|TH)$/.test(tag)) return false;
    if (el.closest('#hc-edit-bar') || el.closest('.hc-edit-img-modal') || el.closest('.hc-edit-save-bar')) return false;
    if (el.closest('header.hc-nav-bar')) return false; // skip nav top
    if (el.closest('script') || el.closest('style') || el.closest('noscript')) return false;
    var txt = (el.innerText || el.textContent || '').trim();
    if (!txt) return false;
    if (txt.length < 2) return false;
    // Skip if has block children (only edit terminal text nodes)
    var hasBlockChild = false;
    for (var i=0; i<el.children.length; i++){
      var c = el.children[i];
      if (/^(DIV|SECTION|ARTICLE|UL|OL|P|H1|H2|H3|H4|H5|H6|FORM)$/.test(c.tagName)) { hasBlockChild = true; break; }
    }
    if (hasBlockChild) return false;
    return true;
  }
  function isEditableImage(el) {
    if (!el || el.tagName !== 'IMG') return false;
    if (el.closest('#hc-edit-bar') || el.closest('.hc-edit-img-modal')) return false;
    return true;
  }

  function tagEditables() {
    var all = document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,li,strong,em,label,figcaption,blockquote,summary,td,th,img');
    all.forEach(function(el){
      if (isEditableTextElement(el)) {
        el.classList.add('hc-editable');
        el.dataset.hcEditType = 'text';
      } else if (isEditableImage(el)) {
        el.classList.add('hc-editable', 'hc-editable-img');
        el.dataset.hcEditType = 'image';
      }
    });
  }

  // ─── Édition TEXTE ──────────────────────────────────────────────
  var currentlyEditing = null;
  function startEditText(el) {
    if (currentlyEditing) return;
    currentlyEditing = el;
    var originalText = el.innerText;
    el.dataset.hcOriginalText = originalText;
    el.contentEditable = 'true';
    el.classList.add('hc-editing');
    el.focus();

    // Mini save-bar au-dessus
    var bar = document.createElement('div');
    bar.className = 'hc-edit-save-bar';
    bar.innerHTML = '<button class="save">💾 Sauvegarder</button><button class="cancel">✕ Annuler</button>';
    el.appendChild(bar);
    bar.contentEditable = 'false';

    bar.querySelector('.save').addEventListener('mousedown', function(e){ e.preventDefault(); saveText(el); });
    bar.querySelector('.cancel').addEventListener('mousedown', function(e){ e.preventDefault(); cancelText(el); });

    el.addEventListener('keydown', keyHandler);

    // Place caret end
    var sel = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function keyHandler(e){
    if (e.key === 'Escape') { e.preventDefault(); cancelText(currentlyEditing); }
    else if (e.key === 'Enter' && !e.shiftKey && currentlyEditing && currentlyEditing.tagName !== 'P' && currentlyEditing.tagName !== 'LI') {
      e.preventDefault(); saveText(currentlyEditing);
    }
  }
  function cleanupEdit(el) {
    var bar = el.querySelector('.hc-edit-save-bar');
    if (bar) bar.remove();
    el.contentEditable = 'false';
    el.classList.remove('hc-editing');
    el.removeEventListener('keydown', keyHandler);
    currentlyEditing = null;
  }
  function cancelText(el) {
    if (!el) return;
    el.innerText = el.dataset.hcOriginalText || '';
    cleanupEdit(el);
  }
  function saveText(el) {
    if (!el) return;
    var newText = el.innerText.replace(/\s*💾 Sauvegarder\s*✕ Annuler\s*$/, '').trim();
    var originalText = (el.dataset.hcOriginalText || '').trim();
    if (newText === originalText) { cleanupEdit(el); return; }
    var token = getToken();
    if (!token) {
      alert('⚠️ Renseigne ton PAT GitHub d\'abord (depuis /admin-pro/photos.html en haut)');
      cancelText(el);
      return;
    }
    setStatus('💾 Sauvegarde de "' + newText.slice(0, 40) + '"...', 'saving');
    fetch(SUPA_URL + '/functions/v1/hc-content-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_path: PAGE_PATH,
        original_text: originalText,
        new_text: newText,
        token: token
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.success) {
        setStatus('✅ Sauvegardé ! Commit ' + (d.commit_sha || '').slice(0,7) + ' — Netlify redéploie dans ~1 min', 'ok');
        toast('✅ Texte sauvegardé !', 'ok');
        el.innerText = newText;
        cleanupEdit(el);
      } else {
        setStatus('❌ ' + (d.error || 'erreur inconnue'), 'err');
        toast('❌ ' + (d.error || 'erreur'), 'err');
        cancelText(el);
      }
    })
    .catch(function(e){
      setStatus('❌ Réseau : ' + e.message, 'err');
      toast('❌ Erreur réseau', 'err');
      cancelText(el);
    });
  }

  // ─── Édition IMAGE ──────────────────────────────────────────────
  function startEditImage(img) {
    var src = img.getAttribute('src') || '';
    // Get the relative path (strip origin, query, etc.)
    var imgPath = src.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '').split('?')[0].split('#')[0];
    if (!imgPath || imgPath.startsWith('data:')) {
      alert('⚠️ Image non-modifiable (URL externe ou data-URL)');
      return;
    }
    var modal = document.createElement('div');
    modal.className = 'hc-edit-img-modal';
    modal.innerHTML =
      '<div class="panel">'
      + '<h3>📸 Remplacer l\'image</h3>'
      + '<p>Path : <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace;font-size:.84rem">' + escapeHtml(imgPath) + '</code></p>'
      + '<div class="drop" id="hc-img-drop">'
      + '<div style="font-size:2rem;margin-bottom:10px">📤</div>'
      + '<strong>Glisse-dépose la nouvelle image ici</strong>'
      + '<div style="margin-top:6px;font-size:.78rem">ou clique pour parcourir</div>'
      + '<input type="file" accept="image/*,.svg" style="display:none">'
      + '</div>'
      + '<div class="actions">'
      + '<button class="cancel">Annuler</button>'
      + '</div>'
      + '</div>';
    document.body.appendChild(modal);
    var drop = modal.querySelector('#hc-img-drop');
    var input = drop.querySelector('input');
    drop.addEventListener('click', function(){ input.click(); });
    input.addEventListener('change', function(e){
      var f = e.target.files[0];
      if (f) doUploadImage(f, imgPath, modal, img);
    });
    drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', function(){ drop.classList.remove('over'); });
    drop.addEventListener('drop', function(e){
      e.preventDefault(); drop.classList.remove('over');
      var f = e.dataTransfer.files[0];
      if (f) doUploadImage(f, imgPath, modal, img);
    });
    modal.querySelector('.cancel').addEventListener('click', function(){ modal.remove(); });
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
  }
  function doUploadImage(file, imgPath, modal, imgEl) {
    var token = getToken();
    if (!token) { alert('⚠️ Renseigne ton PAT GitHub d\'abord (depuis /admin-pro/photos.html en haut)'); return; }
    setStatus('📸 Upload ' + file.name + '...', 'saving');
    var reader = new FileReader();
    reader.onload = function(){
      var b64 = String(reader.result).split(',')[1];
      fetch(SUPA_URL + '/functions/v1/gh-push-inline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          owner: 'floriian62500-code',
          repo: 'site-help-confort',
          branch: 'staging',
          message: 'feat(wysiwyg): replace image ' + imgPath + ' (' + Math.round(file.size/1024) + ' KB)',
          files: [{ path: imgPath, content_b64: b64 }]
        })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.success) {
          setStatus('✅ Image uploadée ! Recharge la page dans ~1 min', 'ok');
          toast('✅ Image remplacée !', 'ok');
          // Force reload de l'image
          imgEl.src = imgEl.src.split('?')[0] + '?t=' + Date.now();
          modal.remove();
        } else {
          setStatus('❌ ' + (d.error || 'erreur'), 'err');
          toast('❌ ' + (d.error || 'erreur'), 'err');
        }
      })
      .catch(function(e){ setStatus('❌ Réseau : ' + e.message, 'err'); toast('❌ Erreur réseau', 'err'); });
    };
    reader.readAsDataURL(file);
  }

  // ─── Click handler global ───────────────────────────────────────
  document.addEventListener('click', function(e){
    if (!e.target.classList || !e.target.closest) return;
    var ed = e.target.closest('.hc-editable');
    if (!ed) return;
    if (ed.dataset.hcEditType === 'text') {
      if (currentlyEditing && currentlyEditing !== ed) return; // already editing something else
      if (ed.contentEditable === 'true') return; // already editing this
      e.preventDefault();
      e.stopPropagation();
      startEditText(ed);
    } else if (ed.dataset.hcEditType === 'image') {
      e.preventDefault();
      e.stopPropagation();
      startEditImage(ed);
    }
  }, true);

  // ─── Init ───────────────────────────────────────────────────────
  function init(){
    injectStyles();
    buildToolbar();
    tagEditables();
    // Re-tag periodically for dynamically inserted content
    var obs = new MutationObserver(function(){ tagEditables(); });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
