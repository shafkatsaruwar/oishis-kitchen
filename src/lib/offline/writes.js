import { isNetworkError, isOnline } from './network';
import { enqueueInsert } from './writeQueue';

export function offlineWriteMessage(action = 'This change') {
  return `You're offline. ${action} was not saved. Retry when you're back online so kitchen and payment records stay accurate.`;
}

export function writeErrorMessage(error, fallback = 'Something went wrong') {
  if (!isOnline() || isNetworkError(error)) {
    return offlineWriteMessage(fallback);
  }
  return error?.message || fallback;
}

export function throwIfCannotWrite(action) {
  if (!isOnline()) {
    throw new Error(offlineWriteMessage(action));
  }
}

/**
 * Run an insert. On a network failure, persist the row in the existing
 * localStorage queue (same store as the cart) instead of dropping it.
 */
export async function queueableInsert({ table, payload, label, exec }) {
  const run = async () => {
    if (exec) return exec();
    throw new Error('queueableInsert requires exec');
  };

  if (!isOnline()) {
    const job = enqueueInsert(table, payload, label);
    return { queued: true, job };
  }

  try {
    const data = await run();
    return { queued: false, data };
  } catch (error) {
    if (isNetworkError(error)) {
      const job = enqueueInsert(table, payload, label);
      return { queued: true, job, error };
    }
    throw error;
  }
}
