const NETWORK_RE =
  /failed to fetch|networkerror|network request failed|load failed|internet connection|the internet connection appears to be offline/i;

export function isOnline() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

export function isNetworkError(error) {
  if (!isOnline()) return true;
  if (!error) return false;
  const msg = String(error.message || error);
  if (NETWORK_RE.test(msg)) return true;
  if (error.name === 'TypeError' && /fetch/i.test(msg)) return true;
  return false;
}

export function subscribeOnline(listener) {
  if (typeof window === 'undefined') return () => {};
  const on = () => listener(true);
  const off = () => listener(false);
  window.addEventListener('online', on);
  window.addEventListener('offline', off);
  return () => {
    window.removeEventListener('online', on);
    window.removeEventListener('offline', off);
  };
}
