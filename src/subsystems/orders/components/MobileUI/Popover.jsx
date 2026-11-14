import { useEffect, useRef, useState } from "react";

// Dropdown panel that fades in, fades out when closed, and closes on any outside click.
// Trigger buttons carry data-popover-trigger so their own click toggles the panel instead.
export default function Popover({ open, onClose, className = "", children }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 170);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && ref.current.contains(e.target)) return;
      if (e.target.closest && e.target.closest("[data-popover-trigger]")) return;
      onClose?.();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  if (!mounted) return null;
  return (
    <div ref={ref} className={`absolute ${className} ${closing ? "anim-out" : "anim-in"}`}>
      {children}
    </div>
  );
}
