// ═══════════════════════════════════════════════════════════════
// HELP! Confort — Back-Office Pro · Logique commune
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─── AUTH ─────────────────────────────────────────────────────
  // Phase 0 : auth localStorage simple. Sera remplacé par Supabase Auth en Phase 1.
  const AUTH_KEY = 'hc_admin_session';
  const AUTH_DEMO = {
    // À remplacer par vraie auth Supabase. Mot de passe DEMO uniquement.
    email: 'admin@helpconfort.com',
    password: 'helpconfort2026',
    name: 'Florian',
    role: 'Administrateur',
    initial: 'F'
  };

  window.HCAdmin = {
    isAuthenticated() {
      try {
        const session = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
        if (!session) return false;
        // Session valide 24h
        if (Date.now() - session.t > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(AUTH_KEY);
          return false;
        }
        return session;
      } catch (e) { return false; }
    },

    login(email, password) {
      if (email === AUTH_DEMO.email && password === AUTH_DEMO.password) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          email: AUTH_DEMO.email,
          name: AUTH_DEMO.name,
          role: AUTH_DEMO.role,
          initial: AUTH_DEMO.initial,
          t: Date.now()
        }));
        return true;
      }
      return false;
    },

    logout() {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = 'login.html';
    },

    requireAuth() {
      const session = this.isAuthenticated();
      if (!session && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
        return null;
      }
      return session;
    }
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

    // Renseigner les infos user partout où nécessaire
    const session = HCAdmin.isAuthenticated();
    if (session) {
      document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
      document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = session.role);
      document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = session.initial);
      document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email);
    }
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
