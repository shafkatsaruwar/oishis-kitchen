/**
 * Where an order came from.
 *
 * Prefers the stored column, and falls back to the name check that was the
 * only rule before `source` existed — so rows written by an older build, and
 * any that predate the migration, still land on the right screen.
 */
export const POS = 'pos';
export const ONLINE = 'online';

export function orderSource(order) {
  if (order?.source === POS || order?.source === ONLINE) return order.source;
  return order?.customer_name === 'Walk-in' ? POS : ONLINE;
}

export const isWalkIn = (order) => orderSource(order) === POS;
export const isOnlineOrder = (order) => orderSource(order) === ONLINE;
