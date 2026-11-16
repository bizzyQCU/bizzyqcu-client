import { Link } from 'react-router-dom';

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
        className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200 hover:border-[#8ACFF8] backdrop-blur-md shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] transition-all duration-200 group"
      >
        <img
          src="/logo-clear.png"
          alt="BizzyQCU"
          className="h-8 sm:h-9 w-auto object-contain select-none transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </Link>
    </header>
  );
}
