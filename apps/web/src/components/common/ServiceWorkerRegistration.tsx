'use client';

import React from 'react';

const scheduleIdleTask = (task: () => void) => {
  const requestIdle = window.requestIdleCallback?.bind(window);
  const cancelIdle = window.cancelIdleCallback?.bind(window);

  if (requestIdle && cancelIdle) {
    const idleId = requestIdle(task, { timeout: 3000 });
    return () => cancelIdle(idleId);
  }

  const timeoutId = globalThis.setTimeout(task, 1500);
  return () => globalThis.clearTimeout(timeoutId);
};

export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const cancelIdleTask = scheduleIdleTask(() => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Non-critical optimization: the site should work normally without the worker.
      });
    });

    return cancelIdleTask;
  }, []);

  return null;
}
