import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ToastContainer } from './ToastContainer';

export const ToastContext = createContext(null);

// Global Singleton Emitter & Pre-mount Queue for usages outside the React component tree
let globalToastHandler = null;
const preMountQueue = [];

export const toast = (message, options) => {
  return toast.info(message, options);
};

toast.show = (type, message, options = {}) => {
  if (globalToastHandler) {
    return globalToastHandler(type, message, options);
  }
  const id = options?.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  preMountQueue.push({ type, message, options: { ...options, id } });
  return id;
};

toast.success = (message, options) => toast.show('success', message, options);
toast.error = (message, options) => toast.show('error', message, options);
toast.warning = (message, options) => toast.show('warning', message, options);
toast.info = (message, options) => toast.show('info', message, options);
toast.custom = (message, options) => toast.show('custom', message, options);
toast.dismiss = (id) => globalToastHandler?.dismiss?.(id);
toast.dismissAll = () => globalToastHandler?.dismissAll?.();

export function getDefaultDuration(type) {
  switch (type) {
    case 'success':
      return 4000;
    case 'info':
      return 4500;
    case 'warning':
      return 6000;
    case 'error':
      return 8000;
    case 'custom':
    default:
      return 4000;
  }
}

export function ToastProvider({ children, maxToasts = 3 }) {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const opts = typeof options === 'object' && options !== null ? options : {};
    const id = opts.id || `toast-${Date.now()}-${idCounter.current++}`;
    const duration = opts.persistent
      ? 0
      : (opts.duration !== undefined ? opts.duration : getDefaultDuration(type));

    const newToast = {
      id,
      type: type || 'info',
      message,
      title: opts.title,
      description: opts.description,
      duration,
      action: opts.action,
      persistent: Boolean(opts.persistent || duration <= 0),
      icon: opts.icon,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (filtered.length >= maxToasts) {
        return [...filtered.slice(filtered.length - maxToasts + 1), newToast];
      }
      return [...filtered, newToast];
    });

    return id;
  }, [maxToasts]);

  const success = useCallback((msg, opts) => showToast('success', msg, opts), [showToast]);
  const error = useCallback((msg, opts) => showToast('error', msg, opts), [showToast]);
  const warning = useCallback((msg, opts) => showToast('warning', msg, opts), [showToast]);
  const info = useCallback((msg, opts) => showToast('info', msg, opts), [showToast]);
  const custom = useCallback((msg, opts) => showToast('custom', msg, opts), [showToast]);

  useEffect(() => {
    globalToastHandler = showToast;
    globalToastHandler.dismiss = dismiss;
    globalToastHandler.dismissAll = dismissAll;

    // Flush any toasts triggered prior to mount
    if (preMountQueue.length > 0) {
      while (preMountQueue.length > 0) {
        const item = preMountQueue.shift();
        showToast(item.type, item.message, item.options);
      }
    }

    return () => {
      if (globalToastHandler === showToast) {
        globalToastHandler = null;
      }
    };
  }, [showToast, dismiss, dismissAll]);

  const contextValue = {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    custom,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
