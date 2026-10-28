import { useEffect, useRef } from 'react';
import { createBarChartScene } from './barChartScene';
import './CoinStack.css';

/**
 * BarChart - decorative three.js 3D bar chart animation for the Seller Portal.
 * Reuses the `.coin-stack` container styles from CoinStack.css.
 */
export default function BarChart({ className = '' }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return createBarChartScene(root, { reducedMotion });
  }, []);

  return (
    <div ref={rootRef} className={`coin-stack ${className}`} aria-hidden="true">
      <div className="coin-stack-bg" />
      <div className="coin-stack-gl" />
    </div>
  );
}

