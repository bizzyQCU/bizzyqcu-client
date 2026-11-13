import { useState } from 'react';
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom';
import './BlindsOutlet.css';

const SLATS = 6;

/**
 * BlindsOutlet - drop-in replacement for <Outlet /> with a venetian-blinds transition.
 * Only navigations pushed with state { blinds: true } (the AuthLogo -> landing page link)
 * animate; every other route change swaps instantly.
 * Slats flip in over the old page, the route content swaps once the last slat
 * covers (its animationend), then the slats flip away to reveal the new page.
 */
export default function BlindsOutlet() {
  const location = useLocation();
  const { pathname } = location;
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const [shown, setShown] = useState({ pathname, element: outlet });
  const [phase, setPhase] = useState(null); // null | 'cover' | 'reveal'

  // Navigations during a transition are picked up at the swap or right after it ends.
  if (phase === null && shown.pathname !== pathname) {
    // PUSH only, so back/forward onto the logo's history entry doesn't replay it.
    if (location.state?.blinds && navigationType === 'PUSH') setPhase('cover');
    else setShown({ pathname, element: outlet });
  }

  const onLastSlatEnd = () => {
    if (phase === 'cover') {
      setShown({ pathname, element: outlet });
      setPhase('reveal');
    } else {
      setPhase(null);
    }
  };

  return (
    <>
      {shown.pathname === pathname ? outlet : shown.element}
      {phase && (
        <div className={`blinds is-${phase}`} aria-hidden="true">
          {Array.from({ length: SLATS }, (_, i) => (
            <i
              key={i}
              className="blinds-slat"
              style={{ '--i': i }}
              onAnimationEnd={i === SLATS - 1 ? onLastSlatEnd : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}

