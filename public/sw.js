/* Oishi's Kitchen service worker — keep the shell usable after the first visit. */
const SHELL_CACHE = 'oishi-shell-v1';
const RUNTIME_CACHE = 'oishi-runtime-v1';
const PRECACHE_URLS = ['/', '/index.html', '/logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(PRECACHE_URLS.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isNavigate = request.mode === 'navigate' || request.destination === 'document';

  if (isNavigate) {
    event.respondWith(networkFirst(request, SHELL_CACHE, '/index.html'));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (
    url.hostname.endsWith('supabase.co') ||
    url.hostname.endsWith('googleapis.com') ||
    url.hostname.endsWith('gstatic.com')
  ) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
  }
});

async function networkFirst(request, cacheName, fallbackUrl) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, fresh.clone());
    if (fallbackUrl) {
      cache.put(fallbackUrl, fresh.clone());
    }
    return fresh;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetching = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetching;
}
