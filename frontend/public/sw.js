/* Nirikshan Service Worker — v3 */
const CACHE_NAME = 'nirikshan-v3';
const SHELL_ASSETS = [
  '/',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
];

const SENSITIVE_API_PREFIXES = [
  '/api/auth/',
  '/api/profile',
  '/api/cases/',
  '/api/notifications',
  '/api/dashboard/',
  '/api/escalations/',
];

function isSensitiveApi(pathname) {
  return SENSITIVE_API_PREFIXES.some(p => pathname.startsWith(p));
}

/* ── Install: pre-cache shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch(() => {
        // Fail silently if some assets aren't available during dev
      });
    })
  );
  self.skipWaiting();
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: cache-first for shell, network-first for API (skip sensitive) ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, dev/localhost, and extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // Network-only for sensitive API endpoints (auth, profile, cases, etc.)
  if (url.pathname.startsWith('/api/') && isSensitiveApi(url.pathname)) {
    return;
  }

  // Network-first for other API/backend requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      });
    })
  );
});

/* ── Push Notifications (future) ── */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nirikshan', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
