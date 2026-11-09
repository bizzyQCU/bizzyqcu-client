import { useState } from "react";
import { useAuth } from "../../../hooks";
import AdminLogin from "./AdminLogin";
import AnalyticsTab from "../components/AnalyticsTab";
import VerificationTab from "../components/VerificationTab";
import ComplaintsTab from "../components/ComplaintsTab";
import DuplicatesTab from "../components/DuplicatesTab";
import DemandTab from "../components/DemandTab";
import AuditLogTab from "../components/AuditLogTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("complaints");
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Guard: if user is not authenticated or not an admin, show the secure Admin Login gate
  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  const tabs = [
    { id: "complaints", label: "Complaints & Tickets", badge: "Subsystem 4" },
    { id: "audit", label: "Audit & Transactions", badge: "System Log" },
    { id: "verification", label: "Verification Queue", badge: null },
    { id: "analytics", label: "Sales Analytics", badge: null },
    { id: "demand", label: "Demand Trends", badge: null },
    { id: "duplicates", label: "Duplicate Scan", badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* Top Navigation & Status Header */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">BizzyQCU Administration</h1>
                <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  v2.0 Backend Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">Campus Marketplace Management & Regulatory Oversight</p>
            </div>
          </div>

          {/* User profile / session state */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-[#1E293B] px-3.5 py-1.5 rounded-xl border border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white leading-tight">{user?.fullName || "Admin Officer"}</div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {user?.role} • {user?.qcuIdNumber || "24-0001"}
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-2 text-xs text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Sign Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main Container */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-3 mb-6 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-[#1E293B] text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-3 left-4 right-4 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <section className="transition-all animate-fade-in">
          {activeTab === "complaints" && <ComplaintsTab />}
          {activeTab === "audit" && <AuditLogTab />}
          {activeTab === "verification" && <VerificationTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "demand" && <DemandTab />}
          {activeTab === "duplicates" && <DuplicatesTab />}
        </section>
      </main>
    </div>
  );
}
