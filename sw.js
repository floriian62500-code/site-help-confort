// ═══════════════════════════════════════════════════════════════
// Service Worker HELP! Confort — Cache statique + offline fallback
// Version : 2026-05-15
// ═══════════════════════════════════════════════════════════════

const VERSION = 'hc-v1-2026-05-15';
const CACHE_STATIC = `hc-static-${VERSION}`;
const CACHE_RUNTIME = `hc-runtime-${VERSION}`;

// Assets critiques à pré-cacher au install
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/logo-officiel.jpg',
  '/logo-help-confort.png',
  '/logo.svg',
  '/404.html',
  '/manifest.json',
  '/images/picto-plomberie.png',
  '/images/picto-chauffage.svg',
  '/images/picto-electricite.png',
  '/images/picto-serrurerie.png',
  '/images/picto-renovation.png',
  '/images/picto-pmr.png',
];

// Pages qu'on veut servir vite (network-first court délai)
const FAST_PAGES = [
  '/index.html',
  '/contact.html',
  '/plombier-saint-omer.html',
  '/chauffagiste-saint-omer.html',
  '/electricien-saint-omer.html',
  '/serrurier-saint-omer.html',
  '/travaux-saint-omer.html',
  '/contrats-entretien.html',
  '/nos-prestations.html',
];

// ═══ INSTALL : pré-cache des assets critiques ═══
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE.map(u => new Request(u, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Precache failed', err))
  );
});

// ═══ ACTIVATE : nettoyage des anciens caches ═══
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => {
        if (k !== CACHE_STATIC && k !== CACHE_RUNTIME) return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

// ═══ FETCH : stratégies par type de requête ═══
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ne pas intercepter : POST, autres origines (Supabase, fonts, etc.), chrome-extension, devtools
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/admin')) return;            // admin = toujours réseau
  if (url.pathname.startsWith('/admin-pro')) return;
  if (url.pathname.includes('/api/')) return;

  // ─── Images : cache-first (long terme) ───
  if (req.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, CACHE_RUNTIME));
    return;
  }

  // ─── CSS / JS statiques : cache-first ───
  if (/\.(css|js)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // ─── Pages HTML : network-first avec fallback cache + offline page ───
  if (req.destination === 'document' || /\.html$/i.test(url.pathname) || url.pathname === '/') {
    event.respondWith(networkFirst(req));
    return;
  }

  // ─── Autres (fonts locales, etc.) : stale-while-revalidate ───
  event.respondWith(staleWhileRevalidate(req, CACHE_RUNTIME));
});

// ═══ STRATÉGIES ═══

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const response = await fetch(req);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(req, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(req) {
  try {
    const response = await fetch(req);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(req, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Fallback : 404.html en cache si dispo
    const fallback = await caches.match('/404.html');
    if (fallback) return fallback;
    return new Response('<h1>Hors-ligne</h1><p>Cette page n\'est pas accessible sans connexion.</p>', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 503
    });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const networkPromise = fetch(req).then((response) => {
    if (response && response.status === 200) cache.put(req, response.clone());
    return response;
  }).catch(() => cached);
  return cached || networkPromise;
}
