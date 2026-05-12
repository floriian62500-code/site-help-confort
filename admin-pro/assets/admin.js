// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Back-Office Pro · Logique commune
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─── AUTH RÉELLE (Supabase) ──────────────────────────────────
  // Le client Supabase est chargé via supabase.js
  let cachedUser = null;

  window.HCAdmin = {
    async isAuthenticated() {
      if (!window.HCSupabase) return false;
      try {
        const user = await window.HCSupabase.getUser();
        if (!user) { cachedUser = null; return false; }
        cachedUser = {
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'Utilisateur',
          initial: (user.user_metadata?.name || user.email)[0].toUpperCase(),
          id: user.id
        };
        return cachedUser;
      } catch (e) { return false; }
    },

    async login(email, password) {
      if (!window.HCSupabase) return { ok: false, error: 'Supabase non chargé' };
      const { data, error } = await window.HCSupabase.signIn(email, password);
      if (error) return { ok: false, error: error.message };
      return { ok: true, data };
    },

    async logout() {
      if (window.HCSupabase) await window.HCSupabase.signOut();
      cachedUser = null;
      window.location.href = 'login.html';
    },

    async requireAuth() {
      const session = await this.isAuthenticated();
      const isLoginPage = window.location.pathname.endsWith('login.html');
      if (!session && !isLoginPage) {
        window.location.href = 'login.html';
        return null;
      }
      if (session) {
        // Renseigner les éléments DOM
        document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
        document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = session.role);
        document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = session.initial);
        document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email);
      }
      return session;
    },

    getCachedUser() { return cachedUser; }
  };

  // ─── ROLES & PERMISSIONS ─────────────────────────────────────
  // Charge le role du user (depuis user_profiles), expose des helpers
  // pour gater l'UI : data-require-role="owner|assistant|viewer"
  //                   data-require-perm="manage_users|edit_config|delete|edit"
  let _role = null;
  let _rolePromise = null;

  const PERMS = {
    // perm → set des roles autorises
    manage_users: new Set(['owner']),
    edit_config:  new Set(['owner']),
    delete:       new Set(['owner']),
    invite:       new Set(['owner']),
    create:       new Set(['owner', 'assistant']),
    edit:         new Set(['owner', 'assistant']),
    publish:      new Set(['owner', 'assistant']),
    view:         new Set(['owner', 'assistant', 'viewer'])
  };

  async function loadRole() {
    if (_role !== null) return _role;
    if (_rolePromise) return _rolePromise;
    _rolePromise = (async () => {
      if (!window.HCSupabase) { _role = 'viewer'; return _role; }
      try {
        const c = await window.HCSupabase.init();
        const { data: { user } } = await c.auth.getUser();
        if (!user) { _role = 'viewer'; return _role; }
        const { data } = await c.from('user_profiles')
          .select('role,is_active')
          .eq('user_id', user.id)
          .single();
        _role = (data && data.is_active) ? data.role : 'viewer';
      } catch (e) {
        // Fallback : si user_profiles n'existe pas encore, on lit user_metadata
        const u = await window.HCSupabase.getUser().catch(() => null);
        _role = u?.user_metadata?.role || 'viewer';
        // Normaliser ancien labels FR vers slugs
        if (_role === 'Administrateur') _role = 'owner';
        if (_role === 'Utilisateur') _role = 'assistant';
      }
      applyRoleGates();
      return _role;
    })();
    return _rolePromise;
  }

  function applyRoleGates() {
    // data-require-role : doit avoir CE role exact (ou un parmi liste separee par ,)
    document.querySelectorAll('[data-require-role]').forEach(el => {
      const allowed = el.dataset.requireRole.split(',').map(r => r.trim());
      const ok = allowed.includes(_role);
      gateElement(el, ok);
    });
    // data-require-perm : doit avoir CETTE permission
    document.querySelectorAll('[data-require-perm]').forEach(el => {
      const perm = el.dataset.requirePerm;
      const ok = HCRoles.can(perm);
      gateElement(el, ok);
    });
  }

  function gateElement(el, ok) {
    if (ok) {
      el.removeAttribute('data-locked');
      el.style.display = '';
      if (el.disabled !== undefined) el.disabled = false;
      el.style.opacity = '';
      el.title = el.dataset.origTitle || el.title;
    } else {
      el.dataset.locked = '1';
      if (el.dataset.lockMode === 'disable') {
        if (el.disabled !== undefined) el.disabled = true;
        el.style.opacity = '.45';
        el.style.pointerEvents = 'none';
        if (!el.dataset.origTitle) el.dataset.origTitle = el.title || '';
        el.title = '🔒 Permission insuffisante pour cette action';
      } else {
        el.style.display = 'none';
      }
    }
  }

  window.HCRoles = {
    async load() { return loadRole(); },
    current() { return _role; },
    is(role) { return _role === role; },
    can(perm) {
      const set = PERMS[perm];
      return !!(set && _role && set.has(_role));
    },
    applyGates: applyRoleGates,
    // Bloquer une page entiere si le role n'a pas la permission
    async require(perm) {
      await loadRole();
      if (!this.can(perm)) {
        document.body.innerHTML = `
          <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FAFCFD;font-family:Inter,sans-serif">
            <div style="text-align:center;max-width:420px;padding:40px">
              <div style="font-size:3rem;margin-bottom:14px">🔒</div>
              <h1 style="font-size:1.4rem;color:#0B1220;margin:0 0 8px">Accès restreint</h1>
              <p style="color:#64748b;margin:0 0 20px;line-height:1.55">Cette page nécessite une permission que ton compte ne possède pas. Demande à l'administrateur du back-office si tu penses qu'il s'agit d'une erreur.</p>
              <a href="index.html" style="display:inline-block;background:#0DA0CF;color:#fff;padding:10px 18px;border-radius:9px;font-weight:700;text-decoration:none">Retour au dashboard</a>
            </div>
          </div>`;
        return false;
      }
      return true;
    }
  };

  // Auto-load du role apres auth
  const _origRequireAuth = window.HCAdmin.requireAuth.bind(window.HCAdmin);
  window.HCAdmin.requireAuth = async function() {
    const s = await _origRequireAuth();
    if (s) {
      await loadRole();
      // Re-applique les gates au fil du temps (DOM dynamique)
      const obs = new MutationObserver(() => applyRoleGates());
      obs.observe(document.body, { childList: true, subtree: true });
    }
    return s;
  };

  // ─── SIDEBAR MOBILE TOGGLE ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.admin-topbar-burger');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.admin-overlay');

    function toggleSidebar(force) {
      const open = force !== undefined ? force : !sidebar.classList.contains('is-open');
      sidebar.classList.toggle('is-open', open);
      if (overlay) overlay.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (burger) burger.addEventListener('click', () => toggleSidebar());
    if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

    // Close on link click (mobile)
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 980) toggleSidebar(false);
      });
    });

    // Logout button
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        if (confirm('Déconnexion ?')) HCAdmin.logout();
      });
    });
  });

  // ─── HELPERS ──────────────────────────────────────────────────
  window.HCAdmin.formatDate = function(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };
  window.HCAdmin.formatTime = function(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
  };
})();
