import React from "react";
import Sidebar from "../components/Sidebar";

export default function Settings() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-lg">
          Account Settings — coming soon.
        </p>
      </main>
    </div>
  );
}
