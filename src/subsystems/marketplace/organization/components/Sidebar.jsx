import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import darkLogoImage from "../../../auth/assets/bizzyqcu-logo.png";
import "../../../auth/components/DotGridBackground.css";
import "./SellerTheme.css";

import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const AUTH_THEME_KEY = "bizzyqcu-auth-theme";

const NAV_ITEMS = [
  { to: "/seller/org/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/seller/org/products", icon: Package, label: "Products" },
  { to: "/seller/org/inventory", icon: Boxes, label: "Inventory Management" },
  { to: "/seller/org/orders", icon: ClipboardList, label: "Orders" },
  {
    to: "/seller/org/analytics",
    icon: BarChart3,
    label: "Reports & Analytics",
  },
];

const linkClass = ({ isActive }) =>
  [
    "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ACFF8] dark:focus-visible:ring-amber-400/70",
    isActive
      ? "bg-[#0284C7] text-white font-bold shadow-[0_8px_20px_-6px_rgba(2,132,199,0.45)] dark:bg-gradient-to-r dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 dark:text-slate-950 dark:ring-1 dark:ring-inset dark:ring-amber-200/50 dark:shadow-md dark:shadow-amber-500/20"
      : "text-slate-600 hover:text-[#0369A1] hover:bg-sky-50 font-semibold dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06]",
  ].join(" ");

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toggleRef = useRef(null);

  const [theme, setTheme] = useState(() =>
    localStorage.getItem(AUTH_THEME_KEY) === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    localStorage.setItem(AUTH_THEME_KEY, theme);
    const root = document.documentElement;
    root.classList.add("seller-portal");
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    return () => {
      root.classList.remove("seller-portal", "dark");
      root.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    const syncTheme = (e) => {
      if (e.type === "storage" && e.key && e.key !== AUTH_THEME_KEY) return;
      const stored =
        e.detail ??
        (localStorage.getItem(AUTH_THEME_KEY) === "dark" ? "dark" : "light");
      setTheme((prev) => (prev === stored ? prev : stored));
    };

    window.addEventListener("storage", syncTheme);
    window.addEventListener("bizzyqcu-auth-theme", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("bizzyqcu-auth-theme", syncTheme);
    };
  }, []);

  const handleToggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const applyNext = () => {
      flushSync(() => setTheme(next));
      const root = document.documentElement;
      root.classList.add("seller-portal");
      root.classList.toggle("dark", next === "dark");
      root.setAttribute("data-theme", next);
      localStorage.setItem(AUTH_THEME_KEY, next);
      window.dispatchEvent(
        new CustomEvent("bizzyqcu-auth-theme", { detail: next })
      );
    };

    if (!document.startViewTransition || reduceMotion || !toggleRef.current) {
      applyNext();
      return;
    }

    const rect = toggleRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.classList.add("theme-transitioning");

    try {
      const transition = document.startViewTransition(() => {
        applyNext();
      });

      await transition.ready;

      const anim = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );

      await Promise.allSettled([transition.finished, anim.finished]);
    } finally {
      document.documentElement.classList.remove("theme-transitioning");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/seller-login-form");
  };

  const isDark = theme === "dark";

  return (
    <div
      data-theme={theme}
      className={`${isDark ? "dark " : ""}seller-sidebar flex shrink-0 self-stretch`}
    >
      <aside className="relative overflow-hidden w-64 bg-white/95 dark:bg-[#0b1120] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-white/10 shadow-[4px_0_24px_-6px_rgba(2,132,199,0.12)] dark:shadow-[4px_0_30px_-6px_rgba(0,0,0,0.55)] flex flex-col justify-between min-h-full">
        {/* Decorative top accent hairline & subtle glow matching Auth pages */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] dark:h-px bg-gradient-to-r from-[#8ACFF8]/50 via-[#0284C7]/70 to-[#FFD444]/70 dark:from-transparent dark:via-amber-400/60 dark:to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#8ACFF8]/20 dark:bg-amber-500/10 blur-3xl"
        />

        <div className="relative z-10">
          {/* Logo & Light/Dark Toggle */}
          <div className="px-4 pt-5 pb-3 flex items-center justify-between gap-2">
            <Link
              to="/seller/org/dashboard"
              aria-label="BizzyQCU Seller Portal"
              className="inline-flex items-center px-2.5 py-1 rounded-full dark:rounded-2xl bg-[#F8FAFC] hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-slate-200 hover:border-[#8ACFF8] dark:border-white/10 dark:hover:border-amber-400/40 shadow-sm transition-all duration-200 group min-w-0"
            >
              <img
                src="/logo-clear.png"
                alt="BizzyQCU"
                className="h-7 w-auto object-contain select-none transition-transform duration-200 group-hover:scale-[1.03] dark:hidden"
              />
              <img
                src={darkLogoImage}
                alt="BizzyQCU"
                className="hidden dark:block h-7 w-auto object-contain select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </Link>

            <button
              ref={toggleRef}
              type="button"
              onClick={handleToggleTheme}
              className="theme-button !w-10 !h-10 !rounded-xl shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8ACFF8] dark:focus-visible:ring-amber-400/70"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <svg
                className="icon icon-sun"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>

              <svg
                className="icon icon-moon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>

          {/* Portal Badge */}
          <div className="px-4 pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EB6C]/45 border border-[#FFD444] dark:bg-amber-500/10 dark:border-amber-400/25 shadow-sm max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284C7] dark:bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7] dark:bg-amber-400" />
              </span>
              <span className="text-[10px] tracking-wider font-extrabold uppercase text-slate-900 dark:text-amber-300 truncate">
                Student Org Seller Portal
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 mt-4 space-y-1.5" aria-label="Main navigation">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-3 border-t border-slate-200 dark:border-white/10 space-y-1.5">
          <NavLink to="/seller/org/settings" className={linkClass}>
            <Settings className="w-5 h-5 shrink-0" />
            <span>Account Settings</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 text-sm font-semibold transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-400/50"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
