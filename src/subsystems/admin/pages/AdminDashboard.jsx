import { useState } from "react";
import AnalyticsTab from "../components/AnalyticsTab";
import VerificationTab from "../components/VerificationTab";
import ComplaintsTab from "../components/ComplaintsTab";
import DuplicatesTab from "../components/DuplicatesTab";
import DemandTab from "../components/DemandTab";
import AuditLogTab from "../components/AuditLogTab"; // NEW

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold tracking-wide">Admin Panel</h1>
          <div className="flex gap-4 font-semibold text-sm overflow-x-auto">
            <button onClick={() => setActiveTab("analytics")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "analytics" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Sales</button>
            <button onClick={() => setActiveTab("demand")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "demand" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Demand</button>
            <button onClick={() => setActiveTab("verification")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "verification" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Verification</button>
            <button onClick={() => setActiveTab("duplicates")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "duplicates" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Duplicates</button>
            <button onClick={() => setActiveTab("complaints")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "complaints" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Complaints</button>
            {/* NEW TAB */}
            <button onClick={() => setActiveTab("audit")} className={`pb-4 whitespace-nowrap transition-colors ${activeTab === "audit" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400 hover:text-white"}`}>Audit Logs</button>
          </div>
        </div>

        <div>
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "demand" && <DemandTab />}
          {activeTab === "verification" && <VerificationTab />}
          {activeTab === "duplicates" && <DuplicatesTab />}
          {activeTab === "complaints" && <ComplaintsTab />}
          {activeTab === "audit" && <AuditLogTab />}
        </div>
        
      </div>
    </div>
  );
}