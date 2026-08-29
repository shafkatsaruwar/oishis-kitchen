import { useEffect, useState } from 'react';
import { isOnline, subscribeOnline } from '@/lib/offline/network';
import { subscribeQueue, writeQueue } from '@/lib/offline/writeQueue';

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => isOnline());
  const [queued, setQueued] = useState(() => writeQueue.list().length);

  useEffect(() => subscribeOnline(setOnline), []);
  useEffect(() => subscribeQueue(() => setQueued(writeQueue.list().length)), []);

  if (online && queued === 0) return null;

  let message = 'You are offline. Showing the last saved menu and orders from this device.';
  if (!online && queued > 0) {
    message = `You are offline. Showing last saved data. ${queued} change${queued === 1 ? '' : 's'} waiting to send.`;
  } else if (online && queued > 0) {
    message = `Back online. Sending ${queued} saved change${queued === 1 ? '' : 's'}…`;
  }

  return (
    <div
      role="status"
      data-testid="offline-banner"
      className="bg-amber-100 text-amber-950 text-sm font-dm px-4 py-2 text-center border-b border-amber-200"
    >
      {message}
    </div>
  );
}
