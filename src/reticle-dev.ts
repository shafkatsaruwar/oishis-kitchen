// Dev-only. Imported automatically by @reticlehq/vite-plugin.
// Self-guards on import.meta.env.DEV, so it is a no-op in a production build.
import { registerCapabilities, registerStore, tanstackQueryStore } from '@reticlehq/react';
import { queryClientInstance } from '@/lib/query-client';

if (import.meta.env.DEV) {
  // The app's server state lives in TanStack Query — menu, orders, reviews,
  // inventory. Registering it lets a check read what the app BELIEVES, not just
  // what it painted.
  registerStore('queries', tanstackQueryStore(queryClientInstance));

  registerCapabilities({
    testids: [
      'pos-search',
      'pos-ticket',
      'pos-subtotal',
      'pos-total',
      'pos-continue',
      'pos-take-payment',
      'pos-tendered',
      'pos-new-sale',
      'pos-method-cash',
      'pos-method-venmo',
      'pos-method-zelle',
    ],
    signals: [],
    stores: ['queries'],
  });
}
