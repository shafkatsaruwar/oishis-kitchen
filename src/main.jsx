import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker } from '@/lib/offline/registerServiceWorker'

registerServiceWorker()

// iOS clears script-writable storage — queued sales, the cached menu, the open
// ticket — after about a week without opening the app, which is roughly the gap
// between one event and the next. Asking for persistent storage is best-effort:
// Safari may refuse, so this is a mitigation, not a guarantee. Opening the
// register once before an event stays the real safeguard.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}



