import './DotGridBackground.css';

/**
 * DotGridBackground - Animated gradient glow with dot pattern
 * 
 * Features:
 * - Subtle golden dot pattern grid (28px spacing)
 * - Animated gradient glow that pulses and moves
 * - Deep dark navy background (#0b1120)
 * - No pointer tracking needed - purely animated
 */
export default function DotGridBackground({ children, className = '' }) {
  return (
    <div className={`dot-grid-container ${className}`}>
      {/* Foreground content - positioned above the gradient */}
      <div className="dot-content">
        {children}
      </div>
    </div>
  );
}
