/**
 * HELP Confort — Widget UNIFIÉ
 * - Un seul bouton flottant (en bas à droite)
 * - Menu d'actions au clic : Urgence, Chat assistant, Devis instant
 * - Cache automatiquement le bouton URGENCE séparé (HC-EMERGENCY-FAB-V1)
 *
 * (c) 2026 HELP Confort Saint-Omer & Dunkerque
 */
(function() {
  'use strict';

  if (window.__HC_WIDGETS__) return;
  window.__HC_WIDGETS__ = true;

  var PHONE = "+33366100134";
  var PHONE_DISPLAY = "03 66 10 01 34";

  // ========== FIX CSS GLOBAL ==========
  // - Cache les anciens widgets flottants redondants
  // - FIX BUG dropdown menu : force opacity 0 + visibility hidden par défaut
  //   (sur certaines pages, le CSS inline manquait, causant l'affichage permanent)
  var hideOldEmerg = function() {
    var st = document.createElement('style');
    st.textContent =
      '#hc-emerg, #chatUrg, .chat-urg, .chat-urg-fab { display: none !important; visibility: hidden !important; pointer-events: none !important; }' +
      // Fix dropdown menus
      '.nav-item-drop { position: relative !important; display: inline-block !important; }' +
      '.nav-dropdown { ' +
      '  position: absolute !important; ' +
      '  top: 100% !important; ' +
      '  left: 50% !important; ' +
      '  transform: translateX(-50%) translateY(-8px) !important; ' +
      '  opacity: 0 !important; ' +
      '  visibility: hidden !important; ' +
      '  pointer-events: none !important; ' +
      '  background: #fff !important; ' +
      '  border-radius: 14px !important; ' +
      '  box-shadow: 0 24px 60px rgba(10,20,40,.18), 0 0 0 1px rgba(10,20,40,.04) !important; ' +
      '  padding: 10px !important; ' +
      '  min-width: 280px !important; ' +
      '  transition: all .25s cubic-bezier(.16,1,.3,1) !important; ' +
      '  z-index: 200 !important; ' +
      '  margin-top: 4px !important; ' +
      '} ' +
      '.nav-item-drop:hover > .nav-dropdown, .nav-item-drop:focus-within > .nav-dropdown { ' +
      '  opacity: 1 !important; ' +
      '  visibility: visible !important; ' +
      '  pointer-events: auto !important; ' +
      '  transform: translateX(-50%) translateY(0) !important; ' +
      '} ' +
      '@media (max-width: 900px){ .nav-desktop .nav-dropdown { display: none !important; } }';
    document.head.appendChild(st);
    ['hc-emerg', 'chatUrg'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) { el.style.display = 'none'; el.setAttribute('aria-hidden', 'true'); }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideOldEmerg);
  } else {
    hideOldEmerg();
  }

  // =========== STYLES ===========
  var style = document.createElement('style');
  style.textContent = "" +
    /* Bouton principal flottant unifié */
    /* 2026-06-04 — Fix débordement chat widget : verrouiller la largeur pour ne JAMAIS s'étaler */
    ".hc-fab{position:fixed;right:18px;bottom:18px;z-index:9998;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:Inter,system-ui,sans-serif;width:auto;max-width:108px;pointer-events:auto;contain:layout style}" +
    ".hc-fab > *{max-width:100%}" +
    ".hc-fab.open,.hc-fab.chat-open{max-width:none;width:auto}" +
    "@media(min-width:900px){.hc-fab{right:28px;bottom:28px}}" +

    /* Bouton premium avec mascotte intégrée */
    ".hc-fab-btn--premium{width:108px;height:108px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#1FC4F0 0%,#0DA0CF 60%,#0A7BA8 100%);color:#fff;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 24px 50px rgba(13,160,207,.55),0 0 0 8px rgba(31,196,240,.18),inset 0 -4px 14px rgba(0,0,0,.20);transition:all .35s cubic-bezier(.16,1,.3,1);position:relative;outline:none;overflow:visible}" +
    ".hc-fab-btn--premium:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 24px 50px rgba(13,160,207,.60),0 0 0 8px rgba(31,196,240,.18),inset 0 -3px 12px rgba(0,0,0,.18)}" +
    ".hc-fab-btn--premium:active{transform:scale(.95)}" +
    ".hc-fab-btn--premium .hc-fab-masc{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:130px;height:auto;max-height:150px;object-fit:contain;object-position:center top;filter:drop-shadow(0 6px 12px rgba(0,0,0,.30));pointer-events:none;transition:transform .35s cubic-bezier(.16,1,.3,1)}" +
    ".hc-fab-btn--premium:hover .hc-fab-masc{transform:translateX(-50%) translateY(-3px) rotate(-3deg)}" +
    ".hc-fab.open .hc-fab-btn--premium .hc-fab-masc{opacity:0;transform:translateX(-50%) scale(.6)}" +
    ".hc-fab.open .hc-fab-btn--premium .ic-open{display:none !important}" +
    ".hc-fab.open .hc-fab-btn--premium .ic-close{display:block;opacity:1}" +
    ".hc-fab-btn--premium .pulse{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(31,196,240,.45);animation:hcPulseRing 2.4s ease-out infinite;pointer-events:none}" +
    ".hc-fab-btn--premium::after{content:'';position:absolute;inset:-12px;border-radius:50%;border:1px solid rgba(31,196,240,.25);animation:hcPulseRing2 3.2s ease-out infinite;pointer-events:none}" +
    "@keyframes hcPulseRing{0%{transform:scale(.85);opacity:1}100%{transform:scale(1.45);opacity:0}}" +
    "@keyframes hcPulseRing2{0%{transform:scale(.9);opacity:.7}100%{transform:scale(1.6);opacity:0}}" +
    ".hc-fab-btn--premium .badge{position:absolute;top:0;right:0;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#FF6B1A;border:2px solid #fff;color:#fff;font-size:.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;z-index:5}" +
    ".hc-fab-btn--premium .ic-close{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:none}" +
    ".hc-fab.open .hc-fab-btn--premium{background:linear-gradient(135deg,#0A1428,#0E2240);box-shadow:0 18px 40px rgba(10,20,40,.40)}" +

    /* Bulle de message dynamique premium au-dessus du bouton */
    ".hc-fab-bubble{position:absolute;bottom:40px;right:130px;z-index:6;background:#fff;color:#0A1428;padding:11px 18px;border-radius:18px 18px 4px 18px;box-shadow:0 14px 32px rgba(13,160,207,.22),0 2px 6px rgba(10,20,40,.08);font-size:.92rem;font-weight:700;max-width:240px;white-space:nowrap;animation:hcBubbleFloat 5s ease-in-out infinite,hcBubbleEnter .5s ease-out;cursor:default;border:1.5px solid rgba(13,160,207,.18)}" +
    ".hc-fab-bubble .hcfb-text{color:#0A1428;letter-spacing:-.005em;display:inline-block}" +
    ".hc-fab-bubble::after{content:'';position:absolute;bottom:14px;right:-7px;width:14px;height:14px;background:#fff;border-top:1px solid rgba(13,160,207,.12);border-right:1px solid rgba(13,160,207,.12);transform:rotate(45deg)}" +
    ".hc-fab.open .hc-fab-bubble{display:none}" +
    "@keyframes hcBubbleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}" +
    "@keyframes hcBubbleEnter{0%{opacity:0;transform:translateY(8px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}" +
    "@media(max-width:480px){.hc-fab-bubble{display:none}.hc-fab-btn--premium{width:68px;height:68px}.hc-fab-btn--premium .hc-fab-masc{width:80px}}" +

    /* Menu d'actions */
    ".hc-menu{display:none;flex-direction:column;gap:10px;background:#fff;border-radius:18px;padding:12px;box-shadow:0 24px 60px rgba(10,20,40,.18),0 0 0 1px rgba(10,20,40,.04);min-width:280px;opacity:0;transform:translateY(10px) scale(.95);transition:all .25s cubic-bezier(.16,1,.3,1);transform-origin:bottom right}" +
    ".hc-fab.open .hc-menu{display:flex;opacity:1;transform:none}" +
    ".hc-menu-head{padding:8px 10px 4px;font-size:.74rem;font-weight:800;letter-spacing:1.4px;color:#64748b;text-transform:uppercase;border-bottom:1px solid #F0F4F8;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}" +
    ".hc-menu-head .live{display:inline-flex;align-items:center;gap:6px;color:#22A06B;font-size:.66rem;text-transform:uppercase}" +
    ".hc-menu-head .live::before{content:'';width:7px;height:7px;border-radius:50%;background:#22A06B;box-shadow:0 0 8px #22A06B;animation:hcLivePulse 1.5s ease-in-out infinite}" +
    "@keyframes hcLivePulse{0%,100%{opacity:1}50%{opacity:.5}}" +

    ".hc-action{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;text-decoration:none;color:#0A1428;background:#F7FBFD;border:0;cursor:pointer;font-family:inherit;font-size:.92rem;font-weight:600;width:100%;text-align:left;transition:all .15s ease}" +
    ".hc-action:hover{transform:translateX(2px)}" +
    ".hc-action .ic{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff}" +
    ".hc-action .lbl{display:flex;flex-direction:column;line-height:1.2}" +
    ".hc-action .lbl .t{font-weight:800;font-size:.95rem;color:#0A1428}" +
    ".hc-action .lbl .s{font-size:.78rem;color:#64748b;font-weight:500;margin-top:2px}" +

    ".hc-action.urgent{background:linear-gradient(135deg,#FFF0F0,#FCE7EB)}" +
    ".hc-action.urgent:hover{background:linear-gradient(135deg,#FFE0E5,#F8D5DD)}" +
    ".hc-action.urgent .ic{background:linear-gradient(135deg,#E11D48,#C0392B);box-shadow:0 6px 16px rgba(225,29,72,.30);animation:hcUrgentPulse 1.8s ease-in-out infinite}" +
    "@keyframes hcUrgentPulse{0%,100%{box-shadow:0 6px 16px rgba(225,29,72,.30)}50%{box-shadow:0 6px 22px rgba(225,29,72,.55)}}" +
    ".hc-action.urgent .lbl .t{color:#C0392B}" +

    ".hc-action.chat .ic{background:linear-gradient(135deg,#0DA0CF,#1FC4F0)}" +
    ".hc-action.chat:hover{background:#EBF6FB}" +

    ".hc-action.devis .ic{background:linear-gradient(135deg,#FF6B1A,#E55810)}" +
    ".hc-action.devis:hover{background:#FFF7ED}" +

    ".hc-menu-foot{padding:10px 4px 2px;font-size:.74rem;color:#64748b;text-align:center;border-top:1px solid #F0F4F8;margin-top:4px}" +
    ".hc-menu-foot a{color:#0DA0CF;font-weight:700;text-decoration:none}" +

    /* Panneau chat */
    ".hc-chat-panel{display:none;flex-direction:column;background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(10,20,40,.25);width:calc(100vw - 36px);max-width:380px;max-height:80vh;overflow:hidden;opacity:0;transform:translateY(10px) scale(.95);transition:all .25s cubic-bezier(.16,1,.3,1);transform-origin:bottom right}" +
    ".hc-chat-status{display:inline-flex;align-items:center;gap:5px}.hc-chat-dot{width:8px;height:8px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 0 rgba(34,197,94,.7);animation:hcDot 2s ease-out infinite}@keyframes hcDot{0%{box-shadow:0 0 0 0 rgba(34,197,94,.7)}70%{box-shadow:0 0 0 5px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}" +
    ".hc-chat-msg{display:flex;gap:8px;margin-bottom:12px;animation:hcMsgIn .25s ease}@keyframes hcMsgIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}" +
    ".hc-chat-msg-bot{align-items:flex-start}.hc-chat-msg-user{flex-direction:row-reverse}" +
    ".hc-chat-msg .av-mini{flex-shrink:0;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;color:#fff}" +
    ".hc-chat-msg-bot .av-mini{background:linear-gradient(135deg,#0DA0CF,#1FC4F0)}.hc-chat-msg-user .av-mini{background:#0A1428}" +
    ".hc-chat-bubble{max-width:75%;padding:10px 13px;border-radius:14px;font-size:.88rem;line-height:1.45;color:#0A1428;word-wrap:break-word;white-space:pre-wrap}" +
    ".hc-chat-msg-bot .hc-chat-bubble{background:#F1F5F9;border-bottom-left-radius:4px}" +
    ".hc-chat-msg-user .hc-chat-bubble{background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;border-bottom-right-radius:4px}" +
    ".hc-chat-typing{display:inline-flex;gap:3px;padding:10px 13px;background:#F1F5F9;border-radius:14px;border-bottom-left-radius:4px}" +
    ".hc-chat-typing span{width:6px;height:6px;border-radius:50%;background:#94A3B8;animation:hcType 1.2s ease-in-out infinite}" +
    ".hc-chat-typing span:nth-child(2){animation-delay:.15s}.hc-chat-typing span:nth-child(3){animation-delay:.3s}" +
    "@keyframes hcType{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}" +
    ".hc-chat-input-row{display:flex;gap:6px;padding:10px 12px;border-top:1px solid #E5EDF3;background:#fff}" +
    ".hc-chat-input{flex:1;border:1.5px solid #E5EDF3;border-radius:18px;padding:9px 14px;font-family:inherit;font-size:.88rem;resize:none;outline:none;max-height:120px;transition:border-color .2s ease;background:#F7FBFD;color:#0A1428}" +
    ".hc-chat-input:focus{border-color:#0DA0CF;background:#fff}" +
    ".hc-chat-send{flex-shrink:0;width:38px;height:38px;border:0;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:transform .2s ease,opacity .2s ease}" +
    ".hc-chat-send:hover:not(:disabled){transform:scale(1.06)}.hc-chat-send:disabled{opacity:.5;cursor:not-allowed}" +
    ".hc-chat-body{padding:14px 14px 6px}" +
    ".hc-fab.chat-open .hc-chat-panel{display:flex;opacity:1;transform:none}" +
    ".hc-fab.chat-open .hc-menu{display:none}" +

    ".hc-chat-head{background:linear-gradient(135deg,#0A1428,#0E2240);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}" +
    ".hc-chat-head .av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.95rem;font-weight:800;color:#fff}" +
    ".hc-chat-head .info h4{margin:0;font-size:.92rem;font-weight:800;color:#fff;line-height:1.2}" +
    ".hc-chat-head .info span{display:flex;align-items:center;gap:5px;font-size:.72rem;color:rgba(255,255,255,.78);margin-top:2px}" +
    ".hc-chat-head .info span::before{content:'';width:7px;height:7px;border-radius:50%;background:#22A06B;display:inline-block;box-shadow:0 0 8px #22A06B}" +
    ".hc-chat-head .back{margin-left:auto;background:none;border:0;color:rgba(255,255,255,.7);cursor:pointer;font-size:1.1rem;padding:6px 10px;border-radius:8px;transition:background .15s}" +
    ".hc-chat-head .back:hover{background:rgba(255,255,255,.1);color:#fff}" +

    ".hc-chat-body{padding:16px;overflow-y:auto;flex:1;background:#F7FBFD;display:flex;flex-direction:column;gap:10px;min-height:200px}" +
    ".hc-msg{display:flex;gap:8px;align-items:flex-start;animation:hcMsgIn .25s ease}" +
    "@keyframes hcMsgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    ".hc-msg.user{flex-direction:row-reverse}" +
    ".hc-msg .av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;flex-shrink:0}" +
    ".hc-msg.user .av{background:#475569}" +
    ".hc-msg .bub{background:#fff;padding:10px 13px;border-radius:13px;font-size:.9rem;line-height:1.45;color:#0A1428;max-width:78%;box-shadow:0 4px 12px rgba(10,20,40,.05)}" +
    ".hc-msg.user .bub{background:#0DA0CF;color:#fff}" +
    ".hc-msg .bub a{color:#0DA0CF;font-weight:700}" +
    ".hc-msg.user .bub a{color:#fff}" +

    ".hc-quick{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 16px;background:#F7FBFD;border-top:1px solid #E5EDF3}" +
    ".hc-quick.no-border{border-top:0;padding-top:6px}" +
    ".hc-quick button{background:#fff;border:1.5px solid #0DA0CF;color:#0DA0CF;padding:8px 12px;border-radius:9px;font-family:inherit;font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s ease;text-align:left}" +
    ".hc-quick button:hover{background:#0DA0CF;color:#fff;transform:translateY(-1px)}" +
    ".hc-quick button.urgent{background:#FFF0F0;border-color:#E11D48;color:#C0392B}" +
    ".hc-quick button.urgent:hover{background:#E11D48;color:#fff}" +

    ".hc-chat-foot{background:#fff;padding:10px 16px;border-top:1px solid #E5EDF3;font-size:.72rem;color:#64748b;text-align:center}" +
    ".hc-chat-foot a{color:#0DA0CF;font-weight:700;text-decoration:none}" +

    /* MODAL CALCULATEUR */
    ".hc-modal{position:fixed;inset:0;z-index:10000;background:rgba(10,20,40,.75);display:none;align-items:center;justify-content:center;padding:20px;animation:hcFade .25s ease}" +
    ".hc-modal.open{display:flex}" +
    "@keyframes hcFade{from{opacity:0}to{opacity:1}}" +
    ".hc-modal-c{background:#fff;border-radius:20px;padding:28px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;position:relative;font-family:Inter,system-ui,sans-serif}" +
    ".hc-modal-c .close{position:absolute;top:14px;right:14px;background:#F7FBFD;border:0;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.4rem;color:#475569;display:flex;align-items:center;justify-content:center;transition:all .15s}" +
    ".hc-modal-c .close:hover{background:#E11D48;color:#fff}" +
    ".hc-modal-c h3{margin:0 0 8px;font-size:1.4rem;color:#0A1428;font-weight:800;line-height:1.2}" +
    ".hc-modal-c .sub{color:#475569;font-size:.92rem;margin:0 0 22px;line-height:1.5}" +
    ".hc-calc-grp{margin-bottom:18px}" +
    ".hc-calc-grp label{display:block;font-size:.82rem;font-weight:700;color:#0A1428;margin-bottom:8px}" +
    ".hc-calc-grp .opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".hc-calc-grp .opt{background:#F7FBFD;border:1.5px solid #E5EDF3;border-radius:10px;padding:10px 12px;font-size:.86rem;font-weight:600;color:#0A1428;cursor:pointer;text-align:center;transition:all .15s ease}" +
    ".hc-calc-grp .opt:hover{border-color:#0DA0CF}" +
    ".hc-calc-grp .opt.active{background:#0DA0CF;color:#fff;border-color:#0DA0CF}" +
    ".hc-result{background:linear-gradient(135deg,#F7FBFD,#EBF6FB);border:1.5px solid #1FC4F0;border-radius:14px;padding:20px;margin:14px 0 18px;text-align:center}" +
    ".hc-result .label{font-size:.78rem;font-weight:800;letter-spacing:1.4px;color:#0DA0CF;text-transform:uppercase;margin-bottom:6px}" +
    ".hc-result .val{font-size:1.6rem;font-weight:800;color:#0A1428;font-family:'Playfair Display',Georgia,serif}" +
    ".hc-result .note{font-size:.78rem;color:#64748b;margin-top:6px}" +
    ".hc-modal-c .submit{display:block;width:100%;background:#FF6B1A;color:#fff;padding:14px;border:0;border-radius:12px;font-weight:800;font-size:1rem;cursor:pointer;text-decoration:none;text-align:center;transition:transform .2s ease}" +
    ".hc-modal-c .submit:hover{transform:translateY(-2px)}" +
    "";
  document.head.appendChild(style);

  // =========== ARBRE DE DÉCISION CHAT ===========
  var TREE = {
    start: {
      msg: "Bonjour 👋 Je suis l'assistant HELP Confort. Comment puis-je vous orienter ?",
      opts: [
        { label: "📋 Demander un devis", to: "devis" },
        { label: "❓ J'ai une question", to: "question" },
        { label: "🏢 Je suis un pro", to: "pro" }
      ]
    },
    devis: {
      msg: "Pour quel type de prestation ?",
      opts: [
        { label: "🚿 Plomberie", to: "d_plomb" },
        { label: "🔥 Chauffage / chaudière", to: "d_chauf" },
        { label: "⚡ Électricité", to: "d_elec" },
        { label: "🔧 Travaux / rénovation", to: "d_renov" }
      ]
    },
    d_plomb: { msg: "Plomberie : fuites, dégorgements, ballons, salles de bain. Voulez-vous une <strong>estimation rapide</strong> ou un <strong>devis détaillé</strong> ?", opts: [
      { label: "💡 Estimation rapide", action: "calc" },
      { label: "📋 Devis détaillé", action: "link", url: "contact.html" },
      { label: "← Retour", to: "devis" }
    ]},
    d_chauf: { msg: "Chauffage : entretien annuel, dépannage, remplacement chaudière, contrats. Préférez-vous appeler ou un formulaire ?", opts: [
      { label: "📞 Appeler", action: "call" },
      { label: "📋 Formulaire", action: "link", url: "contact.html" },
      { label: "💡 Estimation rapide", action: "calc" }
    ]},
    d_elec: { msg: "Électricité : mise aux normes, dépannage, tableaux, domotique, bornes IRVE. Diagnostic gratuit chez vous.", opts: [
      { label: "📞 Appeler", action: "call" },
      { label: "📖 Guide NF C 15-100", action: "link", url: "guide-mise-aux-normes-electriques.html" },
      { label: "💡 Estimation rapide", action: "calc" }
    ]},
    d_renov: { msg: "Rénovation, menuiserie, volets, adaptation PMR : projet sur mesure après visite gratuite.", opts: [
      { label: "📞 Appeler", action: "call" },
      { label: "📋 Formulaire", action: "link", url: "contact.html" },
      { label: "🏠 Guide adaptation PMR", action: "link", url: "guide-adaptation-pmr.html" }
    ]},
    question: {
      msg: "Quelle est votre question ?",
      opts: [
        { label: "💶 Combien ça coûte ?", to: "q_prix" },
        { label: "📅 Délai d'intervention ?", to: "q_delai" },
        { label: "🛡️ Garanties / assurance ?", to: "q_garantie" },
        { label: "📍 Vous intervenez chez moi ?", to: "q_zone" }
      ]
    },
    q_prix: { msg: "Tarifs <strong>annoncés avant intervention</strong>. Déplacement gratuit sur Saint-Omer. Main d'œuvre dès 52 € HT/h. Contrats annuels dès 12 €/mois.", opts: [
      { label: "💡 Estimation rapide", action: "calc" },
      { label: "📋 Voir les contrats", action: "link", url: "contrats-entretien.html" },
      { label: "← Retour", to: "start" }
    ]},
    q_delai: { msg: "<strong>Saint-Omer</strong> : moins de 30 min. <strong>Audomarois</strong> : moins d'1 h. <strong>Dunkerquois</strong> : 30-60 min. Hors horaires : rappel sous 30 min.", opts: [
      { label: "📞 Appeler", action: "call" },
      { label: "← Retour", to: "start" }
    ]},
    q_garantie: { msg: "Tous nos travaux sont couverts par notre <strong>assurance décennale</strong>. Nous gérons aussi les dossiers d'assurance habitation pour les sinistres.", opts: [
      { label: "🛡️ Voir page sinistres", action: "link", url: "sinistres.html" },
      { label: "← Retour", to: "start" }
    ]},
    q_zone: { msg: "Saint-Omer, Dunkerque et alentours : Longuenesse, Arques, Saint-Martin-lez-Tatinghem, Aire-sur-la-Lys, Lumbres, Hazebrouck, Gravelines, Bergues, Bourbourg, Loon-Plage…", opts: [
      { label: "📞 Vérifier ma zone", action: "call" },
      { label: "← Retour", to: "start" }
    ]},
    pro: { msg: "Vous êtes assurance, syndic, bailleur, collectivité, commerce ou industriel ? Espace pro dédié.", opts: [
      { label: "🏢 Voir l'Espace Pro", action: "link", url: "pro.html" },
      { label: "📞 Parler à Florian", action: "call" },
      { label: "← Retour", to: "start" }
    ]}
  };

  // =========== BUILD UI ===========
  var fab = document.createElement('div');
  fab.className = 'hc-fab';
  fab.innerHTML =
    "<div class='hc-chat-panel' role='dialog' aria-label='Assistant HELP Confort'>" +
      "<div class='hc-chat-head'>" +
        "<div class='av' style='background:linear-gradient(135deg,#0DA0CF,#1FC4F0);color:#fff'>✨</div>" +
        "<div class='info'><h4>Assistant HELP Confort</h4><span class='hc-chat-status'><span class='hc-chat-dot'></span>En ligne · IA + équipe humaine</span></div>" +
        "<button class='back' aria-label='Retour menu'>‹ Menu</button>" +
      "</div>" +
      "<div class='hc-chat-body' id='hcChatBody'></div>" +
      "<div class='hc-quick' id='hcChatQuick'></div>" +
      "<div class='hc-chat-input-row' id='hcChatInputRow'>" +
        "<textarea id='hcChatInput' class='hc-chat-input' placeholder='Décrivez votre situation…' rows='1' maxlength='1000'></textarea>" +
        "<button type='button' id='hcChatSend' class='hc-chat-send' aria-label='Envoyer'>" +
          "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><line x1='22' y1='2' x2='11' y2='13'/><polygon points='22 2 15 22 11 13 2 9 22 2'/></svg>" +
        "</button>" +
      "</div>" +
      "<div class='hc-chat-foot'>Urgence ? <a href='tel:" + PHONE + "'>" + PHONE_DISPLAY + "</a> · <span style='color:#94a3b8'>Réponses IA basées sur votre historique</span></div>" +
    "</div>" +
    "<div class='hc-menu' role='menu'>" +
      "<div class='hc-menu-head'><span>HELP Confort</span><span class='live'>En ligne</span></div>" +
      "<a href='tel:" + PHONE + "' class='hc-action urgent' data-act='call'>" +
        "<span class='ic'><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/></svg></span>" +
        "<span class='lbl'><span class='t'>Urgence — Appel direct</span><span class='s' id='hcOpenLabel'>" + PHONE_DISPLAY + "</span></span>" +
      "</a>" +
      "<button type='button' class='hc-action chat' data-act='chat'>" +
        "<span class='ic'><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg></span>" +
        "<span class='lbl'><span class='t'>Discuter avec nous</span><span class='s'>Question, devis, infos…</span></span>" +
      "</button>" +
      "<button type='button' class='hc-action devis' data-act='calc'>" +
        "<span class='ic'><svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/></svg></span>" +
        "<span class='lbl'><span class='t'>Estimer un devis</span><span class='s'>Calcul instantané</span></span>" +
      "</button>" +
      "<div class='hc-menu-foot'>Lun-Sam 8h-18h · Réponse immédiate</div>" +
    "</div>" +
    "<div class='hc-fab-bubble' aria-hidden='true'><span class='hcfb-text'>Une question ?</span><span class='hcfb-arrow'></span></div>" +
    "<button type='button' class='hc-fab-btn hc-fab-btn--premium' aria-label='Ouvrir le menu HELP Confort' aria-expanded='false'>" +
      "<span class='pulse'></span>" +
      "<span class='badge' style='display:none'>1</span>" +
      "<img class='hc-fab-masc' src='/images/mascotte.webp' alt='' onerror=\"this.src='/images/mascotte.png';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display=''}\" loading='lazy'>" +
      "<svg class='ic-open' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' style='display:none'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>" +
      "<svg class='ic-close' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#fff' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/></svg>" +
    "</button>";
  document.body.appendChild(fab);

  // === Textes dynamiques rotatifs dans la bulle FAB (contextuels par page) ===
  (function rotateBubbleText() {
    var bubble = fab.querySelector('.hcfb-text');
    if (!bubble) return;
    var path = (location.pathname || '').toLowerCase();
    var MSGS_BY_CONTEXT = {
      plombier:    ['Une fuite ?', 'Débouchage urgent ?', 'Chauffe-eau HS ?', 'Besoin d\'un devis ?', 'On vous rappelle ?'],
      chauffagiste:['Plus de chauffage ?', 'Chaudière en panne ?', 'Entretien à prévoir ?', 'Besoin d\'un devis ?', 'On vous rappelle ?'],
      electricien: ['Panne de courant ?', 'Tableau électrique HS ?', 'Mise aux normes ?', 'Besoin d\'un devis ?', 'On vous rappelle ?'],
      serrurier:   ['Porte claquée ?', 'Serrure HS ?', 'Bris de glace ?', 'Besoin d\'un devis ?', 'On vous rappelle ?'],
      vitrier:     ['Bris de glace ?', 'Vitrage cassé ?', 'Mise en sécurité ?', 'Devis sur mesure ?', 'On vous rappelle ?'],
      menuisier:   ['Porte abîmée ?', 'Panneau cassé ?', 'Pose fenêtres ?', 'Devis sur mesure ?', 'On vous rappelle ?'],
      volets:      ['Volet bloqué ?', 'Tablier cassé ?', 'Moteur HS ?', 'Pose neuve ?', 'On vous rappelle ?'],
      pmr:         ['Adaptation PMR ?', 'Douche italienne ?', 'MaPrimeAdapt\' ?', 'Devis sur mesure ?', 'On vous rappelle ?'],
      travaux:     ['Projet rénovation ?', 'Devis sur mesure ?', 'Une question travaux ?', 'On vous rappelle ?'],
      contrats:    ['Un contrat sur mesure ?', 'Quelle formule ?', 'Une question ?', 'On vous rappelle ?'],
      contact:     ['Une question ?', 'Demande de devis ?', 'On vous rappelle ?'],
      'default':   ['Une question ?', 'Une fuite ?', 'Besoin d\'un devis ?', 'Plus de chauffage ?', 'Urgence serrurerie ?', 'On vous rappelle ?']
    };
    var key = 'default';
    if (path.indexOf('plombier') >= 0 || path.indexOf('fuite') >= 0 || path.indexOf('debouchage') >= 0) key = 'plombier';
    else if (path.indexOf('chauffag') >= 0 || path.indexOf('chaudiere') >= 0 || path.indexOf('entretien') >= 0 || path.indexOf('panne') >= 0) key = 'chauffagiste';
    else if (path.indexOf('electric') >= 0 || path.indexOf('diagnostic') >= 0) key = 'electricien';
    else if (path.indexOf('serrur') >= 0 || path.indexOf('ouverture-porte') >= 0) key = 'serrurier';
    else if (path.indexOf('vitrier') >= 0 || path.indexOf('bris-de-glace') >= 0) key = 'vitrier';
    else if (path.indexOf('menuisier') >= 0) key = 'menuisier';
    else if (path.indexOf('volets') >= 0)    key = 'volets';
    else if (path.indexOf('pmr') >= 0)       key = 'pmr';
    else if (path.indexOf('travaux') >= 0 || path.indexOf('renovation') >= 0) key = 'travaux';
    else if (path.indexOf('contrats') >= 0)  key = 'contrats';
    else if (path.indexOf('contact') >= 0)   key = 'contact';
    var msgs = MSGS_BY_CONTEXT[key] || MSGS_BY_CONTEXT['default'];
    var i = 0;
    setInterval(function() {
      i = (i + 1) % msgs.length;
      // Fade out → change → fade in
      bubble.style.transition = 'opacity .25s ease';
      bubble.style.opacity = 0;
      setTimeout(function() {
        bubble.textContent = msgs[i];
        bubble.style.opacity = 1;
      }, 260);
    }, 4000);
  })();

  var btn = fab.querySelector('.hc-fab-btn');
  var menu = fab.querySelector('.hc-menu');
  var chatPanel = fab.querySelector('.hc-chat-panel');
  var body = fab.querySelector('#hcChatBody');
  var quick = fab.querySelector('#hcChatQuick');
  var badge = fab.querySelector('.badge');
  var openLabel = fab.querySelector('#hcOpenLabel');
  var hasOpenedChat = false;

  // Statut horaires sur "Urgence"
  function refreshOpenLabel() {
    if (!openLabel) return;
    var d = new Date();
    var ouvert = (d.getDay() >= 1 && d.getDay() <= 6) && (d.getHours() >= 8 && d.getHours() < 18);
    openLabel.textContent = ouvert ? PHONE_DISPLAY + ' · Ouvert' : PHONE_DISPLAY + ' · 24/7';
  }
  refreshOpenLabel();
  setInterval(refreshOpenLabel, 60000);

  function toggleMenu() {
    var isOpen = fab.classList.contains('open');
    if (isOpen) {
      fab.classList.remove('open', 'chat-open');
    } else {
      fab.classList.add('open');
      badge.style.display = 'none';
    }
    btn.setAttribute('aria-expanded', !isOpen);
  }

  btn.addEventListener('click', toggleMenu);

  // Click outside to close
  document.addEventListener('click', function(e) {
    if (!fab.contains(e.target)) fab.classList.remove('open', 'chat-open');
  });

  // Actions menu
  menu.querySelectorAll('.hc-action').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var act = a.dataset.act;
      if (act === 'call') return; // tel: link, laisser passer
      e.preventDefault();
      if (act === 'chat') openChat();
      if (act === 'calc') openCalc();
    });
  });

  // ----- CHAT -----
  function addMsg(text, kind) {
    var d = document.createElement('div');
    d.className = 'hc-msg ' + kind;
    var av = kind === 'bot' ? 'HC' : '✓';
    d.innerHTML = "<div class='av'>" + av + "</div><div class='bub'>" + text + "</div>";
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function showOpts(opts) {
    quick.innerHTML = '';
    opts.forEach(function(opt) {
      var b = document.createElement('button');
      b.textContent = opt.label;
      if (opt.label.indexOf('🚨') === 0) b.className = 'urgent';
      b.addEventListener('click', function() { handleOpt(opt); });
      quick.appendChild(b);
    });
  }
  function handleOpt(opt) {
    addMsg(opt.label, 'user');
    quick.innerHTML = '';
    setTimeout(function() {
      if (opt.action === 'call') {
        addMsg("Parfait : <a href='tel:" + PHONE + "'>" + PHONE_DISPLAY + "</a>", 'bot');
        showOpts([{ label: "← Retour", to: "start" }]);
      } else if (opt.action === 'link') {
        addMsg("Voici la page : <a href='" + opt.url + "'>" + opt.url + "</a>", 'bot');
        showOpts([{ label: "← Retour", to: "start" }]);
      } else if (opt.action === 'calc') {
        addMsg("Je lance le calculateur…", 'bot');
        setTimeout(openCalc, 400);
        showOpts([{ label: "← Retour", to: "start" }]);
      } else if (opt.to) {
        var node = TREE[opt.to];
        if (node) { addMsg(node.msg, 'bot'); showOpts(node.opts); }
      }
    }, 300);
  }
  function openChat() {
    fab.classList.add('chat-open');
    if (!hasOpenedChat) {
      hasOpenedChat = true;
      initAiChat();
    }
    // Focus l'input après ouverture
    setTimeout(function(){ var inp = document.getElementById('hcChatInput'); if (inp) inp.focus(); }, 250);
  }

  // ═══════════════════════════════════════════════════════════════
  // CHAT IA (Claude) — Mémoire + persistance par session_id
  // ═══════════════════════════════════════════════════════════════
  var SUPABASE_URL = 'https://btcbjwqiivhpwoszomhg.supabase.co';
  var SESSION_KEY  = 'hc_chat_session_id';
  var SESSION_TTL  = 'hc_chat_history';

  function getSessionId(){
    try {
      var sid = localStorage.getItem(SESSION_KEY);
      if (!sid){
        sid = 'sid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10);
        localStorage.setItem(SESSION_KEY, sid);
      }
      return sid;
    } catch(_) {
      return 'sid-tmp-' + Date.now();
    }
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); }); }

  function appendBubble(role, text){
    var b = document.getElementById('hcChatBody');
    if (!b) return;
    var who = role === 'user' ? 'user' : 'bot';
    var av  = role === 'user' ? 'V' : '✨';
    var html = '<div class="hc-chat-msg hc-chat-msg-' + who + '">'
      + '<span class="av-mini">' + av + '</span>'
      + '<div class="hc-chat-bubble">' + escapeHtml(text).replace(/\n/g,'<br>') + '</div>'
      + '</div>';
    b.insertAdjacentHTML('beforeend', html);
    b.scrollTop = b.scrollHeight;
  }

  function showTyping(){
    var b = document.getElementById('hcChatBody');
    if (!b) return;
    var html = '<div class="hc-chat-msg hc-chat-msg-bot" id="hcChatTyping">'
      + '<span class="av-mini">✨</span>'
      + '<div class="hc-chat-typing"><span></span><span></span><span></span></div>'
      + '</div>';
    b.insertAdjacentHTML('beforeend', html);
    b.scrollTop = b.scrollHeight;
  }
  function hideTyping(){ var t = document.getElementById('hcChatTyping'); if (t) t.remove(); }

  function initAiChat(){
    var body = document.getElementById('hcChatBody');
    if (!body) return;
    body.innerHTML = '';
    // Charger historique local (rendu instantané)
    var local = [];
    try { local = JSON.parse(localStorage.getItem(SESSION_TTL) || '[]'); } catch(_) {}
    if (local.length){
      local.forEach(function(m){ appendBubble(m.role, m.content); });
    } else {
      appendBubble('assistant', 'Bonjour 👋 Je suis l\'assistant HELP Confort. Décrivez-moi votre situation (panne, devis, contrat d\'entretien) — un conseiller vous rappellera sous 24h. Si c\'est une urgence, appelez le ' + PHONE_DISPLAY + '.');
    }
  }

  async function sendChatMessage(text){
    if (!text || !text.trim()) return;
    var sendBtn = document.getElementById('hcChatSend');
    var input   = document.getElementById('hcChatInput');
    if (sendBtn) sendBtn.disabled = true;
    if (input) { input.value = ''; input.style.height = ''; }

    appendBubble('user', text);
    // Sauvegarde locale
    try {
      var hist = JSON.parse(localStorage.getItem(SESSION_TTL) || '[]');
      hist.push({ role: 'user', content: text });
      localStorage.setItem(SESSION_TTL, JSON.stringify(hist.slice(-30)));
    } catch(_) {}

    showTyping();

    try {
      var r = await fetch(SUPABASE_URL + '/functions/v1/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: getSessionId(),
          message: text,
          page_url: location.href,
          user_agent: navigator.userAgent
        })
      });
      var data = await r.json();
      hideTyping();
      if (!r.ok || !data.reply){
        appendBubble('assistant', 'Je rencontre un souci technique. Vous pouvez appeler directement au ' + PHONE_DISPLAY + '.');
        return;
      }
      appendBubble('assistant', data.reply);
      // Persistance locale
      try {
        var hist2 = JSON.parse(localStorage.getItem(SESSION_TTL) || '[]');
        hist2.push({ role: 'assistant', content: data.reply });
        localStorage.setItem(SESSION_TTL, JSON.stringify(hist2.slice(-30)));
      } catch(_) {}
    } catch(e){
      hideTyping();
      appendBubble('assistant', 'Connexion impossible. Appelez le ' + PHONE_DISPLAY + ' — on prend le relais.');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  }

  // Listeners input + bouton send
  (function bindChatInput(){
    var input = document.getElementById('hcChatInput');
    var btn   = document.getElementById('hcChatSend');
    if (!input || !btn) return;
    // Auto-resize textarea
    input.addEventListener('input', function(){
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    // Enter envoie, Shift+Enter = nouvelle ligne
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        sendChatMessage(input.value);
      }
    });
    btn.addEventListener('click', function(){ sendChatMessage(input.value); });
  })();
  fab.querySelector('.hc-chat-head .back').addEventListener('click', function() {
    fab.classList.remove('chat-open');
  });

  // ----- TEASER auto-pop after 30s -----
  setTimeout(function() {
    if (!fab.classList.contains('open') && document.visibilityState === 'visible') {
      badge.textContent = '1';
      badge.style.display = 'flex';
    }
  }, 30000);

  // ----- CALCULATEUR DEVIS -----
  var modal = document.createElement('div');
  modal.className = 'hc-modal';
  modal.innerHTML =
    "<div class='hc-modal-c' role='dialog' aria-label='Estimation devis'>" +
      "<button class='close' aria-label='Fermer'>×</button>" +
      "<h3>Estimation rapide</h3>" +
      "<p class='sub'>Indication tarifaire en 3 clics. Devis détaillé gratuit après visite.</p>" +
      "<div class='hc-calc-grp'><label>Métier</label><div class='opts'>" +
        "<div class='opt' data-grp='metier' data-v='plomberie'>🚿 Plomberie</div>" +
        "<div class='opt' data-grp='metier' data-v='chauffage'>🔥 Chauffage</div>" +
        "<div class='opt' data-grp='metier' data-v='electricite'>⚡ Électricité</div>" +
        "<div class='opt' data-grp='metier' data-v='serrurerie'>🔒 Serrurerie</div>" +
      "</div></div>" +
      "<div class='hc-calc-grp'><label>Type</label><div class='opts'>" +
        "<div class='opt' data-grp='type' data-v='depannage'>🔧 Dépannage</div>" +
        "<div class='opt' data-grp='type' data-v='entretien'>🛠️ Entretien</div>" +
        "<div class='opt' data-grp='type' data-v='install'>📦 Installation</div>" +
        "<div class='opt' data-grp='type' data-v='renov'>🏗️ Rénovation</div>" +
      "</div></div>" +
      "<div class='hc-calc-grp'><label>Urgence</label><div class='opts'>" +
        "<div class='opt' data-grp='urg' data-v='basse'>✅ Non</div>" +
        "<div class='opt' data-grp='urg' data-v='haute'>🚨 Oui</div>" +
      "</div></div>" +
      "<div class='hc-result' id='hcCalcResult' style='display:none'>" +
        "<div class='label'>Estimation indicative</div>" +
        "<div class='val' id='hcCalcVal'>—</div>" +
        "<div class='note'>Hors fournitures. Devis détaillé après visite gratuite.</div>" +
      "</div>" +
      "<a href='contact.html' class='submit' id='hcCalcCta' style='display:none'>Obtenir mon devis détaillé →</a>" +
    "</div>";
  document.body.appendChild(modal);

  var calcState = { metier: null, type: null, urg: null };
  modal.querySelectorAll('.opt').forEach(function(o) {
    o.addEventListener('click', function() {
      var g = o.dataset.grp;
      modal.querySelectorAll('.opt[data-grp="' + g + '"]').forEach(function(x) { x.classList.remove('active'); });
      o.classList.add('active');
      calcState[g] = o.dataset.v;
      tryCompute();
    });
  });
  function tryCompute() {
    if (!calcState.metier || !calcState.type || !calcState.urg) return;
    var base = {
      plomberie:   { depannage: [85, 250], entretien: [60, 120], install: [350, 1500], renov: [1200, 6000] },
      chauffage:   { depannage: [100, 300], entretien: [110, 150], install: [800, 4500], renov: [2500, 8000] },
      electricite: { depannage: [80, 220], entretien: [90, 180], install: [250, 1800], renov: [1500, 9000] },
      serrurerie:  { depannage: [70, 280], entretien: [50, 100], install: [180, 1200], renov: [800, 3500] }
    };
    var rng = base[calcState.metier][calcState.type];
    var mult = (calcState.urg === 'haute') ? 1.20 : 1.0;
    var lo = Math.round(rng[0] * mult / 5) * 5;
    var hi = Math.round(rng[1] * mult / 5) * 5;
    var fmt = function(n) { return n.toLocaleString('fr-FR') + ' €'; };
    modal.querySelector('#hcCalcVal').innerHTML = fmt(lo) + " <span style='color:#64748b;font-size:.6em;font-family:Inter,sans-serif'>à</span> " + fmt(hi) + " <span style='color:#64748b;font-size:.5em;font-family:Inter,sans-serif'>HT</span>";
    modal.querySelector('#hcCalcResult').style.display = 'block';
    modal.querySelector('#hcCalcCta').style.display = 'block';
  }
  function openCalc() {
    fab.classList.remove('open', 'chat-open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCalc() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  modal.querySelector('.close').addEventListener('click', closeCalc);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeCalc(); });

  // API publique
  window.HCWidgets = { openMenu: function() { fab.classList.add('open'); }, openChat: openChat, openCalc: openCalc, closeCalc: closeCalc };
  document.querySelectorAll('[data-hc-action="calc"]').forEach(function(el) { el.addEventListener('click', function(e) { e.preventDefault(); openCalc(); }); });
  document.querySelectorAll('[data-hc-action="chat"]').forEach(function(el) { el.addEventListener('click', function(e) { e.preventDefault(); fab.classList.add('open'); openChat(); }); });

})();
