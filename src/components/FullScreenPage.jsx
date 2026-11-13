import { createPortal } from "react-dom";

// Full-screen phone page, like a Shopee product or cart page:
// a fixed top bar, a scrolling body, and a bottom bar that stays pinned.
// It covers the app frame and the tab bar.
export default function FullScreenPage({ header, footer, children }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {header && <div className="shrink-0 border-b border-slate-200 bg-white pt-[max(env(safe-area-inset-top),0px)]">{header}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && (
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">{footer}</div>
      )}
    </div>,
    document.body
  );
}
