import { useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import './CircleRevealOutlet.css';

/**
 * CircleRevealOutlet - drop-in replacement for <Outlet /> that reveals each new
 * page as a circle expanding from exactly where the user tapped, covering the
 * screen in ~600ms.
 *
 * Adapted from the BrewedOps Motion Library "Circle reveal" transition
 * https://brewedops.cloud/motionlibrary/?id=transitions-circle
 *
 * How it works: on a route change the previous page is kept mounted underneath
 * (frozen on its old route element), the new page is rendered on top and its
 * clip-path animates from circle(0) to a radius that reaches the farthest
 * viewport corner. When done, the old page is unmounted.
 */

const DURATION = 600;
const EASING = 'cubic-bezier(.32,.72,0,1)'; // --ml-ease from the original
const POINTER_MAX_AGE = 1000; // ms - older taps are not treated as the trigger

// Last pointer press, shared across renders (tracked in the capture phase so
// it is recorded before the Link's click handler navigates).
const lastPointer = { x: 0, y: 0, t: -Infinity };

function getRevealOrigin() {
  if (performance.now() - lastPointer.t < POINTER_MAX_AGE) {
    return { x: lastPointer.x, y: lastPointer.y, fromTap: true };
  }
  // Keyboard navigation: start from the focused control if there is one.
  const el = document.activeElement;
  if (el && el !== document.body) {
    const r = el.getBoundingClientRect();
    if (r.width || r.height) return { x: r.left + r.width / 2, y: r.top + r.height / 2, fromTap: false };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2, fromTap: false };
}

function spawnTapRipple(x, y) {
  const dot = document.createElement('i');
  dot.className = 'page-reveal-tap';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), DURATION + 200); // safety net
}

export default function CircleRevealOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const enteringRef = useRef(null);
  const [layers, setLayers] = useState(() => [{ key: location.pathname, element: outlet }]);

  // Track taps globally
  useEffect(() => {
    const onPointerDown = (e) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
      lastPointer.t = performance.now();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  // New pathname -> keep only the current page (as the leaving layer) and add the new one.
  // (Updating state during render is React's recommended way to derive state from props.)
  const top = layers[layers.length - 1];
  if (top.key !== location.pathname) {
    setLayers([top, { key: location.pathname, element: outlet }]);
  }

  const isTransitioning = layers.length > 1;

  useEffect(() => {
    if (!isTransitioning) return undefined;
    const finish = () => setLayers((l) => l.slice(-1));

    const el = enteringRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduceMotion || typeof el.animate !== 'function') {
      finish();
      return undefined;
    }

    const { x, y, fromTap } = getRevealOrigin();
    if (fromTap) spawnTapRipple(x, y);

    // Circle centre in the layer's coordinates; radius reaches the farthest screen corner.
    const rect = el.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const radius = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)));

    const anim = el.animate(
      [{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${radius}px at ${cx}px ${cy}px)` }],
      { duration: DURATION, easing: EASING, fill: 'forwards' }
    );
    anim.onfinish = finish;

    // Cancel if another navigation interrupts, or once the old page is removed
    // (drops the forwards-fill so off-screen parts of the page aren't clipped).
    return () => anim.cancel();
  }, [layers, isTransitioning]);

  return (
    <div className="page-reveal">
      {layers.map((layer, i) => {
        const isTop = i === layers.length - 1;
        const entering = isTop && isTransitioning;
        return (
          <div
            key={layer.key}
            ref={isTop ? enteringRef : undefined}
            aria-hidden={isTop ? undefined : true}
            className={`page-reveal-layer ${isTop ? '' : 'is-leaving'} ${entering ? 'is-entering' : ''}`}
            // Hidden until the effect starts the animation, so the new page never flashes in fully.
            style={entering ? { clipPath: 'circle(0px at 50% 50%)' } : undefined}
          >
            {/* Top layer follows the live outlet; leaving layer keeps its frozen route element. */}
            {isTop ? outlet : layer.element}
          </div>
        );
      })}
    </div>
  );
}

