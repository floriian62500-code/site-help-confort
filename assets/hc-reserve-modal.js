// ═══════════════════════════════════════════════════════════════
// hc-reserve-modal.js
// Intercepte les clics sur les boutons "Réserver →" des cards tarifs
// Affiche une modale avec 2 choix : Demander un devis OU Réserver en ligne
// ═══════════════════════════════════════════════════════════════
(function(){
  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function(){
    // Ne s'applique qu'aux cards qui ne sont pas "complex" (devis obligatoire)
    var reserveButtons = document.querySelectorAll('.m-tarif-card:not(.complex) .m-tarif-action');
    if (!reserveButtons.length) return;

    // Modale globale
    if (!document.getElementById('hcReserveModal')) {
      var modal = document.createElement('div');
      modal.id = 'hcReserveModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = `
        <style>
          #hcReserveModal{position:fixed;inset:0;background:rgba(10,20,40,.55);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;z-index:9999;padding:24px;animation:hcrmFade .2s ease;font-family:Inter,sans-serif}
          #hcReserveModal.is-open{display:flex}
          @keyframes hcrmFade{from{opacity:0}to{opacity:1}}
          .hcrm-panel{background:#fff;border-radius:20px;max-width:520px;width:100%;box-shadow:0 30px 80px rgba(10,20,40,.40);animation:hcrmIn .25s cubic-bezier(.16,1,.3,1)}
          @keyframes hcrmIn{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
          .hcrm-head{padding:22px 26px 14px;border-bottom:1px solid #E5EDF3;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
          .hcrm-head h2{margin:0;font-size:1.15rem;font-weight:800;color:#0A1428;letter-spacing:-.01em;line-height:1.3}
          .hcrm-head .hcrm-sub{margin:6px 0 0;font-size:.86rem;color:#64748b}
          .hcrm-close{background:#F4F7FB;border:0;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:1.1rem;color:#475569;flex-shrink:0}
          .hcrm-close:hover{background:#E5EDF3}
          .hcrm-body{padding:22px 26px 26px;display:flex;flex-direction:column;gap:10px}
          .hcrm-opt{display:flex;align-items:center;gap:14px;padding:16px 18px;border:1.5px solid #E5EDF3;border-radius:14px;text-decoration:none;color:#0A1428;cursor:pointer;transition:all .15s ease;background:#fff;text-align:left;font-family:inherit;font-size:1rem;width:100%}
          .hcrm-opt:hover{border-color:#0DA0CF;background:rgba(13,160,207,.04);transform:translateY(-1px);box-shadow:0 8px 20px rgba(13,160,207,.10)}
          .hcrm-opt-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.6rem}
          .hcrm-opt.devis .hcrm-opt-icon{background:rgba(13,160,207,.10);color:#0DA0CF}
          .hcrm-opt.pay .hcrm-opt-icon{background:rgba(255,107,26,.10);color:#FF6B1A}
          .hcrm-opt-text{flex:1;min-width:0}
          .hcrm-opt-text strong{display:block;font-size:1.02rem;font-weight:700;color:#0A1428;margin-bottom:2px}
          .hcrm-opt-text span{display:block;font-size:.84rem;color:#475569;line-height:1.4}
          .hcrm-opt-arrow{color:#94a3b8;font-size:1.4rem;flex-shrink:0}
          .hcrm-opt:hover .hcrm-opt-arrow{color:#0DA0CF}
          .hcrm-tip{margin-top:8px;padding:12px 14px;background:#F7FBFD;border-radius:10px;font-size:.78rem;color:#64748b;line-height:1.5;text-align:center}
          @media(max-width:520px){.hcrm-panel{margin:0}.hcrm-head h2{font-size:1.05rem}.hcrm-opt{padding:14px 16px}.hcrm-opt-icon{width:40px;height:40px;font-size:1.4rem}}
        </style>
        <div class="hcrm-panel">
          <div class="hcrm-head">
            <div>
              <h2 id="hcrmTitle">Que souhaitez-vous faire ?</h2>
              <p class="hcrm-sub" id="hcrmSub">Pour : <strong id="hcrmPresta">—</strong></p>
            </div>
            <button class="hcrm-close" type="button" aria-label="Fermer">✕</button>
          </div>
          <div class="hcrm-body">
            <a class="hcrm-opt devis" id="hcrmDevisLink">
              <div class="hcrm-opt-icon">📋</div>
              <div class="hcrm-opt-text">
                <strong>Demander un devis personnalisé</strong>
                <span>Notre équipe vous rappelle sous 24h ouvrées pour préciser votre besoin.</span>
              </div>
              <div class="hcrm-opt-arrow">→</div>
            </a>
            <a class="hcrm-opt pay" id="hcrmPayLink">
              <div class="hcrm-opt-icon">💳</div>
              <div class="hcrm-opt-text">
                <strong>Réserver & payer en ligne</strong>
                <span>Bloquez votre créneau, paiement sécurisé · CB, Apple Pay, Google Pay.</span>
              </div>
              <div class="hcrm-opt-arrow">→</div>
            </a>
            <div class="hcrm-tip">
              💡 Le tarif définitif est annoncé après diagnostic. Aucun engagement avant validation du devis.
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Fermeture
      modal.querySelector('.hcrm-close').addEventListener('click', function(){ modal.classList.remove('is-open'); });
      modal.addEventListener('click', function(e){ if (e.target === modal) modal.classList.remove('is-open'); });
      document.addEventListener('keydown', function(e){ if (e.key === 'Escape') modal.classList.remove('is-open'); });
    }

    // Interception des clics
    reserveButtons.forEach(function(btn){
      btn.addEventListener('click', function(e){
        var card = btn.closest('.m-tarif-card');
        if (!card) return;
        var presta = card.getAttribute('data-presta') || 'Cette prestation';
        var prix = '';
        var prixEl = card.querySelector('.m-tarif-price');
        if (prixEl) prix = prixEl.textContent.trim();

        // Si le href ne va PAS vers contact.html, on laisse passer (lien direct genre tel: ou page guide)
        var href = btn.getAttribute('href') || '';
        if (!href.startsWith('contact.html')) return;

        e.preventDefault();

        var modal = document.getElementById('hcReserveModal');
        var slugMatch = href.match(/[?&]presta=([^&#]+)/);
        var slug = slugMatch ? slugMatch[1] : '';

        document.getElementById('hcrmPresta').textContent = presta + (prix ? ' · ' + prix : '');
        document.getElementById('hcrmDevisLink').setAttribute('href', 'contact.html?presta=' + encodeURIComponent(slug) + '#form');
        document.getElementById('hcrmPayLink').setAttribute('href', 'contact.html?presta=' + encodeURIComponent(slug) + '&action=paiement#form');
        modal.classList.add('is-open');
      });
    });
  });
})();
