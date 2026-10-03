/* HELP Confort — pré-garde d'accès du back-office (admin-pro)
 *
 * 2026-09-17 — incident P0 « accès admin bloqué » (issue #9, directive 5699674592) :
 * l'ancien code PIN côté navigateur est RETIRÉ. Il s'ajoutait à la vraie connexion Supabase,
 * bloquait l'administrateur déjà connecté dès que sa session PIN locale (12 h) expirait,
 * et n'apportait aucune sécurité réelle (vérification entièrement côté navigateur, fichier public).
 *
 * Contrôle d'accès effectif :
 *   1. Supabase Auth — login.html (email + mot de passe), session gérée par supabase-js ;
 *   2. HCAdmin.requireAuth() dans chaque page (admin.js) — vérification qui fait foi, rafraîchit
 *      ou invalide la session, redirige vers login.html ;
 *   3. rôles user_profiles (owner / assistant / viewer) pour les actions sensibles ;
 *   4. RLS côté base : aucune donnée métier lisible sans session authentifiée.
 *
 * Ce fichier ne contient AUCUN secret. Il masque simplement la page et renvoie vers la connexion
 * tant qu'aucune session Supabase n'est présente sur l'appareil, pour éviter tout affichage transitoire.
 */
(function () {
  'use strict';
  var path = window.location.pathname;
  if (/\/login\.html$/.test(path)) return;

  // Ancienne session « code PIN » : obsolète, nettoyée.
  try { window.localStorage.removeItem('hc_admin_session'); } catch (e) {}

  var hasSession = false;
  try {
    var raw = window.localStorage.getItem('hc-admin-auth'); // storageKey de supabase-js (assets/supabase.js)
    if (raw) {
      var s = JSON.parse(raw);
      var sess = (s && s.currentSession) || s;
      // Jeton de rafraîchissement présent, ou jeton d'accès non expiré : la page peut se charger,
      // requireAuth() fera la vérification serveur et redirigera si la session n'est plus valide.
      hasSession = !!(sess && (sess.refresh_token || (sess.access_token && sess.expires_at && sess.expires_at * 1000 > Date.now())));
    }
  } catch (e) { hasSession = false; }

  if (!hasSession) {
    try { document.documentElement.style.visibility = 'hidden'; } catch (e) {}
    window.location.replace('login.html');
  }
})();
