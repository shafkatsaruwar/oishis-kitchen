/**
 * Pure fetch-routing used by public/sw.js and by the offline smoke test.
 * After a first online visit, navigations fall back to the cached index.html
 * so a refresh does not show a blank browser error page.
 */
export const SHELL_CACHE = 'oishi-shell-v1';
export const RUNTIME_CACHE = 'oishi-runtime-v1';
export const PRECACHE_URLS = ['/', '/index.html', '/logo.png', '/manifest.json'];

export function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

export function isSameOrigin(request, origin) {
  try {
    return new URL(request.url).origin === origin;
  } catch {
    return false;
  }
}

export function isRuntimeCdn(request) {
  try {
    const host = new URL(request.url).hostname;
    return (
      host.endsWith('supabase.co') ||
      host.endsWith('googleapis.com') ||
      host.endsWith('gstatic.com')
    );
  } catch {
    return false;
  }
}

/**
 * Decide how to answer a request when we already know what is in cache.
 * `cached` is a previously stored Response (or a stand-in in tests).
 */
export function resolveOfflineResponse({ request, cached, cachedIndex, online }) {
  if (request.method && request.method !== 'GET') {
    return { action: 'network-only' };
  }

  if (isNavigationRequest(request)) {
    if (online) return { action: 'network-first', fallback: cachedIndex || cached };
    if (cachedIndex || cached) return { action: 'cache', response: cachedIndex || cached };
    return { action: 'miss' };
  }

  if (cached && !online) return { action: 'cache', response: cached };
  if (online) return { action: 'network-first', fallback: cached };
  return { action: 'miss' };
}
