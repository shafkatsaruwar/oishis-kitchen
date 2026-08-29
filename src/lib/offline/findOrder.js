import { lastKnown } from './lastKnown';
import { writeQueue } from './writeQueue';

function rowsFromPayload(payload) {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
}

export function findQueuedOrder(orderNumber, queue = writeQueue) {
  const needle = String(orderNumber || '').trim().toUpperCase();
  if (!needle) return null;
  for (const job of queue.list()) {
    if (job.table !== 'orders') continue;
    const hit = rowsFromPayload(job.payload).find(
      (row) => String(row.order_number || '').toUpperCase() === needle
    );
    if (hit) return { ...hit, _queued: true };
  }
  return null;
}

export function findCachedOrder(orderNumber, queryClient) {
  const needle = String(orderNumber || '').trim().toUpperCase();
  if (!needle) return null;

  const queued = findQueuedOrder(orderNumber);
  if (queued) return queued;

  const remembered = lastKnown.get(`order:${needle}`) || lastKnown.get(`order:${orderNumber}`);
  if (remembered) return remembered;

  if (!queryClient) return null;
  for (const query of queryClient.getQueryCache().getAll()) {
    const data = query.state.data;
    if (!Array.isArray(data)) continue;
    const hit = data.find((row) => row && String(row.order_number || '').toUpperCase() === needle);
    if (hit) return hit;
  }
  return null;
}
