// ═══════════════════════════════════════════════════════════════
// HELP Confort — Layout commun back-office
// Injecte sidebar + topbar dynamiquement, met à jour le badge nav
// ═══════════════════════════════════════════════════════════════
window.HCLayout = (function() {
  // ═════════════════════════════════════════════════════════
  // Architecture sidebar — 5 sections + Dashboard épinglé
  // Accordéons repliables : seule la section contenant la page
  // active est ouverte par défaut. État persisté en localStorage.
  // ═════════════════════════════════════════════════════════
  const SIDEBAR_STATE_KEY = 'hc-sidebar-sections-v2';
  const ACTIVE_MODULE_KEY = 'hc-active-module-v1';

  // ═════════════════════════════════════════════════════════
  // ARCHITECTURE 2 MODULES (refonte 2026-05-16, RH supprimé)
  // - Comm & Acquisition : marketing/commercial (gros volume)
  // - Outils & Connexions : super-admin (réglages + sync + diagnostic)
  // ═════════════════════════════════════════════════════════
  const MODULES = {
    comm: {
      label: 'Comm & Acquisition',
      shortLabel: '📣 Comm',
      icon: '📣',
      color: '#0DA0CF',
      colorDark: '#0884AE',
      desc: 'Marketing, leads, contrats, publications, analytics'
    },
    outils: {
      label: 'Outils & Connexions',
      shortLabel: '🛠 Outils',
      icon: '🛠',
      color: '#FF6B1A',
      colorDark: '#C2410C',
      desc: 'Réglages, connexions API, sync, diagnostic, maintenance'
    }
  };

  // Détecte le module actif depuis localStorage ou défaut "comm"
  function getActiveModule(){
    try {
      const m = localStorage.getItem(ACTIVE_MODULE_KEY);
      // Migration : module 'rh' supprimé → bascule sur 'comm'
      if (!m || m === 'rh' || !MODULES[m]) return 'comm';
      return m;
    } catch(_) { return 'comm'; }
  }
  function setActiveModule(m){
    try { localStorage.setItem(ACTIVE_MODULE_KEY, m); } catch(_){}
  }

  // Item Dashboard épinglé seul tout en haut
  const PINNED_ITEM = {
    id:'dashboard', href:'index.html', label:'Dashboard',
    icon:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>'
  };

  // ═════════════════════════════════════════════════════════
  // 5 sections accordéons (toutes définies, filtrées par module)
  // ═════════════════════════════════════════════════════════
  const SECTIONS = [
    { id:'activity', label:'Mon activité', module:'comm',
      sectionIcon:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      links: [
        { id:'leads', href:'leads.html', label:'Demandes clients', icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', badge:'<span class="admin-nav-item-badge alert" id="navLeadsCount" style="display:none"></span>' },
        { id:'chat-conversations', href:'chat-conversations.html', label:'Conversations chatbot', icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', badge:'<span class="admin-nav-item-badge" id="navChatCount" style="display:none"></span>' },
        { id:'reviews', href:'reviews.html', label:'Avis clients', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
        { id:'services', href:'services.html', label:'Catalogue prestations', icon:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', badge:'<span class="admin-nav-item-badge alert" id="navOrdersCount" style="display:none"></span>' },
        // "Tarifs de référence" retiré de la sidebar (fusion avec Catalogue prestations)
        // Page tarifs.html reste accessible via URL directe pour consultation
        // Pour modifier les prix : passer par services.html (synchro live)
        { id:'contracts', href:'contracts.html', label:'Contrats (à importer)', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', badge:'<span class="admin-nav-item-badge alert" id="navContractsCount" style="display:none"></span>' },
        // Interventions/RDV : géré dans le CRM externe (Apogée), donc lien direct vers le CRM
        { id:'crm-external', href:'#open-crm', label:'Mon CRM (interventions)', icon:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>', dataAttrs:'data-action="open-crm"' }
      ]
    },
    { id:'content', label:'Contenu & posts', module:'comm',
      sectionIcon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
      links: [
        { id:'content-site', href:'content-site.html', label:'Pages du site', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>' },
        { id:'realisations', href:'realisations.html', label:'Chantiers (Réalisations)', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', badge:'<span class="admin-nav-item-badge" id="navRealCount">—</span>' },
        { id:'medias', href:'medias.html', label:'Médiathèque', icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
        { id:'publications', href:'publications.html', label:'Pile de publication', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
        { id:'calendar', href:'calendar.html', label:'Calendrier éditorial', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { id:'actu-generator', href:'actu-generator.html', label:'🤖 Générateur actus IA', icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
        { id:'magic', href:'magic.html', label:'Studio création IA', icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' }
        // "Modèles de posts" (templates.html) + "Générateur visuel" (visuel.html)
        // restent accessibles via leurs URLs directes mais sortis du sidebar
        // pour simplifier — les liens sont dans Studio IA.
      ]
    },
    { id:'perf', label:'Performance & IA', module:'comm',
      sectionIcon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      links: [
        { id:'analytics', href:'analytics.html', label:'SEO & Analytics', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
        { id:'bilan-mensuel', href:'bilan-mensuel.html', label:'Bilan mensuel (12 m)', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { id:'ai', href:'ai.html', label:'Chat IA', icon:'<path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M2 12h20"/><path d="M2 16h20"/><path d="M2 20h20"/>' },
        { id:'alerts', href:'alerts.html', label:'Alertes & Monitoring', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>' }
      ]
    },
    { id:'connexions', label:'Connexions API', module:'outils',
      sectionIcon:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
      links: [
        { id:'social', href:'social.html', label:'Vue d\'ensemble', icon:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>' },
        { id:'wizard-google', href:'wizard-google.html', label:'Google Business', icon:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
        { id:'wizard-meta', href:'wizard-meta.html', label:'Facebook + Instagram', icon:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' },
        { id:'wizard-linkedin', href:'wizard-linkedin.html', label:'LinkedIn', icon:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>' },
        { id:'wizard-ga4', href:'wizard-ga4.html', label:'Google Analytics 4', icon:'<path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2"/><path d="M22 4 12 14.01l-3-3"/>' }
      ]
    },
    { id:'config', label:'Réglages', module:'outils',
      sectionIcon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
      links: [
        { id:'settings', href:'settings.html', label:'Paramètres', icon:'<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6m11-11h-6M7 12H1m17.36 6.36-4.24-4.24M9.88 9.88 5.64 5.64m12.72 0-4.24 4.24M9.88 14.12l-4.24 4.24"/>' },
        { id:'maintenance', href:'maintenance.html', label:'Santé & Maintenance', icon:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
        { id:'setup', href:'setup.html', label:'Diagnostic setup', icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
        { id:'diagnostic-connexions', href:'diagnostic-connexions.html', label:'Diagnostic connexions', icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' }
      ]
    },
    { id:'outils', label:'Outils maintenance', module:'outils',
      sectionIcon:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
      links: [
        { id:'finalize-config', href:'finalize-config.html', label:'⚡ Finaliser config', icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
        { id:'sync-fb', href:'sync-fb.html', label:'Sync Facebook', icon:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' },
        { id:'refresh-meta-token-client', href:'refresh-meta-token-client.html', label:'Renouveler token FB', icon:'<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>' },
        { id:'sync-google-reviews', href:'sync-google-reviews.html', label:'Sync avis Google', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
        { id:'sync-ga4', href:'sync-ga4.html', label:'Test GA4', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
        { id:'oauth-ga4', href:'oauth-ga4.html', label:'OAuth GA4 (plan B)', icon:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
        { id:'seed-catalog', href:'seed-catalog.html', label:'Seed catalogue', icon:'<path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/>' },
        { id:'purge-tests', href:'purge-tests.html', label:'Purge tests', icon:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' }
      ]
    }
  ];

  // CSS pour les accordéons — injecté une seule fois
  const SIDEBAR_ACCORDION_CSS = `
    .admin-sidebar-nav { padding: 10px 12px; }
    .admin-nav-pinned { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,.06); }
    .admin-nav-section { margin-bottom: 4px; border-radius: 10px; overflow: hidden; }
    .admin-nav-section-header {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 9px 10px;
      background: transparent; border: none;
      color: rgba(255,255,255,.55); font-size: .78rem; font-weight: 700;
      letter-spacing: .04em; text-transform: uppercase;
      cursor: pointer; border-radius: 9px;
      transition: background .15s, color .15s;
      font-family: inherit;
    }
    .admin-nav-section-header:hover { background: rgba(255,255,255,.04); color: rgba(255,255,255,.85); }
    .admin-nav-section-header .admin-nav-section-icon {
      width: 16px; height: 16px; flex-shrink: 0; opacity: .65;
    }
    .admin-nav-section-header .admin-nav-section-label { flex: 1; text-align: left; }
    .admin-nav-section-header .admin-nav-section-chevron {
      width: 14px; height: 14px; opacity: .5;
      transition: transform .2s cubic-bezier(.16,1,.3,1);
    }
    .admin-nav-section.is-open .admin-nav-section-header .admin-nav-section-chevron { transform: rotate(90deg); }
    .admin-nav-section.has-active .admin-nav-section-header { color: rgba(255,255,255,.9); }
    .admin-nav-section.has-active .admin-nav-section-header .admin-nav-section-icon { opacity: .95; color: var(--hc-primary-light, #7DD3FC); }
    .admin-nav-section-body {
      max-height: 0; overflow: hidden;
      transition: max-height .25s cubic-bezier(.16,1,.3,1);
      padding: 0 2px;
    }
    .admin-nav-section.is-open .admin-nav-section-body {
      max-height: 600px;
      padding: 2px 2px 8px 2px;
    }
    .admin-nav-section .admin-nav-item {
      padding-left: 32px; font-size: .85rem;
    }
    .admin-nav-section .admin-nav-item.is-active::before { left: -4px; }
    .admin-nav-pinned .admin-nav-item { font-weight: 600; }
    @media (prefers-reduced-motion: reduce) {
      .admin-nav-section-body, .admin-nav-section-chevron { transition: none; }
    }
  `;

  function sidebarHTML(activePage) {
    // ─── Module actif (Comm / RH / Outils) ───
    // Auto-détection : si la page active est dans une section "outils", switch module
    let activeModule = getActiveModule();
    SECTIONS.forEach(sec => {
      if (sec.links.some(l => l.id === activePage)) {
        if (sec.module && sec.module !== activeModule) {
          activeModule = sec.module;
          setActiveModule(activeModule); // persist
        }
      }
    });

    // Determine which section contains the active page
    let activeSectionId = null;
    SECTIONS.forEach(sec => {
      if (sec.links.some(l => l.id === activePage)) activeSectionId = sec.id;
    });

    // Sections filtrées par module actif
    const visibleSections = SECTIONS.filter(s => !s.module || s.module === activeModule);

    // Read collapsed state from localStorage
    let userState = {};
    try { userState = JSON.parse(localStorage.getItem(SIDEBAR_STATE_KEY) || '{}'); } catch(e) {}

    function renderItem(l, indent) {
      const active = l.id === activePage ? ' is-active' : '';
      const extraAttrs = l.dataAttrs ? ' ' + l.dataAttrs : '';
      return `<a href="${l.href}" class="admin-nav-item${active}"${extraAttrs}><svg class="admin-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${l.icon}</svg>${l.label}${l.badge || ''}</a>`;
    }

    // ─── Switcher modules en haut de sidebar ───
    // 2 modules → switch horizontal compact avec libellé complet
    // ⚠ Utilise onclick inline (au lieu d'addEventListener) pour garantir
    // que le clic fonctionne même si JS recompile en partie après mount
    let moduleSwitcherHtml = `<div class="admin-module-switcher" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:5px;background:rgba(11,18,32,.45);border:1px solid rgba(255,255,255,.06);border-radius:11px;margin:10px 12px 14px;box-shadow:inset 0 1px 2px rgba(0,0,0,.18)">`;
    Object.entries(MODULES).forEach(([mid, m]) => {
      const isActive = mid === activeModule;
      const bg = isActive ? `linear-gradient(135deg, ${m.color}, ${m.colorDark})` : 'transparent';
      const sh = isActive ? `0 2px 8px ${m.color}55, 0 0 0 1px rgba(255,255,255,.08) inset` : 'none';
      moduleSwitcherHtml += `<button type="button" data-module="${mid}" onclick="window.HCLayout && window.HCLayout.switchModule && window.HCLayout.switchModule('${mid}')" title="${m.label} — ${m.desc}" style="padding:8px 6px;background:${bg};color:${isActive ? '#fff' : 'rgba(255,255,255,.55)'};border:none;border-radius:8px;font:inherit;font-size:.74rem;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .18s cubic-bezier(.16,1,.3,1);box-shadow:${sh};letter-spacing:.01em">
        <span style="font-size:.95rem;line-height:1">${m.icon}</span>
        <span>${m.shortLabel.replace(m.icon, '').trim()}</span>
      </button>`;
    });
    moduleSwitcherHtml += `</div>`;

    let html = `<style>${SIDEBAR_ACCORDION_CSS}</style>
      <div class="admin-sidebar-brand">
        <div class="admin-brand-logo">H!</div>
        <div class="admin-brand-text">
          <strong>HELP Confort</strong>
          <span>${MODULES[activeModule]?.label || 'Back-Office'}</span>
        </div>
      </div>
      ${moduleSwitcherHtml}
      <nav class="admin-sidebar-nav" data-sidebar-nav>`;

    // Pinned Dashboard
    html += `<div class="admin-nav-pinned">${renderItem(PINNED_ITEM)}</div>`;

    // Sections accordéon (filtrées par module actif)
    visibleSections.forEach(sec => {
      const hasActive = sec.id === activeSectionId;
      // Section is open if: contains active page, OR user explicitly opened it (state===1).
      // If user explicitly closed it (state===0), keep closed even if active — but only if state was set deliberately.
      // Simpler rule: hasActive forces open; otherwise honour user state (default closed).
      const userPref = userState[sec.id]; // undefined | 0 | 1
      const isOpen = hasActive || userPref === 1;
      const openClass = isOpen ? ' is-open' : '';
      const activeClass = hasActive ? ' has-active' : '';
      html += `<div class="admin-nav-section${openClass}${activeClass}" data-section="${sec.id}">
        <button type="button" class="admin-nav-section-header" data-section-toggle="${sec.id}" aria-expanded="${isOpen ? 'true' : 'false'}">
          <svg class="admin-nav-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${sec.sectionIcon}</svg>
          <span class="admin-nav-section-label">${sec.label}</span>
          <svg class="admin-nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div class="admin-nav-section-body">`;
      sec.links.forEach(l => { html += renderItem(l); });
      html += `</div></div>`;
    });

    html += '</nav>';
    html += `<div class="admin-sidebar-foot">
      <div class="admin-user-card" data-logout title="Cliquer pour déconnexion">
        <div class="admin-user-avatar" data-user-initial>F</div>
        <div class="admin-user-info">
          <strong data-user-name>Florian</strong>
          <span data-user-role>Administrateur</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </div>
    </div>`;
    return html;
  }

  // Activate module switcher — EVENT DELEGATION (robust to re-renders)
  // Listener attaché 1 SEULE FOIS au document. Survit à tous les re-renders.
  let _moduleSwitcherBound = false;
  function setupModuleSwitcher() {
    if (_moduleSwitcherBound) return;
    _moduleSwitcherBound = true;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-module-switcher [data-module]');
      if (!btn) return;
      const m = btn.dataset.module;
      if (!m || !MODULES[m]) return;
      e.preventDefault();
      e.stopPropagation();
      setActiveModule(m);
      const aside = document.querySelector('.admin-sidebar');
      if (aside) {
        const activePage = aside.dataset.activePage || 'dashboard';
        aside.innerHTML = sidebarHTML(activePage);
        aside.dataset.activeModule = m;
        setupSidebarAccordion();
        // pas besoin de re-bind : listener est au document
      }
    }, true); // capture phase pour intercepter avant tout autre handler
  }

  // Activate accordion toggle behaviour on the just-rendered sidebar.
  function setupSidebarAccordion() {
    const nav = document.querySelector('[data-sidebar-nav]');
    if (!nav || nav.dataset.accordionReady === '1') return;
    nav.dataset.accordionReady = '1';
    nav.addEventListener('click', (e) => {
      // ─── Handler "Mon CRM" : ouvre l'URL du CRM externe configurée ──
      const crmLink = e.target.closest('[data-action="open-crm"]');
      if (crmLink) {
        e.preventDefault();
        // Récupère l'URL du CRM depuis app_settings (configuré dans Réglages → CRM externe)
        (async () => {
          if (!window.HCSupabase) return;
          try {
            const c = await window.HCSupabase.init();
            const { data } = await c.from('app_settings').select('value').eq('key','crm').maybeSingle();
            const url = data?.value?.url;
            if (url) {
              window.open(url, '_blank', 'noopener');
            } else {
              // Pas configuré → redirige vers les réglages
              window.location.href = 'settings.html#section-crm';
            }
          } catch(err) {
            window.location.href = 'settings.html#section-crm';
          }
        })();
        return;
      }

      // ─── Toggle accordion section ──
      const btn = e.target.closest('[data-section-toggle]');
      if (!btn) return;
      const secId = btn.dataset.sectionToggle;
      const section = btn.closest('.admin-nav-section');
      if (!section) return;
      const willOpen = !section.classList.contains('is-open');
      section.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      // Persist user preference
      try {
        const state = JSON.parse(localStorage.getItem(SIDEBAR_STATE_KEY) || '{}');
        state[secId] = willOpen ? 1 : 0;
        localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(state));
      } catch(err) {}
    });
  }

  function topbarHTML(title) {
    return `
      <button class="admin-topbar-burger" aria-label="Ouvrir le menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <h2 class="admin-topbar-title">${title}</h2>
      <div style="flex:1"></div>
      <div class="admin-topbar-actions">
        <a href="../" class="admin-icon-btn" title="Voir le site public" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>`;
  }

  // ─── Notifications nouveaux leads ────────────────────────
  const LEAD_NOTIF_KEY = 'hc-lead-last-seen';
  const LEAD_NOTIF_ENABLED = 'hc-lead-notif-on';

  async function pollNewLeads() {
    if (!window.HCSupabase) return;
    try {
      const c = await window.HCSupabase.init();
      const lastSeen = localStorage.getItem(LEAD_NOTIF_KEY) || new Date(Date.now() - 5*60*1000).toISOString();

      // ─── 1. Leads ─────────────────────────────────────────────
      const leadsRes = await c.from('leads')
        .select('id,nom,metier,ville,telephone,priority,created_at')
        .eq('status','nouveau')
        .gt('created_at', lastSeen)
        .order('created_at',{ascending:false})
        .limit(5);
      const newLeads = leadsRes.data || [];

      // ─── 2. Souscriptions (contracts à importer dans CRM) ──────
      const ctRes = await c.from('contracts')
        .select('id,client_first_name,client_last_name,client_phone,type,metier,monthly_amount,created_at')
        .is('imported_to_crm_at', null)
        .gt('created_at', lastSeen)
        .order('created_at',{ascending:false})
        .limit(5);
      const newContracts = ctRes.data || [];

      // ─── 3. Avis Google négatifs (1-2 étoiles) ─────────────────
      const rvRes = await c.from('reviews')
        .select('id,source,author_name,rating,comment,created_at')
        .eq('source','google')
        .lte('rating', 2)
        .gt('created_at', lastSeen)
        .order('created_at',{ascending:false})
        .limit(3);
      const newNegReviews = rvRes.data || [];

      const total = newLeads.length + newContracts.length + newNegReviews.length;
      if (total === 0) return;

      // Mettre à jour les badges nav
      const leadsEl = document.getElementById('navLeadsCount');
      if (leadsEl && newLeads.length > 0) {
        const newCount = parseInt(leadsEl.textContent || '0', 10) + newLeads.length;
        leadsEl.textContent = newCount;
        leadsEl.style.display = '';
      }
      const ctEl = document.getElementById('navContractsCount');
      if (ctEl && newContracts.length > 0) {
        const newCount = parseInt(ctEl.textContent || '0', 10) + newContracts.length;
        ctEl.textContent = newCount;
        ctEl.style.display = '';
      }

      // Notif navigateur si autorisée
      const notifsOn = localStorage.getItem(LEAD_NOTIF_ENABLED) === '1' && 'Notification' in window && Notification.permission === 'granted';
      if (notifsOn) {
        // 🔔 Notifs LEADS — priorité différenciée si urgent
        newLeads.forEach(l => {
          const isUrgent = l.priority === 'urgente';
          const n = new Notification(
            isUrgent ? '🔥 LEAD URGENT — HELP Confort' : '🔔 Nouveau lead — HELP Confort',
            {
              body: `${l.nom}${l.metier ? ' · ' + l.metier : ''}${l.ville ? ' · ' + l.ville : ''}${l.telephone ? '\n📞 ' + l.telephone : ''}`,
              icon: '/logo-help-confort.png',
              tag: 'hc-lead-' + l.id,
              requireInteraction: isUrgent
            }
          );
          n.onclick = () => { window.focus(); location.href = 'leads.html'; };
        });

        // 📥 Notifs SOUSCRIPTIONS — à importer dans Apogée
        newContracts.forEach(ct => {
          const name = (ct.client_first_name || '') + ' ' + (ct.client_last_name || '');
          const n = new Notification('📥 Nouvelle souscription contrat', {
            body: `${name.trim()} · ${(ct.type || '').toUpperCase()}${ct.monthly_amount ? ' · ' + Number(ct.monthly_amount).toFixed(0) + ' €/mois' : ''}\nÀ importer dans Apogée`,
            icon: '/logo-help-confort.png',
            tag: 'hc-ct-' + ct.id,
            requireInteraction: false
          });
          n.onclick = () => { window.focus(); location.href = 'contracts.html?filter=to_import'; };
        });

        // ⚠️ Notifs AVIS NÉGATIFS — toujours marquer "requireInteraction"
        newNegReviews.forEach(rv => {
          const stars = '★'.repeat(rv.rating) + '☆'.repeat(5 - rv.rating);
          const n = new Notification('⚠️ Avis Google négatif — Réponse urgente', {
            body: `${stars} de ${rv.author_name || 'Anonyme'}\n${(rv.comment || '').slice(0,100)}${(rv.comment||'').length>100?'…':''}`,
            icon: '/logo-help-confort.png',
            tag: 'hc-rv-' + rv.id,
            requireInteraction: true
          });
          n.onclick = () => { window.focus(); location.href = 'reviews.html'; };
        });
      }

      localStorage.setItem(LEAD_NOTIF_KEY, new Date().toISOString());
    } catch(e) { console.warn('Lead polling error:', e); }
  }

  function setupLeadNotifications() {
    // Bouton activer/désactiver dans la sidebar foot
    const foot = document.querySelector('.admin-sidebar-foot');
    if (!foot || foot.querySelector('[data-notif-toggle]')) return;

    const enabled = localStorage.getItem(LEAD_NOTIF_ENABLED) === '1' && (window.Notification?.permission === 'granted');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.notifToggle = '';
    btn.style.cssText = 'width:100%;margin-top:8px;padding:8px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);border-radius:8px;color:rgba(255,255,255,.7);font:inherit;font-size:.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;text-align:left;transition:.15s';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span style="flex:1">${enabled ? 'Notifs ON : leads · souscriptions · avis' : 'Activer notifs'}</span>
      <span style="width:6px;height:6px;border-radius:50%;background:${enabled ? '#00aa50' : '#666'}"></span>
    `;
    btn.onclick = async () => {
      if (!('Notification' in window)) { alert('Votre navigateur ne supporte pas les notifications.'); return; }
      if (Notification.permission === 'granted') {
        const cur = localStorage.getItem(LEAD_NOTIF_ENABLED) === '1';
        localStorage.setItem(LEAD_NOTIF_ENABLED, cur ? '0' : '1');
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') localStorage.setItem(LEAD_NOTIF_ENABLED, '1');
      } else {
        alert('Notifications bloquées par le navigateur. Activez-les dans les paramètres du site.');
      }
      // Refresh
      btn.remove(); setupLeadNotifications();
    };
    foot.appendChild(btn);
  }

  // ═════════════════════════════════════════════════════════
  // BOUTON FLOTTANT "Création express"
  // ═════════════════════════════════════════════════════════

  function slugify(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  }

  function injectQuickCreate() {
    if (document.getElementById('hcFab')) return;

    // FAB
    const fab = document.createElement('button');
    fab.id = 'hcFab';
    fab.type = 'button';
    fab.title = 'Création express (raccourci : C)';
    fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    fab.style.cssText = `
      position: fixed; right: 22px; bottom: 22px; z-index: 800;
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #FFB400, #FF6B1A);
      color: #fff; box-shadow: 0 12px 30px rgba(255,107,26,.38), 0 4px 10px rgba(255,107,26,.25);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform .18s cubic-bezier(.16,1,.3,1), box-shadow .18s;
    `;
    fab.onmouseenter = () => { fab.style.transform = 'scale(1.06) rotate(90deg)'; };
    fab.onmouseleave = () => { fab.style.transform = ''; };
    fab.onclick = openQuickModal;
    document.body.appendChild(fab);

    // Modale
    const modal = document.createElement('div');
    modal.id = 'hcQuickModal';
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 900; display: none;
      background: rgba(10,20,40,.55); backdrop-filter: blur(4px);
      align-items: center; justify-content: center; padding: 20px;
      animation: hcq-fade .2s ease-out;
    `;
    modal.innerHTML = `
      <div id="hcQuickSheet" style="background:#fff;border-radius:18px;width:100%;max-width:540px;max-height:92vh;overflow:auto;box-shadow:0 30px 70px rgba(0,0,0,.32);animation:hcq-slide .25s cubic-bezier(.16,1,.3,1)">
        <div style="padding:22px 24px 14px 24px;border-bottom:1px solid #E5EDF3;display:flex;align-items:center;gap:12px">
          <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div style="flex:1;min-width:0">
            <h2 style="font-size:1.12rem;font-weight:800;color:#0A1428;margin:0 0 1px 0">Création express</h2>
            <p style="font-size:.82rem;color:#64748b;margin:0;line-height:1.4">Crée un chantier en 30 secondes. Tu pourras enrichir plus tard.</p>
          </div>
          <button id="hcQuickClose" type="button" aria-label="Fermer" style="background:#F4F7FB;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style="padding:18px 24px;display:grid;gap:14px" id="hcQuickBody">

          <div>
            <label style="display:block;font-size:.76rem;font-weight:700;color:#1A2A44;margin-bottom:5px;letter-spacing:.02em">Titre du chantier *</label>
            <input id="hcqTitle" type="text" maxlength="120" placeholder="Ex : Remplacement de chaudière à Saint-Omer" style="width:100%;padding:11px 13px;border:1px solid #E5EDF3;border-radius:10px;font:inherit;font-size:.92rem;color:#0A1428">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <label style="display:block;font-size:.76rem;font-weight:700;color:#1A2A44;margin-bottom:5px;letter-spacing:.02em">Métier *</label>
              <select id="hcqMetier" style="width:100%;padding:11px 13px;border:1px solid #E5EDF3;border-radius:10px;font:inherit;font-size:.92rem;color:#0A1428;background:#fff">
                <option value="plomberie">Plomberie</option>
                <option value="electricite">Électricité</option>
                <option value="chauffage">Chauffage</option>
                <option value="serrurerie">Serrurerie</option>
                <option value="vitrerie">Vitrerie</option>
                <option value="menuiserie">Menuiserie</option>
                <option value="renovation">Rénovation</option>
                <option value="pmr">PMR</option>
                <option value="volets">Volets</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.76rem;font-weight:700;color:#1A2A44;margin-bottom:5px;letter-spacing:.02em">Ville *</label>
              <select id="hcqVille" style="width:100%;padding:11px 13px;border:1px solid #E5EDF3;border-radius:10px;font:inherit;font-size:.92rem;color:#0A1428;background:#fff">
                <option value="Saint-Omer">Saint-Omer</option>
                <option value="Dunkerque">Dunkerque</option>
                <option value="autre">Autre…</option>
              </select>
            </div>
          </div>

          <div id="hcqVilleAutreWrap" style="display:none">
            <input id="hcqVilleAutre" type="text" placeholder="Nom de la ville" maxlength="60" style="width:100%;padding:11px 13px;border:1px solid #E5EDF3;border-radius:10px;font:inherit;font-size:.92rem;color:#0A1428">
          </div>

          <div>
            <label style="display:block;font-size:.76rem;font-weight:700;color:#1A2A44;margin-bottom:5px;letter-spacing:.02em">Description courte</label>
            <textarea id="hcqDesc" maxlength="500" rows="3" placeholder="Quelques mots sur l'intervention (facultatif)" style="width:100%;padding:11px 13px;border:1px solid #E5EDF3;border-radius:10px;font:inherit;font-size:.92rem;color:#0A1428;resize:vertical;min-height:60px"></textarea>
          </div>

          <div>
            <label style="display:block;font-size:.76rem;font-weight:700;color:#1A2A44;margin-bottom:5px;letter-spacing:.02em">Photos (max 2)</label>
            <div id="hcqDropZone" style="border:2px dashed #cbd5e1;border-radius:12px;padding:18px;text-align:center;cursor:pointer;background:#F8FAFC;transition:.15s">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style="font-size:.84rem;color:#475569;font-weight:600">Clique pour ajouter, ou glisse-dépose</div>
              <div style="font-size:.74rem;color:#94a3b8;margin-top:2px">JPG/PNG · max 5 Mo par photo</div>
              <input id="hcqFiles" type="file" accept="image/*" multiple style="display:none">
            </div>
            <div id="hcqPreviews" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"></div>
          </div>

          <div style="background:#F4F7FB;border-radius:10px;padding:11px 13px;display:flex;align-items:center;gap:10px;font-size:.8rem;color:#475569">
            <input type="checkbox" id="hcqPublish" style="width:16px;height:16px;cursor:pointer;flex-shrink:0;accent-color:#0DA0CF">
            <label for="hcqPublish" style="cursor:pointer;flex:1;font-weight:600;color:#1A2A44">Publier immédiatement <span style="color:#94a3b8;font-weight:500">(sinon : sauvegardé en brouillon)</span></label>
          </div>

          <div id="hcqError" style="display:none;background:rgba(225,29,72,.08);color:#9F0E2B;padding:10px 13px;border-radius:10px;font-size:.82rem;border-left:3px solid #E11D48"></div>

        </div>

        <div style="padding:14px 24px;border-top:1px solid #E5EDF3;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#FAFCFD;border-radius:0 0 18px 18px">
          <a id="hcqMore" href="realisations.html?action=new" style="font-size:.82rem;color:#64748b;text-decoration:none;font-weight:600">Mode complet →</a>
          <div style="flex:1"></div>
          <button id="hcqCancel" type="button" style="padding:10px 16px;border-radius:10px;border:1px solid #E5EDF3;background:#fff;color:#475569;font-weight:700;font-size:.86rem;cursor:pointer">Annuler</button>
          <button id="hcqSubmit" type="button" style="padding:10px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#FFB400,#FF6B1A);color:#fff;font-weight:800;font-size:.86rem;cursor:pointer;box-shadow:0 4px 14px rgba(255,107,26,.25)">Créer le chantier</button>
        </div>
      </div>
      <style>
        @keyframes hcq-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes hcq-slide { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        #hcQuickModal input:focus, #hcQuickModal textarea:focus, #hcQuickModal select:focus {
          outline: none; border-color: #0DA0CF; box-shadow: 0 0 0 3px rgba(13,160,207,.12);
        }
        #hcQuickModal #hcqDropZone:hover, #hcQuickModal #hcqDropZone.is-drag {
          border-color: #0DA0CF; background: rgba(13,160,207,.04);
        }
        #hcQuickModal #hcqDropZone.is-drag svg { color: #0DA0CF; }
        #hcQuickModal button:hover { filter: brightness(.96); }
        #hcQuickClose:hover { background: #E5EDF3 !important; color: #0A1428 !important; }
        @media (max-width: 640px) {
          #hcFab { right: 16px; bottom: 16px; width: 54px; height: 54px; }
        }
      </style>
    `;
    document.body.appendChild(modal);

    const $ = id => document.getElementById(id);
    let pickedFiles = [];

    function refreshPreviews() {
      const wrap = $('hcqPreviews');
      wrap.innerHTML = '';
      pickedFiles.forEach((f, i) => {
        const url = URL.createObjectURL(f);
        const tile = document.createElement('div');
        tile.style.cssText = 'position:relative;width:78px;height:78px;border-radius:10px;overflow:hidden;border:1px solid #E5EDF3;background:#F4F7FB;flex-shrink:0';
        tile.innerHTML = `
          <img src="${url}" style="width:100%;height:100%;object-fit:cover">
          <button type="button" data-i="${i}" style="position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;border:none;background:rgba(10,20,40,.7);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>`;
        tile.querySelector('button').onclick = () => {
          pickedFiles.splice(i, 1);
          refreshPreviews();
        };
        wrap.appendChild(tile);
      });
    }

    function addFiles(fileList) {
      Array.from(fileList).forEach(f => {
        if (!f.type.startsWith('image/')) return;
        if (f.size > 5 * 1024 * 1024) { showError('La photo ' + f.name + ' dépasse 5 Mo.'); return; }
        if (pickedFiles.length >= 2) { showError('Maximum 2 photos.'); return; }
        pickedFiles.push(f);
      });
      refreshPreviews();
    }

    function showError(msg) {
      const e = $('hcqError');
      e.textContent = msg;
      e.style.display = '';
      setTimeout(() => { e.style.display = 'none'; }, 5500);
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    // Drop zone
    const dz = $('hcqDropZone');
    dz.onclick = () => $('hcqFiles').click();
    $('hcqFiles').onchange = e => addFiles(e.target.files);
    dz.ondragover = e => { e.preventDefault(); dz.classList.add('is-drag'); };
    dz.ondragleave = () => dz.classList.remove('is-drag');
    dz.ondrop = e => { e.preventDefault(); dz.classList.remove('is-drag'); addFiles(e.dataTransfer.files); };

    // Ville "autre"
    $('hcqVille').onchange = () => {
      const w = $('hcqVilleAutreWrap');
      w.style.display = $('hcqVille').value === 'autre' ? '' : 'none';
      if ($('hcqVille').value === 'autre') $('hcqVilleAutre').focus();
    };

    // Submit
    $('hcqSubmit').onclick = async () => {
      const title = $('hcqTitle').value.trim();
      if (!title) { showError('Le titre est obligatoire.'); $('hcqTitle').focus(); return; }
      const metier = $('hcqMetier').value;
      let ville = $('hcqVille').value;
      if (ville === 'autre') {
        ville = $('hcqVilleAutre').value.trim();
        if (!ville) { showError('Indique la ville.'); $('hcqVilleAutre').focus(); return; }
      }
      const desc = $('hcqDesc').value.trim();
      const publish = $('hcqPublish').checked;

      const btn = $('hcqSubmit');
      btn.disabled = true;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px;margin-right:6px" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="9" stroke-opacity=".3"/><path d="M12 3a9 9 0 0 1 9 9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur=".8s" repeatCount="indefinite"/></path></svg>Création…`;

      try {
        if (!window.HCSupabase) throw new Error('Supabase non chargé');
        const c = await window.HCSupabase.init();
        const { data: { user } } = await c.auth.getUser();
        if (!user) throw new Error('Tu dois être connecté.');

        // Slug unique : title + suffixe timestamp
        const baseSlug = slugify(title);
        const slug = baseSlug + '-' + Date.now().toString(36);

        // Upload des photos (s'il y en a)
        let image_before = null, image_after = null;
        if (pickedFiles.length > 0) {
          // Trouver le bucket
          const { data: buckets } = await c.storage.listBuckets();
          let bucket = (buckets || []).find(b => b.name === 'realisations' || b.name === 'réalisations');
          if (!bucket) {
            // Si pas de bucket, on continue sans photos avec un avertissement
            showError('Bucket Storage manquant — chantier créé sans photo. Crée le bucket "realisations" dans Supabase Storage.');
          } else {
            for (let i = 0; i < pickedFiles.length; i++) {
              const f = pickedFiles[i];
              const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
              const path = `${slug}/${i === 0 ? 'after' : 'before'}-${Date.now()}.${ext}`;
              const { error: upErr } = await c.storage.from(bucket.name).upload(path, f, { upsert: true, contentType: f.type });
              if (upErr) { console.warn('Upload error:', upErr); continue; }
              const { data: pub } = c.storage.from(bucket.name).getPublicUrl(path);
              if (i === 0) image_after = pub.publicUrl;
              else image_before = pub.publicUrl;
            }
          }
        }

        // Insert
        const now = new Date().toISOString();
        const payload = {
          title, slug,
          description: desc,
          description_long: desc,
          metier, ville,
          date_intervention: now.slice(0, 10),
          status: publish ? 'publie' : 'brouillon',
          pinned: false,
          publish_targets: { site: true, facebook: false, instagram: false, linkedin: false, gbp: false },
          ai_generated: { quick_create: true },
          created_by: user.email,
          image_before,
          image_after,
          published_at: publish ? now : null
        };
        const { data: created, error } = await c.from('realisations').insert(payload).select().single();
        if (error) throw error;

        // Toast succès + redirection ou refresh
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:96px;right:22px;z-index:1000;background:linear-gradient(135deg,#16A34A,#0d8f3f);color:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(22,163,74,.32);font-weight:700;display:flex;align-items:center;gap:10px;animation:hcq-slide .25s ease-out';
        toast.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <div>Chantier créé !<br><a href="realisations.html" style="color:#fff;text-decoration:underline;font-weight:600;font-size:.82rem">Voir dans Réalisations →</a></div>`;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = '.4s'; }, 3500);
        setTimeout(() => toast.remove(), 4200);

        // Refresh badge nav
        const realsEl = document.getElementById('navRealCount');
        if (realsEl && !isNaN(parseInt(realsEl.textContent))) {
          realsEl.textContent = parseInt(realsEl.textContent) + 1;
        }

        // Reset & close
        pickedFiles = [];
        $('hcqTitle').value = '';
        $('hcqDesc').value = '';
        $('hcqPublish').checked = false;
        $('hcqVilleAutre').value = '';
        $('hcqVilleAutreWrap').style.display = 'none';
        $('hcqVille').value = 'Saint-Omer';
        refreshPreviews();
        closeModal();
      } catch (e) {
        showError('Erreur : ' + (e.message || e));
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Créer le chantier';
      }
    };

    $('hcqCancel').onclick = closeModal;
    $('hcQuickClose').onclick = closeModal;
    modal.onclick = e => { if (e.target === modal) closeModal(); };

    // Raccourci clavier C / Esc
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display !== 'none') { closeModal(); return; }
      if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target.tagName || '').toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
        e.preventDefault();
        openQuickModal();
      }
    });
  }

  function openQuickModal() {
    const m = document.getElementById('hcQuickModal');
    if (!m) return;
    m.style.display = 'flex';
    setTimeout(() => { const t = document.getElementById('hcqTitle'); if (t) t.focus(); }, 60);
  }

  // ═════════════════════════════════════════════════════════
  // PALETTE Cmd+K — recherche universelle
  // ═════════════════════════════════════════════════════════

  const PALETTE_PAGES = [
    { id:'dashboard', label:'Dashboard', href:'index.html', icon:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>', group:'Pages' },
    { id:'setup', label:'Démarrage rapide', href:'setup.html', icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', group:'Pages' },
    { id:'leads', label:'Demandes clients (leads)', href:'leads.html', icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', group:'Pages' },
    { id:'chat-conversations', label:'Conversations chatbot IA', href:'chat-conversations.html', icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', group:'Pages' },
    { id:'contracts', label:'Contrats d\'entretien', href:'contracts.html', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', group:'Pages' },
    { id:'interventions', label:'Interventions / RDV', href:'interventions.html', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', group:'Pages' },
    { id:'alerts', label:'Alertes & Monitoring', href:'alerts.html', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>', group:'Pages' },
    { id:'realisations', label:'Réalisations / chantiers', href:'realisations.html', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', group:'Pages' },
    { id:'medias', label:'Médiathèque', href:'medias.html', icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', group:'Pages' },
    { id:'publications', label:'Publications', href:'publications.html', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', group:'Pages' },
    { id:'calendar', label:'Calendrier éditorial', href:'calendar.html', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', group:'Pages' },
    { id:'social', label:'Réseaux sociaux', href:'social.html', icon:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>', group:'Pages' },
    { id:'magic', label:'Magic Dropzone IA', href:'magic.html', icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', group:'Pages' },
    { id:'ai', label:'Assistant IA', href:'ai.html', icon:'<path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M2 12h20"/><path d="M2 16h20"/><path d="M2 20h20"/>', group:'Pages' },
    { id:'reviews', label:'Avis clients', href:'reviews.html', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', group:'Pages' },
    { id:'analytics', label:'SEO & Analytics', href:'analytics.html', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', group:'Pages' },
    { id:'users', label:'Utilisateurs', href:'users.html', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', group:'Pages' },
    { id:'maintenance', label:'Maintenance & Santé', href:'maintenance.html', icon:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', group:'Pages' },
    { id:'settings', label:'Paramètres', href:'settings.html', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>', group:'Pages' }
  ];

  const PALETTE_ACTIONS = [
    { id:'a-new', label:'Créer un chantier (mode express)', icon:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', group:'Actions', run: () => openQuickModal() },
    { id:'a-newfull', label:'Créer un chantier (mode complet)', icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', group:'Actions', href:'realisations.html?action=new' },
    { id:'a-pub', label:'Voir le site public', icon:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/>', group:'Actions', href:'../', target:'_blank' },
    { id:'a-supa', label:'Console Supabase', icon:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>', group:'Actions', href:'https://supabase.com/dashboard/project/btcbjwqiivhpwoszomhg', target:'_blank' },
    { id:'a-theme', label:'Basculer mode sombre / clair', icon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', group:'Actions', run: () => toggleTheme() },
    { id:'a-logout', label:'Se déconnecter', icon:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>', group:'Actions', run: () => { if (window.HCAdmin) HCAdmin.logout(); } }
  ];

  function injectPalette() {
    if (document.getElementById('hcPalette')) return;

    const wrap = document.createElement('div');
    wrap.id = 'hcPalette';
    wrap.style.cssText = `
      position: fixed; inset: 0; z-index: 950; display: none;
      align-items: flex-start; justify-content: center; padding: 12vh 20px 20px;
      background: rgba(10,20,40,.45); backdrop-filter: blur(6px);
    `;
    wrap.innerHTML = `
      <div id="hcPalettePanel" style="background:#fff;border-radius:14px;width:100%;max-width:580px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 30px 70px rgba(0,0,0,.32);overflow:hidden;animation:hcp-slide .22s cubic-bezier(.16,1,.3,1)">
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #E5EDF3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="hcPaletteInput" type="text" placeholder="Chercher pages, chantiers, leads, avis…" style="flex:1;border:none;outline:none;font:inherit;font-size:.96rem;color:#0A1428;background:transparent">
          <kbd style="font-family:'SF Mono','Monaco',monospace;font-size:.7rem;color:#94a3b8;background:#F4F7FB;padding:2px 7px;border-radius:5px;border:1px solid #E5EDF3">ESC</kbd>
        </div>
        <div id="hcPaletteList" style="flex:1;overflow-y:auto;padding:6px 0"></div>
        <div style="padding:8px 16px;border-top:1px solid #E5EDF3;background:#FAFCFD;display:flex;align-items:center;gap:14px;font-size:.72rem;color:#94a3b8">
          <span><kbd style="font-family:'SF Mono','Monaco',monospace;background:#fff;padding:1px 5px;border-radius:4px;border:1px solid #E5EDF3">↑↓</kbd> Naviguer</span>
          <span><kbd style="font-family:'SF Mono','Monaco',monospace;background:#fff;padding:1px 5px;border-radius:4px;border:1px solid #E5EDF3">↵</kbd> Ouvrir</span>
          <span style="flex:1"></span>
          <span style="opacity:.8">Cmd/Ctrl + K</span>
        </div>
      </div>
      <style>
        @keyframes hcp-slide { from { transform: translateY(-12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        #hcPalette .hcp-group{padding:4px 16px 2px 16px;font-size:.66rem;font-weight:800;color:#94a3b8;letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
        #hcPalette .hcp-item{display:flex;align-items:center;gap:11px;padding:9px 16px;cursor:pointer;border-radius:0;transition:background .08s;color:#0A1428;font-size:.88rem;font-weight:500;text-decoration:none}
        #hcPalette .hcp-item:hover{background:#F4F7FB}
        #hcPalette .hcp-item.is-active{background:rgba(13,160,207,.10)}
        #hcPalette .hcp-item.is-active strong{color:#0DA0CF}
        #hcPalette .hcp-item svg{width:16px;height:16px;color:#64748b;flex-shrink:0}
        #hcPalette .hcp-item.is-active svg{color:#0DA0CF}
        #hcPalette .hcp-item-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        #hcPalette .hcp-item-text strong{display:block;color:#0A1428;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        #hcPalette .hcp-item-text small{display:block;color:#94a3b8;font-size:.72rem;font-weight:500;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        #hcPalette .hcp-item-meta{font-size:.7rem;color:#94a3b8;font-weight:600;padding:3px 8px;border-radius:6px;background:#F4F7FB;flex-shrink:0}
        #hcPalette .hcp-empty{text-align:center;padding:30px 16px;color:#94a3b8;font-size:.86rem}
      </style>
    `;
    document.body.appendChild(wrap);

    const input = document.getElementById('hcPaletteInput');
    const list = document.getElementById('hcPaletteList');
    let dynamicCache = { reals: [], leads: [], reviews: [], loaded: false };
    let activeIndex = 0;
    let lastResults = [];

    async function loadDynamic() {
      if (dynamicCache.loaded || !window.HCSupabase) return;
      dynamicCache.loaded = true;
      try {
        const c = await window.HCSupabase.init();
        // Réalisations
        const r = await c.from('realisations').select('id,title,slug,metier,ville,status').limit(200);
        dynamicCache.reals = (r.data || []).map(x => ({
          id:'r-'+x.id, label:x.title, sub: (x.metier ? capitalize(x.metier) : '') + (x.ville ? ' · ' + x.ville : ''),
          group:'Chantiers', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
          href:'realisations.html?slug=' + encodeURIComponent(x.slug || ''), meta: x.status === 'publie' ? 'Publié' : (x.status || 'brouillon')
        }));
        // Leads
        const l = await c.from('leads').select('id,nom,telephone,metier,ville,status,created_at').limit(100).order('created_at',{ascending:false});
        dynamicCache.leads = (l.data || []).map(x => ({
          id:'l-'+x.id, label: x.nom || 'Sans nom',
          sub: [x.metier && capitalize(x.metier), x.ville, x.telephone].filter(Boolean).join(' · '),
          group:'Demandes clients', icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
          href: 'leads.html#lead-' + x.id, meta: x.status === 'nouveau' ? 'Nouveau' : (x.status || '')
        }));
        // Avis (si table reviews accessible)
        try {
          const rv = await c.from('reviews').select('id,author,rating,source,status,comment').limit(100).order('created_at',{ascending:false});
          dynamicCache.reviews = (rv.data || []).map(x => ({
            id:'v-'+x.id, label: (x.author || 'Anonyme') + ' · ' + '★'.repeat(x.rating||0) + (x.rating ? '' : '?'),
            sub: (x.comment || '').slice(0, 80),
            group:'Avis clients', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            href: 'reviews.html#review-' + x.id, meta: x.source || ''
          }));
        } catch(e) { /* table reviews peut être absente */ }
      } catch (e) { console.warn('Palette: dynamic load failed', e); }
    }

    function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }
    function normalize(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    function scoreItem(item, q) {
      const t = normalize(item.label);
      const s = normalize(item.sub || '');
      if (!q) return 1;
      const qn = normalize(q);
      if (t.startsWith(qn)) return 100;
      if (t.includes(qn)) return 60;
      if (s.includes(qn)) return 30;
      // Match par mots
      const words = qn.split(/\s+/).filter(Boolean);
      const all = (t + ' ' + s);
      if (words.every(w => all.includes(w))) return 20;
      return 0;
    }

    function render() {
      const q = input.value.trim();
      const all = [
        ...PALETTE_ACTIONS,
        ...PALETTE_PAGES,
        ...dynamicCache.reals,
        ...dynamicCache.leads,
        ...dynamicCache.reviews
      ];
      lastResults = all
        .map(it => ({ it, sc: scoreItem(it, q) }))
        .filter(x => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 40)
        .map(x => x.it);

      if (lastResults.length === 0) {
        list.innerHTML = '<div class="hcp-empty">Aucun résultat pour <strong>' + (q || '…') + '</strong></div>';
        return;
      }
      // Grouper
      const byGroup = {};
      lastResults.forEach(it => { byGroup[it.group] = byGroup[it.group] || []; byGroup[it.group].push(it); });
      // Préserve l'ordre par premier élément
      const groupOrder = [];
      lastResults.forEach(it => { if (!groupOrder.includes(it.group)) groupOrder.push(it.group); });

      let idx = 0;
      let html = '';
      groupOrder.forEach(g => {
        html += '<div class="hcp-group">' + g + '</div>';
        byGroup[g].forEach(it => {
          html += `
            <div class="hcp-item" data-idx="${idx}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${it.icon}</svg>
              <div class="hcp-item-text">
                <strong>${escapeHtmlMin(it.label)}</strong>
                ${it.sub ? '<small>' + escapeHtmlMin(it.sub) + '</small>' : ''}
              </div>
              ${it.meta ? '<span class="hcp-item-meta">' + escapeHtmlMin(it.meta) + '</span>' : ''}
            </div>`;
          idx++;
        });
      });
      list.innerHTML = html;

      activeIndex = Math.max(0, Math.min(activeIndex, lastResults.length - 1));
      updateActive();

      list.querySelectorAll('.hcp-item').forEach(el => {
        el.addEventListener('mouseenter', () => { activeIndex = parseInt(el.dataset.idx); updateActive(); });
        el.addEventListener('click', () => { runItem(lastResults[parseInt(el.dataset.idx)]); });
      });
    }

    function escapeHtmlMin(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    function updateActive() {
      list.querySelectorAll('.hcp-item').forEach((el, i) => el.classList.toggle('is-active', i === activeIndex));
      const a = list.querySelector('.hcp-item.is-active');
      if (a) a.scrollIntoView({ block: 'nearest' });
    }

    function runItem(it) {
      if (!it) return;
      closePalette();
      if (it.run) { it.run(); return; }
      if (it.href) {
        if (it.target === '_blank') window.open(it.href, '_blank', 'noopener');
        else window.location.href = it.href;
      }
    }

    function closePalette() { wrap.style.display = 'none'; }

    input.addEventListener('input', render);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, lastResults.length - 1); updateActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); updateActive(); }
      else if (e.key === 'Enter') { e.preventDefault(); runItem(lastResults[activeIndex]); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    wrap.addEventListener('click', e => { if (e.target === wrap) closePalette(); });

    // Ouverture (Cmd+K / Ctrl+K)
    document.addEventListener('keydown', async e => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        wrap.style.display = 'flex';
        input.value = '';
        activeIndex = 0;
        await loadDynamic();
        render();
        setTimeout(() => input.focus(), 30);
      }
    });

    // Premier rendu (pages + actions)
    render();
  }

  // ═════════════════════════════════════════════════════════
  // MODE SOMBRE
  // ═════════════════════════════════════════════════════════

  const THEME_KEY = 'hc-admin-theme';

  function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }

  function toggleTheme() {
    const cur = localStorage.getItem(THEME_KEY) || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    // Refresh icône bouton dans sidebar
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.innerHTML = themeToggleHTML(next);
    }
  }

  function themeToggleHTML(theme) {
    return theme === 'dark'
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg><span style="flex:1">Mode clair</span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><span style="flex:1">Mode sombre</span>`;
  }

  function setupThemeToggle() {
    // Init theme depuis localStorage
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
    // Bouton dans sidebar foot
    const foot = document.querySelector('.admin-sidebar-foot');
    if (!foot || foot.querySelector('[data-theme-toggle]')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.themeToggle = '';
    btn.style.cssText = 'width:100%;margin-top:6px;padding:8px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);border-radius:8px;color:rgba(255,255,255,.7);font:inherit;font-size:.78rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;text-align:left;transition:.15s';
    btn.innerHTML = themeToggleHTML(saved);
    btn.onclick = toggleTheme;
    foot.appendChild(btn);
  }

  function fallbackSidebar(activePage) {
    return '<div class="admin-sidebar-brand"><div class="admin-brand-logo">H!</div><div class="admin-brand-text"><strong>HELP Confort</strong><span>Back-Office Pro</span></div></div>' +
      '<nav class="admin-sidebar-nav" style="padding:10px"><div style="color:#fff;font-size:.8rem;padding:10px;background:rgba(217,45,32,.20);border-radius:8px;margin-bottom:10px">⚠ Sidebar fallback (erreur chargement)</div>' +
      '<a href="index.html" class="admin-nav-item">Dashboard</a>' +
      '<a href="realisations.html" class="admin-nav-item">Réalisations</a>' +
      '<a href="content-site.html" class="admin-nav-item">Contenu du site</a>' +
      '<a href="publications.html" class="admin-nav-item">Publications</a>' +
      '<a href="reviews.html" class="admin-nav-item">Avis clients</a>' +
      '<a href="settings.html" class="admin-nav-item">Paramètres</a>' +
      '</nav>';
  }

  async function mount(activePage, pageTitle) {
    // Injecter sidebar — try/catch pour ne JAMAIS laisser la sidebar vide
    const sb = document.querySelector('.admin-sidebar');
    if (sb) {
      try {
        const html = sidebarHTML(activePage);
        if (!html || html.length < 100) throw new Error('Empty sidebar HTML');
        sb.innerHTML = html;
        sb.dataset.activePage = activePage;
        setupSidebarAccordion();
        setupModuleSwitcher();
      } catch (e) {
        console.error('[HCLayout] sidebarHTML failed:', e);
        sb.innerHTML = fallbackSidebar(activePage);
      }
    }
    // Injecter topbar
    const tb = document.querySelector('.admin-topbar');
    if (tb) {
      try {
        tb.innerHTML = topbarHTML(pageTitle);
      } catch (e) {
        console.error('[HCLayout] topbarHTML failed:', e);
        tb.innerHTML = '<h2 class="admin-topbar-title">' + (pageTitle || 'Back-Office') + '</h2>';
      }
    }
    // Live count Réalisations + Leads non traités
    if (window.HCSupabase) {
      try {
        const c = await window.HCSupabase.init();
        const realsRes = await c.from('realisations').select('id', { count:'exact', head:true });
        const realsEl = document.getElementById('navRealCount');
        if (realsEl && realsRes.count != null) realsEl.textContent = realsRes.count;

        // Leads nouveaux
        const leadsRes = await c.from('leads').select('id', { count:'exact', head:true }).eq('status','nouveau');
        const leadsEl = document.getElementById('navLeadsCount');
        if (leadsEl) {
          if (leadsRes.count > 0) {
            leadsEl.textContent = leadsRes.count;
            leadsEl.style.display = '';
          } else {
            leadsEl.style.display = 'none';
          }
        }
      } catch(e) {}
    }
    // Bouton notifications + polling
    setupLeadNotifications();
    pollNewLeads();
    setInterval(pollNewLeads, 30000);  // toutes les 30s
    // FAB Création express + palette Cmd+K + theme toggle
    injectQuickCreate();
    injectPalette();
    setupThemeToggle();
  }

  // Init léger pour les pages avec sidebar/topbar codés en dur
  // (n'injecte PAS la sidebar, ne fait que FAB + notifs leads + palette + theme)
  async function init() {
    injectQuickCreate();
    injectPalette();
    setupThemeToggle();
    setupLeadNotifications();
    pollNewLeads();
    setInterval(pollNewLeads, 30000);
  }

  // Mount uniquement la sidebar dynamique (garde la topbar existante)
  // Utile pour les pages avec topbar custom (index.html, realisations.html, settings.html)
  async function mountSidebar(activePage) {
    const sb = document.querySelector('.admin-sidebar');
    if (sb) {
      try {
        const html = sidebarHTML(activePage);
        if (!html || html.length < 100) throw new Error('Empty sidebar HTML');
        sb.innerHTML = html;
        sb.dataset.activePage = activePage;
        setupSidebarAccordion();
        setupModuleSwitcher();
      } catch (e) {
        console.error('[HCLayout] sidebarHTML failed:', e);
        sb.innerHTML = fallbackSidebar(activePage);
      }
    }
    // Live counts + notifs + palette + theme + FAB
    if (window.HCSupabase) {
      try {
        const c = await window.HCSupabase.init();
        const realsRes = await c.from('realisations').select('id', { count:'exact', head:true });
        const realsEl = document.getElementById('navRealCount');
        if (realsEl && realsRes.count != null) realsEl.textContent = realsRes.count;
        const leadsRes = await c.from('leads').select('id', { count:'exact', head:true }).eq('status','nouveau');
        const leadsEl = document.getElementById('navLeadsCount');
        if (leadsEl) {
          if (leadsRes.count > 0) { leadsEl.textContent = leadsRes.count; leadsEl.style.display = ''; }
          else leadsEl.style.display = 'none';
        }
      } catch(e) {}
    }
    setupLeadNotifications();
    pollNewLeads();
    setInterval(pollNewLeads, 30000);
    injectQuickCreate();
    injectPalette();
    setupThemeToggle();
  }

  // Appliquer le thème AU PLUS TÔT (avant DOMContentLoaded) pour éviter le flash
  try { applyTheme(localStorage.getItem(THEME_KEY) || 'light'); } catch(e) {}

  return { mount, mountSidebar, openQuickModal, init, toggleTheme };
})();
