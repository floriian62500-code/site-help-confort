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
