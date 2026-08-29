import { useEffect } from 'react';
import { queryClientInstance } from '@/lib/query-client';
import { attachQueryPersistence } from './queryPersist';
import { setWriteQueueExecute, startQueueAutoFlush } from './writeQueue';
import { executeQueuedWrite } from './supabaseExecute';

/**
 * Hydrates last-known React Query data, then retries queued inserts when
 * the browser comes back online. Mount once at the app root.
 */
export default function OfflineSync() {
  useEffect(() => {
    setWriteQueueExecute(executeQueuedWrite);
    const stopPersist = attachQueryPersistence(queryClientInstance);
    const stopFlush = startQueueAutoFlush();
    return () => {
      stopPersist();
      stopFlush();
    };
  }, []);

  return null;
}
