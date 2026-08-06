'use client';

import React from 'react';

type CookieConsentComponent = typeof import('./CookieConsent').default;

// Wrap the component in an object so React's setState never treats it as
// an updater function (setState(fn) calls fn(prevState) — breaking components).
interface ModalState {
  component: CookieConsentComponent;
}

const scheduleIdleTask = (task: () => void) => {
  const requestIdle = window.requestIdleCallback?.bind(window);
  const cancelIdle = window.cancelIdleCallback?.bind(window);

  if (requestIdle && cancelIdle) {
    const idleId = requestIdle(task, { timeout: 2000 });
    return () => cancelIdle(idleId);
  }

  const timeoutId = globalThis.setTimeout(task, 1200);
  return () => globalThis.clearTimeout(timeoutId);
};

export function CookieConsentLoader() {
  const [modalState, setModalState] = React.useState<ModalState | null>(null);
  const [openOnMount, setOpenOnMount] = React.useState(false);
  const loadedRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    const loadModal = async (openAfterLoad = false) => {
      if (openAfterLoad) {
        setOpenOnMount(true);
      }

      if (loadedRef.current) return;
      loadedRef.current = true;

      const mod = await import('./CookieConsent');
      if (cancelled) return;

      // Store as { component } object — never pass a React component directly
      // to setState, or React will call it as an updater: fn(prevState).
      setModalState({ component: mod.default });
    };

    const handleOpenRequest = () => {
      void loadModal(true);
    };

    window.addEventListener('open-cookie-modal', handleOpenRequest);
    const cancelIdleTask = scheduleIdleTask(() => {
      void loadModal();
    });

    return () => {
      cancelled = true;
      cancelIdleTask();
      window.removeEventListener('open-cookie-modal', handleOpenRequest);
    };
  }, []);

  if (!modalState) return null;
  const ConsentModal = modalState.component;
  return <ConsentModal initialOpen={openOnMount} />;
}
