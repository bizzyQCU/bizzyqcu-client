import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function ToastItem({ toast, onDismiss }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [touchOffsetX, setTouchOffsetX] = useState(0);
  const [touchOffsetY, setTouchOffsetY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const itemRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration);
  const touchStartRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);

  const isAssertive = toast.type === 'error' || toast.type === 'warning';

  // Mount entrance transition
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Timer suspension helpers
  const pauseTimer = useCallback(() => {
    if (toast.duration <= 0 || toast.persistent) return;
    if (!isPaused) {
      setIsPaused(true);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, [toast.duration, toast.persistent, isPaused]);

  const resumeTimer = useCallback(() => {
    if (toast.duration <= 0 || toast.persistent) return;
    if (!isHoveredRef.current && !isFocusedRef.current) {
      setIsPaused(false);
    }
  }, [toast.duration, toast.persistent]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (toast.duration <= 0 || toast.persistent) return;

    let timerId;
    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerId = setTimeout(() => {
        onDismiss();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPaused, toast.duration, toast.persistent, onDismiss]);

  // Live progress bar
  useEffect(() => {
    if (toast.duration <= 0 || toast.persistent || isPaused) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = Math.max(0, Math.min(100, (currentRemaining / toast.duration) * 100));
      setProgress(pct);
    }, 40);

    return () => clearInterval(interval);
  }, [isPaused, toast.duration, toast.persistent]);

  // Hover handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    pauseTimer();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    resumeTimer();
  };

  // Focus handlers
  const handleFocus = () => {
    isFocusedRef.current = true;
    pauseTimer();
  };

  const handleBlur = (e) => {
    if (itemRef.current && e.relatedTarget && itemRef.current.contains(e.relatedTarget)) {
      return;
    }
    isFocusedRef.current = false;
    resumeTimer();
  };

  // Touch gesture handling
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || !e.touches || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    if (deltaX > 0) {
      setTouchOffsetX(deltaX);
    }
    if (deltaY < 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
      setTouchOffsetY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (touchOffsetX > 80 || touchOffsetY < -60) {
      onDismiss();
    } else {
      setTouchOffsetX(0);
      setTouchOffsetY(0);
    }
    setIsSwiping(false);
    touchStartRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onDismiss();
    }
  };

  const variantStyles = {
    success: {
      border: 'border-emerald-200 dark:border-emerald-500/30',
      bar: 'bg-emerald-500 dark:bg-emerald-400',
      iconBox: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
      actionText: 'text-[#0284C7] hover:text-[#0369A1] dark:text-[#8ACFF8]',
    },
    error: {
      border: 'border-rose-200 dark:border-rose-500/30',
      bar: 'bg-[#BA1A1A] dark:bg-rose-500',
      iconBox: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
      actionText: 'text-rose-600 hover:text-rose-700 dark:text-rose-400',
    },
    warning: {
      border: 'border-amber-200 dark:border-amber-500/30',
      bar: 'bg-[#FFD444] dark:bg-amber-400',
      iconBox: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
      actionText: 'text-amber-600 hover:text-amber-700 dark:text-amber-400',
    },
    info: {
      border: 'border-sky-200 dark:border-sky-500/30',
      bar: 'bg-[#0284C7] dark:bg-sky-400',
      iconBox: 'bg-sky-50 text-[#0284C7] dark:bg-sky-950/60 dark:text-[#8ACFF8]',
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
      actionText: 'text-[#0284C7] hover:text-[#0369A1] dark:text-[#8ACFF8]',
    },
    custom: {
      border: 'border-slate-200 dark:border-slate-700',
      bar: 'bg-slate-500 dark:bg-slate-400',
      iconBox: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
      actionText: 'text-[#0284C7] hover:text-[#0369A1] dark:text-[#8ACFF8]',
    },
  }[toast.type] || {
    border: 'border-sky-200 dark:border-sky-500/30',
    bar: 'bg-[#0284C7] dark:bg-sky-400',
    iconBox: 'bg-sky-50 text-[#0284C7] dark:bg-sky-950/60 dark:text-[#8ACFF8]',
    icon: <Info className="w-5 h-5 flex-shrink-0" />,
    actionText: 'text-[#0284C7] hover:text-[#0369A1] dark:text-[#8ACFF8]',
  };

  const transformStyle = touchOffsetX > 0
    ? `translateX(${touchOffsetX}px)`
    : touchOffsetY < 0
    ? `translateY(${touchOffsetY}px)`
    : undefined;

  const opacityStyle = touchOffsetX > 0
    ? Math.max(0, 1 - touchOffsetX / 250)
    : touchOffsetY < 0
    ? Math.max(0, 1 - Math.abs(touchOffsetY) / 150)
    : undefined;

  const renderMessageContent = () => {
    if (typeof toast.message === 'function') {
      return toast.message({ id: toast.id, dismiss: onDismiss });
    }
    return (
      <>
        {toast.message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
        {toast.description && toast.description !== toast.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words mt-0.5">
            {toast.description}
          </p>
        )}
      </>
    );
  };

  return (
    <div
      ref={itemRef}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: transformStyle,
        opacity: opacityStyle,
        transition: isSwiping ? 'none' : undefined,
      }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 rounded-2xl border shadow-card-hover bg-white/95 dark:bg-slate-900/95 backdrop-blur-md font-sans focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-16px] opacity-0 scale-95'
      } ${variantStyles.border} transition-all duration-200 ease-out`}
    >
      {/* Semantic Left Accent Pill */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${variantStyles.bar}`} />

      {/* Semantic Icon Container */}
      <div className={`p-1.5 rounded-xl flex-shrink-0 ${variantStyles.iconBox}`}>
        {toast.icon || variantStyles.icon}
      </div>

      {/* Text Body */}
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && (
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {toast.title}
          </h4>
        )}
        <div className={toast.title ? 'mt-0.5' : ''}>
          {renderMessageContent()}
        </div>

        {/* Optional Interactive Action */}
        {toast.action && (
          <button
            type="button"
            onClick={(e) => {
              try {
                toast.action.onClick?.(e);
              } finally {
                onDismiss();
              }
            }}
            className={`mt-2 inline-flex items-center text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-1 rounded-md px-1.5 py-0.5 -ml-1.5 ${variantStyles.actionText}`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Manual Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-1"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar Indicator */}
      {toast.duration > 0 && !toast.persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-b-2xl motion-reduce:hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${variantStyles.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
