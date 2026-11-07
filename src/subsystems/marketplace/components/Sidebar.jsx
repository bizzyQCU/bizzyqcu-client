import React from "react";

import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
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
          <a
            href="#dashboard"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <a
            href="#products"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </a>
          <a
            href="#inventory"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <Boxes className="w-5 h-5" />
            <span>Inventory Management</span>
          </a>
          <a
            href="#orders"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-[#0284C7] text-white text-sm font-medium shadow-sm"
          >
            <ClipboardList className="w-5 h-5" />
            <span>Orders</span>
          </a>
          <a
            href="#reports"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Reports & Analytics</span>
          </a>
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <a
          href="#settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>Account Settings</span>
        </a>
        <button
          onClick={() => alert("Logged out")}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
