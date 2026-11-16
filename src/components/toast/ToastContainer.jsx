import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './ToastContext';
import { ToastItem } from './ToastItem';

export function ToastContainer({ toasts: propToasts, onDismiss: propOnDismiss }) {
  const context = useContext(ToastContext);
  const toasts = propToasts !== undefined ? propToasts : (context?.toasts || []);
  const onDismiss = propOnDismiss !== undefined ? propOnDismiss : (context?.dismiss || (() => {}));

  if (typeof document === 'undefined') return null;
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 inset-x-4 max-w-sm mx-auto flex flex-col gap-2.5 pointer-events-none sm:top-6 sm:right-6 sm:left-auto sm:inset-x-auto sm:mx-0 sm:gap-3 z-[9999]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

export { ToastContainer as ToastViewport };
