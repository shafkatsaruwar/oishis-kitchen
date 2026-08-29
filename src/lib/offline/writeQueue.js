import { defaultStorage } from './storage';
import { isNetworkError, isOnline, subscribeOnline } from './network';

export const WRITE_QUEUE_KEY = 'oishi-write-queue';

const listeners = new Set();

function notify() {
  for (const listener of listeners) listener();
}

function readQueue(storage) {
  try {
    const raw = storage.getItem(WRITE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(storage, jobs) {
  storage.setItem(WRITE_QUEUE_KEY, JSON.stringify(jobs));
  notify();
}

export function subscribeQueue(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function createWriteQueue({ storage = defaultStorage(), execute } = {}) {
  const list = () => readQueue(storage);

  const enqueue = (job) => {
    const next = {
      id: job.id || `wq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: job.createdAt || Date.now(),
      attempts: job.attempts || 0,
      lastError: null,
      ...job,
    };
    const jobs = list();
    jobs.push(next);
    saveQueue(storage, jobs);
    return next;
  };

  const remove = (id) => {
    saveQueue(
      storage,
      list().filter((job) => job.id !== id)
    );
  };

  const flush = async () => {
    if (!isOnline()) return { sent: 0, remaining: list().length, errors: [] };
    const jobs = list();
    let sent = 0;
    const errors = [];
    for (const job of jobs) {
      try {
        if (!execute) throw new Error('No execute function configured for the write queue');
        await execute(job);
        remove(job.id);
        sent += 1;
      } catch (error) {
        if (isNetworkError(error)) {
          const updated = list().map((item) =>
            item.id === job.id
              ? { ...item, attempts: (item.attempts || 0) + 1, lastError: String(error.message || error) }
              : item
          );
          saveQueue(storage, updated);
          errors.push({ id: job.id, error, retried: true });
          break;
        }
        const updated = list().map((item) =>
          item.id === job.id
            ? { ...item, attempts: (item.attempts || 0) + 1, lastError: String(error.message || error) }
            : item
        );
        saveQueue(storage, updated);
        errors.push({ id: job.id, error, retried: false });
      }
    }
    return { sent, remaining: list().length, errors };
  };

  return { list, enqueue, remove, flush };
}

let defaultExecute = async () => {
  throw new Error('Write queue execute is not configured');
};

export function setWriteQueueExecute(fn) {
  defaultExecute = fn;
}

export const writeQueue = createWriteQueue({
  execute: (job) => defaultExecute(job),
});

export function enqueueInsert(table, payload, label) {
  return writeQueue.enqueue({
    table,
    op: 'insert',
    payload,
    label: label || `Save to ${table}`,
  });
}

export function startQueueAutoFlush() {
  const run = () => {
    writeQueue.flush().catch(() => {});
  };
  const stopOnline = subscribeOnline((online) => {
    if (online) run();
  });
  if (isOnline()) run();
  return stopOnline;
}
