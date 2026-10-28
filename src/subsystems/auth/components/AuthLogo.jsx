import { Link } from 'react-router-dom';
import logoImage from '../assets/bizzyqcu-logo.png';

/**
 * AuthLogo - Displays the BizzyQCU logo in the top-left corner of auth pages.
 */
export default function AuthLogo() {
  return (
    <header className="absolute top-5 left-5 sm:top-6 sm:left-8 z-30">
      <Link
        to="/"
        aria-label="BizzyQCU Home"
        className="inline-flex items-center px-3 py-1.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-amber-400/40 backdrop-blur-md shadow-md shadow-black/25 transition-all duration-200 group"
      >
        <img
          src={logoImage}
          alt="BizzyQCU"
          className="h-8 sm:h-9 w-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </Link>
    </header>
  );
}
