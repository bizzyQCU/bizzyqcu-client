import { useEffect, useState, useMemo } from "react";
import { getComplaints, resolveComplaint, submitComplaint, getComplaintById } from "../api";

const STATUS_CONFIG = {
  OPEN: {
    label: "Open Ticket",
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    dot: "bg-sky-400 animate-pulse",
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  DISMISSED: {
    label: "Dismissed",
    bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    dot: "bg-slate-400",
  },
};

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Resolution modal form state
  const [resolutionStatus, setResolutionStatus] = useState("RESOLVED");
  const [resolutionNote, setResolutionNote] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [resolutionError, setResolutionError] = useState("");

  // Create complaint form state
  const [createForm, setCreateForm] = useState({
    subject: "",
    description: "",
    orderId: "",
    evidenceUrlsText: "",
  });
  const [creatingComplaint, setCreatingComplaint] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchComplaintsList = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getComplaints({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: searchTerm.trim() || undefined,
      });
      setComplaints(res.items || res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaintsList(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchTerm]);

  // Status statistics for the top summary bar
  const stats = useMemo(() => {
    const counts = { total: complaints.length, open: 0, review: 0, resolved: 0, dismissed: 0 };
    complaints.forEach((c) => {
      if (c.status === "OPEN") counts.open++;
      else if (c.status === "UNDER_REVIEW") counts.review++;
      else if (c.status === "RESOLVED") counts.resolved++;
      else if (c.status === "DISMISSED") counts.dismissed++;
    });
    return counts;
  }, [complaints]);

  // Open Resolution Modal
  const handleOpenResolveModal = (complaint) => {
    setResolvingComplaint(complaint);
    setResolutionStatus(complaint.status === "OPEN" ? "UNDER_REVIEW" : "RESOLVED");
    setResolutionNote(complaint.adminResolutionNote || "");
    setResolutionError("");
  };

  // Submit Resolution
  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!resolutionNote || resolutionNote.trim().length < 5) {
      setResolutionError("Resolution note must be at least 5 characters.");
      return;
    }
    setSubmittingResolution(true);
    setResolutionError("");
    try {
      const res = await resolveComplaint(resolvingComplaint.id, resolutionStatus, resolutionNote.trim());
      const updated = res.data || res;
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === resolvingComplaint.id
            ? { ...c, status: resolutionStatus, adminResolutionNote: resolutionNote.trim() }
            : c
        )
      );
      if (selectedComplaint && selectedComplaint.id === resolvingComplaint.id) {
        setSelectedComplaint((prev) => ({
          ...prev,
          status: resolutionStatus,
          adminResolutionNote: resolutionNote.trim(),
        }));
      }
      setResolvingComplaint(null);
    } catch (err) {
      setResolutionError(err.response?.data?.message || err.message || "Failed to record resolution.");
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Submit New Complaint Ticket
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (!createForm.subject.trim() || createForm.subject.trim().length < 5) {
      setCreateError("Subject must be at least 5 characters long.");
      return;
    }
    if (!createForm.description.trim() || createForm.description.trim().length < 10) {
      setCreateError("Description must be at least 10 characters long.");
      return;
    }

    const evidenceUrls = createForm.evidenceUrlsText
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    setCreatingComplaint(true);
    try {
      const res = await submitComplaint({
        subject: createForm.subject.trim(),
        description: createForm.description.trim(),
        orderId: createForm.orderId.trim() || undefined,
        evidenceUrls,
      });
      setCreateSuccess("Complaint ticket submitted successfully!");
      setCreateForm({ subject: "", description: "", orderId: "", evidenceUrlsText: "" });
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setCreateSuccess("");
        fetchComplaintsList(1);
      }, 1000);
    } catch (err) {
      setCreateError(
        err.response?.data?.message || err.message || "Failed to submit ticket. Please check input fields."
      );
    } finally {
      setCreatingComplaint(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header Banner & Stats Bar */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111827] via-[#1E293B] to-[#111827] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold font-mono">
              Subsystem 4 • Support & Resolution
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Complaint & Report Tickets</h2>
          <p className="text-sm text-slate-400">
            Buyers and sellers filing campus marketplace disputes; admins managing investigations & status.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setCreateSuccess("");
            setIsSubmitModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          File New Complaint
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#1E293B]/80 backdrop-blur border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Loaded Tickets</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{pagination.total || complaints.length}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-sm font-bold">
            All
          </div>
        </div>

        <div className="bg-[#1E293B]/80 backdrop-blur border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-medium">Open / Pending</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-0.5">{stats.open}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
            !
          </div>
        </div>

        <div className="bg-[#1E293B]/80 backdrop-blur border border-sky-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-sky-400 font-medium">Under Review</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-0.5">{stats.review}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
            ⏳
          </div>
        </div>

        <div className="bg-[#1E293B]/80 backdrop-blur border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-medium">Resolved</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{stats.resolved}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
            ✓
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search & Filter Toolbar */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-[#1E293B] p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "", label: "All Tickets" },
            { id: "OPEN", label: "Open" },
            { id: "UNDER_REVIEW", label: "Under Review" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "DISMISSED", label: "Dismissed" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === item.id
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search tickets, names, order #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Complaints List / Tickets */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#1E293B] p-5 rounded-xl border border-slate-800 animate-pulse space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-700 rounded w-20"></div>
              </div>
              <div className="h-5 bg-slate-700 rounded w-2/3"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xl mb-3">
            📋
          </div>
          <h3 className="text-lg font-bold text-white">No complaints found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter
              ? "Try adjusting your search query or status filter."
              : "No report tickets are currently recorded on the platform."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const statusConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.OPEN;
            return (
              <div
                key={c.id}
                className="bg-[#1E293B] hover:bg-[#24334a] transition-all p-5 rounded-xl border border-slate-700/80 shadow-md space-y-3"
              >
                {/* Top header row */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-700/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-semibold border border-amber-500/20">
                      #{c.id.slice(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                      {statusConfig.label}
                    </span>
                    {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                      <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        📷 {c.evidenceUrls.length} Evidence
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Subject & Description */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {c.subject}
                  </h3>
                  <p className="text-slate-300 text-sm mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Complainant & Order Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#0B1120]/70 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Complainant:</span>
                    <span className="font-bold text-white">{c.complainant?.fullName || "Anonymous"}</span>
                    <span className="text-slate-500">({c.complainant?.role || "BUYER"})</span>
                    {c.complainant?.qcuIdNumber && (
                      <span className="text-slate-400 font-mono">[{c.complainant.qcuIdNumber}]</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-slate-400">Order:</span>
                    {c.order ? (
                      <span className="font-mono text-amber-300 font-medium">
                        {c.order.orderNumber} • ₱{Number(c.order.totalAmount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">None (Platform report)</span>
                    )}
                  </div>
                </div>

                {/* Admin Resolution Note Preview (if any) */}
                {c.adminResolutionNote && (
                  <div className="bg-emerald-950/20 border-l-2 border-emerald-500 px-3 py-2 rounded-r text-xs text-emerald-300">
                    <span className="font-bold text-emerald-400">Resolution Note: </span>
                    {c.adminResolutionNote}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleOpenResolveModal(c)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Pagination Controls */}
      {/* ------------------------------------------------------------------ */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1E293B] p-4 rounded-xl border border-white/10 text-xs text-slate-400">
          <div>
            Page <span className="font-bold text-white">{pagination.page}</span> of{" "}
            <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => fetchComplaintsList(pagination.page - 1)}
              className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => fetchComplaintsList(pagination.page + 1)}
              className="px-3 py-1.5 rounded bg-slate-800 disabled:opacity-40 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: View Complaint Detail */}
      {/* ------------------------------------------------------------------ */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-700 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Complaint Details #{selectedComplaint.id.slice(0, 8)}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedComplaint.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Complainant card */}
            <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Complainant Profile</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-xs">Name: </span>
                  <span className="font-semibold text-white">{selectedComplaint.complainant?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Email: </span>
                  <span className="text-white">{selectedComplaint.complainant?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">QCU ID: </span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {selectedComplaint.complainant?.qcuIdNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Role / Member: </span>
                  <span className="text-white">
                    {selectedComplaint.complainant?.role} ({selectedComplaint.complainant?.memberType || "STUDENT"})
                  </span>
                </div>
              </div>
            </div>

            {/* Linked order card (if any) */}
            {selectedComplaint.order && (
              <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Referenced Order</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-xs">Order #: </span>
                    <span className="font-mono text-amber-300 font-bold">{selectedComplaint.order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Total Amount: </span>
                    <span className="font-bold text-white">₱{Number(selectedComplaint.order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Status: </span>
                    <span className="text-white font-semibold">{selectedComplaint.order.orderStatus}</span>
                  </div>
                  {selectedComplaint.order.store && (
                    <div>
                      <span className="text-slate-400 text-xs">Store: </span>
                      <span className="text-white">{selectedComplaint.order.store.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Statement</div>
              <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedComplaint.description}
              </div>
            </div>

            {/* Evidence Gallery */}
            {selectedComplaint.evidenceUrls && selectedComplaint.evidenceUrls.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Submitted Evidence ({selectedComplaint.evidenceUrls.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedComplaint.evidenceUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-700 hover:border-amber-400 transition-colors"
                    >
                      <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                        View Full Image ↗
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution History */}
            {selectedComplaint.adminResolutionNote && (
              <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl space-y-1 text-sm">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Resolution Decision ({selectedComplaint.status})
                </div>
                <p className="text-emerald-200 leading-relaxed">{selectedComplaint.adminResolutionNote}</p>
                {selectedComplaint.resolvedAt && (
                  <div className="text-[11px] text-emerald-400/70 pt-1">
                    Resolved at: {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenResolveModal(selectedComplaint);
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md"
              >
                Update Resolution Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: Update Resolution Status */}
      {/* ------------------------------------------------------------------ */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Update Resolution Status</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Ticket #{resolvingComplaint.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setResolvingComplaint(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  New Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "UNDER_REVIEW", label: "Under Review", color: "border-sky-500 text-sky-400 bg-sky-500/10" },
                    { id: "RESOLVED", label: "Resolved", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
                    { id: "DISMISSED", label: "Dismissed", color: "border-slate-500 text-slate-400 bg-slate-500/10" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setResolutionStatus(s.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        resolutionStatus === s.id ? `${s.color} ring-2 ring-amber-400` : "border-slate-700 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Admin Resolution Note <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain findings, remedy offered, warning issued, or reason for dismissal (min 5 chars)..."
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Minimum 5 characters</span>
                  <span>{resolutionNote.length} characters</span>
                </div>
              </div>

              {resolutionError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {resolutionError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md disabled:opacity-50"
                >
                  {submittingResolution ? "Saving Resolution..." : "Save & Record Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: File New Complaint Ticket (Buyer / Seller / Admin) */}
      {/* ------------------------------------------------------------------ */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">File Complaint / Report Ticket</h3>
                <p className="text-xs text-slate-400 mt-0.5">Report order irregularities, conduct, or platform violations.</p>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Subject / Summary <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of the ticket or reported concern..."
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Order ID if reporting a specific transaction..."
                  value={createForm.orderId}
                  onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value })}
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Leave blank for general vendor disputes or campus safety reports.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Detailed Description <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide chronological events, items involved, and campus location details..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                  Evidence Photo URLs (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter evidence photo URLs (one per line)..."
                  value={createForm.evidenceUrlsText}
                  onChange={(e) => setCreateForm({ ...createForm, evidenceUrlsText: e.target.value })}
                  className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-xs"
                />
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">
                  {createSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingComplaint}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md disabled:opacity-50"
                >
                  {creatingComplaint ? "Submitting..." : "Submit Complaint Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
