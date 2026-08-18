'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export type AlertModalType = 'error' | 'success' | 'warning' | 'info';

export interface AlertModalOptions {
  title?: string;
  message: string | ReactNode;
  type?: AlertModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  icon?: ReactNode;
  autoCloseMs?: number;
}

interface AlertModalContextType {
  showAlert: (options: AlertModalOptions) => void;
  showError: (message: string | ReactNode, title?: string, options?: Partial<AlertModalOptions>) => void;
  showSuccess: (message: string | ReactNode, title?: string, options?: Partial<AlertModalOptions>) => void;
  showWarning: (message: string | ReactNode, title?: string, options?: Partial<AlertModalOptions>) => void;
  showInfo: (message: string | ReactNode, title?: string, options?: Partial<AlertModalOptions>) => void;
  showConfirm: (
    message: string | ReactNode,
    title?: string,
    options?: Partial<AlertModalOptions>
  ) => Promise<boolean>;
  closeAlert: () => void;
}

const AlertModalContext = createContext<AlertModalContextType | null>(null);

// Global event bus for non-React or outside-context triggers
type AlertListener = (options: AlertModalOptions | null) => void;
const alertListeners = new Set<AlertListener>();

const notifyListeners = (options: AlertModalOptions | null) => {
  alertListeners.forEach((listener) => listener(options));
};

/**
 * Standalone dispatchers that work anywhere in code (hooks, utilities, API handlers)
 */
export const showAlert = (options: AlertModalOptions) => {
  notifyListeners(options);
};

export const showError = (
  message: string | ReactNode,
  title: string = 'Notice',
  options?: Partial<AlertModalOptions>
) => {
  notifyListeners({
    title,
    message,
    type: 'error',
    confirmText: 'Okay',
    ...options,
  });
};

export const showSuccess = (
  message: string | ReactNode,
  title: string = 'Success',
  options?: Partial<AlertModalOptions>
) => {
  notifyListeners({
    title,
    message,
    type: 'success',
    confirmText: 'Awesome',
    ...options,
  });
};

export const showWarning = (
  message: string | ReactNode,
  title: string = 'Attention',
  options?: Partial<AlertModalOptions>
) => {
  notifyListeners({
    title,
    message,
    type: 'warning',
    confirmText: 'Understood',
    ...options,
  });
};

export const showInfo = (
  message: string | ReactNode,
  title: string = 'Information',
  options?: Partial<AlertModalOptions>
) => {
  notifyListeners({
    title,
    message,
    type: 'info',
    confirmText: 'Got It',
    ...options,
  });
};

export const showConfirm = (
  message: string | ReactNode,
  title: string = 'Confirm Action',
  options?: Partial<AlertModalOptions>
): Promise<boolean> => {
  return new Promise((resolve) => {
    notifyListeners({
      title,
      message,
      type: options?.type || 'warning',
      showCancel: true,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      onConfirm: () => {
        options?.onConfirm?.();
        resolve(true);
      },
      onCancel: () => {
        options?.onCancel?.();
        resolve(false);
      },
      ...options,
    });
  });
};

export const closeAlert = () => {
  notifyListeners(null);
};

export const AlertModalProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<AlertModalOptions | null>(null);
  const [mounted, setMounted] = useState(false);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    // Register global listener
    const listener: AlertListener = (opts) => {
      setModalState(opts);
    };
    alertListeners.add(listener);

    // Global override for native window.alert so no raw browser dialogs ever slip through
    if (typeof window !== 'undefined') {
      const origAlert = window.alert;
      window.alert = (msg?: any) => {
        const text = String(msg ?? '');
        // Determine type based on common error patterns
        const isErr = /error|failed|rejected|denied|insufficient|invalid|not enough/i.test(text);
        if (isErr) {
          showError(text, 'Notice');
        } else {
          showWarning(text, 'Notice');
        }
      };

      return () => {
        alertListeners.delete(listener);
        window.alert = origAlert;
      };
    }

    return () => {
      alertListeners.delete(listener);
    };
  }, []);

  // Handle auto-close timer
  useEffect(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    if (modalState?.autoCloseMs && modalState.autoCloseMs > 0) {
      autoCloseTimerRef.current = setTimeout(() => {
        handleClose();
      }, modalState.autoCloseMs);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [modalState]);

  // Lock background scroll when open
  useEffect(() => {
    if (modalState) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalState]);

  // Keyboard navigation: Escape to cancel/close, Enter to confirm
  useEffect(() => {
    if (!modalState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  const handleClose = useCallback(() => {
    setModalState(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState?.onConfirm) {
      modalState.onConfirm();
    }
    handleClose();
  }, [modalState, handleClose]);

  const handleCancel = useCallback(() => {
    if (modalState?.onCancel) {
      modalState.onCancel();
    }
    handleClose();
  }, [modalState, handleClose]);

  const contextValue: AlertModalContextType = {
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert: handleClose,
  };

  const type = modalState?.type || 'info';

  // Config mapping strictly adhering to JLTQuest standard colors and iconography
  const typeConfig = {
    error: {
      iconColor: 'text-[#FFA28D]',
      defaultTitle: 'Notice',
      defaultConfirm: 'Okay',
      Icon: ShieldAlert,
    },
    success: {
      iconColor: 'text-[#00F0FF]',
      defaultTitle: 'Success!',
      defaultConfirm: 'Awesome',
      Icon: CheckCircle2,
    },
    warning: {
      iconColor: 'text-[#FFA28D]',
      defaultTitle: 'Attention',
      defaultConfirm: 'Got It',
      Icon: AlertCircle,
    },
    info: {
      iconColor: 'text-[#00F0FF]',
      defaultTitle: 'Information',
      defaultConfirm: 'Okay',
      Icon: Info,
    },
  }[type];

  const CurrentIcon = typeConfig.Icon;

  return (
    <AlertModalContext.Provider value={contextValue}>
      {children}

      {mounted &&
        modalState &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop Click */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={handleCancel}
            />

            {/* Standard JadeQuest Glass Panel Modal Card */}
            <div className="glass-panel w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center relative shadow-[0_0_40px_rgba(123,44,191,0.3)] border border-white/10 rounded-2xl animate-fade-up z-10">
              {/* Radial Purple Glow matching whole application */}
              <div className="absolute inset-0 bg-radial from-[#7B2CBF]/20 via-transparent to-transparent pointer-events-none rounded-2xl" />

              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer z-20 group"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Central Glowing Icon Badge */}
              <div className="w-16 h-16 rounded-full glass-panel border border-purple-400/30 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(123,44,191,0.4)] relative z-10">
                {modalState.icon ? (
                  modalState.icon
                ) : (
                  <CurrentIcon className={`w-8 h-8 ${typeConfig.iconColor} drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]`} />
                )}
              </div>

              {/* Modal Title */}
              <h3 className="text-white font-gilroyBold text-2xl mb-2 tracking-wide relative z-10">
                {modalState.title || typeConfig.defaultTitle}
              </h3>

              {/* Modal Message Body */}
              <p className="text-purple-200 font-gilroyMedium text-base mb-6 leading-relaxed relative z-10 max-h-[40vh] overflow-y-auto px-2 [scrollbar-width:thin] text-center w-full whitespace-pre-line">
                {modalState.message}
              </p>

              {/* Action Buttons using standard project glass-btn */}
              <div className="flex items-center gap-3 w-full relative z-10">
                {modalState.showCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 rounded-xl text-base font-gilroyBold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer active:scale-95"
                  >
                    {modalState.cancelText || 'Cancel'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="glass-btn px-8 py-3 rounded-xl text-white font-gilroyBold text-lg shadow-[0_0_15px_#7B2CBF] hover:shadow-[0_0_25px_#7B2CBF] transition-shadow w-full cursor-pointer active:scale-95"
                >
                  {modalState.confirmText || typeConfig.defaultConfirm}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </AlertModalContext.Provider>
  );
};

export const useAlertModal = (): AlertModalContextType => {
  const context = useContext(AlertModalContext);
  if (!context) {
    // If used outside provider, fallback gracefully to exported standalone functions
    return {
      showAlert,
      showError,
      showSuccess,
      showWarning,
      showInfo,
      showConfirm,
      closeAlert,
    };
  }
  return context;
};
