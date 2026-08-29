import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { memoryStorage } from './storage';
import { createLastKnown, lastKnown } from './lastKnown';
import { createWriteQueue, writeQueue } from './writeQueue';
import { hydrateQueryClient, persistQueryClient } from './queryPersist';
import { resolveOfflineResponse } from './swStrategy';
import { findCachedOrder } from './findOrder';
import { isNetworkError, isOnline } from './network';
import { queueableInsert, throwIfCannotWrite, writeErrorMessage } from './writes';
import { executeQueuedWrite } from './supabaseExecute';

function mockOnline(value) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);
}

function clearBrowserStores() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('oishi-write-queue');
  localStorage.removeItem('oishi-last-known');
  localStorage.removeItem('oishi-query-cache');
}

describe('offline smoke: cached shell + last-known data', () => {
  let storage;

  beforeEach(() => {
    storage = memoryStorage();
    mockOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearBrowserStores();
  });

  it('serves the cached index.html for a refresh when the network is down', () => {
    const cachedIndex = { url: '/index.html', body: '<div id="root">Oishi</div>' };
    const decision = resolveOfflineResponse({
      request: { method: 'GET', mode: 'navigate', url: 'https://oishiskitchen.vercel.app/Menu' },
      cached: null,
      cachedIndex,
      online: false,
    });
    expect(decision.action).toBe('cache');
    expect(decision.response).toBe(cachedIndex);
  });

  it('restores menu and admin orders after a reload with the network disabled', () => {
    const onlineClient = new QueryClient();
    const menu = [{ category: 'Biryani', items: [{ name: 'Chicken Biryani', price: 7.99 }] }];
    const orders = [{ id: '1', order_number: 'ABC123', customer_name: 'Amma', status: 'pending' }];
    onlineClient.setQueryData(['menu-items-available'], menu);
    onlineClient.setQueryData(['admin-orders'], orders);
    persistQueryClient(onlineClient, storage);

    mockOnline(false);
    const offlineClient = new QueryClient();
    const result = hydrateQueryClient(offlineClient, storage);

    expect(result.restored).toBe(2);
    expect(offlineClient.getQueryData(['menu-items-available'])).toEqual(menu);
    expect(offlineClient.getQueryData(['admin-orders'])).toEqual(orders);
    expect(isOnline()).toBe(false);
  });

  it('reads a previously viewed order from last-known storage when offline', () => {
    const known = createLastKnown(storage);
    known.set('order:XYZ789', { order_number: 'XYZ789', items: [{ name: 'Daal', quantity: 8 }] });
    expect(known.get('order:XYZ789').order_number).toBe('XYZ789');
  });
});

describe('write queue: never drop, never invent a second database', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearBrowserStores();
  });

  it('queues an insert when offline instead of dropping it', async () => {
    mockOnline(false);
    const storage = memoryStorage();
    const execute = vi.fn();
    const queue = createWriteQueue({ storage, execute });

    const result = await queueableInsert({
      table: 'orders',
      payload: { order_number: 'Q1', customer_name: 'Test' },
      label: 'Order Q1',
      exec: async () => {
        throw new Error('should not run while offline');
      },
    });

    // queueableInsert uses the singleton queue; also prove the factory.
    expect(result.queued).toBe(true);
    queue.enqueue({
      table: 'orders',
      op: 'insert',
      payload: { order_number: 'Q1' },
      label: 'Order Q1',
    });
    expect(queue.list()).toHaveLength(1);
    expect(execute).not.toHaveBeenCalled();
  });

  it('flushes queued inserts when back online and keeps them if the network fails again', async () => {
    const storage = memoryStorage();
    const execute = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true });
    const queue = createWriteQueue({ storage, execute });
    queue.enqueue({ table: 'orders', op: 'insert', payload: { order_number: 'Q2' } });

    mockOnline(true);
    const first = await queue.flush();
    expect(first.sent).toBe(0);
    expect(first.remaining).toBe(1);
    expect(queue.list()[0].lastError).toMatch(/Failed to fetch/);

    const second = await queue.flush();
    expect(second.sent).toBe(1);
    expect(second.remaining).toBe(0);
  });

  it('does not delete a job on a server error (so data is never silently dropped)', async () => {
    const storage = memoryStorage();
    const execute = vi.fn().mockRejectedValue(new Error('row violates check constraint'));
    const queue = createWriteQueue({ storage, execute });
    queue.enqueue({ table: 'reviews', op: 'insert', payload: { rating: 5 } });
    mockOnline(true);

    const result = await queue.flush();
    expect(result.sent).toBe(0);
    expect(result.remaining).toBe(1);
    expect(result.errors[0].retried).toBe(false);
  });

  it('refuses to replay updates so kitchen and payment records cannot be corrupted', async () => {
    await expect(
      executeQueuedWrite({ op: 'update', table: 'orders', payload: { payment_status: 'paid' } }, {})
    ).rejects.toThrow(/unsafe op/);
  });

  it('treats a unique-constraint hit as success so a retry cannot double-insert', async () => {
    const client = {
      from: () => ({
        insert: () => ({
          select: async () => ({ data: null, error: { code: '23505', message: 'duplicate key' } }),
        }),
      }),
    };
    const result = await executeQueuedWrite(
      { op: 'insert', table: 'orders', payload: { order_number: 'DUP1' } },
      client
    );
    expect(result).toEqual({ ok: true, duplicate: true });
  });

  it('fails payment-style writes clearly instead of queueing them', () => {
    mockOnline(false);
    expect(() => throwIfCannotWrite('Recording this payment')).toThrow(/was not saved/);
    expect(writeErrorMessage(new TypeError('Failed to fetch'), 'Payment not recorded')).toMatch(
      /Retry when you're back online/
    );
  });
});

describe('network helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearBrowserStores();
  });

  it('detects fetch failures as network errors', () => {
    mockOnline(true);
    expect(isNetworkError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isNetworkError(new Error('row violates check constraint'))).toBe(false);
  });
});

describe('findCachedOrder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    writeQueue.list().forEach((job) => writeQueue.remove(job.id));
    clearBrowserStores();
  });

  it('finds an order sitting in the write queue or last-known cache', () => {
    lastKnown.set('order:CACHED1', { order_number: 'CACHED1', total: 12 });
    expect(findCachedOrder('cached1').total).toBe(12);

    writeQueue.enqueue({
      table: 'orders',
      op: 'insert',
      payload: { order_number: 'QUEUED1', total: 40 },
    });
    expect(findCachedOrder('QUEUED1')._queued).toBe(true);
  });
});
