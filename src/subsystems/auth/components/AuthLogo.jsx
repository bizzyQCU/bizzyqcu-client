import { Link } from 'react-router-dom';
import darkLogoImage from '../assets/bizzyqcu-logo.png';

/**
 * AuthLogo - Displays the BizzyQCU logo in the top-left corner of auth pages.
 */
export default function AuthLogo() {
  return (
    <header className="absolute top-5 left-5 sm:top-6 sm:left-8 z-30">
      <Link
        to="/"
        state={{ blinds: true }}
        aria-label="BizzyQCU Home"
        className="inline-flex items-center px-3.5 py-1.5 rounded-full dark:rounded-2xl bg-white/95 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900/80 border border-slate-200 hover:border-[#8ACFF8] dark:border-white/10 dark:hover:border-amber-400/40 backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] dark:shadow-md dark:shadow-black/25 transition-all duration-200 group"
      >
        <img
          src="/logo-clear.png"
          alt="BizzyQCU"
          className="h-8 sm:h-9 w-auto object-contain select-none transition-transform duration-200 group-hover:scale-[1.03] dark:hidden"
        />
        <img
          src={darkLogoImage}
          alt="BizzyQCU"
          className="hidden dark:block h-8 sm:h-9 w-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </Link>
    </header>
  );
}
