// ═══════════════════════════════════════════════════════════════
// Service Worker HELP! Confort — KILL SWITCH (v2026-05-15-FORCE-RESET)
// ═══════════════════════════════════════════════════════════════
// Cette version désactive complètement le cache et force tous les
// navigateurs à récupérer les dernières versions depuis le réseau.
// → Active jusqu'à ce que toutes les versions cachées soient purgées.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. Supprime TOUS les caches existants
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // 2. Prend immédiatement le contrôle des pages ouvertes
    await self.clients.claim();
    // 3. Recharge toutes les pages ouvertes pour forcer la mise à jour
    const allClients = await self.clients.matchAll({ type: 'window' });
    for (const client of allClients) {
      try { client.navigate(client.url); } catch (e) {}
    }
  })());
});

// Pas de fetch handler → toutes les requêtes passent par le réseau
// (le navigateur applique les headers Cache-Control de Netlify)
