/* ============================================================
   sw-push.js — Service Worker dédié notifications push HC
   - Ne fait PAS de cache (pour éviter les bugs SW précédents)
   - Reçoit push events → affiche notification
   - Click sur notification → ouvre URL associée
   ============================================================ */
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  if (!event.data) return;
  var data = {};
  try { data = event.data.json(); }
  catch (_) { data = { title: 'HELP Confort', body: event.data.text() }; }

  var title = data.title || 'HELP Confort';
  var options = {
    body: data.body || '',
    icon: data.icon || '/images/apple-touch-icon.png',
    badge: data.badge || '/logo.svg',
    image: data.image,
    tag: data.tag || 'hc-push',
    renotify: !!data.renotify,
    requireInteraction: !!data.requireInteraction,
    data: {
      url: data.url || '/',
      sentAt: Date.now()
    },
    actions: data.actions || [
      { action: 'open', title: '👀 Voir' },
      { action: 'dismiss', title: '✕ Fermer' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
      for (var i = 0; i < clients.length; i++) {
        var c = clients[i];
        if (c.url.indexOf(url) >= 0 && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
