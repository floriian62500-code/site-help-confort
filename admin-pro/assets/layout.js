// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Layout commun back-office
// Injecte sidebar + topbar dynamiquement, met à jour le badge nav
// ═══════════════════════════════════════════════════════════════
window.HCLayout = (function() {
  function sidebarHTML(activePage) {
    const items = [
      { section: 'Pilotage', links: [
        { id:'dashboard', href:'index.html', label:'Dashboard', icon:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
        { id:'leads', href:'leads.html', label:'Demandes clients', icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', badge:'<span class="admin-nav-item-badge alert" id="navLeadsCount" style="display:none"></span>' },
        { id:'alerts', href:'alerts.html', label:'Alertes & Monitoring', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' }
      ]},
      { section: 'Contenu', links: [
        { id:'realisations', href:'realisations.html', label:'Réalisations', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', badge:'<span class="admin-nav-item-badge" id="navRealCount">—</span>' },
        { id:'medias', href:'medias.html', label:'Médiathèque', icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
        { id:'publications', href:'publications.html', label:'Publications', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
        { id:'social', href:'social.html', label:'Réseaux sociaux', icon:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>' }
      ]},
      { section: 'Intelligence', links: [
        { id:'ai', href:'ai.html', label:'Assistant IA', icon:'<path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M2 12h20"/><path d="M2 16h20"/><path d="M2 20h20"/>' },
        { id:'reviews', href:'reviews.html', label:'Avis clients', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
        { id:'analytics', href:'analytics.html', label:'SEO & Analytics', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' }
      ]},
      { section: 'Système', links: [
        { id:'users', href:'users.html', label:'Utilisateurs', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
        { id:'settings', href:'settings.html', label:'Paramètres', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' }
      ]}
    ];
    let html = `
      <div class="admin-sidebar-brand">
        <div class="admin-brand-logo">H!</div>
        <div class="admin-brand-text">
          <strong>HELP! Confort</strong>
          <span>Back-Office Pro</span>
        </div>
      </div>
      <nav class="admin-sidebar-nav">`;
    items.forEach(grp => {
      html += `<div class="admin-nav-section"><div class="admin-nav-section-title">${grp.section}</div>`;
      grp.links.forEach(l => {
        const active = l.id === activePage ? ' is-active' : '';
        html += `<a href="${l.href}" class="admin-nav-item${active}"><svg class="admin-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${l.icon}</svg>${l.label}${l.badge || ''}</a>`;
      });
      html += '</div>';
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

  async function mount(activePage, pageTitle) {
    // Injecter sidebar
    const sb = document.querySelector('.admin-sidebar');
    if (sb) sb.innerHTML = sidebarHTML(activePage);
    // Injecter topbar
    const tb = document.querySelector('.admin-topbar');
    if (tb) tb.innerHTML = topbarHTML(pageTitle);
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
  }

  return { mount };
})();
