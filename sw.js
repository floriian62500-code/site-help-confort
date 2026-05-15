// Service Worker désactivé volontairement (kill-switch).
// Toute version cachée de ce fichier déclenche unregister() côté client.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  const ks = await caches.keys();
  await Promise.all(ks.map(k => caches.delete(k)));
  await self.registration.unregister();
  const cs = await self.clients.matchAll();
  cs.forEach(c => { try { c.navigate(c.url); } catch (_) {} });
})()));
