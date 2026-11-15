import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

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
    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
    isActive
      ? "bg-[#0284C7] text-white shadow-sm"
      : "text-slate-400 hover:bg-slate-800 hover:text-white",
  ].join(" ");

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#0284C7] rounded-lg flex items-center justify-center font-bold text-white text-xl">
            B
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">
              Bizzy<span className="text-[#0284C7]">QCU</span>
            </h1>
            <span className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
              Student Org Seller Portal
            </span>
          </div>
        </div>

        <nav className="px-3 mt-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <NavLink to="/seller/org/settings" className={linkClass}>
          <Settings className="w-5 h-5" />
          <span>Account Settings</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
