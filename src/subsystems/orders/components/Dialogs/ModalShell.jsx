import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// One modal behaviour for the whole app:
// springs in over a dimmed, blurred page, Escape closes it, and clicking outside shakes the card.
export default function ModalShell({
  open,
  onClose,
  label,
  overlayClassName = "bg-slate-900/40 backdrop-blur-sm",
  panelClassName = "w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl",
  children,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function shake() {
    const el = panelRef.current;
    if (!el) return;
    el.classList.remove("modal-shake");
    void el.offsetWidth; // restart the animation on repeated clicks
    el.classList.add("modal-shake");
  }

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className={`modal-overlay fixed inset-0 z-[90] flex items-center justify-center p-4 ${overlayClassName}`}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) shake();
      }}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={label} className={`modal-spring ${panelClassName}`}>
        {children}
      </div>
    </div>,
    document.body
  );
}
