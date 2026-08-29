import { defaultStorage } from './storage';

export const QUERY_CACHE_KEY = 'oishi-query-cache';
export const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function dehydrateQueries(client) {
  return client
    .getQueryCache()
    .getAll()
    .filter((query) => query.state.data !== undefined)
    .map((query) => ({
      queryKey: query.queryKey,
      data: query.state.data,
    }));
}

export function persistQueryClient(client, storage = defaultStorage()) {
  const payload = {
    savedAt: Date.now(),
    queries: dehydrateQueries(client),
  };
  storage.setItem(QUERY_CACHE_KEY, JSON.stringify(payload));
  return payload;
}

export function hydrateQueryClient(client, storage = defaultStorage()) {
  try {
    const raw = storage.getItem(QUERY_CACHE_KEY);
    if (!raw) return { restored: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.queries)) return { restored: 0 };
    if (parsed.savedAt && Date.now() - parsed.savedAt > QUERY_CACHE_MAX_AGE_MS) {
      storage.removeItem(QUERY_CACHE_KEY);
      return { restored: 0, expired: true };
    }
    for (const entry of parsed.queries) {
      if (!entry || !entry.queryKey) continue;
      client.setQueryData(entry.queryKey, entry.data);
    }
    return { restored: parsed.queries.length };
  } catch {
    return { restored: 0, error: true };
  }
}

export function attachQueryPersistence(client, storage = defaultStorage()) {
  hydrateQueryClient(client, storage);
  let timer;
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => persistQueryClient(client, storage), 250);
  };
  return client.getQueryCache().subscribe(persist);
}
