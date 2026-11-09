import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { getCustomerComplaints, submitCustomerComplaint } from "../api";
import { getMyOrders } from "../../orders/api";
import { getErrorMessage } from "../../../lib/api-client";

const CATEGORIES = [
  { id: "DELIVERY", label: "Delivery / Pickup Issue", icon: "📍" },
  { id: "PAYMENT", label: "Payment or GCash Discrepancy", icon: "💳" },
  { id: "DEFECTIVE", label: "Defective or Damaged Product", icon: "📦" },
  { id: "MISCONDUCT", label: "Seller Misconduct or Unresponsiveness", icon: "⚠️" },
  { id: "INQUIRY", label: "General Campus Marketplace Inquiry", icon: "❓" },
];

const STATUS_BADGES = {
  OPEN: {
    label: "Pending Admin Review",
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  UNDER_REVIEW: {
    label: "Under Investigation",
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
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

export default function ContactAdmin() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const prefilledOrderId = searchParams.get("orderId") || "";

  // Form State
  const [category, setCategory] = useState(prefilledOrderId ? "DELIVERY" : "INQUIRY");
  const [orderId, setOrderId] = useState(prefilledOrderId);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrlsText, setEvidenceUrlsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Customer Data State
  const [myOrders, setMyOrders] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "tickets" | "faq"
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Load orders and submitted tickets
  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoadingTickets(true);
    try {
      const [ticketsRes, ordersRes] = await Promise.allSettled([
        getCustomerComplaints({ page: 1, limit: 30 }),
        getMyOrders(),
      ]);

      if (ticketsRes.status === "fulfilled") {
        setMyTickets(ticketsRes.value.items || ticketsRes.value.data || []);
      }
      if (ordersRes.status === "fulfilled") {
        setMyOrders(ordersRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to load customer admin data:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Pre-fill subject if prefilledOrderId is present
  useEffect(() => {
    if (prefilledOrderId && myOrders.length > 0) {
      const match = myOrders.find((o) => o.id === prefilledOrderId);
      if (match) {
        setSubject(`Assistance Request regarding Order ${match.orderNumber}`);
      }
    }
  }, [prefilledOrderId, myOrders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!isAuthenticated) {
      setFormError("Please log in with your QCU student or faculty account to submit an inquiry.");
      return;
    }

    if (subject.trim().length < 5) {
      setFormError("Subject must be at least 5 characters long.");
      return;
    }

    if (description.trim().length < 10) {
      setFormError("Please provide more details in the description (at least 10 characters).");
      return;
    }

    const evidenceUrls = evidenceUrlsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setSubmitting(true);
    try {
      const res = await submitCustomerComplaint({
        subject: subject.trim(),
        description: description.trim(),
        orderId: orderId ? orderId.trim() : undefined,
        evidenceUrls,
      });

      setFormSuccess(
        `Your inquiry has been successfully sent to the QCU Admin Office. (Ticket Reference: #${res.data?.id?.slice(0, 8)})`
      );
      setSubject("");
      setDescription("");
      setEvidenceUrlsText("");
      setOrderId("");

      // Refresh tickets list and switch to tickets tab
      await loadData();
      setActiveTab("tickets");
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ============================================================== */}
        {/* HEADER SECTION */}
        {/* ============================================================== */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>🛡️</span>
            <span>Quezon City University • Student Affairs & Platform Administration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Campus Administrator
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Have an issue with a student seller, delivery discrepancy, payment problem, or a general question?
            Submit a direct ticket to our administrative team or visit the campus office.
          </p>
        </div>

        {/* ============================================================== */}
        {/* DIRECT CAMPUS CONTACT INFORMATION CARDS */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl shrink-0">
              🏛️
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Campus Office</h3>
              <p className="text-sm font-semibold text-white">Student Affairs & Administration</p>
              <p className="text-xs text-slate-400">
                Administration Building, Ground Floor, San Bartolome Campus, Novaliches, Quezon City
              </p>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-xl shrink-0">
              ✉️
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Direct Email</h3>
              <p className="text-sm font-semibold text-white">admin@bizzyqcu.edu.ph</p>
              <p className="text-xs text-slate-400">
                Official inquiries are acknowledged within 24 business hours.
              </p>
            </div>
          </div>

          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-xl shrink-0">
              ⏰
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Operating Hours</h3>
              <p className="text-sm font-semibold text-white">Monday – Friday: 8:00 AM – 5:00 PM</p>
              <p className="text-xs text-slate-400">
                Closed during university holidays and non-academic weekends.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* NAVIGATION TABS */}
        {/* ============================================================== */}
        <div className="flex border-b border-slate-700 space-x-4">
          <button
            onClick={() => setActiveTab("submit")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "submit"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>✍️</span>
            <span>Send Message or File Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "tickets"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span>📋</span>
            <span>My Support Tickets & Inquiries</span>
            {myTickets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300">
                {myTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: SUBMIT NEW INQUIRY / COMPLAINT TICKET */}
        {/* ============================================================== */}
        {activeTab === "submit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Create a Direct Support Ticket</h2>
                <p className="text-xs text-slate-400 mt-1">
                  All submitted tickets are recorded directly in the administrative queue and tracked with an official audit trail.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="text-xs text-amber-300">
                    You are browsing as a guest. Please log in with your QCU account to link inquiries and receive real-time admin resolution alerts.
                  </div>
                  <Link
                    to="/login"
                    className="ml-4 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                  >
                    Log In Now
                  </Link>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Issue Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Category of Concern
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          category === c.id
                            ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md font-bold"
                            : "bg-[#0B1120] text-slate-300 border-slate-700 hover:border-slate-500"
                        }`}
                      >
                        <span className="text-base">{c.icon}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Referenced Order (Optional dropdown if customer has orders) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span>Related Order (Optional)</span>
                    <span className="text-slate-500 text-[11px] normal-case">Attach to a specific order</span>
                  </label>
                  {myOrders.length > 0 ? (
                    <select
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full bg-[#0B1120] text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    >
                      <option value="">-- No specific order (General Inquiry / Campus Concern) --</option>
                      {myOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} • ₱{Number(o.totalAmount).toFixed(2)} • {o.store?.name} ({o.orderStatus})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Paste Order UUID if referencing a transaction..."
                      className="w-full bg-[#0B1120] text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono text-xs"
                    />
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Subject / Concern Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your concern..."
                    className="w-full bg-[#0B1120] text-sm text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Detailed Message & Explanation <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please explain the details, dates, store name, location, and the resolution you are seeking..."
                    className="w-full bg-[#0B1120] text-sm text-white p-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Evidence URLs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span>Evidence / Photo Attachments</span>
                    <span className="text-slate-500 text-[11px] normal-case">One link per line</span>
                  </label>
                  <textarea
                    rows={2}
                    value={evidenceUrlsText}
                    onChange={(e) => setEvidenceUrlsText(e.target.value)}
                    placeholder="Enter image URLs (e.g. uploaded screenshot of GCash receipt or photo of item)..."
                    className="w-full bg-[#0B1120] text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Submitting to Admin Queue...</span>
                    </>
                  ) : (
                    <>
                      <span>📨</span>
                      <span>Send Ticket to QCU Administration</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6">
              <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📌</span>
                  <span>Administrative Guidelines</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2.5 list-disc list-inside">
                  <li>
                    <strong className="text-white">Fair Dispute Resolution:</strong> Admins act as neutral mediators for campus transactions under University rules.
                  </li>
                  <li>
                    <strong className="text-white">Campus Pickup Verification:</strong> Meetups must occur at designated university lobbies (Academic Building 1, Library ground floor, or Student Center).
                  </li>
                  <li>
                    <strong className="text-white">Official Receipt Retention:</strong> Keep your digital GCash transaction slips and order confirmations until pickup is completed.
                  </li>
                  <li>
                    <strong className="text-white">Audit Log Record:</strong> Every ticket resolution is permanently timestamped with the acting administrator's staff ID.
                  </li>
                </ul>
              </div>

              {user && (
                <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Logged-in Student Identity
                  </div>
                  <div className="text-sm font-bold text-white">{user.fullName}</div>
                  <div className="text-xs text-slate-400 font-mono">{user.email} • ID: {user.qcuIdNumber}</div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1">
                    ✓ Verified QCU Member ({user.role})
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY TICKETS & ADMIN RESOLUTIONS */}
        {/* ============================================================== */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Your Submitted Support Tickets</h2>
                <p className="text-xs text-slate-400">
                  Track progress and view official resolution notes issued by university administrators.
                </p>
              </div>
              <button
                onClick={loadData}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Refresh Status</span>
              </button>
            </div>

            {loadingTickets ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#1E293B] p-6 rounded-2xl border border-slate-800 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-700 rounded w-1/4" />
                    <div className="h-6 bg-slate-700 rounded w-1/2" />
                    <div className="h-12 bg-slate-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : myTickets.length === 0 ? (
              <div className="bg-[#1E293B] border border-dashed border-slate-700 p-12 rounded-2xl text-center space-y-3">
                <div className="text-3xl">📭</div>
                <h3 className="text-base font-bold text-white">No tickets submitted yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have not filed any inquiries or complaints. If you need assistance with an order, click below.
                </p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Send a Message to Admin
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => {
                  const badge = STATUS_BADGES[ticket.status] || STATUS_BADGES.OPEN;
                  return (
                    <div
                      key={ticket.id}
                      className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4 transition-all hover:border-slate-600"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">
                              Ticket #{ticket.id.slice(0, 8)}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs text-slate-400">
                              {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{ticket.subject}</h3>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${badge.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* Complaint Details */}
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {ticket.description}
                      </p>

                      {/* Referenced Order */}
                      {ticket.order && (
                        <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                          <span className="text-slate-400">
                            Attached Order: <strong className="text-white font-mono">{ticket.order.orderNumber}</strong>
                          </span>
                          <span className="text-amber-400 font-bold">
                            Total: ₱{Number(ticket.order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* OFFICIAL ADMIN RESOLUTION NOTE (Highlighted) */}
                      {ticket.adminResolutionNote ? (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <span>🛡️</span>
                            <span>Official Administrator Resolution Note</span>
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-200 font-medium whitespace-pre-line">
                            {ticket.adminResolutionNote}
                          </p>
                        </div>
                      ) : ticket.status === "OPEN" ? (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300/80 flex items-center gap-2">
                          <span>⏳</span>
                          <span>An administrator has received your inquiry and will review it during campus office hours.</span>
                        </div>
                      ) : null}

                      {/* Evidence URLs */}
                      {ticket.evidenceUrls && ticket.evidenceUrls.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                          <span>📎 Attachments ({ticket.evidenceUrls.length}):</span>
                          {ticket.evidenceUrls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:underline font-mono"
                            >
                              [Evidence #{idx + 1}]
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

