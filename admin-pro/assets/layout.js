// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Layout commun back-office
// Injecte sidebar + topbar dynamiquement, met à jour le badge nav
// ═══════════════════════════════════════════════════════════════
window.HCLayout = (function() {
  function sidebarHTML(activePage) {
    const items = [
      { section: 'Pilotage', links: [
        { id:'dashboard', href:'index.html', label:'Dashboard', icon:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
        { id:'setup', href:'setup.html', label:'Démarrage rapide', icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
        { id:'leads', href:'leads.html', label:'Demandes clients', icon:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>', badge:'<span class="admin-nav-item-badge alert" id="navLeadsCount" style="display:none"></span>' },
        { id:'alerts', href:'alerts.html', label:'Alertes & Monitoring', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' }
      ]},
      { section: 'Contenu', links: [
        { id:'realisations', href:'realisations.html', label:'Réalisations', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', badge:'<span class="admin-nav-item-badge" id="navRealCount">—</span>' },
        { id:'medias', href:'medias.html', label:'Médiathèque', icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
        { id:'publications', href:'publications.html', label:'Publications', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
        { id:'calendar', href:'calendar.html', label:'Calendrier éditorial', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
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

  // ─── Notifications nouveaux leads ────────────────────────
  const LEAD_NOTIF_KEY = 'hc-lead-last-seen';
  const LEAD_NOTIF_ENABLED = 'hc-lead-notif-on';

  async function pollNewLeads() {
    if (!window.HCSupabase) return;
    try {
      const c = await window.HCSupabase.init();
      const lastSeen = localStorage.getItem(LEAD_NOTIF_KEY) || new Date(Date.now() - 5*60*1000).toISOString();
      const { data, error } = await c.from('leads')
        .select('id,nom,metier,ville,telephone,created_at')
        .eq('status','nouveau')
        .gt('created_at', lastSeen)
        .order('created_at',{ascending:false})
        .limit(5);
      if (error || !data || !data.length) return;

      // Mettre à jour le badge nav
      const leadsEl = document.getElementById('navLeadsCount');
      if (leadsEl) {
        const newCount = parseInt(leadsEl.textContent || '0', 10) + data.length;
        leadsEl.textContent = newCount;
        leadsEl.style.display = '';
      }

      // Notif navigateur si autorisée
      if (localStorage.getItem(LEAD_NOTIF_ENABLED) === '1' && 'Notification' in window && Notification.permission === 'granted') {
        data.forEach(l => {
          const n = new Notification('🔔 Nouveau lead — HELP! Confort', {
            body: `${l.nom}${l.metier ? ' · ' + l.metier : ''}${l.ville ? ' · ' + l.ville : ''}${l.telephone ? '\n📞 ' + l.telephone : ''}`,
            icon: '/logo-help-confort.png',
            tag: 'hc-lead-' + l.id,
            requireInteraction: false
          });
          n.onclick = () => { window.focus(); location.href = 'leads.html'; };
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
      <span style="flex:1">${enabled ? 'Notifs leads : ON' : 'Activer notifs leads'}</span>
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
    { id:'alerts', label:'Alertes & Monitoring', href:'alerts.html', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>', group:'Pages' },
    { id:'realisations', label:'Réalisations / chantiers', href:'realisations.html', icon:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>', group:'Pages' },
    { id:'medias', label:'Médiathèque', href:'medias.html', icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', group:'Pages' },
    { id:'publications', label:'Publications', href:'publications.html', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>', group:'Pages' },
    { id:'calendar', label:'Calendrier éditorial', href:'calendar.html', icon:'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', group:'Pages' },
    { id:'social', label:'Réseaux sociaux', href:'social.html', icon:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>', group:'Pages' },
    { id:'ai', label:'Assistant IA', href:'ai.html', icon:'<path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M2 12h20"/><path d="M2 16h20"/><path d="M2 20h20"/>', group:'Pages' },
    { id:'reviews', label:'Avis clients', href:'reviews.html', icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', group:'Pages' },
    { id:'analytics', label:'SEO & Analytics', href:'analytics.html', icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', group:'Pages' },
    { id:'users', label:'Utilisateurs', href:'users.html', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', group:'Pages' },
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

  // Appliquer le thème AU PLUS TÔT (avant DOMContentLoaded) pour éviter le flash
  try { applyTheme(localStorage.getItem(THEME_KEY) || 'light'); } catch(e) {}

  return { mount, openQuickModal, init, toggleTheme };
})();
