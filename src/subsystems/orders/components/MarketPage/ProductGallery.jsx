import { useRef, useState } from "react";
import ProductArt from "./ProductArt.jsx";

const GAP = 6;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

export default function ProductGallery({ images, zoomable = true }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const drag = useRef(null);
  const n = images.length;

  const go = (i) => {
    setIndex((i + n) % n);
    setZoomed(false);
  };

  function onPointerDown(e) {
    drag.current = { x: e.clientX, moved: false };
  }
  function onPointerMove(e) {
    if (drag.current && Math.abs(e.clientX - drag.current.x) > 6) drag.current.moved = true;
  }
  function onPointerUp(e) {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) {
      go(index + (dx < 0 ? 1 : -1));
      return;
    }
    if (!d.moved && zoomable) setZoomed((z) => !z);
  }

  const cellWidth = `calc((100% - ${(n - 1) * GAP}px) / ${n})`;

  return (
    <div className="space-y-3 select-none">
      <div
        className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-2xl bg-sky-50 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.35)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (drag.current = null)}
        role="region"
        aria-label="Product photos. Swipe to change angle, tap to zoom."
      >
        {images.map((img, i) => (
          <div
            key={i}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-[opacity,transform] duration-700 ${EASE} ${
              i === index ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
            }`}
          >
            <div className={`h-full w-full transition-transform duration-500 ${EASE} ${i === index && zoomed ? "scale-[2]" : "scale-100"}`}>
              <ProductArt art={img} />
            </div>
          </div>
        ))}

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
          {images[index].label}{n > 1 ? ` · ${index + 1} of ${n}` : ""}
        </span>
        {zoomable && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
            {zoomed ? "Tap to reset" : "Tap to zoom"}
          </span>
        )}
      </div>

      {n > 1 && (
        <div className="relative grid gap-[6px]" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="tablist" aria-label="Angles">
          <i
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-[3px] -top-[3px] rounded-[11px] border-2 border-[#0284C7] transition-[left] duration-500 ${EASE}`}
            style={{ width: `calc(${cellWidth} + ${GAP}px)`, left: `calc(${index} * (${cellWidth} + ${GAP}px) - 3px)` }}
          />
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${img.label} view`}
              onClick={() => go(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg transition-opacity duration-300 ${i === index ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
            >
              <ProductArt art={img} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
