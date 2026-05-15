// ═══════════════════════════════════════════════════════════════════════════
// Service Worker — HELP! Confort Back-Office
// ═══════════════════════════════════════════════════════════════════════════
// Stratégie minimaliste pour PWA installable :
//   - Cache des assets statiques (CSS, JS, fonts)
//   - Network-first pour les pages HTML et les appels Supabase
//   - Pas de offline complet (le back-office a besoin de Supabase live)
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_NAME = 'hc-admin-v1';
const STATIC_ASSETS = [
  '/admin-pro/',
  '/admin-pro/assets/admin.css',
  '/admin-pro/assets/admin.js',
  '/admin-pro/assets/layout.js',
  '/admin-pro/assets/supabase.js',
  '/logo-help-confort.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {}); // tolère les misses
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass complet pour Supabase, Resend, et toute API externe (toujours network)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('resend.com') ||
    url.hostname.includes('netlify.com') ||
    url.hostname.includes('facebook.com') ||
    url.hostname.includes('google.com') ||
    event.request.method !== 'GET'
  ) {
    return; // laisse passer normalement
  }

  // Static assets : cache-first
  if (STATIC_ASSETS.some(p => url.pathname === p || url.pathname.endsWith(p))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // HTML : network-first avec fallback cache
  if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache la nouvelle version
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
});

// Notification push (pour usage futur)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'HELP! Confort', {
      body: data.body || '',
      icon: '/logo-help-confort.png',
      badge: '/logo-help-confort.png',
      tag: data.tag || 'hc-push',
      data: data.url ? { url: data.url } : {}
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin-pro/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((tabs) => {
      const tab = tabs.find((t) => t.url.includes('/admin-pro'));
      if (tab) { tab.focus(); tab.navigate(url); return; }
      clients.openWindow(url);
    })
  );
});
