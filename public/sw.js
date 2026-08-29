/* Oishi's Kitchen service worker — keep the shell usable after the first visit. */
const SHELL_CACHE = 'oishi-shell-v1';
const RUNTIME_CACHE = 'oishi-runtime-v1';

/**
 * Filled in at build time by the sw-precache plugin in vite.config.js.
 *
 * The bundle has to be precached, not merely runtime-cached. A worker only
 * starts controlling the page once it activates, so the scripts that loaded on
 * the very first visit never pass through the fetch handler below: the shell
 * lands in the cache with no bundle to run, and an offline refresh shows a
 * blank screen. It corrected itself on a SECOND online visit, which is not a
 * promise you can make to someone standing at a stall.
 *
 * The names are content-hashed, so only the build knows them.
 */
const BUILD_ASSETS = '__PRECACHE__';
const PRECACHE_URLS = ['/', '/index.html', '/logo.png', '/manifest.json'].concat(
  Array.isArray(BUILD_ASSETS) ? BUILD_ASSETS : []
);

/**
 * Vary is ignored on lookups.
 *
 * A static host answers same-origin asset requests with `Vary: Origin`, and
 * cache matching honours it: cache.add() stores a request carrying no Origin
 * header, while the browser's own request for a module script carries one, so
 * a perfectly good precached bundle never matches. Origin cannot vary for
 * files we only ever serve to ourselves.
 */
const MATCH = { ignoreVary: true };

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
    const cached = await caches.match(request, MATCH);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl, MATCH);
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  // Falls back to any cache: the build assets are precached into the shell
  // cache at install, while this runtime cache only fills once the worker is
  // already controlling the page.
  const cached =
    (await cache.match(request, MATCH)) || (await caches.match(request, MATCH));
  const fetching = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetching;
}
