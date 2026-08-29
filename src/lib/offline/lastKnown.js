import { defaultStorage } from './storage';

export const LAST_KNOWN_KEY = 'oishi-last-known';

function readAll(storage) {
  try {
    const raw = storage.getItem(LAST_KNOWN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function createLastKnown(storage = defaultStorage()) {
  return {
    get(key) {
      const all = readAll(storage);
      const entry = all[key];
      return entry ? entry.data : undefined;
    },
    set(key, data) {
      const all = readAll(storage);
      all[key] = { data, savedAt: Date.now() };
      storage.setItem(LAST_KNOWN_KEY, JSON.stringify(all));
    },
    remove(key) {
      const all = readAll(storage);
      delete all[key];
      storage.setItem(LAST_KNOWN_KEY, JSON.stringify(all));
    },
    snapshot() {
      return readAll(storage);
    },
  };
}

export const lastKnown = createLastKnown();
