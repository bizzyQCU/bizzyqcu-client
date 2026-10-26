import { useEffect, useRef, useState } from 'react';

/**
 * FadeUpLines - Animate text lines fading up when scrolled into view
 * 
 * Features:
 * - Each line fades up 16px over 700ms
 * - Lines animate with 170ms stagger delay
 * - Triggers once when paragraph scrolls into view
 * - Respects prefers-reduced-motion
 * 
 * @param {string} text - Text to split into lines (use \n for line breaks)
 * @param {string} className - Additional CSS classes
 */
export default function FadeUpLines({ text, className = '' }) {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true);
      return;
    }

    // Intersection Observer to detect when element enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isInView) {
            setIsInView(true);
            // Once triggered, stop observing
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of element is visible
        rootMargin: '0px 0px -50px 0px', // Start slightly before entering viewport
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isInView]);

  // Split text into lines (support both <br /> and \n)
  const lines = text
    .split(/\n|<br\s*\/?>/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <p
      ref={containerRef}
      className={`fade-up-lines ${isInView ? 'in-view' : ''} ${className}`}
    >
      {lines.map((line, index) => (
        <span key={index} className="fade-up-line">
          {line}
        </span>
      ))}
    </p>
  );
}
