import { useEffect, useRef } from 'react';
import { createCoinStackScene } from './coinStackScene';
import './CoinStack.css';

/**
 * CoinStack - decorative three.js animation of gold peso coins stacking up.
 * Pointer movement over the element tilts the stack.
 *
 * Purely decorative (aria-hidden). three.js is heavy, so import this
 * component with React.lazy to keep it out of the main bundle.
 */
export default function CoinStack({ className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return createCoinStackScene(root, { reducedMotion });
  }, []);

  return (
    <div ref={rootRef} className={`coin-stack ${className}`} aria-hidden="true">
      <div className="coin-stack-bg" />
      <div className="coin-stack-gl" />
    </div>
  );
}

