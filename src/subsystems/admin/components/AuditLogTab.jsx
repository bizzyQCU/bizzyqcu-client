import { useEffect, useState } from "react";
import { getAuditLogs, createAuditLog, getTransactionLogs, getTransactionById } from "../api";

const SUBSYSTEM_CONFIG = {
  AUTH: { label: "Auth & Identity", bg: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  MARKETPLACE: { label: "Marketplace", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  ORDERS: { label: "Orders & Pay", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  ADMIN: { label: "Admin Operations", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
};

const ACTION_COLORS = {
  APPROVED_USER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REJECTED_USER: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  APPROVED_STORE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REJECTED_STORE: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  APPROVED_PRODUCT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REJECTED_PRODUCT: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  RESOLVED_COMPLAINT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DISMISSED_COMPLAINT: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  REVIEWED_COMPLAINT: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  DISPUTE_REOPENED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function AuditLogTab() {
  // Mode toggle: "audit" for admin system activity, "transactions" for PayMongo / Cash monitoring
  const [activeView, setActiveView] = useState("audit");

  // ---------------------------------------------------------------------------
  // System Activity / Audit Logs State
  // ---------------------------------------------------------------------------
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [subsystemFilter, setSubsystemFilter] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Manual Audit Log creation modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    subsystem: "ADMIN",
    action: "ADMIN_MAINTENANCE_NOTE",
    targetId: "",
    detailsJson: '{\n  "note": "Scheduled audit review completed"\n}',
  });
  const [recordingLog, setRecordingLog] = useState(false);
  const [recordError, setRecordError] = useState("");

  // ---------------------------------------------------------------------------
  // Transaction Monitoring Logs State
  // ---------------------------------------------------------------------------
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txStatusFilter, setTxStatusFilter] = useState("");
  const [txMethodFilter, setTxMethodFilter] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [txPagination, setTxPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [selectedTx, setSelectedTx] = useState(null);
  const [inspectingTxId, setInspectingTxId] = useState(null);

  // ---------------------------------------------------------------------------
  // Fetch Functions
  // ---------------------------------------------------------------------------
  const fetchAuditLogs = async (page = 1) => {
    setLoadingLogs(true);
    try {
      const res = await getAuditLogs({
        page,
        limit: 15,
        subsystem: subsystemFilter || undefined,
        action: actionSearch.trim() || undefined,
      });
      setLogs(res.items || res.data || []);
      if (res.pagination) setAuditPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchTransactions = async (page = 1) => {
    setLoadingTx(true);
    try {
      const res = await getTransactionLogs({
        page,
        limit: 15,
        status: txStatusFilter || undefined,
        method: txMethodFilter || undefined,
        search: txSearch.trim() || undefined,
      });
      setTransactions(res.items || res.data || []);
      if (res.pagination) setTxPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch transaction logs:", err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (activeView === "audit") {
      const timer = setTimeout(() => fetchAuditLogs(1), 250);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => fetchTransactions(1), 250);
      return () => clearTimeout(timer);
    }
  }, [activeView, subsystemFilter, actionSearch, txStatusFilter, txMethodFilter, txSearch]);

  // Open transaction detail inspection
  const handleInspectTx = async (txId) => {
    setInspectingTxId(txId);
    try {
      const res = await getTransactionById(txId);
      setSelectedTx(res.data || res);
    } catch (err) {
      console.error("Failed to inspect transaction:", err);
    } finally {
      setInspectingTxId(null);
    }
  };

  // Submit manual audit log
  const handleRecordLog = async (e) => {
    e.preventDefault();
    setRecordError("");
    let parsedDetails = {};
    try {
      if (recordForm.detailsJson.trim()) {
        parsedDetails = JSON.parse(recordForm.detailsJson);
      }
    } catch (err) {
      setRecordError("Details must be valid JSON.");
      return;
    }

    setRecordingLog(true);
    try {
      await createAuditLog({
        subsystem: recordForm.subsystem,
        action: recordForm.action.trim(),
        targetId: recordForm.targetId.trim() || undefined,
        details: parsedDetails,
      });
      setIsRecordModalOpen(false);
      fetchAuditLogs(1);
    } catch (err) {
      setRecordError(err.response?.data?.message || err.message || "Failed to record log.");
    } finally {
      setRecordingLog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header Banner & Subsystem Navigation Switch */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
              Audit & Governance • Castro & Duay
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            {activeView === "audit" ? "System Activity & Audit Logs" : "Transaction Monitoring & Webhooks"}
          </h2>
          <p className="text-sm text-slate-400">
            {activeView === "audit"
              ? "Immutable audit trail of administrator verification, approvals, and dispute resolutions."
              : "Financial compliance logs for PayMongo GCash split payouts, checkout intents, and cash settlement."}
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2 bg-[#0B1120] p-1.5 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveView("audit")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === "audit"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📜</span> System Audit Logs
          </button>
          <button
            onClick={() => setActiveView("transactions")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === "transactions"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>💳</span> Transactions & PayMongo
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* VIEW 1: SYSTEM ACTIVITY & AUDIT TRAIL */}
      {/* ================================================================== */}
      {activeView === "audit" && (
        <div className="space-y-4">
          {/* Audit Filters Toolbar */}
          <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "", label: "All Subsystems" },
                { id: "AUTH", label: "AUTH (Identity)" },
                { id: "MARKETPLACE", label: "MARKETPLACE" },
                { id: "ORDERS", label: "ORDERS" },
                { id: "ADMIN", label: "ADMIN" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubsystemFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    subsystemFilter === s.id
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter by action name..."
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                className="bg-[#0B1120] text-xs text-white placeholder-slate-500 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 whitespace-nowrap"
              >
                + Log Entry
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] text-slate-400 border-b border-slate-700 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Admin / Actor</th>
                    <th className="p-4">Subsystem</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target ID</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">
                        Loading system activity audit trail...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No audit log entries matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const subStyle = SUBSYSTEM_CONFIG[log.subsystem] || { bg: "bg-slate-800 text-slate-300" };
                      const actionStyle = ACTION_COLORS[log.action] || "bg-slate-800 text-slate-300 border-slate-700";
                      return (
                        <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{log.actor?.fullName || "System Admin"}</div>
                            <div className="text-[11px] text-slate-400">{log.actor?.email || "internal"}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${subStyle.bg}`}>
                              {log.subsystem}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded font-mono text-[11px] font-bold border ${actionStyle}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400">
                            {log.targetId ? (
                              <span className="bg-[#0B1120] px-2 py-0.5 rounded border border-slate-800 text-amber-300/80">
                                {log.targetId.slice(0, 10)}…
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[11px] text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                          <td className="p-4 text-slate-300 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedAuditLog(log)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 transition-colors"
                            >
                              Inspect ↗
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {auditPagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-[#0B1120] border-t border-slate-800 text-xs text-slate-400">
                <div>
                  Page <span className="font-bold text-white">{auditPagination.page}</span> of{" "}
                  <span className="font-bold text-white">{auditPagination.totalPages}</span> ({auditPagination.total} logs)
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!auditPagination.hasPrevPage}
                    onClick={() => fetchAuditLogs(auditPagination.page - 1)}
                    className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!auditPagination.hasNextPage}
                    onClick={() => fetchAuditLogs(auditPagination.page + 1)}
                    className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* VIEW 2: TRANSACTION MONITORING LOGS (PayMongo & Cash) */}
      {/* ================================================================== */}
      {activeView === "transactions" && (
        <div className="space-y-4">
          {/* Transaction Filters Toolbar */}
          <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status filter */}
              <select
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value)}
                className="bg-[#0B1120] text-xs text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              >
                <option value="">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              {/* Method filter */}
              <select
                value={txMethodFilter}
                onChange={(e) => setTxMethodFilter(e.target.value)}
                className="bg-[#0B1120] text-xs text-white px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              >
                <option value="">All Methods</option>
                <option value="GCASH_PAYMONGO">GCash (PayMongo)</option>
                <option value="CASH">Cash on Delivery</option>
              </select>
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search Order # or Checkout ID..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full bg-[#0B1120] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
              />
              <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] text-slate-400 border-b border-slate-700 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Order & Store</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">PayMongo ID</th>
                    <th className="p-4 text-right">Webhook Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {loadingTx ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 animate-pulse">
                        Loading transaction monitoring records...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No transaction monitoring records found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-amber-400">{tx.order?.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{tx.order?.store?.name || "Campus Store"}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{tx.order?.buyer?.fullName || "Buyer"}</div>
                          <div className="text-[11px] text-slate-400">{tx.order?.buyer?.email}</div>
                        </td>
                        <td className="p-4 font-bold text-base text-white">
                          ₱{Number(tx.amount).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              tx.method === "GCASH_PAYMONGO"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {tx.method === "GCASH_PAYMONGO" ? "GCash (PayMongo)" : "Cash on Hand"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              tx.status === "PAID"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : tx.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {tx.paymongoCheckoutId ? (
                            <span className="text-sky-400">{tx.paymongoCheckoutId.slice(0, 12)}…</span>
                          ) : (
                            <span className="text-slate-600">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleInspectTx(tx.id)}
                            disabled={inspectingTxId === tx.id}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold border border-slate-700 transition-colors disabled:opacity-50"
                          >
                            {inspectingTxId === tx.id ? "Loading..." : "Inspect Webhook ↗"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {txPagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-[#0B1120] border-t border-slate-800 text-xs text-slate-400">
                <div>
                  Page <span className="font-bold text-white">{txPagination.page}</span> of{" "}
                  <span className="font-bold text-white">{txPagination.totalPages}</span> ({txPagination.total} records)
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!txPagination.hasPrevPage}
                    onClick={() => fetchTransactions(txPagination.page - 1)}
                    className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <button
                    disabled={!txPagination.hasNextPage}
                    onClick={() => fetchTransactions(txPagination.page + 1)}
                    className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Inspect Audit Log Metadata */}
      {/* ------------------------------------------------------------------ */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-semibold">
                  Audit Entry #{selectedAuditLog.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedAuditLog.action}</h3>
              </div>
              <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#0B1120] p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Actor:</span>
                <p className="font-bold text-white">{selectedAuditLog.actor?.fullName || "System"}</p>
                <p className="text-slate-400">{selectedAuditLog.actor?.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Subsystem:</span>
                <p className="font-bold text-amber-400">{selectedAuditLog.subsystem}</p>
              </div>
              <div>
                <span className="text-slate-400">Target ID:</span>
                <p className="font-mono text-slate-300">{selectedAuditLog.targetId || "None"}</p>
              </div>
              <div>
                <span className="text-slate-400">IP Address:</span>
                <p className="font-mono text-slate-300">{selectedAuditLog.ipAddress || "127.0.0.1"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-400">Payload Details</span>
              <pre className="bg-[#0B1120] text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-60">
                {JSON.stringify(selectedAuditLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Inspect Transaction & Webhook Payload */}
      {/* ------------------------------------------------------------------ */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-semibold">
                  Payment Transaction #{selectedTx.id.slice(0, 8)}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Order {selectedTx.order?.orderNumber} • ₱{Number(selectedTx.amount).toFixed(2)}
                </h3>
              </div>
              <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Split payout & PayMongo metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#0B1120] p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Payment Method:</span>
                <p className="font-bold text-white">{selectedTx.method}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-bold text-emerald-400">{selectedTx.status}</p>
              </div>
              <div>
                <span className="text-slate-400">PayMongo Checkout ID:</span>
                <p className="font-mono text-sky-400 break-all">{selectedTx.paymongoCheckoutId || "N/A (Cash)"}</p>
              </div>
              <div>
                <span className="text-slate-400">Seller Sub-Account:</span>
                <p className="font-mono text-amber-300">{selectedTx.sellerSubAccountId || "Direct Settlement"}</p>
              </div>
            </div>

            {/* Raw Webhook Payload */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-400">
                <span>Raw PayMongo Webhook Payload</span>
                <span className="text-slate-500 font-mono text-[10px]">audit verified</span>
              </div>
              <pre className="bg-[#0B1120] text-sky-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72">
                {selectedTx.webhookPayload
                  ? JSON.stringify(selectedTx.webhookPayload, null, 2)
                  : "// No webhook event recorded (e.g. Cash payment or pending webhook)"}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Record Custom Audit Log */}
      {/* ------------------------------------------------------------------ */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Record System Activity Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Log administrative interventions or platform policy actions.</p>
              </div>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Subsystem
                </label>
                <select
                  value={recordForm.subsystem}
                  onChange={(e) => setRecordForm({ ...recordForm, subsystem: e.target.value })}
                  className="w-full bg-[#0B1120] text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                >
                  <option value="AUTH">AUTH</option>
                  <option value="MARKETPLACE">MARKETPLACE</option>
                  <option value="ORDERS">ORDERS</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Action String <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Action name (e.g. RECORDED_ACTIVITY)"
                  value={recordForm.action}
                  onChange={(e) => setRecordForm({ ...recordForm, action: e.target.value })}
                  className="w-full bg-[#0B1120] text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Target Entity ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Target UUID (user, store, product, order)..."
                  value={recordForm.targetId}
                  onChange={(e) => setRecordForm({ ...recordForm, targetId: e.target.value })}
                  className="w-full bg-[#0B1120] text-xs text-white p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  JSON Metadata
                </label>
                <textarea
                  rows={4}
                  value={recordForm.detailsJson}
                  onChange={(e) => setRecordForm({ ...recordForm, detailsJson: e.target.value })}
                  className="w-full bg-[#0B1120] text-xs text-emerald-400 font-mono p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                />
              </div>

              {recordError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {recordError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingLog}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md disabled:opacity-50"
                >
                  {recordingLog ? "Recording..." : "Record System Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
